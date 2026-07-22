import React from 'react';
import { Sparkle } from 'lucide-react';

export default function TopMarquee() {
  const marqueeItems = [
    "ACRYLIC",
    "CUSTOM LASER-CUT ACRYLIC PHOTO MAGNETS",
    "DESIGN YOUR OWN IN THE STUDIO",
    "MADE IN INDIA",
    "YOUR PRECIOUS MOMENTS, HAND-POLISHED IN ACRYLIC",
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
