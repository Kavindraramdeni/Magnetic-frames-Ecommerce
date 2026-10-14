import React, { useState } from 'react';
import { RotateCcw, DollarSign, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Clock, MessageSquare, Check, X } from 'lucide-react';

interface RefundsReplacementsViewProps {
  orders: any[];
  adminToken: string;
  onRefreshOrders: () => void;
  onOpenOrder: (order: any) => void;
}

export default function RefundsReplacementsView({
  orders,
  adminToken,
  onRefreshOrders,
  onOpenOrder
}: RefundsReplacementsViewProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ type: 'refund' | 'replace' | 'reject'; order: any } | null>(null);
  const [modalForm, setModalForm] = useState({ reason: 'Damaged in transit', note: '', amount: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive refund/replacement claim list from orders
  const claims = React.useMemo(() => {
    const list: any[] = [];
    for (const o of orders) {
      if (o.status === 'Refunded') {
        list.push({
          id: `claim-${o.id}`,
          orderId: o.id,
          order: o,
          type: 'refund',
          status: 'resolved',
          reason: 'Customer refund processed',
          amount: o.grandTotal,
          date: o.createdAt,
          customerName: o.shippingDetails?.fullName || o.shippingDetails?.name || 'Customer',
          phone: o.shippingDetails?.phone || ''
        });
      } else if (o.id.startsWith('KRIA-REP-')) {
        list.push({
          id: `claim-${o.id}`,
          orderId: o.id,
          order: o,
          type: 'replacement',
          status: 'in_production',
          reason: 'Replacement frame reprint authorized',
          amount: 0,
          date: o.createdAt,
          customerName: o.shippingDetails?.fullName || o.shippingDetails?.name || 'Customer',
          phone: o.shippingDetails?.phone || ''
        });
      } else if (o.status === 'Cancelled') {
        list.push({
          id: `claim-${o.id}`,
          orderId: o.id,
          order: o,
          type: 'cancelled',
          status: 'resolved',
          reason: 'Order cancelled before dispatch',
          amount: o.grandTotal,
          date: o.createdAt,
          customerName: o.shippingDetails?.fullName || o.shippingDetails?.name || 'Customer',
          phone: o.shippingDetails?.phone || ''
        });
      }
    }
    return list;
  }, [orders]);

  const handleApproveReplacement = async (order: any, reason: string, note: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/replacement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ reason, notes: note })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(`Replacement order #${data.replacementOrder?.id} created & routed to production queue.`);
        setTimeout(() => setFeedback(null), 4000);
        setActionModal(null);
        onRefreshOrders();
      } else {
        alert(data.error || 'Failed to approve replacement.');
      }
    } catch (e: any) {
      alert(e.message || 'Error executing replacement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessRefund = async (order: any, amount: number, reason: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ amount, reason })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(`Refund of ₹${amount || order.grandTotal} registered for #${order.id}.`);
        setTimeout(() => setFeedback(null), 4000);
        setActionModal(null);
        onRefreshOrders();
      } else {
        alert(data.error || 'Failed to process refund.');
      }
    } catch (e: any) {
      alert(e.message || 'Error executing refund.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#B09A84] flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            AFTER-SALES & CLAIMS
          </span>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900 mt-1">
            Refunds & Replacements Queue
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Authorize linked replacement orders, execute Razorpay refunds, and review customer quality complaints.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            Delivered Orders (Eligible for Claim)
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              activeTab === 'resolved'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            Resolved Audits ({claims.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {activeTab === 'pending' ? (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>KRIA Replacement Policy:</strong> Because personalized frames are made to order, our default resolution for damage or defect is to issue a <strong>free replacement frame</strong> without requiring return shipping. Refunds are issued only for captured payments with unfulfillable stock or delivery failure.
            </div>
          </div>

          {/* Orders eligible for dispute / refund */}
          <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xs divide-y divide-neutral-100">
            {orders.slice(0, 15).map((o) => (
              <div
                key={o.id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-neutral-50/50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900">#{o.id}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 font-medium mt-1">
                    Customer: <strong>{o.shippingDetails?.fullName || o.shippingDetails?.name || 'Customer'}</strong> ({o.shippingDetails?.phone || 'No phone'}) · {(o.cart || []).length} Frame(s)
                  </p>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Total: ₹{o.grandTotal} · Txn: {o.transactionId || 'Uncaptured'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActionModal({ type: 'replace', order: o });
                      setModalForm({ reason: 'Acrylic scratched or defect', note: '', amount: 0 });
                    }}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Approve Replacement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionModal({ type: 'refund', order: o });
                      setModalForm({ reason: 'Customer requested cancellation', note: '', amount: o.grandTotal || 0 });
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <DollarSign className="h-3 w-3" />
                    <span>Issue Refund</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenOrder(o)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Resolved Claims Audit Log */
        <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xs divide-y divide-neutral-100">
          {claims.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">No resolved claims in history.</div>
          ) : (
            claims.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-neutral-900">#{c.orderId}</span>
                  <p className="text-neutral-600 mt-0.5">{c.reason}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {c.type.toUpperCase()}
                  </span>
                  <div className="text-neutral-400 text-[10px] mt-1 font-mono">{new Date(c.date).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Action Modal (Approve Replacement or Refund) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-neutral-300 shadow-2xl p-6 space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B09A84]">
                  {actionModal.type === 'replace' ? 'Approve Replacement Order' : 'Razorpay Refund Authorization'}
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                  Order #{actionModal.order.id}
                </h3>
              </div>
              <button onClick={() => setActionModal(null)} className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Reason for Action:</label>
                <select
                  value={modalForm.reason}
                  onChange={(e) => setModalForm({ ...modalForm, reason: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none"
                >
                  <option value="Acrylic scratched or cracked">Acrylic scratched or cracked</option>
                  <option value="Face cutoff by auto-crop">Face cutoff by auto-crop</option>
                  <option value="Magnet polarity misalignment">Magnet polarity misalignment</option>
                  <option value="Damaged in transit by courier">Damaged in transit by courier</option>
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                </select>
              </div>

              {actionModal.type === 'refund' && (
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Refund Amount (INR):</label>
                  <input
                    type="number"
                    value={modalForm.amount}
                    onChange={(e) => setModalForm({ ...modalForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-bold"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Original order grand total: ₹{actionModal.order.grandTotal}
                  </span>
                </div>
              )}

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Internal Audit Note:</label>
                <textarea
                  value={modalForm.note}
                  onChange={(e) => setModalForm({ ...modalForm, note: e.target.value })}
                  placeholder="e.g. Verified customer photo of chipped acrylic corner. Approved replacement dispatch."
                  rows={2}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (actionModal.type === 'replace') {
                    handleApproveReplacement(actionModal.order, modalForm.reason, modalForm.note);
                  } else {
                    handleProcessRefund(actionModal.order, modalForm.amount, modalForm.reason);
                  }
                }}
                disabled={isSubmitting}
                className="px-5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Processing…' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
