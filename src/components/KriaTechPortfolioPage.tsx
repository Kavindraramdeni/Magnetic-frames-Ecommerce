import React, { useState, useEffect } from 'react';
import {
  MessageCircle, Star, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ShieldCheck,
  Package, Award, Heart, Sparkles, CheckCircle2, Phone,
  MapPin, Clock, Users, ArrowUpRight,
  ArrowLeft, ZoomIn, Check, Info, Calendar, Gift, Crown, Truck, Coins, Key
} from 'lucide-react';

const WA_NUMBER = '919392576792';

function waLink(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

interface ProductSize {
  label: string;
  dimensions: string;
  basePrice: number;
  originalPrice: number;
}

interface Product {
  id: string;
  name: string;
  tagline: string;
  subtitle: string;
  image: string;
  category: string;
  sizes: ProductSize[];
  accentColor: string;
  bgGlow: string;
}

// Exactly arranged in order: rectangle, square, circle, heart
const PRODUCTS: Product[] = [
  {
    id: 'rectangle',
    name: 'Classic Rectangle',
    tagline: 'Architectural & Landscape Panorama',
    subtitle: 'Personalised acrylic magnetic rectangle frame',
    image: '/images/scenic_landscape_sample_1782458156606.jpg',
    category: 'Landscape & Panorama',
    sizes: [
      { label: '2 × 3"', dimensions: '2 × 3 inch', basePrice: 229, originalPrice: 329 },
      { label: '3 × 4"', dimensions: '3 × 4 inch', basePrice: 279, originalPrice: 379 },
      { label: '4 × 6"', dimensions: '4 × 6 inch', basePrice: 349, originalPrice: 499 }
    ],
    accentColor: '#365349',
    bgGlow: 'from-emerald-100/60 via-sand-50/40 to-transparent'
  },
  {
    id: 'square',
    name: 'Minimal Square',
    tagline: 'Geometric Balance & Modern Grids',
    subtitle: 'Personalised acrylic magnetic square frame',
    image: '/images/couple_portrait_sample_1782458143228.jpg',
    category: 'Grid & Modern Living',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 199, originalPrice: 299 },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 249, originalPrice: 349 },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 299, originalPrice: 399 }
    ],
    accentColor: '#A3704C',
    bgGlow: 'from-amber-100/60 via-stone-50/40 to-transparent'
  },
  {
    id: 'circle',
    name: 'Minimal Circle',
    tagline: 'Infinite Symmetry & Contemporary Zen',
    subtitle: 'Personalised acrylic magnetic circle frame',
    image: '/images/shape_circle_family_dog.jpg',
    category: 'Modern Living',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 199, originalPrice: 299 },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 249, originalPrice: 349 },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 299, originalPrice: 399 }
    ],
    accentColor: '#4A6B82',
    bgGlow: 'from-sky-100/60 via-amber-50/40 to-transparent'
  },
  {
    id: 'heart',
    name: 'Sculpted Heart',
    tagline: 'Romance & Everlasting Keepsakes',
    subtitle: 'Personalised acrylic magnetic heart frame',
    image: '/images/shape_heart_wedding_couple.png',
    category: 'Celebration & Gifting',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 199, originalPrice: 299 },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 249, originalPrice: 349 },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 299, originalPrice: 399 }
    ],
    accentColor: '#B76E79',
    bgGlow: 'from-rose-100/60 via-pink-50/40 to-transparent'
  }
];

const QUANTITY_TIERS = [
  { label: '50 Pcs', count: 50, discountPct: 30 },
  { label: '100 pcs', count: 100, discountPct: 35 },
  { label: '250 pcs', count: 250, discountPct: 40 },
  { label: '500 pcs', count: 500, discountPct: 45 },
  { label: '1000 pcs', count: 1000, discountPct: 50 },
  { label: 'Custom', count: 0, discountPct: 30 }
];

// Sliding images for Hero Carousel
const HERO_SLIDES = [
  {
    image: '/images/refrigerator_magnets_lifestyle_1782460255084.jpg',
    title: 'Diamond-Cut Acrylic Frame Magnets',
    subtitle: 'Laser-contoured 3mm monolithic cast acrylic handcrafted in Hyderabad',
    badge: 'Real Lifestyle Gallery'
  },
  {
    image: '/images/acrylic_magnets_hero_1782423101134.jpg',
    title: 'Sub-Surface 300 DPI UV Pigment',
    subtitle: 'Fade-proof photographic clarity backed by rare-earth neodymium magnetic cores',
    badge: 'Optical Clarity'
  },
  {
    image: '/images/lifestyle_gallery_workspace_1779653492345.png',
    title: 'Starter Kit · 12 Frames for ₹999',
    subtitle: 'Includes 2 of each shape: Rectangle, Square, Circle & Heart',
    badge: 'Special Value Offer'
  },
  {
    image: '/images/scalloped_stand_product_preview_1782458429878.jpg',
    title: 'Pre-Finished Mirror Bevels',
    subtitle: 'Zero fading, zero yellowing, and 100% moisture-sealed protection',
    badge: 'Factory Direct'
  }
];

const FAQS = [
  {
    q: 'Why cast acrylic over regular plastic or photo frames?',
    a: 'We use 100% cell-cast monolithic acrylic with 93% optical light transmittance. It never yellows, does not warp, and is completely shatterproof.'
  },
  {
    q: 'How is my photo printed onto the frame?',
    a: 'Printed at 300 DPI directly onto the sub-surface of 3mm acrylic with UV-cured pigment ink and a pure white light-blocking backcoat. Resistant to moisture, sun UV, and fingerprints.'
  },
  {
    q: 'Will the neodymium magnet slide or scratch metal surfaces?',
    a: 'No. Grade N35 rare-earth neodymium magnets are countersunk flush into the back for strong shear resistance that will not slip down or scratch enamel.'
  },
  {
    q: 'What is included in the ₹999 Starter Kit?',
    a: 'The Starter Kit includes 10 custom acrylic photo frames (Square K1, Portrait K2, Gallery K3, Heart K4, Circle K5, Cloud K6, Wide Cloud K6-L, Filmstrip K7, Grande K9, and Adhesive K2) plus 2 FREE Bonus Acrylic Photo Keychains (Round K10 & Pocket Mini K11) with free doorstep air delivery across India.'
  },
  {
    q: 'How fast is dispatch and shipping across India?',
    a: 'Produced within 24–48 hours at our Hyderabad facility, then shipped via express air couriers (Blue Dart / DTDC / Delhivery) delivering in 2–4 business days with tracking.'
  }
];

// 10 Custom Acrylic Frames + 2 FREE Bonus Keychains from Catalog
const STARTER_KIT_ITEMS = [
  {
    code: 'K1',
    name: 'Minimal Square',
    size: '2.2 × 2.2 in',
    subtitle: 'Balanced square ratio for candid memories',
    category: 'Fridge Magnet',
    badge: 'Square',
    image: '/images/couple_portrait_sample_1782458143228.jpg',
    aspectRatio: 'aspect-square',
    roundedClass: 'rounded-2xl',
    isBonus: false
  },
  {
    code: 'K2',
    name: 'Classic Portrait',
    size: '3.5 × 2.5 in',
    subtitle: 'Signature polaroid ratio portrait frame',
    category: 'Fridge Magnet',
    badge: 'Most Selling',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    image: '/images/scalloped_stand_product_preview_1782458429878.jpg',
    aspectRatio: 'aspect-[2.5/3.5]',
    roundedClass: 'rounded-2xl',
    isBonus: false
  },
  {
    code: 'K3',
    name: 'Medium Gallery',
    size: '3.0 × 4.0 in',
    subtitle: 'Substantial portrait frame for fridge & desk',
    category: 'Fridge Magnet',
    badge: 'Medium',
    image: '/images/architectural_detail_sample_1782458171090.jpg',
    aspectRatio: 'aspect-[3/4]',
    roundedClass: 'rounded-2xl',
    isBonus: false
  },
  {
    code: 'K4',
    name: 'Sculpted Love Heart',
    size: '3.0 in',
    subtitle: 'Laser-contoured heart perimeter for couples',
    category: 'Fridge Magnet',
    badge: 'Heart',
    image: '/images/shape_heart_wedding_couple.png',
    aspectRatio: 'aspect-square',
    roundedClass: 'rounded-[2rem]',
    isBonus: false,
    isHeart: true
  },
  {
    code: 'K5',
    name: 'Pure Geometric Circle',
    size: '3.0 in',
    subtitle: 'Radial symmetry with hand-buffed perimeter',
    category: 'Fridge Magnet',
    badge: 'Circle',
    image: '/images/shape_circle_family_dog.jpg',
    aspectRatio: 'aspect-square',
    roundedClass: 'rounded-full',
    isBonus: false
  },
  {
    code: 'K6',
    name: 'Scalloped Cloud',
    size: '2.5 × 3.5 in',
    subtitle: 'Undulating scalloped edge cloud silhouette',
    category: 'Fridge Magnet',
    badge: 'Artisanal Scallop',
    image: '/images/shape_cloud_magnet_1780939383548.png',
    aspectRatio: 'aspect-[2.5/3.5]',
    roundedClass: 'rounded-3xl border-dashed',
    isBonus: false
  },
  {
    code: 'K6-L',
    name: 'Wide Cloud Panorama',
    size: '4.0 × 3.0 in',
    subtitle: 'Horizontal scalloped cloud for landscapes',
    category: 'Fridge Magnet',
    badge: 'Landscape Cloud',
    image: '/images/shape_cloud_magnet_1780939383548.png',
    aspectRatio: 'aspect-[4/3]',
    roundedClass: 'rounded-3xl border-dashed',
    isBonus: false
  },
  {
    code: 'K7',
    name: '3-Photo Story Filmstrip',
    size: '2.25 × 6.0 in',
    subtitle: 'Vertical 3-photo story timeline bookmark',
    category: 'Fridge Magnet',
    badge: '3-Photo Strip',
    image: '/images/shape_filmstrip_magnet_1780939443747.png',
    aspectRatio: 'aspect-[2.25/6]',
    roundedClass: 'rounded-xl',
    isBonus: false,
    isFilmstrip: true
  },
  {
    code: 'K9',
    name: 'Grande Panorama',
    size: '4.0 × 6.0 in',
    subtitle: 'Architectural full-scale statement frame',
    category: 'Fridge Magnet',
    badge: 'Most Selling',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    image: '/images/scenic_landscape_sample_1782458156606.jpg',
    aspectRatio: 'aspect-[6/4]',
    roundedClass: 'rounded-2xl',
    isBonus: false
  },
  {
    code: 'K2-Adh',
    name: 'Adhesive Wall/Mirror Plate',
    size: '3.5 × 2.5 in',
    subtitle: 'Non-magnetic adhesive back for tiles & wood',
    category: 'Adhesive Frame',
    badge: 'No Magnet (Adhesive)',
    badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
    image: '/images/couple_portrait_sample_1782458143228.jpg',
    aspectRatio: 'aspect-[2.5/3.5]',
    roundedClass: 'rounded-2xl',
    isBonus: false
  },
  {
    code: 'K10',
    name: 'Round Acrylic Keychain',
    size: '2.0 × 2.0 in',
    subtitle: 'Double-sided acrylic with metal ring & chain',
    category: 'Bonus Gift',
    badge: 'FREE OFFER GIFT',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
    image: '/images/shape_circle_family_dog.jpg',
    aspectRatio: 'aspect-square',
    roundedClass: 'rounded-full',
    isBonus: true,
    isKeychain: true
  },
  {
    code: 'K11',
    name: 'Pocket Mini Keychain',
    size: '1.4 × 2.0 in',
    subtitle: 'Everyday pocket photo medallion with ring',
    category: 'Bonus Gift',
    badge: 'FREE OFFER GIFT',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
    image: '/images/scalloped_stand_product_preview_1782458429878.jpg',
    aspectRatio: 'aspect-[1.4/2]',
    roundedClass: 'rounded-xl',
    isBonus: true,
    isKeychain: true
  }
];

interface Props {
  onBackToStore?: () => void;
}

export default function KriaTechPortfolioPage({ onBackToStore }: Props) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isStarterKitOpen, setIsStarterKitOpen] = useState<boolean>(false);
  const [activeSizeIndex, setActiveSizeIndex] = useState<number>(0);
  const [selectedQtyLabel, setSelectedQtyLabel] = useState<string>('50 Pcs');
  const [customQtyValue, setCustomQtyValue] = useState<number>(75);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [activeGalleryTab, setActiveGalleryTab] = useState<'frame' | 'how_to_use' | 'on_fridge' | 'gift_box'>('frame');
  const [isHoverZooming, setIsHoverZooming] = useState<boolean>(false);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const handlePreviewMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ x, y });
  };

  // Active product calculation
  const activeProduct = selectedProductId ? PRODUCTS.find((p) => p.id === selectedProductId) || null : null;

  // Auto-play sliding hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Open product with browser history pushState so Chrome back button works naturally
  const handleOpenProduct = (shapeId: string) => {
    setIsStarterKitOpen(false);
    setSelectedProductId(shapeId);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('kit');
      url.searchParams.set('product', shapeId);
      window.history.pushState({ page: 'product', product: shapeId }, '', url.toString());
    } catch (e) {
      console.warn('history.pushState error:', e);
    }
  };

  // Open Complete 12-Piece Box Set dedicated page with browser history
  const handleOpenStarterKit = () => {
    setSelectedProductId(null);
    setIsStarterKitOpen(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      url.searchParams.set('kit', '12-piece');
      window.history.pushState({ page: 'starter-kit' }, '', url.toString());
    } catch (e) {
      console.warn('history.pushState error:', e);
    }
  };

  // Close Starter Kit page and return to home view
  const handleCloseStarterKit = (targetHash?: string) => {
    try {
      if (window.history.state?.page === 'starter-kit') {
        window.history.back();
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete('kit');
        if (targetHash) {
          url.hash = targetHash;
        }
        window.history.replaceState({ page: 'home' }, '', url.toString());
        setIsStarterKitOpen(false);
      }
    } catch {
      setIsStarterKitOpen(false);
    }
  };

  // Close product/starter-kit and return to home view (respects browser history)
  const handleCloseProduct = (targetHash?: string) => {
    try {
      if (window.history.state?.page === 'product' || window.history.state?.page === 'starter-kit') {
        window.history.back();
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete('product');
        url.searchParams.delete('kit');
        if (targetHash) {
          url.hash = targetHash;
        }
        window.history.replaceState({ page: 'home' }, '', url.toString());
        setSelectedProductId(null);
        setIsStarterKitOpen(false);
      }
    } catch {
      setSelectedProductId(null);
      setIsStarterKitOpen(false);
    }
  };

  // Synchronize browser history and Chrome Back/Forward buttons
  useEffect(() => {
    const parseUrl = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const prodParam = params.get('product');
        const kitParam = params.get('kit');
        if (kitParam) {
          setIsStarterKitOpen(true);
          setSelectedProductId(null);
        } else if (prodParam && PRODUCTS.some((p) => p.id === prodParam)) {
          setSelectedProductId(prodParam);
          setIsStarterKitOpen(false);
        } else {
          setSelectedProductId(null);
          setIsStarterKitOpen(false);
        }
      } catch (err) {
        console.warn('Error reading URL params:', err);
      }
    };

    // Check initial URL on mount
    parseUrl();

    // Ensure root entry exists in history so Chrome back button stays within the app
    if (!window.history.state) {
      try {
        window.history.replaceState({ page: 'home' }, '', window.location.href);
      } catch (e) {}
    }

    const onPopState = () => {
      parseUrl();
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Reset size index and gallery tab when product changes
  useEffect(() => {
    setActiveSizeIndex(0);
    setSelectedQtyLabel('50 Pcs');
    setActiveGalleryTab('frame');
    setIsHoverZooming(false);
  }, [selectedProductId]);

  // Sync scroll on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedProductId, isStarterKitOpen]);

  // Calculation for Product Detail Page
  const currentSize = activeProduct ? activeProduct.sizes[activeSizeIndex] || activeProduct.sizes[0] : null;
  const currentTier = QUANTITY_TIERS.find((t) => t.label === selectedQtyLabel) || QUANTITY_TIERS[0];
  const actualQty = currentTier.label === 'Custom' ? Math.max(1, customQtyValue) : currentTier.count;
  const discountRate = actualQty >= 1000 ? 0.50 : actualQty >= 500 ? 0.45 : actualQty >= 250 ? 0.40 : actualQty >= 100 ? 0.35 : actualQty >= 50 ? 0.30 : 0.15;
  const unitOriginalPrice = currentSize ? currentSize.basePrice : 199;
  const unitDiscountedPrice = Math.round(unitOriginalPrice * (1 - discountRate));
  const discountPercentage = Math.round(discountRate * 100);
  const totalPrice = unitDiscountedPrice * actualQty;
  const originalTotalPrice = unitOriginalPrice * actualQty;
  const factorySavings = originalTotalPrice - totalPrice;

  // Helper to construct exact structured WhatsApp specifications
  const buildExactQuoteMessage = (prodName: string, sizeLabel: string, dimensions: string, qty: number, unitRate: number, origRate: number, total: number, savings: number) => {
    return `Hi KRIA Tech! I have selected my product specifications on your website:

• Product Shape: ${prodName}
• Dimension: ${sizeLabel} (${dimensions})
• Batch Quantity: ${qty} pcs
• Unit Rate: ₹${unitRate} / pc (Original ₹${origRate}, ${discountPercentage}% bulk discount)
• Total Estimate: ₹${total.toLocaleString('en-IN')}
• Factory Direct Savings: ₹${savings.toLocaleString('en-IN')}

I have my photo ready for review. Please confirm order placement and dispatch timeline.`;
  };

  const handleOpenConfigurator = (shapeId: string = 'rectangle') => {
    handleOpenProduct(shapeId);
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E1B18] font-sans antialiased overflow-x-hidden selection:bg-[#EBDDC7] selection:text-[#1E1B18]">
      
      {/* Ambient Luxury Background Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#F5E6D3]/70 to-[#ECD5BB]/40 blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-48 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#EAD9C6]/60 via-[#F7ECE1]/40 to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#F2E4D5]/60 to-[#FFF7EE]/30 blur-3xl opacity-60" />
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{ 
            backgroundImage: 'radial-gradient(#8C6D46 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      {/* ─── DEDICATED HEADER: PRODUCTS, STARTER KIT, SUBSCRIPTION ─── */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 backdrop-blur-2xl bg-[#FDFBF7]/85 border-b border-[#EADCCB]/60 shadow-[0_4px_24px_rgba(180,150,110,0.06)] transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <button 
            type="button"
            onClick={() => handleCloseProduct()}
            className="flex items-center gap-3 group cursor-pointer text-left"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#FAF3EA] via-[#F2E5D4] to-[#DFCEB7] border border-[#D8C2A6]/80 flex items-center justify-center shadow-[0_4px_12px_rgba(180,140,90,0.15)] group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-4.5 w-4.5 text-[#8C6436]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1E1B18] leading-none group-hover:text-[#8C6436] transition-colors">
                KRIA<span className="text-[#A78255] font-light">Tech</span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#918171] mt-0.5">
                Cast Acrylic Atelier · Hyderabad
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links: products, starter kit, subscription */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#6E6359]">
            <a 
              href="#products" 
              onClick={() => handleCloseProduct('#products')}
              className="hover:text-[#1E1B18] transition-colors py-1 cursor-pointer"
            >
              Products
            </a>
            <a 
              href="#starter-kit" 
              onClick={() => handleCloseProduct('#starter-kit')}
              className="hover:text-[#1E1B18] transition-colors py-1 cursor-pointer"
            >
              Starter Kit (12 for ₹999)
            </a>
            <a 
              href="#subscription" 
              onClick={() => handleCloseProduct('#subscription')}
              className="hover:text-[#1E1B18] transition-colors py-1 cursor-pointer"
            >
              Subscription
            </a>
          </nav>

          {/* Quick Action Hotline Pill: Configures or sends exact specs */}
          <div className="flex items-center gap-2.5">
            {activeProduct && currentSize ? (
              <a
                href={waLink(buildExactQuoteMessage(activeProduct.name, currentSize.label, currentSize.dimensions, actualQty, unitDiscountedPrice, unitOriginalPrice, totalPrice, factorySavings))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(37,211,102,0.28)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Quote ({actualQty} pcs)</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenConfigurator('rectangle')}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(37,211,102,0.28)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Choose Specs & Quote</span>
              </button>
            )}

            {onBackToStore && (
              <button
                type="button"
                onClick={onBackToStore}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono tracking-widest uppercase text-[#857566] hover:text-[#1E1B18] border border-[#E0D0BE]/70 rounded-full bg-white/50 hover:bg-white/90 transition-all cursor-pointer"
                title="Switch to Storefront view"
              >
                <span>Store</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          VIEW 1: DEDICATED SEPARATE PRODUCT DETAIL PAGE
      ══════════════════════════════════════════════════════════ */}
      {activeProduct && currentSize ? (
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
          {/* Breadcrumb / Back button */}
          <button
            type="button"
            onClick={() => handleCloseProduct()}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8C6436] hover:text-[#1E1B18] mb-8 py-1.5 px-3 rounded-full bg-white/70 border border-[#E8DACB] shadow-xs cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Products</span>
          </button>

          {/* Two-Column Product Configuration Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* ── LEFT COLUMN: PREVIEW IMAGE ───────────────────── */}
            <div className="lg:col-span-6 lg:sticky lg:top-24">
              <div className="relative rounded-3xl bg-white/90 backdrop-blur-2xl border border-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(180,140,80,0.12)] overflow-hidden group">
                
                {/* Subtle crystal reflection border */}
                <div className="absolute inset-0 border border-[#EADCCE]/70 rounded-3xl pointer-events-none" />
                
                {/* Image Frame Container with Dynamic Dimensions & Interactive Zoom */}
                <div 
                  className="relative aspect-square w-full max-w-md mx-auto flex items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-[#FAF5EE] to-[#F1E5D5]/60 overflow-hidden select-none cursor-crosshair border border-[#E8DACB]"
                  onMouseEnter={() => setIsHoverZooming(true)}
                  onMouseLeave={() => setIsHoverZooming(false)}
                  onMouseMove={handlePreviewMouseMove}
                >
                  {/* Dynamic Dimension Frame Scaling */}
                  {activeGalleryTab === 'frame' ? (
                    <div 
                      className="relative transition-all duration-300 ease-out flex items-center justify-center p-2"
                      style={
                        currentSize?.label?.includes('2 × 3') ? { width: '60%', height: '84%', maxWidth: '230px', aspectRatio: '2/3' } :
                        currentSize?.label?.includes('3 × 4') ? { width: '74%', height: '92%', maxWidth: '280px', aspectRatio: '3/4' } :
                        currentSize?.label?.includes('4 × 6') ? { width: '88%', height: '100%', maxWidth: '330px', aspectRatio: '2/3' } :
                        currentSize?.label?.includes('2 × 2') ? { width: '58%', height: '58%', maxWidth: '210px', aspectRatio: '1/1' } :
                        currentSize?.label?.includes('3 × 3') ? { width: '76%', height: '76%', maxWidth: '275px', aspectRatio: '1/1' } :
                        currentSize?.label?.includes('4 × 4') ? { width: '92%', height: '92%', maxWidth: '330px', aspectRatio: '1/1' } :
                        { width: '80%', height: '80%', maxWidth: '300px' }
                      }
                    >
                      <img
                        src={activeProduct.image}
                        alt={activeProduct.name}
                        style={{
                          transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                          transform: isHoverZooming ? 'scale(2.2)' : 'scale(1)',
                        }}
                        className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(80,50,20,0.28)] transition-transform duration-150 pointer-events-none select-none"
                      />
                      
                      {/* Floating Dimension Tag on the Frame */}
                      <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E4D3C0] text-[10px] font-mono font-bold text-[#5A4D3F] shadow-xs">
                        {currentSize?.label}
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={
                          activeGalleryTab === 'how_to_use'
                            ? '/images/banner_easy_4step_installation.png'
                            : activeGalleryTab === 'on_fridge'
                            ? '/images/banner_perfect_for_magnetic_surfaces.png'
                            : '/images/banner_premium_design_made_to_last.png'
                        }
                        alt={activeGalleryTab}
                        style={{
                          transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                          transform: isHoverZooming ? 'scale(2.2)' : 'scale(1)',
                        }}
                        className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-150 pointer-events-none select-none"
                      />
                    </div>
                  )}
                  
                  {/* Acrylic Spec Floating Pill */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E4D3C0] text-[10px] font-mono font-bold uppercase tracking-wider text-[#7C6348] shadow-xs pointer-events-none">
                    3mm Optical Cast Glass
                  </div>

                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E4D3C0] text-[10px] font-mono text-[#5A4D3F] shadow-xs flex items-center gap-1.5 pointer-events-none">
                    <ZoomIn className="h-3 w-3 text-[#A78255]" />
                    <span>Selected: {currentSize?.dimensions}</span>
                  </div>
                </div>

                {/* Hover zoom helper label matching user screenshot */}
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#8C7A68] font-mono">
                  <ZoomIn className="h-3.5 w-3.5 text-[#A78255]" />
                  <span>Hover over the image to zoom</span>
                </div>

                {/* 4 Interactive Thumbnails Gallery Row */}
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mt-4">
                  {[
                    { id: 'frame' as const, label: 'Frame Photo', image: activeProduct.image, isShape: true },
                    { id: 'how_to_use' as const, label: 'How to Use', image: '/images/banner_easy_4step_installation.png', isShape: false },
                    { id: 'on_fridge' as const, label: 'On Fridge', image: '/images/banner_perfect_for_magnetic_surfaces.png', isShape: false },
                    { id: 'gift_box' as const, label: 'Gift Box', image: '/images/banner_premium_design_made_to_last.png', isShape: false }
                  ].map((thumb) => {
                    const isActive = activeGalleryTab === thumb.id;
                    return (
                      <button
                        key={thumb.id}
                        type="button"
                        onClick={() => setActiveGalleryTab(thumb.id)}
                        className={`flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white border-[#1E1B18] ring-2 ring-[#1E1B18]/15 shadow-sm scale-[1.02]'
                            : 'bg-white/80 border-[#E8DACB] hover:border-[#BFA890] hover:bg-white'
                        }`}
                      >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center overflow-hidden rounded-xl bg-[#FAF6F0] p-1">
                          <img
                            src={thumb.image}
                            alt={thumb.label}
                            className={`w-full h-full ${thumb.isShape ? 'object-contain' : 'object-cover'} rounded-lg`}
                          />
                        </div>
                        <span className={`mt-1.5 text-[11px] sm:text-xs font-mono leading-tight text-center ${
                          isActive ? 'font-bold text-[#1E1B18]' : 'text-[#736353]'
                        }`}>
                          {thumb.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 text-center text-xs text-[#8C7A68] font-mono">
                  ✦ Hand-beveled optical perimeter with flush neodymium magnet
                </p>
              </div>
            </div>

            {/* ── RIGHT COLUMN: CONFIGURATOR & PRICING ──────────── */}
            <div className="lg:col-span-6 space-y-7">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold">
                  {activeProduct.category}
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#1E1B18] mt-1">
                  {activeProduct.name}
                </h1>
                <p className="text-sm text-[#736353] mt-2 font-mono">
                  {activeProduct.subtitle} · {currentSize?.dimensions}
                </p>
              </div>

              {/* 1. Available Sizes: Choose dimension */}
              <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#EADECE]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#7C6348] font-bold">
                    Available Sizes
                  </span>
                  <span className="text-xs text-[#9B8977] font-mono">
                    Choose dimension
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {activeProduct.sizes.map((sz, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveSizeIndex(idx);
                        setActiveGalleryTab('frame');
                      }}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        activeSizeIndex === idx
                          ? 'bg-[#1E1B18] text-white border-[#1E1B18] shadow-md scale-[1.02]'
                          : 'bg-white text-[#52463A] border-[#E2D2C2] hover:bg-[#FAF4ED]'
                      }`}
                    >
                      <span className="font-serif text-lg font-medium">{sz.label}</span>
                      <span className={`text-[10px] font-mono mt-0.5 ${activeSizeIndex === idx ? 'text-neutral-300' : 'text-[#8A7969]'}`}>
                        Base ₹{sz.basePrice}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Batch Quantity */}
              <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#EADECE]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#7C6348] font-bold">
                    Batch Quantity
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-semibold">
                    Volume Tier Discount
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {QUANTITY_TIERS.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setSelectedQtyLabel(t.label)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-mono border text-center transition-all cursor-pointer ${
                        selectedQtyLabel === t.label
                          ? 'bg-[#1E1B18] text-white border-[#1E1B18] shadow-xs'
                          : 'bg-white text-[#635547] border-[#E4D5C5] hover:bg-[#FAF4ED]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Custom Quantity Stepper if Custom is chosen */}
                {selectedQtyLabel === 'Custom' && (
                  <div className="mt-4 pt-3 border-t border-[#EFE5D9] flex items-center gap-3">
                    <span className="text-xs font-mono text-[#6E6153]">Enter exact pieces:</span>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={customQtyValue}
                      onChange={(e) => setCustomQtyValue(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-28 px-3 py-1.5 rounded-lg border border-[#D8C7B5] bg-white font-mono text-sm text-[#1E1B18] outline-none focus:ring-2 focus:ring-[#C4A574]"
                    />
                    <span className="text-xs font-mono text-[#8C7A68]">frames</span>
                  </div>
                )}
              </div>

              {/* 3. Live Pricing Calculation Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FAF3EA] via-white to-[#F5ECE1] border border-[#E4D4C3] shadow-[0_10px_30px_rgba(180,140,80,0.08)] space-y-4">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-4xl sm:text-5xl font-medium text-[#1E1B18]">
                      ₹{unitDiscountedPrice}
                    </span>
                    <span className="text-base text-[#918171] line-through font-mono">
                      ₹{unitOriginalPrice}/ pc
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold tracking-wider">
                    {discountPercentage}% OFF
                  </span>
                </div>

                <div className="pt-3 border-t border-[#EAE0D3] space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-[#5A4D3E]">
                    <span>Total ({actualQty} pcs):</span>
                    <strong className="text-base text-[#1E1B18] font-serif">₹{totalPrice.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    <span className="font-semibold">Factory Direct Savings:</span>
                    <strong className="font-bold">₹{factorySavings.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* 4. Get WhatsApp Quote Button: Sends exact selected specs */}
                <div className="pt-2">
                  <a
                    href={waLink(buildExactQuoteMessage(activeProduct.name, currentSize.label, currentSize.dimensions, actualQty, unitDiscountedPrice, unitOriginalPrice, totalPrice, factorySavings))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-sm font-bold uppercase tracking-[0.14em] shadow-[0_8px_25px_rgba(37,211,102,0.35)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.48)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Get WhatsApp Quote (Sends Exact Specs)</span>
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                  <span>
                    Your exact selected shape ({activeProduct.name}), size ({currentSize.dimensions}), and batch quantity ({actualQty} pcs) are automatically attached so our team confirms your order immediately.
                  </span>
                </div>
              </div>

              {/* Guarantees & Features */}
              <div className="space-y-2.5 pt-1 text-xs text-[#635547]">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#8C6436] shrink-0" />
                  <span>Your photo is printed and assembled by hand in Hyderabad, made to order</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#8C6436] shrink-0" />
                  <span>Clear 3mm cast acrylic with flush neodymium magnetic closure</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#8C6436] shrink-0" />
                  <span>Ships in 2–3 days with express pan-India tracking</span>
                </div>
              </div>

            </div>

          </div>
        </main>
      ) : isStarterKitOpen ? (
        /* ══════════════════════════════════════════════════════════
            VIEW 2: DEDICATED COMPLETE 12-PIECE BOX SET PAGE
        ══════════════════════════════════════════════════════════ */
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
          {/* Breadcrumb / Back button */}
          <button
            type="button"
            onClick={() => handleCloseStarterKit()}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8C6436] hover:text-[#1E1B18] mb-8 py-1.5 px-3 rounded-full bg-white/70 border border-[#E8DACB] shadow-xs cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="rounded-[2.5rem] bg-gradient-to-br from-[#FCF9F4] via-white to-[#F7EDE1] backdrop-blur-2xl border border-white p-6 sm:p-12 shadow-[0_25px_65px_rgba(180,140,80,0.12)]">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF0E2] text-[#8C6436] font-mono text-xs tracking-wider uppercase font-semibold border border-[#E8DACB]">
                <Package className="h-4 w-4 text-[#8C6436]" />
                <span>KRIA Tech Starter Kit · ₹999 Total</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#1E1B18] leading-tight">
                Complete 12-Piece Box Set
              </h1>

              <p className="font-serif italic text-lg sm:text-xl text-[#8C6436]">
                Ready to bring your 12 memories to life?
              </p>

              <p className="text-sm sm:text-base text-[#695B4E] leading-relaxed">
                10 Custom Acrylic Frames + 2 FREE Bonus Keychains for just <strong>₹999</strong> with free doorstep delivery.
              </p>

              {/* Direct WhatsApp CTA Button in this page */}
              <div className="pt-2">
                <a
                  href={waLink("Hi KRIA Tech! I would like to order the Complete 12-Piece Box Set (₹999 Total - 10 Custom Acrylic Frames + 2 FREE Bonus Keychains: K1 Square, K2 Portrait, K3 Medium, K4 Heart, K5 Circle, K6 Cloud, K6-L Wide Cloud, K7 Filmstrip, K9 Grande, K2 Adhesive + K10 & K11 Keychains). I have my photos ready for review.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-[0.16em] shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Order Complete 12-Piece Kit on WhatsApp (₹999)</span>
                </a>
              </div>
            </div>

            {/* Box Tray Header */}
            <div className="flex items-center justify-between border-b border-[#EADBCC] pb-3 mb-6">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#7C6348] flex items-center gap-2">
                <Gift className="h-4 w-4 text-[#8C6436]" />
                <span>Inside The Complete 12-Piece Box Set (10 Frames + 2 FREE Keychains)</span>
              </span>
              <span className="font-mono text-xs text-[#8C7A68] hidden sm:inline">
                3mm Monolithic Cast Glass Acrylic
              </span>
            </div>

            {/* 12-Product Visual Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {STARTER_KIT_ITEMS.map((item) => (
                <div
                  key={item.code}
                  className={`relative rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 border ${
                    item.isBonus
                      ? 'bg-gradient-to-b from-[#FFFDF7] via-amber-50/40 to-white border-[#EAD5B5] shadow-[0_8px_25px_rgba(212,175,55,0.14)] hover:border-[#D4AF37] hover:scale-[1.02]'
                      : 'bg-white/80 backdrop-blur-md border-[#EFE5D9] hover:border-[#D8C7B5] shadow-[0_8px_25px_rgba(180,140,80,0.06)] hover:shadow-[0_14px_35px_rgba(180,140,80,0.12)] hover:-translate-y-1'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF3EA] text-[#7A562D] font-mono text-[11px] font-bold border border-[#EADBCC]">
                        {item.code}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#8C7A68]">
                        {item.size}
                      </span>
                    </div>

                    {item.badge && (
                      <div className="mb-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                            item.badgeColor || 'bg-[#FAF4ED] text-[#7C6348] border-[#EADCCB]'
                          }`}
                        >
                          {item.isBonus && <Key className="h-3 w-3 text-emerald-700" />}
                          <span>{item.badge}</span>
                        </span>
                      </div>
                    )}

                    <div className="relative my-3 p-3 rounded-2xl bg-gradient-to-b from-[#FAF5EE] to-[#F3E7D7]/50 border border-[#EFE4D6] flex flex-col items-center justify-center min-h-[160px] overflow-hidden group">
                      {item.isKeychain && (
                        <div className="flex flex-col items-center mb-1">
                          <div className="h-4 w-4 rounded-full border-2 border-neutral-400 bg-neutral-100 shadow-inner" />
                          <div className="w-0.5 h-2 bg-gradient-to-b from-neutral-400 to-neutral-300" />
                        </div>
                      )}

                      <div
                        className={`relative overflow-hidden border border-white/90 shadow-[0_6px_16px_rgba(90,60,30,0.14)] ${item.roundedClass} ${item.aspectRatio} ${
                          item.isFilmstrip ? 'w-20 max-h-[140px]' : item.isKeychain ? 'w-20' : 'w-28 sm:w-32'
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={`${item.name} (${item.size})`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-white/10 pointer-events-none" />

                        {item.isFilmstrip && (
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            <div className="h-1/3 border-b border-black/30 bg-black/5" />
                            <div className="h-1/3 border-b border-black/30 bg-black/5" />
                            <div className="h-1/3 bg-black/5" />
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-1.5 right-2 opacity-70">
                        <span className="text-[8px] font-mono text-[#8C7A68]">3mm Cast</span>
                      </div>
                    </div>

                    <h4 className="font-serif text-base font-medium text-[#1E1B18] mt-2 leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-[#7A6A5A] mt-0.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#F0E5D7] flex items-center justify-between text-[10px] font-mono text-[#8C7A68]">
                    <span>{item.category}</span>
                    <span className="font-semibold">{item.size}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Summary Bar with WhatsApp button */}
            <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FAF2E6] via-white to-[#F5ECE0] border border-[#E8DACB] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(180,140,80,0.08)]">
              <div className="space-y-1.5 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#8C6436]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Complete 12-Piece Box Set</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1E1B18]">
                  Ready to bring your 12 memories to life?
                </h3>
                <p className="text-xs sm:text-sm text-[#6E6153]">
                  10 Custom Acrylic Frames + 2 FREE Bonus Keychains for just <strong>₹999</strong> with free doorstep delivery.
                </p>
              </div>

              <a
                href={waLink("Hi KRIA Tech! I would like to order the 12-Piece Starter Kit (₹999 Total - 10 Custom Acrylic Frames + 2 FREE Bonus Keychains: K1 Square, K2 Portrait, K3 Medium, K4 Heart, K5 Circle, K6 Cloud, K6-L Wide Cloud, K7 Filmstrip, K9 Grande, K2 Adhesive + K10 & K11 Keychains). I have my photos ready for review.")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full lg:w-auto shrink-0 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-[0.16em] shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Order 12-Piece Kit on WhatsApp (₹999)</span>
              </a>
            </div>

          </div>
        </main>
      ) : (
        /* ══════════════════════════════════════════════════════════
            VIEW 2: MAIN EXCLUSIVE LANDING PAGE WITH HERO SLIDER
        ══════════════════════════════════════════════════════════ */
        <main className="relative z-10">
          
          {/* ─── SLIDING IMAGES HERO SECTION ──────────────────────── */}
          <section className="relative px-4 sm:px-8 pt-6 pb-12 max-w-7xl mx-auto">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_rgba(180,140,80,0.16)] border border-white/80 bg-[#1E1B18] aspect-[16/9] sm:aspect-[21/9] max-h-[580px]">
              
              {/* Carousel Slides */}
              {HERO_SLIDES.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover filter brightness-[0.88]"
                  />
                  {/* Subtle Gradient Veil for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                  {/* Caption & Quick CTA Overlay */}
                  <div className="absolute bottom-6 sm:bottom-12 left-6 sm:left-14 right-6 sm:right-14 text-white space-y-2.5">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-mono uppercase tracking-[0.2em] text-[#E8DCCF] border border-white/30">
                      {slide.badge}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-white max-w-2xl">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xl hidden sm:block">
                      {slide.subtitle}
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <a
                        href="#products"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1E1B18] text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#FAF4ED] transition-colors cursor-pointer"
                      >
                        <span>Choose Shape</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href="#starter-kit"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/30 transition-colors cursor-pointer"
                      >
                        <span>Starter Kit (12 for ₹999)</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Slider Arrows */}
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-white/60 hover:text-black transition-all cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-white/60 hover:text-black transition-all cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Slide Indicators Dots */}
              <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentSlideIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

            </div>
          </section>

          {/* ─── 4 SHAPES SECTION (RECTANGLE, SQUARE, CIRCLE, HEART) ─── */}
          <section id="products" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold mb-2">
                Curated Collection
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1E1B18]">
                Four Signature Forms
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#6E6153] leading-relaxed">
                Click any product below to configure dimensions and batch quantities with live pricing.
              </p>
            </div>

            {/* 4 Cards Grid arranged strictly: Rectangle, Square, Circle, Heart */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleOpenProduct(prod.id)}
                  className="group rounded-3xl bg-white/75 backdrop-blur-xl border border-white hover:border-[#D9C4AC] p-6 shadow-[0_12px_35px_rgba(180,140,80,0.06)] hover:shadow-[0_22px_55px_rgba(180,140,80,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Visual Area */}
                    <div className={`relative h-60 rounded-2xl bg-gradient-to-b ${prod.bgGlow} border border-[#F0E4D5] flex items-center justify-center p-6 overflow-hidden mb-5`}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_12px_22px_rgba(90,60,30,0.22)] group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#7C6348] border border-[#E8DACB]">
                          3mm Cast
                        </span>
                      </div>
                    </div>

                    {/* Title & Tagline */}
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#9C8773] font-semibold">
                      {prod.category}
                    </span>
                    <h3 className="font-serif text-2xl font-medium text-[#1E1B18] mt-1 group-hover:text-[#8C6436] transition-colors">
                      {prod.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#8C7A68] font-mono">
                      {prod.tagline}
                    </p>

                    {/* Formats preview */}
                    <div className="mt-4 pt-3.5 border-t border-[#EFE5D9]">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#9A8775] mb-2 font-bold">
                        Available Sizes
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {prod.sizes.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-1 rounded-md bg-[#FAF4ED] text-[#695B4E] border border-[#EAE0D3]"
                          >
                            {s.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Open Separate Product Page CTA */}
                  <div className="mt-6 pt-4 border-t border-[#EFE5D9]">
                    <div className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E1B18] group-hover:bg-[#8C6436] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider transition-colors">
                      <span>Choose Size & Quantity</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── DEDICATED STARTER KIT SECTION: 2-COLUMN PREVIEW BLOCK ─── */}
          <section id="starter-kit" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-8">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-[#FAF3EA] via-white to-[#F4E9DC] backdrop-blur-2xl border border-white p-8 sm:p-14 shadow-[0_25px_65px_rgba(180,140,80,0.12)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                
                {/* Left Side: Preview Image of Starter Kit (Clickable to open all 12 products) */}
                <div 
                  onClick={handleOpenStarterKit}
                  className="lg:col-span-5 relative rounded-3xl overflow-hidden shadow-[0_20px_45px_rgba(180,140,80,0.15)] border-2 border-white group cursor-pointer"
                  title="Click to view all 12 products"
                >
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#FAF4ED]">
                    <img 
                      src="/images/lifestyle_gallery_workspace_1779653492345.png" 
                      alt="Complete 12-Piece Box Set Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#7C6348] font-mono text-[11px] font-bold border border-[#EADBCC] shadow-xs">
                      12 Pieces Inside
                    </div>
                    
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-600 text-white font-mono text-[11px] font-bold shadow-md">
                      ₹999 Total
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
                      <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full">
                        <ZoomIn className="h-3.5 w-3.5" />
                        <span>Click to view all 12 products</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Copy & Action Buttons */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE3D3] text-[#7A562D] font-mono text-xs tracking-wider uppercase font-semibold">
                    <Package className="h-3.5 w-3.5 text-[#8C6436]" />
                    <span>Special Discovery Offer</span>
                  </div>

                  <div>
                    <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1E1B18] leading-tight">
                      Complete 12-Piece Box Set
                    </h2>
                    <p className="font-serif italic text-lg sm:text-2xl text-[#8C6436] mt-1.5 font-medium">
                      Ready to bring your 12 memories to life?
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-[#615446] leading-relaxed">
                    10 Custom Acrylic Frames + 2 FREE Bonus Keychains for just <strong>₹999</strong> with free doorstep delivery.
                  </p>

                  {/* Highlights Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-[#5D5042] font-mono">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-[#E8DACB]">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>10 Custom Acrylic Frames</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-[#E8DACB]">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>2 FREE Bonus Keychains</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-[#E8DACB]">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>3mm Monolithic Cast Acrylic</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-[#E8DACB]">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Free Pan-India Air Delivery</span>
                    </div>
                  </div>

                  {/* Below Buttons: Button to open all 12 products + Button for WhatsApp order */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                    {/* Button 1: Opens all 12 products */}
                    <button
                      type="button"
                      onClick={handleOpenStarterKit}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#1E1B18] hover:bg-[#8C6436] text-white text-xs font-bold uppercase tracking-[0.14em] shadow-md transition-all cursor-pointer group"
                    >
                      <span>View All 12 Products & Shapes</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Button 2: WhatsApp order */}
                    <a
                      href={waLink("Hi KRIA Tech! I would like to order the Complete 12-Piece Box Set (₹999 Total: 10 Custom Acrylic Frames + 2 FREE Bonus Keychains). I have my 12 photos ready for review.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-[0.14em] shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-4.5 w-4.5" />
                      <span>Order on WhatsApp (₹999)</span>
                    </a>
                  </div>

                </div>

              </div>
            </div>
          </section>

          {/* ─── DEDICATED KRIA SUBSCRIPTION SECTION (FROM POSTER) ─── */}
          <section id="subscription" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-8">
            <div className="rounded-[2.5rem] bg-gradient-to-br from-[#FCFAF6] via-white to-[#F6EDE2] backdrop-blur-2xl border border-[#EADECE] p-8 sm:p-14 shadow-[0_25px_65px_rgba(180,140,80,0.12)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Left Description & Benefits */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0E2] text-[#8C6436] font-mono text-xs tracking-wider uppercase font-semibold border border-[#EAD5BA]">
                    <Crown className="h-3.5 w-3.5 text-[#B8860B]" />
                    <span>Exclusive Member Privilege</span>
                  </div>

                  <div>
                    <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1E1B18] leading-tight">
                      KRIA Subscription
                    </h2>
                    <p className="font-serif italic text-lg sm:text-xl text-[#8C6436] mt-1">
                      More Savings. Priority Service.
                    </p>
                  </div>

                  {/* Gold Badge: ONLY ₹499 · 3 MONTHS VALIDITY */}
                  <div className="inline-flex items-center gap-4 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#FDEFD8] via-[#FFF9F0] to-[#F7E7CE] border border-[#DEB887] shadow-sm">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-[#8C6436]">
                      ONLY ₹499
                    </span>
                    <span className="h-7 w-px bg-[#DEB887]/60" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[#6B4E2B] font-bold">
                      3 MONTHS VALIDITY
                    </span>
                  </div>

                  {/* 3 Main Value Pillars from Poster */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                    {/* Pillar 1 */}
                    <div className="p-4 rounded-2xl bg-white border border-[#EADBCC] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto sm:mx-0">
                        <Coins className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-serif text-lg font-bold text-[#1E1B18]">₹2 OFF</div>
                        <p className="text-[11px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold mt-0.5">
                          On Every Frame
                        </p>
                      </div>
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-4 rounded-2xl bg-white border border-[#EADBCC] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto sm:mx-0">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-serif text-lg font-bold text-[#1E1B18]">1 Day Dispatch</div>
                        <p className="text-[11px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold mt-0.5">
                          On Ready To Stock Frames
                        </p>
                      </div>
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-4 rounded-2xl bg-white border border-[#EADBCC] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mx-auto sm:mx-0">
                        <Crown className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-serif text-lg font-bold text-[#1E1B18]">Customer Priority</div>
                        <p className="text-[11px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold mt-0.5">
                          Faster Support & Exclusive Service
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Join Now WhatsApp CTA */}
                  <div className="pt-2">
                    <a
                      href={waLink("Hi KRIA Tech! I would like to join the KRIA Subscription plan (ONLY ₹499 for 3 MONTHS VALIDITY). Please share activation details for ₹2 OFF on every frame, 1-day dispatch, and priority customer service.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-[0.16em] shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-4.5 w-4.5" />
                      <span>Join KRIA Subscription (₹499)</span>
                    </a>
                  </div>
                </div>

                {/* Right Visual Poster Showcase */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_45px_rgba(180,140,80,0.18)] border-2 border-[#E7D6C2] bg-white group hover:shadow-[0_25px_55px_rgba(180,140,80,0.25)] transition-all duration-300">
                    <img 
                      src="/images/kria_subscription_banner.jpg" 
                      alt="KRIA Subscription - Only ₹499, 3 Months Validity"
                      className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-500"
                    />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ─── FREQUENTLY ASKED QUESTIONS (COMPACT & SMALLER) ───── */}
          <section id="faqs" className="py-14 sm:py-20 max-w-3xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-8">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold">
                Clear Answers
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1E1B18] mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-2.5">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-white/75 backdrop-blur-md border border-[#E9DCCE] overflow-hidden transition-all duration-150"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                      className="w-full py-3.5 px-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="font-serif text-sm text-[#1E1B18] font-normal">
                        {faq.q}
                      </span>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#8C6436]' : 'text-[#8A7969]'}`}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-[#615345] leading-relaxed border-t border-[#F2E7DC] pt-2.5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </main>
      )}

      {/* ─── DEDICATED LIGHT LUXURY FOOTER ──────────────────────── */}
      <footer className="relative z-10 border-t border-[#EADECE] bg-[#FAF5EE] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
            
            {/* Col 1: Brand Info */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white border border-[#E0D0BF] flex items-center justify-center shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-[#8C6436]" />
                </div>
                <span className="font-serif text-xl font-semibold tracking-tight text-[#1E1B18]">
                  KRIA<span className="text-[#A78255] font-light">Tech</span>
                </span>
              </div>
              <p className="text-xs text-[#6E6152] leading-relaxed max-w-sm">
                Diamond-cut 3mm monolithic cast acrylic photo magnets. Crafted with UV-cured sub-surface pigment and rare-earth neodymium magnetic cores. Factory-direct in Hyderabad.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#8C7762]">
                <MapPin className="h-3.5 w-3.5 text-[#8C6436]" />
                <span>Hyderabad, Telangana · India</span>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="md:col-span-3 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C6436] font-bold">
                Navigation
              </p>
              <ul className="text-xs text-[#635546] space-y-1.5">
                <li>
                  <a href="#products" onClick={() => handleCloseProduct('#products')} className="hover:text-[#8C6436] transition-colors">
                    Products
                  </a>
                </li>
                <li>
                  <a href="#starter-kit" onClick={() => handleCloseProduct('#starter-kit')} className="hover:text-[#8C6436] transition-colors">
                    Starter Kit (12 for ₹999)
                  </a>
                </li>
                <li>
                  <a href="#subscription" onClick={() => handleCloseProduct('#subscription')} className="hover:text-[#8C6436] transition-colors">
                    Subscription
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Direct Contact */}
            <div className="md:col-span-4 space-y-2.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C6436] font-bold">
                WhatsApp Order Desk
              </p>
              <a
                href={waLink("Hi KRIA Tech! I am on your website and would like to order acrylic photo magnets.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#25D366] hover:text-[#1EBE5D] transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+91 93925 76792</span>
              </a>
              <p className="text-[11px] text-[#8F7E6E] font-mono">
                Pan-India Express Air Shipping with Live Courier Tracking
              </p>
            </div>

          </div>

          <div className="mt-10 pt-5 border-t border-[#E8DACB] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-[#8F7E6E]">
            <p>© {new Date().getFullYear()} KRIA Tech. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span>3mm Cast Acrylic</span>
              <span>•</span>
              <span>300 DPI UV Pigment</span>
              <span>•</span>
              <span>Neodymium Grip</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING WHATSAPP BUTTON (DESKTOP & MOBILE) ────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => {
            if (activeProduct && currentSize) {
              window.open(waLink(buildExactQuoteMessage(activeProduct.name, currentSize.label, currentSize.dimensions, actualQty, unitDiscountedPrice, unitOriginalPrice, totalPrice, factorySavings)), '_blank');
            } else {
              handleOpenConfigurator('rectangle');
            }
          }}
          className="group flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.55)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="Chat with KRIA Tech on WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="h-5 w-5 fill-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
            {activeProduct ? 'WhatsApp Exact Specs' : 'Configure & WhatsApp'}
          </span>
        </button>
      </div>

    </div>
  );
}
