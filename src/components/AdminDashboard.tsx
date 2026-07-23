import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, RefreshCw, Printer, CheckCircle, 
  Trash2, ShieldCheck, Truck, ShoppingBag, 
  ExternalLink, Calendar, Phone, Mail, MapPin, 
  Activity, Info, Box, Clipboard, Download, ArrowRight, X, Sparkles, MessageSquare
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { jsPDF } from 'jspdf';
import { BASE_SHAPES } from '../data';

interface AdminDashboardProps {
  onBackToHome: () => void;
  adminToken: string;
}

export default function AdminDashboard({ onBackToHome, adminToken }: AdminDashboardProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Pending');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isPrintWorkOrderOpen, setIsPrintWorkOrderOpen] = useState<any | null>(null);
  const [isPrintShippingLabelOpen, setIsPrintShippingLabelOpen] = useState<any | null>(null);

  // Generate high-fidelity thermal PDF shipping label
  const handleGeneratePDFLabel = (order: any) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150] // Standard 4x6 inch thermal shipping label size
      });

      // Draw high-contrast outer container border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.rect(4, 4, 92, 142);

      // Draw horizontal divider grids
      doc.setLineWidth(0.5);
      doc.line(4, 25, 96, 25);
      doc.line(4, 55, 96, 55);
      doc.line(4, 110, 96, 110);

      // 1. Courier Provider & Brand Header
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text((order.courierName || "DELHIVERY AIR").toUpperCase(), 8, 12);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("PREPAID PREMIUM AIR EXPRESS • HIGH-SPEED DISPATCH", 8, 17);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("SHIPROCKET TRACKING REF: " + (order.trackingNumber || "SRW-827384912"), 8, 22);

      // 2. Barcode Grid Representation (High Contrast laser-scannable bars)
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.text("AWB NUMBER: " + (order.trackingNumber || "SRW-827384912"), 8, 31);
      
      let startX = 8;
      for (let i = 0; i < 40; i++) {
        const thickness = (i % 3 === 0) ? 1.6 : ((i % 5 === 0) ? 1.0 : 0.4);
        doc.setFillColor(0, 0, 0);
        doc.rect(startX, 34, thickness, 14, 'F');
        startX += thickness + 0.8;
      }

      // 3. Customer Delivery coordinates (SHIP TO)
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("DELIVER TO RECIPIENT:", 8, 61);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text(order.shippingDetails.fullName.toUpperCase(), 8, 67);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      
      // Split address securely to fit width perfectly
      const addressText = order.shippingDetails.address;
      const splitAddress = doc.splitTextToSize(addressText, 84);
      let currentY = 73;
      splitAddress.forEach((line: string) => {
        doc.text(line, 8, currentY);
        currentY += 4.5;
      });

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(`${order.shippingDetails.city.toUpperCase()}, ${order.shippingDetails.state.toUpperCase()} - ${order.shippingDetails.pincode}`, 8, currentY + 2);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`Mobile Connection: ${order.shippingDetails.phone}`, 8, currentY + 7);
      doc.text(`E-Mail Address: ${order.shippingDetails.email}`, 8, currentY + 11);

      // 4. Return Sender Details & Package Dimension specs
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7);
      doc.text("RETURN TO SENDER:", 8, 116);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("KRIA STUDIO PRINTS", 8, 121);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("Jubilee Tech District, Phase II", 8, 125);
      doc.text("Hyderabad, Telangana - 500081", 8, 129);

      // Package specs
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("WEIGHT: 0.35 KG", 62, 116);
      doc.text("BOX SIZE: 15x15x5cm", 62, 121);
      doc.text("CAST ITEMS: " + order.cart.length, 62, 126);

      doc.save(`kria_shipping_label_${order.id}.pdf`);
      
      setActionLog(prev => [
        `[${new Date().toLocaleTimeString()}] 📄 Generated thermal PDF shipping label for Order ${order.id}. Ready for print dispatch.`,
        ...prev
      ]);
    } catch (err: any) {
      alert("PDF Generation Failed: " + err.message);
    }
  };

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Fetch active database orders
  const fetchOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (response.ok) {
        const data = await response.json();
        const freshOrders = data.orders || [];
        
        setOrders(prev => {
          if (prev.length > 0 && freshOrders.length > prev.length) {
            const newCount = freshOrders.length - prev.length;
            const newest = freshOrders[0];
            setActionLog(logPrev => [
              `[${new Date().toLocaleTimeString()}] 🔔 LIVE REAL-TIME ALERT: ${newCount} new order(s) received! Latest ID: ${newest.id} (₹${newest.grandTotal})`,
              ...logPrev
            ]);
          }
          return freshOrders;
        });
      } else {
        const err = await response.json();
        if (!silent) setError(err.error || 'Failed to fetch orders database.');
      }
    } catch (e: any) {
      if (!silent) setError(e.message || 'Server connection issue while fetching orders.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Fetch catalog products
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProductsList(data.products || []);
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();

    // Live Real-time Auto Polling every 8 seconds
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Update specific order status in backend with simulated dispatch SMS/Email logs
  const handleUpdateStatus = async (orderId: string, nextStatus: string, noteText?: string) => {
    setIsUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: nextStatus, note: noteText })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Refresh local state list
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }

        if (data.notificationLog) {
          setActionLog(prev => [
            `[${new Date().toLocaleTimeString()}] ${data.notificationLog}`,
            ...prev
          ]);
        }
        
        setActionLog(prev => [
          `[${new Date().toLocaleTimeString()}] ✓ Order ${orderId} shifted to "${nextStatus}" status successfully.`,
          ...prev
        ]);
      } else {
        const err = await response.json();
        alert(err.error || 'Fulfillment error');
      }
    } catch (e: any) {
      alert('Error updating status: ' + e.message);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Sync logistics label via Shiprocket
  const handleSyncShiprocket = async (orderId: string) => {
    setIsUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/sync-shiprocket`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
        setActionLog(prev => [
          `[${new Date().toLocaleTimeString()}] 📦 Shiprocket API synced. Courier assigned: ${data.order.courierName}. Printed tracking AWB label: ${data.order.trackingNumber}`,
          ...prev
        ]);
      } else {
        alert("Failed syncing with Shiprocket backend.");
      }
    } catch (e: any) {
      alert("Error syncing logistics: " + e.message);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Void order from database
  const handleVoidOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to void and delete Order ${orderId}? This cannot be undone.`)) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
        setActionLog(prev => [
          `[${new Date().toLocaleTimeString()}] 🗑 Order ${orderId} has been deleted/voided from local filesystem database.`,
          ...prev
        ]);
      } else {
        alert("Failed to delete order record.");
      }
    } catch (e: any) {
      alert("Error voiding: " + e.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-[#E8DCCF]/40 text-[#4E3629] border-[#E8DCCF]';
      case 'Printing':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Quality Check':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Packed':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Shipped':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-neutral-50 text-neutral-800 border-neutral-200';
    }
  };

  const filteredOrders = activeFilter === 'All' 
    ? orders 
    : activeFilter === 'Pending'
      ? orders.filter(o => o.status !== 'Shipped')
      : orders.filter(o => o.status === activeFilter);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 flex flex-col font-sans antialiased pb-20 select-none">
      
      {/* CMS Luxury Header */}
      <header className="bg-[#111111] text-white border-b border-neutral-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBackToHome}
              className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-[#E8DCCF] transition-all cursor-pointer"
              title="Return to Studio Design Workspace"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <BrandLogo size={32} color="#E8DCCF" />
              <div>
                <h1 className="font-serif text-xl font-light text-white tracking-wide">
                  KRIA <span className="italic font-serif font-semibold text-[#E8DCCF]">Fulfillment CMS</span>
                </h1>
                <p className="text-[10px] font-mono text-neutral-400 tracking-widest uppercase">Factory & Print Operations Terminal</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E8DCCF]/20 border border-[#E8DCCF]/40 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#E8DCCF] hover:bg-[#E8DCCF]/30 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Catalog & Prices</span>
            </button>
            <button
              onClick={() => fetchOrders()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-all cursor-pointer hover:bg-neutral-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#c0a88a]' : ''}`} />
              <span>Refresh</span>
            </button>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold uppercase text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync 8s
            </span>
          </div>
        </div>
      </header>

      {/* Main CMS Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grow grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Column: Orders Pipeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6 flex flex-col h-full min-h-[70vh]">
          
          {/* Header Stats & Pipeline Filter bar */}
          <div className="bg-white rounded-3xl border border-neutral-200/60 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                <Box className="h-4 w-4 text-[#c0a88a]" />
                <span>Active Print Pipelines</span>
              </h3>
              <span className="font-mono text-xs font-bold bg-neutral-100 px-3 py-1 rounded-full text-neutral-700">
                {orders.length} Registered
              </span>
            </div>

            {/* Quick Filter Pill Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {['Pending', 'All', 'Paid', 'Processing', 'Printing', 'Quality Check', 'Packed', 'Shipped'].map((filter) => {
                const count = filter === 'All' 
                  ? orders.length 
                  : filter === 'Pending'
                    ? orders.filter(o => o.status !== 'Shipped').length
                    : orders.filter(o => o.status === filter).length;
                const isSelected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase font-bold border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#111111] text-white border-[#111111]' 
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {filter} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders List Viewport */}
          <div className="space-y-4 grow">
            {isLoading ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin h-8 w-8 rounded-full border-2 border-[#111111] border-t-transparent" />
                <p className="font-serif italic text-sm text-neutral-500">Retrieving secure orders registry...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center text-neutral-500 space-y-2">
                <ShoppingBag className="h-8 w-8 mx-auto text-neutral-300" />
                <h4 className="font-serif text-base font-light text-neutral-800">No active orders found</h4>
                <p className="text-xs text-neutral-400 font-light">There are currently no orders in the "{activeFilter}" category pipeline.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder && selectedOrder.id === order.id;
                const itemQuantityTotal = order.cart.reduce((acc: number, item: any) => acc + (parseInt(item.quantity) || 1), 0);
                
                return (
                  <div 
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-white rounded-3xl border transition-all p-5 shadow-sm cursor-pointer hover:border-neutral-400 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                      isSelected ? 'ring-2 ring-black border-transparent' : 'border-neutral-200/60'
                    }`}
                  >
                    <div className="space-y-2 max-w-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-neutral-900 select-all">{order.id}</span>
                        <span className={`text-[9px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        {itemQuantityTotal >= 10 && (
                          <span className="bg-emerald-50 text-emerald-800 border-emerald-100 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border">
                            Bulk Discount 15%
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-light text-neutral-800">
                          Recipient: <span className="font-sans font-semibold text-neutral-900">{order.shippingDetails.fullName}</span>
                        </h4>
                        <p className="text-4xs font-mono text-neutral-400 uppercase tracking-widest">
                          Created: {new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'IST', hour12: true })}
                        </p>
                      </div>

                      {/* Items thumbnails list preview */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {order.cart.slice(0, 4).map((item: any, idx: number) => (
                          <div key={item.id || idx} className="h-7 w-7 rounded bg-neutral-100 overflow-hidden border border-neutral-200 shrink-0 relative group">
                            <img src={item.previewUrl} alt="Thumbnail" className="h-full w-full object-cover" />
                            <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[7px] px-0.5 font-mono">x{item.quantity}</span>
                          </div>
                        ))}
                        {order.cart.length > 4 && (
                          <span className="text-[10px] text-neutral-500 font-mono">+{order.cart.length - 4} more</span>
                        )}
                      </div>

                      {/* Rapid status management bar */}
                      <div className="flex flex-wrap gap-2 pt-2.5" onClick={(e) => e.stopPropagation()}>
                        {order.status !== 'Processing' && order.status !== 'Shipped' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Processing', 'Fulfillment processing started.')}
                            disabled={isUpdatingStatus === order.id}
                            className="px-2.5 py-1 bg-[#E8DCCF]/40 hover:bg-[#E8DCCF]/60 text-[#4E3629] border border-[#d3c0ad] rounded-lg text-[9px] font-mono font-bold uppercase transition"
                          >
                            Mark Processing
                          </button>
                        )}
                        {order.status !== 'Shipped' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'Shipped', 'Custom magnet cast handed over to air express courier.')}
                            disabled={isUpdatingStatus === order.id}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[9px] font-mono font-bold uppercase transition"
                          >
                            Mark Shipped
                          </button>
                        )}
                        <button
                          onClick={() => handleGeneratePDFLabel(order)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[9px] font-mono font-bold uppercase transition flex items-center gap-1"
                        >
                          <Download className="h-2.5 w-2.5" />
                          <span>PDF Label</span>
                        </button>
                      </div>
                    </div>

                    {/* Order action status summary */}
                    <div className="text-left md:text-right space-y-2 md:self-stretch flex md:flex-col justify-between md:justify-center items-end shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">GRAND TOTAL</span>
                        <span className="font-mono text-sm font-bold text-neutral-900">₹{order.grandTotal}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPrintWorkOrderOpen(order);
                          }}
                          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors"
                          title="Print Production Work Sheet"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPrintShippingLabelOpen(order);
                          }}
                          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors"
                          title="Print Shipping Invoice Label"
                        >
                          <Truck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoidOrder(order.id);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-600 transition-colors"
                          title="Void / Delete Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Order Details & Fulfillment Controller (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {selectedOrder ? (
            <div className="bg-white rounded-3xl border border-neutral-200/60 shadow-sm overflow-hidden flex flex-col">
              
              {/* Selected Order Header */}
              <div className="bg-neutral-900 text-white p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#FAF8F5]/60 uppercase tracking-wider">SELECTED ORDER</span>
                  <h4 className="font-mono text-sm font-bold text-[#E8DCCF]">{selectedOrder.id}</h4>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Order Body Details */}
              <div className="p-5 space-y-6 overflow-y-auto max-h-[80vh] text-xs">
                
                {/* 1. Fulfillment Controller Flow */}
                <div className="space-y-3.5 p-4 bg-[#FAF8F5] border border-neutral-200 rounded-2xl">
                  <h5 className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider font-bold">1. STEP-BY-STEP WORKFLOW CONTROLLER</h5>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Processing', 'Fulfillment processing started.')}
                      disabled={selectedOrder.status === 'Processing'}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedOrder.status === 'Processing'
                          ? 'bg-[#E8DCCF]/80 border-[#d3c0ad] text-neutral-900 font-bold'
                          : 'bg-white border-neutral-300 hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <Activity className="h-3.5 w-3.5" />
                      <span>Processing</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Printing', 'Loaded designs onto laser cutting bed.')}
                      disabled={selectedOrder.status === 'Printing'}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedOrder.status === 'Printing'
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white border-neutral-300 hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Start Print</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Quality Check', 'Engraving and magnets tested.')}
                      disabled={selectedOrder.status === 'Quality Check'}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedOrder.status === 'Quality Check'
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-white border-neutral-300 hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>QA Pass</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Packed', 'Magnet boxed in safe-foam mailer.')}
                      disabled={selectedOrder.status === 'Packed'}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedOrder.status === 'Packed'
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-white border-neutral-300 hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <Box className="h-3.5 w-3.5" />
                      <span>Pack Box</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Shipped', 'Handed off package to courier team.')}
                      disabled={selectedOrder.status === 'Shipped'}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer col-span-2 ${
                        selectedOrder.status === 'Shipped'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-neutral-300 hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Mark Shipped</span>
                    </button>
                  </div>

                  {/* Shiprocket Sync trigger */}
                  <div className="pt-2 border-t border-neutral-200 flex justify-between items-center gap-2">
                    <div className="text-left">
                      <p className="text-[10px] text-neutral-500 font-mono leading-none">COURIER DISPATCH</p>
                      <p className="font-bold text-neutral-900 font-sans mt-1 leading-none">{selectedOrder.courierName}</p>
                    </div>
                    <button
                      onClick={() => handleSyncShiprocket(selectedOrder.id)}
                      className="px-3 py-1.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 hover:text-black rounded-lg text-[10px] font-mono tracking-wider font-bold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Sync Shiprocket</span>
                    </button>
                  </div>
                </div>

                {/* 2. Print Work Order and Label Triggers */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsPrintWorkOrderOpen(selectedOrder)}
                    className="py-3 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 text-xs font-mono tracking-wider font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Printer className="h-4 w-4 text-[#c0a88a]" />
                    <span>Print Work Order</span>
                  </button>

                  <button
                    onClick={() => setIsPrintShippingLabelOpen(selectedOrder)}
                    className="py-3 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 text-xs font-mono tracking-wider font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Truck className="h-4 w-4 text-emerald-600" />
                    <span>Print Label</span>
                  </button>
                </div>

                {/* 3. Shipping Details Card */}
                <div className="space-y-3.5 p-4 border border-neutral-200/80 rounded-2xl text-left">
                  <h5 className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider font-bold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#c0a88a]" />
                    <span>Delivery Details</span>
                  </h5>
                  <div className="space-y-2 font-sans">
                    <p className="font-bold text-neutral-900 text-sm">{selectedOrder.shippingDetails.fullName}</p>
                    
                    <div className="space-y-1.5 text-neutral-600 leading-normal font-light">
                      <p className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-neutral-400 shrink-0" />
                        <span className="select-all font-mono font-semibold">{selectedOrder.shippingDetails.phone}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-neutral-400 shrink-0" />
                        <span className="select-all font-mono">{selectedOrder.shippingDetails.email}</span>
                      </p>
                      <p className="flex items-start gap-2 pt-1 border-t border-neutral-100">
                        <MapPin className="h-3 w-3 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="select-all">{selectedOrder.shippingDetails.address}, {selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state} - <strong>{selectedOrder.shippingDetails.pincode}</strong></span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Cart Items and Print Config */}
                <div className="space-y-3 p-4 border border-neutral-200/80 rounded-2xl text-left">
                  <h5 className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider font-bold">PRODUCTION ASSETS</h5>
                  
                  <div className="space-y-3.5">
                    {selectedOrder.cart.map((item: any, idx: number) => (
                      <div key={item.id || idx} className="flex gap-3 pb-3 border-b border-neutral-100 last:border-b-0 last:pb-0 items-start">
                        <div className="h-12 w-12 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 shrink-0 relative">
                          <img src={item.previewUrl} alt="Asset" className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-1.5 grow leading-normal">
                          <div className="flex justify-between font-bold text-neutral-900">
                            <span className="font-serif italic">{item.shapeName}</span>
                            <span>x{item.quantity}</span>
                          </div>
                          
                          <div className="font-mono text-[10px] text-neutral-500 space-y-0.5">
                            <p>📁 Filename: <span className="text-neutral-800 select-all font-bold">{item.photoName || 'web-upload-blob.png'}</span></p>
                            <p>🔎 Scale: <span className="font-bold text-neutral-800">{Math.round((item.photoScale || 1.0) * 100)}%</span> | Pan X/Y: <span className="font-bold text-neutral-800">{Math.round(item.photoPanX || 0)}px, {Math.round(item.photoPanY || 0)}px</span></p>
                            {item.captionText && (
                              <p className="bg-[#FAF8F5] p-1.5 rounded text-neutral-900 border border-neutral-200 italic font-sans font-medium text-[10px]">
                                Caption: "{item.captionText}"
                              </p>
                            )}
                          </div>

                          <div className="flex justify-between pt-1">
                            <a 
                              href={item.previewUrl} 
                              download={item.photoName || 'print_ready_image.png'}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-mono font-bold"
                            >
                              <Download className="h-2.5 w-2.5" />
                              Download Original File
                            </a>
                            <span className="font-mono font-bold text-neutral-900">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Order Fulfillment Timeline History */}
                <div className="space-y-3.5 p-4 border border-neutral-200/80 rounded-2xl text-left">
                  <h5 className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider font-bold">ORDER ACTIVITY LOG</h5>
                  <div className="space-y-3">
                    {selectedOrder.history.map((log: any, idx: number) => (
                      <div key={idx} className="flex gap-2.5 text-[10.5px] leading-normal relative pl-4">
                        <div className="absolute left-1.5 top-1.5 bottom-[-14px] w-[1px] bg-neutral-200 last:hidden" />
                        <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-neutral-200 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                          <div className="h-1 w-1 rounded-full bg-neutral-500" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-mono text-neutral-400 font-bold">{new Date(log.timestamp).toLocaleTimeString('en-IN', { hour12: true })}</p>
                          <p className="font-semibold text-neutral-800 font-sans">{log.status} Log entry</p>
                          <p className="text-neutral-500 font-light italic font-serif">{log.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-neutral-200/60 p-12 text-center text-neutral-500 flex flex-col justify-center items-center space-y-4 shadow-sm min-h-[50vh]">
              <Clipboard className="h-10 w-10 text-neutral-300" />
              <div className="space-y-1">
                <h4 className="font-serif text-base font-light text-neutral-800">Fulfillment Detail panel</h4>
                <p className="text-xs text-neutral-400 font-light max-w-xs mx-auto">Select any order from the active pipeline list to view high-res print files, edit stages, sync logistics, or print labels.</p>
              </div>
            </div>
          )}

          {/* Simulated SMS/Email Notification dispatcher terminal (Live Log Feed) */}
          <div className="bg-neutral-900 text-emerald-400 rounded-3xl p-5 border border-neutral-800 text-left space-y-3 shadow-xl font-mono text-[10px] leading-relaxed">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-[#E8DCCF] font-bold uppercase tracking-wider text-xs">📬 SMS & EMAIL NOTIFICATION FEED</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {actionLog.length === 0 ? (
                <p className="text-neutral-600 italic">Listening for live e-commerce notification dispatches...</p>
              ) : (
                actionLog.map((log, idx) => (
                  <p key={idx} className="text-emerald-500 font-light">{log}</p>
                ))
              )}
            </div>
          </div>

        </div>

      </main>

      {/* --- PRODUCTION PRINT-READY WORK SHEET POPUP (IFRAME SAFE VIEW) --- */}
      {isPrintWorkOrderOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl border border-neutral-300 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            
            {/* SVG ClipPaths for Print Cuts */}
            <svg className="absolute w-0 h-0 pointer-events-none opacity-0 overflow-hidden" aria-hidden="true">
              <defs>
                <clipPath id="heart-print-clip" clipPathUnits="objectBoundingBox">
                  <path d="M 0.5, 0.25 C 0.35, 0.05, 0.05, 0.05, 0.05, 0.35 C 0.05, 0.65, 0.25, 0.85, 0.5, 1 C 0.75, 0.85, 0.95, 0.65, 0.95, 0.35 C 0.95, 0.05, 0.65, 0.05, 0.5, 0.25 Z" />
                </clipPath>
                <clipPath id="arch-print-clip" clipPathUnits="objectBoundingBox">
                  <path d="M 0,0.5 A 0.5,0.5 0 0,1 1,0.5 L 1,1 L 0,1 Z" />
                </clipPath>
                <clipPath id="hexagon-print-clip" clipPathUnits="objectBoundingBox">
                  <path d="M 0.5,0 L 1,0.25 L 1,0.75 L 0.5,1 L 0,0.75 L 0,0.25 Z" />
                </clipPath>
              </defs>
            </svg>

            {/* Sheet Control Header */}
            <div className="bg-neutral-100 p-4 border-b border-neutral-200 flex justify-between items-center">
              <div>
                <h4 className="font-mono text-xs font-bold text-neutral-800 uppercase tracking-widest">Print Room & Laser Cut Work Sheet</h4>
                <p className="text-4xs font-mono text-neutral-500 uppercase tracking-widest mt-1">Order ID: {isPrintWorkOrderOpen.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white transition-all text-2xs font-mono rounded-lg flex items-center gap-1 cursor-pointer font-bold uppercase"
                >
                  <Printer className="h-3 w-3" />
                  <span>Launch Print Room Modal</span>
                </button>
                <button
                  onClick={() => setIsPrintWorkOrderOpen(null)}
                  className="p-1 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer text-neutral-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Print Room Paper sheet layout */}
            <div className="p-8 overflow-y-auto bg-white grow space-y-8 select-all font-sans print:p-0" id="print-work-order-sheet">
              
              {/* Header block */}
              <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-4">
                <div>
                  <h2 className="font-serif text-3xl font-light tracking-tight text-neutral-900">
                    KRIA <span className="font-sans text-sm tracking-widest font-bold border border-neutral-900 px-2 py-0.5 rounded ml-1 bg-neutral-50">STUDIO PRINTS</span>
                  </h2>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">Acrylic Fridge Magnet Custom Manufacturing Sheet</p>
                </div>
                <div className="text-right space-y-1 font-mono text-[10.5px]">
                  <p><strong>WORK ORDER:</strong> {isPrintWorkOrderOpen.id}</p>
                  <p><strong>DATE GENERATED:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                  <p><strong>RECIPIENT:</strong> {isPrintWorkOrderOpen.shippingDetails.fullName}</p>
                </div>
              </div>

              {/* Workflow Checklist Bar */}
              <div className="border border-neutral-300 rounded-xl p-4 bg-neutral-50/50 grid grid-cols-3 gap-4 font-mono text-[11px] uppercase tracking-wider font-bold">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded border border-neutral-400 bg-white flex items-center justify-center text-xs text-neutral-800">
                    {['Paid', 'Processing', 'Printing', 'Quality Check', 'Packed', 'Shipped'].includes(isPrintWorkOrderOpen.status) ? '✓' : ''}
                  </div>
                  <div>
                    <p className="text-neutral-900">1. Order Received</p>
                    <p className="text-[8px] text-neutral-400 font-normal normal-case">Checked upon secure payment approval</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-l border-neutral-200 pl-4">
                  <div className="w-5 h-5 rounded border border-neutral-400 bg-white flex items-center justify-center text-xs text-neutral-800">
                    {isPrintWorkOrderOpen.status === 'Shipped' ? '✓' : ''}
                  </div>
                  <div>
                    <p className="text-neutral-900">2. Order Dispatched</p>
                    <p className="text-[8px] text-neutral-400 font-normal normal-case">Checked when logistics token syncs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-l border-neutral-200 pl-4">
                  <div className="w-5 h-5 rounded border border-neutral-400 bg-white flex items-center justify-center text-xs text-neutral-800">
                    {/* Simulated Delivery tick */}
                  </div>
                  <div>
                    <p className="text-neutral-900">3. Order Delivered</p>
                    <p className="text-[8px] text-neutral-400 font-normal normal-case">Requires Courier API confirmation</p>
                  </div>
                </div>
              </div>

              {/* Specifications guidelines */}
              <div className="grid grid-cols-4 gap-4 p-4.5 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-[10px] text-neutral-600">
                <div>
                  <p className="font-bold text-neutral-900">1. MATERIAL</p>
                  <p>Premium Cast Acrylic</p>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">2. THICKNESS</p>
                  <p>3mm Glossy Polish</p>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">3. BACKING</p>
                  <p>Neodymium Magnet N52</p>
                </div>
                <div>
                  <p className="font-bold text-neutral-900">4. CUT TYPE</p>
                  <p>Polished Laser Carve</p>
                </div>
              </div>

              {/* Visual Print & Cut Out Layout guides */}
              <div className="space-y-6">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-1.5">Print-Room High Resolution Cut Templates</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {isPrintWorkOrderOpen.cart.map((item: any, idx: number) => {
                    // Map shape profiles to clipping paths & outer guidelines
                    let clipStyle: React.CSSProperties = {};
                    let outlineClass = "rounded-none";
                    let sizeLabel = "70 x 70 mm";

                    if (item.shapeId === 'circle') {
                      clipStyle = { borderRadius: '50%' };
                      outlineClass = "rounded-full";
                      sizeLabel = "75 x 75 mm Circle";
                    } else if (item.shapeId === 'heart') {
                      clipStyle = { clipPath: 'url(#heart-print-clip)' };
                      outlineClass = "heart-outline-container";
                      sizeLabel = "80 x 75 mm Heart";
                    } else if (item.shapeId === 'arch') {
                      clipStyle = { clipPath: 'url(#arch-print-clip)' };
                      outlineClass = "arch-outline-container";
                      sizeLabel = "65 x 90 mm Arch";
                    } else if (item.shapeId === 'hexagon') {
                      clipStyle = { clipPath: 'url(#hexagon-print-clip)' };
                      outlineClass = "hexagon-outline-container";
                      sizeLabel = "75 x 85 mm Hexagon";
                    } else if (item.shapeId === 'polaroid') {
                      clipStyle = {};
                      outlineClass = "border-neutral-800 p-2.5 pb-8 bg-white border shadow-sm";
                      sizeLabel = "70 x 90 mm Polaroid Card";
                    } else if (item.shapeId === 'square') {
                      clipStyle = { borderRadius: '12px' };
                      outlineClass = "rounded-xl";
                      sizeLabel = "70 x 70 mm Rounded Square";
                    }

                    return (
                      <div key={idx} className="border border-neutral-200 p-5 rounded-2xl space-y-4 bg-neutral-50/50 print:bg-white print:border-none print:p-0">
                        <div className="flex justify-between items-start font-mono text-[10px]">
                          <div>
                            <p className="font-bold text-neutral-900 uppercase">Item #{idx + 1}: {item.shapeName}</p>
                            <p className="text-neutral-500">Qty: {item.quantity} units</p>
                          </div>
                          <span className="bg-neutral-900 text-white font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">
                            {sizeLabel}
                          </span>
                        </div>

                        {/* 1:1 High-Res Layout Box for laser / manual trimming */}
                        <div className="flex items-center justify-center py-6 bg-white border border-neutral-100 rounded-xl shadow-inner print:shadow-none print:border-none">
                          <div 
                            className={`relative w-44 h-44 border border-dashed border-neutral-400 flex items-center justify-center overflow-hidden transition-all ${outlineClass}`}
                            style={{ 
                              width: item.shapeId === 'arch' ? '140px' : item.shapeId === 'polaroid' ? '140px' : '160px',
                              height: item.shapeId === 'arch' ? '190px' : item.shapeId === 'polaroid' ? '180px' : '160px',
                            }}
                          >
                            <img 
                              src={item.previewUrl} 
                              alt="Production Cut Asset" 
                              className="w-full h-full object-cover select-none"
                              style={{
                                ...clipStyle,
                                transform: `scale(${item.photoScale || 1.0}) translate(${item.photoPanX || 0}px, ${item.photoPanY || 0}px)`
                              }}
                            />
                            
                            {/* Polaroid caption text for physical print emulation */}
                            {item.shapeId === 'polaroid' && item.captionText && (
                              <div className="absolute bottom-1.5 left-0 right-0 text-center font-serif text-[11px] font-bold text-neutral-900 tracking-wide select-none">
                                {item.captionText}
                              </div>
                            )}

                            {/* Center alignment guide crosshair for drilling/alignment (non-printing on final design but good for work) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                              <div className="w-full h-[0.5px] bg-red-500 absolute" />
                              <div className="h-full w-[0.5px] bg-red-500 absolute" />
                            </div>
                          </div>
                        </div>

                        {/* Production metadata */}
                        <div className="font-mono text-[9px] text-neutral-500 space-y-1 bg-neutral-100 p-3 rounded-lg">
                          <p><strong>Image Filename:</strong> {item.photoName || 'asset.jpg'}</p>
                          <p><strong>Applied Crop specs:</strong> Scale: {Math.round((item.photoScale || 1)*100)}% | Offset: X={Math.round(item.photoPanX || 0)}px, Y={Math.round(item.photoPanY || 0)}px</p>
                          {item.captionText && <p><strong>Engraving Caption:</strong> "{item.captionText}"</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer sign off */}
              <div className="pt-12 border-t border-neutral-200 grid grid-cols-2 gap-8 text-[11px] text-neutral-500 font-mono">
                <div className="space-y-4">
                  <p>Quality check guidelines checked & approved:</p>
                  <div className="h-[1px] bg-neutral-400 w-48 mt-8" />
                  <p className="text-4xs uppercase tracking-widest text-neutral-400 leading-none">Print Room Technician signature</p>
                </div>
                <div className="space-y-4 text-right">
                  <p>Packing Supervisor verification scan:</p>
                  <div className="h-[1px] bg-neutral-400 w-48 ml-auto mt-8" />
                  <p className="text-4xs uppercase tracking-widest text-neutral-400 leading-none">Shipping Dispatch clearance signature</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- PRODUCTION SHIPPING LABEL POPUP --- */}
      {isPrintShippingLabelOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-neutral-300 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            
            {/* Controls */}
            <div className="bg-neutral-100 p-4 border-b border-neutral-200 flex justify-between items-center">
              <div>
                <h4 className="font-mono text-xs font-bold text-neutral-800 uppercase tracking-widest">Logistics Invoice Shipping Label</h4>
                <p className="text-4xs font-mono text-neutral-500 uppercase tracking-widest mt-1">Courier: {isPrintShippingLabelOpen.courierName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white transition-all text-2xs font-mono rounded-lg flex items-center gap-1 cursor-pointer font-bold uppercase"
                >
                  <Printer className="h-3 w-3" />
                  <span>Print label</span>
                </button>
                <button
                  onClick={() => setIsPrintShippingLabelOpen(null)}
                  className="p-1 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer text-neutral-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Print paper label container */}
            <div className="p-8 bg-white font-mono text-neutral-950 select-all grow overflow-y-auto" id="print-shipping-label-body">
              <div className="border-4 border-black p-4.5 space-y-4.5 rounded-xl">
                
                {/* Header routing */}
                <div className="flex justify-between items-center border-b-2 border-dashed border-black pb-3">
                  <div>
                    <h3 className="font-sans text-xl font-black leading-none">{isPrintShippingLabelOpen.courierName}</h3>
                    <p className="text-[10px] tracking-wide uppercase font-bold mt-1">Prepaid Premium Air Express</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] leading-none uppercase text-neutral-600">Shiprocket ID</p>
                    <p className="font-bold text-sm select-all mt-1">{isPrintShippingLabelOpen.trackingNumber || 'SRW-9281'}</p>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="py-2.5 flex flex-col items-center justify-center border-b-2 border-dashed border-black">
                  <div className="w-full h-12 bg-neutral-900 flex justify-around p-1">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="h-full bg-white" 
                        style={{ width: `${(i % 5 === 0 || i % 7 === 0) ? '1px' : (i % 3 === 0 ? '3px' : '2px')}` }} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold tracking-[6px] select-all uppercase mt-1">{isPrintShippingLabelOpen.trackingNumber || 'SRW-9281'}</span>
                </div>

                {/* To Recipient Box */}
                <div className="space-y-1.5 border-b-2 border-dashed border-black pb-3">
                  <p className="text-[9px] text-neutral-600 uppercase font-bold">SHIP TO (RECIPIENT):</p>
                  <h4 className="font-sans text-base font-black uppercase text-neutral-950 leading-tight">{isPrintShippingLabelOpen.shippingDetails.fullName}</h4>
                  <div className="text-xs leading-relaxed space-y-0.5">
                    <p className="font-bold">{isPrintShippingLabelOpen.shippingDetails.address}</p>
                    <p className="font-black text-sm uppercase">{isPrintShippingLabelOpen.shippingDetails.city}, {isPrintShippingLabelOpen.shippingDetails.state} - {isPrintShippingLabelOpen.shippingDetails.pincode}</p>
                    <p>Phone: <strong>{isPrintShippingLabelOpen.shippingDetails.phone}</strong></p>
                    <p>Email: <span className="font-normal">{isPrintShippingLabelOpen.shippingDetails.email}</span></p>
                  </div>
                </div>

                {/* Return Sender & Package dimensions */}
                <div className="grid grid-cols-2 gap-4 text-[10px] leading-normal pt-1.5">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-neutral-600 uppercase font-bold">RETURN TO SENDER:</p>
                    <p className="font-bold font-sans">KRIA STUDIO PRINTS</p>
                    <p>Jubilee Tech District, Phase II</p>
                    <p>Hyderabad, Telangana - 500081</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p><span className="text-neutral-600">WEIGHT:</span> <strong>0.35 KG</strong></p>
                    <p><span className="text-neutral-600">DIM:</span> <strong>15 x 15 x 5 cm</strong></p>
                    <p><span className="text-neutral-600">ORDER NO:</span> <strong>{isPrintShippingLabelOpen.id}</strong></p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- CATALOG & PRICING MANAGEMENT MODAL --- */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl border border-neutral-300 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-neutral-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#E8DCCF]" />
                <div>
                  <h3 className="font-serif text-lg text-white font-light">Catalog & Price Manager</h3>
                  <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Adjust Sale Prices, MRP Cutoffs & Inventory Availability</p>
                </div>
              </div>
              <button
                onClick={() => setIsCatalogOpen(false)}
                className="p-1 hover:bg-neutral-800 rounded-full transition-colors text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Catalog List */}
            <div className="p-6 overflow-y-auto grow space-y-4 bg-[#FAF8F5]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BASE_SHAPES.map((shape) => {
                  const currentPrice = shape.price;
                  const isEditingThis = editingProduct?.id === shape.id;

                  return (
                    <div key={shape.id} className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-base font-semibold text-neutral-900">{shape.name}</h4>
                          <span className="font-mono text-[9px] uppercase tracking-wider font-bold bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                            {shape.dimensions}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 line-clamp-2">{shape.description}</p>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block">BASE SELLING PRICE</span>
                          <span className="font-mono text-base font-bold text-neutral-900">₹{currentPrice}</span>
                          <span className="font-mono text-xs text-neutral-400 line-through ml-2">₹{currentPrice + 100}</span>
                        </div>

                        <button
                          onClick={() => {
                            const newPriceStr = prompt(`Enter new Selling Price (₹) for "${shape.name}":`, String(currentPrice));
                            if (newPriceStr) {
                              const newP = parseInt(newPriceStr);
                              if (!isNaN(newP) && newP > 0) {
                                shape.price = newP;
                                setProductsList([...productsList]);
                                setActionLog(prev => [`[${new Date().toLocaleTimeString()}] 🏷 Price for ${shape.name} updated to ₹${newP}`, ...prev]);
                                alert(`Updated price for ${shape.name} to ₹${newP}`);
                              }
                            }
                          }}
                          className="px-3 py-1.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all"
                        >
                          Edit Price
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-neutral-100 p-4 border-t border-neutral-200 flex justify-between items-center text-xs font-mono text-neutral-500">
              <span>{BASE_SHAPES.length} Active Catalog Frame Designs</span>
              <button
                onClick={() => setIsCatalogOpen(false)}
                className="px-5 py-2 bg-neutral-900 text-white font-bold rounded-xl text-xs uppercase font-mono cursor-pointer"
              >
                Close Catalog Manager
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
