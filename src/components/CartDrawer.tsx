import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Trash2, Plus, Minus, Lock, ShoppingBag, 
  Sparkles, Truck, ArrowRight, Check, MessageSquare 
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
  const [pincode, setPincode] = useState<string>('');
  const [pincodeVerified, setPincodeVerified] = useState<boolean>(false);
  const [isEditingPincode, setIsEditingPincode] = useState<boolean>(true);
  const [pincodeMessage, setPincodeMessage] = useState<string>('Enter delivery pincode');
  const [isVerifyingPincode, setIsVerifyingPincode] = useState<boolean>(false);

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
      setPincodeVerified(false);
      return;
    }

    setIsVerifyingPincode(true);
    try {
      const response = await fetch('/api/shiprocket/check-serviceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: cleanPin, orderValue: grandTotal, weight: 0.25 * Math.max(1, cart.length) })
      });
      const data = await response.json();
      if (response.ok && data.serviceable) {
        setPincodeVerified(true);
        setPincodeMessage(`${data.courierName || 'Express Air'} (${data.estimatedDays || 2-3} Days to ${data.region || 'Dest'})`);
        setIsEditingPincode(false);
      } else {
        setPincodeVerified(false);
        setPincodeMessage(data.error || 'Pincode not serviceable');
      }
    } catch (err: any) {
      setPincodeVerified(true);
      setPincodeMessage('Express Air (2-3 Days)');
      setIsEditingPincode(false);
    } finally {
      setIsVerifyingPincode(false);
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

        {/* Dynamic Free Shipping Threshold Bar */}
        <div className="bg-[#E8DCCF]/20 px-6 py-2.5 border-b border-[#E8DCCF]/40 text-xs text-neutral-700 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-2 font-medium">
            <Truck className="h-3.5 w-3.5 text-neutral-900" />
            <span>🚚 FREE Express Shipping (Orders Over ₹699)</span>
          </span>
          {cartSubtotal >= 699 ? (
            <span className="text-emerald-800 font-bold text-[11px]">✓ Unlocked</span>
          ) : (
            <span className="text-amber-900 font-mono text-[10px] font-bold">Add ₹{699 - cartSubtotal} more</span>
          )}
        </div>

        {/* Drawer Body - PRODUCTS LIST */}
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
                        {/* Direct Editable Quantity Input for Bulk & Single Orders */}
                        <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) onRemoveItem(item.id);
                              else onUpdateQuantity(item.id, item.quantity - 1);
                            }}
                            className="p-1.5 px-2 hover:bg-neutral-100 text-neutral-600 transition cursor-pointer"
                            title="Decrease Quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={999}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              onUpdateQuantity(item.id, val);
                            }}
                            className="w-12 font-mono text-xs font-bold text-center border-x border-neutral-200 outline-none bg-white py-1"
                          />
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 px-2 hover:bg-neutral-100 text-neutral-600 transition cursor-pointer"
                            title="Increase Quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* 1-Click Remove Trash Button */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition cursor-pointer flex items-center gap-1 font-sans text-[11px]"
                          title="Remove entire item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Drawer Footer - Dynamic Delivery, Coupon & Sticky Checkout */}
        {cart.length > 0 && (
          <div className="bg-white border-t border-neutral-200/80 px-6 py-4 space-y-3.5 shrink-0 shadow-lg">
            
            {/* Dynamic Interactive Delivery Pincode Verification */}
            <div className="space-y-1.5 border-b border-neutral-100 pb-3">
              <div className="flex items-center justify-between text-xs text-neutral-700 font-sans">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span>📍 Deliver to:</span>
                  <strong className="font-mono text-neutral-900">{pincode || 'Pincode'}</strong>
                  {pincodeVerified && <Check className="h-3.5 w-3.5 text-emerald-600 font-bold shrink-0" />}
                </div>
                <button 
                  type="button"
                  onClick={() => setIsEditingPincode(!isEditingPincode)}
                  className="text-[11px] font-medium text-neutral-900 underline hover:text-black cursor-pointer shrink-0"
                >
                  {isEditingPincode ? 'Done' : 'Check Pincode'}
                </button>
              </div>

              {isEditingPincode ? (
                <form onSubmit={handleCheckPincode} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincode(val);
                      if (val.length === 6) handleCheckPincode();
                    }}
                    placeholder="Enter 6-digit Pincode"
                    className="flex-1 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="submit"
                    disabled={isVerifyingPincode}
                    className="bg-neutral-900 hover:bg-black text-white text-xs px-3.5 py-1.5 rounded-lg font-medium cursor-pointer disabled:opacity-60"
                  >
                    {isVerifyingPincode ? 'Checking...' : 'Check'}
                  </button>
                </form>
              ) : (
                <p className="text-[11px] font-mono text-neutral-500">{pincodeMessage}</p>
              )}
            </div>

            {/* Streamlined Coupon Row */}
            <div className="border-b border-neutral-100 pb-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">Promo Coupon:</span>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-800">✓ {appliedCoupon.code} (-₹{appliedCoupon.discount})</span>
                    <button onClick={() => setAppliedCoupon(null)} className="text-[10px] text-neutral-400 hover:text-red-600 underline cursor-pointer">Remove</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleApplyCouponCode('KRIA10')} className="text-[11px] font-mono text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded transition cursor-pointer">
                      ✓ KRIA10
                    </button>
                    <button onClick={() => handleApplyCouponCode('FREESHIP')} className="text-[11px] font-mono text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded transition cursor-pointer">
                      ✓ FREESHIP
                    </button>
                    <button onClick={() => setShowCouponInput(!showCouponInput)} className="text-[11px] underline text-neutral-900 font-medium ml-1 cursor-pointer">
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
                  <button type="submit" disabled={isApplyingCoupon} className="bg-neutral-900 text-white text-xs px-3.5 py-1.5 rounded-lg font-medium cursor-pointer">
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && <p className="text-[10px] font-mono text-red-600">{couponError}</p>}
            </div>

            {/* Price Summary */}
            <div className="space-y-1 text-xs font-sans">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="font-mono">₹{cartSubtotal}</span>
              </div>
              {bulkDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>10+ Bulk Discount (15%)</span>
                  <span className="font-mono">-₹{bulkDiscount}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-₹{appliedCoupon.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>Express Delivery</span>
                <span className="font-mono">{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
              </div>
            </div>

            {/* Primary Action Button: Proceed to Online Checkout */}
            <button
              type="button"
              onClick={() => onProceedToCheckout(appliedCoupon)}
              className="w-full bg-[#111111] hover:bg-black text-[#FAF8F5] py-3.5 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between transition shadow-md active:scale-98 cursor-pointer"
            >
              <span>₹{grandTotal}</span>
              <span className="flex items-center gap-2">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>

            {/* 1-Click Fast-Track Order via WhatsApp */}
            <button
              type="button"
              onClick={() => {
                const itemsText = cart.map(item => `- ${item.shapeName} (Qty: ${item.quantity}, ₹${item.price * item.quantity})`).join('%0A');
                const waMessage = `Hi KRIA Studio! 👋 I want to place an order:%0A%0A*Items:*%0A${itemsText}%0A%0A*Total Amount:* ₹${grandTotal}%0A*Pincode:* ${pincode || 'India'}`;
                window.open(`https://wa.me/919392576792?text=${waMessage}`, '_blank');
              }}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 fill-white" />
              <span>1-Click Order via WhatsApp</span>
            </button>

          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
