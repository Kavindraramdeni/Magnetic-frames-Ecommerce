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

  // Display count for top badge matching mockup: "500 PIECES IN CART"
  const displayCartQty = totalCartQty > 0 ? totalCartQty : (selectedBatchQty > 0 ? selectedBatchQty : 0);

  return (
    <div className="w-full bg-[#050505] text-white rounded-3xl p-6 sm:p-7 border border-[#222222] shadow-[0_16px_45px_rgba(0,0,0,0.7)] font-sans antialiased select-none transition-all">
      
      {/* Top Status Pill: e.g. "500 PIECES IN CART" */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center justify-center px-5 py-1.5 rounded-full bg-[#032313] border border-[#0A4D27] text-[#05DF72] text-xs font-mono font-bold tracking-wider uppercase shadow-xs">
          {displayCartQty > 0
            ? `${displayCartQty.toLocaleString('en-IN')} PIECES IN CART`
            : 'MIX MODELS IN CART'}
        </div>
      </div>

      {/* Reference Benchmark Prices */}
      <div className="space-y-3.5 text-sm sm:text-base">
        {/* Reseller price */}
        <div className="flex items-center justify-between text-[#E0E0E0]">
          <span className="font-normal">Reseller price</span>
          <span className="font-mono line-through text-[#8E8E8E] text-base sm:text-lg">
            {formatRupee(resellerPrice)}
          </span>
        </div>

        {/* Factory direct price */}
        <div className="flex items-center justify-between text-[#E0E0E0]">
          <span className="font-normal">Factory direct price</span>
          <span className={`font-mono text-base sm:text-lg ${hasVolumeDiscount ? 'line-through text-[#8E8E8E]' : 'text-[#E0E0E0]'}`}>
            {formatRupee(factoryBasePrice)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#1C1C1C] my-5" />

      {/* Highlighted Unlocked Price */}
      <div className="space-y-1">
        <div className="text-[#05DF72] font-bold text-xs sm:text-sm tracking-wider uppercase">
          YOUR DISCOUNTED PRICE
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-bold text-[#05DF72] font-mono tracking-tight">
            {formatRupee(currentPrice)}
          </span>
          <span className="text-sm sm:text-base text-[#E0E0E0] font-normal">
            per piece
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#1C1C1C] my-5" />

      {/* Next Tier Milestone Upsell */}
      {nextTier ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base sm:text-lg">
              Add {piecesNeeded.toLocaleString('en-IN')} more piece{piecesNeeded !== 1 ? 's' : ''}
            </span>
            <span className="font-bold text-[#05DF72] text-xl sm:text-2xl font-mono">
              {formatRupee(nextTierPrice)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-snug">
            Unlock an even lower price by reaching {nextMilestoneQty.toLocaleString('en-IN')} pieces in your cart!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-base sm:text-lg">
              Maximum Volume Tier Unlocked
            </span>
            <span className="font-bold text-[#05DF72] text-xl sm:text-2xl font-mono">
              {formatRupee(currentPrice)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-400 font-normal leading-snug">
            🎉 You have unlocked our lowest factory-direct manufacturing rate!
          </p>
        </div>
      )}

    </div>
  );
};

export default KriaPriceTag;
