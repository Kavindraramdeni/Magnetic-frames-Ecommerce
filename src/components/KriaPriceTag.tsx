import React from 'react';
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

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1D1D1F] rounded-3xl p-6 sm:p-7 border border-[#E8DFD5] shadow-[0_8px_30px_rgba(30,27,24,0.05)] font-sans antialiased select-none transition-all space-y-5">
      
      {/* 1. Reference Benchmark Prices (Apple-style clean rows) */}
      <div className="space-y-3 text-sm sm:text-base">
        {/* Reseller price */}
        <div className="flex items-center justify-between">
          <span className="text-[#6E6E73] font-normal">Reseller price</span>
          <span className="font-mono line-through text-[#86868B] text-base sm:text-lg">
            {formatRupee(resellerPrice)}
          </span>
        </div>

        {/* Factory direct price */}
        <div className="flex items-center justify-between">
          <span className="text-[#6E6E73] font-normal">Factory direct price</span>
          <span className={`font-mono text-base sm:text-lg ${hasVolumeDiscount ? 'line-through text-[#86868B]' : 'text-[#1D1D1F]'}`}>
            {formatRupee(factoryBasePrice)}
          </span>
        </div>
      </div>

      {/* Subtle Hairline Divider */}
      <div className="border-t border-[#E8DFD5]" />

      {/* 2. Highlighted Discounted Price Tag + (Pieces in Cart) beside it */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-bold tracking-wider uppercase">
            YOUR DISCOUNTED PRICE
          </span>
          <span className="text-xs sm:text-sm font-semibold text-emerald-800 tracking-tight">
            ({displayCartQty > 0 ? `${displayCartQty.toLocaleString('en-IN')} pieces in cart` : 'mix models in cart'})
          </span>
        </div>

        {/* Large Apple-style Price Number */}
        <div className="flex items-baseline gap-2.5 flex-wrap pt-0.5">
          <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] font-mono">
            {formatRupee(currentPrice)}
          </span>
          <span className="text-sm sm:text-base text-[#6E6E73] font-normal">
            per piece
          </span>
        </div>
      </div>

      {/* Subtle Hairline Divider */}
      <div className="border-t border-[#E8DFD5]" />

      {/* 3. Next Tier Milestone Upsell Callout (Apple-style subtle box) */}
      {nextTier ? (
        <div className="p-4 sm:p-4.5 rounded-2xl bg-white border border-[#E8DFD5] shadow-xs space-y-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-[#1D1D1F] text-base sm:text-lg">
              Add {piecesNeeded.toLocaleString('en-IN')} more piece{piecesNeeded !== 1 ? 's' : ''}
            </span>
            <span className="font-bold text-emerald-700 text-xl sm:text-2xl font-mono">
              {formatRupee(nextTierPrice)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6E6E73] font-normal leading-relaxed">
            Unlock an even lower price by reaching {nextMilestoneQty.toLocaleString('en-IN')} pieces in your cart!
          </p>
        </div>
      ) : (
        <div className="p-4 sm:p-4.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold text-emerald-900 text-base sm:text-lg">
              Maximum Volume Tier Unlocked
            </span>
            <span className="font-bold text-emerald-800 text-xl sm:text-2xl font-mono">
              {formatRupee(currentPrice)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-700 font-normal leading-relaxed">
            🎉 You have unlocked our lowest factory-direct manufacturing rate!
          </p>
        </div>
      )}

    </div>
  );
};

export default KriaPriceTag;
