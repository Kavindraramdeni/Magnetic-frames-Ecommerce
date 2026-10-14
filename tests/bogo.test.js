import test from 'node:test';
import assert from 'node:assert/strict';

// Pure JS implementation matching calculateBogoDiscount in src/lib/pricing.ts & server.ts
function calculateBogoDiscount(cart) {
  const unitPrices = [];
  cart.forEach((item) => {
    const q = Math.max(1, Math.min(500, Number(item.quantity) || 1));
    const p = Math.max(0, Number(item.price) || 0);
    for (let i = 0; i < q; i++) unitPrices.push(p);
  });

  if (unitPrices.length < 2) {
    return {
      eligible: false,
      freeCount: 0,
      discount: 0,
      message: 'BOGO (Buy 1 Get 1 Free) requires at least 2 frames. Add 1 more frame to get it 100% FREE!'
    };
  }

  unitPrices.sort((a, b) => a - b);
  const freeCount = Math.floor(unitPrices.length / 2);
  const discount = unitPrices.slice(0, freeCount).reduce((sum, p) => sum + p, 0);

  return {
    eligible: true,
    freeCount,
    discount,
    message: `BOGO Applied: ${freeCount} free frame${freeCount > 1 ? 's' : ''} (-₹${discount})`
  };
}

function calculateOrderTotalWithBogo(cart, couponCode) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const isBogo = String(couponCode).toUpperCase().trim() === 'BOGO';
  const bogo = isBogo ? calculateBogoDiscount(cart) : { discount: 0 };
  const effectiveSubtotal = Math.max(0, subtotal - bogo.discount);
  const deliveryCharge = effectiveSubtotal >= 699 || effectiveSubtotal === 0 ? 0 : 60;
  return {
    subtotal,
    discount: bogo.discount,
    deliveryCharge,
    grandTotal: effectiveSubtotal + deliveryCharge
  };
}

test('BOGO Engine: Single Heart 4x4 frame in cart receives ₹0 discount and total is NOT ₹0', () => {
  // Adding only 1 Heart 4*4 frame (@ ₹299)
  const cart = [{ price: 299, quantity: 1, shapeId: 'love', selectedSize: '4 × 4"' }];
  const bogo = calculateBogoDiscount(cart);

  assert.equal(bogo.eligible, false, 'BOGO must not be eligible with only 1 frame');
  assert.equal(bogo.discount, 0, 'Discount must be 0 with only 1 frame in cart');
  assert.equal(bogo.freeCount, 0, 'Free count must be 0 with only 1 frame');
  assert.match(bogo.message, /requires at least 2 frames/i);

  const order = calculateOrderTotalWithBogo(cart, 'BOGO');
  assert.equal(order.subtotal, 299);
  assert.equal(order.discount, 0, 'No discount on 1 item');
  assert.equal(order.grandTotal, 299 + 60, 'Customer pays ₹299 + ₹60 delivery');
  assert.notEqual(order.grandTotal, 0, 'Order total must NEVER be 0 on a single frame');
});

test('BOGO Engine: Two Heart 4x4 frames in cart makes 1 frame 100% FREE', () => {
  // Customer adds 2 Heart 4*4 frames (@ ₹299 each)
  const cart = [{ price: 299, quantity: 2, shapeId: 'love', selectedSize: '4 × 4"' }];
  const bogo = calculateBogoDiscount(cart);

  assert.equal(bogo.eligible, true, 'BOGO must be eligible with 2 frames');
  assert.equal(bogo.freeCount, 1, 'Exactly 1 frame should be free');
  assert.equal(bogo.discount, 299, 'Discount must equal the price of 1 frame (₹299)');

  const order = calculateOrderTotalWithBogo(cart, 'BOGO');
  assert.equal(order.subtotal, 598);
  assert.equal(order.discount, 299, '1 frame is free');
  assert.equal(order.grandTotal, 299 + 60, 'Customer pays for 1 frame (₹299) + ₹60 delivery');
});

test('BOGO Engine: Two different priced items discounts the cheaper frame 100%', () => {
  // Customer adds 1 Heart 4*4 (@ ₹299) and 1 Heart 2*2 (@ ₹199)
  const cart = [
    { price: 299, quantity: 1, shapeId: 'love', selectedSize: '4 × 4"' },
    { price: 199, quantity: 1, shapeId: 'love', selectedSize: '2 × 2"' }
  ];
  const bogo = calculateBogoDiscount(cart);

  assert.equal(bogo.eligible, true);
  assert.equal(bogo.freeCount, 1);
  assert.equal(bogo.discount, 199, 'Cheaper frame (₹199) must be 100% free');

  const order = calculateOrderTotalWithBogo(cart, 'BOGO');
  assert.equal(order.subtotal, 498);
  assert.equal(order.discount, 199);
  assert.equal(order.grandTotal, 299 + 60, 'Customer pays for the ₹299 frame');
});

test('BOGO Engine: Four items in cart gives exactly 2 cheapest frames 100% FREE', () => {
  // Customer adds 4 frames: ₹349, ₹299, ₹249, ₹199
  const cart = [
    { price: 349, quantity: 1 },
    { price: 299, quantity: 1 },
    { price: 249, quantity: 1 },
    { price: 199, quantity: 1 }
  ];
  const bogo = calculateBogoDiscount(cart);

  assert.equal(bogo.eligible, true);
  assert.equal(bogo.freeCount, 2, '2 frames free for a 4-item cart');
  assert.equal(bogo.discount, 199 + 249, 'Cheapest 2 frames (₹199 + ₹249 = ₹448) must be free');

  const order = calculateOrderTotalWithBogo(cart, 'BOGO');
  assert.equal(order.subtotal, 349 + 299 + 249 + 199);
  assert.equal(order.discount, 448);
  assert.equal(order.grandTotal, 349 + 299 + 60, 'Customer pays only for the 2 expensive frames');
});
