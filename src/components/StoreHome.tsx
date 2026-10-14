import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Truck, Sparkle, Star } from 'lucide-react';
import { BASE_SHAPES, FAQS, fetchLiveCatalogShapes } from '../data';
import { MagnetShape, MagnetShapeId } from '../types';
import { SHAPE_SAMPLE_IMAGES } from '../lib/shapePreview';

interface StoreHomeProps {
  onCustomize: (shapeId?: MagnetShapeId) => void;
}

export default function StoreHome({ onCustomize }: StoreHomeProps) {
  const [shapes, setShapes] = useState<MagnetShape[]>(BASE_SHAPES);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetchLiveCatalogShapes().then((live) => {
      if (live?.length) setShapes(live);
    });
  }, []);

  const featured = shapes.slice(0, 8);

  return (
    <div className="page-enter pb-28 md:pb-8">
      <section className="relative mx-auto max-w-6xl px-4 pt-4 sm:pt-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#1a1714] text-[#FAF8F5] min-h-[58vh] sm:min-h-[62vh] flex flex-col justify-end">
          <img
            src="/images/Landingprofile.png"
            alt="KRIA acrylic photo magnet"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
          <div className="relative z-10 p-6 sm:p-10 space-y-4 max-w-xl">
            <p className="text-[10px] tracking-[0.28em] uppercase text-[#E8DCCF] font-medium">Handmade acrylic · India</p>
            <h1 className="font-serif text-[2.15rem] sm:text-5xl leading-[1.08] font-light">
              Your photo.
              <br />
              <span className="italic">A keepsake they keep.</span>
            </h1>
            <p className="text-sm text-white/75 max-w-md leading-relaxed">
              Custom-cut acrylic fridge frames. Upload, crop, and checkout in under a minute.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => onCustomize()}
                className="inline-flex items-center gap-2 rounded-full bg-white text-neutral-900 px-5 py-3 text-xs font-semibold tracking-wide uppercase btn-lux"
              >
                Design yours
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="inline-flex items-center gap-2 text-[11px] text-white/70 self-center">
                From ₹{Math.min(...featured.map((s) => s.price))} · Free ship ₹699+
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-7">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#B09A84] font-semibold">Shop shapes</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-light">Pick a frame</h2>
          </div>
          <button type="button" onClick={() => onCustomize()} className="text-xs font-medium underline underline-offset-4">
            See all
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-none">
          {featured.map((shape) => (
            <button
              key={shape.id}
              type="button"
              onClick={() => onCustomize(shape.id)}
              className="snap-start shrink-0 w-[42vw] sm:w-48 text-left group"
            >
              <div className="aspect-[4/5] rounded-[1.4rem] overflow-hidden bg-[#EFE8DF] border border-black/5 mb-2.5 relative">
                <img
                  src={SHAPE_SAMPLE_IMAGES[shape.id] || '/images/Landingprofile.png'}
                  alt={shape.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] font-semibold">
                  ₹{shape.price}
                </span>
              </div>
              <p className="text-sm font-medium leading-tight">{shape.name}</p>
              <p className="text-[11px] text-neutral-500">{shape.dimensions}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-8 grid grid-cols-3 gap-2">
        {[
          { icon: Sparkle, label: 'UV acrylic' },
          { icon: Truck, label: '2–4 day ship' },
          { icon: ShieldCheck, label: 'GST invoice' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-neutral-200/80 bg-white px-2 py-3 text-center">
            <item.icon className="h-4 w-4 mx-auto text-[#B09A84] mb-1.5" />
            <p className="text-[10px] sm:text-xs font-medium text-neutral-700">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-8">
        <div className="rounded-[1.6rem] bg-white border border-neutral-200/80 p-5 sm:p-7">
          <div className="flex items-center gap-1 text-[#C4A574] mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <p className="font-serif text-xl sm:text-2xl italic leading-snug text-neutral-900">
            “Looked like a boutique gift, not a fridge magnet. Crop studio made it feel designed.”
          </p>
          <p className="mt-3 text-xs text-neutral-500">Ananya · Hyderabad · verified order</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-6 space-y-2">
        {FAQS.slice(0, 3).map((faq, i) => (
          <button
            key={faq.question}
            type="button"
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full text-left rounded-2xl border border-neutral-200/80 bg-white px-4 py-3.5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{faq.question}</span>
              <span className="text-neutral-400 text-lg leading-none">{openFaq === i ? '–' : '+'}</span>
            </div>
            {openFaq === i && <p className="mt-2 text-xs text-neutral-500 leading-relaxed">{faq.answer}</p>}
          </button>
        ))}
      </section>
    </div>
  );
}
