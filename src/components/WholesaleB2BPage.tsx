import React, { useState } from 'react';
import { ShoppingBag, Check, Plus, Minus, ArrowLeft, Building2, ShieldCheck, Sparkles, FileText } from 'lucide-react';
import { CartItem } from '../types';

interface WholesaleB2BPageProps {
  onBackToHome: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenCart: () => void;
  cartCount: number;
}

interface B2BProduct {
  id: string;
  name: string;
  code: string;
  moq: number;
  magnetSpec: string;
  image: string;
  sizes: { label: string; price: number }[];
}

const B2B_PRODUCTS: B2BProduct[] = [
  {
    id: 'b2b-rectangle',
    name: 'Rectangle Magnet',
    code: 'Rctgl-8x12',
    moq: 5,
    magnetSpec: '6x2 mm',
    image: '/images/scenic_landscape_sample_1782458156606.jpg',
    sizes: [
      { label: '3.5x2.5"', price: 190 },
      { label: '4x3"', price: 240 },
      { label: '4x6"', price: 320 },
      { label: '8x12"', price: 590 }
    ]
  },
  {
    id: 'b2b-round',
    name: 'Round Magnet',
    code: 'RND-4',
    moq: 5,
    magnetSpec: '5x2 mm',
    image: '/images/shape_circle_magnet_1780939399489.png',
    sizes: [
      { label: '2"', price: 52 },
      { label: '3"', price: 99 },
      { label: '4"', price: 149 }
    ]
  },
  {
    id: 'b2b-square',
    name: 'Square Magnet',
    code: 'SQR-4',
    moq: 5,
    magnetSpec: '5x2 mm',
    image: '/images/shape_polaroid_magnet_1780939416510.png',
    sizes: [
      { label: '2x2"', price: 52 },
      { label: '3x3"', price: 99 },
      { label: '4x4"', price: 149 }
    ]
  },
  {
    id: 'b2b-heart',
    name: 'Heart Magnet',
    code: 'HRT-4',
    moq: 5,
    magnetSpec: '5x2 mm',
    image: '/images/shape_heart_magnet_1780939430998.png',
    sizes: [
      { label: '2"', price: 52 },
      { label: '3"', price: 99 },
      { label: '4"', price: 149 }
    ]
  }
];

export default function WholesaleB2BPage({ onBackToHome, onAddToCart, onOpenCart, cartCount }: WholesaleB2BPageProps) {
  // Store selected size index and quantity state per product
  const [productStates, setProductStates] = useState<{ [key: string]: { selectedSizeIndex: number; quantity: number } }>({
    'b2b-rectangle': { selectedSizeIndex: 0, quantity: 5 },
    'b2b-round': { selectedSizeIndex: 0, quantity: 5 },
    'b2b-square': { selectedSizeIndex: 0, quantity: 5 },
    'b2b-heart': { selectedSizeIndex: 0, quantity: 5 }
  });

  const [addedFeedback, setAddedFeedback] = useState<{ [key: string]: boolean }>({});

  const handleSizeSelect = (productId: string, index: number) => {
    setProductStates(prev => ({
      ...prev,
      [productId]: { ...prev[productId], selectedSizeIndex: index }
    }));
  };

  const handleQtyChange = (productId: string, delta: number) => {
    setProductStates(prev => {
      const currentQty = prev[productId]?.quantity || 5;
      const newQty = Math.max(5, currentQty + delta); // MOQ 5 enforcement
      return {
        ...prev,
        [productId]: { ...prev[productId], quantity: newQty }
      };
    });
  };

  const handleAddProductToCart = (product: B2BProduct) => {
    const state = productStates[product.id] || { selectedSizeIndex: 0, quantity: 5 };
    const selectedSizeObj = product.sizes[state.selectedSizeIndex];
    
    const cartItem: CartItem = {
      id: `${product.id}-${selectedSizeObj.label}-${Date.now()}`,
      shapeId: 'custom',
      shapeName: `B2B ${product.name} (${selectedSizeObj.label})`,
      customText: `Size: ${selectedSizeObj.label} (MOQ: ${product.moq})`,
      quantity: state.quantity,
      price: selectedSizeObj.price,
      previewUrl: product.image,
      photoName: `${product.name} (${selectedSizeObj.label})`,
      captionText: `MOQ ${product.moq} Pcs`,
      photoScale: 1.0,
      photoPanX: 0,
      photoPanY: 0
    };

    onAddToCart(cartItem);

    setAddedFeedback(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedFeedback(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 font-sans pb-24 select-none">
      
      {/* Top Header Bar */}
      <header className="bg-white border-b border-neutral-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-700 hover:text-black flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Retail Store</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="font-serif italic font-bold text-sm text-[#111111] hidden sm:inline">
              KRIA Studio B2B Direct
            </span>
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-black transition cursor-pointer"
              title="View Wholesale Cart"
            >
              <ShoppingBag className="h-4.5 w-4.5 text-[#E8DCCF]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#6B1D2F] text-white font-mono text-[9px] font-bold h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-[#111111] text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border border-amber-500/40">
            <Building2 className="h-3.5 w-3.5 text-amber-400" />
            B2B Wholesale & Bulk Supply Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-white">
            Direct Factory Bulk Supply for <span className="italic font-serif text-[#E8DCCF]">Businesses & Resellers</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Order raw acrylic magnet stock or custom UV printed bulk orders directly with Tiered Volume Discounts starting at <strong>MOQ 5 Pcs</strong>. GST Invoicing provided.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4 text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex-wrap">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 100% High-Grade Neodymium Magnets</span>
            <span>•</span>
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-amber-400" /> Tax GST Invoice Available</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-amber-300" /> Tiered Bulk Discounts</span>
          </div>
        </div>
      </section>

      {/* 4 Wholesale Product Grid (Matching Exact B2B Reference Picture) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        <div className="text-left mb-6">
          <h2 className="font-serif text-2xl font-bold text-neutral-900">Wholesale Acrylic Magnet Shapes</h2>
          <p className="text-xs text-neutral-500 font-sans mt-1">Select size and bulk quantity below (Minimum Order Quantity: 5 pcs/item)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {B2B_PRODUCTS.map((product) => {
            const state = productStates[product.id] || { selectedSizeIndex: 0, quantity: 5 };
            const selectedSize = product.sizes[state.selectedSizeIndex];
            const isAdded = addedFeedback[product.id];
            const currentItemTotal = selectedSize.price * state.quantity;

            return (
              <div
                key={product.id}
                className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Badge & Image */}
                  <div className="relative w-full aspect-[4/3] bg-[#FAF8F5] rounded-xl overflow-hidden mb-3 p-3 flex items-center justify-center border border-neutral-100">
                    <span className="absolute top-2 left-2 font-mono text-[9px] font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 rounded">
                      {product.code}
                    </span>
                    <span className="absolute top-2 right-2 font-mono text-[9px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      MOQ {product.moq}
                    </span>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-auto max-h-[85%] object-contain drop-shadow-md rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Title & Available Sizes Header */}
                  <div className="space-y-1 text-left">
                    <h3 className="font-serif text-lg font-bold text-neutral-900">{product.name}</h3>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                      <span>{product.sizes.length} sizes available</span>
                      <span className="text-amber-800 font-bold uppercase">MOQ {product.moq}</span>
                    </div>

                    {/* Size Selector Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                      {product.sizes.map((sizeObj, idx) => (
                        <button
                          key={sizeObj.label}
                          onClick={() => handleSizeSelect(product.id, idx)}
                          className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold transition cursor-pointer ${
                            state.selectedSizeIndex === idx
                              ? 'bg-[#111111] text-white shadow-xs'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
                          }`}
                        >
                          {sizeObj.label}
                        </button>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 flex items-baseline gap-1">
                      <span className="font-mono text-xl font-bold text-neutral-900">₹{selectedSize.price}</span>
                      <span className="font-mono text-[10px] text-neutral-500 uppercase">/ pc base price</span>
                    </div>

                    <div className="text-[10px] font-mono text-neutral-400">
                      Magnet Spec: {product.magnetSpec}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="pt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-neutral-50">
                        <button
                          onClick={() => handleQtyChange(product.id, -5)}
                          disabled={state.quantity <= 5}
                          className="px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-200 disabled:opacity-40 transition cursor-pointer"
                          title="Decrease by 5"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs font-bold px-3 min-w-[32px] text-center">
                          {state.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(product.id, 5)}
                          className="px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-200 transition cursor-pointer"
                          title="Increase by 5"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="block text-[9px] font-mono text-neutral-400 uppercase">Batch Subtotal</span>
                        <span className="font-mono text-xs font-bold text-neutral-900">₹{currentItemTotal}</span>
                      </div>
                    </div>

                    {/* Volume Nudge Banner */}
                    <div className="pt-2 text-[9.5px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      ✨ {state.quantity >= 50 ? 'Unlocked 15% Bulk Discount!' : state.quantity >= 10 ? 'Unlocked 8% Bulk Discount!' : 'Add 5 more pcs to unlock 8% off'}
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddProductToCart(product)}
                  className={`mt-4 w-full py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                    isAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#111111] hover:bg-black text-white active:scale-95'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Added to Wholesale Cart!
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* B2B Instant WhatsApp Bulk Direct Quotation */}
        <section className="mt-12 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              ⚡ FAST TRACK WHOLESALE INQUIRY
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-neutral-900">Need Custom Sizes, White-Labeling, or 500+ Pcs?</h3>
            <p className="font-sans text-xs text-neutral-600 leading-relaxed">
              Contact our factory team directly on WhatsApp for white-label acrylic printing, custom acrylic laser cuts, and custom wholesale rate cards.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919392576792?text=Hi%20KRIA%20Studio!%20I%20want%20to%20place%20a%20Bulk%20B2B%20Wholesale%20Order%20for%20acrylic%20magnets."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs uppercase tracking-wider font-bold px-6 py-3.5 rounded-full shadow-md transition"
              >
                💬 Chat with B2B Factory Team (+91 9392576792)
              </a>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
