export interface B2bTier {
  minQty: number;
  maxQty: number;
  discountPercent: number;
  label?: string;
}

export const DEFAULT_B2B_TIERS: B2bTier[] = [
  { minQty: 5, maxQty: 10, discountPercent: 10, label: '5–10 frames · 10% off' },
  { minQty: 11, maxQty: 25, discountPercent: 20, label: '11–25 frames · 20% off' },
  { minQty: 26, maxQty: 50, discountPercent: 30, label: '26–50 frames · 30% off' },
  { minQty: 51, maxQty: 999, discountPercent: 40, label: '50+ frames · 40% off' },
];

export function calculateBulkDiscount(
  itemCount: number,
  subtotal: number,
  tiers: B2bTier[] = DEFAULT_B2B_TIERS
): number {
  if (itemCount < 5 || subtotal <= 0) return 0;
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  for (const tier of sorted) {
    if (itemCount >= tier.minQty) {
      return Math.round((subtotal * tier.discountPercent) / 100);
    }
  }
  return 0;
}

export function bulkDiscountLabel(itemCount: number, tiers: B2bTier[] = DEFAULT_B2B_TIERS): string | null {
  if (itemCount < 5) return null;
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  const match = sorted.find((t) => itemCount >= t.minQty);
  return match?.label || `Volume discount (${match?.discountPercent}%)`;
}

export interface PromotionSettings {
  shipping_free_threshold?: number;
  flat_shipping_rate?: number;
  meta_launch_offer_enabled?: boolean;
  bundle_3_price?: number;
  bundle_3_free_shipping?: boolean;
}

export const DEFAULT_PROMO_SETTINGS: PromotionSettings = {
  shipping_free_threshold: 699,
  flat_shipping_rate: 60,
  meta_launch_offer_enabled: true,
  bundle_3_price: 799,
  bundle_3_free_shipping: true,
};

export function deliveryChargeFor(
  subtotal: number,
  threshold: number = 699,
  flatRate: number = 60
): number {
  if (subtotal <= 0) return 0;
  return subtotal >= threshold ? 0 : flatRate;
}

export function calculateCartPricing({
  cart,
  couponDiscount = 0,
  forceFreeShipping = false,
  settings = DEFAULT_PROMO_SETTINGS
}: {
  cart: { price: number; quantity: number }[];
  couponDiscount?: number;
  forceFreeShipping?: boolean;
  settings?: PromotionSettings;
}) {
  const itemCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const bulkDiscount = calculateBulkDiscount(itemCount, subtotal);

  const isMetaActive = settings.meta_launch_offer_enabled !== false;
  const bundle3Price = settings.bundle_3_price || 799;
  const bundle3FreeShipping = settings.bundle_3_free_shipping !== false;
  const freeThreshold = settings.shipping_free_threshold || 699;
  const flatRate = settings.flat_shipping_rate ?? 60;

  let bundleDiscount = 0;
  let bundleFreeShippingTriggered = false;

  if (isMetaActive && itemCount >= 3) {
    const numBundles = Math.floor(itemCount / 3);
    const avgFramePrice = subtotal / Math.max(1, itemCount);
    const standard3Sum = avgFramePrice * 3;
    if (standard3Sum > bundle3Price) {
      bundleDiscount = Math.round((standard3Sum - bundle3Price) * numBundles);
    }
    if (bundle3FreeShipping) {
      bundleFreeShippingTriggered = true;
    }
  }

  const effectiveDiscount = Math.max(bulkDiscount, bundleDiscount);
  const effectiveSubtotal = Math.max(0, subtotal - effectiveDiscount - couponDiscount);

  let deliveryCharge = 0;
  if (subtotal > 0) {
    if (forceFreeShipping || bundleFreeShippingTriggered || effectiveSubtotal >= freeThreshold) {
      deliveryCharge = 0;
    } else {
      deliveryCharge = flatRate;
    }
  }

  const grandTotal = Math.max(0, effectiveSubtotal + deliveryCharge);

  return {
    itemCount,
    subtotal,
    bulkDiscount: effectiveDiscount,
    isBundleOfferApplied: bundleDiscount > bulkDiscount,
    couponDiscount,
    deliveryCharge,
    grandTotal
  };
}

export function calculateBogoDiscount(cart: { price: number; quantity?: number }[]): {
  eligible: boolean;
  freeCount: number;
  discount: number;
  message: string;
} {
  const unitPrices: number[] = [];
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

  // Sort prices ascending: cheapest items are discounted 100%
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


