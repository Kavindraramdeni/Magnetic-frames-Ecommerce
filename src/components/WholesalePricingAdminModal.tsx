import React, { useState } from 'react';
import { X, Plus, Trash2, Save, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import {
  ProductVariantPricingConfig,
  WholesaleTier,
  DEFAULT_PRODUCT_PRICING_CONFIGS
} from '../pricingEngine.ts';

interface WholesalePricingAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  configs: ProductVariantPricingConfig[];
  onSaveConfig: (updatedConfig: ProductVariantPricingConfig) => Promise<boolean>;
}

export const WholesalePricingAdminModal: React.FC<WholesalePricingAdminModalProps> = ({
  isOpen,
  onClose,
  configs,
  onSaveConfig
}) => {
  if (!isOpen) return null;

  // Selected product and size
  const [selectedProductId, setSelectedProductId] = useState<string>(configs[0]?.productId || 'square');
  
  // Available sizes for the selected product
  const availableSizes = configs
    .filter((c) => c.productId === selectedProductId)
    .map((c) => c.sizeLabel);

  const [selectedSizeLabel, setSelectedSizeLabel] = useState<string>(availableSizes[0] || '2 × 2"');

  // Currently active config in editor
  const currentConfig = configs.find(
    (c) => c.productId === selectedProductId && c.sizeLabel === selectedSizeLabel
  ) || configs[0];

  // Editor form state
  const [regularPrice, setRegularPrice] = useState<number>(currentConfig ? currentConfig.regularPrice : 28);
  const [eligibleForCombinedQty, setEligibleForCombinedQty] = useState<boolean>(
    currentConfig ? currentConfig.eligibleForCombinedQty !== false : true
  );
  const [tiers, setTiers] = useState<WholesaleTier[]>(
    currentConfig ? [...currentConfig.tiers] : []
  );

  // New tier inputs
  const [newMinQty, setNewMinQty] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // When changing product, reset selected size
  const handleProductChange = (newProdId: string) => {
    setSelectedProductId(newProdId);
    const sizes = configs.filter((c) => c.productId === newProdId).map((c) => c.sizeLabel);
    const nextSize = sizes[0] || '';
    setSelectedSizeLabel(nextSize);
    
    const nextConf = configs.find((c) => c.productId === newProdId && c.sizeLabel === nextSize);
    if (nextConf) {
      setRegularPrice(nextConf.regularPrice);
      setEligibleForCombinedQty(nextConf.eligibleForCombinedQty !== false);
      setTiers([...nextConf.tiers]);
    }
  };

  // When changing size, load its config
  const handleSizeChange = (newSize: string) => {
    setSelectedSizeLabel(newSize);
    const nextConf = configs.find((c) => c.productId === selectedProductId && c.sizeLabel === newSize);
    if (nextConf) {
      setRegularPrice(nextConf.regularPrice);
      setEligibleForCombinedQty(nextConf.eligibleForCombinedQty !== false);
      setTiers([...nextConf.tiers]);
    }
  };

  const handleUpdateTierPrice = (minQty: number, priceStr: string) => {
    const val = parseFloat(priceStr);
    const safePrice = isNaN(val) ? 0 : Math.max(0, val);
    setTiers((prev) =>
      prev.map((t) => (t.minQty === minQty ? { ...t, price: safePrice } : t))
    );
  };

  const handleRemoveTier = (minQty: number) => {
    if (minQty === 0) return; // Prevent removing baseline tier
    setTiers((prev) => prev.filter((t) => t.minQty !== minQty));
  };

  const handleAddTier = () => {
    const qty = parseInt(newMinQty, 10);
    const prc = parseFloat(newPrice);
    if (isNaN(qty) || qty <= 0) {
      setStatusMessage({ text: 'Please enter a valid minimum quantity > 0', type: 'error' });
      return;
    }
    if (isNaN(prc) || prc < 0) {
      setStatusMessage({ text: 'Please enter a valid price >= 0', type: 'error' });
      return;
    }

    const existing = tiers.find((t) => t.minQty === qty);
    if (existing) {
      setTiers((prev) =>
        prev.map((t) => (t.minQty === qty ? { ...t, price: prc, label: `${qty}+ pcs` } : t))
      );
    } else {
      const updated = [...tiers, { minQty: qty, price: prc, label: `${qty}+ pcs` }].sort(
        (a, b) => a.minQty - b.minQty
      );
      setTiers(updated);
    }

    setNewMinQty('');
    setNewPrice('');
    setStatusMessage({ text: `Added tier for ${qty}+ pieces`, type: 'success' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const updatedConfig: ProductVariantPricingConfig = {
        productId: selectedProductId,
        sizeLabel: selectedSizeLabel,
        regularPrice: Number(regularPrice) || 0,
        eligibleForCombinedQty,
        tiers: tiers.sort((a, b) => a.minQty - b.minQty)
      };

      const success = await onSaveConfig(updatedConfig);
      if (success) {
        setStatusMessage({ text: 'Pricing tiers saved successfully!', type: 'success' });
      } else {
        setStatusMessage({ text: 'Saved locally (backend unreachable)', type: 'success' });
      }
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e: any) {
      setStatusMessage({ text: e?.message || 'Error saving tiers', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8DACB] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#E8DACB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FAF1E3] flex items-center justify-center border border-[#E9D7C1] text-[#8C6436]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1E1B18]">
                Admin Wholesale Pricing Management
              </h3>
              <p className="text-xs font-mono text-[#8C7A68]">
                Configure independent tier rates &amp; combined cart eligibility
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Product & Variant Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[#6E5D4B] font-semibold">Select Product:</label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D8C7B5] bg-white text-[#1E1B18] font-mono text-xs focus:ring-2 focus:ring-[#8C6436] outline-none"
              >
                <option value="square">Minimal Square</option>
                <option value="rectangle">Classic Rectangle</option>
                <option value="circle">Minimal Circle</option>
                <option value="heart">Sculpted Heart</option>
                <option value="keychain">Acrylic Keychains</option>
              </select>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-[#6E5D4B] font-semibold">Select Size Variant:</label>
              <select
                value={selectedSizeLabel}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D8C7B5] bg-white text-[#1E1B18] font-mono text-xs focus:ring-2 focus:ring-[#8C6436] outline-none"
              >
                {availableSizes.map((sz) => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Global Settings for Variant */}
          <div className="p-4 rounded-2xl bg-white border border-[#E9D9C8] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-[#524536] font-semibold">Regular Baseline Price (Below 50 pcs):</label>
              <div className="flex items-center gap-1.5">
                <span className="text-[#7A6A59]">₹</span>
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 px-2.5 py-1 rounded-lg border border-[#D8C7B5] bg-[#FAF8F5] text-right font-serif text-sm font-bold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#F2E8DC] flex items-center justify-between">
              <div>
                <label className="text-[#1E1B18] font-bold block">
                  Eligible for Combined Cart Quantity
                </label>
                <span className="text-[11px] text-[#8C7A68]">
                  When checked, pieces of this product count toward unlocking cart-wide wholesale tiers.
                </span>
              </div>
              <input
                type="checkbox"
                checked={eligibleForCombinedQty}
                onChange={(e) => setEligibleForCombinedQty(e.target.checked)}
                className="h-5 w-5 accent-[#8C6436] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Wholesale Quantity Tiers Editor */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#1E1B18] uppercase tracking-wider text-[11px]">
                Wholesale Volume Price Tiers
              </h4>
              <span className="text-[11px] text-[#8C7A68]">Independent per-product pricing</span>
            </div>

            <div className="rounded-2xl border border-[#E9D9C8] overflow-hidden bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FAF3EA] border-b border-[#E9D9C8] text-[10px] uppercase text-[#7A6A59]">
                    <th className="py-2 px-3">Min Qty</th>
                    <th className="py-2 px-3">Tier Label</th>
                    <th className="py-2 px-3 text-right">Price / Pc (₹)</th>
                    <th className="py-2 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EAE0]">
                  {tiers.map((t) => (
                    <tr key={t.minQty} className="hover:bg-[#FAF6F0]">
                      <td className="py-2 px-3 font-semibold text-[#1E1B18]">
                        {t.minQty === 0 ? '0 (Regular)' : `${t.minQty}+ pcs`}
                      </td>
                      <td className="py-2 px-3 text-[#7A6A59]">
                        {t.label || `${t.minQty}+ pcs`}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step={0.5}
                          min={0}
                          value={t.price}
                          onChange={(e) => handleUpdateTierPrice(t.minQty, e.target.value)}
                          className="w-20 px-2 py-1 rounded border border-[#D8C7B5] bg-[#FAF8F5] text-right font-serif text-xs font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        {t.minQty > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(t.minQty)}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove Tier"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-300">Default</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Quantity Tier Form */}
          <div className="p-4 rounded-2xl bg-[#F6F1EA] border border-[#E9D7C3] space-y-2 font-mono text-xs">
            <span className="font-bold text-[#524434] block">Add New Quantity Tier:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                min={1}
                placeholder="Min Qty (e.g. 5000)"
                value={newMinQty}
                onChange={(e) => setNewMinQty(e.target.value)}
                className="w-36 px-3 py-1.5 rounded-lg border border-[#D8C7B5] bg-white text-xs outline-none"
              />
              <input
                type="number"
                step={0.5}
                min={0}
                placeholder="Price / Pc (₹)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-32 px-3 py-1.5 rounded-lg border border-[#D8C7B5] bg-white text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddTier}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8C6436] hover:bg-[#6E4F2B] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Tier</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E8DACB] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#D8C7B5] text-xs font-mono text-[#6E5D4B] hover:bg-stone-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E1B18] hover:bg-[#8C6436] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WholesalePricingAdminModal;
