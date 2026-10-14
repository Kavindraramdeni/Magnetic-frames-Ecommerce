import React, { useState } from 'react';
import { 
  ArrowLeft, Check, Sparkles, Star, ShieldCheck, Truck, Plus, Minus, 
  ShoppingBag, Gift, ZoomIn
} from 'lucide-react';
import { ReturnGiftProduct, CartItem, MagnetShapeId } from '../types';

interface ReturnGiftDetailPageProps {
  gift: ReturnGiftProduct;
  onBackToHome: () => void;
  onAddToCart: (item: CartItem) => void;
  onDirectCheckout: (item: CartItem) => void;
  onCustomizeShape?: (shapeId: MagnetShapeId) => void;
}

// 4 Visual Showcase Galleries (Frame Photo, Direction to Use, On Fridge, Gift Box)
const RETURN_GIFT_GALLERIES: Record<string, { label: string; url: string }[]> = {
  'rg-ganesha': [
    { label: 'Frame Photo', url: '/images/return_gift_ganesha.svg' },
    { label: 'How to Use', url: '/images/banner_easy_4step_installation.png' },
    { label: 'On Fridge', url: '/images/refrigerator_magnets_lifestyle_1782460255084.jpg' },
    { label: 'Gift Box', url: '/images/banner_memory_deserves_place.png' }
  ],
  'rg-teddy': [
    { label: 'Frame Photo', url: '/images/return_gift_baby_teddy.svg' },
    { label: 'How to Use', url: '/images/banner_easy_4step_installation.png' },
    { label: 'On Fridge', url: '/images/refrigerator_magnets_lifestyle_1782460255084.jpg' },
    { label: 'Gift Box', url: '/images/banner_perfect_for_magnetic_surfaces.png' }
  ],
  'rg-wedding': [
    { label: 'Frame Photo', url: '/images/return_gift_wedding_favor.svg' },
    { label: 'How to Use', url: '/images/banner_easy_4step_installation.png' },
    { label: 'On Fridge', url: '/images/refrigerator_magnets_lifestyle_1782460255084.jpg' },
    { label: 'Gift Box', url: '/images/luxury_living_room_bg_1782458094193.jpg' }
  ],
  'rg-mandala': [
    { label: 'Frame Photo', url: '/images/return_gift_gold_mandala.svg' },
    { label: 'How to Use', url: '/images/banner_easy_4step_installation.png' },
    { label: 'On Fridge', url: '/images/refrigerator_magnets_lifestyle_1782460255084.jpg' },
    { label: 'Gift Box', url: '/images/banner_premium_design_made_to_last.png' }
  ]
};

export default function ReturnGiftDetailPage({
  gift,
  onBackToHome,
  onAddToCart,
  onDirectCheckout
}: ReturnGiftDetailPageProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [added, setAdded] = useState<boolean>(false);

  // Hover-to-zoom state
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Pincode checker state
  const [pincode, setPincode] = useState<string>('');
  const [deliveryResult, setDeliveryResult] = useState<string | null>(null);

  // Gallery images for active gift
  const gallery = RETURN_GIFT_GALLERIES[gift.id] || [
    { label: 'Front', url: gift.imageUrl },
    { label: 'Pair', url: '/images/acrylic_magnets_hero_1782423101134.jpg' },
    { label: 'Size', url: '/images/banner_easy_4step_installation.png' },
    { label: 'Detail', url: '/images/banner_memory_deserves_place.png' },
    { label: 'Gift', url: '/images/lifestyle_gallery_workspace_1779653492345.png' },
    { label: 'Pack', url: '/images/clean_studio_bg_1782458110845.jpg' }
  ];
  const activeImage = gallery[activeImageIndex] || gallery[0];

  // Bulk discount calculation
  const getDiscountPercent = (qty: number) => {
    if (qty >= 51) return 40;
    if (qty >= 26) return 30;
    if (qty >= 11) return 20;
    if (qty >= 5) return 10;
    return 0;
  };

  const discountPercent = getDiscountPercent(quantity);
  const unitPrice = discountPercent > 0 
    ? Math.round(gift.price * (1 - discountPercent / 100))
    : gift.price;
  const totalPrice = unitPrice * quantity;

  // Zoom mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleOrder = (isDirectBuy = false) => {
    const cartItem: CartItem = {
      id: `rg-${gift.id}-${Date.now()}`,
      shapeId: gift.shapeId,
      shapeName: `${gift.name} (${gift.dimensions})`,
      quantity,
      previewUrl: gift.imageUrl,
      originalUrl: gift.imageUrl,
      photoName: `${gift.name} - Fixed Art`,
      captionText: '',
      photoScale: 1,
      photoPanX: 0,
      photoPanY: 0,
      cropMode: 'fill',
      price: unitPrice,
      selectedSize: gift.dimensions,
      isReturnGift: true
    };

    if (isDirectBuy) {
      onDirectCheckout(cartItem);
    } else {
      onAddToCart(cartItem);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
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
        setDeliveryResult(`✓ Delivery available by ${dateFormatted} via ${data.courierName || 'Express Courier'}${data.region ? ` (${data.region})` : ''}. Bulk batches dispatch within 24-48 hrs.`);
      } else {
        setDeliveryResult(data.error || 'Delivery not serviceable to this pincode.');
      }
    } catch {
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + 3);
      const dateFormatted = estDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      setDeliveryResult(`✓ Delivery available by ${dateFormatted}. Bulk batches dispatch within 24-48 hrs.`);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const deliveryEstStr = deliveryDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 font-sans selection:bg-[#E8DCCF] pb-28">
      
      {/* ── Top Header / Breadcrumb Bar ────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-neutral-200/70">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-700 hover:text-black transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Storefront</span>
          </button>

          <span className="text-xs font-mono uppercase tracking-widest text-[#9E1B32] font-bold">
            Fixed Art Keepsakes · Return Gifts
          </span>

          <div className="text-xs text-neutral-500 font-mono">
            {gift.dimensions}
          </div>
        </div>
      </div>

      {/* ── Main Product Detail Page Layout ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ════ LEFT COLUMN: MAIN IMAGE WITH HOVER ZOOM & OTHER IMAGES UNDER IT ════ */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            {/* Main Image Container with Lens Zoom on Hover */}
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#FAF6F0] border border-neutral-200/80 cursor-crosshair group select-none shadow-xs"
            >
              <img
                src={activeImage.url}
                alt={gift.name}
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
              <div className="absolute top-3.5 left-3.5">
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-semibold text-white tracking-wide uppercase">
                  Fixed Artwork
                </span>
              </div>
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

            {/* Inclusions badges */}
            <div className="grid grid-cols-3 gap-2 w-full mt-6 text-center">
              <div className="bg-white border border-neutral-200/80 rounded-xl p-2.5 shadow-2xs">
                <Sparkles className="h-4 w-4 mx-auto text-[#A38A6E] mb-1" />
                <span className="text-[10px] font-semibold block text-neutral-800">Laser-Cut Acrylic</span>
                <span className="text-[9px] text-neutral-400">Glass-clear 3mm</span>
              </div>
              <div className="bg-white border border-neutral-200/80 rounded-xl p-2.5 shadow-2xs">
                <ShieldCheck className="h-4 w-4 mx-auto text-[#A38A6E] mb-1" />
                <span className="text-[10px] font-semibold block text-neutral-800">Neodymium Core</span>
                <span className="text-[9px] text-neutral-400">Strong grip</span>
              </div>
              <div className="bg-white border border-neutral-200/80 rounded-xl p-2.5 shadow-2xs">
                <Gift className="h-4 w-4 mx-auto text-[#A38A6E] mb-1" />
                <span className="text-[10px] font-semibold block text-neutral-800">Ready to Gift</span>
                <span className="text-[9px] text-neutral-400">Box packaging</span>
              </div>
            </div>

          </div>

          {/* ════ RIGHT COLUMN: FIXED FRAME PURCHASE & BULK SAVINGS ════ */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header info */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9E1B32] font-bold">
                {gift.category}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-neutral-950 mt-1 leading-tight">
                {gift.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-0.5 text-[#C4A574]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-neutral-500 font-mono">
                  4.9 (180+ event orders)
                </span>
                <span className="text-xs font-mono px-2 py-0.5 bg-neutral-100 rounded text-neutral-700">
                  {gift.dimensions}
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-2 font-light leading-relaxed">
                {gift.description}
              </p>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pb-2 border-b border-neutral-200/80">
              <span className="font-serif text-3xl font-normal text-neutral-950">
                ₹{unitPrice}
              </span>
              {gift.originalPrice > unitPrice && (
                <span className="text-sm font-mono text-neutral-400 line-through">
                  ₹{gift.originalPrice}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  {discountPercent}% Bulk Savings Applied
                </span>
              )}
              <span className="text-xs text-neutral-400 font-mono ml-auto">
                Taxes included
              </span>
            </div>

            {/* Tiered Bulk Discount Table */}
            <div className="rounded-2xl bg-white border border-neutral-200/90 p-4 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                <span className="uppercase tracking-wider font-mono text-[11px] text-neutral-500">Event Bulk Pricing Tiers</span>
                <span className="text-emerald-700 font-mono">Auto-applied in Bag</span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
                <div className={`p-2 rounded-xl border text-[11px] ${quantity >= 5 && quantity <= 10 ? 'bg-[#9E1B32]/10 border-[#9E1B32] font-bold text-[#9E1B32]' : 'bg-[#FAF8F5] border-neutral-200 text-neutral-600'}`}>
                  <div>5–10 pcs</div>
                  <div className="text-emerald-700 font-bold">10% OFF</div>
                </div>
                <div className={`p-2 rounded-xl border text-[11px] ${quantity >= 11 && quantity <= 25 ? 'bg-[#9E1B32]/10 border-[#9E1B32] font-bold text-[#9E1B32]' : 'bg-[#FAF8F5] border-neutral-200 text-neutral-600'}`}>
                  <div>11–25 pcs</div>
                  <div className="text-emerald-700 font-bold">20% OFF</div>
                </div>
                <div className={`p-2 rounded-xl border text-[11px] ${quantity >= 26 && quantity <= 50 ? 'bg-[#9E1B32]/10 border-[#9E1B32] font-bold text-[#9E1B32]' : 'bg-[#FAF8F5] border-neutral-200 text-neutral-600'}`}>
                  <div>26–50 pcs</div>
                  <div className="text-emerald-700 font-bold">30% OFF</div>
                </div>
                <div className={`p-2 rounded-xl border text-[11px] ${quantity >= 51 ? 'bg-[#9E1B32]/10 border-[#9E1B32] font-bold text-[#9E1B32]' : 'bg-[#FAF8F5] border-neutral-200 text-neutral-600'}`}>
                  <div>51+ pcs</div>
                  <div className="text-emerald-700 font-bold">40% OFF</div>
                </div>
              </div>
            </div>

            {/* Quantity Selector + Fast Add Buttons */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white rounded-2xl border border-neutral-200/90 p-3 shadow-2xs">
                <div>
                  <span className="text-xs font-semibold block text-neutral-900">Order Quantity</span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Total: <strong className="text-neutral-950 font-mono text-sm">₹{totalPrice}</strong> ({quantity} {quantity === 1 ? 'piece' : 'pieces'})
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center justify-center hover:bg-neutral-200 cursor-pointer transition text-sm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 text-center font-mono text-sm font-bold bg-[#FAF8F5] border border-neutral-200 rounded-xl py-1 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center justify-center hover:bg-neutral-200 cursor-pointer transition text-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Order Now and Add to Bag buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOrder(false)}
                  className={`py-3.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] ${
                    added
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOrder(true)}
                  className="py-3.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99]"
                >
                  <span>Order Now →</span>
                </button>
              </div>
            </div>

            {/* Check Delivery Card */}
            <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs space-y-3">
              <h3 className="font-serif text-lg font-medium text-neutral-900">Check Delivery</h3>
              <p className="text-xs text-neutral-500">Enter your pincode to check delivery availability.</p>
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
      </div>

      {/* ── Mobile Sticky Bottom CTA Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[10px] text-neutral-500 font-mono block uppercase">{gift.name} · {quantity} pc(s)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-neutral-900">₹{totalPrice}</span>
            {discountPercent > 0 && (
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleOrder(true)}
          className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-[#E8DCCF]" />
          <span>Buy Now</span>
        </button>
      </div>

    </div>
  );
}
