import React, { useState } from 'react';
import { X, Gift, Check, Sparkles, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

interface BOGOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomize: () => void;
  onShopReturnGifts: () => void;
  onApplyCoupon?: (code: string) => void;
}

export default function BOGOModal({
  isOpen,
  onClose,
  onCustomize,
  onShopReturnGifts,
  onApplyCoupon
}: BOGOModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText('BOGO');
    setCopied(true);
    if (onApplyCoupon) onApplyCoupon('BOGO');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] text-neutral-900 rounded-[2rem] border border-[#E8DCCF] shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-black transition cursor-pointer"
          aria-label="Close offer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Badge & Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#9E1B32] to-[#D4AF37] flex items-center justify-center shadow-lg text-white">
            <Gift className="h-8 w-8 animate-bounce" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9E1B32]/10 text-[#9E1B32] text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Meta Launch Special
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-light leading-tight text-neutral-950">
            Buy 1, Get 1 <span className="italic font-serif font-bold text-[#9E1B32]">FREE!</span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-sm leading-relaxed">
            Celebrate our studio opening! Add any 2 custom magnetic acrylic fridge frames to your bag and get the second one completely on us.
          </p>

          {/* Promo Code Box */}
          <div className="w-full bg-white border-2 border-dashed border-[#D4AF37] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">Coupon Code</span>
              <div className="font-mono text-xl font-bold tracking-widest text-[#9E1B32]">BOGO</div>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Applied</span>
                </>
              ) : (
                <span>Copy & Apply</span>
              )}
            </button>
          </div>

          {/* Guarantee Highlights */}
          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-neutral-200/70 text-left">
              <Truck className="h-4 w-4 text-[#A38A6E] shrink-0" />
              <div className="text-[11px] leading-tight text-neutral-700">
                <span className="font-semibold block">Free Shipping</span>
                <span className="text-neutral-400 text-[10px]">On orders ₹699+</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-neutral-200/70 text-left">
              <ShieldCheck className="h-4 w-4 text-[#A38A6E] shrink-0" />
              <div className="text-[11px] leading-tight text-neutral-700">
                <span className="font-semibold block">3mm Cast Acrylic</span>
                <span className="text-neutral-400 text-[10px]">Laser-cut in India</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onCustomize();
              }}
              className="w-full rounded-full bg-neutral-900 text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>Customize Your Frame Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onShopReturnGifts();
              }}
              className="w-full rounded-full bg-transparent text-neutral-700 hover:text-black py-2.5 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
            >
              Browse Return Gifts Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
