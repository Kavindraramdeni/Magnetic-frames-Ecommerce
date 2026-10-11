import React, { useState, useEffect } from 'react';
import { Tag, Plus, Star } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#111827]">Coupons & Reviews</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E3E8EE] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#111827]" />
            <h3 className="text-lg font-semibold text-[#111827]">Active Coupons</h3>
          </div>
          <div className="divide-y divide-[#E3E8EE]">
            {loading ? (
               <div className="p-5 text-center text-sm text-gray-500">Loading coupons...</div>
            ) : coupons.length === 0 ? (
               <div className="p-5 text-center text-sm text-gray-500">No active coupons found.</div>
            ) : (
              coupons.map((coupon, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#111827] text-lg">{coupon.code}</p>
                    <p className="text-sm text-[#6B7280]">{coupon.description || 'Discount applied'}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    {coupon.status || 'Active'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E3E8EE] flex items-center gap-2">
            <Star className="w-5 h-5 text-[#111827]" />
            <h3 className="text-lg font-semibold text-[#111827]">Recent Reviews</h3>
          </div>
          <div className="divide-y divide-[#E3E8EE]">
            <div className="p-5">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-[#4B5563]">"Absolutely love my custom frame! The quality is amazing."</p>
              <p className="text-xs text-[#9CA3AF] mt-2">- Sarah J.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
