import React from 'react';
import { Sparkles, ArrowRight, Sparkle } from 'lucide-react';
import { LIFESTYLE_GALLERY } from '../data';

interface HeroProps {
  onScrollToCustomizer: () => void;
  onScrollToShapes: () => void;
  onOpenStyleExperience: () => void;
}

export default function Hero({ onScrollToCustomizer, onScrollToShapes, onOpenStyleExperience }: HeroProps) {
  return (
    <section className="relative overflow-hidden select-none py-12 lg:py-20 bg-[#FAF8F5]">
      {/* Background soft ambient image & blur overlays as in shared image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: `url('/images/soft_abstract_bg_1782458126047.jpg')` }}
      />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#E8DCCF]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] rounded-full bg-[#F3ECE4]/60 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Hero Content - Matches shared image layout */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:space-y-8">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E8DCCF]/70 backdrop-blur-md border border-[#D3C0AD]/60 rounded-full px-4 py-2 w-max shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#111111]" />
              <span className="text-[11px] font-mono tracking-widest text-[#111111] uppercase font-bold">
                1000+ MEMORIES HAND-POLISHED
              </span>
            </div>

            {/* Display Headline */}
            <div className="space-y-3">
              <h1 className="font-serif text-5xl sm:text-6xl xl:text-7xl font-light text-[#111111] leading-[1.06] tracking-tight">
                Turn Your <br />
                Memories Into <br />
                <span className="font-semibold italic font-serif text-[#111111] relative inline-block">
                  Luxury Decor
                  <span className="absolute -bottom-1.5 left-0 w-full h-[3px] bg-[#E8DCCF] rounded-full" />
                </span> ✨
              </h1>
              
              <p className="font-sans text-base sm:text-lg text-[#555555] max-w-lg leading-relaxed font-light pt-1">
                Custom acrylic fridge magnets designed to elevate your daily spaces.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3.5 items-center">
              
              {/* Choose Your Style Button */}
              <button
                onClick={onOpenStyleExperience}
                className="bg-[#E8DCCF] text-[#111111] hover:bg-[#dfd0bf] active:scale-98 text-xs font-mono font-extrabold uppercase tracking-widest px-7 py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer border border-[#d3c0ad]"
              >
                <Sparkles className="h-4 w-4 text-[#111111] fill-[#111111]" />
                CHOOSE YOUR STYLE
              </button>

              {/* Shop Now Button */}
              <button
                onClick={onScrollToShapes}
                className="bg-[#111111] text-[#FAF8F5] hover:bg-[#222222] active:scale-98 text-xs font-mono font-bold tracking-widest uppercase px-7 py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                SHOP NOW
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>

            {/* Trust highlights */}
            <div className="flex items-center gap-6 pt-1 text-[#666666] text-xs font-sans font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-green-600 font-bold">✓</span> Made in India
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-amber-600 font-bold">★</span> 4.9/5 Rating (1,200+ Reviews)
              </span>
            </div>

          </div>

          {/* Right Hero Visual: Refrigerator Lifestyle Frame matching shared image */}
          <div className="lg:col-span-6 relative w-full flex items-center justify-center pt-6 lg:pt-0">
            <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-neutral-100 group">
              
              {/* High Resolution Refrigerator Image showing acrylic magnets */}
              <img
                src={LIFESTYLE_GALLERY[0].imageUrl}
                alt="Luxury Refrigerator displaying KRIA Acrylic Magnets"
                className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-102"
              />

              {/* Glassmorphic Light Shimmer Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5]/20 via-transparent to-white/20 pointer-events-none" />

              {/* Bottom Badge overlay */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/80 shadow-md flex items-center gap-2.5">
                <Sparkle className="h-4 w-4 text-[#B88E3E]" />
                <span className="text-[11px] font-sans font-semibold text-[#2B231D]">
                  Hand-polished 4mm Optical Acrylic
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


