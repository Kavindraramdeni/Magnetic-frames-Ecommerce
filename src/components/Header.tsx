import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Sparkles, Gift } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface HeaderProps {
  cartItemsCount?: number;
  onOpenCart?: () => void;
  onHome?: () => void;
  onStudio?: () => void;
  onOpenReturnGifts?: () => void;
  onOpenGallery?: () => void;
  onOpenAboutUs?: () => void;
  onOpenBOGO?: () => void;
  onOpenB2B?: () => void;
  activeView?: string;
}

export default function Header({
  cartItemsCount = 0,
  onOpenCart,
  onHome,
  onStudio,
  onOpenReturnGifts,
  onOpenGallery,
  onOpenAboutUs,
  onOpenBOGO,
  activeView = 'home',
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (action?: () => void) => {
    setMobileMenuOpen(false);
    if (action) action();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 h-16 sm:h-[4.5rem] flex items-center justify-between gap-2">
        {/* Logo */}
        <button type="button" onClick={onHome} className="flex items-center gap-2.5 group shrink-0 cursor-pointer">
          <BrandLogo size={32} color="#111111" className="transition-transform duration-300 group-hover:scale-105" />
          <span className="flex flex-col text-left">
            <span className="font-serif text-lg leading-none tracking-wide">KRIA</span>
            <span className="text-[8px] tracking-[0.28em] uppercase text-neutral-400 font-semibold mt-0.5">Studio</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-medium tracking-wider text-neutral-600 uppercase">
          {/* 1. Shop */}
          <button
            type="button"
            onClick={onHome}
            className={`nav-link transition-colors cursor-pointer ${
              activeView === 'home' ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            Shop
          </button>

          {/* 2. Customize Now (replaces Design Studio) */}
          <button
            type="button"
            onClick={onStudio}
            className={`nav-link transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'studio' ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            <Sparkles className="h-3 w-3 text-[#A38A6E]" />
            <span>Customize Now</span>
          </button>

          {/* 3. Return Gifts */}
          <button
            type="button"
            onClick={onOpenReturnGifts || onHome}
            className="nav-link transition-colors cursor-pointer hover:text-neutral-900"
          >
            Return Gifts
          </button>

          {/* 4. [🎁 Buy 1 Get 1 Free] Special Highlight Badge */}
          <button
            type="button"
            onClick={onOpenBOGO}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#9E1B32] via-[#8B0000] to-[#B8860B] text-white font-bold text-[10px] tracking-wider uppercase shadow-xs hover:shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Gift className="h-3.5 w-3.5" />
            <span>Buy 1 Get 1 Free</span>
          </button>

          {/* 5. Gallery (Separate Page) */}
          <button
            type="button"
            onClick={onOpenGallery}
            className={`nav-link transition-colors cursor-pointer ${
              activeView === 'gallery' ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'
            }`}
          >
            Gallery
          </button>

          {/* 6. About Us */}
          <button
            type="button"
            onClick={onOpenAboutUs || onHome}
            className="nav-link transition-colors cursor-pointer hover:text-neutral-900"
          >
            About Us
          </button>
        </nav>

        {/* Right Actions: Mobile BOGO Pill + Cart + Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile BOGO Pill */}
          <button
            type="button"
            onClick={onOpenBOGO}
            className="lg:hidden px-2.5 py-1 rounded-full bg-gradient-to-r from-[#9E1B32] to-[#B8860B] text-white font-bold text-[9px] tracking-wide uppercase flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Gift className="h-3 w-3" />
            <span>BOGO</span>
          </button>

          {/* Cart Bag */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer shadow-xs"
            aria-label="Open bag"
          >
            <ShoppingBag className="h-4.5 w-4.5 text-[#E8DCCF]" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4.5 min-w-4.5 px-1 rounded-full bg-[#C4A574] text-[9px] font-bold text-neutral-900 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-neutral-700 hover:text-black hover:bg-neutral-100 transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200/80 bg-[#FAF8F5] px-4 py-4 space-y-2 shadow-lg animate-fade-in">
          <button
            type="button"
            onClick={() => handleNav(onHome)}
            className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 flex items-center justify-between"
          >
            <span>Shop Frames</span>
            <span className="text-[10px] text-neutral-400">4 Shapes</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav(onStudio)}
            className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold tracking-wider uppercase text-neutral-900 bg-white border border-neutral-200/80 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#A38A6E]" />
              <span>Customize Now</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">Photo Studio</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav(onOpenReturnGifts || onHome)}
            className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 flex items-center justify-between"
          >
            <span>Return Gifts</span>
            <span className="text-[10px] text-neutral-400">Fixed Art</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav(onOpenBOGO)}
            className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold tracking-wider uppercase text-white bg-gradient-to-r from-[#9E1B32] to-[#B8860B] flex items-center justify-between shadow-xs"
          >
            <span className="flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5" />
              <span>[🎁 Buy 1 Get 1 Free]</span>
            </span>
            <span className="text-[10px] font-mono">CODE: BOGO</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav(onOpenGallery)}
            className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 flex items-center justify-between"
          >
            <span>Gallery</span>
            <span className="text-[10px] text-neutral-400">Customer Walls</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav(onOpenAboutUs || onHome)}
            className="w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider uppercase text-neutral-800 hover:bg-neutral-100 flex items-center justify-between"
          >
            <span>About Us</span>
            <span className="text-[10px] text-neutral-400">3mm Acrylic</span>
          </button>
        </div>
      )}
    </header>
  );
}
