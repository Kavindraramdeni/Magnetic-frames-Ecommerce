import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Phone, Mail, MapPin, ShoppingBag, Trash2, ShieldCheck, ChevronRight, X, Clock, ExternalLink } from 'lucide-react';

interface CustomerManagementViewProps {
  adminToken: string;
  onOpenOrder: (order: any) => void;
  orders: any[];
}

export default function CustomerManagementView({
  adminToken,
  onOpenOrder,
  orders
}: CustomerManagementViewProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isDeletingPhotos, setIsDeletingPhotos] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/customers', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.warn('Failed to load customers API, fallback to deriving from orders', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [adminToken]);

  // Fallback customer roster derived from live orders if API table empty
  const derivedCustomers = useMemo(() => {
    if (customers.length > 0) return customers;
    const map = new Map<string, any>();
    for (const o of orders) {
      const phone = o.shippingDetails?.phone || '';
      const email = o.shippingDetails?.email || '';
      const name = o.shippingDetails?.fullName || o.shippingDetails?.name || 'Customer';
      const key = phone || email || o.id;

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name,
          phone,
          email,
          city: o.shippingDetails?.city || 'Unknown',
          state: o.shippingDetails?.state || '',
          orderCount: 0,
          totalSpent: 0,
          orders: [],
          firstOrderDate: o.createdAt,
          lastOrderDate: o.createdAt
        });
      }

      const c = map.get(key);
      c.orderCount += 1;
      c.totalSpent += Number(o.grandTotal || 0);
      c.orders.push({
        id: o.id,
        status: o.status,
        grandTotal: o.grandTotal,
        createdAt: o.createdAt,
        itemsCount: (o.cart || []).length
      });
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, orders]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return derivedCustomers;
    return derivedCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q))
    );
  }, [derivedCustomers, searchQuery]);

  const handleDeletePhotos = async (identifier: string) => {
    if (!confirm(`Are you sure you want to permanently delete all uploaded photo assets for customer ${selectedCustomer.name}? This action complies with GDPR/privacy regulations and cannot be undone.`)) {
      return;
    }

    setIsDeletingPhotos(true);
    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(identifier)}/photos`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data.message || 'Photos permanently purged.');
        setTimeout(() => setFeedback(null), 4000);
      } else {
        alert(data.error || 'Failed to scrub customer photos.');
      }
    } catch (e: any) {
      alert(e.message || 'Error executing photo deletion.');
    } finally {
      setIsDeletingPhotos(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#B09A84] flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            CUSTOMER DIRECTORY & PRIVACY
          </span>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900 mt-1">
            Customer Directory ({derivedCustomers.length})
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Customer order histories, saved addresses, lifetime spend, and GDPR photo purging controls.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email, or city…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Customer Roster Table */}
      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Phone & Email</th>
                <th className="py-3 px-5">City</th>
                <th className="py-3 px-5 text-center">Orders</th>
                <th className="py-3 px-5 text-right">Lifetime Spend</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className="hover:bg-neutral-50/70 transition cursor-pointer"
                >
                  <td className="py-4 px-5">
                    <div className="font-bold text-neutral-900">{cust.name}</div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      First order: {new Date(cust.firstOrderDate || Date.now()).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td className="py-4 px-5 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-neutral-700">
                      <Phone className="h-3 w-3 text-neutral-400" />
                      <span className="font-mono">{cust.phone || '—'}</span>
                    </div>
                    {cust.email && (
                      <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
                        <Mail className="h-3 w-3 text-neutral-400" />
                        <span>{cust.email}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-5 text-neutral-700">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-neutral-400" />
                      <span>{cust.city || '—'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800">
                      {cust.orderCount}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right font-bold text-neutral-900 font-mono text-sm">
                    ₹{cust.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(cust);
                      }}
                      className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                    >
                      <span>View</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex justify-end font-sans">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden text-left">
            
            {/* Drawer Top */}
            <div className="bg-[#111111] text-white p-6 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8DCCF]">
                  Customer Dossier
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedCustomer.name}</h3>
                <p className="text-xs text-neutral-400 font-mono">
                  {selectedCustomer.phone} · {selectedCustomer.city}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-neutral-800 rounded-full transition text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-0.5">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Total Spent</span>
                  <div className="text-xl font-bold font-mono text-neutral-900">
                    ₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-0.5">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Orders Completed</span>
                  <div className="text-xl font-bold tabular-nums text-neutral-900">
                    {selectedCustomer.orderCount}
                  </div>
                </div>
              </div>

              {/* Contact & Address */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider text-neutral-500">
                  Primary Contact Coordinates
                </h4>
                <div className="space-y-1 text-neutral-700">
                  <p><strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}</p>
                  <p><strong>Email:</strong> {selectedCustomer.email || 'Not provided'}</p>
                  <p><strong>Region:</strong> {selectedCustomer.city}, {selectedCustomer.state || 'India'}</p>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-neutral-900 uppercase text-[10px] tracking-wider text-neutral-500">
                  Order History ({(selectedCustomer.orders || []).length})
                </h4>
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                  {(selectedCustomer.orders || []).map((o: any) => {
                    const fullOrder = orders.find((x) => x.id === o.id);
                    return (
                      <div
                        key={o.id}
                        className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition"
                      >
                        <div>
                          <div className="font-mono font-bold text-neutral-900">#{o.id}</div>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN')} · {o.itemsCount || 1} frame(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-neutral-900">₹{o.grandTotal}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (fullOrder) {
                                onOpenOrder(fullOrder);
                                setSelectedCustomer(null);
                              }
                            }}
                            className="px-2.5 py-1 bg-neutral-900 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GDPR Privacy Tool: Delete Customer Photos */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>GDPR Data Privacy & Photo Deletion</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Permanently purge all customer photo uploads associated with this customer's orders from private Supabase storage. Use this when fulfilling customer privacy deletion requests.
                </p>
                <button
                  type="button"
                  onClick={() => handleDeletePhotos(selectedCustomer.phone || selectedCustomer.email || selectedCustomer.id)}
                  disabled={isDeletingPhotos}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{isDeletingPhotos ? 'Purging Photo Storage…' : 'Delete Customer Photos (GDPR)'}</span>
                </button>
              </div>

            </div>

            {/* Drawer Bottom */}
            <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
