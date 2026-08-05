import { MagnetShape, Testimonial, FAQItem, LifestyleItem } from './types';
import { SHAPE_PRICES } from './catalog';

export const BASE_SHAPES: MagnetShape[] = [
  {
    id: 'landscape',
    name: 'Rectangle Magnet',
    price: 190,
    originalPrice: 290,
    dimensions: '8x12"',
    description: 'The classic rectangular snapshot frame. Perfect for memorable landscapes, family portraits, or large joyful group photos.',
    shapeClass: 'rounded-2xl border border-white/50',
    frameRatio: 'aspect-[1.4/1]',
    tagline: 'Classic Rectangle',
    sizeOptions: [
      { label: '3.5x2.5"', price: 52, originalPrice: 99 },
      { label: '4x3"', price: 99, originalPrice: 150 },
      { label: '4x6"', price: 149, originalPrice: 220 },
      { label: '8x12"', price: 190, originalPrice: 290 }
    ]
  },
  {
    id: 'circle',
    name: 'Round Magnet',
    price: 149,
    originalPrice: 220,
    dimensions: '4"',
    description: 'Pure, modern round circle magnet. Strips away the noise to draw immediate focus to your favorite faces or memories.',
    shapeClass: 'rounded-full border-2 border-white/40',
    frameRatio: 'aspect-square',
    tagline: 'Minimal Circle',
    sizeOptions: [
      { label: '2"', price: 52, originalPrice: 99 },
      { label: '3"', price: 99, originalPrice: 150 },
      { label: '4"', price: 149, originalPrice: 220 }
    ]
  },
  {
    id: 'grande',
    name: 'Square Magnet',
    price: 149,
    originalPrice: 220,
    dimensions: '4x4"',
    description: 'Clean 1:1 symmetrical square acrylic magnet. Beautiful for Instagram feeds, close-up portraits, and landmark travel photos.',
    shapeClass: 'rounded-2xl border-2 border-white/40',
    frameRatio: 'aspect-square',
    tagline: 'Symmetrical Square',
    sizeOptions: [
      { label: '2x2"', price: 52, originalPrice: 99 },
      { label: '3x3"', price: 99, originalPrice: 150 },
      { label: '4x4"', price: 149, originalPrice: 220 }
    ]
  },
  {
    id: 'love',
    name: 'Heart Magnet',
    price: 149,
    originalPrice: 220,
    dimensions: '4"',
    description: 'A beautifully contoured, soft heart layout that looks like sculpted glass. Ideal for anniversaries, couples, and pet memories.',
    shapeClass: 'shape-heart border border-white/40',
    frameRatio: 'aspect-square',
    tagline: 'Romantic Heart',
    sizeOptions: [
      { label: '2"', price: 52, originalPrice: 99 },
      { label: '3"', price: 99, originalPrice: 150 },
      { label: '4"', price: 149, originalPrice: 220 }
    ]
  },
  {
    id: 'polaroid',
    name: 'Classic Polaroid Frame',
    price: 149,
    originalPrice: 220,
    dimensions: '4x4"',
    description: 'The nostalgic white border with a glossy image container and custom modern handwritten-font captioning.',
    shapeClass: 'shape-polaroid border border-white/50 bg-white/90 p-3 pt-3 pb-8 text-black shadow-md',
    frameRatio: 'aspect-[4/5]',
    tagline: 'Retro Polaroid',
    sizeOptions: [
      { label: '2x2"', price: 52, originalPrice: 99 },
      { label: '3x3"', price: 99, originalPrice: 150 },
      { label: '4x4"', price: 149, originalPrice: 220 }
    ]
  },
  {
    id: 'arch',
    name: 'The Arch Frame',
    price: 299,
    originalPrice: 429,
    dimensions: '4x6"',
    description: 'An elegant, architectural shape that mimics high-end design trends. Perfectly captures portraits and travel landscapes.',
    shapeClass: 'shape-arch border-2 border-white/40',
    frameRatio: 'aspect-[3/4]',
    tagline: 'Architectural Dome',
    sizeOptions: [
      { label: '3x4"', price: 149, originalPrice: 220 },
      { label: '4x6"', price: 299, originalPrice: 429 }
    ]
  },
  {
    id: 'filmstrip',
    name: 'Vintage Film Strip',
    price: 349,
    originalPrice: 499,
    dimensions: '3x9"',
    description: 'A narrative strip holding 3 of your snapshots sequentially. Perfect for storytelling: baby faces, couples, or pet progression.',
    shapeClass: 'rounded-md border-2 border-slate-900 bg-slate-900 p-2 text-white',
    frameRatio: 'aspect-[1/3]',
    tagline: '3-Photo Storyboard',
    sizeOptions: [
      { label: '2x6"', price: 199, originalPrice: 299 },
      { label: '3x9"', price: 349, originalPrice: 499 }
    ]
  },
  {
    id: 'hexagon',
    name: 'Honeycomb Hexagon',
    price: 329,
    originalPrice: 429,
    dimensions: '4"',
    description: 'A striking geometric hive structure. Order multiple hexagon magnets to connect and puzzle your favorite moments together.',
    shapeClass: 'shape-hexagon border border-white/40',
    frameRatio: 'aspect-[1.15/1]',
    tagline: 'Geometric Hive',
    sizeOptions: [
      { label: '3"', price: 149, originalPrice: 220 },
      { label: '4"', price: 329, originalPrice: 429 }
    ]
  },
  {
    id: 'oval',
    name: 'Timeless Oval',
    price: 299,
    originalPrice: 429,
    dimensions: '4x6"',
    description: 'A classic portrait capsule profile that draws historical cameo elegance. Accents headshots, baby milestones, and florals beautifully.',
    shapeClass: 'shape-oval border-2 border-white/40',
    frameRatio: 'aspect-[2/3]',
    tagline: 'Portrait Capsule',
    sizeOptions: [
      { label: '3x4"', price: 149, originalPrice: 220 },
      { label: '4x6"', price: 299, originalPrice: 429 }
    ]
  },
  {
    id: 'scalloped-stand',
    name: 'Premium Scalloped Stand',
    price: 449,
    originalPrice: 599,
    dimensions: '5x7"',
    description: 'Our statement desk accessory with a clear laser-cut acrylic stand. Perfect for office desks, bedside tables, or shelf decor.',
    shapeClass: 'shape-scalloped border-4 border-[#8B0000] bg-white p-4',
    frameRatio: 'aspect-[3/4]',
    tagline: 'Elegant Desk Display',
    sizeOptions: [
      { label: '5x7"', price: 449, originalPrice: 599 }
    ]
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

export async function fetchLiveCatalogShapes(): Promise<MagnetShape[]> {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) return BASE_SHAPES;
    const data = await res.json();
    if (!data.products || !Array.isArray(data.products)) return BASE_SHAPES;
    
    const priceMap = new Map<string, number>();
    for (const p of data.products) {
      priceMap.set(p.id, Number(p.price));
    }

    return BASE_SHAPES.map(shape => ({
      ...shape,
      price: priceMap.has(shape.id) ? (priceMap.get(shape.id) as number) : shape.price
    }));
  } catch (err) {
    return BASE_SHAPES;
  }
}
