import { MagnetShape, Testimonial, FAQItem, LifestyleItem } from './types';
import { SHAPE_PRICES } from './catalog';

export const BASE_SHAPES: MagnetShape[] = [
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
    id: 'scalloped-stand',
    name: 'Premium Scalloped Stand',
    price: SHAPE_PRICES['scalloped-stand'],
    dimensions: '12.5 × 17.5 cm',
    description: 'Our statement desk accessory. A beautiful scalloped-edge red border framing your photo, supported by a clear laser-cut acrylic stand. Perfect for office desks, bedside tables, or shelf decor.',
    shapeClass: 'shape-scalloped border-4 border-[#8B0000] bg-[#FAF8F5] p-4',
    frameRatio: 'aspect-[3/4]',
    tagline: 'Elegant Desk Display (K8)'
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
    id: 'grande',
    name: 'Grande Portrait',
    price: SHAPE_PRICES.grande,
    dimensions: '10.0 × 15.0 cm',
    description: 'Our flagship oversized vertical portrait. Perfect as a premium focal piece on your fridge or message board to display stunning detailed prints.',
    shapeClass: 'rounded-[32px] border-2 border-white/40',
    frameRatio: 'aspect-[2/3]',
    tagline: 'Premium Centerpiece (K9)'
  }
];

export const PRESET_PHOTOS = [
  {
    id: 'couple',
    name: 'Eternal Bonds',
    category: 'Couples',
    url: '/images/couple_portrait_sample_1782458143228.jpg',
    tagline: 'Romantic sunset capture'
  },
  {
    id: 'landscape',
    name: 'Scenic Horizon',
    category: 'Travel',
    url: '/images/scenic_landscape_sample_1782458156606.jpg',
    tagline: 'Mountain peaks panorama'
  },
  {
    id: 'architectural',
    name: 'Modern Atelier',
    category: 'Artistic',
    url: '/images/architectural_detail_sample_1782458171090.jpg',
    tagline: 'Minimalist shadow & light'
  }
];

export const FAQS: FAQItem[] = [
  {
    question: 'How do I upload my custom photo for acrylic printing?',
    answer: 'Simply tap "Order Now" or select any shape in our Design Studio to upload your photo. You can crop, zoom, rotate, and add custom text captions in real time.'
  },
  {
    question: 'What material are the magnets crafted from?',
    answer: 'We craft every piece from 3mm crystal-clear acrylic cast with high-precision UV inks. Backed by heavy-duty neodymium magnets for a firm grip on any fridge or memo board.'
  },
  {
    question: 'How long does shipping take across India?',
    answer: 'Orders are handcrafted within 24–48 hours and shipped via express courier (Delhivery/BlueDart Air). Estimated delivery is 2–4 business days with live tracking.'
  },
  {
    question: 'Can I order in bulk for weddings or corporate gifts?',
    answer: 'Yes! Tap the "🎁 CORPORATE & WEDDING (100+)" button to request bulk pricing with custom packaging for 100+ units.'
  }
];

export const LIFESTYLE_GALLERY: LifestyleItem[] = [
  {
    id: 1,
    title: 'Modern Minimalist Fridge Wall',
    category: 'Home Interior',
    imageUrl: '/images/lifestyle_gallery_workspace_1779653492345.png'
  },
  {
    id: 2,
    title: 'Custom Pet Acrylic Keepsakes',
    category: 'Pet Decor',
    imageUrl: '/images/shape_arch_magnet_1779653475722.png'
  },
  {
    id: 3,
    title: 'Wedding Favor Collection',
    category: 'Memories',
    imageUrl: '/images/couple_portrait_sample_1782458143228.jpg'
  }
];

export const fetchLiveCatalogShapes = async (): Promise<MagnetShape[]> => {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) return BASE_SHAPES;
    const data = await res.json();
    if (!data.products || data.products.length === 0) return BASE_SHAPES;

    const dbMap = new Map(data.products.map((p: any) => [p.id, p]));
    return BASE_SHAPES.map(base => {
      const dbProduct: any = dbMap.get(base.id);
      if (!dbProduct) return base;
      return {
        ...base,
        name: dbProduct.name || base.name,
        price: Number(dbProduct.price || base.price),
        originalPrice: Number(dbProduct.originalPrice || base.originalPrice),
        dimensions: dbProduct.dimensions || base.dimensions,
        description: dbProduct.description || base.description,
        isTrending: Boolean(dbProduct.isTrending ?? true)
      };
    });
  } catch (err) {
    console.error('fetchLiveCatalogShapes error:', err);
    return BASE_SHAPES;
  }
};
