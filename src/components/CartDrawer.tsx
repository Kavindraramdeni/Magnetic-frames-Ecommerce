import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Trash2, Plus, Minus, Lock, ShoppingBag, 
  Sparkles, Truck, ArrowRight, Check 
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: (coupon: { code: string; label: string; discount: number } | null) => void;
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
  const [pincodeVerified, setPincodeVerified] = useState<boolean>(true);
  const [isEditingPincode, setIsEditingPincode] = useState<boolean>(false);
  const [pincodeMessage, setPincodeMessage] = useState<string>('Express Air (2-3 Days)');

  // Coupon State
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; label: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);

  const handleApplyCouponCode = async (codeToApply: string) => {
    if (!codeToApply.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const response = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: codeToApply, cart })
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          label: data.label,
          discount: data.couponDiscount
        });
        setCouponError(null);
        setShowCouponInput(false);
      } else {
        setCouponError(data.error || 'Valid on orders over ₹499.');
      }
    } catch (err: any) {
      setCouponError('Unable to validate coupon.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckPincode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pincode.trim();
    if (cleanPin.length !== 6 || !/^\d+$/.test(cleanPin)) {
      setPincodeMessage('Enter valid 6-digit pincode');
      return;
    }

    try {
      const response = await fetch('/api/shiprocket/check-serviceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: cleanPin, orderValue: grandTotal, weight: 0.25 * Math.max(1, cart.length) })
      });
      const data = await response.json();
      if (response.ok && data.serviceable) {
        setPincodeVerified(true);
        setPincodeMessage(`${data.courierName || 'Express Air'} (${data.estimatedDays || 2-3} Days)`);
        setIsEditingPincode(false);
      } else {
        setPincodeVerified(false);
        setPincodeMessage(data.error || 'Pincode unserviceable');
      }
    } catch (err: any) {
      setPincodeVerified(true);
      setIsEditingPincode(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
  const bulkDiscount = cartItemCount >= 10 ? Math.round(cartSubtotal * 0.15) : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const deliveryCharge = cartSubtotal === 0 ? 0 : (cartSubtotal >= 699 ? 0 : 60);
  const grandTotal = Math.max(0, cartSubtotal - bulkDiscount - couponDiscount + deliveryCharge);

  return createPortal(
    <div className="fixed inset-0 z-[150] flex justify-end overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel: Luxury White Space & Minimalist Layout */}
      <div className="relative w-full max-w-md bg-[#FAF8F5] text-neutral-900 shadow-2xl h-full flex flex-col z-10 border-l border-neutral-200/80 animate-in slide-in-from-right duration-300 font-sans">
        
        {/* Drawer Header */}
        <div className="p-6 pb-4 bg-[#FAF8F5] flex items-center justify-between shrink-0 border-b border-neutral-200/60">
          <div>
            <h3 className="font-serif text-2xl font-normal text-neutral-900 tracking-tight">
              Your Cart <span className="text-sm font-sans font-light text-neutral-500">({cartItemCount})</span>
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer text-neutral-500 hover:text-black"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Minimalist Shipping Banner */}
        <div className="bg-[#E8DCCF]/20 px-6 py-2.5 border-b border-[#E8DCCF]/40 text-xs text-neutral-700 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-2 font-medium">
            <Truck className="h-3.5 w-3.5 text-neutral-900" />
            <span>🚚 FREE Express Shipping (2–3 Days)</span>
          </span>
          <span className="text-emerald-800 font-bold text-[11px]">✓ Unlocked</span>
        </div>

        {/* Drawer Body - PRODUCTS FIRST (60-70% height) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <ShoppingBag className="h-12 w-12 text-neutral-300 stroke-[1]" />
              <div className="space-y-1">
                <h4 className="font-serif text-xl text-neutral-800">Your cart is empty</h4>
                <p className="text-xs text-neutral-500 font-light">Customize your precious moments in our studio.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="bg-neutral-900 text-white text-xs tracking-wider uppercase font-semibold px-6 py-3 rounded-full hover:bg-black transition cursor-pointer"
              >
                Start Designing
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Cart Items List */}
              <div className="divide-y divide-neutral-200/60">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group">
                    
                    {/* Item Thumbnail */}
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200/80 shadow-xs relative">
                      <img 
                        src={item.previewUrl || '/images/Landingprofile.png'} 
                        alt={item.shapeName} 
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/Landingprofile.png'; }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-base font-medium text-neutral-900 truncate">
                          {item.shapeName}
                        </h4>
                        <span className="font-mono text-xs font-semibold text-neutral-900">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                      
                      {item.captionText && (
                        <p className="font-serif italic text-xs text-neutral-500 truncate">
                          "{item.captionText}"
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-1">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-neutral-100 text-neutral-600 transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 font-mono text-xs font-semibold min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-neutral-100 text-neutral-600 transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove Link */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[11px] font-sans text-neutral-400 hover:text-red-600 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Drawer Footer - Streamlined Delivery, Coupon & Sticky Checkout */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-neutral-200/80 px-6 py-4 space-y-4 shrink-0 shadow-lg">
            
            {/* Delivery Pincode Row */}
            <div className="flex items-center justify-between text-xs text-neutral-700 font-sans border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-1.5">
                <span>📍 Deliver to:</span>
                <strong className="font-mono">{pincode}</strong>
                {pincodeVerified && <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />}
                <span className="text-neutral-500 font-light ml-1">({pincodeMessage})</span>
              </div>
              <button 
                onClick={() => setIsEditingPincode(!isEditingPincode)}
                className="text-[11px] font-medium text-neutral-900 underline hover:text-black cursor-pointer"
              >
                {isEditingPincode ? 'Done' : 'Change'}
              </button>
            </div>

            {isEditingPincode && (
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
                <button type="submit" className="bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg font-medium">Verify</button>
              </form>
            )}

            {/* Streamlined Coupon Row */}
            <div className="border-b border-neutral-100 pb-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">Promo Coupon:</span>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800">✓ {appliedCoupon.code} (-₹{appliedCoupon.discount})</span>
                    <button onClick={() => setAppliedCoupon(null)} className="text-[10px] text-neutral-400 hover:text-red-600 underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleApplyCouponCode('KRIA10')} className="text-[11px] font-mono text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded transition">
                      ✓ KRIA10
                    </button>
                    <button onClick={() => handleApplyCouponCode('FREESHIP')} className="text-[11px] font-mono text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded transition">
                      ✓ FREESHIP
                    </button>
                    <button onClick={() => setShowCouponInput(!showCouponInput)} className="text-[11px] underline text-neutral-900 font-medium ml-1">
                      {showCouponInput ? 'Close' : 'Enter Code'}
                    </button>
                  </div>
                )}
              </div>

              {showCouponInput && !appliedCoupon && (
                <form onSubmit={(e) => { e.preventDefault(); handleApplyCouponCode(couponInput); }} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    className="flex-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-mono uppercase"
                  />
                  <button type="submit" disabled={isApplyingCoupon} className="bg-neutral-900 text-white text-xs px-3.5 py-1.5 rounded-lg font-medium">
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && <p className="text-[10px] font-mono text-red-600">{couponError}</p>}
            </div>

            {/* Subtotal & Total Lines */}
            <div className="space-y-1.5 text-xs text-neutral-600 font-sans">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-neutral-900 font-medium">₹{cartSubtotal}</span>
              </div>
              
              {bulkDiscount > 0 && (
                <div className="flex justify-between text-neutral-900 font-medium">
                  <span>Bulk Discount (10+ items):</span>
                  <span className="font-mono text-emerald-700">-₹{bulkDiscount}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Coupon ({appliedCoupon.code}):</span>
                  <span className="font-mono">-₹{appliedCoupon.discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Express Delivery:</span>
                <span className="font-mono font-medium text-emerald-700">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
            </div>

            {/* Sticky Bottom CTA: Always Visible without Scrolling */}
            <div className="pt-2">
              <button
                onClick={() => onProceedToCheckout(appliedCoupon)}
                className="w-full bg-[#111111] hover:bg-black text-[#FAF8F5] transition-all py-4 rounded-full text-xs font-sans tracking-widest font-bold uppercase flex items-center justify-between px-6 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.98]"
              >
                <span className="font-serif italic font-normal text-sm">₹{grandTotal}</span>
                <span className="flex items-center gap-2 font-sans text-xs tracking-widest font-extrabold uppercase">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
