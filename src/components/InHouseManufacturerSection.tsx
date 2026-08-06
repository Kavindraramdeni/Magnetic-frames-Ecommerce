import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, RefreshCw, Sparkles, Award } from 'lucide-react';

export default function InHouseManufacturerSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: '1',
      title: 'PEEL OFF',
      subtitle: 'Peel off the protective film from both sides.',
      image: '/images/shape_custom_silhouette_1780939456213.png'
    },
    {
      step: '2',
      title: 'SLIDE TO OPEN',
      subtitle: 'Gently slide the front acrylic panel apart.',
      image: '/images/shape_polaroid_magnet_1780939416510.png'
    },
    {
      step: '3',
      title: 'INSERT PHOTO',
      subtitle: 'Place your photo between acrylic panels.',
      image: '/images/couple_portrait_sample_1782458143228.jpg'
    },
    {
      step: '4',
      title: 'SNAP TOGETHER',
      subtitle: 'Align the panels and snap together with neodymium magnets.',
      image: '/images/scenic_landscape_sample_1782458156606.jpg'
    }
  ];

  return (
    <section className="select-none py-16 bg-white border-y border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text Block: India's Best-Selling Acrylic Manufacturer */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-neutral-100 text-[#666666] rounded-full text-[10px] font-mono border border-neutral-200/60 font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              IN-HOUSE ACRYLIC MANUFACTURING
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight tracking-tight">
              India's Best-Selling <br className="hidden sm:inline" />
              <span className="italic font-normal">Acrylic Products</span> Manufacturer
            </h2>

            <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed font-light">
              Celebrating <strong>1 Lakh+ acrylic Magnets Sold</strong> in Only 4 Months across India! Direct factory laser cutting & high-clarity optical acrylic.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-neutral-600 flex-wrap">
              <span className="flex items-center gap-1.5 font-bold"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Strong Hold Magnets</span>
              <span className="flex items-center gap-1.5 font-bold"><RefreshCw className="h-4 w-4 text-amber-600" /> Double Sided Reusable</span>
            </div>

            <div className="pt-2">
              <a
                href="#shapes-showcase"
                className="inline-flex items-center justify-center bg-[#111111] hover:bg-black text-white px-7 py-3.5 rounded-full font-mono text-xs uppercase tracking-wider font-bold shadow-md transition hover:-translate-y-0.5"
              >
                Buy Now
              </a>
            </div>
          </div>

          {/* Right Visual Box: Easy 4-Step Installation Guide (Matching Pic 3 Reference) */}
          <div className="lg:col-span-8 bg-[#FAF8F5] border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="text-center space-y-1">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900">
                Easy 4 Step Installation
              </h3>
              <p className="font-sans text-xs text-neutral-500 font-light">
                Display Your Memories in Minutes
              </p>
            </div>

            {/* 4 Step Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {steps.map((item, idx) => (
                <div
                  key={item.step}
                  onClick={() => setActiveStep(idx)}
                  className={`group bg-white rounded-2xl p-3 border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    activeStep === idx
                      ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div>
                    <div className="relative w-full aspect-[4/3] bg-neutral-100 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center p-1">
                      <span className="absolute top-1.5 left-1.5 font-mono text-[10px] font-bold h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        {item.step}
                      </span>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-auto max-h-[85%] object-contain rounded-md"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <h4 className="font-mono text-xs font-bold text-neutral-900 uppercase">
                      {item.step}. {item.title}
                    </h4>
                    <p className="font-sans text-[10px] text-neutral-500 leading-tight mt-1">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Assembly Guarantee Pills */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-mono text-neutral-600 border-t border-neutral-200/80">
              <span className="py-1 bg-white rounded-lg border border-neutral-200">🧲 Strong Hold Magnet</span>
              <span className="py-1 bg-white rounded-lg border border-neutral-200">🖼️ Double Sided Display</span>
              <span className="py-1 bg-white rounded-lg border border-neutral-200">🔄 Reusable Anytime</span>
              <span className="py-1 bg-white rounded-lg border border-neutral-200">✨ Crystal Clear Acrylic</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
