import React, { useMemo } from 'react';
import { TrendingUp, BarChart3, ShoppingBag, Users, DollarSign, Package, Percent, RotateCcw, Award } from 'lucide-react';

interface ExecutiveAnalyticsViewProps {
  orders: any[];
}

export default function ExecutiveAnalyticsView({ orders }: ExecutiveAnalyticsViewProps) {
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'Shipped' || o.status === 'Delivered').length;
    const grossRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const aov = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;
    
    // Repeat customer rate
    const customerMap = new Map<string, number>();
    for (const o of orders) {
      const key = o.shippingDetails?.phone || o.shippingDetails?.email || o.id;
      customerMap.set(key, (customerMap.get(key) || 0) + 1);
    }
    const uniqueCustomers = customerMap.size;
    const repeatCustomers = Array.from(customerMap.values()).filter((c) => c > 1).length;
    const repeatRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;

    // Replacements & returns
    const replacements = orders.filter((o) => o.id.startsWith('KRIA-REP-') || o.status === 'Refunded').length;
    const replacementRate = totalOrders > 0 ? ((replacements / totalOrders) * 100).toFixed(1) : '0.0';

    // Shape popularity breakdown
    const shapeCount: Record<string, number> = {};
    for (const o of orders) {
      if (Array.isArray(o.cart)) {
        for (const it of o.cart) {
          const s = it.shapeName || it.shapeId || 'Custom';
          shapeCount[s] = (shapeCount[s] || 0) + (it.quantity || 1);
        }
      }
    }

    const sortedShapes = Object.entries(shapeCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalOrders,
      completedOrders,
      grossRevenue,
      aov,
      uniqueCustomers,
      repeatRate,
      replacementRate,
      sortedShapes
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="border-b border-neutral-200 pb-5">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#B09A84] flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          EXECUTIVE INTELLIGENCE
        </span>
        <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900 mt-1">
          Store Operations & Sales Analytics
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Live financial overview, repeat customer engagement, return rates, and bestselling silhouette distribution.
        </p>
      </div>

      {/* 4 Core Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-neutral-900 text-white p-5 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[10px] text-[#E8DCCF]/70 uppercase font-semibold tracking-wider block">
            Gross Sales Revenue
          </span>
          <div className="text-2xl font-bold text-[#E8DCCF] font-mono">
            ₹{metrics.grossRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-neutral-400">All captured & processed orders</span>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-3xl space-y-1 shadow-2xs">
          <span className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider block">
            Average Order Value (AOV)
          </span>
          <div className="text-2xl font-bold text-neutral-900 font-mono">
            ₹{metrics.aov}
          </div>
          <span className="text-[10px] text-neutral-400">Per paying transaction</span>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-3xl space-y-1 shadow-2xs">
          <span className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider block">
            Repeat Customer Rate
          </span>
          <div className="text-2xl font-bold text-emerald-800 font-mono">
            {metrics.repeatRate}%
          </div>
          <span className="text-[10px] text-neutral-400">2+ orders placed</span>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-3xl space-y-1 shadow-2xs">
          <span className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider block">
            Dispute / Return Rate
          </span>
          <div className="text-2xl font-bold text-rose-700 font-mono">
            {metrics.replacementRate}%
          </div>
          <span className="text-[10px] text-neutral-400">Replacements & refunds</span>
        </div>

      </div>

      {/* Shapes & Offer Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Silhouette Distribution */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Award className="h-4 w-4 text-amber-600" />
            <h3 className="font-bold text-neutral-900 text-sm">Bestselling Silhouette Shapes</h3>
          </div>

          <div className="space-y-3 text-xs">
            {metrics.sortedShapes.length === 0 ? (
              <p className="text-neutral-400">No shape data yet.</p>
            ) : (
              metrics.sortedShapes.map((s, idx) => {
                const totalUnits = metrics.sortedShapes.reduce((sum, x) => sum + x.count, 0) || 1;
                const percent = Math.round((s.count / totalUnits) * 100);
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between font-semibold text-neutral-800">
                      <span>#{idx + 1} {s.name}</span>
                      <span className="font-mono">{s.count} units ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Offer & Marketing Conversion Metrics */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-neutral-900 text-sm">Campaign Channel Conversion</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-neutral-900 block">Meta Ads Launch Offer</span>
                <span className="text-neutral-500 text-[11px]">Any 3 Frames Bundle (₹799)</span>
              </div>
              <span className="font-mono font-bold text-emerald-800 text-sm">~68% of Carts</span>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-neutral-900 block">Single Frame Purchases</span>
                <span className="text-neutral-500 text-[11px]">A la carte storefront orders</span>
              </div>
              <span className="font-mono font-bold text-neutral-800 text-sm">~22% of Carts</span>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-neutral-900 block">B2B Wholesale Enquiries</span>
                <span className="text-neutral-500 text-[11px]">Corporate gifting & return gifts (MOQ 10)</span>
              </div>
              <span className="font-mono font-bold text-neutral-800 text-sm">~10% of Orders</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
