import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Star, Camera, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryPageProps {
  onBackToHome: () => void;
  onCustomize: () => void;
  onOpenReturnGifts?: () => void;
}

interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'fridge' | 'wedding' | 'baby' | 'workspace';
  imageUrl: string;
  tag: string;
  city: string;
  shape: string;
  quote?: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Modern Minimalist Fridge Wall',
    subtitle: 'Sculpted Hearts and Minimal Circles on brushed steel refrigerator',
    category: 'fridge',
    imageUrl: '/images/hero_magnet_aesthetic_1779653460595.png',
    tag: 'Curated Fridge Wall',
    city: 'Hyderabad',
    shape: 'Heart & Circle (3 × 3")',
    quote: 'Our fridge used to be messy with bills. Now it looks like a curated luxury art gallery.'
  },
  {
    id: 'g2',
    title: 'Warm Family Memories Collection',
    subtitle: 'Golden hour portraits and candid laughter in acrylic clarity',
    category: 'fridge',
    imageUrl: '/images/refrigerator_magnets_lifestyle_1782460255084.jpg',
    tag: 'Daily Living',
    city: 'Bengaluru',
    shape: 'Polaroid & Grande',
    quote: 'The 3mm thick acrylic gives a glass-like depth you cannot get with paper photos.'
  },
  {
    id: 'g3',
    title: 'Luxury Wedding Favor Keepsake',
    subtitle: 'Curated return gifts distributed to 250+ wedding reception guests',
    category: 'wedding',
    imageUrl: '/images/return_gift_wedding_favor.svg',
    tag: 'Wedding Favor (250+)',
    city: 'Chennai',
    shape: 'Polaroid (3 × 4")',
    quote: 'Guests still text us pictures of the frame on their fridge months after the wedding!'
  },
  {
    id: 'g4',
    title: 'Shubh Labh Divine Blessings Frame',
    subtitle: 'Traditional housewarming return gift with gold foil detailing',
    category: 'wedding',
    imageUrl: '/images/return_gift_ganesha.svg',
    tag: 'Housewarming Gift',
    city: 'Mumbai',
    shape: 'Classic Arch',
    quote: 'Everyone in our family pooja loved receiving Lord Ganesha in crystal clear acrylic.'
  },
  {
    id: 'g5',
    title: '1st Birthday Celebration Favor',
    subtitle: 'Cute nursery teddy and balloons milestone keepsakes for little guests',
    category: 'baby',
    imageUrl: '/images/return_gift_baby_teddy.svg',
    tag: 'Birthday Return Gift',
    city: 'Pune',
    shape: 'Circle (3 × 3")',
    quote: 'Made our daughter’s first birthday unforgettable for all our guests.'
  },
  {
    id: 'g6',
    title: 'Couple Anniversary Milestone',
    subtitle: 'Sculpted Heart frame preserving proposal sunset in Udaipur',
    category: 'fridge',
    imageUrl: '/images/couple_portrait_sample_1782458143228.jpg',
    tag: 'Anniversary Gift',
    city: 'Delhi NCR',
    shape: 'Sculpted Heart',
    quote: 'The cut along the heart contour is so crisp. Truly premium feel.'
  },
  {
    id: 'g7',
    title: 'Auspicious Heritage Gold Mandala',
    subtitle: 'Festive corporate return gifts for Diwali celebration associates',
    category: 'wedding',
    imageUrl: '/images/return_gift_gold_mandala.svg',
    tag: 'Corporate & Festive',
    city: 'Ahmedabad',
    shape: 'Circle (3 × 3")',
    quote: 'A dignified corporate gift that actually stays on client office magnetic boards.'
  },
  {
    id: 'g8',
    title: 'Creative Studio Magnetic Board',
    subtitle: 'Statement Grande vertical focal piece surrounded by moodboard prints',
    category: 'workspace',
    imageUrl: '/images/lifestyle_gallery_workspace_1779653492345.png',
    tag: 'Workspace Atelier',
    city: 'Kochi',
    shape: 'Statement Grande (4 × 6")',
    quote: 'Holds firmly on metallic shelving without slipping even when doors swing.'
  }
];

export default function GalleryPage({ onBackToHome, onCustomize, onOpenReturnGifts }: GalleryPageProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'fridge' | 'wedding' | 'baby' | 'workspace'>('all');

  const filteredItems = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 font-sans selection:bg-[#E8DCCF] pb-28">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-neutral-200/70">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-700 hover:text-black transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Storefront</span>
          </button>

          <span className="font-serif italic font-medium text-base sm:text-lg text-[#1a1714]">
            KRIA Studio Gallery
          </span>

          <button
            type="button"
            onClick={onCustomize}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition shadow-xs cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#E8DCCF]" />
            <span>Customize Now</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#A38A6E] font-bold">
          Visual Inspiration · Daily Living
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-neutral-950 tracking-tight">
          How customers display their <span className="italic font-serif font-medium">memories</span>
        </h1>
        <p className="text-sm text-neutral-600 max-w-xl mx-auto font-light leading-relaxed">
          From custom wedding return favors to statement kitchen fridge walls across India. Every frame is hand-assembled between two pieces of crystal cast acrylic with heavy-duty magnets.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: 'all', label: 'All Displays' },
            { id: 'fridge', label: 'Fridge Walls' },
            { id: 'wedding', label: 'Wedding & Return Gifts' },
            { id: 'baby', label: 'Baby Milestones' },
            { id: 'workspace', label: 'Workspaces' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Photo Grid · 3 Columns Layout */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-[#EFE8DF] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white tracking-wide uppercase">
                      {item.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-mono font-medium text-neutral-900 shadow-xs">
                      {item.city}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-neutral-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {item.subtitle}
                    </p>
                  </div>

                  {item.quote && (
                    <div className="bg-[#FAF8F5] rounded-xl p-3 border border-neutral-100">
                      <div className="flex items-center gap-0.5 text-[#C4A574] mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-2.5 w-2.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-[11px] text-neutral-700 italic leading-relaxed">
                        "{item.quote}"
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-500">
                      {item.shape}
                    </span>
                    <button
                      type="button"
                      onClick={onCustomize}
                      className="text-xs font-semibold text-neutral-900 hover:text-[#A38A6E] flex items-center gap-1 group-hover:underline underline-offset-4 cursor-pointer"
                    >
                      <span>Design this</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Floating CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 mt-10">
        <div className="rounded-3xl bg-[#1a1714] text-white p-8 sm:p-12 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8DCCF]/20 text-[#E8DCCF] text-[10px] uppercase font-bold tracking-widest">
              <Sparkles className="h-3 w-3" />
              Handcrafted in Hyderabad, India
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-light">
              Ready to create your own <span className="italic font-serif">acrylic gallery</span>?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto">
              Upload your photo directly from your phone. Pick Heart, Circle, Polaroid, or Grande and adjust your crop in seconds.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onCustomize}
                className="rounded-full bg-white text-neutral-900 px-6 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition shadow-md cursor-pointer"
              >
                Customize Frame Now
              </button>
              {onOpenReturnGifts && (
                <button
                  type="button"
                  onClick={onOpenReturnGifts}
                  className="rounded-full bg-white/10 text-white border border-white/20 px-6 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition cursor-pointer"
                >
                  Shop Return Gifts
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
