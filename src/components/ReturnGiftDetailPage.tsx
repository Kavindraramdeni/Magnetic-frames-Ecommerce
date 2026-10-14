import React, { useState } from 'react';
import { 
  ArrowLeft, Check, Sparkles, Star, ShieldCheck, Truck, Plus, Minus, 
  ShoppingBag, Gift, Heart, Edit3, Image, CheckCircle2 
} from 'lucide-react';
import { ReturnGiftProduct, CartItem, MagnetShapeId } from '../types';

interface ReturnGiftDetailPageProps {
  gift: ReturnGiftProduct;
  onBackToHome: () => void;
  onAddToCart: (item: CartItem) => void;
  onDirectCheckout: (item: CartItem) => void;
  onCustomizeShape: (shapeId: MagnetShapeId, initialPhotoUrl?: string, customText?: string) => void;
}

export default function ReturnGiftDetailPage({
  gift,
  onBackToHome,
  onAddToCart,
  onDirectCheckout,
  onCustomizeShape
}: ReturnGiftDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'fixed' | 'personalize' | 'photo'>('fixed');
  const [quantity, setQuantity] = useState<number>(1);
  const [customNames, setCustomNames] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>('');
  const [added, setAdded] = useState<boolean>(false);

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

  const handleAddReadyMade = (isCheckout = false) => {
    const isPersonalized = activeTab === 'personalize' && (customNames || customDate);
    const customCaption = isPersonalized 
      ? [customNames, customDate].filter(Boolean).join(' · ')
      : '';

    const cartItem: CartItem = {
      id: `rg-${gift.id}-${Date.now()}`,
      shapeId: gift.shapeId,
      shapeName: isPersonalized 
        ? `${gift.name} [Personalized] (${gift.dimensions})`
        : `${gift.name} (${gift.dimensions})`,
      quantity,
      previewUrl: gift.imageUrl,
      originalUrl: gift.imageUrl,
      photoName: `${gift.name} - Return Gift`,
      captionText: customCaption,
      photoScale: 1,
      photoPanX: 0,
      photoPanY: 0,
      cropMode: 'fill',
      price: unitPrice,
      selectedSize: gift.dimensions,
      isReturnGift: true
    };

    if (isCheckout) {
      onDirectCheckout(cartItem);
    } else {
      onAddToCart(cartItem);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 font-sans selection:bg-[#E8DCCF] pb-28">
      {/* Top Header / Breadcrumb Bar */}
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
            Return Gifts Collection
          </span>

          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <span>{gift.dimensions}</span>
          </div>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full bg-[#1a1714] rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group">
              {/* Image Frame */}
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-neutral-900">
                <img
                  src={gift.imageUrl}
                  alt={gift.name}
                  className="w-full h-full object-cover"
                />

                {/* Live Custom Text Overlay in Personalize mode */}
                {activeTab === 'personalize' && (customNames || customDate) && (
                  <div className="absolute inset-x-4 bottom-6 bg-black/70 backdrop-blur-md rounded-xl p-3 text-center border border-white/30 text-white shadow-xl animate-fade-in">
                    {customNames && (
                      <div className="font-serif text-sm font-semibold tracking-wide text-[#F9E7B9]">
                        {customNames}
                      </div>
                    )}
                    {customDate && (
                      <div className="text-[10px] font-mono tracking-wider text-white/80 mt-0.5">
                        {customDate}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-semibold text-white tracking-wide uppercase">
                  Fixed Luxury Art
                </span>
                <span className="rounded-full bg-[#9E1B32] px-3 py-1 text-[10px] font-semibold text-white tracking-wide uppercase">
                  3mm Cast Acrylic
                </span>
              </div>
            </div>

            {/* Inclusions Under Image */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center">
              <div className="bg-white border border-neutral-200/80 rounded-xl p-2.5">
                <Sparkles className="h-4 w-4 mx-auto text-[#A38A6E] mb-1" />
                <span className="text-[10px] font-semibold block text-neutral-800">Laser-Cut Acrylic</span>
                <span className="text-[9px] text-neutral-400">Glass-clear finish</span>
              </div>
              <div className="bg-white border border-neutral-200/80 rounded-xl p-2.5">
                <ShieldCheck className="h-4 w-4 mx-auto text-[#A38A6E] mb-1" />
                <span className="text-[10px] font-semibold block text-neutral-800">Neodymium Core</span>
                <span className="text-[9px] text-neutral-400">Never slips</span>
              </div>
              <div className="bg-white border border-neutral-200/80 rounded-xl p-2.5">
                <Gift className="h-4 w-4 mx-auto text-[#A38A6E] mb-1" />
                <span className="text-[10px] font-semibold block text-neutral-800">Ready to Gift</span>
                <span className="text-[9px] text-neutral-400">Box packaging</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customization & Purchase Options */}
          <div className="lg:col-span-6 space-y-6">
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
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-neutral-200/80">
              <span className="font-serif text-3xl font-normal text-neutral-950">
                ₹{unitPrice}
              </span>
              {gift.originalPrice > unitPrice && (
                <span className="text-sm font-mono text-neutral-400 line-through">
                  ₹{gift.originalPrice}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {discountPercent}% Bulk Savings Applied
                </span>
              )}
            </div>

            {/* 3 Modes: Fixed Art vs Personalize Text vs Replace Photo */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold block">
                Choose How You Want to Order:
              </span>
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('fixed')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition cursor-pointer text-center ${
                    activeTab === 'fixed'
                      ? 'bg-neutral-900 text-white shadow-xs font-bold'
                      : 'text-neutral-700 hover:bg-white'
                  }`}
                >
                  Fixed Art
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('personalize')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                    activeTab === 'personalize'
                      ? 'bg-neutral-900 text-white shadow-xs font-bold'
                      : 'text-neutral-700 hover:bg-white'
                  }`}
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Personalize</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('photo')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                    activeTab === 'photo'
                      ? 'bg-neutral-900 text-white shadow-xs font-bold'
                      : 'text-neutral-700 hover:bg-white'
                  }`}
                >
                  <Image className="h-3 w-3" />
                  <span>My Photo</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Fixed Art Info */}
            {activeTab === 'fixed' && (
              <div className="rounded-2xl bg-white border border-neutral-200/80 p-4 space-y-2 text-xs text-neutral-600">
                <p className="font-medium text-neutral-900">
                  Ready-Made Luxury Keepsake as Shown
                </p>
                <p className="leading-relaxed">
                  Printed directly from our master high-resolution auspicious artwork and hand-cut into acrylic. Ships ready for immediate gifting with zero extra editing needed.
                </p>
              </div>
            )}

            {/* Tab 2: Personalize with Names / Date */}
            {activeTab === 'personalize' && (
              <div className="rounded-2xl bg-white border border-[#D4AF37]/50 p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                  <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Add Names, Family Name or Event Date</span>
                </div>
                <div className="space-y-2">
                  <label className="block space-y-1">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">Names / Family / Title</span>
                    <input
                      type="text"
                      value={customNames}
                      onChange={(e) => setCustomNames(e.target.value)}
                      placeholder="e.g. Ananya & Rohan / The Sharma Family"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold">Date / Shloka / Subtitle</span>
                    <input
                      type="text"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      placeholder="e.g. 14th December 2026 / Shubh Vivah"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-neutral-500 italic">
                  *Your custom text is verified on the left preview and printed with metallic gold styling onto the acrylic frame.
                </p>
              </div>
            )}

            {/* Tab 3: Use My Photo (Direct link to Customizer Studio) */}
            {activeTab === 'photo' && (
              <div className="rounded-2xl bg-white border border-neutral-200/80 p-5 space-y-3 text-center">
                <Image className="h-8 w-8 mx-auto text-[#A38A6E]" />
                <h4 className="font-serif text-lg text-neutral-900">
                  Want to put your own personal photo inside this frame shape?
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Open our interactive Design Studio with the <strong>{gift.dimensions} {gift.shapeId}</strong> frame silhouette pre-selected.
                </p>
                <button
                  type="button"
                  onClick={() => onCustomizeShape(gift.shapeId)}
                  className="rounded-full bg-neutral-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition cursor-pointer shadow-md inline-flex items-center gap-2"
                >
                  <span>Open Customizer With This Shape</span>
                  <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                </button>
              </div>
            )}

            {/* Quantity Selector & Bulk Savings Table */}
            {activeTab !== 'photo' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold">
                    Select Quantity:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 rounded-xl bg-white border border-neutral-300 text-neutral-700 flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 text-center font-mono text-sm font-bold border border-neutral-300 rounded-xl py-1 bg-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 rounded-xl bg-white border border-neutral-300 text-neutral-700 flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Bulk Pill Shortcuts */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[1, 5, 10, 25, 50, 100].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer border ${
                        quantity === q
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {q} {q === 1 ? 'pc' : 'pcs'}
                    </button>
                  ))}
                </div>

                {/* Bulk Savings Notice */}
                <div className="bg-[#FAF6F0] rounded-xl p-3 border border-[#E8DCCF] flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-600">Total for {quantity} frames:</span>
                  <span className="text-neutral-950 font-bold text-sm">₹{totalPrice}</span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddReadyMade(false)}
                    className={`py-3.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      added
                        ? 'bg-emerald-700 text-white'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Added to Bag</span>
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
                    onClick={() => handleAddReadyMade(true)}
                    className="py-3.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider bg-[#9E1B32] text-white hover:bg-[#851629] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Buy Now · ₹{totalPrice}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
