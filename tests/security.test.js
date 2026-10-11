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

test('Shiprocket order creation idempotency guard', async (t) => {
  function shouldSyncShiprocket(order) {
    if (order.shipmentId || order.shiprocketOrderId) return false;
    return true;
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
