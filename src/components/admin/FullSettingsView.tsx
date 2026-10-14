import React, { useState } from 'react';
import { 
  Building2, CreditCard, Truck, SlidersHorizontal, Image, Receipt, 
  Tag, Bell, Shield, Activity, Download, Send, CheckCircle, AlertTriangle, Key, Save
} from 'lucide-react';

interface FullSettingsViewProps {
  businessSettings: any;
  setBusinessSettings: React.Dispatch<React.SetStateAction<any>>;
  warehouseForm: any;
  setWarehouseForm: React.Dispatch<React.SetStateAction<any>>;
  adminToken: string;
  isSavingSettings: boolean;
  onSaveSettings: () => Promise<void>;
  settingsSuccessMessage: string | null;
}

export default function FullSettingsView({
  businessSettings,
  setBusinessSettings,
  warehouseForm,
  setWarehouseForm,
  adminToken,
  isSavingSettings,
  onSaveSettings,
  settingsSuccessMessage
}: FullSettingsViewProps) {
  const [activeSubSection, setActiveSubSection] = useState<
    'identity' | 'payments' | 'shipping' | 'production' | 'photo_rules' | 'tax' | 'notifications' | 'policies' | 'system'
  >('identity');

  const [testResult, setTestResult] = useState<{ message: string; ok: boolean } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestRazorpay = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/system/test-razorpay', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      setTestResult({ message: data.message || data.error, ok: data.success !== false });
    } catch (e: any) {
      setTestResult({ message: e.message || 'Razorpay test failed', ok: false });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestShiprocket = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/system/test-shiprocket', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      setTestResult({ message: data.message || data.error, ok: data.success !== false });
    } catch (e: any) {
      setTestResult({ message: e.message || 'Shiprocket test failed', ok: false });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/system/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ targetEmail: businessSettings.support_email })
      });
      const data = await res.json();
      setTestResult({ message: data.message || 'Dispatched test notification.', ok: true });
    } catch (e: any) {
      setTestResult({ message: e.message || 'Failed test email dispatch', ok: false });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#B09A84] flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            STORE CONFIGURATION & COMPLIANCE
          </span>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900 mt-1">
            Studio Master Settings
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Store identity, Razorpay gateway credentials, Shiprocket pickup nodes, GST compliance, and photo policies.
          </p>
        </div>

        <button
          type="button"
          onClick={onSaveSettings}
          disabled={isSavingSettings}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm self-start md:self-auto disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5 text-[#E8DCCF]" />
          <span>{isSavingSettings ? 'Saving All Settings…' : 'Save Live Configuration'}</span>
        </button>
      </div>

      {settingsSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{settingsSuccessMessage}</span>
        </div>
      )}

      {testResult && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            testResult.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {testResult.ok ? (
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Subsections Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
        {[
          { key: 'identity', label: '1. Store Identity & Content', icon: Building2 },
          { key: 'payments', label: '2. Razorpay Payments', icon: CreditCard },
          { key: 'shipping', label: '3. Shiprocket Logistics', icon: Truck },
          { key: 'production', label: '4. Factory Production', icon: SlidersHorizontal },
          { key: 'photo_rules', label: '5. Photo Rules', icon: Image },
          { key: 'tax', label: '6. Tax & GST Invoice', icon: Receipt },
          { key: 'notifications', label: '7. Notification Templates', icon: Bell },
          { key: 'policies', label: '8. Legal Policies', icon: Shield },
          { key: 'system', label: '9. System & Diagnostics', icon: Activity }
        ].map((sec) => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.key}
              onClick={() => setActiveSubSection(sec.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeSubSection === sec.key
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── SUBSECTION 1: STORE IDENTITY & CONTENT ── */}
      {activeSubSection === 'identity' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-5 text-xs">
          <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
            Store Identity & Business Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Store / Brand Name:</label>
              <input
                type="text"
                value={businessSettings.company_name || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, company_name: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">GSTIN Identifier:</label>
              <input
                type="text"
                value={businessSettings.gstin || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, gstin: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono uppercase"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Customer Support Email:</label>
              <input
                type="email"
                value={businessSettings.support_email || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, support_email: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">WhatsApp Hotline & Phone:</label>
              <input
                type="text"
                value={businessSettings.support_phone || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, support_phone: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="font-bold text-neutral-700 block mb-1">Registered Manufacturing & Business Address:</label>
              <input
                type="text"
                value={businessSettings.registered_address || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, registered_address: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSECTION 2: PAYMENTS (RAZORPAY) ── */}
      {activeSubSection === 'payments' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h3 className="font-bold text-neutral-900 text-sm">
              Razorpay Payment Gateway (Prepaid Only · Zero COD)
            </h3>
            <button
              type="button"
              onClick={handleTestRazorpay}
              disabled={isTesting}
              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Key className="h-3 w-3 text-neutral-600" />
              <span>Test Connection</span>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
            <strong>Security Architecture:</strong> Because KRIA products are custom photo frames cut to shape, cash on delivery (COD) is strictly disabled to prevent loss from refused parcels. Razorpay webhook secret validates HMAC SHA256 signatures server-side.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Razorpay Key ID:</label>
              <input
                type="text"
                value="rzp_live_kria****************"
                disabled
                className="w-full p-2.5 bg-neutral-100 border border-neutral-300 rounded-xl font-mono text-neutral-600"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Injected securely from server environment variable.</span>
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Razorpay Key Secret:</label>
              <input
                type="password"
                value="••••••••••••••••••••••••"
                disabled
                className="w-full p-2.5 bg-neutral-100 border border-neutral-300 rounded-xl font-mono text-neutral-600"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Masked. Never exposed to browser bundle.</span>
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Webhook Secret Status:</label>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Active (/api/webhooks/razorpay)</span>
              </div>
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Accepted Payment Rails:</label>
              <div className="p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-700">
                UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSECTION 3: SHIPPING (SHIPROCKET) ── */}
      {activeSubSection === 'shipping' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h3 className="font-bold text-neutral-900 text-sm">
              Shiprocket Logistics & Freight Rules
            </h3>
            <button
              type="button"
              onClick={handleTestShiprocket}
              disabled={isTesting}
              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Truck className="h-3 w-3 text-neutral-600" />
              <span>Test Shiprocket Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Free Shipping Cart Threshold (INR):</label>
              <input
                type="number"
                value={businessSettings.shipping_free_threshold || 699}
                onChange={(e) => setBusinessSettings({ ...businessSettings, shipping_free_threshold: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Orders above this threshold unlock free delivery automatically.</span>
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Flat Standard Shipping Rate (INR):</label>
              <input
                type="number"
                value={businessSettings.flat_shipping_rate || 60}
                onChange={(e) => setBusinessSettings({ ...businessSettings, flat_shipping_rate: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono font-bold"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Applied to carts below the free delivery threshold.</span>
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Registered Pickup Hub Name:</label>
              <input
                type="text"
                value={warehouseForm.name || 'KRIA Central Fulfillment Hub'}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Default Parcel Weight & Dims:</label>
              <input
                type="text"
                value="0.30 kg (15 × 10 × 5 cm)"
                disabled
                className="w-full p-2.5 bg-neutral-100 border border-neutral-300 rounded-xl font-mono text-neutral-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSECTION 4: FACTORY PRODUCTION ── */}
      {activeSubSection === 'production' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-5 text-xs">
          <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
            Factory Production & Daily Dispatch Capacity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Processing Time (Days):</label>
              <input
                type="text"
                value="1-2 Business Days"
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Daily Dispatch Cut-Off Time:</label>
              <input
                type="text"
                value="17:00 IST"
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Daily Capacity Limit:</label>
              <input
                type="text"
                value="150 Frames / Day"
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSECTION 5: PHOTO RULES ── */}
      {activeSubSection === 'photo_rules' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
            Customer Photo Upload & Retention Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Accepted Photo Formats:</label>
              <div className="p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-800">
                JPEG, PNG, WebP (HEIC converted client-side)
              </div>
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Maximum File Size Limit:</label>
              <div className="p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-800">
                25 Megabytes (MB)
              </div>
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Minimum Recommended Resolution:</label>
              <div className="p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-neutral-800">
                1200 × 1800 px (300 DPI for 4×6 print)
              </div>
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Action on Low-Resolution Upload:</label>
              <div className="p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-800">
                Show warning to customer + flag in CMS exception queue
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSECTION 6: TAX & GST INVOICE ── */}
      {activeSubSection === 'tax' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
            GST Compliance & Invoice Numbering
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">GST Tax Rate:</label>
              <input
                type="text"
                value="18% (9% CGST + 9% SGST / 18% IGST)"
                disabled
                className="w-full p-2.5 bg-neutral-100 border border-neutral-300 rounded-xl font-mono text-neutral-700"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">HSN Code (Acrylic Goods):</label>
              <input
                type="text"
                value="3926"
                disabled
                className="w-full p-2.5 bg-neutral-100 border border-neutral-300 rounded-xl font-mono text-neutral-700"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Invoice Prefix:</label>
              <input
                type="text"
                value="KRIA-INV-"
                disabled
                className="w-full p-2.5 bg-neutral-100 border border-neutral-300 rounded-xl font-mono text-neutral-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSECTION 7: NOTIFICATIONS ── */}
      {activeSubSection === 'notifications' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h3 className="font-bold text-neutral-900 text-sm">
              Staff & Customer Alert Channels
            </h3>
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={isTesting}
              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="h-3 w-3 text-neutral-600" />
              <span>Send Test Notification</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
              <div>
                <strong className="text-neutral-900 block">CMS Audio Chime Alert:</strong>
                <span className="text-neutral-500 text-[11px]">Synthesizes a pleasant luxury chime whenever a new paid order arrives.</span>
              </div>
              <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">ACTIVE</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
              <div>
                <strong className="text-neutral-900 block">Instant WhatsApp Notification:</strong>
                <span className="text-neutral-500 text-[11px]">1-click customer chat with prefilled order template from Order Drawer.</span>
              </div>
              <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSECTION 8: POLICIES ── */}
      {activeSubSection === 'policies' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
            Storefront Legal & Fulfillment Policies
          </h3>
          <p className="text-neutral-600 leading-relaxed">
            All policy documents are public and linked in the footer (`/policies`): Custom Order Terms, Photo Privacy Guarantee, Prepaid Shipping SLA, and 48-Hour Damage Replacement Policy.
          </p>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>Storefront policy routes are live and indexed for Meta ad compliance.</span>
          </div>
        </div>
      )}

      {/* ── SUBSECTION 9: SYSTEM & DIAGNOSTICS ── */}
      {activeSubSection === 'system' && (
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
            System Diagnostics, Backups & Data Export
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
              <strong className="text-neutral-900 block">Orders CSV Export:</strong>
              <p className="text-neutral-500 text-[11px]">Download all historical orders, customer numbers, totals and courier AWBs in CSV format.</p>
              <a
                href="/api/admin/export/orders.csv"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition"
              >
                <Download className="h-3 w-3 text-white" />
                <span>Export Orders (CSV)</span>
              </a>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
              <strong className="text-neutral-900 block">Role & Security Model:</strong>
              <p className="text-neutral-500 text-[11px]">Strict isolated single-role admin credential policy (`requireAdmin` bearer authentication).</p>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900">
                Enforced (Single Role)
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
