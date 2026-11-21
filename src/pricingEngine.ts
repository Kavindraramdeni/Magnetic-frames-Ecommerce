/**
 * KRIA Tech — Authoritative Combined Cart Quantity-Based Wholesale Pricing Engine
 * 
 * CORE RULE:
 * The total combined quantity of all eligible products in the cart determines
 * the wholesale pricing tier applied to EVERY eligible product.
 * Each product and size variant retains its own distinct unit price at each quantity tier.
 */

export interface WholesaleTier {
  minQty: number;      // e.g. 0 (Regular), 50, 100, 200, 300, 500, 1000, 2000
  price: number;       // Unit price in INR (₹) at this tier
  label?: string;      // e.g. "Regular (<50)", "50+ pcs", "100+ pcs", etc.
}

export interface ProductVariantPricingConfig {
  productId: string;   // e.g. "square", "rectangle", "circle", "heart", "keychain"
  sizeLabel: string;   // e.g. "2 × 2\"", "3.5 × 2.5\"", "2.5\""
  regularPrice: number; // Single piece / baseline retail price
  eligibleForCombinedQty: boolean; // Flag to participate in combined cart calculation (default: true)
  tiers: WholesaleTier[]; // Ascending order of minQty
}

export interface CartInputItem {
  id: string;
  productId: string;
  productName?: string;
  sizeLabel: string;
  dimensions?: string;
  productImage?: string;
  quantity: number;
  eligibleForCombinedQty?: boolean;
  unitPrice?: number;
  originalUnitPrice?: number;
  totalPrice?: number;
}

export interface CalculatedCartLineItem extends CartInputItem {
  effectiveUnitPrice: number;
  regularUnitPrice: number;
  lineTotal: number;
  lineRegularTotal: number;
  lineSavings: number;
  unlockedTierMinQty: number;
  isEligible: boolean;
}

export interface TierMilestone {
  currentTierLabel: string;
  currentTierMinQty: number;
  nextTierLabel: string | null;
  nextTierMinQty: number | null;
  piecesNeededForNextTier: number;
  progressPercentage: number;
}

export interface CombinedCartPricingResult {
  totalCartQty: number;
  totalEligibleQty: number;
  totalNonEligibleQty: number;
  items: CalculatedCartLineItem[];
  totalAmount: number;
  totalRegularAmount: number;
  totalSavings: number;
  milestone: TierMilestone;
  currency: string;
}

// Standard wholesale threshold boundaries
export const STANDARD_TIER_THRESHOLDS = [0, 50, 100, 200, 300, 500, 1000, 2000];

/**
 * Default verified B2B wholesale pricing configurations based on
 * `kria-ai/knowledge-base/products.md`.
 */
export const DEFAULT_PRODUCT_PRICING_CONFIGS: ProductVariantPricingConfig[] = [
  // Minimal Square
  {
    productId: 'square',
    sizeLabel: '2 × 2"',
    regularPrice: 28,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 28, label: 'Regular (<50)' },
      { minQty: 50, price: 28, label: '50+ pcs' },
      { minQty: 100, price: 27.5, label: '100+ pcs' },
      { minQty: 200, price: 27.0, label: '200+ pcs' },
      { minQty: 300, price: 26.5, label: '300+ pcs' },
      { minQty: 500, price: 26.0, label: '500+ pcs' },
      { minQty: 1000, price: 25.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 24.0, label: '2,000+ pcs' }
    ]
  },
  {
    productId: 'square',
    sizeLabel: '3 × 3"',
    regularPrice: 36,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 36, label: 'Regular (<50)' },
      { minQty: 50, price: 36, label: '50+ pcs' },
      { minQty: 100, price: 35.5, label: '100+ pcs' },
      { minQty: 200, price: 35.0, label: '200+ pcs' },
      { minQty: 300, price: 34.5, label: '300+ pcs' },
      { minQty: 500, price: 34.0, label: '500+ pcs' },
      { minQty: 1000, price: 33.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 32.0, label: '2,000+ pcs' }
    ]
  },
  {
    productId: 'square',
    sizeLabel: '4 × 4"',
    regularPrice: 51,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 51, label: 'Regular (<50)' },
      { minQty: 50, price: 51, label: '50+ pcs' },
      { minQty: 100, price: 50.5, label: '100+ pcs' },
      { minQty: 200, price: 50.0, label: '200+ pcs' },
      { minQty: 300, price: 49.5, label: '300+ pcs' },
      { minQty: 500, price: 49.0, label: '500+ pcs' },
      { minQty: 1000, price: 48.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 47.0, label: '2,000+ pcs' }
    ]
  },

  // Classic Rectangle
  {
    productId: 'rectangle',
    sizeLabel: '3.5 × 2.5"',
    regularPrice: 36,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 36, label: 'Regular (<50)' },
      { minQty: 50, price: 36, label: '50+ pcs' },
      { minQty: 100, price: 35.5, label: '100+ pcs' },
      { minQty: 200, price: 35.0, label: '200+ pcs' },
      { minQty: 300, price: 34.5, label: '300+ pcs' },
      { minQty: 500, price: 34.0, label: '500+ pcs' },
      { minQty: 1000, price: 33.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 32.0, label: '2,000+ pcs' }
    ]
  },
  {
    productId: 'rectangle',
    sizeLabel: '3 × 4"',
    regularPrice: 41,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 41, label: 'Regular (<50)' },
      { minQty: 50, price: 41, label: '50+ pcs' },
      { minQty: 100, price: 40.5, label: '100+ pcs' },
      { minQty: 200, price: 40.0, label: '200+ pcs' },
      { minQty: 300, price: 39.5, label: '300+ pcs' },
      { minQty: 500, price: 39.0, label: '500+ pcs' },
      { minQty: 1000, price: 38.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 37.0, label: '2,000+ pcs' }
    ]
  },
  {
    productId: 'rectangle',
    sizeLabel: '6 × 4"',
    regularPrice: 61,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 61, label: 'Regular (<50)' },
      { minQty: 50, price: 61, label: '50+ pcs' },
      { minQty: 100, price: 60.5, label: '100+ pcs' },
      { minQty: 200, price: 60.0, label: '200+ pcs' },
      { minQty: 300, price: 59.5, label: '300+ pcs' },
      { minQty: 500, price: 59.0, label: '500+ pcs' },
      { minQty: 1000, price: 58.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 57.0, label: '2,000+ pcs' }
    ]
  },

  // Minimal Circle
  {
    productId: 'circle',
    sizeLabel: '2 × 2"',
    regularPrice: 25,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 25, label: 'Regular (<50)' },
      { minQty: 50, price: 25, label: '50+ pcs' },
      { minQty: 100, price: 24.5, label: '100+ pcs' },
      { minQty: 200, price: 24.0, label: '200+ pcs' },
      { minQty: 300, price: 23.5, label: '300+ pcs' },
      { minQty: 500, price: 23.0, label: '500+ pcs' },
      { minQty: 1000, price: 22.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 21.0, label: '2,000+ pcs' }
    ]
  },
  {
    productId: 'circle',
    sizeLabel: '3 × 3"',
    regularPrice: 33,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 33, label: 'Regular (<50)' },
      { minQty: 50, price: 33, label: '50+ pcs' },
      { minQty: 100, price: 32.5, label: '100+ pcs' },
      { minQty: 200, price: 32.0, label: '200+ pcs' },
      { minQty: 300, price: 31.5, label: '300+ pcs' },
      { minQty: 500, price: 31.0, label: '500+ pcs' },
      { minQty: 1000, price: 30.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 29.0, label: '2,000+ pcs' }
    ]
  },
  {
    productId: 'circle',
    sizeLabel: '4 × 4"',
    regularPrice: 47,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 47, label: 'Regular (<50)' },
      { minQty: 50, price: 47, label: '50+ pcs' },
      { minQty: 100, price: 46.5, label: '100+ pcs' },
      { minQty: 200, price: 46.0, label: '200+ pcs' },
      { minQty: 300, price: 45.5, label: '300+ pcs' },
      { minQty: 500, price: 45.0, label: '500+ pcs' },
      { minQty: 1000, price: 44.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 43.0, label: '2,000+ pcs' }
    ]
  },

  // Sculpted Heart
  {
    productId: 'heart',
    sizeLabel: '2 × 2"',
    regularPrice: 25,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 25, label: 'Regular (<50)' },
      { minQty: 50, price: 25, label: '50+ pcs' },
      { minQty: 100, price: 24.5, label: '100+ pcs' },
      { minQty: 200, price: 24.0, label: '200+ pcs' },
      { minQty: 300, price: 23.5, label: '300+ pcs' },
      { minQty: 500, price: 23.0, label: '500+ pcs' },
      { minQty: 1000, price: 22.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 21.0, label: '2,000+ pcs' }
    ]
  },
  {
    productId: 'heart',
    sizeLabel: '3 × 3"',
    regularPrice: 33,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 33, label: 'Regular (<50)' },
      { minQty: 50, price: 33, label: '50+ pcs' },
      { minQty: 100, price: 32.5, label: '100+ pcs' },
      { minQty: 200, price: 32.0, label: '200+ pcs' },
      { minQty: 300, price: 31.5, label: '300+ pcs' },
      { minQty: 500, price: 31.0, label: '500+ pcs' },
      { minQty: 1000, price: 30.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 29.0, label: '2,000+ pcs' }
    ]
  },
  {
    productId: 'heart',
    sizeLabel: '4 × 4"',
    regularPrice: 47,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 47, label: 'Regular (<50)' },
      { minQty: 50, price: 47, label: '50+ pcs' },
      { minQty: 100, price: 46.5, label: '100+ pcs' },
      { minQty: 200, price: 46.0, label: '200+ pcs' },
      { minQty: 300, price: 45.5, label: '300+ pcs' },
      { minQty: 500, price: 45.0, label: '500+ pcs' },
      { minQty: 1000, price: 44.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 43.0, label: '2,000+ pcs' }
    ]
  },

  // Acrylic Keychains
  {
    productId: 'keychain',
    sizeLabel: '2.5"',
    regularPrice: 32,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 32, label: 'Regular (<50)' },
      { minQty: 50, price: 30, label: '50+ pcs' },
      { minQty: 100, price: 29.5, label: '100+ pcs' },
      { minQty: 200, price: 29.0, label: '200+ pcs' },
      { minQty: 300, price: 28.5, label: '300+ pcs' },
      { minQty: 500, price: 28.0, label: '500+ pcs' },
      { minQty: 1000, price: 27.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 26.0, label: '2,000+ pcs' }
    ]
  },
  {
    productId: 'keychain',
    sizeLabel: '2 × 3"',
    regularPrice: 38,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 38, label: 'Regular (<50)' },
      { minQty: 50, price: 36, label: '50+ pcs' },
      { minQty: 100, price: 35.5, label: '100+ pcs' },
      { minQty: 200, price: 35.0, label: '200+ pcs' },
      { minQty: 300, price: 34.5, label: '300+ pcs' },
      { minQty: 500, price: 34.0, label: '500+ pcs' },
      { minQty: 1000, price: 33.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 32.0, label: '2,000+ pcs' }
    ]
  },
  {
    productId: 'keychain',
    sizeLabel: '3 × 3"',
    regularPrice: 38,
    eligibleForCombinedQty: true,
    tiers: [
      { minQty: 0, price: 38, label: 'Regular (<50)' },
      { minQty: 50, price: 36, label: '50+ pcs' },
      { minQty: 100, price: 35.5, label: '100+ pcs' },
      { minQty: 200, price: 35.0, label: '200+ pcs' },
      { minQty: 300, price: 34.5, label: '300+ pcs' },
      { minQty: 500, price: 34.0, label: '500+ pcs' },
      { minQty: 1000, price: 33.0, label: '1,000+ pcs' },
      { minQty: 2000, price: 32.0, label: '2,000+ pcs' }
    ]
  }
];

/**
 * Finds the matching pricing config for a product and size.
 */
export function findPricingConfig(
  productId: string,
  sizeLabel: string,
  configs: ProductVariantPricingConfig[] = DEFAULT_PRODUCT_PRICING_CONFIGS
): ProductVariantPricingConfig | undefined {
  return configs.find(
    (c) => c.productId === productId && (c.sizeLabel === sizeLabel || sizeLabel.startsWith(c.sizeLabel))
  );
}

/**
 * Determines the unit rate for a single product line item given the active qualifying quantity.
 */
export function getTierRateForQuantity(
  config: ProductVariantPricingConfig,
  qualifyingQty: number
): { unitPrice: number; unlockedMinQty: number } {
  // Sort tiers ascending by minQty
  const sorted = [...config.tiers].sort((a, b) => a.minQty - b.minQty);
  let best = sorted[0] || { minQty: 0, price: config.regularPrice };

  for (const tier of sorted) {
    if (qualifyingQty >= tier.minQty) {
      best = tier;
    }
  }

  // Ensure price never falls below zero
  const safePrice = Math.max(0, best.price);
  return { unitPrice: safePrice, unlockedMinQty: best.minQty };
}

/**
 * Calculates the progress toward the next wholesale milestone.
 */
export function calculateTierMilestone(
  totalEligibleQty: number,
  thresholds: number[] = STANDARD_TIER_THRESHOLDS
): TierMilestone {
  const sortedThresholds = [...new Set(thresholds)].sort((a, b) => a - b);
  
  let currentMinQty = sortedThresholds[0] ?? 0;
  let nextMinQty: number | null = null;

  for (let i = 0; i < sortedThresholds.length; i++) {
    const t = sortedThresholds[i];
    if (totalEligibleQty >= t) {
      currentMinQty = t;
      nextMinQty = i + 1 < sortedThresholds.length ? sortedThresholds[i + 1] : null;
    } else {
      if (nextMinQty === null) {
        nextMinQty = t;
      }
      break;
    }
  }

  const currentTierLabel = currentMinQty === 0 ? 'Regular (<50 pcs)' : `${currentMinQty.toLocaleString('en-IN')}+ pcs Tier`;
  const nextTierLabel = nextMinQty !== null ? `${nextMinQty.toLocaleString('en-IN')}+ pcs Tier` : null;
  const piecesNeeded = nextMinQty !== null ? Math.max(0, nextMinQty - totalEligibleQty) : 0;

  let progressPercentage = 100;
  if (nextMinQty !== null) {
    const range = nextMinQty - currentMinQty;
    const progress = totalEligibleQty - currentMinQty;
    progressPercentage = range > 0 ? Math.min(100, Math.max(0, Math.round((progress / range) * 100))) : 100;
  }

  return {
    currentTierLabel,
    currentTierMinQty: currentMinQty,
    nextTierLabel,
    nextTierMinQty: nextMinQty,
    piecesNeededForNextTier: piecesNeeded,
    progressPercentage
  };
}

/**
 * Main Authoritative Calculation Engine:
 * 
 * Takes cart items and computes combined cart wholesale pricing.
 * Revalidates every single line item and calculates authoritative totals.
 */
export function calculateCombinedCartPricing(
  items: CartInputItem[],
  configs: ProductVariantPricingConfig[] = DEFAULT_PRODUCT_PRICING_CONFIGS
): CombinedCartPricingResult {
  if (!items || items.length === 0) {
    return {
      totalCartQty: 0,
      totalEligibleQty: 0,
      totalNonEligibleQty: 0,
      items: [],
      totalAmount: 0,
      totalRegularAmount: 0,
      totalSavings: 0,
      milestone: calculateTierMilestone(0),
      currency: 'INR'
    };
  }

  // 1. First pass: Determine eligibility & calculate total eligible quantity
  let totalEligibleQty = 0;
  let totalNonEligibleQty = 0;
  let totalCartQty = 0;

  const preppedItems = items.map((item) => {
    // Sanitize quantity: integer >= 1, capped at 100,000 for safety
    const safeQty = Math.max(1, Math.min(100000, Math.round(Number(item.quantity) || 1)));
    const config = findPricingConfig(item.productId, item.sizeLabel, configs);

    // Item is eligible only if both item and product config allow it
    const isEligible = (item.eligibleForCombinedQty !== false) && (!config || config.eligibleForCombinedQty !== false);

    totalCartQty += safeQty;
    if (isEligible) {
      totalEligibleQty += safeQty;
    } else {
      totalNonEligibleQty += safeQty;
    }

    return {
      ...item,
      quantity: safeQty,
      isEligible,
      config
    };
  });

  // 2. Second pass: Calculate line item rates based on combined quantity
  const calculatedItems: CalculatedCartLineItem[] = preppedItems.map((prepped) => {
    const config = prepped.config;
    const regularPrice = config ? config.regularPrice : (prepped.originalUnitPrice || prepped.unitPrice || 0);

    let effectiveUnitPrice = regularPrice;
    let unlockedMinQty = 0;

    if (config) {
      // If eligible, unlock tier based on totalEligibleQty; otherwise based on own quantity
      const qualifyingQty = prepped.isEligible ? totalEligibleQty : prepped.quantity;
      const rateInfo = getTierRateForQuantity(config, qualifyingQty);
      effectiveUnitPrice = rateInfo.unitPrice;
      unlockedMinQty = rateInfo.unlockedMinQty;
    } else {
      effectiveUnitPrice = Math.max(0, Number(prepped.unitPrice) || regularPrice);
    }

    // Line totals
    const lineTotal = Math.round(effectiveUnitPrice * prepped.quantity * 100) / 100;
    const lineRegularTotal = Math.round(regularPrice * prepped.quantity * 100) / 100;
    const lineSavings = Math.max(0, Math.round((lineRegularTotal - lineTotal) * 100) / 100);

    return {
      id: prepped.id,
      productId: prepped.productId,
      productName: prepped.productName || prepped.productId,
      sizeLabel: prepped.sizeLabel,
      dimensions: prepped.dimensions,
      productImage: prepped.productImage,
      quantity: prepped.quantity,
      eligibleForCombinedQty: prepped.isEligible,
      isEligible: prepped.isEligible,
      effectiveUnitPrice,
      regularUnitPrice: regularPrice,
      unitPrice: effectiveUnitPrice,
      originalUnitPrice: regularPrice,
      totalPrice: lineTotal,
      lineTotal,
      lineRegularTotal,
      lineSavings,
      unlockedTierMinQty: unlockedMinQty
    };
  });

  // 3. Aggregate totals
  const totalAmount = Math.round(calculatedItems.reduce((sum, it) => sum + it.lineTotal, 0) * 100) / 100;
  const totalRegularAmount = Math.round(calculatedItems.reduce((sum, it) => sum + it.lineRegularTotal, 0) * 100) / 100;
  const totalSavings = Math.max(0, Math.round((totalRegularAmount - totalAmount) * 100) / 100);

  // 4. Milestone progress
  const milestone = calculateTierMilestone(totalEligibleQty);

  return {
    totalCartQty,
    totalEligibleQty,
    totalNonEligibleQty,
    items: calculatedItems,
    totalAmount,
    totalRegularAmount,
    totalSavings,
    milestone,
    currency: 'INR'
  };
}
