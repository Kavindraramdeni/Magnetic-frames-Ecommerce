import React from 'react';
import { MessageCircle, Star, Package, Zap, Award, ArrowLeft } from 'lucide-react';

const WA_NUMBER = '919392576792';

function waLink(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

interface Product {
  id: string;
  name: string;
  tagline: string;
  image: string;
  sizes: string[];
  material: string;
  finish: string;
  magnet: string;
  highlight: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'heart',
    name: 'Sculpted Heart',
    tagline: 'Romance & Keepsakes',
    image: '/images/shape_heart_magnet_1780939430998.png',
    sizes: ['2×2"', '3×3"', '4×4"'],
    material: '3mm Cast Acrylic',
    finish: '300 DPI UV Pigment',
    magnet: 'Neodymium Grip',
    highlight: 'Perfect for couples, anniversaries & gifting',
  },
  {
    id: 'circle',
    name: 'Minimal Circle',
    tagline: 'Clean & Contemporary',
    image: '/images/shape_circle_magnet_1780939399489.png',
    sizes: ['2×2"', '3×3"', '4×4"'],
    material: '3mm Cast Acrylic',
    finish: '300 DPI UV Pigment',
    magnet: 'Neodymium Grip',
    highlight: 'Fits any surface — fridge, board, locker',
  },
  {
    id: 'polaroid',
    name: 'Classic Polaroid',
    tagline: 'Nostalgic Film Look',
    image: '/images/shape_polaroid_magnet_1780939416510.png',
    sizes: ['2×3"', '3×4"'],
    material: '3mm Cast Acrylic',
    finish: '300 DPI UV Pigment',
    magnet: 'Neodymium Grip',
    highlight: 'Wedding wall art, travel memories & more',
  },
  {
    id: 'grande',
    name: 'Statement Grande',
    tagline: 'Bold & Full-Frame',
    image: '/images/scenic_landscape_sample_1782458156606.jpg',
    sizes: ['4×6"'],
    material: '3mm Cast Acrylic',
    finish: '300 DPI UV Pigment',
    magnet: 'Neodymium Grip',
    highlight: 'Landscape photos, group portraits & corporate gifts',
  },
];

const FEATURES = [
  {
    icon: <Package className="h-6 w-6 text-[#C4A574]" />,
    title: '3mm Optical-Grade Acrylic',
    desc: 'Cast acrylic panels — not extruded — for edge clarity and scratch resistance you can see and feel.',
  },
  {
    icon: <Zap className="h-6 w-6 text-[#C4A574]" />,
    title: '300 DPI UV Pigment Print',
    desc: 'UV-cured pigment inks bond directly to acrylic for colours that stay vivid for years without fading.',
  },
  {
    icon: <Award className="h-6 w-6 text-[#C4A574]" />,
    title: 'Neodymium Magnetic Grip',
    desc: 'Industrial-grade neodymium magnets — strong enough for steel refrigerators, filing cabinets and whiteboards.',
  },
];

interface Props {
  onBackToStore?: () => void;
}

export default function KriaTechPortfolioPage({ onBackToStore }: Props) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans antialiased text-neutral-900 overflow-x-hidden selection:bg-[#E8DCCF]">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#111111] text-white overflow-hidden">
        {/* Decorative gold ring */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full border border-[#C4A574]/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full border border-[#C4A574]/8" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28 md:py-36">
          {onBackToStore && (
            <button
              onClick={onBackToStore}
              className="mb-10 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C4A574] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Store
            </button>
          )}

          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#C4A574] font-bold mb-4">
            KRIA Tech · Hyderabad, Telangana
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight max-w-3xl">
            Hand-crafted<br />
            <span className="text-[#C4A574]">Acrylic Photo</span><br />
            Frame Magnets
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-400 max-w-xl leading-relaxed">
            Factory-made in Hyderabad. 3mm optical-grade cast acrylic, UV-pigment printed at 300&nbsp;DPI, finished with a neodymium magnetic backing — built to last a lifetime.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={waLink('Hi! I came across KRIA Tech portfolio and I\'m interested in learning more about your acrylic photo frame magnets.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider px-7 py-4 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <MessageCircle className="h-4.5 w-4.5" />
              Chat with Us on WhatsApp
            </a>
            <a
              href={waLink('Hi! I would like to place a bulk / wholesale order for KRIA Tech acrylic photo frame magnets. Please share details.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#C4A574]/40 hover:border-[#C4A574] text-[#C4A574] hover:text-white font-bold text-sm uppercase tracking-wider px-7 py-4 transition-all cursor-pointer"
            >
              Bulk / Wholesale Inquiry
            </a>
          </div>

          {/* Quick trust row */}
          <div className="mt-14 flex flex-wrap gap-6 text-xs text-neutral-500 font-mono uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Star className="h-3 w-3 text-[#C4A574]" fill="#C4A574" /> Made in Hyderabad</span>
            <span className="flex items-center gap-1.5"><Star className="h-3 w-3 text-[#C4A574]" fill="#C4A574" /> 4 Shapes Available</span>
            <span className="flex items-center gap-1.5"><Star className="h-3 w-3 text-[#C4A574]" fill="#C4A574" /> Wholesale Friendly</span>
            <span className="flex items-center gap-1.5"><Star className="h-3 w-3 text-[#C4A574]" fill="#C4A574" /> WhatsApp-First Orders</span>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#C4A574] font-bold mb-3">Our Products</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium">4 Signature Shapes</h2>
          <p className="mt-3 text-sm text-neutral-500 max-w-lg mx-auto">
            Each shape is laser-cut from 3mm cast acrylic and UV-printed at our Hyderabad factory.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Product image */}
              <div className="bg-neutral-50 h-52 flex items-center justify-center p-6 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#C4A574] font-bold">{p.tagline}</p>
                  <h3 className="font-serif text-xl font-medium mt-0.5">{p.name}</h3>
                </div>

                {/* Sizes */}
                <div className="flex flex-wrap gap-1.5">
                  {p.sizes.map((s) => (
                    <span key={s} className="text-[10px] font-mono bg-neutral-100 text-neutral-700 rounded-full px-2.5 py-1 uppercase tracking-wide">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Specs */}
                <ul className="space-y-1 text-xs text-neutral-500">
                  <li>✦ {p.material}</li>
                  <li>✦ {p.finish}</li>
                  <li>✦ {p.magnet}</li>
                </ul>

                <p className="text-xs text-neutral-600 italic leading-relaxed">{p.highlight}</p>

                <a
                  href={waLink(`Hi! I'm interested in the KRIA Tech ${p.name} (${p.sizes.join(' / ')}). Can you share more details and pricing?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#111111] hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider py-3 transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Inquire on WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT MAKES KRIA DIFFERENT ─────────────────────────────────────── */}
      <section className="bg-[#111111] text-white py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#C4A574] font-bold mb-3">Why KRIA Tech</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium">Built different, by design</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-[#1a1714] rounded-3xl border border-[#C4A574]/10 p-8 hover:border-[#C4A574]/30 transition-colors"
              >
                <div className="mb-5">{f.icon}</div>
                <h3 className="font-serif text-xl font-medium mb-3">{f.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHOLESALE / BULK ──────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 max-w-6xl mx-auto px-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#1a1714] to-[#111111] text-white p-10 sm:p-16 relative overflow-hidden">
          {/* Decorative ring */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full border border-[#C4A574]/10" />

          <div className="relative max-w-2xl">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#C4A574] font-bold mb-4">
              Wholesale & Bulk
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium leading-tight">
              Corporate Gifting &<br />Wedding Return Gifts
            </h2>
            <p className="mt-5 text-neutral-400 leading-relaxed">
              Need 50+ custom acrylic photo magnets? We supply bulk orders direct from our Hyderabad factory — with custom branding, luxury box packaging, and volume pricing starting at 50 pieces.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['50 Pcs', '100 Pcs', '250 Pcs', '500+ Pcs'].map((qty) => (
                <div key={qty} className="bg-white/5 border border-[#C4A574]/20 rounded-2xl p-3 text-center">
                  <p className="font-serif text-lg font-medium text-[#C4A574]">{qty}</p>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 mt-0.5">MOQ Tier</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href={waLink('Hi! I would like to place a bulk wholesale order for KRIA Tech acrylic photo frame magnets. Please share your volume pricing and packaging options.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider px-7 py-4 transition-all cursor-pointer"
              >
                <MessageCircle className="h-4.5 w-4.5" />
                Get WhatsApp Quote
              </a>
              <a
                href={waLink('Hi! I am interested in KRIA Tech\'s wedding return gifts / corporate gifting packages. Can you share catalog and pricing?')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#C4A574]/40 hover:border-[#C4A574] text-[#C4A574] font-bold text-sm uppercase tracking-wider px-7 py-4 transition-all cursor-pointer"
              >
                Wedding & Corporate
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#111111] text-neutral-400 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif text-2xl text-white mb-1">KRIA Tech</p>
            <p className="text-xs font-mono uppercase tracking-widest text-[#C4A574]">Hyderabad, Telangana · India</p>
            <p className="text-xs mt-2 text-neutral-500 max-w-xs leading-relaxed">
              Manufacturers of 3mm optical-grade cast acrylic photo frame magnets — UV-printed, neodymium-backed, and built to last.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <a
              href={waLink('Hi! I found KRIA Tech and would like to inquire about your acrylic photo magnets.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#25D366] hover:text-emerald-400 font-semibold transition-colors cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              +91 93925 76792 (WhatsApp)
            </a>
            <p className="text-xs text-neutral-600 font-mono">© {new Date().getFullYear()} KRIA Tech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
