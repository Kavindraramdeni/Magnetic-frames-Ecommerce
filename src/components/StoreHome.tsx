import React, { useState } from 'react';
import { 
  ArrowRight, ShieldCheck, Truck, Sparkles, Star, Plus, Minus, 
  Check, Gift, Heart, Eye, CheckCircle2 
} from 'lucide-react';
import { BASE_SHAPES, RETURN_GIFTS } from '../data';
import { MagnetShape, MagnetShapeId, ReturnGiftProduct, CartItem } from '../types';
import { SHAPE_SAMPLE_IMAGES } from '../lib/shapePreview';

interface StoreHomeProps {
  onCustomize: (shapeId?: MagnetShapeId, size?: string) => void;
  onAddToCart?: (item: CartItem) => void;
  onDirectCheckout?: (item: CartItem) => void;
  onOpenGallery?: () => void;
  onOpenBOGO?: () => void;
}

export default function StoreHome({ 
  onCustomize, 
  onAddToCart, 
  onDirectCheckout,
  onOpenGallery,
  onOpenBOGO 
}: StoreHomeProps) {
  // Exactly the 4 customizable frame products
  const customizableFrames: MagnetShape[] = BASE_SHAPES.filter(s => 
    ['love', 'circle', 'polaroid', 'grande'].includes(s.id)
  );

  // Return Gifts quantity state
  const [returnGiftQuantities, setReturnGiftQuantities] = useState<Record<string, number>>({
    'rg-ganesha': 1,
    'rg-teddy': 1,
    'rg-wedding': 1,
    'rg-mandala': 1
  });

  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleQtyChange = (id: string, delta: number) => {
    setReturnGiftQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min(500, (prev[id] || 1) + delta))
    }));
  };

  const handleAddReturnGift = (gift: ReturnGiftProduct, checkoutImmediately = false) => {
    const qty = returnGiftQuantities[gift.id] || 1;
    const cartItem: CartItem = {
      id: `rg-${gift.id}-${Date.now()}`,
      shapeId: gift.shapeId,
      shapeName: `${gift.name} (${gift.dimensions})`,
      quantity: qty,
      previewUrl: gift.imageUrl,
      originalUrl: gift.imageUrl,
      photoName: `${gift.name} - Return Gift`,
      captionText: '',
      photoScale: 1,
      photoPanX: 0,
      photoPanY: 0,
      cropMode: 'fill',
      price: gift.price,
      selectedSize: gift.dimensions,
      isReturnGift: true
    };

    if (checkoutImmediately && onDirectCheckout) {
      onDirectCheckout(cartItem);
      return;
    }

    if (onAddToCart) {
      onAddToCart(cartItem);
      setAddedIds(prev => ({ ...prev, [gift.id]: true }));
      setTimeout(() => {
        setAddedIds(prev => ({ ...prev, [gift.id]: false }));
      }, 2000);
    }
  };

  return (
    <div className="page-enter pb-28 md:pb-12 text-[#111111]">
      {/* ── 1. HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-4 pt-4 sm:pt-6">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-[#1a1714] text-[#FAF8F5] min-h-[62vh] sm:min-h-[68vh] flex flex-col justify-end shadow-xl">
          <img
            src="/images/Landingprofile.png"
            alt="KRIA luxury acrylic magnetic photo frame"
            className="absolute inset-0 w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15" />

          {/* Floating BOGO Callout Pill on Hero */}
          <div className="absolute top-5 left-5 z-20">
            <button
              type="button"
              onClick={onOpenBOGO}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#9E1B32] to-[#B8860B] text-white text-[11px] font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition cursor-pointer"
            >
              <Gift className="h-3.5 w-3.5" />
              <span>Launch Offer: Buy 1 Get 1 Free</span>
            </button>
          </div>

          <div className="relative z-10 p-6 sm:p-12 space-y-4 max-w-2xl">
            <p className="text-[10px] tracking-[0.28em] uppercase text-[#E8DCCF] font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#C4A574]" />
              Handmade 3mm Acrylic · Hyderabad, India
            </p>
            <h1 className="font-serif text-[2.35rem] sm:text-5xl lg:text-6xl leading-[1.05] font-light">
              Your photo.
              <br />
              <span className="italic font-serif font-medium text-[#FAF8F5]">A keepsake they keep.</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-lg leading-relaxed font-light">
              Made-to-order magnetic acrylic fridge frames. Choose from our 4 iconic shapes or explore pre-designed return gifts for weddings and milestones.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onCustomize()}
                className="inline-flex items-center gap-2 rounded-full bg-white text-neutral-900 px-6 py-3.5 text-xs font-bold tracking-wider uppercase shadow-md hover:bg-neutral-100 transition cursor-pointer active:scale-95"
              >
                <span>Customize Yours</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#return-gifts-section"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 px-5 py-3.5 text-xs font-semibold tracking-wider uppercase hover:bg-white/25 transition cursor-pointer"
              >
                <span>Return Gifts</span>
              </a>
              <span className="text-[11px] text-white/70 ml-1">
                From ₹199 · Free shipping on ₹699+
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST VALUE PROPOSITIONS ───────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 mt-6 grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { icon: Sparkles, title: '3mm Cast Acrylic', subtitle: 'Diamond-cut clarity' },
          { icon: Truck, title: 'Express Delivery', subtitle: '2–4 days across India' },
          { icon: ShieldCheck, title: 'Neodymium Magnet', subtitle: 'Scratch-free firm grip' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-neutral-200/80 bg-white p-3 sm:p-4 text-center shadow-xs">
            <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-[#A38A6E] mb-1.5" />
            <p className="text-[11px] sm:text-xs font-semibold text-neutral-900">{item.title}</p>
            <p className="text-[9px] sm:text-[10px] text-neutral-500 hidden sm:block">{item.subtitle}</p>
          </div>
        ))}
      </section>

      {/* ── 3. SECTION 1: CUSTOMIZABLE FRAMES (4 PRODUCTS) ────────────── */}
      <section id="shop-frames-section" className="mx-auto max-w-6xl px-4 mt-12 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.24em] uppercase text-[#A38A6E] font-bold">1. Personalized Frames</span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white text-[9px] font-mono">4 Shapes</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-light text-neutral-950 mt-1">
              Upload your photo & pick a <span className="italic font-serif">frame</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-md">
              Each shape features multiple sizes. Crop directly from your phone and preview before ordering.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCustomize()}
            className="text-xs font-semibold text-neutral-900 hover:text-[#A38A6E] flex items-center gap-1.5 underline underline-offset-4 cursor-pointer self-start sm:self-end"
          >
            <span>Open Customizer Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* The 4 Frame Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {customizableFrames.map((shape) => (
            <div
              key={shape.id}
              className="bg-white rounded-3xl border border-neutral-200/80 p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Product Visual Container */}
              <div 
                onClick={() => onCustomize(shape.id)}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#FAF6F0] mb-3.5 cursor-pointer"
              >
                <img
                  src={SHAPE_SAMPLE_IMAGES[shape.id] || '/images/Landingprofile.png'}
                  alt={shape.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-bold text-neutral-900 shadow-xs">
                  From ₹{shape.sizes ? Math.min(...shape.sizes.map(s => s.price)) : shape.price}
                </span>

                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="rounded-full bg-white text-neutral-900 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-md">
                    Customize →
                  </span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-medium text-neutral-950">
                    {shape.name}
                  </h3>
                  <span className="text-[11px] font-bold font-mono text-neutral-900">
                    ₹{shape.price}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                  {shape.description}
                </p>

                {/* Available Sizes Pills */}
                {shape.sizes && shape.sizes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                      Available Sizes:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {shape.sizes.map((s) => (
                        <button
                          key={s.size}
                          type="button"
                          onClick={() => onCustomize(shape.id, s.size)}
                          className="px-2 py-0.5 rounded-md bg-[#FAF8F5] hover:bg-neutral-900 hover:text-white border border-neutral-200 text-[10px] font-mono text-neutral-700 transition cursor-pointer"
                          title={`Customize ${shape.name} in ${s.size} for ₹${s.price}`}
                        >
                          {s.label} · ₹{s.price}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onCustomize(shape.id)}
                className="mt-4 w-full rounded-2xl bg-neutral-900 text-white py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Sparkles className="h-3 w-3 text-[#E8DCCF]" />
                <span>Customize Now</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. SECTION 2: RETURN GIFTS (4 PRODUCTS · FIXED ART) ────────── */}
      <section id="return-gifts-section" className="mx-auto max-w-6xl px-4 mt-16 scroll-mt-20">
        <div className="bg-[#FAF6F0] rounded-[2.5rem] border border-[#E8DCCF]/80 p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.24em] uppercase text-[#9E1B32] font-bold">2. Ready-Made Keepsakes</span>
                <span className="px-2 py-0.5 rounded-full bg-[#9E1B32] text-white text-[9px] font-mono">Return Gifts</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-light text-neutral-950 mt-1">
                Curated <span className="italic font-serif">Return Gifts</span> with Fixed Art
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl font-light">
                High-end acrylic magnets featuring auspicious blessings, wedding gratitude, and baby milestones. Pre-designed with fixed artwork — add directly to your bag or buy in bulk!
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#9E1B32] bg-white px-3 py-1.5 rounded-full border border-[#9E1B32]/30 shadow-xs">
              <Gift className="h-3.5 w-3.5" />
              <span>Bulk discounts auto-applied at checkout</span>
            </div>
          </div>

          {/* The 4 Return Gift Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RETURN_GIFTS.map((gift) => {
              const qty = returnGiftQuantities[gift.id] || 1;
              const isAdded = addedIds[gift.id];

              return (
                <div
                  key={gift.id}
                  className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  {/* Fixed Art Frame Preview */}
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#1a1714] mb-3.5 group">
                    <img
                      src={gift.imageUrl}
                      alt={gift.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-white tracking-wide uppercase">
                        Fixed Artwork
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="rounded-full bg-white/95 px-2 py-0.5 font-mono text-[10px] font-bold text-neutral-900 shadow-xs">
                        ₹{gift.price}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-mono text-[#A38A6E] font-semibold block uppercase">
                      {gift.category}
                    </span>
                    <h3 className="font-serif text-base font-medium text-neutral-950 leading-snug">
                      {gift.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-2">
                      {gift.description}
                    </p>
                    <div className="text-[10px] text-neutral-400 font-mono pt-1">
                      Size: {gift.dimensions} · 3mm Acrylic
                    </div>
                  </div>

                  {/* Quantity Selector + Fast Add Buttons */}
                  <div className="pt-4 space-y-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between bg-[#FAF8F5] rounded-xl border border-neutral-200/80 px-2 py-1">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Quantity</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(gift.id, -1)}
                          className="h-6 w-6 rounded-lg bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center hover:bg-neutral-100 cursor-pointer text-xs"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-neutral-900 min-w-5 text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(gift.id, 1)}
                          className="h-6 w-6 rounded-lg bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center hover:bg-neutral-100 cursor-pointer text-xs"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Dual Buttons: Add to Bag and Buy Now */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddReturnGift(gift, false)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Added</span>
                          </>
                        ) : (
                          <span>Add to Bag</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddReturnGift(gift, true)}
                        className="py-2 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-[#FAF8F5] text-neutral-900 border border-neutral-300 hover:bg-white hover:border-black transition flex items-center justify-center cursor-pointer"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. SECTION 3: ABOUT US SECTION ────────────────────────────── */}
      <section id="about-us-section" className="mx-auto max-w-6xl px-4 mt-16 scroll-mt-20">
        <div className="rounded-[2.5rem] bg-[#1a1714] text-white p-8 sm:p-14 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4A574] font-bold">
                About KRIA Studio
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight">
                Crafting memories into <span className="italic font-serif">sculpted glass-clear keepsakes</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
                KRIA Studio was born from a simple belief: your most cherished family laughter, wedding vows, and baby milestones deserve a permanent, beautiful place in your daily life.
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
                Instead of flimsy paper magnets that peel or fade, every KRIA frame is crafted from <strong>3mm optical-grade cast acrylic</strong>, hand-assembled with high-definition 300 DPI UV pigment photo prints, and backed with heavy-duty neodymium magnets that never slip or scratch your refrigerator.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3">
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-light text-[#E8DCCF]">10,000+</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Frames Handcrafted</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-light text-[#E8DCCF]">Hyderabad</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Made in India</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-light text-[#E8DCCF]">100%</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Prepaid & Verified</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 space-y-2">
                <Star className="h-5 w-5 text-[#C4A574]" />
                <h4 className="font-serif text-lg text-white">Hand-Cut Precision</h4>
                <p className="text-xs text-neutral-300">
                  Every photo is hand-cut to match the custom acrylic silhouette with 0.5mm precision before magnetic sandwich sealing.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 space-y-2">
                <ShieldCheck className="h-5 w-5 text-[#C4A574]" />
                <h4 className="font-serif text-lg text-white">Full Photo Safe Guarantee</h4>
                <p className="text-xs text-neutral-300">
                  Our customizer offers both edge-to-edge Fill and Full Photo No Cutoff modes, so faces are never accidentally clipped.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. SECTION 4: TESTIMONIAL HIGHLIGHT ───────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 mt-12">
        <div className="rounded-3xl bg-white border border-neutral-200/80 p-6 sm:p-10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-[#C4A574]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="font-serif text-xl sm:text-2xl italic text-neutral-900 leading-snug">
              “Looked like a high-end art gallery piece. Our wedding guests loved the magnetic keepsakes!”
            </p>
            <p className="text-xs text-neutral-500">
              Pooja &amp; Rohit · Bangalore · 200 Wedding Return Favors
            </p>
          </div>

          {onOpenGallery && (
            <button
              type="button"
              onClick={onOpenGallery}
              className="shrink-0 px-6 py-3 rounded-full bg-[#FAF8F5] border border-neutral-300 text-neutral-900 hover:border-black font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              View Visual Gallery →
            </button>
          )}
        </div>
      </section>

      {/* ── 7. SECTION 5: FAQS ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 mt-8 space-y-2">
        <h3 className="font-serif text-xl sm:text-2xl font-light text-neutral-950 mb-3 text-center sm:text-left">
          Frequently asked questions
        </h3>
        {[
          {
            q: 'How do I upload and crop my photos for the frames?',
            a: 'Select any of our 4 customizable shapes (Heart, Circle, Polaroid, or Grande), tap "Customize Now", and upload your photo directly from your phone. You can choose your size, toggle between auto-crop and full photo no-cutoff, zoom, pan, and add text captions in real time.'
          },
          {
            q: 'What are Return Gifts and do I need to upload a photo for them?',
            a: 'No upload needed! Return Gifts are pre-designed luxury acrylic magnetic frames with fixed, high-definition auspicious artwork (such as Shubh Labh Ganesha, Nursery Birthday Teddy, Floral Wedding Favors, and Golden Mandalas). You can directly select quantity and add to cart.'
          },
          {
            q: 'What sizes are available for each frame shape?',
            a: 'Heart: 2×2, 3×3, and 4×4 inch. Circle: 2×2, 3×3, and 4×4 inch. Polaroid: 2×3 and 3×4 inch. Statement Grande: 4×6 inch.'
          },
          {
            q: 'How does shipping and delivery work across India?',
            a: 'Every custom frame is handcrafted within 24–48 hours in our Hyderabad studio and shipped via express courier partners. Free express shipping is automatically applied on orders above ₹699.'
          }
        ].map((faq, i) => (
          <button
            key={faq.q}
            type="button"
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full text-left rounded-2xl border border-neutral-200/80 bg-white px-5 py-4 transition hover:border-neutral-400 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-medium text-neutral-900">{faq.q}</span>
              <span className="text-neutral-400 text-lg leading-none">{openFaq === i ? '−' : '+'}</span>
            </div>
            {openFaq === i && (
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed font-light">{faq.a}</p>
            )}
          </button>
        ))}
      </section>
    </div>
  );
}
