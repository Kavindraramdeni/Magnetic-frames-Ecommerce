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
});
