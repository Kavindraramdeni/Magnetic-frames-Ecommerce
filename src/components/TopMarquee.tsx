import React from 'react';
import { Sparkle } from 'lucide-react';

export default function TopMarquee() {
  const marqueeItems = [
    "🔥 TODAY'S DEAL: GET 15% OFF ON 10+ CUSTOM MAGNETS! USE CODE: KRIA10",
    "🚚 FREE EXPRESS AIR SHIPPING ACROSS INDIA ON ORDERS OVER ₹699",
    "✨ NEW SHAPES ADDED: SCULPTED HEART, CLASSIC ARCH & POLAROID CAPTION",
    "🇮🇳 HAND-CRAFTED & LASER-CUT IN HYDERABAD WAREHOUSE",
    "🎁 THE PERFECT PERSONALIZED GIFT FOR ANNIVERSARIES & MEMORIES",
  ];

  return (
    <div className="w-full bg-[#111111] border-b border-[#B09A84]/25 py-2 overflow-hidden select-none z-50">
      <div className="animate-marquee flex items-center whitespace-nowrap">
        {/* First Loop */}
        <div className="flex items-center gap-8 shrink-0 pr-8">
          {marqueeItems.map((item, idx) => (
            <React.Fragment key={`m1-${idx}`}>
              <span className="flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-[#E8DCCF]">
                <Sparkle className="h-3 w-3 text-[#B09A84] shrink-0" />
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Second Duplicate Loop for seamless infinite animation */}
        <div className="flex items-center gap-8 shrink-0 pr-8" aria-hidden="true">
          {marqueeItems.map((item, idx) => (
            <React.Fragment key={`m2-${idx}`}>
              <span className="flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-[#E8DCCF]">
                <Sparkle className="h-3 w-3 text-[#B09A84] shrink-0" />
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Third Duplicate Loop for wider screens */}
        <div className="flex items-center gap-8 shrink-0 pr-8" aria-hidden="true">
          {marqueeItems.map((item, idx) => (
            <React.Fragment key={`m3-${idx}`}>
              <span className="flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-[#E8DCCF]">
                <Sparkle className="h-3 w-3 text-[#B09A84] shrink-0" />
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
