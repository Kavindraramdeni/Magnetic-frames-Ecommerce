import React from 'react';
import { Sparkles, MessageSquare, ShieldCheck, Heart, Sparkle } from 'lucide-react';

import BrandLogo from './BrandLogo';

interface FooterProps {
  onOpenAdmin?: () => void;
  onOpenPolicies?: () => void;
  onOpenTracking?: () => void;
}

export default function Footer({ onOpenAdmin, onOpenPolicies, onOpenTracking }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] text-[#FAF8F5] select-none py-16 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-neutral-800">
          
          {/* Logo Brand info */}
          <div className="md:col-span-5 space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-[#a1a1a1] uppercase block">
              PREMIUM ACRYLIC PRINTS
            </span>
            <div className="flex items-center gap-3">
              <BrandLogo size={32} color="#FFFFFF" />
              <h3 className="font-serif text-3xl font-light tracking-tight text-white">
                KRIA <span className="font-sans text-xs tracking-widest uppercase ml-1 font-light bg-neutral-900 border border-neutral-800 text-[#E8DCCF] px-2 py-0.5 rounded-full inline-block">Studio</span>
              </h3>
            </div>
            <p className="font-sans text-xs text-[#a1a1a1] leading-relaxed max-w-sm font-light">
              Crafting exquisite premium acrylic fridge magnets. 
            </p>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="font-mono text-xs text-[#E8DCCF] tracking-widest uppercase">THE DETAILS</h4>
            <ul className="space-y-2 font-sans text-xs text-[#a1a1a1] font-light">
              <li>Extra-depth contour silhouette carving</li>
              <li>Individually cut to order</li>
              <li><button onClick={onOpenPolicies} className="hover:text-white transition-colors">Terms, Privacy, Shipping & Returns</button></li>
              <li><button onClick={onOpenTracking} className="hover:text-white transition-colors">Track your order</button></li>
            </ul>
          </div>

          {/* Contact help line */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="font-mono text-xs text-[#E8DCCF] tracking-widest uppercase">HELP & COMMISSIONS</h4>
            <div className="pt-1.5">
              <a 
                href="https://wa.me/919392576792"
                target="_blank"
                rel="noreferrer"
                className="font-serif text-sm font-medium italic block text-white hover:text-green-400 transition-colors"
              >
                kriatechgroup@gmail.com / WhatsApp Hotline
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-[#999999] font-sans text-xs font-light gap-4">
          <div className="flex items-center gap-3 text-[#999999] flex-wrap justify-center sm:justify-start">
            <span>© {currentYear} Kria Studio India. Cut to order.</span>
            {onOpenAdmin && (
              <>
                <span className="text-neutral-700 font-sans select-none">•</span>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#E8DCCF] hover:bg-neutral-800 transition-all cursor-pointer font-mono text-[9px] tracking-wider uppercase border border-neutral-800 hover:border-[#E8DCCF]/40 bg-neutral-900/50 px-2.5 py-1 rounded-md"
                >
                  Fulfillment CMS Portal
                </button>
              </>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-6 text-[#999999] font-mono text-[10px] tracking-widest">
            <span className="flex items-center gap-1.5">
              <Sparkle className="h-3 w-3 text-[#E8DCCF]" />
              Premium Home Decor
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-3 w-3 text-red-400" />
              100% Proudly Made In India
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
