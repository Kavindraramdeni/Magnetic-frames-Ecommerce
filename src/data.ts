import { MagnetShape, Testimonial, FAQItem, LifestyleItem, ReturnGiftProduct } from './types';
import { SHAPE_PRICES } from './catalog';

export const BASE_SHAPES: MagnetShape[] = [
  {
    id: 'love',
    name: 'Sculpted Heart',
    price: 249,
    originalPrice: 349,
    dimensions: '3 × 3 inch',
    description: 'Personalized acrylic magnetic heart frame.',
    shapeClass: 'shape-heart border border-white/40',
    frameRatio: 'aspect-square',
    tagline: 'Romantic & Cozy · 3 Sizes',
    isTrending: true,
    sizes: [
      { size: '2 × 2 inch', label: '2 × 2"', price: 199, originalPrice: 299 },
      { size: '3 × 3 inch', label: '3 × 3"', price: 249, originalPrice: 349 },
      { size: '4 × 4 inch', label: '4 × 4"', price: 299, originalPrice: 399 }
    ]
  },
  {
    id: 'circle',
    name: 'Minimal Circle',
    price: 249,
    originalPrice: 349,
    dimensions: '3 × 3 inch',
    description: 'Personalized acrylic magnetic circle frame.',
    shapeClass: 'rounded-full border-2 border-white/40',
    frameRatio: 'aspect-square',
    tagline: 'Timeless & Focused · 3 Sizes',
    isTrending: true,
    sizes: [
      { size: '2 × 2 inch', label: '2 × 2"', price: 199, originalPrice: 299 },
      { size: '3 × 3 inch', label: '3 × 3"', price: 249, originalPrice: 349 },
      { size: '4 × 4 inch', label: '4 × 4"', price: 299, originalPrice: 399 }
    ]
  },
  {
    id: 'polaroid',
    name: 'Classic Polaroid',
    price: 279,
    originalPrice: 379,
    dimensions: '3 × 4 inch',
    description: 'Personalized acrylic magnetic polaroid frame with custom caption.',
    shapeClass: 'shape-polaroid border border-white/50 bg-white/90 p-3 pt-3 pb-8 text-black shadow-md',
    frameRatio: 'aspect-[4/5]',
    tagline: 'Retro Nostalgia · 2 Sizes',
    isTrending: true,
    sizes: [
      { size: '2 × 3 inch', label: '2 × 3"', price: 229, originalPrice: 329 },
      { size: '3 × 4 inch', label: '3 × 4"', price: 279, originalPrice: 379 }
    ]
  },
  {
    id: 'grande',
    name: 'Statement Grande',
    price: 349,
    originalPrice: 499,
    dimensions: '4 × 6 inch',
    description: 'Personalized oversized vertical acrylic magnetic frame.',
    shapeClass: 'rounded-[32px] border-2 border-white/40',
    frameRatio: 'aspect-[2/3]',
    tagline: 'Premium Centerpiece · 4 × 6"',
    isTrending: true,
    sizes: [
      { size: '4 × 6 inch', label: '4 × 6"', price: 349, originalPrice: 499 }
    ]
  }
];

export const CUSTOMIZABLE_FRAMES = BASE_SHAPES;

export const RETURN_GIFTS: ReturnGiftProduct[] = [
  {
    id: 'rg-ganesha',
    name: 'Divine Blessings Ganesha Frame',
    category: 'Spiritual & Housewarming',
    theme: 'Pooja, Housewarming & Traditional Weddings',
    dimensions: '3 × 4 inch',
    price: 199,
    originalPrice: 299,
    imageUrl: '/images/return_gift_ganesha.svg',
    description: 'Auspicious gold-embossed Shubh Labh Lord Ganesha art framed in high-clarity 3mm acrylic with magnetic backing. Ideal for welcoming guests at home ceremonies.',
    tagline: 'Auspicious Keepsake · Ready to Gift',
    shapeId: 'arch'
  },
  {
    id: 'rg-teddy',
    name: 'Baby Joy & Milestones Nursery Frame',
    category: '1st Birthday & Baby Shower',
    theme: 'Cradle Ceremony, Naming Day & 1st Birthday Parties',
    dimensions: '3 × 3 inch',
    price: 199,
    originalPrice: 299,
    imageUrl: '/images/return_gift_baby_teddy.svg',
    description: 'Heartwarming watercolor nursery teddy and celebratory balloons artwork. A delightful keepsake for guests celebrating your little one.',
    tagline: 'Birthday Favor · Ready to Gift',
    shapeId: 'circle'
  },
  {
    id: 'rg-wedding',
    name: 'Floral Monogram Wedding Favor Frame',
    category: 'Wedding & Reception Favors',
    theme: 'Wedding Return Gifts & Engagement Celebrations',
    dimensions: '3 × 4 inch',
    price: 199,
    originalPrice: 299,
    imageUrl: '/images/return_gift_wedding_favor.svg',
    description: 'Luxury botanical wreath with gold filigree and "Thank You for Celebrating With Us". An unforgettable wedding favor that stays on guests\' refrigerators forever.',
    tagline: 'Wedding Keepsake · Ready to Gift',
    shapeId: 'polaroid'
  },
  {
    id: 'rg-mandala',
    name: 'Auspicious Heritage Golden Mandala Frame',
    category: 'Festive & Corporate Gifting',
    theme: 'Diwali, Corporate Thank-You & Anniversaries',
    dimensions: '3 × 3 inch',
    price: 199,
    originalPrice: 299,
    imageUrl: '/images/return_gift_gold_mandala.svg',
    description: 'Intricate royal gold mandala art on midnight velvet background conveying prosperity and harmony. The ultimate luxury keepsake for corporate & festive gifting.',
    tagline: 'Heritage Gift · Ready to Gift',
    shapeId: 'circle'
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
