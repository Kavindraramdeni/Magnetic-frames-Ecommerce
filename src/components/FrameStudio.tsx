import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Check, Sparkles, ZoomIn, ShoppingBag, ShieldCheck, Truck, Gift, Star 
} from 'lucide-react';
import { BASE_SHAPES, fetchLiveCatalogShapes } from '../data';
import { CartItem, MagnetShape, MagnetShapeId } from '../types';
import CustomizeModal from './CustomizeModal';

interface FrameStudioProps {
  initialShapeId?: MagnetShapeId;
  initialSize?: string;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOpenCart: () => void;
  onBackToHome?: () => void;
  cartCount?: number;
}

// 4 Visual Showcase Galleries (Frame Photo, Direction to Use, On Fridge, Gift Box)
const SHAPE_GALLERIES: Record<string, { label: string; url: string }[]> = {
  love: [
    { label: 'Frame Photo', url: '/images/shape_heart_wedding_couple.png' },
    { label: 'How to Use', url: '/images/banner_easy_4step_installation.png' },
    { label: 'On Fridge', url: '/images/refrigerator_magnets_lifestyle_1782460255084.jpg' },
    { label: 'Gift Box', url: '/images/banner_memory_deserves_place.png' }
  ],
  circle: [
    { label: 'Frame Photo', url: '/images/shape_circle_family_dog.jpg' },
    { label: 'How to Use', url: '/images/banner_easy_4step_installation.png' },
    { label: 'On Fridge', url: '/images/refrigerator_magnets_lifestyle_1782460255084.jpg' },
    { label: 'Gift Box', url: '/images/banner_perfect_for_magnetic_surfaces.png' }
  ],
  polaroid: [
    { label: 'Frame Photo', url: '/images/shape_polaroid_magnet_1780939416510.png' },
    { label: 'How to Use', url: '/images/banner_easy_4step_installation.png' },
    { label: 'On Fridge', url: '/images/refrigerator_magnets_lifestyle_1782460255084.jpg' },
    { label: 'Gift Box', url: '/images/lifestyle_gallery_workspace_1779653492345.png' }
  ],
  grande: [
    { label: 'Frame Photo', url: '/images/shape_arch_magnet_1779653475722.png' },
    { label: 'How to Use', url: '/images/banner_easy_4step_installation.png' },
    { label: 'On Fridge', url: '/images/refrigerator_magnets_lifestyle_1782460255084.jpg' },
    { label: 'Gift Box', url: '/images/banner_premium_design_made_to_last.png' }
  ]
};

export default function FrameStudio({
  initialShapeId = 'love',
  initialSize,
  cart,
  setCart,
  onOpenCart,
  onBackToHome,
  cartCount = 0
}: FrameStudioProps) {
  const [catalogShapes, setCatalogShapes] = useState<MagnetShape[]>(BASE_SHAPES);
  const [activeShapeId, setActiveShapeId] = useState<MagnetShapeId>(initialShapeId);
  const [selectedSize, setSelectedSize] = useState<string>(initialSize || '');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Hover-to-zoom state
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Pincode checker state
  const [pincode, setPincode] = useState<string>('');
  const [deliveryResult, setDeliveryResult] = useState<string | null>(null);

  // Sync initial shape ID
  useEffect(() => {
    if (initialShapeId) {
      setActiveShapeId(initialShapeId);
    }
  }, [initialShapeId]);

  // Load catalog shapes
  useEffect(() => {
    let isMounted = true;
    fetchLiveCatalogShapes().then((liveShapes) => {
      if (isMounted && liveShapes.length > 0) {
        setCatalogShapes(liveShapes);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const activeShape = useMemo(() => {
    return catalogShapes.find(s => s.id === activeShapeId) || catalogShapes[0] || BASE_SHAPES[0];
  }, [catalogShapes, activeShapeId]);

  // Sync selected size if shape changes
  const activeSizes = activeShape.sizes && activeShape.sizes.length > 0
    ? activeShape.sizes
    : [{ size: activeShape.dimensions, label: activeShape.dimensions, price: activeShape.price }];

  const currentSizeOption = activeSizes.find(s => s.size === selectedSize) || activeSizes[0];

  // Gallery images for active shape
  const gallery = SHAPE_GALLERIES[activeShape.id] || SHAPE_GALLERIES['love'];
  const activeImage = gallery[activeImageIndex] || gallery[0];

  // Discount calculation
  const discountPercent = activeShape.originalPrice > currentSizeOption.price
    ? Math.round(((activeShape.originalPrice - currentSizeOption.price) / activeShape.originalPrice) * 100)
    : 25;

  // Zoom mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  // Real-time Pincode checker
  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setDeliveryResult('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    setDeliveryResult('Checking real-time courier serviceability…');
    try {
      const res = await fetch('/api/shiprocket/check-serviceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: cleanPin })
      });
      const data = await res.json();
      if (data.serviceable) {
        const days = data.estimatedDays || 3;
        const estDate = new Date();
        estDate.setDate(estDate.getDate() + days);
        const dateFormatted = estDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        setDeliveryResult(`✓ Free Express Delivery by ${dateFormatted} via ${data.courierName || 'Courier Partner'}${data.region ? ` (${data.region})` : ''}. Dispatched within 24h.`);
      } else {
        setDeliveryResult(data.error || 'Pincode not currently serviceable.');
      }
    } catch {
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + 3);
      const dateFormatted = estDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      setDeliveryResult(`✓ Free Delivery available by ${dateFormatted}. Express dispatch within 24 hours.`);
    }
  };

  // Add customized item to cart
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    onOpenCart();
  };

  // Dynamic date helpers
  const todayStr = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const deliveryEstStr = deliveryDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 font-sans selection:bg-[#E8DCCF] pb-28">
      
      {/* ── Top Navigation Bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-neutral-200/70">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-700 hover:text-black transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Storefront</span>
          </button>

          <span className="text-xs font-mono uppercase tracking-widest text-[#A38A6E] font-bold hidden sm:inline">
            KRIA Studio · Personalised Acrylic Frames
          </span>

          <button
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2 text-xs font-mono text-neutral-900 bg-white px-3.5 py-1.5 rounded-full border border-neutral-300 shadow-2xs hover:border-black cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Bag ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
          </button>
        </div>
      </header>

      {/* ── Main Product Detail Page Layout (Matching Screenshot 2) ─────────── */}
      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ════ LEFT COLUMN: MAIN IMAGE WITH CURSOR HOVER ZOOM & THUMBNAILS ════ */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            {/* Main Preview Container with Lens Zoom on Hover */}
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#FAF6F0] border border-neutral-200/80 cursor-crosshair group select-none shadow-xs"
            >
              <img
                src={activeImage.url}
                alt={activeShape.name}
                className="w-full h-full object-cover transition-transform duration-100 ease-out pointer-events-none"
                style={
                  isHovered
                    ? {
                        transform: 'scale(2.2)',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                      }
                    : {
                        transform: 'scale(1)',
                        transformOrigin: 'center center'
                      }
                }
              />
            </div>

            {/* Microcopy: Hover over the image to zoom */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-mono mt-3">
              <ZoomIn className="h-3.5 w-3.5 text-neutral-400" />
              <span>Hover over the image to zoom</span>
            </div>

            {/* 4 Visual Showcase Thumbnails: Frame Photo, How to Use, On Fridge, Gift Box */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mt-4 w-full max-w-md">
              {gallery.slice(0, 4).map((img, idx) => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`flex flex-col items-center gap-1.5 p-1.5 rounded-2xl border-2 transition-all cursor-pointer group ${
                    activeImageIndex === idx
                      ? 'border-neutral-900 bg-white shadow-sm ring-2 ring-neutral-900/10'
                      : 'border-neutral-200/90 bg-[#FAF6F0] hover:border-neutral-400 hover:bg-white'
                  }`}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center">
                    <img 
                      src={img.url} 
                      alt={img.label} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className={`text-[10px] font-mono font-semibold tracking-tight text-center leading-tight line-clamp-1 ${
                    activeImageIndex === idx ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-800'
                  }`}>
                    {img.label}
                  </span>
                </button>
              ))}
            </div>

          </div>

          {/* ════ RIGHT COLUMN: PRODUCT DETAILS & CUSTOMIZE CTA (MATCHING SCREENSHOT 2) ════ */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Category & Title */}
            <div>
              <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest font-semibold block">
                {activeShape.name}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-950 mt-1 leading-tight">
                {activeShape.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-light">
                Personalised magnetic acrylic photo frame · {currentSizeOption.size}
              </p>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-bold text-neutral-950">
                ₹{currentSizeOption.price}
              </span>
              <span className="font-mono text-sm text-neutral-400 line-through">
                ₹{activeShape.originalPrice}
              </span>
              <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                {discountPercent}% off
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Taxes included
              </span>
            </div>

            {/* Bundle Offer Banner (Matching Screenshot 2) */}
            <div className="bg-[#FEF7EC] border border-[#F6E1C3] p-3.5 rounded-2xl text-xs text-[#965A15] font-medium flex items-center justify-between shadow-2xs">
              <span>
                <strong>Bundle offer:</strong> any 3 frames for ₹599 · free shipping
              </span>
            </div>

            {/* Big Customize Button & Helper Text */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(true)}
                className="w-full py-4 px-8 rounded-full bg-[#241F1A] hover:bg-black text-white text-sm font-bold tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Sparkles className="h-4 w-4 text-[#E8DCCF]" />
                <span>Customize</span>
              </button>
              <p className="text-xs text-neutral-500 text-center font-light">
                You'll add your photo in the next step.
              </p>
            </div>

            {/* Value Bullets (Matching Screenshot 2) */}
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-700 font-light border-y border-neutral-200/80 py-4">
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">•</span>
                <span>Your photo is printed and assembled by hand, made to order</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">•</span>
                <span>Clear acrylic with magnetic closure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">•</span>
                <span>Ships in 2-3 days · free shipping over ₹599</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-400">•</span>
                <span>Prepaid orders only · personalised items can't be returned unless damaged</span>
              </li>
            </ul>

            {/* ── Check Delivery Card (Matching Screenshot 2) ── */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-3">
              <h3 className="font-serif text-lg font-medium text-neutral-900">
                Check Delivery
              </h3>
              <p className="text-xs text-neutral-500">
                Enter your pincode to check delivery availability.
              </p>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit pincode"
                  className="flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#241F1A] text-white text-xs font-semibold hover:bg-black transition cursor-pointer"
                >
                  Check
                </button>
              </form>
              {deliveryResult && (
                <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 font-mono">
                  {deliveryResult}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* ── Pop-up Dialog Box (Matching Screenshot 1) ───────────────────────── */}
      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        shape={activeShape}
        initialSize={currentSizeOption.size}
        onAddToCart={handleAddToCart}
      />

      {/* ── Mobile Sticky Bottom CTA Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[10px] text-neutral-500 font-mono block uppercase">{activeShape.name} · {currentSizeOption.size}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-neutral-900">₹{currentSizeOption.price}</span>
            {activeShape.originalPrice > currentSizeOption.price && (
              <span className="text-xs text-neutral-400 line-through font-mono">₹{activeShape.originalPrice}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCustomizeOpen(true)}
          className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#E8DCCF]" />
          <span>Customize</span>
        </button>
      </div>

    </div>
  );
}
