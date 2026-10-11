import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'KRIA TECH',
    gstin: '36AAAFK7892P1Z0'
  });
  
  const [warehouse, setWarehouse] = useState({
    address: 'Shop no 9, Mallikarjuna Towers, Radha Krishna Rd, Venkata Ramana Colony, Gokul Plots, 9th Phase KPHB, Near Quantum Leap School, Hafeezpet',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500085'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` };
      const [setRes, whRes] = await Promise.all([
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/warehouses', { headers })
      ]);
      
      if (setRes.ok) {
        const data = await setRes.json();
        if (data && Object.keys(data).length > 0) setSettings(data);
      }
      if (whRes.ok) {
        const data = await whRes.json();
        if (data && Object.keys(data).length > 0) setWarehouse(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const headers = { 
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
      };
      
      await Promise.all([
        fetch('/api/admin/settings', { method: 'POST', headers, body: JSON.stringify(settings) }),
        fetch('/api/admin/warehouses', { method: 'POST', headers, body: JSON.stringify(warehouse) })
      ]);
      
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#111827]">Settings & Warehouses</h2>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E3E8EE]">
          <h3 className="text-lg font-semibold text-[#111827]">Business Details</h3>
          <p className="text-sm text-[#6B7280] mt-1">Manage your company information and GST details.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Company Name</label>
              <input type="text" value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">GSTIN</label>
              <input type="text" value={settings.gstin} onChange={e => setSettings({...settings, gstin: e.target.value})} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E3E8EE]">
          <h3 className="text-lg font-semibold text-[#111827]">Primary Warehouse</h3>
          <p className="text-sm text-[#6B7280] mt-1">Address used for shipping and returns.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">Address</label>
            <textarea rows={3} value={warehouse.address} onChange={e => setWarehouse({...warehouse, address: e.target.value})} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">City</label>
              <input type="text" value={warehouse.city} onChange={e => setWarehouse({...warehouse, city: e.target.value})} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">State</label>
              <input type="text" value={warehouse.state} onChange={e => setWarehouse({...warehouse, state: e.target.value})} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Pincode</label>
              <input type="text" value={warehouse.pincode} onChange={e => setWarehouse({...warehouse, pincode: e.target.value})} className="w-full px-3 py-2 border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
