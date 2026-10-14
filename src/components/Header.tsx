import React from 'react';
import { ShoppingBag } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface HeaderProps {
  cartItemsCount?: number;
  onOpenCart?: () => void;
  onHome?: () => void;
  onStudio?: () => void;
  onOpenB2B?: () => void;
  activeView?: string;
}

export default function Header({
  cartItemsCount = 0,
  onOpenCart,
  onHome,
  onStudio,
  onOpenB2B,
  activeView = 'home',
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-neutral-200/60">
      <div className="max-w-6xl mx-auto px-4 h-16 sm:h-[4.5rem] flex items-center justify-between">
        <button type="button" onClick={onHome} className="flex items-center gap-2.5 group">
          <BrandLogo size={30} color="#111111" className="transition-transform duration-300 group-hover:scale-105" />
          <span className="flex flex-col text-left">
            <span className="font-serif text-lg leading-none tracking-wide">KRIA</span>
            <span className="text-[8px] tracking-[0.28em] uppercase text-neutral-400 font-semibold mt-0.5">Studio</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wider text-neutral-500 uppercase">
          <button type="button" onClick={onHome} className={`nav-link transition-colors ${activeView === 'home' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'}`}>
            Shop
          </button>
          <button type="button" onClick={onStudio} className={`nav-link transition-colors ${activeView === 'studio' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'}`}>
            Design Studio
          </button>
        </nav>

        <button
          type="button"
          onClick={onOpenCart}
          className="relative h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Open bag"
        >
          <ShoppingBag className="h-4.5 w-4.5 text-[#E8DCCF]" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4.5 min-w-4.5 px-1 rounded-full bg-[#C4A574] text-[9px] font-bold text-neutral-900 flex items-center justify-center">
              {cartItemsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
