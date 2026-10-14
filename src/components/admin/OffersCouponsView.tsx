import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Plus, Trash2, CheckCircle, AlertTriangle, ExternalLink, Percent, DollarSign, Layers } from 'lucide-react';

interface OffersCouponsViewProps {
  adminToken: string;
}

export default function OffersCouponsView({ adminToken }: OffersCouponsViewProps) {
  const [activeTab, setActiveTab] = useState<'bundles' | 'coupons'>('bundles');
  const [bundleForm, setBundleForm] = useState({
    bundlePrice: 799,
    quantity: 3,
    freeShipping: true,
    live: true,
    stackableCoupons: false,
    unitEstimatedCost: 165 // INR per frame (Acrylic plates + 4x6 print + gift packaging)
  });
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    type: 'percent',
    value: 10,
    label: 'Studio Special Discount',
    minOrderValue: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (e) {
      console.warn('Coupons fetch notice:', e);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/admin/offers', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.offers && data.offers[0]) {
          const off = data.offers[0];
          setBundleForm({
            bundlePrice: off.bundlePrice || 799,
            quantity: off.quantity || 3,
            freeShipping: off.freeShipping !== false,
            live: off.live !== false,
            stackableCoupons: off.stackableCoupons === true,
            unitEstimatedCost: 165
          });
        }
      }
    } catch (e) {
      console.warn('Offers fetch notice:', e);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchOffers();
  }, [adminToken]);

  const handleSaveBundle = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(bundleForm)
      });
      if (res.ok) {
        setFeedback('Meta Ads bundle promotion saved and live across store!');
        setTimeout(() => setFeedback(null), 3500);
      } else {
        alert('Failed saving bundle offer.');
      }
    } catch (e: any) {
      alert(e.message || 'Error updating offer.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponForm.code.trim()) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          ...newCouponForm,
          code: newCouponForm.code.toUpperCase().trim()
        })
      });
      if (res.ok) {
        setFeedback(`Coupon code ${newCouponForm.code.toUpperCase()} created.`);
        setTimeout(() => setFeedback(null), 3500);
        setNewCouponForm({ code: '', type: 'percent', value: 10, label: 'Discount', minOrderValue: 0 });
        fetchCoupons();
      } else {
        alert('Failed creating coupon.');
      }
    } catch (e: any) {
      alert(e.message || 'Error creating coupon.');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Delete coupon code ${code}?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting coupon.');
    }
  };

  // Margin Check Calculations
  const totalProductionCost = bundleForm.quantity * bundleForm.unitEstimatedCost;
  const estimatedShippingCost = bundleForm.freeShipping ? 55 : 0;
  const totalCost = totalProductionCost + estimatedShippingCost;
  const grossProfit = bundleForm.bundlePrice - totalCost;
  const grossMarginPercent = Math.round((grossProfit / (bundleForm.bundlePrice || 1)) * 100);
  const isMarginWarning = grossMarginPercent < 25;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#B09A84] flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            CAMPAIGNS & PROMOTIONS
          </span>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900 mt-1">
            Offers & Coupons Console
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage Meta Ads launch bundle pricing, coupon usage thresholds, and real-time margin protections.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              activeTab === 'bundles'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            Meta Ads Bundle Offers
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            Discount Coupons ({coupons.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {activeTab === 'bundles' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bundle Config Form */}
          <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-sans font-bold text-base text-neutral-900">
                  Meta Ads Launch Bundle Promotion
                </h3>
                <span className="text-xs text-neutral-500">
                  Customer selects any 3 frames and receives automatic bundle pricing at checkout.
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${bundleForm.live ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
                {bundleForm.live ? 'PROMO ACTIVE' : 'PROMO PAUSED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Bundle Frame Quantity:</label>
                <input
                  type="number"
                  value={bundleForm.quantity}
                  onChange={(e) => setBundleForm({ ...bundleForm, quantity: parseInt(e.target.value) || 3 })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Bundle Selling Price (INR):</label>
                <input
                  type="number"
                  value={bundleForm.bundlePrice}
                  onChange={(e) => setBundleForm({ ...bundleForm, bundlePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono font-bold text-sm text-neutral-900"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bundleForm.freeShipping}
                  onChange={(e) => setBundleForm({ ...bundleForm, freeShipping: e.target.checked })}
                  className="h-4 w-4 rounded accent-neutral-900"
                />
                <span className="text-xs font-semibold text-neutral-800">
                  Unlock Free Shipping automatically when this bundle is in cart
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bundleForm.live}
                  onChange={(e) => setBundleForm({ ...bundleForm, live: e.target.checked })}
                  className="h-4 w-4 rounded accent-neutral-900"
                />
                <span className="text-xs font-semibold text-neutral-800">
                  Promotion is live on storefront & checkout calculations
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bundleForm.stackableCoupons}
                  onChange={(e) => setBundleForm({ ...bundleForm, stackableCoupons: e.target.checked })}
                  className="h-4 w-4 rounded accent-neutral-900"
                />
                <span className="text-xs font-semibold text-neutral-800">
                  Allow additional coupon stacking on top of bundle discount (Default: Disabled)
                </span>
              </label>
            </div>

            {/* Ad Landing Page Deep-Link */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                Instagram / Meta Ads Destination URL:
              </span>
              <div className="flex items-center justify-between gap-2 font-mono text-neutral-800 bg-white p-2.5 rounded-xl border border-neutral-300">
                <span>https://kriastudio.in/?offer=meta3pack&utm_source=meta&utm_campaign=launch</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('https://kriastudio.in/?offer=meta3pack&utm_source=meta&utm_campaign=launch');
                    alert('Copied Meta Ads URL to clipboard!');
                  }}
                  className="text-neutral-500 hover:text-black font-sans font-bold text-xs"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveBundle}
                disabled={isSaving}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save & Publish Bundle Rules'}
              </button>
            </div>
          </div>

          {/* Real-Time Margin Check Card */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4 text-xs h-fit">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <h4 className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider">
                Automated Margin Check
              </h4>
            </div>

            <div className="space-y-2 text-neutral-600">
              <div className="flex justify-between">
                <span>Estimated Unit Cost (3 frames):</span>
                <span className="font-mono text-neutral-900">₹{totalProductionCost} (₹165 × 3)</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shiprocket Freight:</span>
                <span className="font-mono text-neutral-900">₹{estimatedShippingCost}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-neutral-100 pt-2 text-neutral-900">
                <span>Total Fulfillment Cost:</span>
                <span className="font-mono">₹{totalCost}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl">
                <span>Net Gross Margin:</span>
                <span className="font-mono">₹{grossProfit} ({grossMarginPercent}%)</span>
              </div>
            </div>

            {isMarginWarning ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Margin Warning:</strong> Offer gross margin is below the 25% safety threshold. Consider raising bundle price or requiring shipping fee.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Healthy margin confirmed for paid Meta ad scaling.</span>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Coupons Tab */
        <div className="space-y-6">
          
          {/* Create Coupon Card */}
          <form onSubmit={handleCreateCoupon} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm">Add New Promo Coupon</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Coupon Code:</label>
                <input
                  type="text"
                  value={newCouponForm.code}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value })}
                  placeholder="e.g. KRIA20"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono uppercase font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Discount Type:</label>
                <select
                  value={newCouponForm.type}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, type: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
                >
                  <option value="percent">Percentage Off (%)</option>
                  <option value="flat">Flat Amount (INR)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Discount Value:</label>
                <input
                  type="number"
                  value={newCouponForm.value}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, value: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono font-bold"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>
            </div>
          </form>

          {/* Existing Coupons Table */}
          <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-5">Code</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Discount</th>
                  <th className="py-3 px-5">Label</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-neutral-50/70 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-neutral-900">{c.code}</td>
                    <td className="py-3.5 px-5 capitalize text-neutral-600">{c.type.replace('_', ' ')}</td>
                    <td className="py-3.5 px-5 font-bold font-mono text-emerald-800">
                      {c.type === 'percent' ? `${c.value}% OFF` : c.type === 'flat' ? `₹${c.value} OFF` : 'Free Delivery'}
                    </td>
                    <td className="py-3.5 px-5 text-neutral-600">{c.label}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.code)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
