import React, { useState, useEffect } from 'react';
import {
  MessageCircle, Star, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ShieldCheck,
  Package, Award, Heart, Sparkles, CheckCircle2, Phone,
  MapPin, Clock, Users, ArrowUpRight,
  ArrowLeft, ZoomIn, Check, Info, Calendar, Gift, Crown, Truck, Coins, Key,
  ShoppingCart, Trash2, Plus, Minus, X
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
  previewImage?: string;
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

export interface KriaCartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sizeLabel: string;
  dimensions: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  totalPrice: number;
}

// Exactly arranged in order: rectangle, square, circle, heart
const PRODUCTS: Product[] = [
  {
    id: 'rectangle',
    name: 'Classic Rectangle',
    tagline: 'Architectural & Landscape Panorama',
    subtitle: 'Personalised acrylic magnetic rectangle frame',
    image: '/images/shape_rectangle_wedding_portrait.png',
    category: 'Landscape & Panorama',
    sizes: [
      { label: '3.5 × 2.5"', dimensions: '3.5 × 2.5 inch', basePrice: 229, originalPrice: 329, previewImage: '/images/dimension_preview_3.5x2.5.png' },
      { label: '3 × 4"', dimensions: '3 × 4 inch', basePrice: 279, originalPrice: 379, previewImage: '/images/dimension_preview_3x4.png' },
      { label: '6 × 4"', dimensions: '6 × 4 inch', basePrice: 349, originalPrice: 499, previewImage: '/images/dimension_preview_6x4.png' }
    ],
    accentColor: '#365349',
    bgGlow: 'from-emerald-100/60 via-sand-50/40 to-transparent'
  },
  {
    id: 'square',
    name: 'Minimal Square',
    tagline: 'Geometric Balance & Modern Grids',
    subtitle: 'Personalised acrylic magnetic square frame',
    image: '/images/shape_square_romantic_embrace.png',
    category: 'Grid & Modern Living',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 199, originalPrice: 299, previewImage: '/images/dimension_preview_square_2x2.jpg' },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 249, originalPrice: 349, previewImage: '/images/dimension_preview_square_3x3.jpg' },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 299, originalPrice: 399, previewImage: '/images/dimension_preview_square_4x4.jpg' }
    ],
    accentColor: '#A3704C',
    bgGlow: 'from-amber-100/60 via-stone-50/40 to-transparent'
  },
  {
    id: 'circle',
    name: 'Minimal Circle',
    tagline: 'Infinite Symmetry & Contemporary Zen',
    subtitle: 'Personalised acrylic magnetic circle frame',
    image: '/images/shape_circle_family_furry_friend.png',
    category: 'Modern Living',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 199, originalPrice: 299, previewImage: '/images/dimension_preview_circle_2x2.png' },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 249, originalPrice: 349, previewImage: '/images/dimension_preview_circle_3x3.png' },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 299, originalPrice: 399, previewImage: '/images/dimension_preview_circle_4x4.png' }
    ],
    accentColor: '#4A6B82',
    bgGlow: 'from-sky-100/60 via-amber-50/40 to-transparent'
  },
  {
    id: 'heart',
    name: 'Sculpted Heart',
    tagline: 'Romance & Everlasting Keepsakes',
    subtitle: 'Personalised acrylic magnetic heart frame',
    image: '/images/shape_heart_romantic_wedding.png',
    category: 'Celebration & Gifting',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 199, originalPrice: 299, previewImage: '/images/dimension_preview_heart_2x2.png' },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 249, originalPrice: 349, previewImage: '/images/dimension_preview_heart_3x3.png' },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 299, originalPrice: 399, previewImage: '/images/dimension_preview_heart_4x4.png' }
    ],
    accentColor: '#B76E79',
    bgGlow: 'from-rose-100/60 via-pink-50/40 to-transparent'
  },
  {
    id: 'keychain',
    name: 'Acrylic Keepsake Keychain',
    tagline: 'Pocket Luxury & Daily Companions',
    subtitle: 'Dual-sided 3mm acrylic photo keychain with metallic swivel ring',
    image: '/images/keychain_square_backpack_official.jpg',
    category: 'Keychains & Accessories',
    sizes: [
      { label: 'Circle Keychain (2.5")', dimensions: '2.5 inch Circle with Ring', basePrice: 149, originalPrice: 249, previewImage: '/images/keychain_backpack_lifestyle.png' },
      { label: 'Square Keychain (3 × 3")', dimensions: '3 × 3 inch Square with Ring', basePrice: 179, originalPrice: 279, previewImage: '/images/keychain_square_backpack_official.jpg' }
    ],
    accentColor: '#D97706',
    bgGlow: 'from-orange-100/60 via-amber-50/40 to-transparent'
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
    image: '/images/hero_1.jpg',
    title: 'Diamond-Cut Acrylic Frame Magnets',
    subtitle: 'Laser-contoured 3mm monolithic cast acrylic handcrafted in Hyderabad',
    badge: 'Real Lifestyle Gallery'
  },
  {
    image: '/images/hero_2.jpg',
    title: 'Sub-Surface 300 DPI UV Pigment',
    subtitle: 'Fade-proof photographic clarity backed by rare-earth neodymium magnetic cores',
    badge: 'Optical Clarity'
  },
  {
    image: '/images/hero_3.jpg',
    title: 'Starter Kit · 12 Frames for ₹999',
    subtitle: 'Includes 10 custom acrylic frames + 2 FREE bonus keychains with free delivery',
    badge: 'Special Value Offer'
  },
  {
    image: '/images/hero_4.jpg',
    title: 'Precision Hand-Polished Mirror Bevels',
    subtitle: 'Zero fading, zero yellowing, and 100% moisture-sealed protection',
    badge: 'Factory Direct'
  },
  {
    image: '/images/hero_5.jpg',
    title: 'Curated Keepsakes For Every Living Space',
    subtitle: 'Architectural minimalism engineered for refrigerators, study desks & metallic surfaces',
    badge: 'Monolithic Cast Glass'
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
    image: '/images/shape_square_romantic_embrace.png',
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
    image: '/images/shape_rectangle_wedding_portrait.png',
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
    image: '/images/joyful_toddler_acrylic_frame.png',
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
    image: '/images/shape_heart_romantic_wedding.png',
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
    image: '/images/shape_circle_family_furry_friend.png',
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
    image: '/images/cloud_scalloped_2.5x3.5_official.jpg',
    aspectRatio: 'aspect-[2.5/3.5]',
    roundedClass: 'rounded-3xl border-dashed',
    isBonus: false
  },
  {
    code: 'K6-L',
    name: 'Wide Cloud Panorama',
    size: '3.0 × 4.0 in',
    subtitle: 'Horizontal scalloped cloud for landscapes',
    category: 'Fridge Magnet',
    badge: 'Landscape Cloud',
    image: '/images/cloud_scalloped_3x4_official.jpg',
    aspectRatio: 'aspect-[3/4]',
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
    image: '/images/filmstrip_3photo_official.jpg',
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
    image: '/images/dimension_preview_6x4.png',
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
    image: '/images/dimension_preview_3.5x2.5.png',
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
    image: '/images/keychain_backpack_lifestyle.png',
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
    image: '/images/keychain_casual_lifestyle.png',
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
  const [activeGalleryTab, setActiveGalleryTab] = useState<'frame' | 'magnets' | 'how_to_use' | 'on_fridge' | 'gift_box'>('frame');
  const [isHoverZooming, setIsHoverZooming] = useState<boolean>(false);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Multi-item Cart State (Different shapes & sizes)
  const [cart, setCart] = useState<KriaCartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kria_multi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [cartToastMessage, setCartToastMessage] = useState<string | null>(null);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kria_multi_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

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

  // Multi-Item Cart Actions
  const handleAddToCart = () => {
    if (!activeProduct || !currentSize) return;
    const itemId = `${activeProduct.id}_${currentSize.label}_${Date.now()}`;
    const newItem: KriaCartItem = {
      id: itemId,
      productId: activeProduct.id,
      productName: activeProduct.name,
      productImage: currentSize.previewImage || activeProduct.image,
      sizeLabel: currentSize.label,
      dimensions: currentSize.dimensions,
      quantity: actualQty,
      unitPrice: unitDiscountedPrice,
      originalUnitPrice: unitOriginalPrice,
      totalPrice: totalPrice
    };

    setCart((prev) => {
      // Check if exact same product & size already exists in cart
      const existingIdx = prev.findIndex(
        (it) => it.productId === newItem.productId && it.sizeLabel === newItem.sizeLabel
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newQty = existing.quantity + newItem.quantity;
        // Recalculate tier discount
        const newDiscountRate = newQty >= 1000 ? 0.50 : newQty >= 500 ? 0.45 : newQty >= 250 ? 0.40 : newQty >= 100 ? 0.35 : newQty >= 50 ? 0.30 : 0.15;
        const newUnitPrice = Math.round(existing.originalUnitPrice * (1 - newDiscountRate));
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          unitPrice: newUnitPrice,
          totalPrice: newUnitPrice * newQty
        };
        return updated;
      }
      return [...prev, newItem];
    });

    setCartToastMessage(`Added ${actualQty}x ${activeProduct.name} (${currentSize.label}) to Cart!`);
    setIsCartDrawerOpen(true);
    setTimeout(() => {
      setCartToastMessage(null);
    }, 4000);
  };

  const handleUpdateCartItemQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(1, item.quantity + delta);
            const newDiscountRate = newQty >= 1000 ? 0.50 : newQty >= 500 ? 0.45 : newQty >= 250 ? 0.40 : newQty >= 100 ? 0.35 : newQty >= 50 ? 0.30 : 0.15;
            const newUnitPrice = Math.round(item.originalUnitPrice * (1 - newDiscountRate));
            return {
              ...item,
              quantity: newQty,
              unitPrice: newUnitPrice,
              totalPrice: newUnitPrice * newQty
            };
          }
          return item;
        })
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Cart summary calculations
  const totalCartFrames = cart.reduce((acc, it) => acc + it.quantity, 0);
  const totalCartPrice = cart.reduce((acc, it) => acc + it.totalPrice, 0);
  const totalCartOriginal = cart.reduce((acc, it) => acc + (it.originalUnitPrice * it.quantity), 0);
  const totalCartSavings = totalCartOriginal - totalCartPrice;

  // Build Comprehensive Multi-Product WhatsApp Order Message
  const buildMultiCartWhatsAppMessage = () => {
    if (cart.length === 0) return '';
    let msg = `Hi KRIA Tech! I would like to place an order for multiple customized acrylic products:\n\n`;
    msg += `🛒 *ORDER SUMMARY (${cart.length} item types · ${totalCartFrames} total pcs):*\n`;
    msg += `─────────────────────────\n`;

    cart.forEach((it, idx) => {
      msg += `${idx + 1}. *${it.productName}*\n`;
      msg += `   • Size: ${it.sizeLabel} (${it.dimensions})\n`;
      msg += `   • Quantity: ${it.quantity} pcs\n`;
      msg += `   • Price: ₹${it.unitPrice}/pc (₹${it.totalPrice.toLocaleString('en-IN')})\n\n`;
    });

    msg += `─────────────────────────\n`;
    msg += `💰 *TOTAL ESTIMATE: ₹${totalCartPrice.toLocaleString('en-IN')}*\n`;
    if (totalCartSavings > 0) {
      msg += `✨ *FACTORY DIRECT SAVINGS: ₹${totalCartSavings.toLocaleString('en-IN')}*\n`;
    }
    msg += `🚚 *Doorstep Express Air Delivery Across India Included*\n\n`;
    msg += `I have my photos ready for review. Please confirm order placement and dispatch timeline!`;
    return msg;
  };
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
            <div className="h-10 w-10 rounded-2xl bg-white border border-[#D8C2A6]/80 flex items-center justify-center p-1 shadow-[0_4px_12px_rgba(180,140,90,0.15)] group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              <img src="/images/kria_logo_official.png" alt="KRIA Logo" className="h-full w-full object-contain" />
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

          {/* Quick Action & Cart Button */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Multi-Item Cart Button with live Badge */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-white border border-[#D8C7B5] hover:border-[#1E1B18] shadow-xs text-[#1E1B18] text-xs font-mono font-semibold transition-all cursor-pointer"
              title="View Cart"
            >
              <ShoppingCart className="h-4 w-4 text-[#8C6436]" />
              <span className="hidden sm:inline">Cart</span>
              {cart.length > 0 && (
                <span className="h-5 min-w-[20px] px-1 rounded-full bg-[#1E1B18] text-white text-[10px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {activeProduct && currentSize ? (
              <a
                href={waLink(buildExactQuoteMessage(activeProduct.name, currentSize.label, currentSize.dimensions, actualQty, unitDiscountedPrice, unitOriginalPrice, totalPrice, factorySavings))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(37,211,102,0.28)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp Quote ({actualQty} pcs)</span>
                <span className="sm:hidden">Quote ({actualQty})</span>
              </a>
            ) : cart.length > 0 ? (
              <a
                href={waLink(buildMultiCartWhatsAppMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(37,211,102,0.28)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Order ({cart.length})</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenConfigurator('rectangle')}
                className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(37,211,102,0.28)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Choose Specs</span>
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
                  {/* Stable Frame Display: shows respective size image without changing container dimensions */}
                  {activeGalleryTab === 'frame' ? (
                    <div className="relative w-full h-full flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={currentSize?.previewImage || activeProduct.image}
                        alt={activeProduct.name}
                        style={{
                          transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                          transform: isHoverZooming ? 'scale(2.2)' : 'scale(1)',
                        }}
                        className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(80,50,20,0.28)] transition-transform duration-150 pointer-events-none select-none"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={
                          activeGalleryTab === 'magnets'
                            ? (currentSize?.label.includes('4 × 4') ? '/images/magnet_spec_6x2mm.jpg' : '/images/magnet_spec_4x2mm.jpg')
                            : activeGalleryTab === 'how_to_use'
                            ? '/images/guide_easy_photo_frame_setup.png'
                            : activeGalleryTab === 'on_fridge'
                            ? '/images/fridge_memories_wedding_moments.png'
                            : '/images/premium_magnetic_photo_frame_design.png'
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

                {/* 5 Interactive Thumbnails Gallery Row (Including Genuine Neodymium Magnets Spec) */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 mt-4">
                  {[
                    { id: 'frame' as const, label: 'Frame Photo', image: currentSize?.previewImage || activeProduct.image, isShape: true },
                    { 
                      id: 'magnets' as const, 
                      label: currentSize?.label.includes('4 × 4') ? '6×2mm Mag' : '4×2mm Mag', 
                      image: currentSize?.label.includes('4 × 4') ? '/images/magnet_spec_6x2mm.jpg' : '/images/magnet_spec_4x2mm.jpg', 
                      isShape: true 
                    },
                    { id: 'how_to_use' as const, label: 'How to Use', image: '/images/guide_easy_photo_frame_setup.png', isShape: false },
                    { id: 'on_fridge' as const, label: 'On Fridge', image: '/images/fridge_memories_wedding_moments.png', isShape: false },
                    { id: 'gift_box' as const, label: 'Gift Box', image: '/images/premium_magnetic_photo_frame_design.png', isShape: false }
                  ].map((thumb) => {
                    const isActive = activeGalleryTab === thumb.id;
                    return (
                      <button
                        key={thumb.id}
                        type="button"
                        onClick={() => setActiveGalleryTab(thumb.id as any)}
                        className={`flex flex-col items-center p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white border-[#1E1B18] ring-2 ring-[#1E1B18]/15 shadow-sm scale-[1.02]'
                            : 'bg-white/80 border-[#E8DACB] hover:border-[#BFA890] hover:bg-white'
                        }`}
                      >
                        <div className="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden rounded-xl bg-[#FAF6F0] p-1">
                          <img
                            src={thumb.image}
                            alt={thumb.label}
                            className={`w-full h-full ${thumb.isShape ? 'object-contain' : 'object-cover'} rounded-lg`}
                          />
                        </div>
                        <span className={`mt-1 text-[10px] sm:text-[11px] font-mono leading-tight text-center truncate w-full ${
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

                {/* 4. Action Buttons: Add to Cart + Direct WhatsApp Order */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Button A: Add To Cart (allows adding different shapes & sizes) */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl bg-[#1E1B18] hover:bg-[#8C6436] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.14em] shadow-md hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <ShoppingCart className="h-4.5 w-4.5 text-[#E5D7C5] group-hover:scale-110 transition-transform" />
                    <span>Add to Cart ({actualQty} pcs)</span>
                  </button>

                  {/* Button B: Direct WhatsApp Quote */}
                  <a
                    href={waLink(buildExactQuoteMessage(activeProduct.name, currentSize.label, currentSize.dimensions, actualQty, unitDiscountedPrice, unitOriginalPrice, totalPrice, factorySavings))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.14em] shadow-[0_8px_25px_rgba(37,211,102,0.35)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.48)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-4.5 w-4.5" />
                    <span>Order Now on WhatsApp</span>
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                  <span>
                    Add multiple shapes and sizes to your Cart! When you are ready, tap <strong>"Order All on WhatsApp"</strong> from the cart drawer to submit your entire custom combination in one clean message.
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

          <div className="rounded-[2.5rem] bg-gradient-to-br from-[#FCF9F4] via-white to-[#F7EDE1] backdrop-blur-2xl border border-white p-6 sm:p-10 lg:p-12 shadow-[0_25px_65px_rgba(180,140,80,0.12)]">
            
            {/* Two-Column Starter Kit Single-Photo Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: The Single Real Fridge Collection Photo with Interactive Zoom */}
              <div className="lg:col-span-7">
                <div 
                  className="relative rounded-3xl overflow-hidden bg-white/90 border-2 border-white shadow-[0_20px_50px_rgba(180,140,80,0.16)] group select-none cursor-crosshair"
                  onMouseEnter={() => setIsHoverZooming(true)}
                  onMouseLeave={() => setIsHoverZooming(false)}
                  onMouseMove={handlePreviewMouseMove}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-[#FAF6F0]">
                    <img
                      src="/images/starter_kit_complete_fridge_collection.jpg"
                      alt="Complete 12-Piece Starter Kit Collection on Refrigerator"
                      style={{
                        transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                        transform: isHoverZooming ? 'scale(2.2)' : 'scale(1)',
                      }}
                      className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-150 pointer-events-none select-none"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#7C6348] font-mono text-xs font-bold border border-[#EADBCC] shadow-md pointer-events-none">
                      All 12 Pieces in Kit
                    </div>

                    <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold shadow-md pointer-events-none">
                      ₹999 Total · Free Delivery
                    </div>
                  </div>

                  {/* Zoom hint beneath photo */}
                  <div className="py-2.5 bg-[#FAF5EE] border-t border-[#EADBCC] text-center flex items-center justify-center gap-1.5 text-xs text-[#8C7A68] font-mono">
                    <ZoomIn className="h-3.5 w-3.5 text-[#A78255]" />
                    <span>Hover over the image to zoom in & inspect each shape</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Kit Breakdown & Direct WhatsApp Order */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF0E2] text-[#8C6436] font-mono text-xs tracking-wider uppercase font-semibold border border-[#E8DACB]">
                    <Sparkles className="h-3.5 w-3.5 text-[#8C6436]" />
                    <span>10 Custom Frames + 2 FREE Keychains</span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1E1B18] leading-tight">
                    Complete 12-Piece Box Set
                  </h1>

                  <p className="font-serif italic text-lg sm:text-xl text-[#8C6436]">
                    Ready to bring your 12 memories to life?
                  </p>

                  <p className="text-sm text-[#695B4E] leading-relaxed">
                    10 Custom Acrylic Frames + 2 FREE Bonus Keychains for just <strong>₹999</strong> with free doorstep delivery across India.
                  </p>
                </div>

                {/* What is Included List */}
                <div className="p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-[#EADBCC] space-y-3 font-mono text-xs text-[#52463A]">
                  <p className="font-bold uppercase tracking-wider text-[#7C6348] flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Included Inside The Kit:</span>
                  </p>
                  <ul className="space-y-2.5 text-[11px] leading-relaxed text-[#6E6153]">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>10 Custom Acrylic Frames</strong>: Square, Classic Portrait, Medium Gallery, Sculpted Heart, Scalloped Clouds & 3-Photo Story Filmstrip</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>2 FREE Bonus Keychains</strong>: Round Photo Medallion + Pocket Mini Keychain with durable rings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>3mm Monolithic Cast Glass</strong>: Hand-buffed diamond bevels & rare-earth neodymium flush magnets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>100% Free Doorstep Air Delivery</strong> anywhere in India</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-700 font-bold">★</span>
                      <span><strong>Stall Owner & Reseller Ready</strong>: Use these 12 pieces as a live counter display sample board</span>
                    </li>
                  </ul>
                </div>

                {/* Direct WhatsApp CTA Button */}
                <div className="space-y-3 pt-2">
                  <a
                    href={waLink("Hi KRIA Tech! I would like to order the Complete 12-Piece Box Set (₹999 Total: 10 Custom Acrylic Frames + 2 FREE Bonus Keychains as shown in the starter kit photo). I have my 12 photos ready for review.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-[0.16em] shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Order 12-Piece Kit on WhatsApp (₹999)</span>
                  </a>

                  <p className="text-[11px] font-mono text-center text-[#8C7A68]">
                    🔒 No upfront payment needed · Share your 12 photos on WhatsApp to preview first
                  </p>
                </div>
              </div>

            </div>

          </div>
        </main>
      ) : (
        /* ══════════════════════════════════════════════════════════
            VIEW 2: MAIN EXCLUSIVE LANDING PAGE WITH HERO SLIDER
        ══════════════════════════════════════════════════════════ */
        <main className="relative z-10">
          
          {/* ─── SLIDING IMAGES HERO SECTION ──────────────────────── */}
          <section className="relative px-3 sm:px-8 pt-3 sm:pt-6 pb-6 sm:pb-10 max-w-7xl mx-auto">
            <div className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_15px_40px_rgba(180,140,80,0.12)] border border-white/80 bg-[#1E1B18] aspect-[16/9] sm:aspect-[21/9] max-h-[520px]">
              
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
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Slider Arrows */}
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-white/60 hover:text-black transition-all cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-white/60 hover:text-black transition-all cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Slide Indicators Dots */}
              <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 z-20 flex items-center gap-1 sm:gap-1.5">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-1 sm:h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentSlideIndex ? 'w-4 sm:w-6 bg-white' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

            </div>
          </section>

          {/* ─── 5 SIGNATURE PRODUCTS (RECTANGLE, SQUARE, CIRCLE, HEART, KEYCHAIN) ─── */}
          <section id="products" className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
              <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold mb-1.5">
                Curated Collection
              </p>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-[#1E1B18]">
                Five Signature Forms & Keychains
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#6E6153] leading-relaxed">
                Choose your shape to preview dimensions, magnet specifications, and tier discounts.
              </p>
            </div>

            {/* 5 Cards Grid: Rectangle, Square, Circle, Heart, Keychain */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
              {PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleOpenProduct(prod.id)}
                  className="group rounded-3xl bg-white/75 backdrop-blur-xl border border-white hover:border-[#D9C4AC] p-4 sm:p-5 shadow-[0_12px_35px_rgba(180,140,80,0.06)] hover:shadow-[0_22px_55px_rgba(180,140,80,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Visual Area */}
                    <div className={`relative h-48 sm:h-56 rounded-2xl bg-gradient-to-b ${prod.bgGlow} border border-[#F0E4D5] flex items-center justify-center p-4 overflow-hidden mb-4`}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(90,60,30,0.2)] group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#7C6348] border border-[#E8DACB]">
                          3mm Cast
                        </span>
                      </div>
                    </div>

                    {/* Title & Tagline */}
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#9C8773] font-semibold">
                      {prod.category}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1E1B18] mt-0.5 group-hover:text-[#8C6436] transition-colors leading-snug">
                      {prod.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-[#8C7A68] font-mono line-clamp-2">
                      {prod.tagline}
                    </p>

                    {/* Formats preview */}
                    <div className="mt-3 pt-3 border-t border-[#EFE5D9]">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-[#9A8775] mb-1.5 font-bold">
                        Available Sizes
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {prod.sizes.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAF4ED] text-[#695B4E] border border-[#EAE0D3]"
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
          <section id="starter-kit" className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-8">
            <div className="rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#FAF3EA] via-white to-[#F4E9DC] backdrop-blur-2xl border border-white p-5 sm:p-10 shadow-[0_20px_50px_rgba(180,140,80,0.1)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
                
                {/* Left Side: Preview Image of Starter Kit (Clickable to open all 12 products) */}
                {/* Left Side: Clickable Single Fridge Photo Preview of the Starter Kit */}
                <div 
                  onClick={handleOpenStarterKit}
                  className="lg:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_15px_35px_rgba(180,140,80,0.12)] border border-white group cursor-pointer"
                  title="Click to inspect all 12 products on the fridge"
                >
                  <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF4ED]">
                    <img 
                      src="/images/starter_kit_complete_fridge_collection.jpg" 
                      alt="Complete 12-Piece Box Set Preview on Refrigerator"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#7C6348] font-mono text-[10px] sm:text-[11px] font-bold border border-[#EADBCC] shadow-xs">
                      All 12 Pieces in Kit
                    </div>
                    
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-mono text-[10px] sm:text-[11px] font-bold shadow-md">
                      ₹999 Total
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-mono">
                      <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                        <ZoomIn className="h-3 w-3" />
                        <span>Tap to zoom 12 products</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Copy & Action Buttons */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE3D3] text-[#7A562D] font-mono text-[11px] tracking-wider uppercase font-semibold">
                    <Package className="h-3.5 w-3.5 text-[#8C6436]" />
                    <span>Special Discovery Offer</span>
                  </div>

                  <div>
                    <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-[#1E1B18] leading-tight">
                      Complete 12-Piece Box Set
                    </h2>
                    <p className="font-serif italic text-base sm:text-xl text-[#8C6436] mt-1 font-medium">
                      Ready to bring your 12 memories to life?
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#615446] leading-relaxed">
                    10 Custom Acrylic Frames + 2 FREE Bonus Keychains for just <strong>₹999</strong> with free doorstep delivery.
                  </p>

                  {/* Highlights Checklist */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs text-[#5D5042] font-mono">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-[#E8DACB]">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>10 Custom Frames</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-[#E8DACB]">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>2 FREE Keychains</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-[#E8DACB]">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>3mm Cast Acrylic</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-[#E8DACB]">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Free Air Delivery</span>
                    </div>
                  </div>

                  {/* Below Buttons: Button to open all 12 products + Button for WhatsApp order */}
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                    {/* Button 1: Opens all 12 products */}
                    <button
                      type="button"
                      onClick={handleOpenStarterKit}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1E1B18] hover:bg-[#8C6436] text-white text-xs font-bold uppercase tracking-[0.12em] shadow-md transition-all cursor-pointer group"
                    >
                      <span>Inspect 12-Piece Kit on Fridge</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Button 2: WhatsApp order */}
                    <a
                      href={waLink("Hi KRIA Tech! I would like to order the Complete 12-Piece Box Set (₹999 Total: 10 Custom Acrylic Frames + 2 FREE Bonus Keychains). I have my 12 photos ready for review.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-[0.12em] shadow-[0_6px_20px_rgba(37,211,102,0.3)] transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Order on WhatsApp (₹999)</span>
                    </a>
                  </div>

                </div>

              </div>
            </div>
          </section>

          {/* ─── DEDICATED KRIA SUBSCRIPTION SECTION (FROM POSTER) ─── */}
          <section id="subscription" className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-8">
            <div className="rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#FCFAF6] via-white to-[#F6EDE2] backdrop-blur-2xl border border-[#EADECE] p-5 sm:p-10 shadow-[0_20px_50px_rgba(180,140,80,0.1)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
                
                {/* Left Description & Benefits */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E2] text-[#8C6436] font-mono text-[11px] tracking-wider uppercase font-semibold border border-[#EAD5BA]">
                    <Crown className="h-3.5 w-3.5 text-[#B8860B]" />
                    <span>Exclusive Member Privilege</span>
                  </div>

                  <div>
                    <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-[#1E1B18] leading-tight">
                      KRIA Subscription
                    </h2>
                    <p className="font-serif italic text-base sm:text-lg text-[#8C6436] mt-0.5">
                      More Savings. Priority Service.
                    </p>
                  </div>

                  {/* Gold Badge: ONLY ₹499 · 3 MONTHS VALIDITY */}
                  <div className="inline-flex items-center gap-3 py-2 px-4 rounded-xl bg-gradient-to-r from-[#FDEFD8] via-[#FFF9F0] to-[#F7E7CE] border border-[#DEB887] shadow-xs">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#8C6436]">
                      ONLY ₹499
                    </span>
                    <span className="h-5 w-px bg-[#DEB887]/60" />
                    <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#6B4E2B] font-bold">
                      3 MONTHS VALIDITY
                    </span>
                  </div>

                  {/* 3 Main Value Pillars from Poster */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {/* Pillar 1 */}
                    <div className="p-3 rounded-xl bg-white border border-[#EADBCC] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-1">
                      <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto sm:mx-0">
                        <Coins className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-serif text-base font-bold text-[#1E1B18]">₹2 OFF</div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold">
                          On Every Frame
                        </p>
                      </div>
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-3 rounded-xl bg-white border border-[#EADBCC] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-1">
                      <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto sm:mx-0">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-serif text-base font-bold text-[#1E1B18]">1 Day Dispatch</div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold">
                          On Ready Frames
                        </p>
                      </div>
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-3 rounded-xl bg-white border border-[#EADBCC] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-1">
                      <div className="h-7 w-7 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mx-auto sm:mx-0">
                        <Crown className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-serif text-base font-bold text-[#1E1B18]">Customer Priority</div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold">
                          Exclusive Support
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Join Now WhatsApp CTA */}
                  <div className="pt-1">
                    <a
                      href={waLink("Hi KRIA Tech! I would like to join the KRIA Subscription plan (ONLY ₹499 for 3 MONTHS VALIDITY). Please share activation details for ₹2 OFF on every frame, 1-day dispatch, and priority customer service.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-[0.14em] shadow-[0_6px_20px_rgba(37,211,102,0.3)] transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Join KRIA Subscription (₹499)</span>
                    </a>
                  </div>
                </div>

                {/* Right Visual Poster Showcase */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_15px_35px_rgba(180,140,80,0.15)] border-2 border-[#E7D6C2] bg-white group hover:shadow-[0_20px_45px_rgba(180,140,80,0.2)] transition-all duration-300">
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
          <section id="faqs" className="py-8 sm:py-12 max-w-3xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-5">
              <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold">
                Clear Answers
              </p>
              <h2 className="font-serif text-xl sm:text-2xl font-light text-[#1E1B18] mt-0.5">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-2">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-white/80 backdrop-blur-md border border-[#E9DCCE] overflow-hidden transition-all duration-150"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                      className="w-full py-2.5 px-3.5 text-left flex items-center justify-between gap-2.5 cursor-pointer"
                    >
                      <span className="font-serif text-xs sm:text-sm text-[#1E1B18] font-normal">
                        {faq.q}
                      </span>
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#8C6436]' : 'text-[#8A7969]'}`}>
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-3.5 pb-3 text-[11px] sm:text-xs text-[#615345] leading-relaxed border-t border-[#F2E7DC] pt-2">
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
              <ul className="text-xs text-[#635546] space-y-2">
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
                {onBackToStore && (
                  <li>
                    <button
                      type="button"
                      onClick={onBackToStore}
                      className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-[#1E1B18] text-[#FDFBF7] hover:bg-[#8C6436] text-[11px] font-mono font-medium tracking-wide transition-all cursor-pointer mt-1"
                    >
                      <span>Visit Full Store</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </li>
                )}
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
              {onBackToStore && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={onBackToStore}
                    className="text-[#8C6436] hover:text-[#1E1B18] font-bold uppercase underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Online Store
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING CART & WHATSAPP BUTTONS (DESKTOP & MOBILE) ────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Floating Cart Button (shows count when items exist) */}
        {cart.length > 0 && (
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#1E1B18] text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:bg-[#8C6436] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="View Cart"
          >
            <ShoppingCart className="h-5 w-5 text-[#E7D6C2]" />
            <span className="text-xs font-mono font-bold">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
            <span className="text-xs font-serif font-bold text-[#E7D6C2] ml-0.5">· ₹{totalCartPrice.toLocaleString('en-IN')}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (cart.length > 0) {
              window.open(waLink(buildMultiCartWhatsAppMessage()), '_blank');
            } else if (activeProduct && currentSize) {
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
            {cart.length > 0 ? `WhatsApp Order (${cart.length})` : activeProduct ? 'WhatsApp Exact Specs' : 'Configure & WhatsApp'}
          </span>
        </button>
      </div>

      {/* ─── TOAST NOTIFICATION WHEN ITEM ADDED TO CART ────────── */}
      {cartToastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 py-3 px-4 rounded-2xl bg-[#1E1B18] text-white shadow-2xl border border-white/20 text-xs font-mono">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{cartToastMessage}</span>
          </div>
        </div>
      )}

      {/* ─── MULTI-ITEM CART SLIDEOUT DRAWER ─────────────────────── */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsCartDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden border-l border-[#EADECE]">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#EADECE] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-[#FAF1E3] flex items-center justify-center border border-[#E9D7C1]">
                  <ShoppingCart className="h-4 w-4 text-[#8C6436]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1E1B18]">Your Custom Cart</h3>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#8A7969]">
                    {cart.length} Shape{cart.length !== 1 ? 's' : ''} & Size{cart.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-[10px] font-mono text-[#9B8977] hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close Cart"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-[#FAF0E2] border border-[#E7D6C0] flex items-center justify-center mx-auto text-[#8C6436]">
                    <ShoppingCart className="h-7 w-7 opacity-60" />
                  </div>
                  <h4 className="font-serif text-xl font-medium text-[#1E1B18]">Your Cart is Empty</h4>
                  <p className="text-xs text-[#8A7969] font-mono max-w-xs mx-auto">
                    Select any product shape and size, then tap <strong>"Add to Cart"</strong> to combine different items.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      handleCloseProduct('#products');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1B18] text-white text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#8C6436] transition-colors cursor-pointer mt-2"
                  >
                    <span>Browse 5 Products</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#EADBCC] shadow-xs flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-14 w-14 rounded-xl bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif text-sm font-semibold text-[#1E1B18] truncate">
                          {item.productName}
                        </h4>
                        <p className="text-[11px] font-mono text-[#8C6436] font-medium mt-0.5">
                          {item.sizeLabel}
                        </p>
                        <p className="text-[10px] font-mono text-[#8A7969]">
                          ₹{item.unitPrice}/pc × {item.quantity} pcs
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-serif text-sm font-bold text-[#1E1B18]">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 bg-[#FAF6F0] border border-[#E7D7C4] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateCartItemQty(item.id, -10)}
                          className="h-5 w-5 rounded flex items-center justify-center text-[#695B4E] hover:bg-white transition-colors cursor-pointer"
                          title="-10 pcs"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-[11px] font-mono font-bold px-1.5 text-[#1E1B18]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCartItemQty(item.id, 10)}
                          className="h-5 w-5 rounded flex items-center justify-center text-[#695B4E] hover:bg-white transition-colors cursor-pointer"
                          title="+10 pcs"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCartItem(item.id)}
                        className="text-[10px] font-mono text-stone-400 hover:text-rose-600 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer with Structured WhatsApp Checkout CTA */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 bg-white border-t border-[#EADECE] space-y-3">
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between items-center text-[#6E6152]">
                    <span>Total Items:</span>
                    <strong className="text-[#1E1B18]">{cart.length} types · {totalCartFrames} total pcs</strong>
                  </div>
                  {totalCartSavings > 0 && (
                    <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                      <span>Total Savings:</span>
                      <strong className="font-bold">₹{totalCartSavings.toLocaleString('en-IN')}</strong>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-1 border-t border-[#EFE5D9]">
                    <span className="font-bold text-[#1E1B18]">Grand Total:</span>
                    <span className="font-serif text-2xl font-bold text-[#1E1B18]">
                      ₹{totalCartPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Submit All to WhatsApp */}
                <a
                  href={waLink(buildMultiCartWhatsAppMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.14em] shadow-[0_6px_22px_rgba(37,211,102,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                  <span>Order All on WhatsApp (₹{totalCartPrice.toLocaleString('en-IN')})</span>
                </a>

                <p className="text-[10px] font-mono text-center text-[#8C7A68]">
                  🔒 Your entire multi-shape order summary will be sent to WhatsApp. Share your photos there to preview before production!
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
