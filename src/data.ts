import { MagnetShape, Testimonial, FAQItem, LifestyleItem } from './types';
import { SHAPE_PRICES } from './catalog';

export const BASE_SHAPES: MagnetShape[] = [
  {
    id: 'polaroid',
    name: 'Classic Polaroid',
    price: SHAPE_PRICES.polaroid,
    dimensions: '7.0 × 7.0 cm',
    description: 'The nostalgic white border with a glossy image container and custom modern handwritten-font captioning. Features an extra thick acrylic stand feel.',
    shapeClass: 'shape-polaroid border border-white/50 bg-white/90 p-3 pt-3 pb-8 text-black shadow-md',
    frameRatio: 'aspect-[4/5]',
    tagline: 'Retro Nostalgia (K1)'
  },
  {
    id: 'landscape',
    name: 'Horizontal Snapshot',
    price: SHAPE_PRICES.landscape,
    dimensions: '8.8 × 6.3 cm',
    description: 'The classic wide-angle horizon snapshot. Perfect for memorable landscapes, beautiful sunsets, or large joyful group photos.',
    shapeClass: 'rounded-2xl border border-white/50',
    frameRatio: 'aspect-[1.4/1]',
    tagline: 'Horizontal Classic (K2)'
  },
  {
    id: 'portrait',
    name: 'Classic Portrait',
    price: SHAPE_PRICES.portrait,
    dimensions: '7.5 × 10.0 cm',
    description: 'A beautiful vertical rectangle with elegantly rounded borders. A definitive profile shape for singular faces, pet, and close-up portraits.',
    shapeClass: 'rounded-2xl border-2 border-white/40',
    frameRatio: 'aspect-[3/4]',
    tagline: 'Portrait Standard (K3)'
  },
  {
    id: 'portrait-wide',
    name: 'Aesthetic Portrait Max',
    price: SHAPE_PRICES['portrait-wide'],
    dimensions: '8.8 × 10.8 cm',
    description: 'A slightly wider, elegant portrait frame with perfect vertical proportions. Brilliant for family portraits, vacation sceneries, and detailed captures.',
    shapeClass: 'rounded-2xl border-2 border-white/40',
    frameRatio: 'aspect-[3.5/4.25]',
    tagline: 'Wide Portrait Standard (K4)'
  },
  {
    id: 'cloud',
    name: 'Aesthetic Cloud',
    price: SHAPE_PRICES.cloud,
    dimensions: '10.5 × 12.5 cm',
    description: 'A whimsical, soft-curved organic shape that adds a touch of dreaminess to any surface. Bestseller for baby pictures and sky backdrops.',
    shapeClass: 'shape-cloud border border-white/50',
    frameRatio: 'aspect-[1.4/1]',
    tagline: 'Dreamy & Whimsical (K5)'
  },
  {
    id: 'arch',
    name: 'The Arch Frame',
    price: SHAPE_PRICES.arch,
    dimensions: '7.5 × 10.0 cm',
    description: 'An elegant, architectural shape that mimics high-end design trends. Perfectly captures portraits, vertical travel landscapes, and architecture shots.',
    shapeClass: 'shape-arch border-2 border-white/40',
    frameRatio: 'aspect-[3/4]',
    tagline: 'Architectural Dome (K6)'
  },
  {
    id: 'filmstrip',
    name: 'Vintage Film Strip',
    price: SHAPE_PRICES.filmstrip,
    dimensions: '5.7 × 15.2 cm',
    description: 'A narrative strip holding 3 of your snapshots sequentially. Perfect for storytelling: sunset phases, baby faces, or pet-run progression.',
    shapeClass: 'rounded-md border-2 border-slate-900 bg-slate-900 p-2 text-white',
    frameRatio: 'aspect-[1/3]',
    tagline: 'Storytelling Storyboard (K7)'
  },
  {
    id: 'scalloped-stand',
    name: 'Premium Scalloped Stand',
    price: SHAPE_PRICES['scalloped-stand'],
    dimensions: '12.5 × 17.5 cm',
    description: 'Our statement desk accessory. A beautiful scalloped-edge red border framing your photo, supported by a clear laser-cut acrylic stand. Perfect for office desks, bedside tables, or shelf decor.',
    shapeClass: 'shape-scalloped border-4 border-[#8B0000] bg-white p-4',
    frameRatio: 'aspect-[3/4]',
    tagline: 'Elegant Desk Display (K8)'
  },
  {
    id: 'grande',
    name: 'Grande Portrait',
    price: SHAPE_PRICES.grande,
    dimensions: '10.0 × 15.0 cm',
    description: 'Our flagship oversized vertical portrait. Perfect as a premium focal piece on your fridge or message board to display stunning detailed prints.',
    shapeClass: 'rounded-[32px] border-2 border-white/40',
    frameRatio: 'aspect-[2/3]',
    tagline: 'Premium Centerpiece (K9)'
  },
  {
    id: 'love',
    name: 'Sculpted Heart',
    price: SHAPE_PRICES.love,
    dimensions: '10.0 × 10.0 cm',
    description: 'A beautifully contoured, soft heart layout that looks like sculpted glass rather than a cliché. Ideal for anniversaries, couples, and pets.',
    shapeClass: 'shape-heart border border-white/40',
    frameRatio: 'aspect-square',
    tagline: 'Romantic & Cozy (K10)'
  },
  {
    id: 'circle',
    name: 'Minimal Circle',
    price: SHAPE_PRICES.circle,
    dimensions: '7.5 cm Diameter',
    description: 'Pure, modern, and perfectly balanced. Strips away the noise to draw immediate focus to your favorite faces or macro food and flower captures.',
    shapeClass: 'rounded-full border-2 border-white/40',
    frameRatio: 'aspect-square',
    tagline: 'Timeless & Focused (K11)'
  },
  {
    id: 'circle-bloom',
    name: 'Aesthetic Circle Cloud',
    price: SHAPE_PRICES['circle-bloom'],
    dimensions: '10.0 × 10.0 cm',
    description: 'A circular shape with magical wavy edges resembling scalloped clouds or flower patterns. Perfect for artistic close-ups and elegant decor.',
    shapeClass: 'shape-circle-cloud border border-white/50',
    frameRatio: 'aspect-square',
    tagline: 'Scalloped Bloom (K12)'
  },
  {
    id: 'hexagon',
    name: 'Honeycomb Hexagon',
    price: SHAPE_PRICES.hexagon,
    dimensions: '10.0 × 8.6 cm',
    description: 'A striking geometric hive structure. Order multiple hexagon magnets to connect and puzzle your favorite moments together on your memo board!',
    shapeClass: 'shape-hexagon border border-white/40',
    frameRatio: 'aspect-[1.15/1]',
    tagline: 'Geometric Hive'
  },
  {
    id: 'crest',
    name: 'Royal Baroque Crest',
    price: SHAPE_PRICES.crest,
    dimensions: '10.0 × 10.0 cm',
    description: 'An elegant vintage plaque featuring smooth curved corners. Ideal for royal styling, wedding keepsakes, and heirloom portraits.',
    shapeClass: 'shape-crest border-2 border-white/40',
    frameRatio: 'aspect-square',
    tagline: 'Heirloom Plaque'
  },
  {
    id: 'oval',
    name: 'Timeless Oval',
    price: SHAPE_PRICES.oval,
    dimensions: '7.5 × 10.5 cm',
    description: 'A classic portrait capsule profile that draws historical cameo elegance. Accents headshots, baby milestones, and macro florals beautifully.',
    shapeClass: 'shape-oval border-2 border-white/40',
    frameRatio: 'aspect-[2/3]',
    tagline: 'Portrait Capsule'
  },
  {
    id: 'custom',
    name: 'Custom Silhouette Outlines',
    price: SHAPE_PRICES.custom,
    dimensions: 'Up to 10.0 × 15.0 cm',
    description: 'Individually trace-cut outlines that hug the contours of your photo subjects. Completely borderless 4mm structural acrylic casting.',
    shapeClass: 'rounded-2xl border-2 border-dashed border-neutral-400',
    frameRatio: 'aspect-[4/5]',
    tagline: 'One-of-a-Kind Cut'
  }
];

export const PRESET_PHOTOS = [
  {
    id: 'couple',
    name: 'Eternal Bonds',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    credit: 'AI Studio'
  },
  {
    id: 'wedding',
    name: 'Wedding Joy',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    credit: 'AI Studio'
  },
  {
    id: 'landscape',
    name: 'Misty Dawn',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    credit: 'AI Studio'
  },
  {
    id: 'pet',
    name: 'Golden Retriever',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    credit: 'AI Studio'
  }
];

export const LIFESTYLE_GALLERY: LifestyleItem[] = [
  {
    id: 1,
    title: 'Dynamic Refrigerator Displays',
    imageUrl: '/images/hero_magnet_aesthetic_1779653460595.png', 
    category: 'Refrigerator'
  },
  {
    id: 2,
    title: 'Creative Grid Memo Workspace',
    imageUrl: '/images/lifestyle_gallery_workspace_1779653492345.png', // our home memo grid board image
    category: 'Workspace'
  },
  {
    id: 5,
    title: 'Acrylic Shape Under-light Reflection',
    imageUrl: '/images/shape_arch_magnet_1779653475722.png', // arch detail with dog
    category: 'Product Detail'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Ananya Sharma',
    location: 'Mumbai, MH',
    rating: 5,
    comment: 'I ordered the arch shapes for our travel wall. They are thick, gorgeous, and the magnetic grip is super strong. They feel like little pieces of fine art on our gold fridge instead of the cheap souvenir ones.',
    date: '2 weeks ago'
  },
  {
    id: 2,
    name: 'Kabir Mehta',
    location: 'New Delhi, DL',
    rating: 5,
    comment: 'The polaroid cutouts let me add custom captions for my cat photos. They look so elegant and minimalist! Will definitely order more as anniversary gifts next month.',
    date: '1 month ago'
  },
  {
    id: 3,
    name: 'Pooja Iyer',
    location: 'Bangalore, KA',
    rating: 5,
    comment: 'Absolutely love the glass-like acrylic edges! The silhouette contours of my baby daughter was custom cut with such high precision. WhatsApp order flow was seamless too!',
    date: '3 days ago'
  }
];

export const FAQS: FAQItem[] = [
  {
    question: 'How do I upload and submit my photos?',
    answer: 'Simply upload your desired image through our online live design studio, adjust its positioning, pan, crop directly in-frame, and click "Complete order on WhatsApp." The tool will prepare your entire cart layout, and you can instantly share the final design with our specialist team over WhatsApp Chat!'
  },
  {
    question: 'Can you custom cut the actual shape of my pet or logo?',
    answer: 'Yes! Select the "Custom Silhouette Outline" shape in our switcher. Our laser technicians will manually trace the border contour around your design (removing borders/background is included) to produce a unique drop-shadow borderless shape.'
  },
  {
    question: 'Will the colors fade over time?',
    answer: 'No. We print with premium fade-proof UV inks printed directly underneath the thick glossy top-face of the acrylic shield. This protects the image entirely from humidity, cooking steam, or UV light, meaning your memories will look stellar forever.'
  }
];
