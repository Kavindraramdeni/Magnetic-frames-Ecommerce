import React from 'react';
import { Home, Sparkles, Gift, Image, ShoppingBag } from 'lucide-react';

interface MobileDockProps {
  active: 'home' | 'studio' | 'checkout' | 'gallery' | string;
  cartCount: number;
  onHome: () => void;
  onStudio: () => void;
  onReturnGifts?: () => void;
  onGallery?: () => void;
  onCart: () => void;
}

export default function MobileDock({
  active,
  cartCount,
  onHome,
  onStudio,
  onReturnGifts,
  onGallery,
  onCart
}: MobileDockProps) {
  const itemClass = (id: string) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 cursor-pointer ${
      active === id ? 'text-neutral-900 bg-white shadow-sm font-bold' : 'text-white/70 hover:text-white'
    }`;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[80] lg:hidden px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2">
      <div className="flex items-center justify-between bg-[#1a1714]/95 backdrop-blur-xl text-white rounded-[1.6rem] px-1.5 py-1.5 shadow-2xl border border-white/10">
        {/* 1. Shop */}
        <button type="button" onClick={onHome} className={itemClass('home')}>
          <Home className="h-4 w-4" />
          <span className="text-[9px] tracking-wide uppercase">Shop</span>
        </button>

        {/* 2. Customize Now */}
        <button type="button" onClick={onStudio} className={itemClass('studio')}>
          <Sparkles className="h-4 w-4 text-[#E8DCCF]" />
          <span className="text-[9px] tracking-wide uppercase">Customize</span>
        </button>

        {/* 3. Return Gifts */}
        <button
          type="button"
          onClick={onReturnGifts || onHome}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl text-white/70 hover:text-white transition-all cursor-pointer"
        >
          <Gift className="h-4 w-4 text-[#D4AF37]" />
          <span className="text-[9px] tracking-wide uppercase">Gifts</span>
        </button>

        {/* 4. Gallery */}
        <button
          type="button"
          onClick={onGallery}
          className={itemClass('gallery')}
        >
          <Image className="h-4 w-4" />
          <span className="text-[9px] tracking-wide uppercase">Gallery</span>
        </button>

        {/* 5. Bag */}
        <button
          type="button"
          onClick={onCart}
          className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl text-white/70 hover:text-white transition-all cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4 text-[#E8DCCF]" />
          <span className="text-[9px] tracking-wide uppercase">Bag</span>
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-[18%] min-w-4 h-4 px-1 rounded-full bg-[#C4A574] text-[9px] font-bold text-neutral-900 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
