import React, { useState, useEffect } from 'react';
import { LIFESTYLE_GALLERY } from '../data';
import { Camera, Eye, Heart, HelpCircle, LayoutGrid, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const REFRIGERATOR_IMAGES = [
  '/images/hero_magnet_aesthetic_1779653460595.png',
  '/images/refrigerator_magnets_lifestyle_1782460255084.jpg'
];

export default function LifestyleGallery() {
  const [refrigeratorIndex, setRefrigeratorIndex] = useState(0);
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefrigeratorIndex((prev) => (prev + 1) % REFRIGERATOR_IMAGES.length);
    }, 4000); // 4 second loop
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="lifestyle-gallery" className="select-none py-6 sm:py-12 border-t border-b border-neutral-200/50 bg-[#FAF8F5]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Headings */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-mono tracking-widest text-[#666666] font-semibold uppercase flex items-center justify-center sm:justify-start gap-1.5">
              <Camera className="h-3.5 w-3.5 text-neutral-400" />
              IN-HOME PLACEMENT
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-light text-[#111111] tracking-tight">
              Aesthetics in <span className="italic font-serif font-medium">Daily Living</span>
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#666666] max-w-xl font-light">
              Elevate standard metallic settings into meaningful gallery displays. Spot our custom magnets across high-end refrigerators, lockers, and desktop workspace grid panels.
            </p>
          </div>

          {/* Mobile Only Toggle Button */}
          <button
            type="button"
            onClick={() => setIsExpandedMobile(!isExpandedMobile)}
            className="sm:hidden w-full bg-white hover:bg-neutral-900 hover:text-white text-neutral-900 border border-neutral-300 font-mono text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>{isExpandedMobile ? 'Hide Placement Gallery ↑' : 'See In-Home Placement Photos ↓'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpandedMobile ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Gallery Grid (Always visible on Desktop, Collapsible on Mobile Layout Only) */}
        <div className={`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ${isExpandedMobile ? 'grid' : 'hidden sm:grid'}`}>
          {LIFESTYLE_GALLERY.map((item, idx) => {
            const isTall = idx % 3 === 1;
            const isRefrigerator = item.category === 'Refrigerator';

            return (
              <div 
                key={item.id}
                className={`group relative bg-white rounded-3xl overflow-hidden border border-neutral-200/50 shadow-sm hover:shadow-xl transition-all duration-300 md:col-span-1 flex flex-col ${
                  isTall ? 'h-full' : ''
                }`}
              >
                {/* Photo wrapper */}
                <div className="relative w-full aspect-[4/3] sm:aspect-square md:aspect-auto md:h-80 overflow-hidden flex-grow bg-neutral-100">
                  {isRefrigerator ? (
                    <div className="relative w-full h-full">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={refrigeratorIndex}
                          src={REFRIGERATOR_IMAGES[refrigeratorIndex]}
                          alt={item.title}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.0, ease: "easeInOut" }}
                          className="absolute inset-0 w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </AnimatePresence>
                      
                      {/* Dynamic View Indicator */}
                      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/20">
                        <div className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-white/90">Multi-Angle View</span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  {/* Subtle Shimmer Animation Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Aesthetic Placement Tag */}
                  <span className="absolute top-4 left-4 bg-[#FAF8F5]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-[#111111] uppercase border border-white/40">
                    {item.category}
                  </span>

                  {/* Quick-look visual icon */}
                  <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm pointer-events-none">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>

                {/* Info Bar */}
                <div className="p-5 bg-white space-y-1">
                  <h3 className="font-serif text-base text-[#111111] font-medium leading-tight group-hover:text-amber-900 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-sans text-xs text-[#a1a1a1] flex items-center gap-1">
                      <LayoutGrid className="h-3 w-3 text-[#E8DCCF]" />
                      Verified Custom Setting
                    </span>
                    <span className="text-neutral-300 text-xs">★★★★★</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
