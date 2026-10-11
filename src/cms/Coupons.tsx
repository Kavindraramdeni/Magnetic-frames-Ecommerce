import React, { useState, useEffect } from 'react';
import { Tag, Plus, Star, CheckCircle, Trash2 } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || '';
      const [resCoupons, resReviews] = await Promise.all([
        fetch('/api/admin/coupons', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/reviews', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (resCoupons.ok) {
        const data = await resCoupons.json();
        setCoupons(Array.isArray(data) ? data : data.coupons || []);
      }
      if (resReviews.ok) {
        const data = await resReviews.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`/api/admin/reviews/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setActionNotice(`Review approved successfully.`);
        fetchData();
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setActionNotice(`Review deleted.`);
        fetchData();
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#111827]">Coupons & Reviews Moderation</h2>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-semibold">
          {actionNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coupons List */}
        <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E3E8EE] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#111827]" />
              <h3 className="text-lg font-semibold text-[#111827]">Active Coupons</h3>
            </div>
            <span className="text-xs bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full font-mono">
              {coupons.length} Active
            </span>
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
                    <p className="font-bold text-[#111827] text-lg font-mono">{coupon.code}</p>
                    <p className="text-sm text-[#6B7280]">{coupon.description || `${coupon.discountPercent || coupon.discount || 10}% off discount`}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    {coupon.status || 'Active'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reviews Moderation */}
        <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E3E8EE] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#111827]" />
              <h3 className="text-lg font-semibold text-[#111827]">Reviews Moderation</h3>
            </div>
            <span className="text-xs bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full font-mono">
              {reviews.filter(r => !r.is_approved).length} Pending
            </span>
          </div>
          <div className="divide-y divide-[#E3E8EE] max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-5 text-center text-sm text-gray-500">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="p-5 text-center text-sm text-gray-500">No reviews submitted yet.</div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} 
                          />
                        ))}
                        <span className="text-xs font-bold text-neutral-700 ml-1">({rev.rating}/5)</span>
                      </div>
                      <p className="text-sm text-[#111827] italic">"{rev.comment}"</p>
                      <p className="text-xs text-[#6B7280] mt-1 font-medium">
                        — {rev.name} ({rev.location || 'India'}) • {new Date(rev.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {rev.is_approved ? (
                        <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                          Approved
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveReview(rev.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
                          title="Approve for public display"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded cursor-pointer transition"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
