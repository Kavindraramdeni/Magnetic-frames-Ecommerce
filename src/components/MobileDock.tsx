import React from 'react';
import { Home, Sparkles, ShoppingBag, MessageCircle } from 'lucide-react';

interface MobileDockProps {
  active: 'home' | 'studio' | 'checkout' | string;
  cartCount: number;
  onHome: () => void;
  onStudio: () => void;
  onCart: () => void;
}

export default function MobileDock({ active, cartCount, onHome, onStudio, onCart }: MobileDockProps) {
  const itemClass = (id: string) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-2xl transition-all duration-300 ${
      active === id ? 'text-neutral-900 bg-white shadow-sm' : 'text-neutral-500'
    }`;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[80] md:hidden px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2">
      <div className="flex items-center bg-[#1a1714]/95 backdrop-blur-xl text-white rounded-[1.6rem] px-1.5 py-1.5 shadow-2xl border border-white/10">
        <button type="button" onClick={onHome} className={`${itemClass('home')} ${active === 'home' ? '!text-neutral-900' : '!text-white/70'}`}>
          <Home className="h-4.5 w-4.5" />
          <span className="text-[9px] font-semibold tracking-wide uppercase">Shop</span>
        </button>
        <button type="button" onClick={onStudio} className={`${itemClass('studio')} ${active === 'studio' ? '!text-neutral-900' : '!text-white/70'}`}>
          <Sparkles className="h-4.5 w-4.5" />
          <span className="text-[9px] font-semibold tracking-wide uppercase">Studio</span>
        </button>
        <button type="button" onClick={onCart} className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-2xl text-white/70">
          <ShoppingBag className="h-4.5 w-4.5" />
          <span className="text-[9px] font-semibold tracking-wide uppercase">Bag</span>
          {cartCount > 0 && (
            <span className="absolute top-1 right-[22%] min-w-4 h-4 px-1 rounded-full bg-[#C4A574] text-[9px] font-bold text-neutral-900 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        <a
          href="https://wa.me/919392576792?text=Hi%20KRIA%20Studio"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-2xl text-white/70"
        >
          <MessageCircle className="h-4.5 w-4.5" />
          <span className="text-[9px] font-semibold tracking-wide uppercase">Chat</span>
        </a>
      </div>
    </nav>
  );
}
