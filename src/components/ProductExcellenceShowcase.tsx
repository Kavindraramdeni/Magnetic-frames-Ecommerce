import React from 'react';
import { ArrowRight, Sparkles, Heart, ShieldCheck, RefreshCw, Layers } from 'lucide-react';

interface ProductExcellenceShowcaseProps {
  onScrollToShapes?: () => void;
}

export default function ProductExcellenceShowcase({ onScrollToShapes }: ProductExcellenceShowcaseProps) {
  return (
    <section className="select-none py-12 lg:py-16 bg-[#FAF8F5] space-y-12 sm:space-y-16 border-y border-neutral-200/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">

        {/* Banner 1: "Every Memory Deserves a Place" */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200/90 bg-white group transition-all duration-300 hover:shadow-2xl">
          <img
            src="/images/banner_memory_deserves_place.png"
            alt="Every Memory Deserves a Place - KRIA Studio"
            className="w-full h-auto object-cover block"
          />
        </div>

        {/* Banner 2: "Easy 4 Step Installation" */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200/90 bg-white group transition-all duration-300 hover:shadow-2xl">
          <img
            src="/images/banner_easy_4step_installation.png"
            alt="Easy 4 Step Installation - Display Your Memories in Minutes"
            className="w-full h-auto object-cover block"
          />
        </div>

        {/* Banner 3: "Premium Design, Made to Last" */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200/90 bg-white group transition-all duration-300 hover:shadow-2xl">
          <img
            src="/images/banner_premium_design_made_to_last.png"
            alt="Premium Design, Made to Last - Crafted with clarity"
            className="w-full h-auto object-cover block"
          />
        </div>

        {/* Banner 4: "Perfect for Every Magnetic Surface" */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200/90 bg-white group transition-all duration-300 hover:shadow-2xl">
          <img
            src="/images/banner_perfect_for_magnetic_surfaces.png"
            alt="Perfect for Every Magnetic Surface - Refrigerator, School Locker, Magnetic Whiteboard, Office Cabinet"
            className="w-full h-auto object-cover block"
          />
        </div>

        {/* Call to Action Button */}
        {onScrollToShapes && (
          <div className="text-center pt-2">
            <button
              onClick={onScrollToShapes}
              className="inline-flex items-center gap-2.5 bg-[#111111] hover:bg-black text-[#FAF8F5] px-9 py-4 rounded-full font-mono text-xs font-bold uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border border-neutral-800"
            >
              <Sparkles className="h-4 w-4 text-[#E8DCCF]" />
              <span>Explore All 10 Acrylic Shapes</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
