import React from 'react';
import { ShoppingCart, Sparkles, Info } from 'lucide-react';
import {
  ProductVariantPricingConfig,
  DEFAULT_PRODUCT_PRICING_CONFIGS,
  findPricingConfig,
  getTierRateForQuantity
} from '../pricingEngine.ts';

interface KriaPriceTagProps {
  productId: string;
  sizeLabel: string;
  totalCartQty: number;
  selectedBatchQty: number;
  totalPrice?: number;
  factorySavings?: number;
  onAddToCart?: () => void;
  configs?: ProductVariantPricingConfig[];
}

function formatRupee(val: number): string {
  const formatted = val % 1 === 0 ? val.toString() : val.toFixed(2);
  return `₹${formatted}/-`;
}

export const KriaPriceTag: React.FC<KriaPriceTagProps> = ({
  productId,
  sizeLabel,
  totalCartQty,
  selectedBatchQty,
  totalPrice,
  factorySavings,
  onAddToCart,
  configs = DEFAULT_PRODUCT_PRICING_CONFIGS
}) => {
  const config = findPricingConfig(productId, sizeLabel, configs);

  // Fallback benchmark prices if config not found
  const resellerPrice = config?.originalPrice || 79;
  const factoryBasePrice = config?.regularPrice || 28;

  // The active qualifying pieces:
  // If cart already has items, they pool together.
  // Otherwise, the active batch selection gives the qualifying tier.
  const qualifyingQty = Math.max(totalCartQty, selectedBatchQty);

  // Current unlocked tier unit rate
  const currentRateInfo = config
    ? getTierRateForQuantity(config, qualifyingQty)
    : { unitPrice: factoryBasePrice, unlockedMinQty: 0 };
  const currentPrice = currentRateInfo.unitPrice;

  // Look for next tier milestone
  const sortedTiers = config ? [...config.tiers].sort((a, b) => a.minQty - b.minQty) : [];
  const nextTier = sortedTiers.find((t) => t.minQty > qualifyingQty);

  const piecesNeeded = nextTier ? Math.max(0, nextTier.minQty - qualifyingQty) : 0;
  const nextTierPrice = nextTier ? nextTier.price : currentPrice;
  const nextMilestoneQty = nextTier ? nextTier.minQty : qualifyingQty;

  const hasVolumeDiscount = currentPrice < factoryBasePrice || qualifyingQty >= 50;

  // Display count for the pieces in cart badge beside discounted price tag
  const displayCartQty = totalCartQty > 0 ? totalCartQty : (selectedBatchQty > 0 ? selectedBatchQty : 0);

  // Batch calculations
  const calculatedTotalPrice = typeof totalPrice === 'number'
    ? totalPrice
    : Math.round(currentPrice * selectedBatchQty * 100) / 100;

  const calculatedSavings = typeof factorySavings === 'number'
    ? factorySavings
    : Math.round(((resellerPrice * selectedBatchQty) - calculatedTotalPrice) * 100) / 100;

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1D1D1F] rounded-3xl p-6 sm:p-7 border border-[#E8DFD5] shadow-[0_8px_30px_rgba(30,27,24,0.05)] font-sans antialiased select-none transition-all space-y-4.5">
      
      {/* 1. Reference Benchmark Prices (Apple-style clean rows) */}
      <div className="space-y-2.5 text-sm sm:text-base">
        {/* Reseller price */}
        <div className="flex items-center justify-between">
          <span className="text-[#6E6E73] font-normal">Reseller price</span>
          <span className="line-through text-[#86868B] text-base sm:text-lg font-medium font-sans">
            {formatRupee(resellerPrice)}
          </span>
        </div>

        {/* Factory direct price */}
        <div className="flex items-center justify-between">
          <span className="text-[#6E6E73] font-normal">Factory direct price</span>
          <span className={`text-base sm:text-lg font-medium font-sans ${hasVolumeDiscount ? 'line-through text-[#86868B]' : 'text-[#1D1D1F]'}`}>
            {formatRupee(factoryBasePrice)}
          </span>
        </div>
      </div>

      {/* Subtle Hairline Divider */}
      <div className="border-t border-[#E8DFD5]" />

      {/* 2. Highlighted Discounted Price Tag + (Pieces in Cart) beside it */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-bold tracking-wider uppercase">
            YOUR DISCOUNTED PRICE
          </span>
          <span className="text-xs sm:text-sm font-semibold text-emerald-800 tracking-tight">
            ({displayCartQty > 0 ? `${displayCartQty.toLocaleString('en-IN')} pieces in cart` : 'mix models in cart'})
          </span>
        </div>

        {/* Large Apple-style Price Number */}
        <div className="flex items-baseline gap-2.5 flex-wrap pt-0.5">
          <span className="text-4xl sm:text-[44px] font-bold tracking-tight text-[#1D1D1F] font-sans">
            {formatRupee(currentPrice)}
          </span>
          <span className="text-sm sm:text-base text-[#6E6E73] font-normal">
            per piece
          </span>
        </div>
      </div>

      {/* 3. Next Tier Milestone Upsell Callout (Compact Apple-style box) */}
      {nextTier ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8DFD5] shadow-xs space-y-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-[#1D1D1F] text-sm sm:text-base">
              Add {piecesNeeded.toLocaleString('en-IN')} more piece{piecesNeeded !== 1 ? 's' : ''}
            </span>
            <span className="font-bold text-emerald-700 text-lg sm:text-xl font-sans">
              {formatRupee(nextTierPrice)}
            </span>
          </div>
          <p className="text-xs text-[#6E6E73] font-normal leading-tight">
            Unlock an even lower price by reaching {nextMilestoneQty.toLocaleString('en-IN')} pieces in your cart!
          </p>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-emerald-900 text-sm sm:text-base">
              Maximum Volume Tier Unlocked
            </span>
            <span className="font-bold text-emerald-800 text-lg sm:text-xl font-sans">
              {formatRupee(currentPrice)}
            </span>
          </div>
          <p className="text-xs text-emerald-700 font-normal leading-tight">
            🎉 You have unlocked our lowest factory-direct manufacturing rate!
          </p>
        </div>
      )}

      {/* Subtle Hairline Divider */}
      <div className="border-t border-[#E8DFD5]" />

      {/* 4. Batch Order Total & Savings Summary (Merged from Box 2) */}
      <div className="space-y-2.5 pt-0.5">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-[#5A4D3E]">
            Selected Batch Total ({selectedBatchQty} pcs):
          </span>
          <strong className="text-xl sm:text-2xl text-[#1E1B18] font-bold font-sans">
            ₹{calculatedTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: calculatedTotalPrice % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}
          </strong>
        </div>

        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-900 text-xs sm:text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Factory Direct Savings vs Retail:</span>
          </span>
          <strong className="font-bold text-emerald-800 text-sm sm:text-base font-sans">
            ₹{calculatedSavings.toLocaleString('en-IN', { minimumFractionDigits: calculatedSavings % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* 5. Primary Action: Add to Cart */}
      {onAddToCart && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onAddToCart}
            className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-[#1E1B18] hover:bg-[#8C6436] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.14em] shadow-md hover:shadow-xl hover:scale-[1.008] active:scale-[0.99] transition-all cursor-pointer group"
          >
            <ShoppingCart className="h-4.5 w-4.5 text-[#E5D7C5] group-hover:scale-110 transition-transform" />
            <span>Add to Cart ({selectedBatchQty} pcs)</span>
          </button>
        </div>
      )}

      {/* 6. Wholesale Combined Order Guidance Note */}
      <div className="flex items-start gap-2 pt-0.5 text-[11px] text-[#7A6B5D] leading-relaxed">
        <Info className="h-3.5 w-3.5 shrink-0 text-[#8C6436] mt-0.5" />
        <span>
          Mix multiple shapes and sizes in your cart! When your order reaches <strong>50 pcs total</strong>, tap <strong>"Order All on WhatsApp"</strong> from the cart to finalize.
        </span>
      </div>

    </div>
  );
};

export default KriaPriceTag;
