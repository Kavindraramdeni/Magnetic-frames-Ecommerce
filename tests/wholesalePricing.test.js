import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCombinedCartPricing,
  calculateTierMilestone,
  DEFAULT_PRODUCT_PRICING_CONFIGS,
  findPricingConfig,
  getTierRateForQuantity
} from '../src/pricingEngine.ts';

// Helper to quickly build mock cart items
function makeItem(productId, sizeLabel, quantity, options = {}) {
  return {
    id: `${productId}_${sizeLabel}_${Math.random()}`,
    productId,
    productName: options.productName || productId,
    sizeLabel,
    dimensions: options.dimensions || sizeLabel,
    quantity,
    eligibleForCombinedQty: options.eligibleForCombinedQty !== false,
    ...options
  };
}

test('Wholesale Pricing Suite - Scenario 1: 100 pieces of one model', () => {
  // 100 pcs of Minimal Square 2×2"
  const cart = [makeItem('square', '2 × 2"', 100)];
  const result = calculateCombinedCartPricing(cart);

  assert.equal(result.totalEligibleQty, 100);
  assert.equal(result.totalCartQty, 100);
  assert.equal(result.items.length, 1);

  // Rate for 100+ pcs of Square 2×2" is ₹27.50, Original MRP is ₹79
  const item = result.items[0];
  assert.equal(item.effectiveUnitPrice, 27.5);
  assert.equal(item.regularUnitPrice, 28.0);
  assert.equal(item.originalUnitPrice, 79.0);
  assert.equal(item.lineTotal, 2750);
  // Savings: Original Price (79) - Current Wholesale Price (27.5) = 51.50/pc -> 5,150 total
  assert.equal(item.lineSavings, 5150);
  assert.equal(result.totalAmount, 2750);
  assert.equal(result.totalSavings, 5150);
  assert.equal(result.milestone.currentTierMinQty, 100);
});

test('Wholesale Pricing Suite - Scenario 2: 500 pieces of one model', () => {
  // 500 pcs of Classic Rectangle 6×4"
  const cart = [makeItem('rectangle', '6 × 4"', 500)];
  const result = calculateCombinedCartPricing(cart);

  assert.equal(result.totalEligibleQty, 500);
  assert.equal(result.items.length, 1);

  // Rate for 500+ pcs of Rectangle 6×4" is ₹59.00 (regular ₹61, original MRP ₹179)
  const item = result.items[0];
  assert.equal(item.effectiveUnitPrice, 59.0);
  assert.equal(item.regularUnitPrice, 61.0);
  assert.equal(item.originalUnitPrice, 179.0);
  assert.equal(item.lineTotal, 29500);
  // Savings: Original Price (179) - Current Wholesale Price (59) = 120/pc -> 60,000 total
  assert.equal(item.lineSavings, 60000);
  assert.equal(result.totalSavings, 60000);
  assert.equal(result.milestone.currentTierMinQty, 500);
});

test('Wholesale Pricing Suite - Scenario 3: 500 pieces of one model plus 10 pieces of another', () => {
  // 500 pcs Rectangle 3.5×2.5" + 10 pcs Heart 4×4" -> Total combined = 510 pcs
  // Both items MUST receive their respective 500+ pcs tier price!
  const cart = [
    makeItem('rectangle', '3.5 × 2.5"', 500),
    makeItem('heart', '4 × 4"', 10)
  ];
  const result = calculateCombinedCartPricing(cart);

  assert.equal(result.totalEligibleQty, 510);
  assert.equal(result.totalCartQty, 510);

  const rectItem = result.items.find(i => i.productId === 'rectangle');
  const heartItem = result.items.find(i => i.productId === 'heart');

  // Rectangle 3.5×2.5" at 500+ tier is ₹34.00
  assert.equal(rectItem.effectiveUnitPrice, 34.0);
  assert.equal(rectItem.lineTotal, 500 * 34.0);

  // Heart 4×4" at 500+ tier is ₹45.00, even though only 10 pcs were ordered!
  assert.equal(heartItem.effectiveUnitPrice, 45.0);
  assert.equal(heartItem.lineTotal, 10 * 45.0);

  assert.equal(result.totalAmount, (500 * 34.0) + (10 * 45.0));
  assert.equal(result.milestone.currentTierMinQty, 500);
});

test('Wholesale Pricing Suite - Scenario 4: Mixed models reaching exactly 1,000 pieces', () => {
  // 500 pcs 2×2 square + 200 pcs 3.5×2.5 rectangle + 200 pcs 3×4 rectangle + 100 pcs 6×4 rectangle = 1,000 total
  const cart = [
    makeItem('square', '2 × 2"', 500),
    makeItem('rectangle', '3.5 × 2.5"', 200),
    makeItem('rectangle', '3 × 4"', 200),
    makeItem('rectangle', '6 × 4"', 100)
  ];
  const result = calculateCombinedCartPricing(cart);

  assert.equal(result.totalEligibleQty, 1000);
  assert.equal(result.milestone.currentTierMinQty, 1000);
  assert.equal(result.milestone.nextTierMinQty, 2000);
  assert.equal(result.milestone.piecesNeededForNextTier, 1000);

  // 1,000-piece tier prices:
  // Square 2×2" -> ₹25.00
  // Rectangle 3.5×2.5" -> ₹33.00
  // Rectangle 3×4" -> ₹38.00
  // Rectangle 6×4" -> ₹58.00 (even with only 100 pcs!)
  assert.equal(result.items[0].effectiveUnitPrice, 25.0);
  assert.equal(result.items[1].effectiveUnitPrice, 33.0);
  assert.equal(result.items[2].effectiveUnitPrice, 38.0);
  assert.equal(result.items[3].effectiveUnitPrice, 58.0);

  const expectedTotal = (500 * 25.0) + (200 * 33.0) + (200 * 38.0) + (100 * 58.0);
  assert.equal(result.totalAmount, expectedTotal);
});

test('Wholesale Pricing Suite - Scenario 5: Mixed models exceeding 1,000 pieces', () => {
  // 1,250 pieces total
  const cart = [
    makeItem('square', '2 × 2"', 750),
    makeItem('circle', '3 × 3"', 250),
    makeItem('keychain', '2.5"', 250)
  ];
  const result = calculateCombinedCartPricing(cart);

  assert.equal(result.totalEligibleQty, 1250);
  assert.equal(result.milestone.currentTierMinQty, 1000);
  assert.equal(result.milestone.nextTierMinQty, 2000);
  assert.equal(result.milestone.piecesNeededForNextTier, 750);

  // Square 2×2" at 1,000+ -> ₹25.00
  // Circle 3×3" at 1,000+ -> ₹30.00
  // Keychain 2.5" at 1,000+ -> ₹27.00
  assert.equal(result.items[0].effectiveUnitPrice, 25.0);
  assert.equal(result.items[1].effectiveUnitPrice, 30.0);
  assert.equal(result.items[2].effectiveUnitPrice, 27.0);
});

test('Wholesale Pricing Suite - Scenario 6: Removing items and dropping below a tier', () => {
  // Start with 1,000 pcs (unlocking 1,000+ tier)
  const cart = [
    makeItem('square', '2 × 2"', 500),
    makeItem('rectangle', '6 × 4"', 500)
  ];
  const res1000 = calculateCombinedCartPricing(cart);
  assert.equal(res1000.items[1].effectiveUnitPrice, 58.0); // 1,000+ tier

  // Customer removes the 500 pcs square and adds only 50 pcs square -> total 550 pcs (500+ tier)
  const cartReduced = [
    makeItem('square', '2 × 2"', 50),
    makeItem('rectangle', '6 × 4"', 500)
  ];
  const res550 = calculateCombinedCartPricing(cartReduced);
  assert.equal(res550.totalEligibleQty, 550);
  assert.equal(res550.items[1].effectiveUnitPrice, 59.0); // Drops to 500+ tier (₹59.00)

  // Customer further reduces total to 450 pcs -> drops to 300+ tier (₹59.50)
  const cart450 = [
    makeItem('rectangle', '6 × 4"', 450)
  ];
  const res450 = calculateCombinedCartPricing(cart450);
  assert.equal(res450.totalEligibleQty, 450);
  assert.equal(res450.items[0].effectiveUnitPrice, 59.5); // 300+ tier rate is 59.50
});

test('Wholesale Pricing Suite - Scenario 7: Updating cart quantities mid-tier', () => {
  // Customer starts with 150 pcs (100+ tier)
  const cart150 = [makeItem('circle', '2 × 2"', 150)];
  const res150 = calculateCombinedCartPricing(cart150);
  assert.equal(res150.items[0].effectiveUnitPrice, 24.5); // 100+ tier

  // Customer increments quantity by 70 pcs -> total 220 pcs (200+ tier)
  const cart220 = [makeItem('circle', '2 × 2"', 220)];
  const res220 = calculateCombinedCartPricing(cart220);
  assert.equal(res220.items[0].effectiveUnitPrice, 24.0); // 200+ tier rate is 24.0
});

test('Wholesale Pricing Suite - Scenario 8: Adding keychains and other eligible products', () => {
  // Keychains are eligible products and contribute to combined volume
  const cart = [
    makeItem('keychain', '2.5"', 60),
    makeItem('keychain', '2 × 3"', 40)
  ];
  const result = calculateCombinedCartPricing(cart);

  // 60 + 40 = 100 total pcs -> unlocks 100+ tier for both keychains!
  assert.equal(result.totalEligibleQty, 100);
  assert.equal(result.items[0].effectiveUnitPrice, 29.5); // 2.5" keychain 100+ tier
  assert.equal(result.items[1].effectiveUnitPrice, 35.5); // 2×3" keychain 100+ tier
});

test('Wholesale Pricing Suite - Scenario 9: Excluding a product from quantity calculation', () => {
  // Product A is eligible (100 pcs). Product B is excluded from combined pooling (500 pcs).
  const cart = [
    makeItem('square', '2 × 2"', 100, { eligibleForCombinedQty: true }),
    makeItem('rectangle', '6 × 4"', 500, { eligibleForCombinedQty: false })
  ];
  const result = calculateCombinedCartPricing(cart);

  // Total eligible quantity should ONLY count Product A (100 pcs)
  assert.equal(result.totalEligibleQty, 100);
  assert.equal(result.totalNonEligibleQty, 500);
  assert.equal(result.totalCartQty, 600);

  const eligibleItem = result.items.find(i => i.isEligible);
  const excludedItem = result.items.find(i => !i.isEligible);

  // Eligible item unlocks 100+ tier (₹27.50), NOT 600+ tier
  assert.equal(eligibleItem.effectiveUnitPrice, 27.5);

  // Excluded item uses its own quantity (500 pcs) -> unlocks 500+ tier for itself (₹59.00)
  assert.equal(excludedItem.effectiveUnitPrice, 59.0);
});

test('Wholesale Pricing Suite - Scenario 10: Checkout price verification against client tampering', () => {
  // Malicious or stale client submits spoofed low unitPrice ₹1.00
  const spoofedCart = [
    {
      id: 'item_1',
      productId: 'rectangle',
      sizeLabel: '6 × 4"',
      quantity: 50,
      unitPrice: 1.0, // Tampered!
      totalPrice: 50.0 // Tampered!
    }
  ];

  // Authoritative server recalculation
  const verified = calculateCombinedCartPricing(spoofedCart);

  // Server completely overwrites client prices with authoritative tier rate (₹61.00 for 50 pcs)
  assert.equal(verified.items[0].effectiveUnitPrice, 61.0);
  assert.equal(verified.items[0].lineTotal, 3050.0);
  assert.equal(verified.totalAmount, 3050.0);
  assert.notEqual(verified.totalAmount, 50.0);
});

test('Wholesale Pricing Suite - Scenario 11: Guest and logged-in customer carts calculate identically', () => {
  // Deterministic calculation: Guest and logged-in user with same cart items receive identical pricing
  const guestCart = [
    makeItem('square', '3 × 3"', 200),
    makeItem('heart', '2 × 2"', 100)
  ];
  const loggedInCart = [
    makeItem('square', '3 × 3"', 200),
    makeItem('heart', '2 × 2"', 100)
  ];

  const guestResult = calculateCombinedCartPricing(guestCart);
  const loggedInResult = calculateCombinedCartPricing(loggedInCart);

  assert.deepEqual(guestResult.totalAmount, loggedInResult.totalAmount);
  assert.deepEqual(guestResult.totalSavings, loggedInResult.totalSavings);
  assert.deepEqual(guestResult.milestone, loggedInResult.milestone);
});

test('Wholesale Pricing Suite - Scenario 12: Cart persistence after refresh (JSON serialization)', () => {
  const originalCart = [
    makeItem('square', '2 × 2"', 150),
    makeItem('circle', '4 × 4"', 150)
  ];
  const initialResult = calculateCombinedCartPricing(originalCart);

  // Simulate localStorage persistence: serialize to JSON string and parse back
  const serialized = JSON.stringify(originalCart);
  const restoredCart = JSON.parse(serialized);

  const restoredResult = calculateCombinedCartPricing(restoredCart);

  assert.equal(restoredResult.totalEligibleQty, 300);
  assert.equal(restoredResult.milestone.currentTierMinQty, 300);
  assert.equal(restoredResult.totalAmount, initialResult.totalAmount);
  assert.equal(restoredResult.totalSavings, initialResult.totalSavings);
  assert.equal(restoredResult.items[0].effectiveUnitPrice, 26.5); // Square 2×2" 300+ tier
  assert.equal(restoredResult.items[1].effectiveUnitPrice, 45.5); // Circle 4×4" 300+ tier
});
