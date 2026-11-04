import React, { useState, useEffect } from 'react';
import {
  MessageCircle, Star, ChevronDown, ArrowRight, ShieldCheck,
  Package, Award, Heart, Sparkles, CheckCircle2, Phone,
  MapPin, Clock, Users, Factory, ArrowUpRight,
  ArrowLeft, ZoomIn, Check, Info
} from 'lucide-react';

const WA_NUMBER = '919392576792';

function waLink(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

interface ProductSize {
  label: string;
  dimensions: string;
  basePrice: number;
  originalPrice: number;
}

interface Product {
  id: string;
  name: string;
  tagline: string;
  subtitle: string;
  image: string;
  category: string;
  sizes: ProductSize[];
  accentColor: string;
  bgGlow: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'heart',
    name: 'Sculpted Heart',
    tagline: 'Romance & Everlasting Keepsakes',
    subtitle: 'Personalised magnetic acrylic photo frame',
    image: '/images/shape_heart_wedding_couple.png',
    category: 'Celebration & Gifting',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 199, originalPrice: 299 },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 249, originalPrice: 349 },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 299, originalPrice: 399 }
    ],
    accentColor: '#B76E79',
    bgGlow: 'from-rose-100/60 via-pink-50/40 to-transparent'
  },
  {
    id: 'circle',
    name: 'Minimal Circle',
    tagline: 'Infinite Symmetry & Contemporary Zen',
    subtitle: 'Personalised magnetic acrylic photo frame',
    image: '/images/shape_circle_family_dog.jpg',
    category: 'Modern Living',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 199, originalPrice: 299 },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 249, originalPrice: 349 },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 299, originalPrice: 399 }
    ],
    accentColor: '#4A6B82',
    bgGlow: 'from-sky-100/60 via-amber-50/40 to-transparent'
  },
  {
    id: 'polaroid',
    name: 'Classic Polaroid',
    tagline: 'Nostalgic Film Aesthetic with Modern Durability',
    subtitle: 'Personalised magnetic acrylic photo frame with caption',
    image: '/images/shape_polaroid_magnet_1780939416510.png',
    category: 'Storyteller Series',
    sizes: [
      { label: '2 × 3"', dimensions: '2 × 3 inch', basePrice: 229, originalPrice: 329 },
      { label: '3 × 4"', dimensions: '3 × 4 inch', basePrice: 279, originalPrice: 379 }
    ],
    accentColor: '#A3704C',
    bgGlow: 'from-amber-100/60 via-stone-50/40 to-transparent'
  },
  {
    id: 'grande',
    name: 'Statement Grande',
    tagline: 'Full-Frame Architectural Panorama',
    subtitle: 'Personalised monolithic acrylic photo magnet',
    image: '/images/scenic_landscape_sample_1782458156606.jpg',
    category: 'Executive & Landscape',
    sizes: [
      { label: '4 × 6"', dimensions: '4 × 6 inch', basePrice: 349, originalPrice: 499 }
    ],
    accentColor: '#365349',
    bgGlow: 'from-emerald-100/60 via-sand-50/40 to-transparent'
  }
];

const QUANTITY_TIERS = [
  { label: '50 Pcs', count: 50, discountPct: 30 },
  { label: '100 pcs', count: 100, discountPct: 35 },
  { label: '250 pcs', count: 250, discountPct: 40 },
  { label: '500 pcs', count: 500, discountPct: 45 },
  { label: '1000 pcs', count: 1000, discountPct: 50 },
  { label: 'Custom', count: 0, discountPct: 30 }
];

const FAQS = [
  {
    q: 'Why cast acrylic over regular plastic or photo frames?',
    a: 'We use 100% cell-cast monolithic acrylic with 93% optical light transmittance. It never yellows, does not warp, and is completely shatterproof.'
  },
  {
    q: 'How is my photo printed onto the frame?',
    a: 'Printed at 300 DPI directly onto the sub-surface of 3mm acrylic with UV-cured pigment ink and a pure white light-blocking backcoat. Resistant to moisture, sun UV, and fingerprints.'
  },
  {
    q: 'Will the neodymium magnet slide or scratch metal surfaces?',
    a: 'No. Grade N35 rare-earth neodymium magnets are countersunk flush into the back for strong shear resistance that will not slip down or scratch enamel.'
  },
  {
    q: 'Can I order single pieces or just bulk batches?',
    a: 'Both! You can order single bespoke frames or bulk batches of 50 to 5,000+ pieces for weddings and corporate gifting with factory-direct volume pricing.'
  },
  {
    q: 'How fast is dispatch and shipping across India?',
    a: 'Produced within 24–48 hours at our Hyderabad facility, then shipped via express air couriers (Blue Dart / DTDC / Delhivery) delivering in 2–4 business days with tracking.'
  }
];

interface Props {
  onBackToStore?: () => void;
}

export default function KriaTechPortfolioPage({ onBackToStore }: Props) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeSizeIndex, setActiveSizeIndex] = useState<number>(0);
  const [selectedQtyLabel, setSelectedQtyLabel] = useState<string>('50 Pcs');
  const [customQtyValue, setCustomQtyValue] = useState<number>(75);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Active product calculation
  const activeProduct = selectedProductId ? PRODUCTS.find((p) => p.id === selectedProductId) || null : null;

  // Reset size index when product changes
  useEffect(() => {
    setActiveSizeIndex(0);
    setSelectedQtyLabel('50 Pcs');
  }, [selectedProductId]);

  // Sync scroll on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedProductId]);

  // Calculation for Product Detail Page
  const currentSize = activeProduct ? activeProduct.sizes[activeSizeIndex] || activeProduct.sizes[0] : null;
  const currentTier = QUANTITY_TIERS.find((t) => t.label === selectedQtyLabel) || QUANTITY_TIERS[0];
  const actualQty = currentTier.label === 'Custom' ? Math.max(1, customQtyValue) : currentTier.count;
  const discountRate = actualQty >= 1000 ? 0.50 : actualQty >= 500 ? 0.45 : actualQty >= 250 ? 0.40 : actualQty >= 100 ? 0.35 : actualQty >= 50 ? 0.30 : 0.15;
  const unitOriginalPrice = currentSize ? currentSize.basePrice : 199;
  const unitDiscountedPrice = Math.round(unitOriginalPrice * (1 - discountRate));
  const discountPercentage = Math.round(discountRate * 100);
  const totalPrice = unitDiscountedPrice * actualQty;
  const originalTotalPrice = unitOriginalPrice * actualQty;
  const factorySavings = originalTotalPrice - totalPrice;

  // Helper to construct exact structured WhatsApp specifications
  const buildExactQuoteMessage = (prodName: string, sizeLabel: string, dimensions: string, qty: number, unitRate: number, origRate: number, total: number, savings: number) => {
    return `Hi KRIA Tech! I have selected my product specifications on your website:

• Product Shape: ${prodName}
• Dimension: ${sizeLabel} (${dimensions})
• Batch Quantity: ${qty} pcs
• Unit Rate: ₹${unitRate} / pc (Original ₹${origRate}, ${discountPercentage}% bulk discount)
• Total Estimate: ₹${total.toLocaleString('en-IN')}
• Factory Direct Savings: ₹${savings.toLocaleString('en-IN')}

I have my photo ready for review. Please confirm order placement and dispatch timeline.`;
  };

  const handleOpenConfigurator = (shapeId: string = 'heart') => {
    setSelectedProductId(shapeId);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E1B18] font-sans antialiased overflow-x-hidden selection:bg-[#EBDDC7] selection:text-[#1E1B18]">
      
      {/* Ambient Luxury Background Lights (Warm Pearl, Champagne, Ivory) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#F5E6D3]/70 to-[#ECD5BB]/40 blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-48 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#EAD9C6]/60 via-[#F7ECE1]/40 to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#F2E4D5]/60 to-[#FFF7EE]/30 blur-3xl opacity-60" />
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{ 
            backgroundImage: 'radial-gradient(#8C6D46 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      {/* ─── DEDICATED GLASSMORPHIC HEADER ──────────────────────── */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 backdrop-blur-2xl bg-[#FDFBF7]/85 border-b border-[#EADCCB]/60 shadow-[0_4px_24px_rgba(180,150,110,0.06)] transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <button 
            type="button"
            onClick={() => setSelectedProductId(null)}
            className="flex items-center gap-3 group cursor-pointer text-left"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#FAF3EA] via-[#F2E5D4] to-[#DFCEB7] border border-[#D8C2A6]/80 flex items-center justify-center shadow-[0_4px_12px_rgba(180,140,90,0.15)] group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-4.5 w-4.5 text-[#8C6436]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1E1B18] leading-none group-hover:text-[#8C6436] transition-colors">
                KRIA<span className="text-[#A78255] font-light">Tech</span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#918171] mt-0.5">
                Cast Acrylic Atelier · Hyderabad
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#6E6359]">
            <button 
              type="button" 
              onClick={() => setSelectedProductId(null)} 
              className="hover:text-[#1E1B18] transition-colors py-1 cursor-pointer"
            >
              The 4 Shapes
            </button>
            <a href="#wholesale" className="hover:text-[#1E1B18] transition-colors py-1">Wholesale & Gifts</a>
            <a href="#faqs" className="hover:text-[#1E1B18] transition-colors py-1">Specifications</a>
          </nav>

          {/* Quick Action Hotline Pill: Configures or sends exact specs */}
          <div className="flex items-center gap-2.5">
            {activeProduct && currentSize ? (
              <a
                href={waLink(buildExactQuoteMessage(activeProduct.name, currentSize.label, currentSize.dimensions, actualQty, unitDiscountedPrice, unitOriginalPrice, totalPrice, factorySavings))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(37,211,102,0.28)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Quote ({actualQty} pcs)</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenConfigurator('heart')}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(37,211,102,0.28)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Choose Specs & Quote</span>
              </button>
            )}

            {onBackToStore && (
              <button
                type="button"
                onClick={onBackToStore}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono tracking-widest uppercase text-[#857566] hover:text-[#1E1B18] border border-[#E0D0BE]/70 rounded-full bg-white/50 hover:bg-white/90 transition-all cursor-pointer"
                title="Switch to Storefront view"
              >
                <span>Store</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          VIEW 1: DEDICATED SEPARATE PRODUCT DETAIL PAGE
      ══════════════════════════════════════════════════════════ */}
      {activeProduct && currentSize ? (
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
          {/* Breadcrumb / Back button */}
          <button
            type="button"
            onClick={() => setSelectedProductId(null)}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8C6436] hover:text-[#1E1B18] mb-8 py-1.5 px-3 rounded-full bg-white/70 border border-[#E8DACB] shadow-xs cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All 4 Shapes</span>
          </button>

          {/* Two-Column Product Configuration Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* ── LEFT COLUMN: PREVIEW IMAGE ───────────────────── */}
            <div className="lg:col-span-6 lg:sticky lg:top-24">
              <div className="relative rounded-3xl bg-white/90 backdrop-blur-2xl border border-white p-6 sm:p-10 shadow-[0_20px_50px_rgba(180,140,80,0.12)] overflow-hidden group">
                
                {/* Subtle crystal reflection border */}
                <div className="absolute inset-0 border border-[#EADCCE]/70 rounded-3xl pointer-events-none" />
                
                {/* Image Frame Container */}
                <div className="relative aspect-square w-full max-w-md mx-auto flex items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-[#FAF5EE] to-[#F1E5D5]/60 overflow-hidden">
                  <img
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(80,50,20,0.28)] transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Acrylic Spec Floating Pill */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E4D3C0] text-[10px] font-mono font-bold uppercase tracking-wider text-[#7C6348] shadow-xs">
                    3mm Optical Cast Glass
                  </div>

                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E4D3C0] text-[10px] font-mono text-[#5A4D3F] shadow-xs flex items-center gap-1.5">
                    <ZoomIn className="h-3 w-3 text-[#A78255]" />
                    <span>Selected: {currentSize.dimensions}</span>
                  </div>
                </div>

                <p className="mt-4 text-center text-xs text-[#8C7A68] font-mono">
                  ✦ Hand-beveled optical perimeter with flush neodymium magnet
                </p>
              </div>
            </div>

            {/* ── RIGHT COLUMN: CONFIGURATOR & PRICING ──────────── */}
            <div className="lg:col-span-6 space-y-7">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold">
                  {activeProduct.category}
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#1E1B18] mt-1">
                  {activeProduct.name}
                </h1>
                <p className="text-sm text-[#736353] mt-2 font-mono">
                  {activeProduct.subtitle} · {currentSize.dimensions}
                </p>
              </div>

              {/* 1. Available Sizes: Choose dimension */}
              <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#EADECE]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#7C6348] font-bold">
                    Available Sizes
                  </span>
                  <span className="text-xs text-[#9B8977] font-mono">
                    Choose dimension
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {activeProduct.sizes.map((sz, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSizeIndex(idx)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        activeSizeIndex === idx
                          ? 'bg-[#1E1B18] text-white border-[#1E1B18] shadow-md scale-[1.02]'
                          : 'bg-white text-[#52463A] border-[#E2D2C2] hover:bg-[#FAF4ED]'
                      }`}
                    >
                      <span className="font-serif text-lg font-medium">{sz.label}</span>
                      <span className={`text-[10px] font-mono mt-0.5 ${activeSizeIndex === idx ? 'text-neutral-300' : 'text-[#8A7969]'}`}>
                        Base ₹{sz.basePrice}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Batch Quantity */}
              <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#EADECE]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#7C6348] font-bold">
                    Batch Quantity
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-semibold">
                    Volume Tier Discount
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {QUANTITY_TIERS.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setSelectedQtyLabel(t.label)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-mono border text-center transition-all cursor-pointer ${
                        selectedQtyLabel === t.label
                          ? 'bg-[#1E1B18] text-white border-[#1E1B18] shadow-xs'
                          : 'bg-white text-[#635547] border-[#E4D5C5] hover:bg-[#FAF4ED]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Custom Quantity Stepper if Custom is chosen */}
                {selectedQtyLabel === 'Custom' && (
                  <div className="mt-4 pt-3 border-t border-[#EFE5D9] flex items-center gap-3">
                    <span className="text-xs font-mono text-[#6E6153]">Enter exact pieces:</span>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={customQtyValue}
                      onChange={(e) => setCustomQtyValue(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-28 px-3 py-1.5 rounded-lg border border-[#D8C7B5] bg-white font-mono text-sm text-[#1E1B18] outline-none focus:ring-2 focus:ring-[#C4A574]"
                    />
                    <span className="text-xs font-mono text-[#8C7A68]">frames</span>
                  </div>
                )}
              </div>

              {/* 3. Live Pricing Calculation Box (As requested) */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FAF3EA] via-white to-[#F5ECE1] border border-[#E4D4C3] shadow-[0_10px_30px_rgba(180,140,80,0.08)] space-y-4">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-4xl sm:text-5xl font-medium text-[#1E1B18]">
                      ₹{unitDiscountedPrice}
                    </span>
                    <span className="text-base text-[#918171] line-through font-mono">
                      ₹{unitOriginalPrice}/ pc
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold tracking-wider">
                    {discountPercentage}% OFF
                  </span>
                </div>

                <div className="pt-3 border-t border-[#EAE0D3] space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-[#5A4D3E]">
                    <span>Total ({actualQty} pcs):</span>
                    <strong className="text-base text-[#1E1B18] font-serif">₹{totalPrice.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    <span className="font-semibold">Factory Direct Savings:</span>
                    <strong className="font-bold">₹{factorySavings.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* 4. Get WhatsApp Quote Button: Sends exact selected specs */}
                <div className="pt-2">
                  <a
                    href={waLink(buildExactQuoteMessage(activeProduct.name, currentSize.label, currentSize.dimensions, actualQty, unitDiscountedPrice, unitOriginalPrice, totalPrice, factorySavings))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-sm font-bold uppercase tracking-[0.14em] shadow-[0_8px_25px_rgba(37,211,102,0.35)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.48)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Get WhatsApp Quote (Sends Exact Specs)</span>
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                  <span>
                    Your exact selected shape, size ({currentSize.dimensions}), and batch quantity ({actualQty} pcs) will be automatically sent in the message so our team can review your photo immediately!
                  </span>
                </div>
              </div>

              {/* Guarantees & Features */}
              <div className="space-y-2.5 pt-1 text-xs text-[#635547]">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#8C6436] shrink-0" />
                  <span>Your photo is printed and assembled by hand in Hyderabad, made to order</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#8C6436] shrink-0" />
                  <span>Clear 3mm cast acrylic with flush neodymium magnetic closure</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#8C6436] shrink-0" />
                  <span>Ships in 2–3 days with express pan-India tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#8C6436] shrink-0" />
                  <span>Prepaid custom orders · 100% replacement guarantee if damaged in transit</span>
                </div>
              </div>

            </div>

          </div>
        </main>
      ) : (
        /* ══════════════════════════════════════════════════════════
            VIEW 2: MAIN EXCLUSIVE LANDING PAGE
        ══════════════════════════════════════════════════════════ */
        <main className="relative z-10">
          
          {/* ─── HERO SECTION: PURE & EXCLUSIVE (NO CLUTTER) ───────── */}
          <section
            id="hero"
            className="relative pt-24 pb-24 sm:pt-32 sm:pb-32 px-4 sm:px-8 border-b border-[#EADECE]/60 overflow-hidden"
          >
            {/* Subtle Architectural Studio Background Image with warm glass overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-multiply"
              style={{ backgroundImage: `url('/images/clean_studio_bg_1782458110845.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/95 via-[#FAF7F2]/90 to-[#FDFBF7] pointer-events-none" />

            <div className="relative max-w-4xl mx-auto text-center space-y-8">
              
              {/* Headline - Exactly as requested */}
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-[#1E1B18] tracking-tight leading-[1.12]">
                Transform Every Cherished Memory Into A{' '}
                <span className="font-medium italic bg-gradient-to-r from-[#976C3E] via-[#B8874E] to-[#7A542D] bg-clip-text text-transparent">
                  Diamond-Cut Acrylic
                </span>{' '}
                Magnet.
              </h1>

              {/* Subtitle - Exactly as requested */}
              <p className="text-base sm:text-xl text-[#63574A] font-light leading-relaxed max-w-3xl mx-auto">
                Not plastic, not laminated paper. Genuine 3mm cast acrylic laser-contoured with mirror-beveled edges, 300 DPI sub-surface UV pigment printing, and rare-earth neodymium magnetic core.
              </p>

              {/* Primary Call to Action: Opens Configurator directly */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => handleOpenConfigurator('heart')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-[#1E1B18] to-[#36302B] text-[#FBF8F4] text-xs font-bold uppercase tracking-[0.18em] shadow-[0_12px_30px_rgba(30,27,24,0.22)] hover:shadow-[0_16px_36px_rgba(30,27,24,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4.5 w-4.5 text-[#25D366]" />
                  <span>Choose Shape & WhatsApp Quote</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                </button>

                <a
                  href="#shapes"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/80 hover:bg-white border border-[#DFCDBB] text-[#55493C] text-xs font-bold uppercase tracking-[0.16em] transition-all cursor-pointer"
                >
                  <span>Explore 4 Shapes & Sizes</span>
                </a>
              </div>

            </div>
          </section>

          {/* ─── THE 4 SHAPES COMPREHENSIVE COLLECTION ─────────────── */}
          <section id="shapes" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold mb-2">
                Signature Acrylic Shapes
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1E1B18]">
                Four Iconic Forms. Infinite Stories.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#6E6153] leading-relaxed">
                Select your shape below to configure dimensions (2×2", 3×3", 4×4") and batch quantity with live pricing before sending on WhatsApp.
              </p>
            </div>

            {/* 4 Cards Grid with Glassmorphic styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProductId(prod.id)}
                  className="group rounded-3xl bg-white/75 backdrop-blur-xl border border-white hover:border-[#D9C4AC] p-6 shadow-[0_12px_35px_rgba(180,140,80,0.06)] hover:shadow-[0_22px_55px_rgba(180,140,80,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Visual Area */}
                    <div className={`relative h-60 rounded-2xl bg-gradient-to-b ${prod.bgGlow} border border-[#F0E4D5] flex items-center justify-center p-6 overflow-hidden mb-5`}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_12px_22px_rgba(90,60,30,0.22)] group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#7C6348] border border-[#E8DACB]">
                          3mm Cast
                        </span>
                      </div>
                    </div>

                    {/* Title & Tagline */}
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#9C8773] font-semibold">
                      {prod.category}
                    </span>
                    <h3 className="font-serif text-2xl font-medium text-[#1E1B18] mt-1 group-hover:text-[#8C6436] transition-colors">
                      {prod.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#8C7A68] font-mono">
                      {prod.tagline}
                    </p>

                    {/* Formats preview */}
                    <div className="mt-4 pt-3.5 border-t border-[#EFE5D9]">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#9A8775] mb-2 font-bold">
                        Available Sizes
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {prod.sizes.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-1 rounded-md bg-[#FAF4ED] text-[#695B4E] border border-[#EAE0D3]"
                          >
                            {s.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Open Separate Product Page CTA */}
                  <div className="mt-6 pt-4 border-t border-[#EFE5D9]">
                    <div className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E1B18] group-hover:bg-[#8C6436] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider transition-colors">
                      <span>Choose Size & Quantity</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── WHOLESALE, B2B & WEDDING RETURN GIFTS ───────────────── */}
          <section id="wholesale" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-white/95 via-[#FDFBF7]/90 to-[#F6EEE3]/90 backdrop-blur-2xl border border-white p-8 sm:p-14 shadow-[0_25px_65px_rgba(180,140,80,0.1)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE3D3] text-[#7A562D] font-mono text-xs tracking-wider uppercase font-semibold">
                    <Factory className="h-3.5 w-3.5" />
                    Factory Direct Bulk Gifting
                  </div>

                  <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1E1B18] leading-tight">
                    Weddings, Corporate Milestones & Brand Merchandise.
                  </h2>

                  <p className="text-sm sm:text-base text-[#615446] leading-relaxed">
                    Need 50 to 5,000 personalized keepsakes? We offer factory-direct tiered pricing, custom logo engraving, individual guest photo personalization, and premium velvet/gold gift packaging direct from Hyderabad.
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-mono text-[#7A6A5A]">
                    <span className="p-2.5 rounded-xl bg-white border border-[#E8DACB]">✓ Tiered wholesale rates</span>
                    <span className="p-2.5 rounded-xl bg-white border border-[#E8DACB]">✓ Custom box packaging</span>
                    <span className="p-2.5 rounded-xl bg-white border border-[#E8DACB]">✓ Pan-India courier</span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenConfigurator('heart')}
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Configure Shape & Quantity (50–1000 Pcs)</span>
                    </button>
                  </div>
                </div>

                {/* Right Card: Hyderabad Factory Showcase */}
                <div className="lg:col-span-5 rounded-3xl bg-gradient-to-tr from-[#FAF4EB] to-[#F1E5D5] border border-white p-7 shadow-inner space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#8C6436] shadow-xs">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-medium text-[#1E1B18]">Hyderabad Manufacturing Unit</h4>
                      <p className="text-[11px] font-mono text-[#8C7A68]">Telangana, India</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#5D5042] leading-relaxed">
                    Every KRIA Tech frame is manufactured on state-of-the-art CNC laser beds and UV flatbed print lines. No overseas delay, no trading markups.
                  </p>

                  <div className="p-3.5 rounded-xl bg-white/70 border border-[#E9DAC8] space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#8C7A68]">Turnaround:</span>
                      <span className="font-bold text-[#1E1B18]">24–48 Hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8C7A68]">Direct Hotline:</span>
                      <span className="font-bold text-[#1E1B18]">+91 93925 76792</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ─── FREQUENTLY ASKED QUESTIONS (COMPACT & SMALLER) ───── */}
          <section id="faqs" className="py-14 sm:py-20 max-w-3xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-8">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold">
                Clear Answers
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1E1B18] mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-2.5">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-white/75 backdrop-blur-md border border-[#E9DCCE] overflow-hidden transition-all duration-150"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                      className="w-full py-3.5 px-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="font-serif text-sm text-[#1E1B18] font-normal">
                        {faq.q}
                      </span>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#8C6436]' : 'text-[#8A7969]'}`}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-[#615345] leading-relaxed border-t border-[#F2E7DC] pt-2.5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </main>
      )}

      {/* ─── DEDICATED LIGHT LUXURY FOOTER ──────────────────────── */}
      <footer className="relative z-10 border-t border-[#EADECE] bg-[#FAF5EE] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
            
            {/* Col 1: Brand Info */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white border border-[#E0D0BF] flex items-center justify-center shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-[#8C6436]" />
                </div>
                <span className="font-serif text-xl font-semibold tracking-tight text-[#1E1B18]">
                  KRIA<span className="text-[#A78255] font-light">Tech</span>
                </span>
              </div>
              <p className="text-xs text-[#6E6152] leading-relaxed max-w-sm">
                Diamond-cut 3mm monolithic cast acrylic photo magnets. Crafted with UV-cured sub-surface pigment and rare-earth neodymium magnetic cores. Factory-direct in Hyderabad.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#8C7762]">
                <MapPin className="h-3.5 w-3.5 text-[#8C6436]" />
                <span>Hyderabad, Telangana · India</span>
              </div>
            </div>

            {/* Col 2: Shapes List */}
            <div className="md:col-span-3 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C6436] font-bold">
                Signature Collection
              </p>
              <ul className="text-xs text-[#635546] space-y-1.5">
                {PRODUCTS.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedProductId(p.id)}
                      className="hover:text-[#8C6436] transition-colors cursor-pointer"
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Direct Contact */}
            <div className="md:col-span-4 space-y-2.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C6436] font-bold">
                WhatsApp Order Desk
              </p>
              <a
                href={waLink("Hi KRIA Tech! I am on your website and would like to order acrylic photo magnets.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#25D366] hover:text-[#1EBE5D] transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+91 93925 76792</span>
              </a>
              <p className="text-[11px] text-[#8F7E6E] font-mono">
                Pan-India Express Air Shipping with Live Courier Tracking
              </p>
            </div>

          </div>

          <div className="mt-10 pt-5 border-t border-[#E8DACB] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-[#8F7E6E]">
            <p>© {new Date().getFullYear()} KRIA Tech. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span>3mm Cast Acrylic</span>
              <span>•</span>
              <span>300 DPI UV Pigment</span>
              <span>•</span>
              <span>Neodymium Grip</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING WHATSAPP BUTTON (DESKTOP & MOBILE) ────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => {
            if (activeProduct && currentSize) {
              window.open(waLink(buildExactQuoteMessage(activeProduct.name, currentSize.label, currentSize.dimensions, actualQty, unitDiscountedPrice, unitOriginalPrice, totalPrice, factorySavings)), '_blank');
            } else {
              handleOpenConfigurator('heart');
            }
          }}
          className="group flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.55)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="Chat with KRIA Tech on WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="h-5 w-5 fill-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
            {activeProduct ? 'WhatsApp Exact Specs' : 'Configure & WhatsApp'}
          </span>
        </button>
      </div>

    </div>
  );
}
