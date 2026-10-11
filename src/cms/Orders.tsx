import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit2, Package, Truck, CheckCircle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Processing': return <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">Processing</span>;
      case 'Shipped': return <span className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full border border-purple-200">Shipped</span>;
      case 'Delivered': return <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">Delivered</span>;
      default: return <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#111827]">Orders</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="pl-9 pr-4 py-2 border border-[#E3E8EE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E3E8EE] text-[#4B5563] text-sm font-medium rounded-lg hover:bg-[#F9FAFB]">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9FAFB] border-b border-[#E3E8EE] text-[#4B5563]">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#6B7280]">Loading orders...</td>
                </tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#111827]">{order.id}</td>
                  <td className="px-6 py-4 text-[#4B5563]">{order.customer}</td>
                  <td className="px-6 py-4 text-[#4B5563]">{order.date}</td>
                  <td className="px-6 py-4 text-[#111827] font-medium">₹{order.total}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#6B7280] hover:text-[#111827]">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
