import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Search, Filter, MessageSquare, ArrowRight, X, Clock, AlertCircle } from 'lucide-react';

interface ExceptionsQueueViewProps {
  orders: any[];
  adminToken: string;
  onOpenOrder: (order: any) => void;
  onRefreshOrders: () => void;
}

export default function ExceptionsQueueView({
  orders,
  adminToken,
  onOpenOrder,
  onRefreshOrders
}: ExceptionsQueueViewProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvingException, setResolvingException] = useState<any | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Derive comprehensive exceptions list from orders
  const exceptions = useMemo(() => {
    const list: any[] = [];

    for (const o of orders) {
      const createdAt = new Date(o.createdAt || Date.now()).getTime();
      const ageHours = Math.round((Date.now() - createdAt) / (1000 * 60 * 60));
      const customerName = o.shippingDetails?.fullName || o.shippingDetails?.name || 'Customer';
      const phone = o.shippingDetails?.phone || '';

      // 1. Missing phone/pincode
      if (!o.shippingDetails?.pincode || !o.shippingDetails?.phone) {
        list.push({
          id: `${o.id}-address`,
          orderId: o.id,
          order: o,
          type: 'waiting_customer',
          label: 'Incomplete Delivery Address',
          severity: 'high',
          age: `${ageHours}h ago`,
          ageHours,
          suggestedAction: 'Contact customer on WhatsApp to request complete pin code & street name.',
          customerName,
          phone
        });
      }

      // 2. Unverified payment
      if (o.status === 'Pending' && !o.transactionId) {
        list.push({
          id: `${o.id}-payment`,
          orderId: o.id,
          order: o,
          type: 'payment_mismatch',
          label: 'Uncaptured Razorpay Payment',
          severity: 'critical',
          age: `${ageHours}h ago`,
          ageHours,
          suggestedAction: 'Verify bank settlement or run payment recovery check.',
          customerName,
          phone
        });
      }

      // 3. Packed but missing AWB / Shiprocket error
      if (o.status === 'Packed' && !o.trackingNumber && !o.shipmentId) {
        list.push({
          id: `${o.id}-shipment`,
          orderId: o.id,
          order: o,
          type: 'shiprocket_error',
          label: 'Shiprocket AWB Assignment Pending',
          severity: 'medium',
          age: `${ageHours}h ago`,
          ageHours,
          suggestedAction: 'Retry Shiprocket courier assignment or check warehouse pickup pincode.',
          customerName,
          phone
        });
      }

      // 4. Overdue unfulfilled order (> 48 hours)
      if (ageHours > 48 && o.status !== 'Shipped' && o.status !== 'Delivered' && o.status !== 'Cancelled' && o.status !== 'Refunded') {
        list.push({
          id: `${o.id}-overdue`,
          orderId: o.id,
          order: o,
          type: 'overdue_production',
          label: 'Fulfillment Delayed (>48h)',
          severity: 'high',
          age: `${ageHours}h ago`,
          ageHours,
          suggestedAction: 'Fast-track through UV printer and laser cut lane today.',
          customerName,
          phone
        });
      }

      // 5. Low-res photo or face crop flags in cart items
      if (Array.isArray(o.cart)) {
        o.cart.forEach((item: any, idx: number) => {
          if (item.flaggedForLowRes) {
            list.push({
              id: `${o.id}-lowres-${idx}`,
              orderId: o.id,
              order: o,
              type: 'low_resolution',
              label: `Low Resolution Photo (Frame ${idx + 1})`,
              severity: 'medium',
              age: `${ageHours}h ago`,
              ageHours,
              suggestedAction: 'Request high-res uncompressed image from customer.',
              customerName,
              phone
            });
          }
          if (item.flaggedForFaceCrop) {
            list.push({
              id: `${o.id}-facecrop-${idx}`,
              orderId: o.id,
              order: o,
              type: 'face_edge',
              label: `Face Cutoff Risk (Frame ${idx + 1})`,
              severity: 'high',
              age: `${ageHours}h ago`,
              ageHours,
              suggestedAction: 'Use CMS Crop Editor to widen safe margin or print Raw Original.',
              customerName,
              phone
            });
          }
        });
      }
    }

    return list;
  }, [orders]);

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((ex) => {
      const matchesType = filterType === 'all' || ex.type === filterType;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        ex.orderId.toLowerCase().includes(query) ||
        ex.customerName.toLowerCase().includes(query) ||
        ex.phone.includes(query) ||
        ex.label.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [exceptions, filterType, searchQuery]);

  const handleResolve = async () => {
    if (!resolvingException || !resolutionNote.trim()) {
      alert('Please enter a resolution note before resolving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/orders/${resolvingException.orderId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          note: `[Exception Resolved: ${resolvingException.label}] ${resolutionNote.trim()}`
        })
      });

      if (response.ok) {
        setFeedback(`Exception for order ${resolvingException.orderId} resolved.`);
        setTimeout(() => setFeedback(null), 3500);
        setResolvingException(null);
        setResolutionNote('');
        onRefreshOrders();
      } else {
        alert('Failed to resolve exception.');
      }
    } catch (e: any) {
      alert(e.message || 'Error resolving exception.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            OPERATIONAL EXCEPTION QUEUE
          </span>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900 mt-1">
            Fulfillment Exceptions ({exceptions.length})
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Active blockers requiring staff resolution before orders can proceed to packing and dispatch.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'waiting_customer', 'payment_mismatch', 'shiprocket_error', 'overdue_production', 'face_edge', 'low_resolution'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                filterType === t
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {t === 'all' ? 'All Issues' : t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order ID, customer name, phone, or issue type…"
          className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
        />
      </div>

      {/* Exception Cards Table */}
      {filteredExceptions.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center space-y-3">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="font-sans font-bold text-base text-neutral-900">Zero Open Exceptions</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            All orders have verified payments, complete addresses, and clean print assets ready for production.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xs divide-y divide-neutral-100">
          {filteredExceptions.map((ex) => (
            <div
              key={ex.id}
              className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-neutral-50/60 transition"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                      ex.severity
                    )}`}
                  >
                    {ex.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-neutral-900">#{ex.orderId}</span>
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {ex.age}
                  </span>
                </div>

                <p className="text-xs text-neutral-700 font-medium">
                  Customer: <strong>{ex.customerName}</strong> ({ex.phone || 'No phone'})
                </p>

                <p className="text-xs text-neutral-500 italic bg-neutral-50 p-2 rounded-lg border border-neutral-100 inline-block">
                  ↳ Suggested Action: {ex.suggestedAction}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {ex.phone && (
                  <a
                    href={`https://wa.me/91${ex.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${ex.customerName}, this is KRIA Studio regarding order #${ex.orderId}: ${ex.label}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onOpenOrder(ex.order)}
                  className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Open Order
                </button>

                <button
                  type="button"
                  onClick={() => setResolvingException(ex)}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Exception Modal */}
      {resolvingException && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-neutral-300 shadow-2xl p-6 space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">
                  Resolve Exception
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                  Order #{resolvingException.orderId} · {resolvingException.label}
                </h3>
              </div>
              <button
                onClick={() => setResolvingException(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block">
                Required Staff Resolution Note:
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Spoke with customer on WhatsApp; verified correct pincode 560001 and updated shipping address."
                rows={3}
                className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <span className="text-[11px] text-neutral-400">
                This note will be permanently logged in the order's immutable audit history.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setResolvingException(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={isSubmitting || !resolutionNote.trim()}
                className="px-5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Resolving…' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
