import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, FileText, Sparkles, MessageCircle, 
  ShoppingBag, Check, Plus, Minus, ArrowLeft, Send, CheckCircle2,
  PackageCheck, HelpCircle, Truck, Clock
} from 'lucide-react';
import { CartItem, MagnetShapeId } from '../types';

interface WholesaleInquiriesPageProps {
  onBackToHome: () => void;
  onAddToCart?: (item: CartItem) => void;
  onOpenCart?: () => void;
  cartCount?: number;
}

interface WholesaleShape {
  id: string;
  name: string;
  code: string;
  tag: string;
  image: string;
  description: string;
  sizes: {
    label: string;
    dimensions: string;
    retailPrice: number;
  }[];
}

const PRESET_QUANTITIES = [50, 100, 250, 500, 1000] as const;

const WHOLESALE_SHAPES: WholesaleShape[] = [
  {
    id: 'love',
    name: 'Sculpted Heart',
    code: 'HRT-ACR',
    tag: 'Couples & Weddings',
    image: '/images/shape_heart_magnet_1780939430998.png',
    description: 'Sculpted romantic contour, 3mm optical-grade cast acrylic with polished beveled edge & neodymium magnetic backing.',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', retailPrice: 199 },
      { label: '3 × 3"', dimensions: '3 × 3 inch', retailPrice: 249 },
      { label: '4 × 4"', dimensions: '4 × 4 inch', retailPrice: 299 },
    ]
  },
  {
    id: 'circle',
    name: 'Minimal Circle',
    code: 'RND-ACR',
    tag: 'Logos & Milestones',
    image: '/images/shape_circle_magnet_1780939399489.png',
    description: 'Diamond laser-cut circular silhouette, high-clarity 300 DPI UV pigment print and scratch-resistant gloss finish.',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', retailPrice: 199 },
      { label: '3 × 3"', dimensions: '3 × 3 inch', retailPrice: 249 },
      { label: '4 × 4"', dimensions: '4 × 4 inch', retailPrice: 299 },
    ]
  },
  {
    id: 'polaroid',
    name: 'Classic Polaroid',
    code: 'PLR-ACR',
    tag: 'Vintage & Keepsakes',
    image: '/images/shape_polaroid_magnet_1780939416510.png',
    description: 'Timeless instant-photo frame with bottom caption margin, cast acrylic sandwich, and dual neodymium magnets.',
    sizes: [
      { label: '2 × 3"', dimensions: '2 × 3 inch', retailPrice: 229 },
      { label: '3 × 4"', dimensions: '3 × 4 inch', retailPrice: 279 },
    ]
  },
  {
    id: 'grande',
    name: 'Statement Grande',
    code: 'GRD-ACR',
    tag: 'Executive & Landscape',
    image: '/images/scenic_landscape_sample_1782458156606.jpg',
    description: 'Oversized 4 × 6 inch centerpiece acrylic photo plaque backed by 4 heavy-duty neodymium magnets.',
    sizes: [
      { label: '4 × 6"', dimensions: '4 × 6 inch', retailPrice: 349 },
    ]
  }
];

function getWholesaleDiscount(qty: number): number {
  if (qty >= 1000) return 55;
  if (qty >= 500) return 50;
  if (qty >= 250) return 45;
  if (qty >= 100) return 40;
  if (qty >= 50) return 30;
  return 25;
}

function calculateWholesalePrice(retailPrice: number, qty: number) {
  const discountPercent = getWholesaleDiscount(qty);
  const unitPrice = Math.round(retailPrice * (1 - discountPercent / 100));
  const total = unitPrice * qty;
  const retailTotal = retailPrice * qty;
  const savings = retailTotal - total;
  return { unitPrice, total, discountPercent, savings };
}

export default function WholesaleInquiriesPage({
  onBackToHome,
  onAddToCart,
  onOpenCart,
  cartCount = 0
}: WholesaleInquiriesPageProps) {
  // Per-shape state: selected size index, selected quantity mode ('50'|'100'|'250'|'500'|'1000'|'custom'), and custom quantity number
  const [shapeStates, setShapeStates] = useState<{
    [shapeId: string]: {
      sizeIndex: number;
      qtyMode: number | 'custom';
      customQty: number;
    };
  }>({
    love: { sizeIndex: 0, qtyMode: 50, customQty: 50 },
    circle: { sizeIndex: 0, qtyMode: 50, customQty: 50 },
    polaroid: { sizeIndex: 0, qtyMode: 50, customQty: 50 },
    grande: { sizeIndex: 0, qtyMode: 50, customQty: 50 }
  });

  const [addedFeedback, setAddedFeedback] = useState<{ [shapeId: string]: boolean }>({});

  // Direct Inquiry Form State
  const [formCompany, setFormCompany] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formShape, setFormShape] = useState('Sculpted Heart');
  const [formSize, setFormSize] = useState('3 × 3"');
  const [formQty, setFormQty] = useState(100);
  const [formNotes, setFormNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSizeChange = (shapeId: string, sizeIndex: number) => {
    setShapeStates(prev => ({
      ...prev,
      [shapeId]: { ...prev[shapeId], sizeIndex }
    }));
  };

  const handleQtyModeSelect = (shapeId: string, mode: number | 'custom') => {
    setShapeStates(prev => ({
      ...prev,
      [shapeId]: {
        ...prev[shapeId],
        qtyMode: mode,
        customQty: typeof mode === 'number' ? mode : prev[shapeId].customQty
      }
    }));
  };

  const handleCustomQtyChange = (shapeId: string, val: number) => {
    const sanitized = Math.max(25, Math.min(10000, val || 25));
    setShapeStates(prev => ({
      ...prev,
      [shapeId]: { ...prev[shapeId], customQty: sanitized }
    }));
  };

  const getEffectiveQty = (shapeId: string): number => {
    const st = shapeStates[shapeId] || { qtyMode: 50, customQty: 50 };
    return st.qtyMode === 'custom' ? st.customQty : Number(st.qtyMode);
  };

  const handleWhatsAppQuote = (shape: WholesaleShape) => {
    const st = shapeStates[shape.id] || { sizeIndex: 0, qtyMode: 50, customQty: 50 };
    const selectedSize = shape.sizes[st.sizeIndex];
    const qty = getEffectiveQty(shape.id);
    const { unitPrice, total, discountPercent } = calculateWholesalePrice(selectedSize.retailPrice, qty);

    const message = 
      `Hi KRIA Studio! 👋 I would like a Wholesale / Bulk Quotation for:\n\n` +
      `• Shape: ${shape.name} (${shape.code})\n` +
      `• Size: ${selectedSize.label} (${selectedSize.dimensions})\n` +
      `• Quantity: ${qty} pcs\n` +
      `• Factory Wholesale Rate: ₹${unitPrice}/pc (${discountPercent}% OFF)\n` +
      `• Estimated Total: ₹${total.toLocaleString('en-IN')}\n\n` +
      `Please share your official GST invoice estimate, digital proof mockups, and estimated delivery timeline.`;

    window.open(`https://wa.me/919392576792?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddToCart = (shape: WholesaleShape) => {
    if (!onAddToCart) return;
    const st = shapeStates[shape.id] || { sizeIndex: 0, qtyMode: 50, customQty: 50 };
    const selectedSize = shape.sizes[st.sizeIndex];
    const qty = getEffectiveQty(shape.id);
    const { unitPrice } = calculateWholesalePrice(selectedSize.retailPrice, qty);

    const cartItem: CartItem = {
      id: `wholesale-${shape.id}-${selectedSize.label.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`,
      shapeId: (['love', 'circle', 'polaroid', 'grande'].includes(shape.id) ? shape.id : 'custom') as MagnetShapeId,
      shapeName: `Wholesale ${shape.name} (${selectedSize.label})`,
      customText: `Wholesale Batch: ${qty} pcs · ₹${unitPrice}/pc`,
      quantity: qty,
      price: unitPrice,
      previewUrl: shape.image,
      photoName: `${shape.name} (${selectedSize.label}) Wholesale`,
      captionText: `Factory Direct Batch · ${qty} Pcs`,
      photoScale: 1.0,
      photoPanX: 0,
      photoPanY: 0
    };

    onAddToCart(cartItem);
    setAddedFeedback(prev => ({ ...prev, [shape.id]: true }));
    setTimeout(() => {
      setAddedFeedback(prev => ({ ...prev, [shape.id]: false }));
    }, 2500);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContact || !formPhone || !formEmail) {
      setFormError('Please fill in your name, email, and phone / WhatsApp number.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/b2b/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formCompany.trim() || 'Direct Wholesale Client',
          contactPerson: formContact.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          estimatedQuantity: Number(formQty) || 50,
          preferredShapes: [`${formShape} (${formSize})`],
          customNotes: formNotes.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit inquiry.');
      }

      setFormSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit inquiry. Please try again or chat on WhatsApp.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 font-sans pb-24">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-neutral-200/80 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-600 hover:text-black flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Retail Store</span>
          </button>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Direct Factory Sales Online
            </span>
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative p-2 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-black transition cursor-pointer shadow-xs"
                title="View Bag"
              >
                <ShoppingBag className="h-4 w-4 text-[#E8DCCF]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#6B1D2F] text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="bg-[#111111] text-white py-10 sm:py-14 px-4 text-center relative overflow-hidden border-b border-neutral-800">
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border border-amber-500/40">
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            Factory-Direct Rates · Bulk & Corporate Inquiries
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-white">
            Wholesale Acrylic <span className="italic font-serif text-[#E8DCCF]">Photo Magnets</span>
          </h1>

          <p className="font-sans text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto leading-relaxed font-light">
            Order premium 3mm cast acrylic frames with high-clarity 300 DPI UV pigment printing and neodymium magnetic backing. Select any of our 4 signature shapes, choose your size, and pick your batch quantity from <strong>50 to 1,000+ pcs</strong>.
          </p>

          <div className="pt-3 flex items-center justify-center gap-3 sm:gap-6 text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex-wrap">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 3mm Cast Acrylic</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><PackageCheck className="h-3.5 w-3.5 text-blue-400" /> Neodymium Grip</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-amber-400" /> Official GST Tax Invoicing</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-purple-400" /> Pan-India Express Delivery</span>
          </div>
        </div>
      </section>

      {/* 4 Shapes Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C4A574] font-bold">
              4 Signature Shapes
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-neutral-900 mt-0.5">
              Select Shape, Size & Quantity Tier
            </h2>
            <p className="text-xs text-neutral-500 font-sans mt-1">
              Choose between 50, 100, 250, 500, 1000 pcs or type a custom batch count.
            </p>
          </div>

          <a
            href="#inquiry-form-section"
            className="text-xs font-mono uppercase font-bold text-neutral-700 hover:text-black underline underline-offset-4 self-start sm:self-end"
          >
            ↓ Jump to Custom Quote Form
          </a>
        </div>

        {/* 4 Shapes Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHOLESALE_SHAPES.map((shape) => {
            const st = shapeStates[shape.id] || { sizeIndex: 0, qtyMode: 50, customQty: 50 };
            const selectedSize = shape.sizes[st.sizeIndex];
            const qty = getEffectiveQty(shape.id);
            const { unitPrice, total, discountPercent, savings } = calculateWholesalePrice(selectedSize.retailPrice, qty);
            const isAdded = addedFeedback[shape.id];

            return (
              <div
                key={shape.id}
                className="bg-white border border-neutral-200/90 hover:border-neutral-900 rounded-3xl p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badge & Silhouette Image */}
                  <div className="relative aspect-[4/3] bg-[#FAF8F5] rounded-2xl overflow-hidden p-4 flex items-center justify-center border border-neutral-100 group">
                    <span className="absolute top-2.5 left-2.5 font-mono text-[9px] font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 rounded-md">
                      {shape.code}
                    </span>
                    <span className="absolute top-2.5 right-2.5 font-mono text-[9px] font-bold uppercase bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-md">
                      {shape.tag}
                    </span>

                    <img
                      src={shape.image}
                      alt={shape.name}
                      className="w-auto max-h-[85%] object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-serif text-xl font-medium text-neutral-950">
                      {shape.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-light mt-1 line-clamp-2 leading-relaxed">
                      {shape.description}
                    </p>
                  </div>

                  {/* 1. Size Selection */}
                  <div className="space-y-1.5 pt-1 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-500 font-bold">
                      <span>Available Sizes</span>
                      <span className="text-neutral-400 font-normal">Choose dimension</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {shape.sizes.map((sz, idx) => (
                        <button
                          key={sz.label}
                          type="button"
                          onClick={() => handleSizeChange(shape.id, idx)}
                          className={`py-1.5 px-1 rounded-xl text-xs font-mono font-bold text-center transition cursor-pointer border ${
                            st.sizeIndex === idx
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                              : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Quantity Selection: 50, 100, 250, 500, 1000 or Custom */}
                  <div className="space-y-1.5 pt-1 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-500 font-bold">
                      <span>Batch Quantity</span>
                      <span className="text-emerald-700 font-bold">{qty} Pcs</span>
                    </div>

                    {/* Preset buttons */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {PRESET_QUANTITIES.map((pQty) => (
                        <button
                          key={pQty}
                          type="button"
                          onClick={() => handleQtyModeSelect(shape.id, pQty)}
                          className={`py-1.5 px-1 rounded-xl text-xs font-mono font-bold text-center transition cursor-pointer border ${
                            st.qtyMode === pQty
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                              : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                          }`}
                        >
                          {pQty} pcs
                        </button>
                      ))}

                      {/* Custom Button */}
                      <button
                        type="button"
                        onClick={() => handleQtyModeSelect(shape.id, 'custom')}
                        className={`py-1.5 px-1 rounded-xl text-xs font-mono font-bold text-center transition cursor-pointer border ${
                          st.qtyMode === 'custom'
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    {/* Custom Input Drawer when 'custom' is active */}
                    {st.qtyMode === 'custom' && (
                      <div className="mt-2 p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 space-y-1.5 animate-in fade-in duration-200">
                        <label className="text-[10px] font-mono text-neutral-600 uppercase font-semibold block">
                          Enter Custom Quantity (Min 25):
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCustomQtyChange(shape.id, st.customQty - 25)}
                            disabled={st.customQty <= 25}
                            className="p-1.5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min="25"
                            max="10000"
                            step="25"
                            value={st.customQty}
                            onChange={(e) => handleCustomQtyChange(shape.id, parseInt(e.target.value) || 25)}
                            className="flex-1 bg-white border border-neutral-300 rounded-lg py-1 px-2 text-center font-mono text-xs font-bold focus:outline-none focus:border-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleCustomQtyChange(shape.id, st.customQty + 25)}
                            className="p-1.5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Live Pricing Calculation Box */}
                  <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-neutral-200/80 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="font-mono text-xl font-bold text-neutral-950">
                          ₹{unitPrice}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 line-through ml-1.5">
                          ₹{selectedSize.retailPrice}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase ml-1">
                          / pc
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {discountPercent}% OFF
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-neutral-200/60 flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-500">Total ({qty} pcs):</span>
                      <span className="font-bold text-neutral-900 text-sm">
                        ₹{total.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {savings > 0 && (
                      <div className="text-[9.5px] font-mono text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-100 flex items-center justify-between">
                        <span>Factory Direct Savings:</span>
                        <span className="font-bold">₹{savings.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Action Buttons */}
                <div className="space-y-2 pt-4">
                  {/* WhatsApp Quote Button */}
                  <button
                    type="button"
                    onClick={() => handleWhatsAppQuote(shape)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-mono text-xs uppercase font-bold tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
                    <span>Get WhatsApp Quote</span>
                  </button>

                  {/* Add to Bag Button */}
                  {onAddToCart && (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(shape)}
                      className={`w-full py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 border ${
                        isAdded
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Batch Added to Bag!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Batch to Bag</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Wholesale Features Highlights */}
        <section className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-2 text-left">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-[#C4A574] flex items-center justify-center border border-amber-200/60">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-neutral-900">Custom Corporate Branding</h4>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              Add custom company logos, client appreciation text, or laser-engraved backing foil for executive and VIP gifts.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-2 text-left">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <PackageCheck className="h-5 w-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-neutral-900">Luxury Individual Gift Packaging</h4>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              Every bulk magnet can be packed in rigid bespoke gift boxes with ribbon closures and thank-you cards for weddings or events.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-2 text-left">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="font-serif text-lg font-bold text-neutral-900">GST Invoice & Tax Input Credit</h4>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              We provide formal 18% GST tax invoices with your corporate GSTIN and company legal name for corporate accounting input credit.
            </p>
          </div>
        </section>

        {/* Direct Factory Inquiry Form Section */}
        <section id="inquiry-form-section" className="mt-14 scroll-mt-24">
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-lg overflow-hidden grid lg:grid-cols-12">
            
            {/* Left Info Panel */}
            <div className="lg:col-span-5 bg-[#141210] text-white p-8 sm:p-10 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4A574] font-bold">
                  Custom Quotations & White-Labeling
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-light text-white leading-tight">
                  Have a specific event, wedding favor, or corporate project?
                </h3>
                <p className="text-xs text-neutral-300 font-light leading-relaxed">
                  Fill in your requirements and our Hyderabad factory operations team will review your specifications, prepare custom digital mockups, and send your official quotation within 2 business hours.
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-neutral-800 text-xs font-light text-neutral-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-neutral-500 font-bold">WhatsApp Direct</span>
                    <a href="https://wa.me/919392576792" target="_blank" rel="noreferrer" className="text-white hover:underline font-mono">
                      +91 9392576792
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-neutral-500 font-bold">Response Guarantee</span>
                    <span>Within 2 hours · Mon to Sat (9 AM – 7 PM IST)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-purple-400">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono uppercase text-neutral-500 font-bold">Factory Atelier</span>
                    <span>Hyderabad, Telangana · Direct Pan-India Dispatch</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
              <h4 className="font-serif text-xl sm:text-2xl font-light text-neutral-950 mb-1">
                Wholesale Inquiry Form
              </h4>
              <p className="text-xs text-neutral-500 mb-6 font-light">
                Please provide your contact details and project specifics for factory pricing.
              </p>

              {formSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 text-center animate-in fade-in duration-300">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-serif text-lg font-bold text-emerald-950">Inquiry Received!</h5>
                    <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong>{formContact}</strong>. Our factory sales team has received your wholesale inquiry for <strong>{formQty} units</strong> of <strong>{formShape} ({formSize})</strong>.
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/919392576792?text=${encodeURIComponent(
                        `Hi KRIA Studio! I just submitted a wholesale inquiry for ${formQty} units of ${formShape}. My name is ${formContact}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs uppercase tracking-wider font-bold px-5 py-2.5 rounded-xl shadow-xs transition"
                    >
                      <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
                      <span>Chat on WhatsApp Now</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-700 uppercase font-semibold mb-1">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={formContact}
                        onChange={(e) => setFormContact(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-neutral-700 uppercase font-semibold mb-1">
                        Company / Occasion
                      </label>
                      <input
                        type="text"
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                        placeholder="Company name, Wedding, Boutique"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-700 uppercase font-semibold mb-1">
                        WhatsApp / Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-neutral-700 uppercase font-semibold mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-700 uppercase font-semibold mb-1">
                        Target Shape
                      </label>
                      <select
                        value={formShape}
                        onChange={(e) => setFormShape(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
                      >
                        <option value="Sculpted Heart">Sculpted Heart</option>
                        <option value="Minimal Circle">Minimal Circle</option>
                        <option value="Classic Polaroid">Classic Polaroid</option>
                        <option value="Statement Grande">Statement Grande</option>
                        <option value="Mixed Assorted Shapes">Mixed Assorted Shapes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-neutral-700 uppercase font-semibold mb-1">
                        Dimension / Size
                      </label>
                      <select
                        value={formSize}
                        onChange={(e) => setFormSize(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer"
                      >
                        <option value="2 × 2 inch">2 × 2 inch</option>
                        <option value="3 × 3 inch">3 × 3 inch</option>
                        <option value="4 × 4 inch">4 × 4 inch</option>
                        <option value="2 × 3 inch">2 × 3 inch</option>
                        <option value="3 × 4 inch">3 × 4 inch</option>
                        <option value="4 × 6 inch">4 × 6 inch</option>
                        <option value="Custom Laser Cut">Custom Laser Cut</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-neutral-700 uppercase font-semibold mb-1">
                        Estimated Quantity
                      </label>
                      <input
                        type="number"
                        min="25"
                        max="20000"
                        step="25"
                        value={formQty}
                        onChange={(e) => setFormQty(parseInt(e.target.value) || 50)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-mono font-bold focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-700 uppercase font-semibold mb-1">
                      Project Notes & Custom Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="e.g. Wedding favor date is Nov 25th, need individual luxury ribbon gift boxes, or company logo on reverse..."
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-black text-white font-mono text-xs uppercase font-bold tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    <span>{formSubmitting ? 'Submitting to Factory...' : 'Submit Wholesale Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
