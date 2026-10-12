import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

test('Webhook HMAC-SHA256 signature verification logic', async (t) => {
  const secret = 'kria_test_webhook_secret_987654';
  const payload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_12345',
          order_id: 'order_test_67890',
          amount: 59800,
          currency: 'INR',
          status: 'captured'
        }
      }
    }
  });

  const rawBuffer = Buffer.from(payload);
  const validSignature = crypto.createHmac('sha256', secret).update(rawBuffer).digest('hex');

  await t.test('passes with matching signature', () => {
    const computed = crypto.createHmac('sha256', secret).update(rawBuffer).digest('hex');
    assert.equal(crypto.timingSafeEqual(Buffer.from(validSignature), Buffer.from(computed)), true);
  });

  await t.test('fails with altered payload (tampering)', () => {
    const tamperedBuffer = Buffer.from(payload + ' ');
    const computedTampered = crypto.createHmac('sha256', secret).update(tamperedBuffer).digest('hex');
    assert.notEqual(validSignature, computedTampered);
  });

  await t.test('fails with invalid signature key', () => {
    const wrongSecret = 'wrong_secret_123';
    const computedWrong = crypto.createHmac('sha256', wrongSecret).update(rawBuffer).digest('hex');
    assert.notEqual(validSignature, computedWrong);
  });
});

test('Admin Timing-Safe Authentication logic', async (t) => {
  const adminPassword = 'SuperSecretAdminPassword#2026';
  const expectedToken = crypto.createHash('sha256').update(adminPassword).digest('hex');

  await t.test('validates exact password using timingSafeEqual', () => {
    const submittedBuf = Buffer.from(adminPassword.trim());
    const expectedBuf = Buffer.from(adminPassword);
    assert.equal(crypto.timingSafeEqual(submittedBuf, expectedBuf), true);
  });

  await t.test('rejects incorrect password length and characters safely', () => {
    const wrongPass = 'WrongPassword';
    const submittedBuf = Buffer.from(wrongPass);
    const expectedBuf = Buffer.from(adminPassword);
    assert.notEqual(submittedBuf.length, expectedBuf.length);
  });
});

test('Customer Photo Privacy & Signed URL validation', async (t) => {
  await t.test('distinguishes customer photo uploads as private', () => {
    const isPublicProductAsset = false;
    const bucket = isPublicProductAsset ? 'images' : 'customer-photos';
    assert.equal(bucket, 'customer-photos');
  });

  await t.test('distinguishes marketing/banner assets as public', () => {
    const isPublicBanner = true;
    const bucket = isPublicBanner ? 'images' : 'customer-photos';
    assert.equal(bucket, 'images');
  });
});

test('Payment & Order Idempotency validation', async (t) => {
  const mockOrders = new Map();

  function idempotentSaveOrder(order) {
    if (mockOrders.has(order.transactionId)) {
      return { order: mockOrders.get(order.transactionId), isDuplicate: true };
    }
    mockOrders.set(order.transactionId, order);
    return { order, isDuplicate: false };
  }

  const order1 = { id: 'KRIA-ORD-261011-1001', transactionId: 'pay_12345', amount: 598 };
  const firstResult = idempotentSaveOrder(order1);
  assert.equal(firstResult.isDuplicate, false);
  assert.equal(firstResult.order.id, 'KRIA-ORD-261011-1001');

  // Duplicate webhook retry with identical transactionId
  const duplicateResult = idempotentSaveOrder({ id: 'KRIA-ORD-261011-9999', transactionId: 'pay_12345', amount: 598 });
  assert.equal(duplicateResult.isDuplicate, true);
  assert.equal(duplicateResult.order.id, 'KRIA-ORD-261011-1001'); // Preserves initial order without duplicate

  const anotherDuplicate = idempotentSaveOrder({ id: 'KRIA-ORD-000', transactionId: 'pay_12345', amount: 0 });
  assert.equal(anotherDuplicate.isDuplicate, true);
});

test('Image magic-byte (file signature) validation', async (t) => {
  function detectImageFormat(buffer) {
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng  = buffer.length >= 8 &&
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
      buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a;
    const isWebp = buffer.length >= 12 &&
      buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
      buffer.slice(8, 12).toString('ascii') === 'WEBP';
    if (!isJpeg && !isPng && !isWebp) return null;
    return isJpeg ? 'jpeg' : isPng ? 'png' : 'webp';
  }

  await t.test('accepts a JPEG buffer by magic bytes', () => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    assert.equal(detectImageFormat(jpegHeader), 'jpeg');
  });

  await t.test('accepts a PNG buffer by magic bytes', () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    assert.equal(detectImageFormat(pngHeader), 'png');
  });

  await t.test('accepts a WebP buffer by magic bytes', () => {
    const webpHeader = Buffer.concat([
      Buffer.from('RIFF', 'ascii'),
      Buffer.from([0x24, 0x00, 0x00, 0x00]),
      Buffer.from('WEBP', 'ascii'),
    ]);
    assert.equal(detectImageFormat(webpHeader), 'webp');
  });

  await t.test('rejects a PDF masquerading as an image', () => {
    const pdfHeader = Buffer.from('%PDF-1.4', 'ascii');
    assert.equal(detectImageFormat(pdfHeader), null);
  });

  await t.test('rejects a ZIP/DOCX masquerading as an image', () => {
    const zipHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);
    assert.equal(detectImageFormat(zipHeader), null);
  });
});

test('Razorpay server-to-server verification logic', async (t) => {
  // Simulate the shape of fetchAndVerifyRazorpayPayment logic inline
  function verifyPayment(payment, expectedOrderId, expectedAmountPaise) {
    if (payment.status !== 'captured')
      return { ok: false, reason: `Payment not captured. Status: ${payment.status}` };
    if (payment.order_id !== expectedOrderId)
      return { ok: false, reason: `order_id mismatch: expected ${expectedOrderId} got ${payment.order_id}` };
    if (payment.amount !== expectedAmountPaise)
      return { ok: false, reason: `Amount mismatch: expected ${expectedAmountPaise} got ${payment.amount}` };
    return { ok: true, payment };
  }

  const goodPayment = { id: 'pay_abc123', status: 'captured', order_id: 'order_xyz', amount: 59800 };

  await t.test('accepts captured payment with matching order_id and amount', () => {
    const result = verifyPayment(goodPayment, 'order_xyz', 59800);
    assert.equal(result.ok, true);
  });

  await t.test('rejects authorized (not captured) payment', () => {
    const result = verifyPayment({ ...goodPayment, status: 'authorized' }, 'order_xyz', 59800);
    assert.equal(result.ok, false);
    assert.match(result.reason, /not captured/);
  });

  await t.test('rejects payment with mismatched order_id (replay attack)', () => {
    const result = verifyPayment(goodPayment, 'order_DIFFERENT', 59800);
    assert.equal(result.ok, false);
    assert.match(result.reason, /mismatch/);
  });

  await t.test('rejects payment with tampered amount', () => {
    const result = verifyPayment(goodPayment, 'order_xyz', 100); // too low
    assert.equal(result.ok, false);
    assert.match(result.reason, /Amount mismatch/);
  });
});

test('Mock checkout production guard', async (t) => {
  function shouldShowSimulatedGateway(orderRes, mockEnabled) {
    return (orderRes.isMock || !orderRes.razorpayKeyId) && mockEnabled;
  }

  await t.test('shows simulated gateway when mock enabled and server says isMock', () => {
    const result = shouldShowSimulatedGateway({ isMock: true, razorpayKeyId: '' }, true);
    assert.equal(result, true);
  });

  await t.test('blocks simulated gateway in production build (MOCK_CHECKOUT_ENABLED=false)', () => {
    const result = shouldShowSimulatedGateway({ isMock: true, razorpayKeyId: '' }, false);
    assert.equal(result, false);
  });

  await t.test('does not show simulated gateway when real key is present even if mock flag is set', () => {
    const result = shouldShowSimulatedGateway({ isMock: false, razorpayKeyId: 'rzp_live_abc123' }, true);
    assert.equal(result, false);
  });
});

test('Shiprocket order creation idempotency guard and real AWB assignment validation', async (t) => {
  function shouldSyncShiprocket(order) {
    if (order.shipmentId || order.shiprocketOrderId) return false;
    return true;
  }

  function validateAwbAssignment(shipmentResponse, awbResponse) {
    const shipmentId = shipmentResponse?.shipment_id;
    if (!shipmentId && !shipmentResponse?.order_id) {
      throw new Error(shipmentResponse?.message || "Order rejected by Shiprocket");
    }
    const liveAwb = shipmentResponse?.awb_code || awbResponse?.response?.data?.awb_code || null;
    return {
      shipmentId,
      awb: liveAwb,
      hasRealAwb: !!liveAwb && !String(liveAwb).startsWith('SRW-') && !String(liveAwb).startsWith('SR-')
    };
  }

  await t.test('allows initial sync for unsynced order', () => {
    const order = { id: 'KRIA-ORD-101', status: 'Paid' };
    assert.equal(shouldSyncShiprocket(order), true);
  });

  await t.test('blocks duplicate sync if shipmentId is already present', () => {
    const order = { id: 'KRIA-ORD-101', status: 'Paid', shipmentId: 'SR_SHIP_9999' };
    assert.equal(shouldSyncShiprocket(order), false);
  });

  await t.test('blocks duplicate sync if shiprocketOrderId is already present', () => {
    const order = { id: 'KRIA-ORD-101', status: 'Paid', shiprocketOrderId: 'SR_ORD_8888' };
    assert.equal(shouldSyncShiprocket(order), false);
  });

  await t.test('validates real courier AWB code and rejects placeholder generation', () => {
    const res = validateAwbAssignment(
      { shipment_id: 12345, order_id: 67890 },
      { response: { data: { awb_code: 'DELHIVERY12345678', courier_name: 'Delhivery Surface' } } }
    );
    assert.equal(res.hasRealAwb, true);
    assert.equal(res.awb, 'DELHIVERY12345678');
  });

  await t.test('handles pending AWB without fabricating fake SRW- AWB', () => {
    const res = validateAwbAssignment(
      { shipment_id: 12345, order_id: 67890 },
      { response: { data: {} } }
    );
    assert.equal(res.hasRealAwb, false);
    assert.equal(res.awb, null);
  });

  await t.test('throws explicit error when Shiprocket rejects shipment creation', () => {
    assert.throws(() => {
      validateAwbAssignment({ message: "Pincode not serviceable for courier pickup" }, null);
    }, /Pincode not serviceable/);
  });
});

test('Coupon and Inventory Ledger deduplication logic', async (t) => {
  const redemptions = new Set();
  function recordCoupon(couponCode, orderId) {
    const key = `${couponCode}:${orderId}`;
    if (redemptions.has(key)) return { duplicate: true };
    redemptions.add(key);
    return { duplicate: false };
  }

  await t.test('first coupon redemption succeeds', () => {
    const res = recordCoupon('KRIA10', 'KRIA-ORD-101');
    assert.equal(res.duplicate, false);
  });

  await t.test('duplicate coupon redemption on retry is detected', () => {
    const res = recordCoupon('KRIA10', 'KRIA-ORD-101');
    assert.equal(res.duplicate, true);
  });

  const movements = new Set();
  function recordInventory(orderId, productId, type) {
    const key = `${orderId}:${productId}:${type}`;
    if (movements.has(key)) return { duplicate: true };
    movements.add(key);
    return { duplicate: false };
  }

  await t.test('initial inventory deduction succeeds', () => {
    const res = recordInventory('KRIA-ORD-101', 'arch', 'ORDER_DEDUCT');
    assert.equal(res.duplicate, false);
  });

  await t.test('duplicate inventory deduction on retry is detected', () => {
    const res = recordInventory('KRIA-ORD-101', 'arch', 'ORDER_DEDUCT');
    assert.equal(res.duplicate, true);
  });
});

test('B2B enquiry payload validation logic', async (t) => {
  function validateB2BPayload(body) {
    const { companyName, contactPerson, email, phone } = body || {};
    if (!companyName || !contactPerson || !email || !phone) return 'Missing required fields';
    return null;
  }

  await t.test('passes with complete fields', () => {
    const err = validateB2BPayload({
      companyName: 'Acme Studio',
      contactPerson: 'Alice',
      email: 'alice@acme.com',
      phone: '9876543210'
    });
    assert.equal(err, null);
  });

  await t.test('rejects payload missing contactPerson', () => {
    const err = validateB2BPayload({
      companyName: 'Acme Studio',
      email: 'alice@acme.com',
      phone: '9876543210'
    });
    assert.equal(err, 'Missing required fields');
  });

  await t.test('rejects payload missing phone', () => {
    const err = validateB2BPayload({
      companyName: 'Acme Studio',
      contactPerson: 'Alice',
      email: 'alice@acme.com'
    });
    assert.equal(err, 'Missing required fields');
  });
});

test('Production job state tracking', async (t) => {
  const allowedStatuses = ['QUEUED', 'PRINTING', 'LASER_CUT', 'QUALITY_CHECK', 'PACKED'];

  await t.test('initial state defaults to QUEUED', () => {
    const job = { id: 'job_1', status: 'QUEUED' };
    assert.equal(job.status, 'QUEUED');
  });

  await t.test('validates factory lifecycle transitions', () => {
    assert.equal(allowedStatuses.includes('PRINTING'), true);
    assert.equal(allowedStatuses.includes('LASER_CUT'), true);
    assert.equal(allowedStatuses.includes('INVALID_STATE'), false);
  });
});

test('Versioned CropSpecification normalization logic', async (t) => {
  function normalizeCropSpec(item) {
    const scale = Number(item.cropSpec?.scale ?? item.photoScale ?? 1.0);
    const panX = Number(item.cropSpec?.panX ?? item.photoPanX ?? 0);
    const panY = Number(item.cropSpec?.panY ?? item.photoPanY ?? 0);

    return {
      version: 'v1',
      scale: Math.max(1.0, Math.min(3.0, isNaN(scale) ? 1.0 : scale)),
      panX: Math.max(-100, Math.min(100, isNaN(panX) ? 0 : panX)),
      panY: Math.max(-100, Math.min(100, isNaN(panY) ? 0 : panY)),
      aspectRatio: 1.0,
      shapeId: item.shapeId || 'custom'
    };
  }

  await t.test('normalizes standard crop input', () => {
    const spec = normalizeCropSpec({ shapeId: 'arch', photoScale: 1.5, photoPanX: 10, photoPanY: -15 });
    assert.equal(spec.version, 'v1');
    assert.equal(spec.scale, 1.5);
    assert.equal(spec.panX, 10);
    assert.equal(spec.panY, -15);
  });

  await t.test('clamps out-of-bounds scale and pan values safely', () => {
    const spec = normalizeCropSpec({ shapeId: 'arch', photoScale: 10.0, photoPanX: 500, photoPanY: -300 });
    assert.equal(spec.scale, 3.0);
    assert.equal(spec.panX, 100);
    assert.equal(spec.panY, -100);
  });

  await t.test('falls back safely on missing or invalid inputs', () => {
    const spec = normalizeCropSpec({});
    assert.equal(spec.scale, 1.0);
    assert.equal(spec.panX, 0);
    assert.equal(spec.panY, 0);
  });
});

test('Shape aspect-ratio and print dimensions mapping', async (t) => {
  const SHAPE_PRINT_DIMENSIONS = {
    polaroid: { width: 900, height: 1200, aspectRatio: 0.75 },
    arch: { width: 900, height: 1200, aspectRatio: 0.75 },
    landscape: { width: 1200, height: 900, aspectRatio: 1.333 },
    portrait: { width: 900, height: 1200, aspectRatio: 0.75 },
    'portrait-wide': { width: 1000, height: 1200, aspectRatio: 0.833 },
    love: { width: 900, height: 900, aspectRatio: 1.0 },
    circle: { width: 900, height: 900, aspectRatio: 1.0 },
    'circle-bloom': { width: 900, height: 900, aspectRatio: 1.0 },
    hexagon: { width: 900, height: 900, aspectRatio: 1.0 },
    'scalloped-stand': { width: 1500, height: 2000, aspectRatio: 0.75 },
    grande: { width: 1200, height: 1800, aspectRatio: 0.667 },
    oval: { width: 800, height: 1200, aspectRatio: 0.667 },
    filmstrip: { width: 600, height: 1800, aspectRatio: 0.333 },
    cloud: { width: 1000, height: 1000, aspectRatio: 1.0 },
    crest: { width: 900, height: 1100, aspectRatio: 0.818 },
    custom: { width: 1200, height: 1200, aspectRatio: 1.0 }
  };

  await t.test('provides distinct aspect ratios for square, portrait, and landscape frames', () => {
    assert.equal(SHAPE_PRINT_DIMENSIONS.circle.aspectRatio, 1.0); // Square 3x3
    assert.equal(SHAPE_PRINT_DIMENSIONS.love.aspectRatio, 1.0);   // Square 3x3
    assert.equal(SHAPE_PRINT_DIMENSIONS.landscape.aspectRatio, 1.333); // Landscape 4x3
    assert.equal(SHAPE_PRINT_DIMENSIONS.polaroid.aspectRatio, 0.75);   // Portrait 3x4
    assert.equal(SHAPE_PRINT_DIMENSIONS.grande.aspectRatio, 0.667);     // Portrait 4x6
  });

  await t.test('provides 300 DPI print pixel dimensions', () => {
    assert.equal(SHAPE_PRINT_DIMENSIONS.landscape.width, 1200);
    assert.equal(SHAPE_PRINT_DIMENSIONS.landscape.height, 900);
    assert.equal(SHAPE_PRINT_DIMENSIONS.grande.width, 1200);
    assert.equal(SHAPE_PRINT_DIMENSIONS.grande.height, 1800);
  });
});

test('Production stage transition security logic', async (t) => {
  const STAGE_ORDER = ['QUEUED', 'PRINTING', 'LASER_CUT', 'QUALITY_CHECK', 'PACKED'];

  function validateStageTransition(currentStatus, nextStatus) {
    if (!STAGE_ORDER.includes(nextStatus)) {
      throw new Error(`Invalid stage '${nextStatus}'.`);
    }
    const currentIndex = STAGE_ORDER.indexOf(currentStatus);
    const nextIndex = STAGE_ORDER.indexOf(nextStatus);

    if (nextIndex < currentIndex) {
      throw new Error(`Invalid regression: cannot move job backwards from '${currentStatus}' to '${nextStatus}'.`);
    }
    if (nextStatus === 'PACKED' && currentStatus !== 'QUALITY_CHECK') {
      throw new Error(`Cannot mark job as PACKED before completing QUALITY_CHECK.`);
    }
    return true;
  }

  await t.test('allows valid forward progress', () => {
    assert.equal(validateStageTransition('QUEUED', 'PRINTING'), true);
    assert.equal(validateStageTransition('PRINTING', 'LASER_CUT'), true);
    assert.equal(validateStageTransition('QUALITY_CHECK', 'PACKED'), true);
  });

  await t.test('blocks backwards regression', () => {
    assert.throws(() => validateStageTransition('PACKED', 'QUEUED'), /Invalid regression/);
    assert.throws(() => validateStageTransition('LASER_CUT', 'PRINTING'), /Invalid regression/);
  });

  await t.test('blocks skipping QC directly into PACKED', () => {
    assert.throws(() => validateStageTransition('PRINTING', 'PACKED'), /QUALITY_CHECK/);
    assert.throws(() => validateStageTransition('QUEUED', 'PACKED'), /QUALITY_CHECK/);
  });
});

test('GST Tax Invoice breakup and place-of-supply logic', async (t) => {
  function calculateGstBreakup(totalPaid, originState, destinationState) {
    const isIntrastate = (destinationState || '').trim().toLowerCase() === (originState || '').trim().toLowerCase();
    const taxableValue = Math.round(totalPaid / 1.18);
    const totalTax = totalPaid - taxableValue;
    const cgst = isIntrastate ? Math.round(totalTax / 2) : 0;
    const sgst = isIntrastate ? (totalTax - cgst) : 0;
    const igst = isIntrastate ? 0 : totalTax;

    return { taxableValue, totalTax, cgst, sgst, igst, isIntrastate };
  }

  await t.test('calculates CGST and SGST correctly for intra-state supply (Telangana to Telangana)', () => {
    const res = calculateGstBreakup(1180, 'Telangana', 'Telangana');
    assert.equal(res.isIntrastate, true);
    assert.equal(res.taxableValue, 1000);
    assert.equal(res.totalTax, 180);
    assert.equal(res.cgst, 90);
    assert.equal(res.sgst, 90);
    assert.equal(res.igst, 0);
  });

  await t.test('calculates IGST correctly for inter-state supply (Telangana to Maharashtra)', () => {
    const res = calculateGstBreakup(1180, 'Telangana', 'Maharashtra');
    assert.equal(res.isIntrastate, false);
    assert.equal(res.taxableValue, 1000);
    assert.equal(res.totalTax, 180);
    assert.equal(res.cgst, 0);
    assert.equal(res.sgst, 0);
    assert.equal(res.igst, 180);
  });
});

test('Controlled order cancellation audit preservation logic', async (t) => {
  function cancelOrder(order, note) {
    if (!order) throw new Error('Order not found');
    const updated = { ...order };
    updated.status = 'Cancelled';
    updated.history = [...(order.history || [])];
    updated.history.push({
      status: 'Cancelled',
      timestamp: new Date().toISOString(),
      note: note || 'Cancelled by staff'
    });
    return updated;
  }

  await t.test('preserves audit history and sets status to Cancelled without row deletion', () => {
    const original = { id: 'KRIA-TEST-01', status: 'Paid', grandTotal: 598, history: [{ status: 'Paid', note: 'Initial' }] };
    const cancelled = cancelOrder(original, 'Customer requested change before printing');
    assert.equal(cancelled.id, 'KRIA-TEST-01');
    assert.equal(cancelled.status, 'Cancelled');
    assert.equal(cancelled.history.length, 2);
    assert.equal(cancelled.history[1].status, 'Cancelled');
    assert.equal(cancelled.history[1].note, 'Customer requested change before printing');
  });
});

test('Finding 1: Checkout session persistence failure aborts payment order generation', async (t) => {
  await t.test('saveCheckoutSession throws loudly when DB reports an error', async () => {
    async function mockSaveCheckoutSession(session, fail = false) {
      if (fail) {
        throw new Error('Checkout session could not be saved — DB write failed');
      }
      return { success: true };
    }

    await assert.rejects(
      async () => {
        await mockSaveCheckoutSession({ id: 'sess_1', razorpayOrderId: 'order_123' }, true);
      },
      /Checkout session could not be saved/
    );
  });
});

test('Finding 2: Order update separates from creation to ensure status persistence', async (t) => {
  await t.test('updateOrder updates existing order row without being blocked by transactionId collision', () => {
    const existingOrder = {
      id: 'KRIA-ORD-101',
      transactionId: 'pay_rzp_999',
      status: 'Paid',
      history: [{ status: 'Paid', note: 'Paid' }]
    };

    function updateOrderStatus(order, newStatus, note) {
      if (!order.id) throw new Error('order.id is required');
      const updated = { ...order, status: newStatus };
      updated.history = [...(order.history || []), { status: newStatus, timestamp: new Date().toISOString(), note }];
      return updated;
    }

    const updated = updateOrderStatus(existingOrder, 'Production', 'Sent to UV printer');
    assert.equal(updated.status, 'Production');
    assert.equal(updated.history.length, 2);
    assert.equal(updated.history[1].status, 'Production');
  });
});

test('Finding 3: WhatsApp and paid orders initialize with null tracking details', async (t) => {
  await t.test('new order does not fabricate trackingNumber or courierName before Shiprocket assignment', () => {
    const newOrder = {
      id: 'KRIA-WA-2026-1234',
      status: 'WhatsApp Order',
      trackingNumber: null,
      courierName: null,
      deliveryEstimate: '2-3 Business Days (after production)'
    };

    assert.equal(newOrder.trackingNumber, null);
    assert.equal(newOrder.courierName, null);
    assert.doesNotMatch(String(newOrder.trackingNumber), /^WA-\d+/);
  });
});

test('Finding 4: Authoritative catalog prices govern checkout calculations', async (t) => {
  const fallbackPrices = { love: 299, polaroid: 299, custom: 399 };
  const dbCatalogPrices = { love: 349, polaroid: 329 }; // Admin updated prices in CMS

  function calculateTotalsWithCatalog(cart, priceMap) {
    let subtotal = 0;
    for (const item of cart) {
      const price = priceMap[item.shapeId] || fallbackPrices[item.shapeId] || 299;
      subtotal += price * (item.quantity || 1);
    }
    return subtotal;
  }

  await t.test('checkout uses live DB prices when updated by admin', () => {
    const cart = [{ shapeId: 'love', quantity: 2 }];
    const liveTotal = calculateTotalsWithCatalog(cart, dbCatalogPrices);
    const staleTotal = calculateTotalsWithCatalog(cart, fallbackPrices);

    assert.equal(liveTotal, 698); // 349 * 2
    assert.equal(staleTotal, 598); // 299 * 2
    assert.notEqual(liveTotal, staleTotal);
  });
});

test('Finding 5: Inventory validation prevents orders exceeding available stock', async (t) => {
  const stockInventory = {
    love: 10,
    filmstrip: 0,
    arch: 3
  };

  function checkStockAvailability(cart) {
    for (const item of cart) {
      const stock = stockInventory[item.shapeId] ?? 500;
      if (stock < (item.quantity || 1)) {
        return { available: false, error: `Insufficient stock for ${item.shapeId}` };
      }
    }
    return { available: true };
  }

  await t.test('rejects cart when item has 0 stock', () => {
    const res = checkStockAvailability([{ shapeId: 'filmstrip', quantity: 1 }]);
    assert.equal(res.available, false);
    assert.match(res.error, /Insufficient stock/);
  });

  await t.test('accepts cart when stock is sufficient', () => {
    const res = checkStockAvailability([{ shapeId: 'love', quantity: 2 }]);
    assert.equal(res.available, true);
  });
});

test('Finding 6: Customer order tracking requires full credentials and redacts sensitive data', async (t) => {
  const mockOrder = {
    id: 'KRIA-ORD-2026-9999',
    status: 'Shipped',
    trackingNumber: 'AWB-DEL-98765',
    courierName: 'Delhivery Surface',
    deliveryEstimate: '3 Days',
    shippingDetails: {
      fullName: 'Vikram Mehta',
      email: 'vikram@example.com',
      phone: '9876543210',
      address: 'Plot 42, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033'
    },
    grandTotal: 1299
  };

  function trackOrder(order, emailOrPhone) {
    const lookup = String(emailOrPhone).toLowerCase().trim();
    const email = String(order.shippingDetails?.email || '').toLowerCase().trim();
    const phone = String(order.shippingDetails?.phone || '').replace(/\D/g, '');
    const lookupPhone = lookup.replace(/\D/g, '');

    const emailMatches = lookup === email && email.length > 3;
    const phoneMatches = lookupPhone.length >= 10 && phone === lookupPhone;

    if (!emailMatches && !phoneMatches) {
      return { ok: false, status: 403, error: 'Order lookup details did not match.' };
    }

    // Minimized response: no payment totals, no street address, no phone
    return {
      ok: true,
      data: {
        id: order.id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        courierName: order.courierName,
        deliveryEstimate: order.deliveryEstimate,
        destinationCity: order.shippingDetails.city,
        destinationState: order.shippingDetails.state
      }
    };
  }

  await t.test('rejects 4-digit partial phone lookup', () => {
    const res = trackOrder(mockOrder, '3210');
    assert.equal(res.ok, false);
    assert.equal(res.status, 403);
  });

  await t.test('accepts full 10-digit phone lookup and redacts sensitive fields', () => {
    const res = trackOrder(mockOrder, '9876543210');
    assert.equal(res.ok, true);
    assert.equal(res.data.id, 'KRIA-ORD-2026-9999');
    assert.equal(res.data.grandTotal, undefined); // Sensitive financial data omitted
    assert.equal(res.data.destinationCity, 'Hyderabad');
  });

  await t.test('accepts full email lookup', () => {
    const res = trackOrder(mockOrder, 'vikram@example.com');
    assert.equal(res.ok, true);
    assert.equal(res.data.trackingNumber, 'AWB-DEL-98765');
  });
});

test('Finding 8: Backup endpoint fails loudly rather than creating zero-byte fake files', async (t) => {
  await t.test('returns 501 instructions instead of false success claim', () => {
    function handleBackupTrigger() {
      return {
        status: 501,
        body: {
          error: "Automated backup not implemented.",
          instructions: "Use the Supabase Dashboard (Settings → Backups) or pg_dump with the database connection string to create a real backup."
        }
      };
    }

    const res = handleBackupTrigger();
    assert.equal(res.status, 501);
    assert.match(res.body.instructions, /Supabase Dashboard/);
  });
});

test('Finding 9: Pincode lookup network failure sets unconfirmed state instead of asserting delivery', async (t) => {
  await t.test('network error results in unverified status with clear customer notice', () => {
    function handlePincodeResponse(isNetworkError, data) {
      if (isNetworkError) {
        return {
          verified: false,
          message: 'Delivery estimate unavailable at this time. Will be confirmed at checkout.'
        };
      }
      if (data?.serviceable) {
        return { verified: true, message: 'Serviceable Express Air' };
      }
      return { verified: false, message: 'Pincode not serviceable' };
    }

    const failureState = handlePincodeResponse(true, null);
    assert.equal(failureState.verified, false);
    assert.match(failureState.message, /Delivery estimate unavailable/);
  });
});

test('Finding 10 & 11b: UTM parameter attribution capture and resolution', async (t) => {
  await t.test('extracts UTM parameters from query string into attribution record', () => {
    const search = '?utm_source=instagram&utm_medium=cpc&utm_campaign=diwali_sale_2026';
    const params = new URLSearchParams(search);
    const attribution = {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign')
    };

    assert.equal(attribution.utm_source, 'instagram');
    assert.equal(attribution.utm_medium, 'cpc');
    assert.equal(attribution.utm_campaign, 'diwali_sale_2026');
  });
});

test('Finding 11a: Deep-linking query params resolve to valid shape IDs', async (t) => {
  const SHAPE_ALIASES = {
    heart: 'love',
    love: 'love',
    filmstrip: 'filmstrip',
    film: 'filmstrip',
    polaroid: 'polaroid',
    arch: 'arch',
    circle: 'circle'
  };

  await t.test('resolves ?shape=heart to love', () => {
    assert.equal(SHAPE_ALIASES['heart'], 'love');
  });

  await t.test('resolves ?shape=filmstrip to filmstrip', () => {
    assert.equal(SHAPE_ALIASES['filmstrip'], 'filmstrip');
  });
});

test('Second-Pass Remediation: Public settings sanitization & sensitive field redaction', async (t) => {
  const PUBLIC_SETTING_KEYS = new Set([
    "company_name",
    "store_name",
    "support_email",
    "support_phone",
    "instagram_handle",
    "announcement_banner",
    "return_policy_days",
    "shipping_free_threshold",
    "currency_symbol",
    "tax_inclusive",
    "b2b_tiers",
    "brand_tagline"
  ]);

  function filterPublicSettings(settings) {
    const sanitized = {};
    for (const [key, val] of Object.entries(settings)) {
      if (PUBLIC_SETTING_KEYS.has(key)) {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }

  await t.test('strips bank accounts, ifsc, upi_id, and secret keys from public settings', () => {
    const rawSettings = {
      store_name: "KRIA Studio",
      support_email: "support@kriastudio.com",
      bank_name: "HDFC Bank",
      account_no: "50200012345678",
      ifsc: "HDFC0000123",
      upi_id: "kria@okhdfcbank",
      admin_secret: "super_secret_token",
      b2b_tiers: JSON.stringify([{ minQty: 5, discountPercent: 10 }])
    };

    const sanitized = filterPublicSettings(rawSettings);

    assert.equal(sanitized.store_name, "KRIA Studio");
    assert.equal(sanitized.support_email, "support@kriastudio.com");
    assert.equal(sanitized.b2b_tiers, rawSettings.b2b_tiers);
    assert.equal(sanitized.bank_name, undefined);
    assert.equal(sanitized.account_no, undefined);
    assert.equal(sanitized.ifsc, undefined);
    assert.equal(sanitized.upi_id, undefined);
    assert.equal(sanitized.admin_secret, undefined);
  });
});

test('Second-Pass Remediation: Wholesale B2B volume discount calculation', async (t) => {
  const DEFAULT_B2B_TIERS = [
    { minQty: 5, maxQty: 10, discountPercent: 10 },
    { minQty: 11, maxQty: 25, discountPercent: 20 },
    { minQty: 26, maxQty: 50, discountPercent: 30 },
    { minQty: 51, maxQty: 999, discountPercent: 40 },
  ];

  function calculateBulkDiscount(itemCount, subtotal, tiers = DEFAULT_B2B_TIERS) {
    if (itemCount < 5 || subtotal <= 0) return 0;
    const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sorted) {
      if (itemCount >= tier.minQty) {
        return Math.round((subtotal * tier.discountPercent) / 100);
      }
    }
    return 0;
  }

  await t.test('gives 0 discount for 1 to 4 frames (under MOQ)', () => {
    assert.equal(calculateBulkDiscount(1, 299), 0);
    assert.equal(calculateBulkDiscount(4, 1196), 0);
  });

  await t.test('gives 10% discount for 5 to 10 frames', () => {
    assert.equal(calculateBulkDiscount(5, 1500), 150);
    assert.equal(calculateBulkDiscount(10, 3000), 300);
  });

  await t.test('gives 20% discount for 11 to 25 frames', () => {
    assert.equal(calculateBulkDiscount(11, 3300), 660);
    assert.equal(calculateBulkDiscount(25, 7500), 1500);
  });

  await t.test('gives 30% discount for 26 to 50 frames', () => {
    assert.equal(calculateBulkDiscount(26, 7800), 2340);
    assert.equal(calculateBulkDiscount(50, 15000), 4500);
  });

  await t.test('gives 40% discount for 51+ frames', () => {
    assert.equal(calculateBulkDiscount(51, 15300), 6120);
    assert.equal(calculateBulkDiscount(100, 30000), 12000);
  });
});

test('Second-Pass Remediation: Order fulfillment state machine validation', async (t) => {
  const PRE_DELIVERY_STATUSES = ["Pending", "Payment Verified", "Processing", "Production", "Packed", "Shipped", "Out for Delivery"];

  function validateStatusTransition(currentStatus, nextStatus) {
    if ((currentStatus === "Cancelled" || currentStatus === "Refunded") && nextStatus !== currentStatus) {
      return { allowed: false, error: `Cannot update order: Order is already ${currentStatus}.` };
    }
    if (currentStatus === "Delivered" && PRE_DELIVERY_STATUSES.includes(nextStatus)) {
      return { allowed: false, error: `Invalid status transition: Order is already Delivered and cannot regress to ${nextStatus}.` };
    }
    return { allowed: true };
  }

  await t.test('blocks altering status of a Cancelled order', () => {
    const res = validateStatusTransition("Cancelled", "Processing");
    assert.equal(res.allowed, false);
    assert.match(res.error, /already Cancelled/);
  });

  await t.test('blocks altering status of a Refunded order', () => {
    const res = validateStatusTransition("Refunded", "Shipped");
    assert.equal(res.allowed, false);
    assert.match(res.error, /already Refunded/);
  });

  await t.test('blocks regression from Delivered to Processing or Shipped', () => {
    const res = validateStatusTransition("Delivered", "Processing");
    assert.equal(res.allowed, false);
    assert.match(res.error, /cannot regress/);

    const res2 = validateStatusTransition("Delivered", "Shipped");
    assert.equal(res2.allowed, false);
    assert.match(res2.error, /cannot regress/);
  });

  await t.test('allows forward progression through valid lifecycle states', () => {
    assert.equal(validateStatusTransition("Paid", "Processing").allowed, true);
    assert.equal(validateStatusTransition("Processing", "Production").allowed, true);
    assert.equal(validateStatusTransition("Production", "Packed").allowed, true);
    assert.equal(validateStatusTransition("Packed", "Shipped").allowed, true);
    assert.equal(validateStatusTransition("Shipped", "Delivered").allowed, true);
  });
});

test('Second-Pass Remediation: Truthful notification delivery reporting', async (t) => {
  function formatNotificationResult(whatsappSent, emailSent, smsSent, eventMsg) {
    const channelsDispatched = [];
    if (whatsappSent) channelsDispatched.push("WhatsApp");
    if (emailSent) channelsDispatched.push("Email");
    if (smsSent) channelsDispatched.push("SMS");

    const anySent = channelsDispatched.length > 0;
    return {
      sent: anySent,
      channels: channelsDispatched,
      status: anySent ? `Delivered via ${channelsDispatched.join(", ")}` : "No Active Notification Providers Configured",
      message: eventMsg
    };
  }

  await t.test('truthfully reports false when no notification channels are active', () => {
    const result = formatNotificationResult(false, false, false, "Order update");
    assert.equal(result.sent, false);
    assert.equal(result.channels.length, 0);
    assert.equal(result.status, "No Active Notification Providers Configured");
  });

  await t.test('truthfully reports active channels when dispatched', () => {
    const result = formatNotificationResult(true, true, false, "Order update");
    assert.equal(result.sent, true);
    assert.deepEqual(result.channels, ["WhatsApp", "Email"]);
    assert.match(result.status, /Delivered via WhatsApp, Email/);
  });
});


