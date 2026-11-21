import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Layers } from 'lucide-react';
import {
  ProductVariantPricingConfig,
  findPricingConfig,
  getTierRateForQuantity,
  DEFAULT_PRODUCT_PRICING_CONFIGS
} from '../pricingEngine.ts';

interface WholesalePriceTableProps {
  productId: string;
  productName: string;
  sizeLabel: string;
  totalCartQty: number;
  configs?: ProductVariantPricingConfig[];
}

export const WholesalePriceTable: React.FC<WholesalePriceTableProps> = ({
  productId,
  productName,
  sizeLabel,
  totalCartQty,
  configs = DEFAULT_PRODUCT_PRICING_CONFIGS
}) => {
  const config = findPricingConfig(productId, sizeLabel, configs);

  if (!config) {
    return null;
  }

  // Determine current unlocked tier and rate
  const { unitPrice: currentUnlockedPrice, unlockedMinQty } = getTierRateForQuantity(config, totalCartQty);

  // Find next tier for milestone suggestion
  const sortedTiers = [...config.tiers].sort((a, b) => a.minQty - b.minQty);
  let nextTier = null;
  for (const t of sortedTiers) {
    if (t.minQty > totalCartQty) {
      nextTier = t;
      break;
    }
  }

  const piecesNeededForNext = nextTier ? nextTier.minQty - totalCartQty : 0;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E8DACB] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#FAF0E2] border border-[#E9D6BE] flex items-center justify-center text-[#8C6436]">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-[#1E1B18]">
              Combined Cart Wholesale Price Table
            </h4>
            <p className="text-[11px] font-mono text-[#8C7A68]">
              Mix models &amp; sizes · Total pieces in cart unlocks lower rates
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
          Factory Direct Matrix
        </span>
      </div>

      {/* Dynamic Cart Status Callout */}
      {totalCartQty > 0 ? (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-[#FAF7F2] to-amber-50 border border-emerald-200 text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-emerald-950 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Your current cart quantity: <strong>{totalCartQty} pieces</strong>
            </span>
            <span className="text-emerald-800 font-bold bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
              Your {productName} ({sizeLabel}) price: ₹{currentUnlockedPrice % 1 === 0 ? currentUnlockedPrice : currentUnlockedPrice.toFixed(2)}/pc
            </span>
          </div>

          {nextTier ? (
            <p className="text-[11px] text-[#7A6348] flex items-center gap-1 pt-1 border-t border-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>
                Add <strong>{piecesNeededForNext} more pieces</strong> (mix any models) to unlock <strong>₹{nextTier.price % 1 === 0 ? nextTier.price : nextTier.price.toFixed(2)}/pc</strong>!
              </span>
            </p>
          ) : (
            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-1 border-t border-emerald-100">
              🎉 Maximum wholesale volume tier unlocked!
            </p>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-[#FAF5EE] border border-[#E9D9C8] text-xs font-mono text-[#6E5D4B] space-y-1">
          <div className="flex items-center justify-between">
            <span>Original Market MRP:</span>
            <strong className="text-[#1E1B18] font-serif text-sm line-through">₹{config.originalPrice || 79}/pc</strong>
          </div>
          <p className="text-[11px] text-[#8C6436]">
            💡 Add 50 pieces (mix any models) to unlock factory wholesale rates from <strong>₹{sortedTiers.find(t => t.minQty === 50)?.price || currentUnlockedPrice}/pc</strong> (Save ₹{Math.max(0, (config.originalPrice || 79) - (sortedTiers.find(t => t.minQty === 50)?.price || currentUnlockedPrice)).toFixed(2)}/pc vs MRP).
          </p>
        </div>
      )}

      {/* Pricing Table */}
      <div className="overflow-hidden rounded-2xl border border-[#EFE4D6]">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="bg-[#FAF3EA] border-b border-[#EFE4D6] text-[11px] uppercase tracking-wider text-[#7A6B5C]">
              <th className="py-2.5 px-3 font-semibold">Total Cart Quantity</th>
              <th className="py-2.5 px-3 font-semibold text-right">Price Per Piece</th>
              <th className="py-2.5 px-3 font-semibold text-right hidden sm:table-cell">Savings vs MRP</th>
              <th className="py-2.5 px-3 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3EAE0]">
            {sortedTiers.map((tier) => {
              const isUnlocked = totalCartQty >= tier.minQty;
              const isCurrentBest = unlockedMinQty === tier.minQty;
              const referencePrice = config.originalPrice || config.regularPrice;
              const savingsPerPc = Math.max(0, referencePrice - tier.price);

              return (
                <tr
                  key={tier.minQty}
                  className={`transition-colors ${
                    isCurrentBest && totalCartQty > 0
                      ? 'bg-amber-100/70 font-bold text-[#1E1B18]'
                      : isUnlocked && totalCartQty > 0
                      ? 'bg-emerald-50/40 text-[#4A3E31]'
                      : 'bg-white text-[#524536] hover:bg-[#FAF6F0]'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center gap-1.5">
                    {tier.minQty === 0 ? (
                      <span>Below 50 pcs (Regular)</span>
                    ) : (
                      <span>{tier.minQty.toLocaleString('en-IN')}+ pieces</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-serif text-sm">
                    ₹{tier.price % 1 === 0 ? tier.price : tier.price.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right hidden sm:table-cell text-emerald-700 font-semibold">
                    {savingsPerPc > 0 ? `Save ₹${savingsPerPc % 1 === 0 ? savingsPerPc : savingsPerPc.toFixed(2)}/pc` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {isCurrentBest && totalCartQty > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : isUnlocked && totalCartQty > 0 ? (
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">
                        {tier.minQty === 0 ? 'Regular' : `Need ${Math.max(0, tier.minQty - totalCartQty)} more`}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WholesalePriceTable;
