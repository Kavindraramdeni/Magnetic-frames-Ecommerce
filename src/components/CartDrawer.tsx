import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Trash2, Plus, Minus, Lock, ShoppingBag, 
  Sparkles, Truck, ShieldCheck, CreditCard, ArrowRight 
} from 'lucide-react';
import { CartItem } from '../types';
import BrandLogo from './BrandLogo';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout
}: CartDrawerProps) {
  const [pincode, setPincode] = useState<string>('500085');
  const [pincodeMessage, setPincodeMessage] = useState<string>('✅ Verified for 500085 (Hyderabad): Telangana Air Express via Shiprocket — Estimated 2–3 Days');
  
  // Coupon State
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; label: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const response = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponInput, cart })
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          label: data.label,
          discount: data.couponDiscount
        });
        setCouponError(null);
      } else {
        setCouponError(data.error || 'Invalid promotional coupon code.');
      }
    } catch (err: any) {
      setCouponError('Unable to validate coupon.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Disable body scroll & add Escape key listener when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Pricing calculations
  const cartItemCount = cart.reduce((acc, x) => acc + x.quantity, 0);
  const cartSubtotal = cart.reduce((acc, x) => acc + (x.price * x.quantity), 0);
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const deliveryCharge = cartSubtotal === 0 ? 0 : (cartSubtotal >= 699 ? 0 : 60);
  const amountNeededForFreeShipping = Math.max(0, 699 - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / 699) * 100));
  const grandTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryCharge);

  return createPortal(
    <div className="fixed inset-0 z-[150] flex justify-end overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-[#FAF8F5] shadow-2xl h-full flex flex-col z-10 border-l border-neutral-200 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="bg-neutral-900 p-4 sm:p-5 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShoppingBag className="h-5.5 w-5.5 text-[#E8DCCF]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#B09A84] text-white text-[9px] font-bold font-mono h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-light tracking-wide text-white">
                Design <span className="italic font-normal font-serif text-[#E8DCCF]">Tray Cart</span>
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Curate Your Custom Magnet Set</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-neutral-300 hover:text-white"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress Banner */}
        <div className="bg-[#E8DCCF]/30 p-3 px-5 border-b border-[#E8DCCF]/60 text-xs font-sans text-neutral-800 flex flex-col gap-1.5 shrink-0">
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="flex items-center gap-1 font-bold text-neutral-900">
              <Truck className="h-3.5 w-3.5 text-[#6B1D2F]" />
              {amountNeededForFreeShipping === 0 ? (
                <span className="text-emerald-800 font-bold">🎉 UNLOCKED FREE EXPRESS SHIPPING!</span>
              ) : (
                <span>Add ₹{amountNeededForFreeShipping} more for FREE Delivery</span>
              )}
            </span>
            <span className="font-bold text-neutral-500">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#6B1D2F] h-full rounded-full transition-all duration-500" 
              style={{ width: `${freeShippingProgress}%` }} 
            />
          </div>
        </div>

        {/* Drawer Body - Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in duration-300">
              <div className="p-5 bg-neutral-100 rounded-full text-neutral-400">
                <ShoppingBag className="h-10 w-10 stroke-[1.25]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-neutral-800 font-light">Your Tray is Empty</h4>
                <p className="font-sans text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Start creating and customizing your precious photo magnets in our Live Design Studio!
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-sans tracking-widest font-extrabold uppercase px-6 py-3 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Start Designing
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60">
                <span className="font-sans text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  LISTED DESIGNS ({cartItemCount})
                </span>
                <button
                  onClick={onClearCart}
                  className="font-mono text-[10px] text-red-500 hover:text-red-700 tracking-wider font-semibold uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear all
                </button>
              </div>

              {/* Cart List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div 
                    key={item.id}
                    className="group relative flex items-center justify-between p-3.5 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-400 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      {/* Interactive miniature preview shape */}
                      <div className={`h-14 w-14 shrink-0 overflow-hidden relative shadow-md border-2 border-white bg-neutral-100 ${
                        item.shapeId === 'circle' || item.shapeId === 'circle-bloom' ? 'rounded-full' : 'rounded-xl'
                      }`}>
                        <img 
                          src={item.previewUrl} 
                          alt={item.shapeName} 
                          className="h-full w-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                        {/* 3D Acrylic reflection gloss shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/35 to-white/0 opacity-40 pointer-events-none mix-blend-overlay" />
                        <div className="absolute inset-0 shadow-[inset_0_1px_4px_rgba(0,0,0,0.15)] pointer-events-none" />
                      </div>

                      {/* Design specs */}
                      <div className="overflow-hidden space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-serif font-extrabold text-neutral-900 text-xs sm:text-sm">
                            {item.shapeName}
                          </h5>
                          <span className="font-mono text-[8px] px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded uppercase font-bold shrink-0">
                            ₹{item.price}
                          </span>
                        </div>
                        {item.captionText && (
                          <p className="font-serif italic text-neutral-600 text-[10px] truncate max-w-[180px]">
                            Caption: "{item.captionText}"
                          </p>
                        )}
                        <p className="font-mono text-[9px] text-neutral-400 truncate max-w-[180px]">
                          Photo: {item.photoName}
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div className="flex flex-col items-end gap-2 font-mono shrink-0">
                      <span className="font-extrabold text-neutral-900 text-xs">
                        ₹{item.price * item.quantity}
                      </span>
                      
                      <div className="flex items-center border border-neutral-200 bg-neutral-50/50 rounded-lg overflow-hidden shrink-0">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 px-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
                          title="Decrease Quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 font-mono text-[11px] font-bold text-neutral-800 min-w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 px-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
                          title="Increase Quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Quick remove trigger on hover */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute -top-1.5 -left-1.5 bg-neutral-950 text-white hover:bg-red-500 border border-neutral-800 hover:border-red-600 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer shadow-md text-[10px] font-mono transition-colors"
                      title="Delete Design"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Summary Block */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-neutral-200 p-4 sm:p-5 shrink-0 space-y-4 shadow-inner">
            
            {/* Pincode & Delivery Calculator */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-neutral-700 uppercase tracking-wider text-[10px]">
                  Check Shipping Pincode
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold font-mono">
                  Shiprocket Logistics
                </span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 110001 (Delhi)"
                  className="flex-1 bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-mono font-medium focus:outline-none focus:border-neutral-800"
                />
                <button
                  type="submit"
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition"
                >
                  Verify
                </button>
              </form>
              {pincodeMessage && (
                <p className="text-[10px] font-sans text-neutral-600 leading-tight">
                  {pincodeMessage}
                </p>
              )}
            </div>

            {/* Promo Coupon Discount Box */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-neutral-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#6B1D2F]" />
                  Apply Promo Coupon
                </span>
                <span className="text-[9px] text-neutral-400 font-mono">Try: KRIA10 / WELCOME15</span>
              </div>
              
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-mono font-bold text-emerald-900 leading-none">{appliedCoupon.code} Applied!</p>
                    <p className="text-[10px] text-emerald-700 font-sans mt-0.5">{appliedCoupon.label} (-₹{appliedCoupon.discount})</p>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-emerald-700 hover:text-emerald-900 font-mono text-[10px] underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter KRIA10"
                    className="flex-1 bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold uppercase focus:outline-none focus:border-neutral-800"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="bg-[#6B1D2F] hover:bg-[#521523] text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer transition disabled:opacity-50"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[10px] font-mono text-red-600 leading-tight">{couponError}</p>
              )}
            </div>

            {/* Pricing Details List */}
            <div className="space-y-1.5 text-xs text-[#666666]">
              <div className="flex justify-between font-light">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-black">₹{cartSubtotal}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Coupon ({appliedCoupon.code}):</span>
                  <span className="font-mono">-₹{appliedCoupon.discount}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center font-light">
                <span className="flex items-center gap-1">
                  Express Delivery:
                  <span className="text-[9px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-200">
                    Standard Rate
                  </span>
                </span>
                <span className="font-mono font-medium text-black">
                  ₹{deliveryCharge}
                </span>
              </div>

              <p className="text-[10px] text-neutral-500 font-sans leading-tight bg-neutral-50 border border-neutral-200/60 p-2 rounded-lg">
                📦 <strong>Delivery Time:</strong> 2–4 business days via insured express air courier across India.
              </p>

              <div className="h-[1px] bg-neutral-100 my-2" />
              
              <div className="flex justify-between text-sm text-neutral-900 font-semibold items-baseline">
                <span className="font-serif italic font-medium text-neutral-800">Grand Total:</span>
                <span className="font-mono text-lg font-bold text-neutral-900">₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout CTAs */}
            <div className="space-y-2">
              <button
                onClick={onProceedToCheckout}
                className="w-full bg-[#111111] hover:bg-neutral-800 text-[#FAF8F5] transition-all py-3.5 rounded-full text-xs font-sans tracking-widest font-extrabold uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.98]"
              >
                <Lock className="h-3.5 w-3.5 text-[#E8DCCF]" />
                Proceed to Checkout (₹{grandTotal})
              </button>
              
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                className="w-full text-center py-2 text-[10px] font-mono font-bold tracking-widest text-neutral-500 hover:text-neutral-800 uppercase flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <span>Continue Designing</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
