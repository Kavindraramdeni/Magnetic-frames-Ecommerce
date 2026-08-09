import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Sparkle, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  onScrollToCustomizer: () => void;
  onScrollToShapes: () => void;
  onOpenStyleExperience: () => void;
}

const HERO_SLIDES = [
  {
    imageUrl: '/images/banner_memory_deserves_place.png',
    label: 'Every Memory Deserves a Place'
  },
  {
    imageUrl: '/images/banner_premium_design_made_to_last.png',
    label: 'Premium Design, Made to Last'
  },
  {
    imageUrl: '/images/banner_easy_4step_installation.png',
    label: 'Easy 4-Step Installation'
  }
];

export default function Hero({ onScrollToCustomizer, onScrollToShapes, onOpenStyleExperience }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play transitions every 2.5 seconds (2500ms)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="relative overflow-hidden select-none py-6 sm:py-8 bg-[#FAF8F5]">
      {/* Background soft ambient image & blur overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: `url('/images/soft_abstract_bg_1782458126047.jpg')` }}
      />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#E8DCCF]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] rounded-full bg-[#F3ECE4]/60 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-5">
        {/* Straight Line Headline */}
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl xl:text-6xl font-light text-[#111111] tracking-tight leading-tight">
          Turn Your Memories Into <span className="font-semibold italic font-serif text-[#111111] relative inline-block">
            Luxury Decor
            <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#E8DCCF] rounded-full" />
          </span> ✨
        </h1>

        {/* Auto Loop 3-Image Carousel Directly Below Headline */}
        <div 
          className="relative w-full max-w-3xl mx-auto aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white group flex items-center justify-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Carousel Slide Images with 2.5-Second Smooth Fade */}
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out bg-white flex items-center justify-center ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.label}
                className="w-full h-full object-contain p-1 select-none"
              />
            </div>
          ))}

          {/* Bottom Label Badge & Slide Indicator Dots */}
          <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-white/80 shadow-xs flex items-center gap-1.5">
              <Sparkle className="h-3 w-3 text-[#B88E3E] shrink-0" />
              <span className="text-[10px] sm:text-xs font-sans font-semibold text-[#2B231D] truncate max-w-[220px] sm:max-w-[340px]">
                {HERO_SLIDES[currentSlide].label}
              </span>
            </div>

            {/* Carousel Indicator Dots */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/20 pointer-events-auto">
              {HERO_SLIDES.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentSlide(dotIdx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    dotIdx === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Manual Nav Prev/Next Buttons */}
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
    </section>
  );
}
