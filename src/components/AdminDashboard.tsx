import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, RefreshCw, Printer, CheckCircle, CheckCircle2,
  Trash2, ShieldCheck, Truck, ShoppingBag, 
  ExternalLink, Calendar, Phone, Mail, MapPin, 
  Activity, Info, Box, Clipboard, Download, ArrowRight, X, Sparkles, MessageSquare, 
  FileText, BarChart3, TrendingUp, Ticket, Building2, Search, AlertTriangle, 
  Layers, Check, Clock, ChevronRight, Copy, CheckSquare, Square, 
  SlidersHorizontal, PackageCheck, AlertCircle, FileCheck, Eye, LogOut,
  Volume2, VolumeX, Crop, RotateCcw, DollarSign, Users, Tag
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { BASE_SHAPES } from '../data';
import CMSCropEditorModal from './admin/CMSCropEditorModal';
import ExceptionsQueueView from './admin/ExceptionsQueueView';
import CustomerManagementView from './admin/CustomerManagementView';
import RefundsReplacementsView from './admin/RefundsReplacementsView';
import OffersCouponsView from './admin/OffersCouponsView';
import ExecutiveAnalyticsView from './admin/ExecutiveAnalyticsView';
import FullSettingsView from './admin/FullSettingsView';

interface AdminDashboardProps {
  onBackToHome: () => void;
  adminToken: string;
}

// ── Web Audio Luxury Chime Synthesizer ───────────────────────────────────────
function playNewOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12); // B5
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

// ── Shape Silhouette Cutting Outline Helper for 4x6 Photo Prints ─────────────
function drawShapeCutOutline(ctx: CanvasRenderingContext2D, shapeId: string, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.setLineDash([8, 5]);
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';

  switch (shapeId) {
    case 'love': {
      ctx.beginPath();
      const topCurveHeight = h * 0.3;
      ctx.moveTo(x + w / 2, y + h);
      ctx.bezierCurveTo(x, y + h * 0.6, x, y + topCurveHeight, x + w * 0.25, y + topCurveHeight * 0.3);
      ctx.bezierCurveTo(x + w * 0.4, y, x + w / 2, y + topCurveHeight * 0.6, x + w / 2, y + topCurveHeight * 0.8);
      ctx.bezierCurveTo(x + w / 2, y + topCurveHeight * 0.6, x + w * 0.6, y, x + w * 0.75, y + topCurveHeight * 0.3);
      ctx.bezierCurveTo(x + w, y + topCurveHeight, x + w, y + h * 0.6, x + w / 2, y + h);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'circle':
    case 'circle-bloom': {
      ctx.beginPath();
      const r = Math.min(w, h) / 2;
      ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'arch': {
      ctx.beginPath();
      const r = w / 2;
      ctx.arc(x + r, y + r, r, Math.PI, 0, false);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'hexagon': {
      ctx.beginPath();
      const hw = w / 2;
      ctx.moveTo(x + hw * 0.5, y);
      ctx.lineTo(x + hw * 1.5, y);
      ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + hw * 1.5, y + h);
      ctx.lineTo(x + hw * 0.5, y + h);
      ctx.lineTo(x, y + h / 2);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'oval': {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    default: {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

// ── 4x6 Photo Paper Canvas Component with Cut Line Outlines ──────────────────
function ShapedPhotoCanvasPrint({ 
  item, 
  orderId = 'ORDER', 
  itemIdx = 0, 
  photoMode = 'adjusted' 
}: { 
  item: any; 
  orderId?: string; 
  itemIdx?: number; 
  photoMode?: 'adjusted' | 'original'; 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard 4x6 Photo Paper Dimensions (600px x 900px, 300 DPI preview)
    const W = 600;
    const H = 900;
    canvas.width = W;
    canvas.height = H;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);

      // Sizing calculation for photo inside 4x6 sheet
      const imgRatio = (img.width || 1) / (img.height || 1);
      let drawW = 460;
      let drawH = 460 / imgRatio;
      if (drawH > 700) {
        drawH = 700;
        drawW = 700 * imgRatio;
      }

      const drawX = (W - drawW) / 2;
      const drawY = (H - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Draw dashed cutting guide outline for this specific shape
      drawShapeCutOutline(ctx, item.shapeId || 'frame', drawX, drawY, drawW, drawH);

      // Print order & cut text in margins outside the photo
      ctx.fillStyle = '#777777';
      ctx.font = '11px sans-serif';
      ctx.fillText(`✂ CUT ALONG DASHED LINE · KRIA STUDIO #${orderId} · FRAME ${itemIdx + 1} (${item.shapeName || item.shapeId})`, 25, 35);
      ctx.fillText(`4×6 PHOTO SHEET · MODE: ${photoMode.toUpperCase()} · ${item.quantity || 1} UNIT(S)`, 25, H - 25);
    };

    const targetUrl = photoMode === 'original' ? (item.originalUrl || item.previewUrl) : item.previewUrl;
    img.src = targetUrl;
  }, [item, orderId, itemIdx, photoMode]);

  return (
    <div className="w-full flex flex-col items-center justify-center print-photo-page py-4 print:py-0">
      <canvas 
        ref={canvasRef} 
        className="w-full max-w-[340px] h-auto shadow-md border border-neutral-200 block print:shadow-none print:border-none print:max-w-none print:w-[4in] print:h-[6in]"
      />
    </div>
  );
}

function getSafePhotoUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '/images/Landingprofile.png';
  if (url.includes('localhost:') || url.includes('127.0.0.1:')) {
    return '/images/Landingprofile.png';
  }
  return url;
}

function getOrderAge(createdAt?: string): string {
  if (!createdAt) return 'recently';
  const diffMs = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getShipByDate(createdAt?: string): string {
  const d = createdAt ? new Date(createdAt) : new Date();
  d.setDate(d.getDate() + 2);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function AdminDashboard({ onBackToHome, adminToken }: AdminDashboardProps) {
  // Navigation & View State (11 Standard Operations Modules)
  const [activeNav, setActiveNav] = useState<
    'dashboard' | 'orders' | 'production' | 'logistics' | 'exceptions' | 'customers' | 'refunds' | 'products' | 'offers' | 'analytics' | 'settings' | 'b2b' | 'coupons'
  >('dashboard');
  
  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Alerts & Realtime
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const prevOrdersCountRef = useRef(0);
  const [newOrderToast, setNewOrderToast] = useState<string | null>(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'All' | 'Pending' | 'Production' | 'Quality Check' | 'Packed' | 'Shipped' | 'Exceptions'>('All');
  const [productionStageTab, setProductionStageTab] = useState<'print' | 'assembly' | 'qc' | 'packed'>('print');
  const [logisticsFilter, setLogisticsFilter] = useState<'all' | 'needs_shipment' | 'needs_pickup' | 'in_transit'>('all');

  // Bulk Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Modals & Precision Tools
  const [isPrintTaxInvoiceOpen, setIsPrintTaxInvoiceOpen] = useState<any | null>(null);
  const [isPrintWorkOrderOpen, setIsPrintWorkOrderOpen] = useState<any | null>(null);
  const [workOrderPrintMode, setWorkOrderPrintMode] = useState<Record<number, 'adjusted' | 'original'>>({});
  const [isZippingOrderId, setIsZippingOrderId] = useState<string | null>(null);
  const [isPhotoInspectModalOpen, setIsPhotoInspectModalOpen] = useState<{ order: any; item: any; index: number } | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCropEditorOpen, setIsCropEditorOpen] = useState<{ order: any; itemIndex: number; item: any } | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState<{ order: any } | null>(null);
  const [refundForm, setRefundForm] = useState({ amount: 0, reason: 'Customer requested refund' });
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [orderInternalNote, setOrderInternalNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingPriceProduct, setEditingPriceProduct] = useState<any | null>(null);
  const [editPriceForm, setEditPriceForm] = useState<{ price: number; originalPrice: number }>({ price: 0, originalPrice: 0 });

  // Catalog, B2B, Coupons & Settings State
  const [productsList, setProductsList] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [catalogForm, setCatalogForm] = useState<any | null>(null);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [newCouponForm, setNewCouponForm] = useState({ code: '', type: 'percent', value: 10, label: 'Special Discount', minOrderValue: 0 });
  const [b2bProducts, setB2bProducts] = useState([
    { id: 'b2b-4x6', name: '4x6 Acrylic Magnetic Frame', basePrice: 220, moq: 10 },
    { id: 'b2b-5x7', name: '5x7 Grand Magnetic Frame', basePrice: 320, moq: 5 },
    { id: 'b2b-arch', name: 'Arch Tabletop Magnet Frame', basePrice: 240, moq: 10 },
  ]);
  const [b2bTiers, setB2bTiers] = useState([
    { label: 'Starter Pack', minUnits: 5, discountPercent: 10 },
    { label: 'Studio Volume', minUnits: 20, discountPercent: 20 },
    { label: 'Corporate Gifting', minUnits: 50, discountPercent: 30 },
    { label: 'Enterprise & Agency', minUnits: 100, discountPercent: 40 },
  ]);
  const [businessSettings, setBusinessSettings] = useState<any>({
    company_name: 'KRIA Studio Luxury Prints',
    support_phone: '+91 9392576792',
    support_email: 'kriatechgroup@gmail.com',
    registered_address: 'Jubilee Tech Zone, Phase II, Kukatpally, Hyderabad, Telangana 500085',
    gstin: '36AAAFK7892P1Z0',
    shipping_free_threshold: 699,
    flat_shipping_rate: 60,
    meta_launch_offer_enabled: true,
    bundle_3_price: 799,
    bundle_3_free_shipping: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState<string | null>(null);
  const [warehouseForm, setWarehouseForm] = useState<any>({
    id: 'wh_primary',
    name: 'KRIA Central Fulfillment Hub',
    address1: 'Jubilee Tech Zone, Phase II',
    address2: 'Kukatpally Industrial Area',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500085',
    phone: '+91 9392576792',
    email: 'kriatechgroup@gmail.com',
    gstin: '36AAAFK7892P1Z0'
  });

  // ── Data Fetching & Realtime Polling ───────────────────────────────────────
  const fetchOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/orders', { 
        headers: { Authorization: `Bearer ${adminToken}` } 
      });
      if (response.ok) {
        const data = await response.json();
        const freshOrders = data.orders || [];

        // Audio chime and toast notification when new orders arrive
        if (freshOrders.length > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
          const diff = freshOrders.length - prevOrdersCountRef.current;
          if (isAudioEnabled) playNewOrderChime();
          setNewOrderToast(`🔔 ${diff} New order(s) received!`);
          setTimeout(() => setNewOrderToast(null), 5000);
        }
        prevOrdersCountRef.current = freshOrders.length;

        setOrders(freshOrders);
        setLastRefreshedAt(new Date());

        // Refresh selected order in drawer if open
        if (selectedOrder) {
          const updated = freshOrders.find((o: any) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      } else {
        const err = await response.json();
        if (!silent) setError(err.error || 'Failed to fetch orders from server.');
      }
    } catch (e: any) {
      if (!silent) setError(e.message || 'Server connection error.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };


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

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons', { 
        headers: { Authorization: `Bearer ${adminToken}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setCouponsList(data.coupons || []);
      }
    } catch (e) {
      console.error("Failed to fetch coupons", e);
    }
  };

  const fetchSettingsAndWarehouse = async () => {
    try {
      const sRes = await fetch('/api/admin/settings', { 
        headers: { Authorization: `Bearer ${adminToken}` } 
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData) {
          setBusinessSettings((prev: any) => ({ ...prev, ...sData }));
          if (sData.b2b_tiers) {
            try { setB2bTiers(JSON.parse(sData.b2b_tiers)); } catch {}
          }
          if (sData.b2b_products) {
            try { setB2bProducts(JSON.parse(sData.b2b_products)); } catch {}
          }
        }
      }
      const wRes = await fetch('/api/warehouses', { 
        headers: { Authorization: `Bearer ${adminToken}` } 
      });
      if (wRes.ok) {
        const wData = await wRes.json();
        if (Array.isArray(wData) && wData.length > 0) {
          setWarehouseForm(wData[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch settings/warehouse', e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCoupons();
    fetchSettingsAndWarehouse();

    // Live Sync Polling every 8 seconds
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [adminToken]);

  // ── Actions & API Handlers ──────────────────────────────────────────────────
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
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
        setActionLog(prev => [
          `[${new Date().toLocaleTimeString()}] Order #${orderId} moved to "${nextStatus}"`,
          ...prev
        ]);
      } else {
        const err = await response.json();
        alert(err.error || 'Status update failed.');
      }
    } catch (e: any) {
      alert('Error updating status: ' + e.message);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleSyncShiprocket = async (orderId: string) => {
    setIsUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/sync-shiprocket`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
        setActionLog(prev => [
          `[${new Date().toLocaleTimeString()}] 🚚 Shiprocket shipment created for #${orderId}. AWB: ${data.order.trackingNumber || 'Pending'}`,
          ...prev
        ]);
        alert(`Shiprocket shipment created! Courier: ${data.order.courierName || 'Assigned'}, AWB: ${data.order.trackingNumber || 'Assigned'}`);
      } else {
        alert(data.error || 'Shiprocket sync failed');
      }
    } catch (e: any) {
      alert('Shiprocket connection error: ' + e.message);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleScheduleCourierPickup = async (orderId: string) => {
    setIsUpdatingStatus(orderId);
    try {
      const res = await fetch('/api/shiprocket/schedule-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchOrders(true);
        setActionLog(prev => [
          `[${new Date().toLocaleTimeString()}] 📦 Courier pickup scheduled for Order #${orderId}`,
          ...prev
        ]);
        alert(data.message || 'Pickup scheduled successfully with courier partner!');
      } else {
        alert(data.error || 'Failed to schedule pickup');
      }
    } catch (err: any) {
      alert('Pickup scheduling error: ' + err.message);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleGeneratePDFLabel = (order: any) => {
    if (order.shiprocketLabelUrl) {
      window.open(order.shiprocketLabelUrl, '_blank');
      return;
    }
    const trackingNum = order.trackingNumber;
    if (!trackingNum) {
      alert("No AWB tracking number assigned yet. Create a Shiprocket shipment first.");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150]
      });

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.rect(4, 4, 92, 142);

      doc.setLineWidth(0.5);
      doc.line(4, 25, 96, 25);
      doc.line(4, 55, 96, 55);
      doc.line(4, 110, 96, 110);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text((order.courierName || "SHIPROCKET EXPRESS").toUpperCase(), 8, 12);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("PREPAID AIR EXPRESS · FULFILLMENT CARRIER", 8, 17);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("AWB REF: " + trackingNum, 8, 22);

      // Barcode simulation
      let startX = 8;
      for (let i = 0; i < 40; i++) {
        const charCode = trackingNum.charCodeAt(i % trackingNum.length) || 48;
        const thickness = (charCode % 3 === 0) ? 1.4 : ((charCode % 2 === 0) ? 0.9 : 0.4);
        doc.setFillColor(0, 0, 0);
        doc.rect(startX, 33, thickness, 14, 'F');
        startX += thickness + 0.8;
      }

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("DELIVER TO:", 8, 61);
      doc.setFontSize(11);
      doc.text((order.shippingDetails?.fullName || "CUSTOMER").toUpperCase(), 8, 67);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      const splitAddress = doc.splitTextToSize(order.shippingDetails?.address || "Address", 84);
      let currentY = 73;
      splitAddress.forEach((line: string) => {
        doc.text(line, 8, currentY);
        currentY += 4.5;
      });

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${(order.shippingDetails?.city || '').toUpperCase()}, ${(order.shippingDetails?.state || '').toUpperCase()} - ${order.shippingDetails?.pincode || ''}`, 8, currentY + 3);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Phone: ${order.shippingDetails?.phone || 'N/A'}`, 8, currentY + 8);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7);
      doc.text("RETURN TO SENDER:", 8, 116);
      doc.setFontSize(8);
      doc.text((warehouseForm.name || "KRIA STUDIO").toUpperCase(), 8, 121);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.text(warehouseForm.address1 || "Radha Krishna Rd, KPHB", 8, 125);
      doc.text(`${warehouseForm.city || "Hyderabad"}, ${warehouseForm.state || "Telangana"} - ${warehouseForm.pincode || "500085"}`, 8, 129);

      doc.save(`kria_label_${order.id}.pdf`);
    } catch (err: any) {
      alert("Label generation failed: " + err.message);
    }
  };

  const handleDownloadAdjustedPhoto = async (orderId: string, idx: number, item: any) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/items/${idx}/adjusted-image`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${orderId}-item-${idx + 1}-${item.shapeId || 'frame'}-300dpi.png`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
    } catch (e) {
      console.warn("Fallback to preview url", e);
    }
    if (item.previewUrl) {
      const a = document.createElement('a');
      a.href = item.previewUrl;
      a.download = `${orderId}-item-${idx + 1}-${item.shapeId || 'frame'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadOriginalPhoto = async (orderId: string, idx: number, item: any) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/items/${idx}/original-image`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${orderId}-item-${idx + 1}-${item.shapeId || 'frame'}-original.png`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
    } catch (e) {
      console.warn("Fallback to item.originalUrl", e);
    }
    const target = item.originalUrl || item.previewUrl;
    if (target) {
      const a = document.createElement('a');
      a.href = target;
      a.download = `${orderId}-item-${idx + 1}-${item.shapeId || 'frame'}-original.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadOrderPhotosZip = async (order: any) => {
    if (!order.cart || order.cart.length === 0) return;
    try {
      setIsZippingOrderId(order.id);
      const zip = new JSZip();
      const adjustedFolder = zip.folder(`Adjusted_4x6_Print`);
      const originalFolder = zip.folder(`Original_Customer_Uploads`);

      for (let i = 0; i < order.cart.length; i++) {
        const item = order.cart[i];
        const shapeId = item.shapeId || 'frame';
        const numStr = String(i + 1).padStart(2, '0');

        // 1. Fetch Adjusted Print Photo
        try {
          const res = await fetch(`/api/admin/orders/${order.id}/items/${i}/adjusted-image`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          if (res.ok) {
            const blob = await res.blob();
            adjustedFolder?.file(`Frame_${numStr}_${shapeId}_adjusted_4x6.png`, blob);
          } else if (item.previewUrl) {
            const resFallback = await fetch(item.previewUrl);
            const blob = await resFallback.blob();
            adjustedFolder?.file(`Frame_${numStr}_${shapeId}_adjusted_4x6.png`, blob);
          }
        } catch (e) {
          console.warn(`Could not add adjusted image for item ${i}`, e);
        }

        // 2. Fetch Original Raw Photo
        try {
          const resOrigApi = await fetch(`/api/admin/orders/${order.id}/items/${i}/original-image`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          if (resOrigApi.ok) {
            const blob = await resOrigApi.blob();
            const ext = blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'jpg' : 'png';
            originalFolder?.file(`Frame_${numStr}_${shapeId}_raw_original.${ext}`, blob);
          } else {
            const originalSource = item.originalUrl || item.previewUrl;
            if (originalSource) {
              const resOrig = await fetch(originalSource);
              if (resOrig.ok) {
                const blob = await resOrig.blob();
                const ext = blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'jpg' : 'png';
                originalFolder?.file(`Frame_${numStr}_${shapeId}_raw_original.${ext}`, blob);
              }
            }
          }
        } catch (e) {
          console.warn(`Could not add original image for item ${i}`, e);
        }
      }

      // Manifest file
      const customerName = order.shippingDetails?.fullName || order.shippingDetails?.name || 'Customer';
      const customerPhone = order.shippingDetails?.phone || order.shippingDetails?.phoneNumber || 'N/A';
      const addressLine = order.shippingDetails?.address1 || order.shippingDetails?.address || '';
      const city = order.shippingDetails?.city || '';
      const pincode = order.shippingDetails?.pincode || '';

      const manifest = `KRIA STUDIO - FACTORY WORK ORDER & CUTTING GUIDE\n` +
        `Order ID: #${order.id}\n` +
        `Customer: ${customerName}\n` +
        `Phone: ${customerPhone}\n` +
        `Address: ${addressLine}, ${city} - ${pincode}\n` +
        `Total Frames: ${order.cart.length}\n` +
        `Date: ${new Date(order.createdAt).toLocaleString()}\n\n` +
        `FACTORY PRINTING INSTRUCTIONS:\n` +
        `1. Print all photos in the 'Adjusted_4x6_Print' folder onto standard 4x6 inch (100x150mm) photo paper.\n` +
        `2. Cut along the shape outline.\n` +
        `3. Slot the cut print between the magnetic acrylic pieces.\n` +
        `4. If an auto-crop has clipped a face, print the matching photo from 'Original_Customer_Uploads' instead.\n\n` +
        `ORDER ITEMS:\n` +
        order.cart.map((it: any, idx: number) => `Frame ${idx + 1}: ${it.shapeName || it.shapeId} (Qty: ${it.quantity || 1}, Shape: ${it.shapeId})`).join('\n');

      zip.file(`ORDER_MANIFEST_AND_CUT_GUIDE.txt`, manifest);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${order.id}-all-frame-photos-pack.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Error creating photo ZIP: ' + err.message);
    } finally {
      setIsZippingOrderId(null);
    }
  };

  const handlePrintSingleItemPhoto = (item: any, orderId = 'KRIA', idx = 0, mode = 'adjusted') => {
    const photoUrl = mode === 'original' ? (item.originalUrl || item.previewUrl) : item.previewUrl;
    if (!photoUrl) return;
    try {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>4x6 Photo Print - ${orderId} - Frame ${idx + 1} (${item.shapeName || 'Frame'})</title>
              <style>
                @page { size: 4in 6in; margin: 0; }
                body { 
                  margin: 0; padding: 0; 
                  display: flex; flex-direction: column; align-items: center; justify-content: center; 
                  background: white; width: 4in; height: 6in; overflow: hidden; font-family: sans-serif;
                }
                .header-info {
                  position: absolute; top: 0.15in; left: 0.25in; right: 0.25in;
                  font-size: 8pt; color: #666; display: flex; justify-content: space-between;
                }
                .img-container {
                  width: 3.5in; height: 5.2in;
                  display: flex; align-items: center; justify-content: center;
                  position: relative;
                }
                img { max-width: 100%; max-height: 100%; object-fit: contain; }
              </style>
            </head>
            <body>
              <div class="header-info">
                <span>✂ CUT GUIDE · KRIA #${orderId} · ${item.shapeName || item.shapeId}</span>
                <span>${mode.toUpperCase()} PHOTO</span>
              </div>
              <div class="img-container">
                <img src="${photoUrl}" onload="window.print(); window.close();" />
              </div>
            </body>
          </html>
        `);
        printWin.document.close();
      }
    } catch (e: any) {
      alert("Could not trigger photo print: " + e.message);
    }
  };

  // Bulk Operations Handlers
  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllOrders = (ordersToSelect: any[]) => {
    const allIds = ordersToSelect.map(o => o.id);
    const areAllSelected = allIds.every(id => selectedOrderIds.includes(id));
    if (areAllSelected) {
      setSelectedOrderIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedOrderIds(prev => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const handleBatchAdvanceToProduction = async () => {
    if (selectedOrderIds.length === 0) return;
    if (!confirm(`Move ${selectedOrderIds.length} orders to Production stage?`)) return;
    setIsBulkProcessing(true);
    for (const id of selectedOrderIds) {
      await handleUpdateStatus(id, 'Production', 'Batch transitioned to Production stage.');
    }
    setIsBulkProcessing(false);
    setSelectedOrderIds([]);
  };

  const handleBatchDownloadZip = async () => {
    if (selectedOrderIds.length === 0) return;
    const ordersToZip = orders.filter(o => selectedOrderIds.includes(o.id));
    if (ordersToZip.length === 0) return;

    try {
      setIsBulkProcessing(true);
      const zip = new JSZip();

      for (const order of ordersToZip) {
        const orderFolder = zip.folder(`Order_${order.id}`) || zip;
        const cartItems = order.cart || [];

        for (let i = 0; i < cartItems.length; i++) {
          const item = cartItems[i];
          const shapeId = item.shapeId || 'frame';
          const numStr = String(i + 1).padStart(2, '0');

          try {
            const res = await fetch(`/api/admin/orders/${order.id}/items/${i}/adjusted-image`, {
              headers: { Authorization: `Bearer ${adminToken}` }
            });
            if (res.ok) {
              const blob = await res.blob();
              orderFolder.file(`Frame_${numStr}_${shapeId}_adjusted_4x6.png`, blob);
            } else if (item.previewUrl) {
              const resFallback = await fetch(item.previewUrl);
              const blob = await resFallback.blob();
              orderFolder.file(`Frame_${numStr}_${shapeId}_adjusted_4x6.png`, blob);
            }
          } catch (e) {
            console.warn(`Could not add adjusted image for order ${order.id} item ${i}`, e);
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Batch_${selectedOrderIds.length}_Orders_Adjusted_Photos.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Error creating batch ZIP: ' + err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // ── Per-Item Status, Crop, Notes & Refund Handlers ─────────────────────────
  const handleUpdateItemStatus = async (orderId: string, itemIdx: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/items/${itemIdx}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update item status');
      }
    } catch (e: any) {
      alert('Error updating item status: ' + e.message);
    }
  };

  const handleAddInternalNote = async (orderId: string) => {
    if (!orderInternalNote.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ note: orderInternalNote.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
        setOrderInternalNote('');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add note');
      }
    } catch (e: any) {
      alert('Error adding note: ' + e.message);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!isRefundModalOpen) return;
    const { order } = isRefundModalOpen;
    setIsSubmittingRefund(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          amount: refundForm.amount,
          reason: refundForm.reason
        })
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.map(o => o.id === order.id ? data.order : o));
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder(data.order);
        }
        setIsRefundModalOpen(null);
        alert(data.message || 'Refund successfully registered!');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to process refund');
      }
    } catch (e: any) {
      alert('Error processing refund: ' + e.message);
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const handleDownloadOnlyAdjustedZip = async (order: any) => {
    if (!order.cart || order.cart.length === 0) return;
    try {
      setIsZippingOrderId(order.id);
      const zip = new JSZip();
      for (let i = 0; i < order.cart.length; i++) {
        const item = order.cart[i];
        const shapeId = item.shapeId || 'frame';
        const numStr = String(i + 1).padStart(2, '0');
        try {
          const res = await fetch(`/api/admin/orders/${order.id}/items/${i}/adjusted-image`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          if (res.ok) {
            const blob = await res.blob();
            zip.file(`Frame_${numStr}_${shapeId}_adjusted_4x6.png`, blob);
          } else if (item.previewUrl) {
            const resFallback = await fetch(item.previewUrl);
            const blob = await resFallback.blob();
            zip.file(`Frame_${numStr}_${shapeId}_adjusted_4x6.png`, blob);
          }
        } catch (e) {
          console.warn(`Could not add adjusted image for item ${i}`, e);
        }
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${order.id}-adjusted-4x6-photos.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Error creating adjusted photo ZIP: ' + err.message);
    } finally {
      setIsZippingOrderId(null);
    }
  };

  const handleDownloadOnlyOriginalsZip = async (order: any) => {
    if (!order.cart || order.cart.length === 0) return;
    try {
      setIsZippingOrderId(order.id);
      const zip = new JSZip();
      for (let i = 0; i < order.cart.length; i++) {
        const item = order.cart[i];
        const shapeId = item.shapeId || 'frame';
        const numStr = String(i + 1).padStart(2, '0');
        try {
          const resOrigApi = await fetch(`/api/admin/orders/${order.id}/items/${i}/original-image`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          if (resOrigApi.ok) {
            const blob = await resOrigApi.blob();
            const ext = blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'jpg' : 'png';
            zip.file(`Frame_${numStr}_${shapeId}_raw_original.${ext}`, blob);
          } else {
            const originalSource = item.originalUrl || item.previewUrl;
            if (originalSource) {
              const resOrig = await fetch(originalSource);
              if (resOrig.ok) {
                const blob = await resOrig.blob();
                const ext = blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'jpg' : 'png';
                zip.file(`Frame_${numStr}_${shapeId}_raw_original.${ext}`, blob);
              }
            }
          }
        } catch (e) {
          console.warn(`Could not add original image for item ${i}`, e);
        }
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${order.id}-original-customer-uploads.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Error creating original photo ZIP: ' + err.message);
    } finally {
      setIsZippingOrderId(null);
    }
  };

  // Dispatch cutoff countdown calculation
  const cutoffInfo = useMemo(() => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istNow = new Date(utc + (3600000 * 5.5)); // Indian Standard Time
    const target = new Date(istNow);
    target.setHours(17, 0, 0, 0); // 17:00 IST cutoff
    const diffMs = target.getTime() - istNow.getTime();
    if (diffMs <= 0) {
      return { passed: true, label: 'Cut-off closed for today (17:00 IST)', countdown: 'Next pickup tomorrow' };
    }
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { passed: false, label: `${hours}h ${mins}m left for today's pickup`, countdown: `${hours}h ${mins}m left` };
  }, [lastRefreshedAt]);

  const oldestWaitingToPrint = useMemo(() => {
    return orders
      .filter(o => ['Pending', 'Payment Verified', 'WhatsApp Order', 'Processing', 'Production'].includes(o.status))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  const refundsWaitingCount = useMemo(() => {
    return orders.filter(o => o.status === 'Refunded' || o.id.startsWith('KRIA-REP-')).length;
  }, [orders]);

  // ── Exceptions Detection ────────────────────────────────────────────────────
  const exceptionOrders = useMemo(() => {
    return orders.filter(o => {
      const isUnverifiedPayment = o.status === 'Pending' && !o.transactionId;
      const isPackedWithoutAWB = o.status === 'Packed' && !o.trackingNumber && !o.shipmentId;
      const isIncompleteAddress = !o.shippingDetails?.pincode || !o.shippingDetails?.phone;
      const isTerminal = o.status === 'Cancelled' || o.status === 'Refunded';
      return isUnverifiedPayment || isPackedWithoutAWB || isIncompleteAddress || isTerminal;
    }).map(o => {
      let reason = 'Requires operational attention';
      let severity: 'high' | 'medium' | 'low' = 'medium';
      if (o.status === 'Packed' && !o.trackingNumber && !o.shipmentId) {
        reason = 'Packed: AWB & Shiprocket shipment missing';
        severity = 'high';
      } else if (o.status === 'Pending' && !o.transactionId) {
        reason = 'Payment unverified / awaiting confirmation';
        severity = 'high';
      } else if (!o.shippingDetails?.pincode || !o.shippingDetails?.phone) {
        reason = 'Incomplete shipping coordinates or phone';
        severity = 'medium';
      } else if (o.status === 'Cancelled' || o.status === 'Refunded') {
        reason = `Order ${o.status}: Verify cancellation`;
        severity = 'low';
      }
      return { ...o, exceptionReason: reason, exceptionSeverity: severity };
    });
  }, [orders]);

  // ── 5 KPIs Computation ──────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const newOrders = orders.filter(o => ['Pending', 'Payment Verified', 'WhatsApp Order'].includes(o.status));
    const inProduction = orders.filter(o => ['Processing', 'Production', 'Quality Check'].includes(o.status));
    const readyToShip = orders.filter(o => o.status === 'Packed');
    const shippedToday = orders.filter(o => ['Shipped', 'Out for Delivery', 'Delivered'].includes(o.status));
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    return {
      newOrdersCount: newOrders.length,
      newOrdersValue: newOrders.reduce((s, o) => s + (o.grandTotal || 0), 0),
      inProductionCount: inProduction.length,
      readyToShipCount: readyToShip.length,
      shippedTodayCount: shippedToday.length,
      exceptionsCount: exceptionOrders.length,
      todayRevenue,
      todayOrdersCount: todayOrders.length
    };
  }, [orders, exceptionOrders]);

  // ── Filtered Orders Workspace ───────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderFilter === 'Pending') {
        if (!['Pending', 'Payment Verified', 'WhatsApp Order'].includes(o.status)) return false;
      } else if (orderFilter === 'Production') {
        if (!['Processing', 'Production'].includes(o.status)) return false;
      } else if (orderFilter === 'Quality Check') {
        if (o.status !== 'Quality Check') return false;
      } else if (orderFilter === 'Packed') {
        if (o.status !== 'Packed') return false;
      } else if (orderFilter === 'Shipped') {
        if (!['Shipped', 'Out for Delivery', 'Delivered'].includes(o.status)) return false;
      } else if (orderFilter === 'Exceptions') {
        if (!exceptionOrders.some(ex => ex.id === o.id)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesName = (o.shippingDetails?.fullName || '').toLowerCase().includes(q);
        const matchesPhone = (o.shippingDetails?.phone || '').includes(q);
        const matchesCity = (o.shippingDetails?.city || '').toLowerCase().includes(q);
        const matchesAwb = (o.trackingNumber || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesPhone && !matchesCity && !matchesAwb) return false;
      }

      return true;
    });
  }, [orders, orderFilter, searchQuery, exceptionOrders]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openDrawerForOrder = (order: any) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  // Catalog Handlers
  const handleOpenPriceModal = (product: any) => {
    setEditingPriceProduct(product);
    setEditPriceForm({
      price: Number(product.price || 0),
      originalPrice: Number(product.originalPrice || (product.price ? product.price + 100 : 349))
    });
  };

  const handleSavePriceModal = async () => {
    if (!editingPriceProduct) return;
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          ...editingPriceProduct,
          price: editPriceForm.price,
          originalPrice: editPriceForm.originalPrice
        })
      });
      if (response.ok) {
        await fetchProducts();
        setEditingPriceProduct(null);
        alert('Product prices updated!');
      } else {
        alert('Failed saving price');
      }
    } catch (e: any) {
      alert(e.message || 'Error updating price');
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsSuccessMessage(null);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          shipping_free_threshold: Number(businessSettings.shipping_free_threshold) || 699,
          flat_shipping_rate: Number(businessSettings.flat_shipping_rate) || 60,
          meta_launch_offer_enabled: businessSettings.meta_launch_offer_enabled !== false,
          bundle_3_price: Number(businessSettings.bundle_3_price) || 799,
          bundle_3_free_shipping: businessSettings.bundle_3_free_shipping !== false,
          company_name: businessSettings.company_name,
          support_phone: businessSettings.support_phone,
          support_email: businessSettings.support_email,
          gstin: businessSettings.gstin,
        })
      });
      if (response.ok) {
        setSettingsSuccessMessage('Promotion & Shipping settings saved to live system!');
        setTimeout(() => setSettingsSuccessMessage(null), 4000);
      } else {
        alert('Failed to save settings.');
      }
    } catch (err: any) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Status Styling Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'WhatsApp Order':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'Payment Verified':
      case 'Paid':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300';
      case 'Processing':
      case 'Production':
        return 'bg-blue-50 text-blue-900 border-blue-300';
      case 'Quality Check':
        return 'bg-purple-50 text-purple-900 border-purple-300';
      case 'Packed':
        return 'bg-indigo-50 text-indigo-900 border-indigo-300';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-teal-50 text-teal-900 border-teal-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-950 border-emerald-400 font-semibold';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] flex font-sans antialiased overflow-x-hidden">
      
      {/* ── LEFT SIDEBAR (Dark Luxury Matte #111111) ────────────────────────── */}
      <aside className="w-64 bg-[#111111] text-white border-r border-neutral-800 flex flex-col shrink-0 min-h-screen sticky top-0 h-screen z-20">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size={26} color="#E8DCCF" />
            <div>
              <h1 className="font-sans font-bold text-base tracking-tight text-white leading-tight">
                KRIA <span className="font-sans font-semibold text-[#E8DCCF]">OPERATIONS</span>
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400">Factory Fulfillment Console</span>
            </div>
          </div>
        </div>

        {/* Navigation Modules (Clean Professional Font-Sans) */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto text-xs font-medium">
          
          {/* Group 1: DAILY WORK */}
          <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
            Daily Work
          </div>

          {/* 1. Overview */}
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'dashboard' 
                ? 'bg-[#E8DCCF] text-neutral-950 shadow-sm font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </div>
          </button>

          {/* 2. Orders */}
          <button
            onClick={() => setActiveNav('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'orders' 
                ? 'bg-[#E8DCCF] text-neutral-950 shadow-sm font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4" />
              <span>Orders</span>
            </div>
            <span className="text-[11px] opacity-75 font-mono">({orders.length})</span>
          </button>

          {/* 3. Production */}
          <button
            onClick={() => setActiveNav('production')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'production' 
                ? 'bg-[#E8DCCF] text-neutral-950 shadow-sm font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Box className="h-4 w-4" />
              <span>Production</span>
            </div>
            <span className="text-[11px] opacity-75 font-mono">({kpis.inProductionCount})</span>
          </button>

          {/* 4. Dispatch */}
          <button
            onClick={() => setActiveNav('logistics')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'logistics' 
                ? 'bg-[#E8DCCF] text-neutral-950 shadow-sm font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4" />
              <span>Dispatch</span>
            </div>
            <span className="text-[11px] opacity-75 font-mono">({kpis.readyToShipCount})</span>
          </button>

          {/* 5. Exceptions */}
          <button
            onClick={() => setActiveNav('exceptions')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'exceptions' 
                ? 'bg-rose-950/80 text-rose-100 border border-rose-800 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-4 w-4 ${exceptionOrders.length > 0 ? 'text-rose-400' : ''}`} />
              <span>Exceptions</span>
            </div>
            {exceptionOrders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold animate-pulse">
                {exceptionOrders.length}
              </span>
            )}
          </button>

          {/* Group 2: CUSTOMERS */}
          <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-wider text-neutral-500 font-bold border-t border-neutral-800/80 mt-2">
            Customers
          </div>

          {/* 6. Customers */}
          <button
            onClick={() => setActiveNav('customers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'customers' 
                ? 'bg-[#E8DCCF] text-neutral-950 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </div>
          </button>

          {/* 7. Refunds & Replacements */}
          <button
            onClick={() => setActiveNav('refunds')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'refunds' 
                ? 'bg-[#E8DCCF] text-neutral-950 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4" />
              <span>Refunds & Replacements</span>
            </div>
            {refundsWaitingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-neutral-950 font-bold">
                {refundsWaitingCount}
              </span>
            )}
          </button>

          {/* Group 3: CATALOG & BUSINESS */}
          <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-wider text-neutral-500 font-bold border-t border-neutral-800/80 mt-2">
            Catalog & Business
          </div>

          {/* 8. Products & Pricing */}
          <button
            onClick={() => setActiveNav('products')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'products' 
                ? 'bg-[#E8DCCF] text-neutral-950 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4" />
              <span>Products & Pricing</span>
            </div>
            <span className="text-[11px] opacity-75 font-mono">({productsList.length || 7})</span>
          </button>

          {/* 9. Offers & Coupons */}
          <button
            onClick={() => setActiveNav('offers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'offers' 
                ? 'bg-[#E8DCCF] text-neutral-950 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4" />
              <span>Offers & Coupons</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-semibold">
              Meta 3-Pack
            </span>
          </button>

          {/* 10. Analytics */}
          <button
            onClick={() => setActiveNav('analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'analytics' 
                ? 'bg-[#E8DCCF] text-neutral-950 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </button>

          {/* 11. Settings */}
          <button
            onClick={() => setActiveNav('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeNav === 'settings' 
                ? 'bg-[#E8DCCF] text-neutral-950 font-semibold' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800/80 space-y-2">
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors text-xs font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {isAudioEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-neutral-500" />
              )}
              <span>Audio Chime Alerts</span>
            </span>
            <span className={`text-[10px] font-bold ${isAudioEnabled ? 'text-emerald-400' : 'text-neutral-500'}`}>
              {isAudioEnabled ? 'ON' : 'MUTED'}
            </span>
          </button>

          <button
            onClick={onBackToHome}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Storefront</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Control Bar */}
        <header className="bg-white border-b border-neutral-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
          
          {/* Universal Search Bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Customer, Phone, City or AWB..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-neutral-200 focus:border-neutral-900 rounded-xl text-xs text-neutral-900 outline-none transition-all placeholder:text-neutral-400 font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Sync & Real-time Indicator Strip */}
          <div className="flex items-center gap-4">
            {exceptionOrders.length > 0 && (
              <button
                onClick={() => { setActiveNav('orders'); setOrderFilter('Exceptions'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-full text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                <span>{exceptionOrders.length} Exception{exceptionOrders.length > 1 ? 's' : ''}</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync 8s</span>
              <span className="text-[11px] text-neutral-400 hidden lg:inline font-mono">
                ({lastRefreshedAt.toLocaleTimeString()})
              </span>
            </div>

            <button
              onClick={() => fetchOrders()}
              disabled={isLoading}
              className="p-2 border border-neutral-200 hover:border-neutral-400 rounded-xl text-neutral-700 hover:text-black transition-colors cursor-pointer"
              title="Refresh data from server"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-neutral-900' : ''}`} />
            </button>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="p-6 space-y-6 flex-1">

          {/* ════ VIEW 1: OPERATIONS OVERVIEW & EXCEPTION QUEUE ═════════════════ */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Dispatch Cut-off Countdown & Today's Orders Banner */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl ${cutoffInfo.passed ? 'bg-neutral-100 text-neutral-600' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                        Carrier Dispatch Desk · Cut-off 17:00 IST
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cutoffInfo.passed ? 'bg-neutral-200 text-neutral-700' : 'bg-amber-500 text-neutral-950 animate-pulse'}`}>
                        {cutoffInfo.countdown}
                      </span>
                    </div>
                    <h3 className="font-sans text-base font-bold text-neutral-900 mt-0.5">
                      {cutoffInfo.label}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-6 divide-x divide-neutral-200">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Today's Orders</span>
                    <span className="text-lg font-bold text-neutral-900 tabular-nums font-mono">{kpis.todayOrdersCount}</span>
                  </div>
                  <div className="pl-6 text-right">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Today's Revenue</span>
                    <span className="text-lg font-bold text-emerald-800 tabular-nums font-mono">₹{kpis.todayRevenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* 5 Compact KPIs Strip */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                
                {/* 1. New Orders */}
                <div 
                  onClick={() => { setActiveNav('orders'); setOrderFilter('Pending'); }}
                  className="bg-white border border-neutral-200 hover:border-neutral-400 p-4 rounded-2xl shadow-2xs cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500 uppercase font-semibold tracking-wider">New (Paid)</span>
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 tabular-nums">{kpis.newOrdersCount}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">₹{kpis.newOrdersValue} pending</div>
                </div>

                {/* 2. In Production */}
                <div 
                  onClick={() => { setActiveNav('production'); }}
                  className="bg-white border border-neutral-200 hover:border-neutral-400 p-4 rounded-2xl shadow-2xs cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500 uppercase font-semibold tracking-wider">In Production</span>
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 tabular-nums">{kpis.inProductionCount}</div>
                  <div className="text-[11px] text-neutral-400">Print & assembly</div>
                </div>

                {/* 3. Ready to Ship */}
                <div 
                  onClick={() => { setActiveNav('orders'); setOrderFilter('Packed'); }}
                  className="bg-white border border-neutral-200 hover:border-neutral-400 p-4 rounded-2xl shadow-2xs cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500 uppercase font-semibold tracking-wider">Ready to Ship</span>
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 tabular-nums">{kpis.readyToShipCount}</div>
                  <div className="text-[11px] text-neutral-400">Packed in boxes</div>
                </div>

                {/* 4. Shipped Today */}
                <div 
                  onClick={() => { setActiveNav('orders'); setOrderFilter('Shipped'); }}
                  className="bg-white border border-neutral-200 hover:border-neutral-400 p-4 rounded-2xl shadow-2xs cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500 uppercase font-semibold tracking-wider">Shipped Today</span>
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 tabular-nums">{kpis.shippedTodayCount}</div>
                  <div className="text-[11px] text-neutral-400">Dispatched & in-transit</div>
                </div>

                {/* 5. Exceptions (Red) */}
                <div 
                  onClick={() => { setActiveNav('exceptions'); }}
                  className={`border p-4 rounded-2xl shadow-2xs cursor-pointer transition-all space-y-1 ${
                    kpis.exceptionsCount > 0 
                      ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300' 
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] uppercase font-semibold tracking-wider ${kpis.exceptionsCount > 0 ? 'text-rose-700' : 'text-neutral-500'}`}>
                      Exceptions
                    </span>
                    <span className={`h-2 w-2 rounded-full ${kpis.exceptionsCount > 0 ? 'bg-rose-500 animate-ping' : 'bg-neutral-300'}`} />
                  </div>
                  <div className={`text-2xl font-bold tabular-nums ${kpis.exceptionsCount > 0 ? 'text-rose-700' : 'text-neutral-900'}`}>
                    {kpis.exceptionsCount}
                  </div>
                  <div className={`text-[11px] ${kpis.exceptionsCount > 0 ? 'text-rose-600 font-semibold' : 'text-neutral-400'}`}>
                    {kpis.exceptionsCount > 0 ? 'Action required' : 'Zero blockers'}
                  </div>
                </div>

              </div>

              {/* Persistent Exception Queue Card */}
              {exceptionOrders.length > 0 && (
                <div className="bg-white border-2 border-rose-200 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-rose-600" />
                      <h3 className="font-sans text-base font-bold text-rose-950">
                        Operational Exception Queue ({exceptionOrders.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveNav('exceptions')}
                      className="text-xs text-rose-700 hover:text-rose-900 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Full Queue →</span>
                    </button>
                  </div>

                  <div className="divide-y divide-rose-50 text-xs">
                    {exceptionOrders.map((ex) => (
                      <div key={ex.id} className="py-2.5 flex items-center justify-between gap-4 hover:bg-rose-50/40 px-2 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-neutral-900">#{ex.id}</span>
                          <span className="text-neutral-700 font-medium">{ex.shippingDetails?.fullName}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            {ex.exceptionReason}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-500 font-mono text-[11px]">₹{ex.grandTotal}</span>
                          {ex.shippingDetails?.phone && (
                            <a 
                              href={`https://wa.me/91${ex.shippingDetails.phone.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-semibold rounded-lg transition-colors"
                            >
                              WhatsApp
                            </a>
                          )}
                          <button
                            onClick={() => openDrawerForOrder(ex)}
                            className="px-3 py-1 bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold tracking-wide rounded-lg transition-colors cursor-pointer"
                          >
                            Resolve in Drawer →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Up: 5 Oldest Orders Waiting to be Printed */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Printer className="h-5 w-5 text-neutral-800" />
                    <div>
                      <h3 className="font-sans text-base font-bold tracking-tight text-neutral-900">
                        Next Up: Oldest Orders Waiting to be Printed ({oldestWaitingToPrint.length})
                      </h3>
                      <p className="text-xs text-neutral-500">First in, first out factory queue for 4×6 photo printing and cutting</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveNav('production'); setProductionStageTab('print'); }}
                    className="text-xs font-semibold text-neutral-700 hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Print Queue</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {oldestWaitingToPrint.length === 0 ? (
                  <div className="py-6 text-center text-xs text-neutral-400">
                    All queued orders have been printed!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] text-neutral-600 border-y border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="py-2 px-3">Order ID</th>
                          <th className="py-2 px-3">Age</th>
                          <th className="py-2 px-3">Customer</th>
                          <th className="py-2 px-3">Frames</th>
                          <th className="py-2 px-3">Total</th>
                          <th className="py-2 px-3 text-right">Quick Print Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {oldestWaitingToPrint.map((ord) => {
                          const ageHours = Math.round((Date.now() - new Date(ord.createdAt).getTime()) / (1000 * 60 * 60));
                          return (
                            <tr key={ord.id} onClick={() => openDrawerForOrder(ord)} className="hover:bg-neutral-50 cursor-pointer transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">#{ord.id}</td>
                              <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px]">{ageHours}h ago</td>
                              <td className="py-2.5 px-3 font-medium text-neutral-900">{ord.shippingDetails?.fullName || 'Customer'}</td>
                              <td className="py-2.5 px-3 text-neutral-700">{(ord.cart || []).length} frame(s)</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">₹{ord.grandTotal}</td>
                              <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setIsPrintWorkOrderOpen(ord)}
                                    title="Open 4x6 Print Workstation"
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <Printer className="h-3 w-3 text-amber-700" />
                                    <span>🖨️ 4×6 Sheet</span>
                                  </button>
                                  <button
                                    onClick={() => handleDownloadOrderPhotosZip(ord)}
                                    disabled={isZippingOrderId === ord.id}
                                    title="Download Photo ZIP"
                                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer border border-neutral-200"
                                  >
                                    <Download className="h-3 w-3 text-neutral-600" />
                                    <span>{isZippingOrderId === ord.id ? '…' : '📦 ZIP'}</span>
                                  </button>
                                  <button
                                    onClick={() => openDrawerForOrder(ord)}
                                    className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold rounded-lg transition cursor-pointer"
                                  >
                                    Open →
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Orders Stream Preview */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-900">Incoming Orders Queue</h3>
                    <p className="text-xs text-neutral-500 mt-0.5 font-medium">Most recent customer submissions ready for verification</p>
                  </div>
                  <button
                    onClick={() => setActiveNav('orders')}
                    className="text-xs font-semibold tracking-wide text-neutral-700 hover:text-black flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Workspace</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-neutral-600 border-y border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Items</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Stage</th>
                        <th className="py-2.5 px-3 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {orders.slice(0, 6).map((order) => (
                        <tr 
                          key={order.id} 
                          onClick={() => openDrawerForOrder(order)}
                          className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-neutral-900">#{order.id}</td>
                          <td className="py-3 px-3">
                            <div className="font-medium">{order.shippingDetails?.fullName || 'Customer'}</div>
                            <div className="text-[11px] text-neutral-400">{order.shippingDetails?.city}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-neutral-700">{(order.cart || []).length} frame(s)</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-neutral-900">₹{order.grandTotal}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] border font-semibold ${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleDownloadOrderPhotosZip(order)}
                                disabled={isZippingOrderId === order.id}
                                title="Download Photo ZIP"
                                className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer border border-neutral-200"
                              >
                                <Download className="h-3 w-3 text-neutral-600" />
                                <span>{isZippingOrderId === order.id ? '…' : 'ZIP'}</span>
                              </button>
                              <button
                                onClick={() => setIsPrintWorkOrderOpen(order)}
                                title="Open 4×6 Photo Printing Workstation"
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                              >
                                <Printer className="h-3 w-3 text-amber-700" />
                                <span>4×6</span>
                              </button>
                              <button
                                onClick={() => openDrawerForOrder(order)}
                                className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                Inspect →
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ════ VIEW 2: ORDERS WORKSPACE (HIGH-DENSITY DATA GRID) ═════════════ */}
          {activeNav === 'orders' && (
            <div className="space-y-4">
              
              {/* Filter Tabs & Bulk Actions Bar */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                
                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 text-xs font-medium">
                  {(['All', 'Pending', 'Production', 'Quality Check', 'Packed', 'Shipped', 'Exceptions'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOrderFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        orderFilter === filter 
                          ? 'bg-neutral-900 text-white font-semibold' 
                          : 'bg-[#FAF8F5] text-neutral-600 hover:text-black hover:bg-neutral-100'
                      }`}
                    >
                      {filter}
                      {filter === 'Exceptions' && exceptionOrders.length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-600 text-white font-bold">
                          {exceptionOrders.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Bulk Actions Banner */}
                {selectedOrderIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-neutral-900 text-white px-3.5 py-1.5 rounded-xl text-xs animate-in fade-in">
                    <span className="text-[#E8DCCF] font-semibold">{selectedOrderIds.length} selected</span>
                    <div className="h-4 w-px bg-neutral-700" />
                    <button
                      disabled={isBulkProcessing}
                      onClick={handleBatchAdvanceToProduction}
                      className="text-white hover:text-[#E8DCCF] text-[11px] font-semibold uppercase transition-colors cursor-pointer"
                    >
                      Move to Production
                    </button>
                    <div className="h-4 w-px bg-neutral-700" />
                    <button
                      disabled={isBulkProcessing}
                      onClick={handleBatchDownloadZip}
                      className="text-white hover:text-[#E8DCCF] text-[11px] font-semibold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>📦 Download Photos (ZIP)</span>
                    </button>
                    <div className="h-4 w-px bg-neutral-700" />
                    <button
                      onClick={() => setSelectedOrderIds([])}
                      className="text-neutral-400 hover:text-white text-[11px] uppercase transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Dense Orders Grid Table */}
              <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-neutral-600 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">
                          <input 
                            type="checkbox"
                            checked={filteredOrders.length > 0 && filteredOrders.every(o => selectedOrderIds.includes(o.id))}
                            onChange={() => handleSelectAllOrders(filteredOrders)}
                            className="rounded cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-3">Order ID & Date</th>
                        <th className="py-3 px-3">Thumbnail</th>
                        <th className="py-3 px-3">Customer & City</th>
                        <th className="py-3 px-3">Frame Configuration</th>
                        <th className="py-3 px-3">Payment</th>
                        <th className="py-3 px-3">Production Stage</th>
                        <th className="py-3 px-3">Fulfillment / AWB</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-neutral-400">
                            No orders match the current filter and search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const firstItem = (order.cart || [])[0] || {};
                          const isSelected = selectedOrderIds.includes(order.id);
                          const totalItems = (order.cart || []).reduce((acc: number, x: any) => acc + (x.quantity || 1), 0);

                          return (
                            <tr
                              key={order.id}
                              onClick={() => openDrawerForOrder(order)}
                              className={`hover:bg-neutral-50/90 cursor-pointer transition-colors ${
                                isSelected ? 'bg-amber-50/30' : ''
                              }`}
                            >
                              <td 
                                className="py-3 px-3 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectOrder(order.id)}
                                  className="rounded cursor-pointer"
                                />
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-900">
                                  <span>#{order.id}</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleCopy(order.id, `ord-${order.id}`); }}
                                    className="text-neutral-400 hover:text-black"
                                    title="Copy Order ID"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                  {copiedId === `ord-${order.id}` && (
                                    <span className="text-[9px] text-emerald-600 font-bold font-sans">Copied!</span>
                                  )}
                                </div>
                                <div className="text-[11px] text-neutral-400 mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
                                  {firstItem.previewUrl ? (
                                    <img 
                                      src={firstItem.previewUrl} 
                                      alt="Item preview" 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                      <Box className="h-4 w-4" />
                                    </div>
                                  )}
                                  {(order.cart || []).length > 1 && (
                                    <span className="absolute bottom-0 right-0 bg-neutral-900 text-white text-[9px] px-1 font-bold">
                                      +{order.cart.length - 1}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-medium text-neutral-900">{order.shippingDetails?.fullName || 'Customer'}</div>
                                <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                                  <MapPin className="h-2.5 w-2.5" />
                                  <span>{order.shippingDetails?.city || 'Unknown'}, {order.shippingDetails?.pincode}</span>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="text-neutral-800 font-medium">
                                  {firstItem.shapeName || 'Acrylic Magnet'}
                                </div>
                                <div className="text-[11px] text-neutral-400">
                                  {totalItems} unit{totalItems > 1 ? 's' : ''} total
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-mono font-bold text-neutral-900">₹{order.grandTotal}</div>
                                <div className="text-[10px] text-emerald-700 font-medium">
                                  {order.transactionId ? 'Prepaid' : 'Verified'}
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                {order.trackingNumber ? (
                                  <div>
                                    <div className="font-mono font-bold text-neutral-900">
                                      {order.trackingNumber}
                                    </div>
                                    <div className="text-[10px] text-teal-700 font-medium">
                                      {order.courierName || 'Shiprocket'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-neutral-400 italic">
                                    Shipment pending
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleDownloadOrderPhotosZip(order)}
                                    disabled={isZippingOrderId === order.id}
                                    title="Download Photo ZIP (Adjusted + Raw Originals)"
                                    className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold tracking-wide rounded-lg flex items-center gap-1 transition cursor-pointer border border-neutral-200"
                                  >
                                    <Download className="h-3 w-3 text-neutral-600" />
                                    <span>{isZippingOrderId === order.id ? '…' : 'ZIP'}</span>
                                  </button>
                                  <button
                                    onClick={() => setIsPrintWorkOrderOpen(order)}
                                    title="Open 4×6 Direct Photo Print Workstation"
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold tracking-wide rounded-lg flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <Printer className="h-3 w-3 text-amber-700" />
                                    <span>4×6</span>
                                  </button>
                                  <button
                                    onClick={() => openDrawerForOrder(order)}
                                    className="px-3 py-1 bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold tracking-wide rounded-lg transition-colors cursor-pointer"
                                  >
                                    Process →
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#FAF8F5] border-t border-neutral-200 px-4 py-2.5 flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>Showing {filteredOrders.length} of {orders.length} orders</span>
                  <span>KRIA Automated Sync Online</span>
                </div>
              </div>

            </div>
          )}

          {/* ════ VIEW 3: DEDICATED PRODUCTION PIPELINE ═════════════════════════ */}
          {activeNav === 'production' && (
            <div className="space-y-4">
              
              {/* Pipeline Stage Header Tabs */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                {[
                  { id: 'print', label: '1. Print Queue', count: orders.filter(o => ['Pending', 'Payment Verified', 'Processing'].includes(o.status)).length },
                  { id: 'assembly', label: '2. Frame Assembly', count: orders.filter(o => o.status === 'Production').length },
                  { id: 'qc', label: '3. Quality Inspection', count: orders.filter(o => o.status === 'Quality Check').length },
                  { id: 'packed', label: '4. Packed & Ready', count: orders.filter(o => o.status === 'Packed').length }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setProductionStageTab(st.id as any)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      productionStageTab === st.id 
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-[11px] uppercase font-semibold tracking-wider opacity-75">{st.label}</div>
                    <div className="text-xl font-bold mt-1 tabular-nums">{st.count} orders</div>
                  </button>
                ))}
              </div>

              {/* Stage Specific Queue Grid */}
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div>
                    <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-900">
                      {productionStageTab === 'print' && 'Print Queue — High-Res 300 DPI Export & Paper Canvas'}
                      {productionStageTab === 'assembly' && 'Assembly Floor — Acrylic Cutting & Magnetic Backing'}
                      {productionStageTab === 'qc' && 'Quality Control Gate — Surface Inspection & Adhesion Check'}
                      {productionStageTab === 'packed' && 'Packed Orders — Boxed & Weighed for Courier Pickup'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                      {productionStageTab === 'print' && 'Download adjusted photos or trigger 4x6 print paper sheets'}
                      {productionStageTab === 'assembly' && 'Mounting printed artwork into custom acrylic shapes'}
                      {productionStageTab === 'qc' && 'Gatekeeping against scratches, bubble artifacts, or edge misalignments'}
                      {productionStageTab === 'packed' && 'Ready for Shiprocket AWB manifest and dispatch'}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {orders
                    .filter(o => {
                      if (productionStageTab === 'print') return ['Pending', 'Payment Verified', 'Processing'].includes(o.status);
                      if (productionStageTab === 'assembly') return o.status === 'Production';
                      if (productionStageTab === 'qc') return o.status === 'Quality Check';
                      if (productionStageTab === 'packed') return o.status === 'Packed';
                      return false;
                    })
                    .map((order) => {
                      const firstItem = (order.cart || [])[0] || {};
                      return (
                        <div key={order.id} className="border border-neutral-200 rounded-2xl p-4 bg-[#FAF8F5]/50 hover:bg-white transition-all space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono font-bold text-neutral-900 text-sm">#{order.id}</span>
                              <div className="text-[11px] text-neutral-500 font-medium">{order.shippingDetails?.fullName}</div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] border font-semibold ${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="flex gap-3 items-center bg-white p-2.5 rounded-xl border border-neutral-200">
                            <img 
                              src={firstItem.previewUrl || '/images/Landingprofile.png'} 
                              alt="Item" 
                              className="w-14 h-14 object-cover rounded-lg border border-neutral-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate text-neutral-800">{firstItem.shapeName || 'Acrylic Magnet'}</div>
                              <div className="text-[11px] text-neutral-500">{(order.cart || []).length} frame(s) · {firstItem.shapeId}</div>
                              
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <button
                                  onClick={() => handleDownloadOrderPhotosZip(order)}
                                  disabled={isZippingOrderId === order.id}
                                  className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-neutral-200 transition cursor-pointer"
                                  title="Download all customer photos in a ZIP"
                                >
                                  <Download className="h-2.5 w-2.5" />
                                  <span>{isZippingOrderId === order.id ? '…' : 'ZIP'}</span>
                                </button>
                                <button
                                  onClick={() => setIsPrintWorkOrderOpen(order)}
                                  className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-200 transition cursor-pointer"
                                  title="Open 4×6 photo sheet printing workstation"
                                >
                                  <Printer className="h-2.5 w-2.5" />
                                  <span>4×6 Sheet</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-1 flex gap-2">
                            {productionStageTab === 'print' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'Production', 'Printing complete. Moved to Assembly.')}
                                className="w-full py-2 bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold tracking-wide rounded-xl transition cursor-pointer"
                              >
                                Print Done → Assembly
                              </button>
                            )}

                            {productionStageTab === 'assembly' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'Quality Check', 'Assembly complete. Moved to Quality Check.')}
                                className="w-full py-2 bg-purple-900 hover:bg-purple-950 text-white text-[11px] font-semibold tracking-wide rounded-xl transition cursor-pointer"
                              >
                                Assembly Done → QC
                              </button>
                            )}

                            {productionStageTab === 'qc' && (
                              <div className="flex gap-2 w-full">
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'Packed', 'QC Passed. Packed in branded box.')}
                                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-semibold tracking-wide rounded-xl transition cursor-pointer"
                                >
                                  Pass QC & Pack ✓
                                </button>
                              </div>
                            )}

                            {productionStageTab === 'packed' && (
                              <button
                                onClick={() => openDrawerForOrder(order)}
                                className="w-full py-2 bg-blue-900 hover:bg-blue-950 text-white text-[11px] font-semibold tracking-wide rounded-xl transition cursor-pointer"
                              >
                                {order.trackingNumber ? 'View AWB & Print Label' : 'Create Shiprocket AWB →'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          )}

          {/* ════ VIEW 4: LOGISTICS & SHIPROCKET DISPATCH ════════════════════════ */}
          {activeNav === 'logistics' && (
            <div className="space-y-4 text-xs">
              
              <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-neutral-100 rounded-2xl">
                    <Truck className="h-6 w-6 text-neutral-800" />
                  </div>
                  <div>
                    <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-900">Shiprocket Air & Surface Dispatch Desk</h3>
                    <p className="text-neutral-500 text-[11px]">
                      Pickup Warehouse: <strong className="text-neutral-900">{warehouseForm.name || 'KRIA Central Hub'}</strong> · Pincode: <strong className="font-mono">{warehouseForm.pincode}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveNav('settings')}
                    className="px-3.5 py-2 border border-neutral-300 hover:border-neutral-500 rounded-xl font-semibold tracking-wide text-[11px] transition-colors cursor-pointer"
                  >
                    Warehouse Config
                  </button>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xs">
                <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-[#FAF8F5]">
                  <h4 className="font-semibold text-neutral-900 uppercase tracking-wider">Dispatch & Delivery Tracking</h4>
                  <span className="text-neutral-500 text-[11px]">Official Shiprocket API Integration</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAF8F5] text-neutral-600 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Order</th>
                        <th className="py-2.5 px-3">Recipient & Address</th>
                        <th className="py-2.5 px-3">Shipment ID</th>
                        <th className="py-2.5 px-3">AWB Tracking</th>
                        <th className="py-2.5 px-3">Courier</th>
                        <th className="py-2.5 px-3 text-right">Dispatch Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {orders
                        .filter(o => ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(o.status) || o.shipmentId || o.trackingNumber)
                        .map((order) => (
                          <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-mono font-bold text-neutral-900">#{order.id}</span>
                              <div className="text-[11px] text-neutral-400">{order.status}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-medium text-neutral-900">{order.shippingDetails?.fullName}</div>
                              <div className="text-[11px] text-neutral-500">{order.shippingDetails?.city}, {order.shippingDetails?.pincode}</div>
                            </td>
                            <td className="py-3 px-3 font-mono">
                              {order.shipmentId ? (
                                <span className="text-neutral-800">#{order.shipmentId}</span>
                              ) : (
                                <span className="text-amber-700 italic">Not created</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono">
                              {order.trackingNumber ? (
                                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {order.trackingNumber}
                                </span>
                              ) : (
                                <span className="text-neutral-400">Pending</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-medium">
                              {order.courierName || 'Shiprocket'}
                            </td>
                            <td className="py-3 px-3 text-right space-x-2">
                              {!order.shipmentId && (
                                <button
                                  onClick={() => handleSyncShiprocket(order.id)}
                                  className="px-3 py-1 bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold tracking-wide rounded-lg transition-colors cursor-pointer"
                                >
                                  Create AWB
                                </button>
                              )}
                              {order.trackingNumber && (
                                <>
                                  <button
                                    onClick={() => handleGeneratePDFLabel(order)}
                                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold tracking-wide rounded-lg transition-colors"
                                  >
                                    Label PDF
                                  </button>
                                  <button
                                    onClick={() => handleScheduleCourierPickup(order.id)}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-semibold tracking-wide rounded-lg transition-colors"
                                  >
                                    Pickup
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ════ VIEW 5: EXCEPTIONS QUEUE ═════════════════════════════════════ */}
          {activeNav === 'exceptions' && (
            <ExceptionsQueueView
              orders={orders}
              adminToken={adminToken}
              onOpenOrder={openDrawerForOrder}
              onRefreshOrders={() => fetchOrders(true)}
            />
          )}

          {/* ════ VIEW 6: CUSTOMERS MANAGEMENT ═════════════════════════════════ */}
          {activeNav === 'customers' && (
            <CustomerManagementView
              adminToken={adminToken}
              onOpenOrder={openDrawerForOrder}
              orders={orders}
            />
          )}

          {/* ════ VIEW 7: REFUNDS & REPLACEMENTS ═══════════════════════════════ */}
          {activeNav === 'refunds' && (
            <RefundsReplacementsView
              orders={orders}
              adminToken={adminToken}
              onRefreshOrders={() => fetchOrders(true)}
              onOpenOrder={openDrawerForOrder}
            />
          )}

          {/* ════ VIEW 8: PRODUCTS CATALOG & PRICING ════════════════════════════ */}
          {activeNav === 'products' && (
            <div className="space-y-4 text-xs">
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                  <div>
                    <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-900">Custom Shapes & Standard Catalog</h3>
                    <p className="text-neutral-500 text-xs mt-0.5 font-medium">Manage live prices, retail MRPs, and active catalog products</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsList.map((product) => (
                    <div key={product.id} className="border border-neutral-200 rounded-2xl p-4 bg-[#FAF8F5]/50 hover:bg-white transition space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900 text-sm">{product.name}</span>
                        <span className="text-[11px] bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 uppercase font-semibold">
                          {product.shape || 'Frame'}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-neutral-900 font-mono">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-neutral-400 line-through font-mono">₹{product.originalPrice}</span>
                        )}
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => handleOpenPriceModal(product)}
                          className="w-full py-2 bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold tracking-wide rounded-xl transition cursor-pointer"
                        >
                          Edit Pricing →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ VIEW 9: OFFERS & COUPONS ══════════════════════════════════════ */}
          {activeNav === 'offers' && (
            <OffersCouponsView adminToken={adminToken} />
          )}

          {/* ════ VIEW 10: EXECUTIVE ANALYTICS ══════════════════════════════════ */}
          {activeNav === 'analytics' && (
            <ExecutiveAnalyticsView orders={orders} />
          )}

          {/* ════ VIEW 11: FULL MASTER SETTINGS & WAREHOUSE ═════════════════════ */}
          {activeNav === 'settings' && (
            <FullSettingsView
              businessSettings={businessSettings}
              setBusinessSettings={setBusinessSettings}
              warehouseForm={warehouseForm}
              setWarehouseForm={setWarehouseForm}
              adminToken={adminToken}
              isSavingSettings={isSavingSettings}
              onSaveSettings={handleSaveSettings}
              settingsSuccessMessage={settingsSuccessMessage}
            />
          )}

          {/* ════ SECONDARY VIEW: B2B WHOLESALE ═════════════════════════════════ */}
          {activeNav === 'b2b' && (
            <div className="space-y-4 text-xs">
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-900">B2B Wholesale Tiers & Volume Pricing</h3>
                <p className="text-neutral-500 text-xs font-medium">Automated discounts applied to corporate & gifting checkout</p>

                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  {b2bTiers.map((tier, idx) => (
                    <div key={idx} className="p-4 border border-neutral-200 rounded-2xl bg-[#FAF8F5]/40 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-neutral-900 text-sm">{tier.label}</div>
                        <div className="text-neutral-500 text-[11px]">Minimum Order: {tier.minUnits}+ frames</div>
                      </div>
                      <span className="text-lg font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 tabular-nums">
                        {tier.discountPercent}% OFF
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ SECONDARY VIEW: PROMO COUPONS ═════════════════════════════════ */}
          {activeNav === 'coupons' && (
            <div className="space-y-4 text-xs">
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
                  <div>
                    <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-900">Active Coupons & Promo Engine</h3>
                    <p className="text-neutral-500 text-xs mt-0.5 font-medium">Discount codes configured for online storefront</p>
                  </div>
                </div>

                <div className="divide-y divide-neutral-100">
                  {couponsList.map((c) => (
                    <div key={c.code} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg text-sm">
                          {c.code}
                        </span>
                        <span className="text-neutral-600 ml-3 font-medium">{c.label || 'Discount'}</span>
                      </div>
                      <div className="font-bold text-emerald-700 font-mono">
                        {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── CONTEXTUAL SLIDE-OVER ORDER DETAIL DRAWER ────────────────────────── */}
      {isDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans">
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200 border-l border-neutral-200">
            
            {/* Drawer Header (Matching Screenshot 3) */}
            <div className="p-5 border-b border-neutral-200 bg-white space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xl font-bold text-neutral-950 flex items-center gap-2">
                  <span>#{selectedOrder.id}</span>
                  <button 
                    onClick={() => handleCopy(selectedOrder.id, 'drawer-id')}
                    className="text-neutral-400 hover:text-black cursor-pointer"
                    title="Copy Order ID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </h2>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="h-8 w-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status Badges & Timestamp Row (Matching Screenshot 3) */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                {selectedOrder.status === 'Paid' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Payment verified
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
                    Payment not verified
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 font-mono">
                  {selectedOrder.transactionId?.startsWith('WA_') || selectedOrder.status === 'WhatsApp Order' ? 'WhatsApp order' : 'Razorpay Checkout'}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono ml-auto">
                  Ordered {getOrderAge(selectedOrder.createdAt)} · Ship by {getShipByDate(selectedOrder.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs bg-[#FAF8F5]/40">
              
              {/* Warning Banner 1: Payment Verification (Matching Screenshot 3) */}
              {selectedOrder.status !== 'Paid' && (
                <div className="p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl flex items-center justify-between gap-3 text-xs text-[#991B1B] shadow-2xs">
                  <span className="font-medium leading-relaxed">
                    Payment was not verified through Razorpay. Do not ship until it is confirmed.
                  </span>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Paid', 'Manual payment verification marked by staff.')}
                    className="px-4 py-2 bg-neutral-950 hover:bg-black text-white text-xs font-bold rounded-full shrink-0 transition cursor-pointer shadow-xs"
                  >
                    Verify payment
                  </button>
                </div>
              )}

              {/* Warning Banner 2: Shiprocket AWB Assignment (Matching Screenshot 3) */}
              {(!selectedOrder.trackingNumber || selectedOrder.trackingNumber === 'Pending Assignment') && (
                <div className="p-3.5 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl flex items-center justify-between gap-3 text-xs text-[#9A3412] shadow-2xs">
                  <span className="font-medium leading-relaxed">
                    Shiprocket order created, but no courier or AWB is assigned yet.
                  </span>
                  <button
                    onClick={() => handleSyncShiprocket(selectedOrder.id)}
                    className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold rounded-full shrink-0 transition cursor-pointer shadow-xs"
                  >
                    Retry AWB assignment
                  </button>
                </div>
              )}

              {/* ── FRAMES Section (Matching Screenshot 3) ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    FRAMES ({selectedOrder.cart?.length || 0})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPrintWorkOrderOpen(selectedOrder)}
                      className="px-3 py-1.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition cursor-pointer shadow-2xs"
                    >
                      Print all (PDF)
                    </button>
                    <div className="relative group/zip">
                      <button
                        onClick={() => handleDownloadOrderPhotosZip(selectedOrder)}
                        disabled={isZippingOrderId === selectedOrder.id}
                        className="px-3 py-1.5 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <span>{isZippingOrderId === selectedOrder.id ? 'Zipping...' : 'Download ZIP'}</span>
                        <span className="text-[10px]">▾</span>
                      </button>
                      <div className="absolute right-0 top-full mt-1 hidden group-hover/zip:block bg-white rounded-xl shadow-lg border border-neutral-200 py-1 w-48 z-20 text-xs">
                        <button
                          onClick={() => handleDownloadOrderPhotosZip(selectedOrder)}
                          className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 text-neutral-800 font-medium"
                        >
                          All Photos (ZIP)
                        </button>
                        <button
                          onClick={() => handleDownloadOnlyAdjustedZip(selectedOrder)}
                          className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 text-neutral-800 font-medium"
                        >
                          Adjusted 4×6 Only (ZIP)
                        </button>
                        <button
                          onClick={() => handleDownloadOnlyOriginalsZip(selectedOrder)}
                          className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 text-neutral-800 font-medium"
                        >
                          Raw Originals Only (ZIP)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frame Cards List */}
                <div className="space-y-4">
                  {(selectedOrder.cart || []).map((item: any, idx: number) => {
                    const rawOriginal = item.originalUrl || item.previewUrl;
                    const safeAdjusted = getSafePhotoUrl(item.previewUrl);
                    const safeOrig = getSafePhotoUrl(rawOriginal);
                    const stages = ['pending', 'printed', 'cut', 'assembled', 'qc_passed'] as const;
                    const currentStageIndex = stages.indexOf(item.itemStatus || 'pending');

                    return (
                      <div key={idx} className="border border-neutral-200/90 rounded-3xl p-4 bg-white space-y-3 shadow-xs">
                        {/* Title Row */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-900 text-sm">
                            Frame {idx + 1} · {item.shapeName || 'Custom Frame'}
                          </span>
                          <span className="text-neutral-500 font-mono text-[11px]">
                            {item.selectedSize || '3 × 4 in'} · {item.cropMode === 'fit' ? 'Full Photo (No Cutoff)' : 'Fill (Auto-Crop)'} · ₹{item.price || 299}
                          </span>
                        </div>

                        {/* Pipeline Stage Pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {stages.map((st, sIdx) => {
                            const isPassed = sIdx < currentStageIndex || (st === 'qc_passed' && item.itemStatus === 'qc_passed');
                            const isCurrent = item.itemStatus === st || (!item.itemStatus && st === 'pending');
                            const label = st === 'pending' ? 'Print Q' : st === 'printed' ? 'Printed' : st === 'cut' ? 'Cut' : st === 'assembled' ? 'Assembled' : 'QC passed';

                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleUpdateItemStatus(selectedOrder.id, idx, st)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                  isCurrent
                                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                    : isPassed
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                                }`}
                              >
                                {(isPassed || isCurrent) && <span className="mr-0.5">✓</span>}
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Side-by-Side Photo Previews (Matching Screenshot 3) */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <div className="relative aspect-[3/4] w-full bg-[#FAF6F0] rounded-2xl overflow-hidden flex items-center justify-center border border-neutral-200/80 shadow-inner">
                              <img 
                                src={safeAdjusted} 
                                alt="Adjusted print" 
                                onError={(e) => { e.currentTarget.src = '/images/Landingprofile.png'; }}
                                className="max-h-full max-w-full object-contain" 
                              />
                            </div>
                            <span className="text-[10px] font-mono text-neutral-500 text-center block">
                              Adjusted · 300 DPI
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="relative aspect-[3/4] w-full bg-[#FAF6F0] rounded-2xl overflow-hidden flex items-center justify-center border border-neutral-200/80 shadow-inner">
                              <img 
                                src={safeOrig} 
                                alt="Original upload" 
                                onError={(e) => { e.currentTarget.src = '/images/Landingprofile.png'; }}
                                className="max-h-full max-w-full object-contain" 
                              />
                            </div>
                            <span className="text-[10px] font-mono text-neutral-500 text-center block">
                              Original · untouched
                            </span>
                          </div>
                        </div>

                        {/* Frame Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handlePrintSingleItemPhoto(item, selectedOrder.id, idx, 'adjusted')}
                            className="py-2 px-4 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-full shadow-xs transition cursor-pointer"
                          >
                            Print adjusted 4×6
                          </button>
                          <button
                            onClick={() => setIsCropEditorOpen({ order: selectedOrder, itemIndex: idx, item })}
                            className="py-2 px-4 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-full transition cursor-pointer shadow-2xs"
                          >
                            Re-crop
                          </button>
                          
                          {/* More Options Dropdown */}
                          <div className="relative group/more ml-auto">
                            <button
                              type="button"
                              className="py-2 px-3 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-full transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <span>More</span>
                              <span className="text-[10px]">▾</span>
                            </button>
                            <div className="absolute right-0 bottom-full mb-1 hidden group-hover/more:block bg-white rounded-xl shadow-lg border border-neutral-200 py-1 w-44 z-20 text-xs">
                              <button
                                onClick={() => handleDownloadAdjustedPhoto(selectedOrder.id, idx, item)}
                                className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 text-neutral-800 font-medium"
                              >
                                Download 4×6 PNG
                              </button>
                              <button
                                onClick={() => handleDownloadOriginalPhoto(selectedOrder.id, idx, item)}
                                className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 text-neutral-800 font-medium"
                              >
                                Download Original
                              </button>
                              <button
                                onClick={() => handlePrintSingleItemPhoto(item, selectedOrder.id, idx, 'original')}
                                className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 text-neutral-800 font-medium"
                              >
                                Print Raw Original
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── CUSTOMER & ADDRESS Section (Matching Screenshot 3) ── */}
              <div className="border border-neutral-200/90 rounded-3xl p-5 bg-white space-y-2 shadow-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                  CUSTOMER &amp; ADDRESS
                </span>
                <div className="font-bold text-neutral-900 text-sm">
                  {selectedOrder.shippingDetails?.fullName || 'Customer'}
                </div>
                <div className="text-xs text-neutral-600 leading-relaxed font-normal">
                  {selectedOrder.shippingDetails?.address}
                  <div>
                    {selectedOrder.shippingDetails?.city || 'Bengaluru'}, {selectedOrder.shippingDetails?.state || 'Karnataka'} {selectedOrder.shippingDetails?.pincode || '560001'}
                  </div>
                </div>
                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-neutral-100 text-xs">
                  <span className="font-mono font-bold text-neutral-900">
                    {selectedOrder.shippingDetails?.phone}
                  </span>
                  <button
                    onClick={() => handleCopy(selectedOrder.shippingDetails?.phone, 'phone')}
                    className="px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 cursor-pointer"
                  >
                    Copy
                  </button>
                  {selectedOrder.shippingDetails?.phone && (
                    <a 
                      href={`https://wa.me/91${(selectedOrder.shippingDetails?.phone || '').replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-800 cursor-pointer"
                    >
                      WhatsApp →
                    </a>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold ml-auto">
                    Pincode serviceable
                  </span>
                </div>
              </div>

              {/* ── PAYMENT & INVOICE Section (Matching Screenshot 3) ── */}
              <div className="border border-neutral-200/90 rounded-3xl p-5 bg-white space-y-3 shadow-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                  PAYMENT &amp; INVOICE
                </span>
                <div className="space-y-1.5 text-xs font-normal">
                  <div className="flex justify-between text-neutral-600">
                    <span>Source</span>
                    <span className="font-medium text-neutral-900">
                      {selectedOrder.transactionId?.startsWith('WA_') || selectedOrder.status === 'WhatsApp Order' ? 'WhatsApp order' : 'Razorpay Checkout'}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Razorpay payment ID</span>
                    <span className="font-mono font-medium">
                      {selectedOrder.status === 'Paid' ? (
                        selectedOrder.transactionId
                      ) : (
                        <span className="text-red-600 font-semibold">None recorded</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Items subtotal</span>
                    <span className="font-mono text-neutral-900">
                      ₹{selectedOrder.subtotal || selectedOrder.grandTotal}
                    </span>
                  </div>
                  {selectedOrder.bulkDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>3-frame bundle discount</span>
                      <span className="font-mono">-₹{selectedOrder.bulkDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="font-medium text-neutral-900">
                      {selectedOrder.deliveryCharge === 0 ? 'Free' : `₹${selectedOrder.deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-100 pt-2 font-bold text-neutral-950 text-sm">
                    <span>Total</span>
                    <span className="font-mono font-bold text-base">₹{selectedOrder.grandTotal}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 pt-1 text-[11px]">
                    <span>Invoice no.</span>
                    <span className="font-mono text-neutral-700">INV-{selectedOrder.id.replace(/^KRIA-/, '')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Taxable value - GST</span>
                    <span className="font-mono text-neutral-700">
                      ₹{Math.round(selectedOrder.grandTotal * 0.82)} + ₹{Math.round(selectedOrder.grandTotal * 0.18)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setIsPrintTaxInvoiceOpen(selectedOrder)}
                    className="py-2 px-4 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-semibold tracking-wide transition cursor-pointer shadow-2xs"
                  >
                    Download GST Invoice
                  </button>
                  {selectedOrder.status !== 'Refunded' && (
                    <button
                      onClick={() => {
                        setIsRefundModalOpen({ order: selectedOrder });
                        setRefundForm({ amount: selectedOrder.grandTotal, reason: 'Customer requested refund' });
                      }}
                      className="py-2 px-4 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition cursor-pointer"
                    >
                      Issue refund
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400 font-light">
                  Refund is available once a payment is verified.
                </p>
              </div>

              {/* ── SHIPMENT Section (Matching Screenshot 3) ── */}
              <div className="border border-neutral-200/90 rounded-3xl p-5 bg-white space-y-3 shadow-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                  SHIPMENT
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Courier</span>
                    <span className="font-medium text-neutral-900">{selectedOrder.courierName || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>AWB</span>
                    <span>
                      {selectedOrder.trackingNumber ? (
                        <strong className="text-emerald-800 font-mono">{selectedOrder.trackingNumber}</strong>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                          Pending
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shiprocket order · shipment</span>
                    <span className="font-mono text-neutral-800">
                      {selectedOrder.shiprocketOrderId || selectedOrder.shipmentId 
                        ? `#${selectedOrder.shiprocketOrderId || '1652493707'} · #${selectedOrder.shipmentId || '1640219096'}`
                        : 'Pending creation'}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Parcel weight</span>
                    <span className="font-mono text-neutral-800">
                      {(selectedOrder.cart?.length || 1) * 120}g
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSyncShiprocket(selectedOrder.id)}
                    className="py-2 px-4 rounded-full bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    Retry AWB assignment
                  </button>
                  <button
                    onClick={() => handleGeneratePDFLabel(selectedOrder)}
                    className="py-2 px-4 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
                  >
                    Print label
                  </button>
                  <button
                    onClick={() => handleScheduleCourierPickup(selectedOrder.id)}
                    className="py-2 px-4 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
                  >
                    Schedule pickup
                  </button>
                </div>
              </div>

              {/* Real Audit Timeline */}
              <div className="space-y-2">
                <span className="text-[11px] text-neutral-400 uppercase font-semibold tracking-wider block">
                  Order Timeline & History Log
                </span>
                <div className="space-y-2 border-l-2 border-neutral-200 pl-3">
                  {(selectedOrder.history || []).map((h: any, i: number) => (
                    <div key={i} className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900">{h.status}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-neutral-600 text-[11px]">{h.note}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sticky Action Footer with Quality Check Gate */}
            <div className="p-4 border-t border-neutral-200 bg-[#FAF8F5] space-y-2">
              {['Processing', 'Production', 'Quality Check'].includes(selectedOrder.status) && (() => {
                const unpassed = (selectedOrder.cart || []).filter((it: any) => it.itemStatus !== 'qc_passed');
                if (unpassed.length > 0) {
                  return (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                        <span>{unpassed.length} of {selectedOrder.cart.length} frame(s) awaiting QC pass.</span>
                      </div>
                      <button
                        onClick={async () => {
                          for (let i = 0; i < selectedOrder.cart.length; i++) {
                            await handleUpdateItemStatus(selectedOrder.id, i, 'qc_passed');
                          }
                          await handleUpdateStatus(selectedOrder.id, 'Packed', 'All items passed QC. Order marked Packed.');
                        }}
                        className="text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        Pass All QC & Pack →
                      </button>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex items-center gap-2">
                {['Pending', 'Payment Verified', 'WhatsApp Order'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Production', 'Approved for Production.')}
                    className="flex-1 py-3 bg-neutral-900 hover:bg-black text-white text-xs font-semibold tracking-wide rounded-xl transition shadow-md cursor-pointer"
                  >
                    Start Factory Production →
                  </button>
                )}

                {['Processing', 'Production'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Quality Check', 'Assembly complete. Sent to QC.')}
                    className="flex-1 py-3 bg-purple-900 hover:bg-purple-950 text-white text-xs font-semibold tracking-wide rounded-xl transition shadow-md cursor-pointer"
                  >
                    Move to Quality Check (QC) →
                  </button>
                )}

                {selectedOrder.status === 'Quality Check' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Packed', 'Quality verified. Order packed.')}
                    className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold tracking-wide rounded-xl transition shadow-md cursor-pointer"
                  >
                    Pass QC & Mark Packed ✓
                  </button>
                )}

                {selectedOrder.status === 'Packed' && (
                  <button
                    onClick={() => handleSyncShiprocket(selectedOrder.id)}
                    className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold tracking-wide rounded-xl transition shadow-md cursor-pointer"
                  >
                    Generate Shiprocket AWB →
                  </button>
                )}

                {selectedOrder.status === 'Shipped' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered', 'Delivered to customer.')}
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold tracking-wide rounded-xl transition shadow-md cursor-pointer"
                  >
                    Confirm Delivery ✓
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── GST TAX INVOICE POPUP MODAL ─────────────────────────────────────── */}
      {isPrintTaxInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/90 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-neutral-300 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            <div className="bg-neutral-100 p-4 border-b border-neutral-200 flex justify-between items-center print:hidden">
              <div>
                <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">GST Tax Invoice</h4>
                <p className="text-[11px] font-mono text-neutral-500 mt-0.5">Order ID: {isPrintTaxInvoiceOpen.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white transition-all text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer tracking-wide"
                >
                  <Printer className="h-3 w-3 text-white" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setIsPrintTaxInvoiceOpen(null)}
                  className="p-1 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer text-neutral-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-8 bg-white font-sans text-neutral-900 select-all grow overflow-y-auto">
              <div className="border-b-2 border-neutral-900 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900">
                    KRIA <span className="font-sans text-xs tracking-widest font-bold border border-neutral-900 px-2 py-0.5 rounded ml-1 bg-neutral-50">PRINTS</span>
                  </h2>
                  <div className="text-[11px] text-neutral-600 mt-2 space-y-0.5">
                    <p><strong>{businessSettings.company_name || 'KRIA STUDIO'}</strong></p>
                    <p>{warehouseForm.address1 || 'Operating Facility'}, {warehouseForm.city || 'Hyderabad'} - {warehouseForm.pincode}</p>
                    <p>GSTIN: <span className="font-mono">{businessSettings.gstin || warehouseForm.gstin || '36AAAFK7892P1Z0'}</span></p>
                  </div>
                </div>
                <div className="text-right space-y-1 text-[11px] bg-neutral-50 p-3 border border-neutral-200 rounded-xl">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold">INVOICE DETAILS</p>
                  <p><strong>INVOICE NO:</strong> <span className="font-mono">{`INV-${isPrintTaxInvoiceOpen.id.replace(/^KRIA-/, '')}`}</span></p>
                  <p><strong>DATE:</strong> {new Date(isPrintTaxInvoiceOpen.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
                  <p className="text-emerald-700 font-bold uppercase pt-1">PAYMENT: PREPAID</p>
                </div>
              </div>

              <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50/50 mb-6 text-[11px]">
                <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">BILLED & SHIPPED TO:</p>
                <p className="font-bold text-neutral-900 text-sm">{isPrintTaxInvoiceOpen.shippingDetails?.fullName}</p>
                <p className="text-neutral-700 mt-1">{isPrintTaxInvoiceOpen.shippingDetails?.address}</p>
                <p className="text-neutral-900 font-semibold">{isPrintTaxInvoiceOpen.shippingDetails?.city}, {isPrintTaxInvoiceOpen.shippingDetails?.state} - <span className="font-mono">{isPrintTaxInvoiceOpen.shippingDetails?.pincode}</span></p>
                <p className="text-neutral-600 mt-1">Phone: <strong>{isPrintTaxInvoiceOpen.shippingDetails?.phone}</strong></p>
              </div>

              {/* Items Table */}
              <div className="border border-neutral-300 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-neutral-100 text-neutral-800 border-b border-neutral-300 font-semibold">
                    <tr>
                      <th className="p-2.5">ITEM DESCRIPTION</th>
                      <th className="p-2.5 text-center">QTY</th>
                      <th className="p-2.5 text-right">UNIT PRICE</th>
                      <th className="p-2.5 text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {(isPrintTaxInvoiceOpen.cart || []).map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold">{item.shapeName || "Custom Acrylic Magnet"} ({item.shapeId})</td>
                        <td className="p-2.5 text-center font-semibold">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono">₹{item.price}</td>
                        <td className="p-2.5 text-right font-mono font-bold">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-1.5 border-t-2 border-neutral-900 pt-2 font-bold text-sm">
                  <div className="flex justify-between">
                    <span>GRAND TOTAL PAID:</span>
                    <span className="font-mono">₹{isPrintTaxInvoiceOpen.grandTotal}</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-normal">Inclusive of 18% GST (CGST + SGST)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PRICE MODAL ────────────────────────────────────────────────── */}
      {editingPriceProduct && (
        <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-md border border-neutral-300 shadow-2xl p-6 space-y-5 text-left text-xs">
            <div className="flex justify-between items-start border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">PRODUCT PRICING</span>
                <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-900">{editingPriceProduct.name}</h3>
              </div>
              <button onClick={() => setEditingPriceProduct(null)} className="p-1 text-neutral-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase text-neutral-600 block mb-1">Standard Base Price (₹)</label>
                <input 
                  type="number" 
                  value={editPriceForm.price} 
                  onChange={(e) => setEditPriceForm({ ...editPriceForm, price: Number(e.target.value) })}
                  className="w-full border-2 border-neutral-300 rounded-xl px-4 py-2 font-mono text-lg font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase text-neutral-600 block mb-1">MRP / Strike Price (₹)</label>
                <input 
                  type="number" 
                  value={editPriceForm.originalPrice} 
                  onChange={(e) => setEditPriceForm({ ...editPriceForm, originalPrice: Number(e.target.value) })}
                  className="w-full border-2 border-neutral-300 rounded-xl px-4 py-2 font-mono text-base font-bold text-neutral-600"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleSavePriceModal}
                className="flex-1 bg-neutral-900 hover:bg-black text-white font-semibold text-xs tracking-wide py-3 rounded-xl transition cursor-pointer"
              >
                Save Prices
              </button>
              <button 
                onClick={() => setEditingPriceProduct(null)}
                className="px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs tracking-wide py-3 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXECUTIVE ANALYTICS MODAL ───────────────────────────────────────── */}
      {isAnalyticsOpen && (() => {
        const totalRev = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const totalOrds = orders.length;
        const calcAov = totalOrds > 0 ? Math.round(totalRev / totalOrds) : 0;
        const estProfit = Math.round(totalRev * 0.65);

        return (
          <div className="fixed inset-0 z-50 bg-neutral-900/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl w-full max-w-2xl border border-neutral-300 shadow-2xl p-6 md:p-8 space-y-6 text-left text-xs">
              <div className="flex justify-between items-start border-b border-neutral-200 pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    EXECUTIVE ANALYTICS
                  </span>
                  <h3 className="font-sans text-xl font-bold tracking-tight text-neutral-900 mt-1">KRIA Business Intelligence</h3>
                </div>
                <button onClick={() => setIsAnalyticsOpen(false)} className="p-1 text-neutral-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-neutral-900 text-white p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-[#E8DCCF]/70 uppercase block font-medium">GROSS REVENUE</span>
                  <p className="text-xl font-bold text-[#E8DCCF] font-mono">₹{totalRev.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-emerald-800 uppercase block font-semibold">EST. PROFIT (65%)</span>
                  <p className="text-xl font-bold text-emerald-900 font-mono">₹{estProfit.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-blue-800 uppercase block font-semibold">AOV</span>
                  <p className="text-xl font-bold text-blue-900 font-mono">₹{calcAov}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-purple-800 uppercase block font-semibold">TOTAL ORDERS</span>
                  <p className="text-xl font-bold text-purple-900 tabular-nums">{totalOrds}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsAnalyticsOpen(false)}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white font-semibold text-xs tracking-wide rounded-xl transition cursor-pointer"
                >
                  Close Analytics
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 4×6 DIRECT PHOTO PRINTING WORKSTATION MODAL ────────────────────── */}
      {isPrintWorkOrderOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-6 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-5xl border border-neutral-300 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left">
            
            {/* Workstation Top Bar (Excluded from Print) */}
            <div className="bg-[#1C1917] text-white p-4 sm:p-5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-[#D97706] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    Factory Workstation
                  </span>
                  <span className="text-xs text-neutral-400">Order #{isPrintWorkOrderOpen.id}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  4×6 Photo Printing & Hand-Cutting Canvas
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Customer: <strong className="text-white">{isPrintWorkOrderOpen.shippingDetails?.fullName || 'Customer'}</strong> · {isPrintWorkOrderOpen.shippingDetails?.city} · {(isPrintWorkOrderOpen.cart || []).length} Frame(s)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadOrderPhotosZip(isPrintWorkOrderOpen)}
                  disabled={isZippingOrderId === isPrintWorkOrderOpen.id}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-neutral-700"
                >
                  <Download className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isZippingOrderId === isPrintWorkOrderOpen.id ? 'Creating ZIP…' : 'Download Photo ZIP'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Printer className="h-3.5 w-3.5 text-neutral-950" />
                  <span>Print All 4×6 Sheets</span>
                </button>

                <button
                  onClick={() => setIsPrintWorkOrderOpen(null)}
                  className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white cursor-pointer ml-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Instruction banner */}
            <div className="bg-amber-50/70 border-b border-amber-200/80 px-5 py-2.5 flex items-center justify-between text-xs text-amber-950 print:hidden">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Printing Guide:</strong> Load 4×6 inch (100×150mm) photo paper into your printer. Cut along the dashed line by hand, then insert the photo between the two acrylic magnetic pieces.
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-800 shrink-0 hidden md:inline">
                Default: 300 DPI Bleed
              </span>
            </div>

            {/* Scrollable Gallery of 4x6 Canvases */}
            <div id="print-photo-sheet-body" className="flex-1 overflow-y-auto p-6 bg-[#FAF8F5] space-y-8">
              {(isPrintWorkOrderOpen.cart || []).map((item: any, idx: number) => {
                const currentMode = workOrderPrintMode[idx] || 'adjusted';
                return (
                  <div 
                    key={idx} 
                    className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-8 print-photo-page print:border-none print:shadow-none print:p-0 print:m-0"
                  >
                    {/* Left: Interactive Canvas Rendering */}
                    <div className="shrink-0 flex flex-col items-center">
                      <ShapedPhotoCanvasPrint 
                        item={item} 
                        orderId={isPrintWorkOrderOpen.id} 
                        itemIdx={idx} 
                        photoMode={currentMode} 
                      />
                    </div>

                    {/* Right: Controls & Details (Hidden in Print) */}
                    <div className="flex-1 space-y-4 w-full print:hidden">
                      <div className="border-b border-neutral-200 pb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            FRAME {idx + 1} OF {(isPrintWorkOrderOpen.cart || []).length}
                          </span>
                          <span className="font-mono text-xs text-neutral-500">
                            Qty: <strong className="text-neutral-900">{item.quantity || 1}</strong>
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-neutral-900 mt-1">
                          {item.shapeName || item.shapeId} Frame
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Shape: <strong className="font-mono text-neutral-800">{item.shapeId}</strong> · Crop Mode: <strong className="uppercase">{item.cropMode || 'fill'}</strong>
                        </p>
                      </div>

                      {/* Photo Mode Switcher for this Frame */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 block">
                          Print Output Source:
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setWorkOrderPrintMode(prev => ({ ...prev, [idx]: 'adjusted' }))}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                              currentMode === 'adjusted'
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            Adjusted 4×6 (Customer Crop)
                          </button>
                          <button
                            type="button"
                            onClick={() => setWorkOrderPrintMode(prev => ({ ...prev, [idx]: 'original' }))}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                              currentMode === 'original'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                            }`}
                            title="Use when customer crop accidentally cut off a face"
                          >
                            Raw Original (Zero Cutoff)
                          </button>
                        </div>
                        {currentMode === 'original' && (
                          <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                            ⓘ Printing full original upload. This guarantees no face or edge clipping. Cut manually to fit magnetic acrylic plates.
                          </p>
                        )}
                      </div>

                      {/* Action buttons for single frame */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadAdjustedPhoto(isPrintWorkOrderOpen.id, idx, item)}
                          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-neutral-300 transition cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5 text-neutral-600" />
                          <span>Download 300 DPI File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintSingleItemPhoto(item, isPrintWorkOrderOpen.id, idx, currentMode)}
                          className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5 text-white" />
                          <span>Print This Sheet Only</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom Bar */}
            <div className="bg-white border-t border-neutral-200 p-4 flex items-center justify-between print:hidden">
              <span className="text-xs text-neutral-500 font-medium">
                Standard 4×6" (100×150mm) Photo Paper Format · High-Gloss Magnetic Acrylic Compatible
              </span>
              <button
                onClick={() => setIsPrintWorkOrderOpen(null)}
                className="px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Close Workstation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── CMS CROP & ZOOM PRECISION EDITOR MODAL ──────────────────────────── */}
      {isCropEditorOpen && (
        <CMSCropEditorModal
          order={isCropEditorOpen.order}
          itemIndex={isCropEditorOpen.itemIndex}
          item={isCropEditorOpen.item}
          adminToken={adminToken}
          onClose={() => setIsCropEditorOpen(null)}
          onSaved={(updatedOrder) => {
            setSelectedOrder(updatedOrder);
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            setIsCropEditorOpen(null);
          }}
        />
      )}

      {/* ── RAZORPAY REFUND MODAL ───────────────────────────────────────────── */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-md border border-neutral-300 shadow-2xl p-6 space-y-4 text-left text-xs">
            <div className="flex justify-between items-start border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-rose-600 font-bold">RAZORPAY REFUND</span>
                <h3 className="font-sans text-lg font-bold tracking-tight text-neutral-900">Order #{isRefundModalOpen.order.id}</h3>
              </div>
              <button onClick={() => setIsRefundModalOpen(null)} className="p-1 text-neutral-500 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold uppercase text-neutral-600 block mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: Number(e.target.value) })}
                  className="w-full border-2 border-neutral-300 rounded-xl px-4 py-2 font-mono text-lg font-bold"
                />
                <p className="text-[10px] text-neutral-400 mt-0.5">Order grand total: ₹{isRefundModalOpen.order.grandTotal}</p>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-neutral-600 block mb-1">Reason for Refund</label>
                <select
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  className="w-full border border-neutral-300 rounded-xl p-2.5 font-medium"
                >
                  <option value="Customer requested refund">Customer requested refund</option>
                  <option value="Damaged during shipping">Damaged during shipping</option>
                  <option value="Photo quality / crop dissatisfaction">Photo quality / crop dissatisfaction</option>
                  <option value="Duplicate payment / order cancelled">Duplicate payment / order cancelled</option>
                  <option value="Other staff adjustment">Other staff adjustment</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-neutral-200">
              <button
                onClick={handleProcessRefund}
                disabled={isSubmittingRefund}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {isSubmittingRefund ? 'Processing Refund…' : `Confirm ₹${refundForm.amount} Refund`}
              </button>
              <button
                onClick={() => setIsRefundModalOpen(null)}
                className="px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
