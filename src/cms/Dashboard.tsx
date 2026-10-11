import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    conversion: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || {
          revenue: 0, orders: 0, customers: 0, conversion: 0
        });
        setRecentOrders(data.recentOrders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, trend: '+0%' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, trend: '+0%' },
    { label: 'Active Customers', value: stats.customers, icon: Users, trend: '+0%' },
    { label: 'Conversion Rate', value: `${stats.conversion}%`, icon: TrendingUp, trend: '+0%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#111827]">Dashboard Overview</h2>
        <div className="text-sm text-[#6B7280]">Last 30 days</div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl border border-[#E3E8EE] shadow-sm animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-[#E3E8EE] shadow-sm flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#6B7280]">{metric.label}</p>
                <h3 className="text-2xl font-bold text-[#111827] mt-2">{metric.value}</h3>
                <p className="text-xs font-medium text-emerald-600 mt-2">{metric.trend} from last month</p>
              </div>
              <div className="p-3 bg-[#F3F4F6] rounded-lg">
                <metric.icon className="w-5 h-5 text-[#4B5563]" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-[#E3E8EE] rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-[#E3E8EE]">
          <h3 className="text-lg font-semibold text-[#111827]">Recent Orders</h3>
        </div>
        <div className="p-6 text-[#6B7280] text-sm">
          {recentOrders.length === 0 ? (
            <div className="text-center">No recent orders found in this period.</div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2">
                   <span>{order.id}</span>
                   <span>₹{order.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
