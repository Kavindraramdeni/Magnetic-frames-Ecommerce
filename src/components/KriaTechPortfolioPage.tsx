import React, { useState, useEffect } from 'react';
import {
  MessageCircle, Star, ChevronDown, ArrowRight, ShieldCheck,
  Package, Award, Heart, Sparkles, CheckCircle2, Phone,
  MapPin, Clock, Users, Layers, Factory, ArrowUpRight,
  Maximize2, Send, HelpCircle, Eye
} from 'lucide-react';

const WA_NUMBER = '919392576792';

function waLink(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

interface Product {
  id: string;
  name: string;
  tagline: string;
  image: string;
  category: string;
  sizes: { label: string; dimensions: string; thickness: string }[];
  idealFor: string[];
  specs: {
    material: string;
    finish: string;
    magnet: string;
    cut: string;
  };
  accentColor: string;
  bgGlow: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'heart',
    name: 'Sculpted Heart',
    tagline: 'Romance & Everlasting Keepsakes',
    image: '/images/shape_heart_magnet_1780939430998.png',
    category: 'Celebration & Gifting',
    sizes: [
      { label: 'Compact', dimensions: '2 × 2 inches', thickness: '3.0 mm' },
      { label: 'Classic', dimensions: '3 × 3 inches', thickness: '3.0 mm' },
      { label: 'Grand', dimensions: '4 × 4 inches', thickness: '3.0 mm' }
    ],
    idealFor: ['Wedding return favors', 'Anniversary souvenirs', 'Valentine memories', 'Couple portraits'],
    specs: {
      material: '3mm Cast Monolithic Acrylic',
      finish: '300 DPI Sub-Surface UV Pigment',
      magnet: 'Flush Neodymium N35 Core',
      cut: 'Diamond-Laser Polished Edge'
    },
    accentColor: '#B76E79',
    bgGlow: 'from-rose-100/60 via-pink-50/40 to-transparent'
  },
  {
    id: 'circle',
    name: 'Minimal Circle',
    tagline: 'Infinite Symmetry & Contemporary Zen',
    image: '/images/shape_circle_magnet_1780939399489.png',
    category: 'Modern Living',
    sizes: [
      { label: 'Compact', dimensions: '2 × 2 inches', thickness: '3.0 mm' },
      { label: 'Classic', dimensions: '3 × 3 inches', thickness: '3.0 mm' },
      { label: 'Grand', dimensions: '4 × 4 inches', thickness: '3.0 mm' }
    ],
    idealFor: ['Newborn milestones', 'Pet portraits', 'Modern refrigerator clusters', 'Minimalist home decor'],
    specs: {
      material: '3mm Cast Monolithic Acrylic',
      finish: '300 DPI Sub-Surface UV Pigment',
      magnet: 'Flush Neodymium N35 Core',
      cut: 'True 360° Circular CNC Contour'
    },
    accentColor: '#4A6B82',
    bgGlow: 'from-sky-100/60 via-amber-50/40 to-transparent'
  },
  {
    id: 'polaroid',
    name: 'Classic Polaroid',
    tagline: 'Nostalgic Film Aesthetic with Modern Durability',
    image: '/images/shape_polaroid_magnet_1780939416510.png',
    category: 'Storyteller Series',
    sizes: [
      { label: 'Standard Film', dimensions: '2 × 3 inches', thickness: '3.0 mm' },
      { label: 'Studio Showcase', dimensions: '3 × 4 inches', thickness: '3.0 mm' }
    ],
    idealFor: ['Travel diaries', 'Festival souvenirs', 'Cafe moodboards', 'Friendship collages'],
    specs: {
      material: '3mm Cast Monolithic Acrylic',
      finish: '300 DPI Sub-Surface UV Pigment',
      magnet: 'Dual-Balanced Neodymium Bar',
      cut: 'Beveled Orthogonal Corners'
    },
    accentColor: '#A3704C',
    bgGlow: 'from-amber-100/60 via-stone-50/40 to-transparent'
  },
  {
    id: 'grande',
    name: 'Statement Grande',
    tagline: 'Full-Frame Architectural Panorama',
    image: '/images/scenic_landscape_sample_1782458156606.jpg',
    category: 'Executive & Landscape',
    sizes: [
      { label: 'Masterpiece', dimensions: '4 × 6 inches', thickness: '3.0 mm' }
    ],
    idealFor: ['Corporate accolades', 'High-end wedding memories', 'Architectural photography', 'Executive suite gifts'],
    specs: {
      material: '3mm Cast Monolithic Acrylic',
      finish: '300 DPI Sub-Surface UV Pigment',
      magnet: 'Triple Quad-Corner Neodymium Grip',
      cut: 'Architectural Chamfer Edge'
    },
    accentColor: '#365349',
    bgGlow: 'from-emerald-100/60 via-sand-50/40 to-transparent'
  }
];

const WHOLESALE_TIERS = [
  { qty: '50 Pcs', tier: 'Boutique Batch', benefit: 'Custom Packaging Included', estimate: 'Fast 48h dispatch' },
  { qty: '100 Pcs', tier: 'Wedding Return Special', benefit: 'Free Guest Personalization', estimate: 'Our #1 popular tier' },
  { qty: '250 Pcs', tier: 'Event & Gala Tier', benefit: 'Direct Factory Rate Discount', estimate: 'Priority laser queue' },
  { qty: '500 Pcs', tier: 'Corporate Enterprise', benefit: 'Branded Presentation Boxes', estimate: 'Sample proof first' },
  { qty: '1000+ Pcs', tier: 'National OEM / White-Label', benefit: 'Wholesale Tier-1 Contract', estimate: 'Custom shapes allowed' }
];

const FAQS = [
  {
    q: 'Why cast acrylic instead of normal plastic or photo frames?',
    a: 'Normal frames rely on bulky wood, tin, or extruded polystyrene that yellow, warp, and scratch easily. KRIA Tech uses 100% cell-cast monolithic acrylic. It provides 93% light transmittance (clearer than regular glass), will never turn yellow, and is shatterproof even if dropped.'
  },
  {
    q: 'How does the image stay protected and vibrant?',
    a: 'Our images are not stickers or paper inserts pasted onto plastic. We UV-print pigment ink directly onto the sub-surface of the 3mm acrylic at 300 DPI, followed by a light-blocking opaque white barrier coat. The print is sealed from moisture, sunlight UV fading, and greasy fingerprints.'
  },
  {
    q: 'Will the magnet slide or scratch my refrigerator or surface?',
    a: 'No. We use genuine nickel-plated NdFeB (neodymium) rare-earth magnets countersunk flush into the back. They deliver remarkable magnetic sheer resistance so the frame stays firmly seated without sliding down or scratching enamel.'
  },
  {
    q: 'Can I order just 1 or 2 pieces, or is it strictly bulk?',
    a: 'You can order single pieces or thousands! For single bespoke frames, simply message us on WhatsApp with your favorite photo. For weddings and corporate orders of 50+ pieces, we offer special volume pricing and custom branded boxes.'
  },
  {
    q: 'How does the ordering process work without an online cart?',
    a: 'Direct and hassle-free: Tap the "Chat on WhatsApp" button, upload your photo, and tell us your shape and size. Our design technicians verify the crop, confirm clarity, share a digital preview, and ship directly from our Hyderabad manufacturing unit.'
  },
  {
    q: 'What is the turnaround and delivery timeline across India?',
    a: 'Orders are produced and inspected within 24–48 hours at our Hyderabad facility. We partner with express air couriers (Blue Dart / DTDC / Delhivery) delivering across pan-India metros within 2 to 4 business days with full tracking.'
  }
];

interface Props {
  onBackToStore?: () => void;
}

export default function KriaTechPortfolioPage({ onBackToStore }: Props) {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [wholesaleQty, setWholesaleQty] = useState<string>('100 Pcs');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E1B18] font-sans antialiased overflow-x-hidden selection:bg-[#EBDDC7] selection:text-[#1E1B18]">
      
      {/* Ambient Luxury Background Lights (Warm Pearl, Champagne, Ivory) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#F5E6D3]/70 to-[#ECD5BB]/40 blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-48 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#EAD9C6]/60 via-[#F7ECE1]/40 to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#F2E4D5]/60 to-[#FFF7EE]/30 blur-3xl opacity-60" />
        {/* Subtle Luxury Linen Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{ 
            backgroundImage: 'radial-gradient(#8C6D46 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      {/* ─── DEDICATED GLASSMORPHIC HEADER ──────────────────────── */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 backdrop-blur-2xl bg-[#FDFBF7]/80 border-b border-[#EADCCB]/60 shadow-[0_4px_24px_rgba(180,150,110,0.06)] transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <a href="#hero" className="flex items-center gap-3 group cursor-pointer">
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
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#6E6359]">
            <a href="#shapes" className="hover:text-[#1E1B18] transition-colors py-1">The 4 Shapes</a>
            <a href="#wholesale" className="hover:text-[#1E1B18] transition-colors py-1">Wholesale & Gifts</a>
            <a href="#faqs" className="hover:text-[#1E1B18] transition-colors py-1">Specifications</a>
          </nav>

          {/* Quick Action Hotline Pill */}
          <div className="flex items-center gap-2.5">
            <a
              href={waLink("Hello KRIA Tech team, I would like to inquire about your acrylic photo frame magnets.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(37,211,102,0.28)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp Concierge</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            {onBackToStore && (
              <button
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

      {/* ─── HERO SECTION: LIGHT LUXURY GLASSMORPHISM ───────────── */}
      <section id="hero" className="relative z-10 pt-14 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-7">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#E2D2BE] shadow-[0_4px_16px_rgba(180,140,80,0.08)]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-medium tracking-wide text-[#7C6348]">
              Factory-Direct Manufacturing · High-Precision 3mm Cast Acrylic
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-14">
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-[#1E1B18] tracking-tight leading-[1.12]">
            Transform Every Cherished Memory Into A{' '}
            <span className="font-medium italic bg-gradient-to-r from-[#976C3E] via-[#B8874E] to-[#7A542D] bg-clip-text text-transparent underline decoration-[#DBC5A6]/60 decoration-wavy decoration-1 underline-offset-8">
              Diamond-Cut Acrylic
            </span>{' '}
            Magnet.
          </h1>
          <p className="mt-7 text-base sm:text-xl text-[#63574A] font-light leading-relaxed max-w-2xl mx-auto">
            Not plastic, not laminated paper. Genuine 3mm cast acrylic laser-contoured with mirror-beveled edges, 300 DPI sub-surface UV pigment printing, and rare-earth neodymium magnetic core.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={waLink("Hi KRIA Tech! I would like to make custom acrylic photo magnets. Please share the details.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#1E1B18] to-[#36302B] text-[#FBF8F4] text-xs font-bold uppercase tracking-[0.16em] shadow-[0_12px_30px_rgba(30,27,24,0.22)] hover:shadow-[0_16px_36px_rgba(30,27,24,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <MessageCircle className="h-4.5 w-4.5 text-[#25D366]" />
              <span>Direct WhatsApp Order</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-70" />
            </a>

            <a
              href="#wholesale"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-md border border-[#DFCDBB] text-[#55493C] hover:text-[#1E1B18] text-xs font-bold uppercase tracking-[0.16em] shadow-[0_4px_16px_rgba(180,140,80,0.06)] hover:shadow-[0_8px_24px_rgba(180,140,80,0.12)] transition-all cursor-pointer"
            >
              <Factory className="h-4 w-4 text-[#A78255]" />
              <span>Wholesale & Bulk (50+ Pcs)</span>
            </a>
          </div>

          {/* Factory Trust Badges */}
          <div className="mt-12 pt-8 border-t border-[#EADECE]/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-[#7D7063]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#A78255]" />
              <span>100% Cast Monolithic Acrylic</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#A78255]" />
              <span>300 DPI Fade-Proof Pigment</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#A78255]" />
              <span>Hyderabad Factory Direct</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE 4 SHAPES COMPREHENSIVE COLLECTION ─────────────── */}
      <section id="shapes" className="relative z-10 py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold mb-2">
            Signature Acrylic Shapes
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1E1B18]">
            Four Iconic Forms. Infinite Stories.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#6E6153] leading-relaxed">
            Every frame is laser-calibrated and polished by our technicians in Hyderabad. Select any shape below to chat directly with our team.
          </p>
        </div>

        {/* 4 Cards Grid with Glassmorphic styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              onMouseEnter={() => setHoveredProduct(prod.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="group rounded-3xl bg-white/70 backdrop-blur-xl border border-white hover:border-[#D9C4AC] p-6 shadow-[0_12px_35px_rgba(180,140,80,0.06)] hover:shadow-[0_20px_50px_rgba(180,140,80,0.14)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Visual Area */}
                <div className={`relative h-56 rounded-2xl bg-gradient-to-b ${prod.bgGlow} border border-[#F0E4D5] flex items-center justify-center p-6 overflow-hidden mb-6`}>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_18px_rgba(90,60,30,0.18)] group-hover:scale-110 transition-transform duration-500"
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

                {/* Available Formats */}
                <div className="mt-4 pt-4 border-t border-[#EFE5D9]">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#9A8775] mb-2 font-bold">
                    Formats
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {prod.sizes.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-1 rounded-md bg-[#FAF4ED] text-[#695B4E] border border-[#EAE0D3]"
                      >
                        {s.dimensions}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-[#EFE5D9]">
                <a
                  href={waLink(`Hi KRIA Tech! I am interested in ordering the ${prod.name} acrylic frame. Please share customization options.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E1B18] hover:bg-[#8C6436] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                  <span>Inquire Shape</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHOLESALE, B2B & WEDDING RETURN GIFTS ───────────────── */}
      <section id="wholesale" className="relative z-10 py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-white/95 via-[#FDFBF7]/90 to-[#F6EEE3]/90 backdrop-blur-2xl border border-white p-8 sm:p-14 shadow-[0_25px_65px_rgba(180,140,80,0.1)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE3D3] text-[#7A562D] font-mono text-xs tracking-wider uppercase font-semibold">
                <Factory className="h-3.5 w-3.5" />
                Factory Direct Bulk Gifting
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1E1B18] leading-tight">
                Weddings, Corporate Milestones & Brand Merchandise.
              </h2>

              <p className="text-sm sm:text-base text-[#615446] leading-relaxed">
                Looking for 50 to 5,000 personalized keepsakes for your guests or employees? We offer factory-direct tiered pricing, custom logo engraving, individual guest photo personalization, and premium velvet/gold gift packaging.
              </p>

              {/* Wholesale Quantity Picker Chips */}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-[#887867] mb-3 font-bold">
                  Select Order Volume Tier:
                </p>
                <div className="flex flex-wrap gap-2">
                  {WHOLESALE_TIERS.map((t) => (
                    <button
                      key={t.qty}
                      onClick={() => setWholesaleQty(t.qty)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        wholesaleQty === t.qty
                          ? 'bg-[#1E1B18] text-white shadow-md scale-105'
                          : 'bg-white/80 text-[#6B5E50] border border-[#E2D2C2] hover:bg-white'
                      }`}
                    >
                      {t.qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Tier Feature Card */}
              {(() => {
                const tier = WHOLESALE_TIERS.find((t) => t.qty === wholesaleQty) || WHOLESALE_TIERS[1];
                return (
                  <div className="p-4 rounded-2xl bg-white/90 border border-[#E5D7C7] flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-[#1E1B18]">{tier.tier}</p>
                      <p className="text-xs text-[#7A6B5C] mt-0.5">{tier.benefit} · {tier.estimate}</p>
                    </div>
                    <a
                      href={waLink(`Hi KRIA Tech! I would like a wholesale quote for ${tier.qty} (${tier.tier}). Please share catalog and volume pricing.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Quote {tier.qty}</span>
                    </a>
                  </div>
                );
              })()}

              <div className="flex flex-wrap gap-6 text-xs text-[#756758] pt-2">
                <span className="flex items-center gap-1.5">✓ Free sample proof for 100+ pcs</span>
                <span className="flex items-center gap-1.5">✓ Custom luxury box packaging</span>
                <span className="flex items-center gap-1.5">✓ Pan-India doorstep delivery</span>
              </div>
            </div>

            {/* Right Card: Hyderabad Factory Showcase */}
            <div className="lg:col-span-5 rounded-3xl bg-gradient-to-tr from-[#FAF4EB] to-[#F1E5D5] border border-white p-7 shadow-inner space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#8C6436] shadow-xs">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-medium text-[#1E1B18]">Hyderabad Manufacturing Unit</h4>
                  <p className="text-[11px] font-mono text-[#8C7A68]">Telangana, India</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#5D5042] leading-relaxed">
                <p>
                  Every KRIA Tech frame is manufactured on state-of-the-art CNC laser beds and UV flatbed print lines. No overseas delay, no trading markups.
                </p>
                <div className="p-3.5 rounded-xl bg-white/70 border border-[#E9DAC8] space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#8C7A68]">Daily Output:</span>
                    <span className="font-bold text-[#1E1B18]">1,500+ Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7A68]">Quality Tolerance:</span>
                    <span className="font-bold text-[#1E1B18]">±0.05 mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7A68]">Direct Operations Phone:</span>
                    <span className="font-bold text-[#1E1B18]">+91 93925 76792</span>
                  </div>
                </div>
              </div>

              <a
                href={waLink("Hello Operations Team at KRIA Tech Hyderabad, I would like to discuss a custom bulk OEM acrylic order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#1E1B18] hover:bg-[#8C6436] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>Chat with Operations Team</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FREQUENTLY ASKED QUESTIONS (ACCORDION) ─────────────── */}
      <section id="faqs" className="relative z-10 py-20 sm:py-28 max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold mb-2">
            Clear Answers
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1E1B18]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-[#736556]">
            Everything you need to know about material quality, photography guidelines, and delivery.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/80 backdrop-blur-md border border-[#E9DCCE] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-serif text-base sm:text-lg text-[#1E1B18] font-normal">
                    {faq.q}
                  </span>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[#FAF4ED] text-[#8C6436]' : 'text-[#8A7969]'}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm text-[#615345] leading-relaxed border-t border-[#F2E7DC] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Help Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-[#FAF2E6] to-[#F3E6D5] border border-[#E4D4C3] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-serif text-lg font-medium text-[#1E1B18]">Have a custom shape or special dimension in mind?</p>
            <p className="text-xs text-[#7A6A5A] mt-0.5">Our design engineers can laser cut custom profiles for your project.</p>
          </div>
          <a
            href={waLink("Hi KRIA Tech! I have a question about custom sizes or artwork requirements.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E1B18] hover:bg-[#8C6436] text-white text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            <span>Ask A Question</span>
          </a>
        </div>
      </section>

      {/* ─── LUXURY BOTTOM CALL TO ACTION ───────────────────────── */}
      <section className="relative z-10 py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-[#1E1B18] via-[#2D2723] to-[#1E1B18] text-[#FDFBF7] p-10 sm:p-20 text-center relative overflow-hidden shadow-[0_30px_70px_rgba(30,27,24,0.3)]">
          {/* Subtle Ambient Gold Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#C4A574]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4A574] font-semibold">
              Begin With Your Favorite Photo
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight leading-tight">
              Ready To See Your Memory In 3mm Optical Acrylic?
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
              Send us your picture over WhatsApp. We will generate a digital sample mockup, recommend the best shape, and craft it at our Hyderabad factory within 24 hours.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={waLink("Hello KRIA Tech, I would like to preview my photo on your acrylic frames!")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-[0.16em] shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
              >
                <MessageCircle className="h-4.5 w-4.5" />
                <span>Chat On WhatsApp Now</span>
              </a>

              <a
                href={waLink("Hello KRIA Tech, I am looking for corporate/wedding bulk packages (50+ pieces).")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/20 hover:border-[#C4A574] text-neutral-200 hover:text-white text-xs font-bold uppercase tracking-[0.16em] transition-all cursor-pointer"
              >
                <span>Bulk Inquiry (+91 93925 76792)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DEDICATED LIGHT LUXURY FOOTER ──────────────────────── */}
      <footer className="relative z-10 border-t border-[#EADECE] bg-[#FAF5EE] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start justify-between">
            
            {/* Col 1: Brand Info */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white border border-[#E0D0BF] flex items-center justify-center shadow-xs">
                  <Sparkles className="h-4 w-4 text-[#8C6436]" />
                </div>
                <span className="font-serif text-2xl font-semibold tracking-tight text-[#1E1B18]">
                  KRIA<span className="text-[#A78255] font-light">Tech</span>
                </span>
              </div>
              <p className="text-xs text-[#6E6152] leading-relaxed max-w-sm">
                Specialized manufacturers of diamond-cut 3mm monolithic cast acrylic photo magnets. Crafted with UV-cured sub-surface pigment and flush rare-earth neodymium magnetic cores. Factory-direct in Hyderabad, Telangana.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#8C7762]">
                <MapPin className="h-3.5 w-3.5 text-[#8C6436]" />
                <span>Hyderabad, Telangana · India</span>
              </div>
            </div>

            {/* Col 2: Shapes List */}
            <div className="md:col-span-3 space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#8C6436] font-bold">
                Signature Collection
              </p>
              <ul className="text-xs text-[#635546] space-y-2">
                <li>• Sculpted Heart (2×2", 3×3", 4×4")</li>
                <li>• Minimal Circle (2×2", 3×3", 4×4")</li>
                <li>• Classic Polaroid (2×3", 3×4")</li>
                <li>• Statement Grande (4×6")</li>
              </ul>
            </div>

            {/* Col 3: Direct Contact */}
            <div className="md:col-span-4 space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#8C6436] font-bold">
                Direct WhatsApp Concierge
              </p>
              <p className="text-xs text-[#635546]">
                Available Monday – Saturday, 9:00 AM – 8:00 PM IST
              </p>
              <a
                href={waLink("Hello KRIA Tech team, I have an inquiry.")}
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

          {/* Copyright bar */}
          <div className="mt-12 pt-6 border-t border-[#E8DACB] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#8F7E6E]">
            <p>© {new Date().getFullYear()} KRIA Tech. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>3mm Optical Acrylic</span>
              <span>•</span>
              <span>300 DPI UV Pigment</span>
              <span>•</span>
              <span>Neodymium N35 Core</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING WHATSAPP BUTTON (DESKTOP & MOBILE) ────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={waLink("Hi KRIA Tech! I am on your website and would like to talk about custom acrylic frames.")}
          target="_blank"
          rel="noopener noreferrer"
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
            Chat On WhatsApp
          </span>
        </a>
      </div>

    </div>
  );
}
