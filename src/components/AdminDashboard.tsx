import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, RefreshCw, Printer, CheckCircle, 
  Trash2, ShieldCheck, Truck, ShoppingBag, 
  ExternalLink, Calendar, Phone, Mail, MapPin, 
  Activity, Info, Box, Clipboard, Download, ArrowRight, X, Sparkles, MessageSquare, FileText
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
  const [isPrintTaxInvoiceOpen, setIsPrintTaxInvoiceOpen] = useState<any | null>(null);

  // Download fitted photo framed in its exact selected shape
  const handleDownloadFramedPhoto = (item: any) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, 1200, 1200);
        ctx.save();

        if (item.shapeId === 'circle') {
          ctx.beginPath();
          ctx.arc(600, 600, 500, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
        } else if (item.shapeId === 'heart') {
          ctx.beginPath();
          ctx.moveTo(600, 320);
          ctx.bezierCurveTo(600, 280, 520, 160, 340, 160);
          ctx.bezierCurveTo(160, 160, 160, 420, 160, 420);
          ctx.bezierCurveTo(160, 640, 360, 840, 600, 1080);
          ctx.bezierCurveTo(840, 840, 1040, 640, 1040, 420);
          ctx.bezierCurveTo(1040, 420, 1040, 160, 860, 160);
          ctx.bezierCurveTo(680, 160, 600, 280, 600, 320);
          ctx.closePath();
          ctx.clip();
        } else if (item.shapeId === 'arch') {
          ctx.beginPath();
          ctx.arc(600, 450, 400, Math.PI, 0, false);
          ctx.lineTo(1000, 1050);
          ctx.lineTo(200, 1050);
          ctx.closePath();
          ctx.clip();
        } else {
          ctx.beginPath();
          ctx.roundRect(150, 150, 900, 900, 40);
          ctx.closePath();
          ctx.clip();
        }

        ctx.drawImage(img, 0, 0, 1200, 1200);
        ctx.restore();

        const link = document.createElement('a');
        link.download = `fitted_${item.shapeId || 'photo'}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      img.src = item.previewUrl;
    } catch (e: any) {
      alert("Could not generate fitted photo download: " + e.message);
    }
  };

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
  const [catalogForm, setCatalogForm] = useState<any | null>(null);

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

  const saveProduct = async (product: any) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(product)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save product');
      await fetchProducts();
      setEditingProduct(null);
      setCatalogForm(null);
      setActionLog(prev => [`[${new Date().toLocaleTimeString()}] ✅ ${product.name} saved to catalog`, ...prev]);
      return true;
    } catch (e: any) {
      alert(e.message || 'Failed to save product');
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Hide this product from the catalog?')) return false;
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to hide product');
      await fetchProducts();
      setActionLog(prev => [`[${new Date().toLocaleTimeString()}] 👁️ Product hidden from catalog`, ...prev]);
      return true;
    } catch (e: any) {
      alert(e.message || 'Failed to hide product');
      return false;
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPrintWorkOrderOpen(order);
                          }}
                          className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white rounded-lg text-[9px] font-mono font-bold uppercase transition flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Printer className="h-2.5 w-2.5 text-[#E8DCCF]" />
                          <span>Photo</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPrintTaxInvoiceOpen(order);
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[9px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="h-2.5 w-2.5" />
                          <span>Invoice</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPrintShippingLabelOpen(order);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[9px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="h-2.5 w-2.5" />
                          <span>Label</span>
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

                {/* 2. Dedicated 1-Click Print Operations Bar */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setIsPrintWorkOrderOpen(selectedOrder)}
                    className="py-2.5 px-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-[10px] font-mono tracking-wider font-bold uppercase flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                  >
                    <Printer className="h-4 w-4 text-[#E8DCCF]" />
                    <span>📷 Print Photo</span>
                  </button>

                  <button
                    onClick={() => setIsPrintTaxInvoiceOpen(selectedOrder)}
                    className="py-2.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-mono tracking-wider font-bold uppercase flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>🧾 Tax Invoice</span>
                  </button>

                  <button
                    onClick={() => setIsPrintShippingLabelOpen(selectedOrder)}
                    className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-mono tracking-wider font-bold uppercase flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Truck className="h-4 w-4 text-emerald-600" />
                    <span>🏷️ Parcel Label</span>
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

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownloadFramedPhoto(item)}
                                className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 font-mono font-bold cursor-pointer"
                                title="Download fitted PNG asset"
                              >
                                <Download className="h-2.5 w-2.5" />
                                <span>Fitted PNG</span>
                              </button>
                              <a 
                                href={item.previewUrl} 
                                download={item.photoName || 'raw_upload.png'}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-neutral-400 hover:text-neutral-700 hover:underline flex items-center gap-1 font-mono"
                                title="Download original uncropped raw file if needed"
                              >
                                Raw Upload
                              </a>
                            </div>
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
                <h4 className="font-mono text-xs font-bold text-neutral-800 uppercase tracking-widest">🖨️ 4x6 Photo Paper Print Sheet</h4>
                <p className="text-4xs font-mono text-neutral-500 uppercase tracking-widest mt-1">Order ID: {isPrintWorkOrderOpen.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white transition-all text-2xs font-mono rounded-lg flex items-center gap-1 cursor-pointer font-bold uppercase"
                >
                  <Printer className="h-3 w-3 text-[#E8DCCF]" />
                  <span>Print 4x6 Photo Paper</span>
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
            <div className="p-8 overflow-y-auto bg-white grow space-y-8 select-all font-sans print:p-0" id="print-photo-sheet-body">
              
              {/* Header block (hidden when printing on glossy photo paper) */}
              <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-4 print:hidden">
                <div>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-900">
                    4x6 Photo Paper Print & Cut Sheet
                  </h2>
                  <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest mt-1">Print on standard 4x6" Glossy Photo Paper • Cut along line & insert in Magnetic Frame</p>
                </div>
                <div className="text-right space-y-1 font-mono text-[11px]">
                  <p><strong>ORDER NO:</strong> {isPrintWorkOrderOpen.id}</p>
                  <p><strong>DATE:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                  <p><strong>CUSTOMER:</strong> {isPrintWorkOrderOpen.shippingDetails.fullName}</p>
                </div>
              </div>

              {/* 4x6 Photo Paper Print Grid */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {isPrintWorkOrderOpen.cart.map((item: any, idx: number) => {
                    let clipStyle: React.CSSProperties = {};
                    let outlineClass = "rounded-none";
                    let sizeLabel = "Standard Cut Out";

                    if (item.shapeId === 'circle') {
                      clipStyle = { borderRadius: '50%' };
                      outlineClass = "rounded-full";
                      sizeLabel = "Circle Frame Cut";
                    } else if (item.shapeId === 'heart') {
                      clipStyle = { clipPath: 'url(#heart-print-clip)' };
                      outlineClass = "heart-outline-container";
                      sizeLabel = "Heart Frame Cut";
                    } else if (item.shapeId === 'arch') {
                      clipStyle = { clipPath: 'url(#arch-print-clip)' };
                      outlineClass = "arch-outline-container";
                      sizeLabel = "Arch Frame Cut";
                    } else if (item.shapeId === 'hexagon') {
                      clipStyle = { clipPath: 'url(#hexagon-print-clip)' };
                      outlineClass = "hexagon-outline-container";
                      sizeLabel = "Hexagon Frame Cut";
                    } else if (item.shapeId === 'polaroid') {
                      clipStyle = {};
                      outlineClass = "border-neutral-800 p-2.5 pb-8 bg-white border shadow-sm";
                      sizeLabel = "Polaroid Frame Cut";
                    } else if (item.shapeId === 'square') {
                      clipStyle = { borderRadius: '12px' };
                      outlineClass = "rounded-xl";
                      sizeLabel = "Square Frame Cut";
                    }

                    return (
                      <div key={idx} className="border-2 border-neutral-300 p-5 rounded-2xl space-y-4 bg-white print:border-none print:p-0">
                        <div className="flex justify-between items-start font-mono text-[11px]">
                          <div>
                            <p className="font-bold text-neutral-900 uppercase">Item #{idx + 1}: {item.shapeName}</p>
                            <p className="text-neutral-500 font-semibold">Qty: {item.quantity} Frame(s)</p>
                          </div>
                          <span className="bg-black text-white font-bold px-2.5 py-1 rounded text-[9px] uppercase tracking-wider">
                            {sizeLabel}
                          </span>
                        </div>

                        {/* Clean 4x6 Photo Print Box */}
                        <div className="flex flex-col items-center justify-center p-4 bg-white border border-neutral-200 rounded-xl print:bg-white print:border-none">
                          <div 
                            className={`relative flex items-center justify-center overflow-hidden transition-all shadow-md ${outlineClass}`}
                            style={{ 
                              width: item.shapeId === 'arch' ? '150px' : item.shapeId === 'polaroid' ? '150px' : '170px',
                              height: item.shapeId === 'arch' ? '200px' : item.shapeId === 'polaroid' ? '190px' : '170px',
                            }}
                          >
                            <img 
                              src={item.previewUrl} 
                              alt="Customer Photo Print Asset" 
                              className="w-full h-full object-cover select-none"
                              style={{
                                ...clipStyle,
                                transform: `scale(${item.photoScale || 1.0}) translate(${item.photoPanX || 0}px, ${item.photoPanY || 0}px)`
                              }}
                            />
                            
                            {item.shapeId === 'polaroid' && item.captionText && (
                              <div className="absolute bottom-2 left-0 right-0 text-center font-serif text-[12px] font-bold text-neutral-900 tracking-wide select-none bg-white/90 py-1">
                                {item.captionText}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="font-mono text-[11px] text-neutral-600 bg-neutral-100 p-3 rounded-xl flex flex-wrap justify-between items-center gap-2 print:hidden">
                          <span>Frame Model: <strong>{item.shapeName}</strong> (Qty: {item.quantity})</span>
                          <button
                            onClick={() => handleDownloadFramedPhoto(item)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-mono font-bold text-[10px] uppercase flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download Fitted 4x6 Photo (PNG)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                  <div className="flex justify-between items-start">
                    <p className="text-[9px] text-neutral-600 uppercase font-bold">SHIP TO (RECIPIENT):</p>
                    <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-wider rounded">PREPAID - DO NOT COLLECT CASH</span>
                  </div>
                  <h4 className="font-sans text-base font-black uppercase text-neutral-950 leading-tight">{isPrintShippingLabelOpen.shippingDetails.fullName}</h4>
                  <div className="text-xs leading-relaxed space-y-0.5">
                    <p className="font-bold">{isPrintShippingLabelOpen.shippingDetails.address}</p>
                    <p className="font-black text-sm uppercase">{isPrintShippingLabelOpen.shippingDetails.city}, {isPrintShippingLabelOpen.shippingDetails.state} - {isPrintShippingLabelOpen.shippingDetails.pincode}</p>
                    <p>Phone: <strong>{isPrintShippingLabelOpen.shippingDetails.phone}</strong></p>
                    <p>Email: <span className="font-normal">{isPrintShippingLabelOpen.shippingDetails.email}</span></p>
                  </div>
                </div>

                {/* Itemized Product Manifest Table */}
                <div className="border-b-2 border-dashed border-black pb-3 space-y-1.5">
                  <p className="text-[9px] text-neutral-600 uppercase font-bold">PACKAGE CONTENTS ({isPrintShippingLabelOpen.cart?.length || 1} ITEMS):</p>
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-black font-bold">
                        <th className="py-1">ITEM / SHAPE</th>
                        <th className="py-1 text-center">QTY</th>
                        <th className="py-1 text-right">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(isPrintShippingLabelOpen.cart || []).map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-neutral-200">
                          <td className="py-1 font-bold truncate max-w-[180px]">{item.shapeName || "Acrylic Magnet"} ({item.shapeId || "custom"})</td>
                          <td className="py-1 text-center font-bold">{item.quantity}</td>
                          <td className="py-1 text-right font-bold">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    <p><span className="text-neutral-600">TOTAL PAID:</span> <strong>₹{isPrintShippingLabelOpen.grandTotal}</strong></p>
                    <p><span className="text-neutral-600">WEIGHT:</span> <strong>0.35 KG</strong></p>
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
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-serif text-sm text-neutral-700">Edit existing product prices, MRP values, and storefront visibility.</p>
                </div>
                <span className="px-3 py-2 bg-neutral-900 text-white rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider">
                  Existing Products Only
                </span>
              </div>

              {catalogForm && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <input value={catalogForm.name} onChange={(e) => setCatalogForm({...catalogForm, name: e.target.value})} placeholder="Product name" className="rounded-xl border px-3 py-2 text-sm" />
                    <input type="number" value={catalogForm.price} onChange={(e) => setCatalogForm({...catalogForm, price: Number(e.target.value)})} placeholder="Sale price" className="rounded-xl border px-3 py-2 text-sm" />
                    <input type="number" value={catalogForm.originalPrice} onChange={(e) => setCatalogForm({...catalogForm, originalPrice: Number(e.target.value)})} placeholder="MRP" className="rounded-xl border px-3 py-2 text-sm" />
                    <input value={catalogForm.dimensions} onChange={(e) => setCatalogForm({...catalogForm, dimensions: e.target.value})} placeholder="Dimensions" className="rounded-xl border px-3 py-2 text-sm" />
                  </div>
                  <textarea value={catalogForm.description} onChange={(e) => setCatalogForm({...catalogForm, description: e.target.value})} placeholder="Description" className="w-full rounded-xl border px-3 py-2 text-sm" rows={3} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={catalogForm.isTrending} onChange={(e) => setCatalogForm({...catalogForm, isTrending: e.target.checked})} />
                    Visible in ecommerce catalog
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => saveProduct(catalogForm)} className="px-3 py-2 bg-[#111111] text-white rounded-lg text-xs font-bold uppercase tracking-wider">Save Changes</button>
                    <button onClick={() => { setCatalogForm(null); setEditingProduct(null); }} className="px-3 py-2 bg-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider">Cancel</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productsList.map((product) => {
                  const currentPrice = Number(product.price || 0);
                  const originalPrice = Number(product.originalPrice || currentPrice + 100);
                  const visible = Boolean(product.isTrending ?? true);

                  return (
                    <div key={product.id} className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-base font-semibold text-neutral-900">{product.name}</h4>
                          <span className="font-mono text-[9px] uppercase tracking-wider font-bold bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                            {product.dimensions || 'Standard'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 line-clamp-2">{product.description || product.tagline}</p>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 space-y-3">
                        <div>
                          <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block">SALE PRICE</span>
                          <span className="font-mono text-base font-bold text-neutral-900">₹{currentPrice}</span>
                          <span className="font-mono text-xs text-neutral-400 line-through ml-2">₹{originalPrice}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              const newPriceStr = prompt(`Enter new Sale Price (₹) for "${product.name}":`, String(currentPrice));
                              if (newPriceStr) {
                                const newP = parseInt(newPriceStr);
                                if (!isNaN(newP) && newP > 0) {
                                  saveProduct({ ...product, price: newP, originalPrice: product.originalPrice ?? originalPrice });
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all"
                          >
                            Edit Price
                          </button>
                          <button
                            onClick={() => {
                              const newMrpStr = prompt(`Enter new MRP (₹) for "${product.name}":`, String(originalPrice));
                              if (newMrpStr) {
                                const newMrp = parseInt(newMrpStr);
                                if (!isNaN(newMrp) && newMrp >= 0) {
                                  saveProduct({ ...product, originalPrice: newMrp, price: currentPrice });
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider"
                          >
                            Edit MRP
                          </button>
                          <button
                            onClick={() => {
                              const nextValue = !visible;
                              saveProduct({ ...product, isTrending: nextValue, price: currentPrice, originalPrice: product.originalPrice ?? originalPrice });
                            }}
                            className="px-3 py-1.5 bg-neutral-200 text-neutral-800 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider"
                          >
                            {visible ? 'Hide from Store' : 'Show on Store'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-neutral-100 p-4 border-t border-neutral-200 flex justify-between items-center text-xs font-mono text-neutral-500">
              <span>{productsList.length} Active Catalog Products</span>
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

      {/* --- FORMAL GST TAX INVOICE POPUP --- */}
      {isPrintTaxInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-neutral-300 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            
            {/* Controls Header */}
            <div className="bg-neutral-100 p-4 border-b border-neutral-200 flex justify-between items-center print:hidden">
              <div>
                <h4 className="font-mono text-xs font-bold text-neutral-800 uppercase tracking-widest">GST Tax Invoice / Bill of Supply</h4>
                <p className="text-4xs font-mono text-neutral-500 uppercase tracking-widest mt-1">Order ID: {isPrintTaxInvoiceOpen.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white transition-all text-2xs font-mono rounded-lg flex items-center gap-1 cursor-pointer font-bold uppercase"
                >
                  <Printer className="h-3 w-3 text-white" />
                  <span>Print Tax Invoice</span>
                </button>
                <button
                  onClick={() => setIsPrintTaxInvoiceOpen(null)}
                  className="p-1 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer text-neutral-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Document Container */}
            <div className="p-8 bg-white font-sans text-neutral-900 select-all grow overflow-y-auto" id="print-tax-invoice-body">
              
              {/* Header Seller & Buyer Grid */}
              <div className="border-b-2 border-neutral-900 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-900">
                    KRIA <span className="font-sans text-xs tracking-widest font-bold border border-neutral-900 px-2 py-0.5 rounded ml-1 bg-neutral-50">STUDIO PRINTS</span>
                  </h2>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">GST Tax Invoice / Bill of Supply</p>
                  <div className="text-[11px] font-mono text-neutral-600 mt-2 space-y-0.5">
                    <p><strong>KRIA STUDIO PRIVATE LIMITED</strong></p>
                    <p>Jubilee Tech District, Phase II, Hyderabad - 500085</p>
                    <p>GSTIN: 36AAAFK7892P1Z0 | State: Telangana (36)</p>
                    <p>Email: support@kriastudio.in | Phone: +91 7893194974</p>
                  </div>
                </div>
                <div className="text-right space-y-1 font-mono text-[11px] bg-neutral-50 p-3 border border-neutral-200 rounded-xl">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold">INVOICE DETAILS</p>
                  <p><strong>INVOICE NO:</strong> INV-{isPrintTaxInvoiceOpen.id.replace('KRIA-', '')}</p>
                  <p><strong>DATE:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                  <p><strong>ORDER NO:</strong> {isPrintTaxInvoiceOpen.id}</p>
                  <p className="text-emerald-700 font-bold uppercase pt-1">PAYMENT: PREPAID (ONLINE)</p>
                </div>
              </div>

              {/* Bill To / Ship To Grid */}
              <div className="grid grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-xl bg-neutral-50/50 mb-6 font-mono text-[11px]">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">BILLED & SHIPPED TO:</p>
                  <p className="font-bold text-neutral-900 text-sm font-sans">{isPrintTaxInvoiceOpen.shippingDetails.fullName}</p>
                  <p className="text-neutral-700 mt-1">{isPrintTaxInvoiceOpen.shippingDetails.address}</p>
                  <p className="text-neutral-900 font-bold">{isPrintTaxInvoiceOpen.shippingDetails.city}, {isPrintTaxInvoiceOpen.shippingDetails.state} - {isPrintTaxInvoiceOpen.shippingDetails.pincode}</p>
                  <p className="text-neutral-600 mt-1">Phone: <strong>{isPrintTaxInvoiceOpen.shippingDetails.phone}</strong></p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold">LOGISTICS DETAILS</p>
                  <p>Courier: <strong>{isPrintTaxInvoiceOpen.courierName}</strong></p>
                  <p>AWB Tracking: <strong>{isPrintTaxInvoiceOpen.trackingNumber || 'Pending Sync'}</strong></p>
                  <p>Place of Supply: <strong>{isPrintTaxInvoiceOpen.shippingDetails.state}</strong></p>
                </div>
              </div>

              {/* Itemized Invoice Table */}
              <div className="border border-neutral-300 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead className="bg-neutral-100 text-neutral-800 border-b border-neutral-300 font-bold">
                    <tr>
                      <th className="p-2.5">S.NO</th>
                      <th className="p-2.5">ITEM DESCRIPTION</th>
                      <th className="p-2.5 text-center">HSN/SAC</th>
                      <th className="p-2.5 text-center">QTY</th>
                      <th className="p-2.5 text-right">UNIT PRICE</th>
                      <th className="p-2.5 text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {(isPrintTaxInvoiceOpen.cart || []).map((item: any, idx: number) => {
                      const itemTotal = item.price * item.quantity;
                      return (
                        <tr key={idx}>
                          <td className="p-2.5">{idx + 1}</td>
                          <td className="p-2.5 font-bold font-sans">{item.shapeName || "Custom Acrylic Magnet"} ({item.shapeId})</td>
                          <td className="p-2.5 text-center font-mono text-neutral-600">39269099</td>
                          <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                          <td className="p-2.5 text-right">₹{item.price}</td>
                          <td className="p-2.5 text-right font-bold">₹{itemTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Calculation & Tax Summary Footer */}
              <div className="grid grid-cols-2 gap-6 items-start font-mono text-[11px]">
                <div className="border border-neutral-200 p-3 rounded-xl bg-neutral-50 text-neutral-600 space-y-1">
                  <p className="font-bold text-neutral-900 uppercase text-[10px]">TAX BREAKUP SUMMARY</p>
                  <p>CGST (9%): ₹{Math.round((isPrintTaxInvoiceOpen.subtotal || isPrintTaxInvoiceOpen.grandTotal) * 0.09)}</p>
                  <p>SGST (9%): ₹{Math.round((isPrintTaxInvoiceOpen.subtotal || isPrintTaxInvoiceOpen.grandTotal) * 0.09)}</p>
                  <p className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-200">All prices are inclusive of applicable GST taxes.</p>
                </div>
                <div className="space-y-2 text-right bg-neutral-50 p-4 border border-neutral-200 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SUBTOTAL:</span>
                    <span className="font-bold">₹{isPrintTaxInvoiceOpen.subtotal || isPrintTaxInvoiceOpen.grandTotal}</span>
                  </div>
                  {isPrintTaxInvoiceOpen.bulkDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>BULK DISCOUNT:</span>
                      <span>-₹{isPrintTaxInvoiceOpen.bulkDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SHIPPING CHARGE:</span>
                    <span>{isPrintTaxInvoiceOpen.deliveryCharge === 0 ? "FREE" : `₹${isPrintTaxInvoiceOpen.deliveryCharge}`}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-sm font-bold text-neutral-950">
                    <span>GRAND TOTAL PAID:</span>
                    <span>₹{isPrintTaxInvoiceOpen.grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Signature & Declaration */}
              <div className="pt-8 mt-6 border-t border-neutral-200 grid grid-cols-2 gap-4 text-[10px] font-mono text-neutral-500">
                <div>
                  <p className="font-bold text-neutral-800 uppercase">Declaration:</p>
                  <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
                </div>
                <div className="text-right space-y-4">
                  <p className="font-bold text-neutral-900 uppercase">For KRIA STUDIO PRIVATE LIMITED</p>
                  <div className="h-8" />
                  <p className="text-4xs uppercase tracking-widest text-neutral-400">Authorized Signatory</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
