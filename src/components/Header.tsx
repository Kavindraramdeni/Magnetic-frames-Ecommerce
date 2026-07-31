import React, { useState } from 'react';
import { Sparkles, MessageSquare, Menu, X, Heart, Sparkle, ShoppingBag } from 'lucide-react';

import BrandLogo from './BrandLogo';

interface HeaderProps {
  onScrollToCustomizer: () => void;
  onScrollToGallery: () => void;
  onScrollToShapes: () => void;
  cartItemsCount?: number;
  onOpenCart?: () => void;
}

export default function Header({ 
  onScrollToCustomizer, 
  onScrollToGallery, 
  onScrollToShapes,
  cartItemsCount = 0,
  onOpenCart
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 shadow-xs bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
        
        {/* Logo Mark: Luxury Atelier Aesthetic */}
        <div className="flex items-center">
          <a href="/" className="group flex items-center gap-3">
            <BrandLogo size={36} color="#111111" className="group-hover:scale-105 transition-transform duration-300" />
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-wide text-[#111111] leading-none">
                KRIA
              </span>
              <span className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#888888] font-black mt-1 leading-none">
                STUDIO
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation with Animated Underline Micro-interactions */}
        <nav className="hidden md:flex items-center gap-10 font-sans text-xs tracking-widest font-semibold text-[#555555]">
          <button 
            onClick={onScrollToShapes}
            className="relative py-2 hover:text-black transition-colors duration-200 cursor-pointer uppercase after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-neutral-900 after:transition-all after:duration-300"
          >
            SHOP NOW
          </button>
          <button 
            onClick={onScrollToGallery}
            className="relative py-2 hover:text-black transition-colors duration-200 cursor-pointer uppercase after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-neutral-900 after:transition-all after:duration-300"
          >
            LIFESTYLE INSPIRATION
          </button>
          <a 
            href="#faqs"
            className="relative py-2 hover:text-black transition-colors duration-200 cursor-pointer uppercase after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-neutral-900 after:transition-all after:duration-300"
          >
            SPECIFICATIONS
          </a>
          <a 
            href="https://wa.me/919392576792?text=Hi! I'm interested in bulk orders for KRIA Studio."
            target="_blank"
            rel="noreferrer"
            className="relative py-2 hover:text-black transition-colors duration-200 cursor-pointer uppercase flex items-center gap-1 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-neutral-900 after:transition-all after:duration-300"
          >
            BULK ORDERS
            <MessageSquare className="h-3 w-3 text-[#B09A84]" />
          </a>
        </nav>

        {/* Desktop CTA & Elegant Badging */}
        <div className="hidden md:flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-[#666666] rounded-full text-[10px] font-mono border border-neutral-200/40 font-bold uppercase tracking-wider">
            <Sparkle className="h-3 w-3 text-[#B09A84] animate-spin-slow" />
            Made in India
          </span>
          <button
            onClick={onOpenCart || onScrollToCustomizer}
            id="header-cart-btn"
            className="relative p-3 bg-[#111111] text-white hover:bg-neutral-800 active:scale-95 transition-all duration-200 rounded-full shadow-md flex items-center justify-center cursor-pointer group animate-in zoom-in duration-300"
            title="View Design Tray"
          >
            <ShoppingBag className="h-5 w-5 text-[#E8DCCF] group-hover:scale-105 transition-transform" />
            <span className={`absolute -top-1 -right-1 font-mono text-[9px] font-bold h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white transition-all shadow ${
              cartItemsCount > 0 ? 'bg-[#B09A84] text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              {cartItemsCount}
            </span>
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={onOpenCart || onScrollToCustomizer}
            className="relative p-2.5 bg-[#111111] text-white rounded-full active:scale-95 transition-transform flex items-center justify-center"
            title="View Design Tray"
          >
            <ShoppingBag className="h-4.5 w-4.5 text-[#E8DCCF]" />
            <span className={`absolute -top-1 -right-1 font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white transition-all shadow ${
              cartItemsCount > 0 ? 'bg-[#B09A84] text-white' : 'bg-neutral-200 text-neutral-600'
            }`}>
              {cartItemsCount}
            </span>
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-[#111111] hover:bg-neutral-100 rounded-full transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5]/98 border-b border-neutral-200 py-6 px-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-5 font-sans text-sm tracking-widest font-bold text-[#666666]">
            <button
              onClick={() => {
                onScrollToShapes();
                setIsMenuOpen(false);
              }}
              className="text-left py-2 hover:text-black border-b border-neutral-100 uppercase"
            >
              SHOP NOW
            </button>
            <button
              onClick={() => {
                onScrollToGallery();
                setIsMenuOpen(false);
              }}
              className="text-left py-2 hover:text-black border-b border-neutral-100 uppercase"
            >
              LIFESTYLE INSPIRATION
            </button>
            <a
              href="#faqs"
              onClick={() => setIsMenuOpen(false)}
              className="text-left py-2 hover:text-black border-b border-neutral-100 uppercase"
            >
              SPECIFICATIONS
            </a>
            <a
              href="https://wa.me/919392576792?text=Hi! I'm interested in bulk orders for KRIA Studio."
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="text-left py-2 hover:text-black border-b border-neutral-100 uppercase flex items-center justify-between"
            >
              BULK ORDERS
              <MessageSquare className="h-4 w-4 text-[#B09A84]" />
            </a>
            
            <button
              onClick={() => {
                onScrollToCustomizer();
                setIsMenuOpen(false);
              }}
              className="bg-[#111111] text-[#FAF8F5] text-center py-4 rounded-xl font-bold tracking-widest uppercase transition-colors shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-[#E8DCCF]" />
              CUSTOMIZE YOUR PHOTO
            </button>

            <span className="text-[10px] text-neutral-400 font-mono text-center mt-2 flex items-center justify-center gap-1.5 uppercase tracking-wider font-semibold">
              <Heart className="h-3 w-3 text-[#B09A84] fill-[#B09A84]" />
              100% custom hand-polished acrylic
            </span>
          </div>
        </div>
      )}
      </div>
    </header>
  );
}
