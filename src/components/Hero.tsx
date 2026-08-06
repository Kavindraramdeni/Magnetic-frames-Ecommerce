import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Sparkle, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  onScrollToCustomizer: () => void;
  onScrollToShapes: () => void;
  onOpenStyleExperience: () => void;
}

const HERO_SLIDES = [
  {
    imageUrl: '/images/lifestyle_gallery_workspace_1779653492345.png',
    label: 'Hand-polished 4mm Optical Acrylic'
  },
  {
    imageUrl: '/images/banner_memory_deserves_place.png',
    label: 'Every Memory Deserves a Place'
  },
  {
    imageUrl: '/images/banner_easy_4step_installation.png',
    label: 'Easy 4 Step Installation'
  },
  {
    imageUrl: '/images/banner_premium_design_made_to_last.png',
    label: 'Premium Design, Made to Last'
  },
  {
    imageUrl: '/images/banner_perfect_for_magnetic_surfaces.png',
    label: 'Perfect for Every Magnetic Surface'
  }
];

export default function Hero({ onScrollToCustomizer, onScrollToShapes, onOpenStyleExperience }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play transitions every 1 second (1000ms) as requested
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

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
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:space-y-8 text-left">
            
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

          {/* Right Hero Visual: 1-Second Auto-Transitioning Carousel Frame */}
          <div 
            className="lg:col-span-6 relative w-full flex items-center justify-center pt-6 lg:pt-0"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-neutral-900 group">
              
              {/* Carousel Slide Images with 1-Second Smooth Fade */}
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.label}
                    className="w-full h-full object-cover select-none"
                  />
                </div>
              ))}

              {/* Glassmorphic Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-20" />

              {/* Bottom Label Badge & Slide Dots */}
              <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-white/80 shadow-md flex items-center gap-2">
                  <Sparkle className="h-3.5 w-3.5 text-[#B88E3E] shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-[#2B231D] truncate max-w-[200px] sm:max-w-[300px]">
                    {HERO_SLIDES[currentSlide].label}
                  </span>
                </div>

                {/* Carousel Indicator Dots */}
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/20 pointer-events-auto">
                  {HERO_SLIDES.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setCurrentSlide(dotIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        dotIdx === currentSlide ? 'w-5 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Manual Nav Prev/Next Buttons (Visible on Hover) */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/20"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
