import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageCircle, Star, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ShieldCheck,
  Package, Award, Heart, Sparkles, CheckCircle2, Phone,
  MapPin, Clock, Users, ArrowUpRight,
  ArrowLeft, ZoomIn, Check, Info, Calendar, Gift, Crown, Truck, Coins, Key,
  ShoppingCart, Trash2, Plus, Minus, X, Settings
} from 'lucide-react';
import {
  calculateCombinedCartPricing,
  calculateTierMilestone,
  DEFAULT_PRODUCT_PRICING_CONFIGS,
  ProductVariantPricingConfig,
  findPricingConfig,
  getTierRateForQuantity
} from '../pricingEngine.ts';
import { WholesalePriceTable } from './WholesalePriceTable';
import { WholesalePricingAdminModal } from './WholesalePricingAdminModal';
import { KriaPriceTag } from './KriaPriceTag';

const WA_NUMBER = '919392576792';

function waLink(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

interface ProductSize {
  label: string;
  dimensions: string;
  shapeName?: string;
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
    image: '/images/prod_thumb_rectangle.png',
    category: 'Landscape & Panorama',
    sizes: [
      { label: '3.5 × 2.5"', dimensions: '3.5 × 2.5 inch', basePrice: 64, originalPrice: 99, previewImage: '/images/dimension_preview_3.5x2.5.png' },
      { label: '3 × 4"', dimensions: '3 × 4 inch', basePrice: 75, originalPrice: 119, previewImage: '/images/dimension_preview_3x4.png' },
      { label: '6 × 4"', dimensions: '6 × 4 inch', basePrice: 113, originalPrice: 179, previewImage: '/images/dimension_preview_6x4.png' }
    ],
    accentColor: '#365349',
    bgGlow: 'from-emerald-100/60 via-sand-50/40 to-transparent'
  },
  {
    id: 'square',
    name: 'Minimal Square',
    tagline: 'Geometric Balance & Modern Grids',
    subtitle: 'Personalised acrylic magnetic square frame',
    image: '/images/prod_thumb_square.png',
    category: 'Grid & Modern Living',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 49, originalPrice: 79, previewImage: '/images/dimension_preview_square_2x2.jpg' },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 65, originalPrice: 99, previewImage: '/images/dimension_preview_square_3x3.jpg' },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 88, originalPrice: 139, previewImage: '/images/dimension_preview_square_4x4.jpg' }
    ],
    accentColor: '#A3704C',
    bgGlow: 'from-amber-100/60 via-stone-50/40 to-transparent'
  },
  {
    id: 'circle',
    name: 'Minimal Circle',
    tagline: 'Infinite Symmetry & Contemporary Zen',
    subtitle: 'Personalised acrylic magnetic circle frame',
    image: '/images/prod_thumb_circle.png',
    category: 'Modern Living',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 49, originalPrice: 79, previewImage: '/images/dimension_preview_circle_2x2.png' },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 65, originalPrice: 99, previewImage: '/images/dimension_preview_circle_3x3.png' },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 88, originalPrice: 139, previewImage: '/images/dimension_preview_circle_4x4.png' }
    ],
    accentColor: '#4A6B82',
    bgGlow: 'from-sky-100/60 via-amber-50/40 to-transparent'
  },
  {
    id: 'heart',
    name: 'Sculpted Heart',
    tagline: 'Romance & Everlasting Keepsakes',
    subtitle: 'Personalised acrylic magnetic heart frame',
    image: '/images/prod_thumb_heart.png',
    category: 'Celebration & Gifting',
    sizes: [
      { label: '2 × 2"', dimensions: '2 × 2 inch', basePrice: 49, originalPrice: 79, previewImage: '/images/dimension_preview_heart_2x2.png' },
      { label: '3 × 3"', dimensions: '3 × 3 inch', basePrice: 65, originalPrice: 99, previewImage: '/images/dimension_preview_heart_3x3.png' },
      { label: '4 × 4"', dimensions: '4 × 4 inch', basePrice: 88, originalPrice: 139, previewImage: '/images/dimension_preview_heart_4x4.png' }
    ],
    accentColor: '#B76E79',
    bgGlow: 'from-rose-100/60 via-pink-50/40 to-transparent'
  },
  {
    id: 'keychain',
    name: 'Keychains',
    tagline: 'Pocket Luxury & Daily Companions',
    subtitle: 'Dual-sided 2mm acrylic photo keychain with metallic swivel ring',
    image: '/images/prod_thumb_keychain.jpg',
    category: 'Keychains & Accessories',
    sizes: [
      { label: '2.5"', dimensions: '2.5 inch Circle with Ring', shapeName: 'Circle', basePrice: 32, originalPrice: 59, previewImage: '/images/keychain_circle_official.jpg' },
      { label: '2 × 3"', dimensions: '2 × 3 inch Rectangle with Ring', shapeName: 'Rectangle', basePrice: 38, originalPrice: 69, previewImage: '/images/keychain_square_official.jpg' }
    ],
    accentColor: '#D97706',
    bgGlow: 'from-orange-100/60 via-amber-50/40 to-transparent'
  }
];

const QUANTITY_TIERS = [
  { label: '50 pcs', count: 50 },
  { label: '100 pcs', count: 100 },
  { label: '200 pcs', count: 200 },
  { label: '300 pcs', count: 300 },
  { label: '500 pcs', count: 500 },
  { label: '1000 pcs', count: 1000 },
  { label: 'Custom', count: 0 }
];

// Verified B2B Wholesale Unit Rate Matrix (50, 100, 200, 300, 500, 1000 pcs)
const B2B_RATE_MATRIX: Record<string, Record<string, Record<number, number>>> = {
  square: {
    '2 × 2"': { 50: 28, 100: 27.5, 200: 27, 300: 26.5, 500: 26, 1000: 25 },
    '3 × 3"': { 50: 36, 100: 35.5, 200: 35, 300: 34.5, 500: 34, 1000: 33 },
    '4 × 4"': { 50: 51, 100: 50.5, 200: 50, 300: 49.5, 500: 49, 1000: 48 }
  },
  rectangle: {
    '3.5 × 2.5"': { 50: 36, 100: 35.5, 200: 35, 300: 34.5, 500: 34, 1000: 33 },
    '3 × 4"': { 50: 41, 100: 40.5, 200: 40, 300: 39.5, 500: 39, 1000: 38 },
    '6 × 4"': { 50: 61, 100: 60.5, 200: 60, 300: 59.5, 500: 59, 1000: 58 }
  },
  circle: {
    '2 × 2"': { 50: 25, 100: 24.5, 200: 24, 300: 23.5, 500: 23, 1000: 22 },
    '3 × 3"': { 50: 33, 100: 32.5, 200: 32, 300: 31.5, 500: 31, 1000: 30 },
    '4 × 4"': { 50: 47, 100: 46.5, 200: 46, 300: 45.5, 500: 45, 1000: 44 }
  },
  heart: {
    '2 × 2"': { 50: 25, 100: 24.5, 200: 24, 300: 23.5, 500: 23, 1000: 22 },
    '3 × 3"': { 50: 33, 100: 32.5, 200: 32, 300: 31.5, 500: 31, 1000: 30 },
    '4 × 4"': { 50: 47, 100: 46.5, 200: 46, 300: 45.5, 500: 45, 1000: 44 }
  },
  keychain: {
    '2.5"': { 50: 30, 100: 29.5, 200: 29, 300: 28.5, 500: 28, 1000: 27 },
    '2 × 3"': { 50: 36, 100: 35.5, 200: 35, 300: 34.5, 500: 34, 1000: 33 },
    '3 × 3"': { 50: 36, 100: 35.5, 200: 35, 300: 34.5, 500: 34, 1000: 33 }
  }
};

function getTierUnitRate(productId: string, sizeLabel: string, totalPcs: number, fallbackBase: number, configs?: ProductVariantPricingConfig[]): number {
  if (configs) {
    const cfg = findPricingConfig(productId, sizeLabel, configs);
    if (cfg) {
      return getTierRateForQuantity(cfg, totalPcs).unitPrice;
    }
  }
  const prod = B2B_RATE_MATRIX[productId];
  if (!prod) return fallbackBase;
  const rates = prod[sizeLabel];
  if (!rates) return fallbackBase;

  if (totalPcs >= 1000) return rates[1000];
  if (totalPcs >= 500) return rates[500];
  if (totalPcs >= 300) return rates[300];
  if (totalPcs >= 200) return rates[200];
  if (totalPcs >= 100) return rates[100];
  if (totalPcs >= 50) return rates[50];
  return fallbackBase;
}

// Sliding images for Hero Carousel
const HERO_SLIDES = [
  {
    image: '/images/hero_1.jpg',
    title: 'Diamond-Cut Acrylic Frame Magnets',
    subtitle: 'Laser-contoured 2mm monolithic cast acrylic handcrafted in Hyderabad',
    badge: 'Real Lifestyle Gallery'
  },
  {
    image: '/images/hero_2.jpg',
    title: 'Optically Clear Monolithic Acrylic',
    subtitle: 'Fade-proof photographic clarity backed by rare-earth neodymium magnetic cores',
    badge: 'Optical Clarity'
  },
  {
    image: '/images/hero_3.jpg',
    title: 'Demo Starter Kit · 24 Pieces for ₹999',
    subtitle: 'Includes 20 acrylic frames in different sizes & shapes + 4 FREE bonus keychains with free delivery',
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
    a: 'We use 100% cell-cast monolithic 2mm acrylic with 93% optical light transmittance. It never yellows, does not warp, and is completely shatterproof.'
  },
  {
    q: 'Will the neodymium magnet slide or scratch metal surfaces?',
    a: 'No. Grade N35 rare-earth neodymium magnets are countersunk flush into the back for strong shear resistance that will not slip down or scratch enamel.'
  },
  {
    q: 'What is included in the ₹999 Demo Starter Kit?',
    a: 'The Kria Tech Demo Starter Kit includes 20 custom acrylic photo frames in different sizes and shapes plus 4 FREE Bonus Acrylic Photo Keychains (24 pieces total) with free doorstep air delivery across India — ideal for stall owners and resellers to test quality before ordering in bulk.'
  },
  {
    q: 'Do you offer wholesale pricing and bulk discounts for resellers and stall owners?',
    a: 'Yes. We offer factory-direct B2B wholesale pricing with tiered bulk discounts starting from low MOQs for fridge magnet stall owners, gift shops, photographers, and resellers across India.'
  },
  {
    q: 'Can we order custom acrylic magnets for corporate gifting or wedding return gifts?',
    a: 'Yes. We manufacture bulk custom-branded corporate gifts, conference keepsakes, and wedding return gifts in Rectangle, Square, Circle, Heart, and Keychain formats with pan-India express dispatch.'
  },
  {
    q: 'How fast is dispatch and shipping across India?',
    a: 'Produced within 24–48 hours at our Hyderabad facility, then shipped via express air couriers (Blue Dart / DTDC / Delhivery) delivering in 2–4 business days with tracking.'
  }
];

// 20 Custom Acrylic Frames + 4 FREE Bonus Keychains (24 Pieces Total)
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
  const [selectedQtyLabel, setSelectedQtyLabel] = useState<string>('50 pcs');
  const [customQtyValue, setCustomQtyValue] = useState<number | ''>(75);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [activeGalleryTab, setActiveGalleryTab] = useState<'frame' | 'magnets' | 'how_to_use' | 'on_fridge' | 'gift_box'>('frame');
  const [isHoverZooming, setIsHoverZooming] = useState<boolean>(false);
  const [zoomCoords, setZoomCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [activeSubTab, setActiveSubTab] = useState<'quarterly' | 'annual'>('annual');

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

  // Dynamic Wholesale Pricing Tier Configurations (Admin editable & persistent)
  const [pricingConfigs, setPricingConfigs] = useState<ProductVariantPricingConfig[]>(() => {
    try {
      const saved = localStorage.getItem('kria_pricing_configs');
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCT_PRICING_CONFIGS;
    } catch {
      return DEFAULT_PRODUCT_PRICING_CONFIGS;
    }
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Fetch latest wholesale tier matrix from backend API on mount
  useEffect(() => {
    fetch('/api/products/tiers')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setPricingConfigs(data.data);
          try {
            localStorage.setItem('kria_pricing_configs', JSON.stringify(data.data));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Could not fetch remote wholesale tiers:', err);
      });
  }, []);

  // Keyboard shortcut Ctrl+Shift+W to open Admin Pricing Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        setIsAdminModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Authoritative combined cart wholesale calculation result
  const cartPricingResult = useMemo(() => {
    return calculateCombinedCartPricing(cart, pricingConfigs);
  }, [cart, pricingConfigs]);

  // Background server revalidation check
  useEffect(() => {
    if (cart.length === 0) return;
    fetch('/api/cart/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    }).catch(() => {});
  }, [cart]);

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

  // Open Starter Kit with 24 Pieces dedicated page with browser history
  const handleOpenStarterKit = () => {
    setSelectedProductId(null);
    setIsStarterKitOpen(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      url.searchParams.set('kit', '24-piece');
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

  // Close product/starter-kit and return to products view (respects browser history)
  const handleCloseProduct = (targetHash: string = '#products') => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      url.searchParams.delete('kit');
      if (targetHash) {
        url.hash = targetHash;
      }
      window.history.replaceState({ page: 'home' }, '', url.toString());
      setSelectedProductId(null);
      setIsStarterKitOpen(false);
      setTimeout(() => {
        const el = document.querySelector(targetHash || '#products');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
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
    setSelectedQtyLabel('50 pcs');
    setActiveGalleryTab('frame');
    setIsHoverZooming(false);
  }, [selectedProductId]);

  // Sync scroll on view change: only scroll to top when opening a dedicated product or kit view
  useEffect(() => {
    if (selectedProductId || isStarterKitOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedProductId, isStarterKitOpen]);

  // Calculation for Product Detail Page
  const currentSize = activeProduct ? activeProduct.sizes[activeSizeIndex] || activeProduct.sizes[0] : null;
  const currentTier = QUANTITY_TIERS.find((t) => t.label === selectedQtyLabel) || QUANTITY_TIERS[0];
  const actualQty = currentTier.label === 'Custom'
    ? Math.max(1, typeof customQtyValue === 'number' && !isNaN(customQtyValue) ? customQtyValue : 1)
    : currentTier.count;
  const unitOriginalPrice = currentSize ? currentSize.originalPrice : 79;
  
  // Qualifying pieces for this product: unlocked by combined cart or chosen batch qty
  const qualifyingQty = Math.max(cartPricingResult.totalEligibleQty, actualQty);
  const unitDiscountedPrice = activeProduct && currentSize
    ? getTierUnitRate(activeProduct.id, currentSize.label, qualifyingQty, currentSize.basePrice, pricingConfigs)
    : 28;
  const discountPercentage = unitOriginalPrice > unitDiscountedPrice
    ? Math.round(((unitOriginalPrice - unitDiscountedPrice) / unitOriginalPrice) * 100)
    : 0;
  const totalPrice = Math.round(unitDiscountedPrice * actualQty * 100) / 100;
  const originalTotalPrice = unitOriginalPrice * actualQty;
  const factorySavings = Math.round((originalTotalPrice - totalPrice) * 100) / 100;

  // Save handler for admin pricing updates
  const handleSavePricingConfig = async (updatedConfig: ProductVariantPricingConfig): Promise<boolean> => {
    try {
      const nextConfigs = pricingConfigs.map((c) =>
        c.productId === updatedConfig.productId && c.sizeLabel === updatedConfig.sizeLabel
          ? updatedConfig
          : c
      );
      if (!pricingConfigs.some((c) => c.productId === updatedConfig.productId && c.sizeLabel === updatedConfig.sizeLabel)) {
        nextConfigs.push(updatedConfig);
      }
      setPricingConfigs(nextConfigs);
      try {
        localStorage.setItem('kria_pricing_configs', JSON.stringify(nextConfigs));
      } catch {}

      const res = await fetch(`/api/products/${updatedConfig.productId}/tiers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend update failed, saved locally:', err);
      return false;
    }
  };

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
      originalUnitPrice: currentSize.originalPrice,
      totalPrice: totalPrice
    };

    setCart((prev) => {
      // Check if exact same product & size already exists in cart
      const existingIdx = prev.findIndex(
        (it) => it.productId === newItem.productId && it.sizeLabel === newItem.sizeLabel
      );
      let updatedItems: KriaCartItem[];
      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newQty = existing.quantity + newItem.quantity;
        updated[existingIdx] = {
          ...existing,
          quantity: newQty
        };
        updatedItems = updated;
      } else {
        updatedItems = [...prev, newItem];
      }

      // Dynamic B2B Cart-Wide Tier Pricing: authoritative combined calculation!
      const calculated = calculateCombinedCartPricing(updatedItems, pricingConfigs);
      return calculated.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        productImage: it.productImage || '',
        sizeLabel: it.sizeLabel,
        dimensions: it.dimensions || '',
        quantity: it.quantity,
        unitPrice: it.effectiveUnitPrice,
        originalUnitPrice: it.regularUnitPrice,
        totalPrice: it.lineTotal
      }));
    });

    setCartToastMessage(`Added ${actualQty}x ${activeProduct.name} (${currentSize.label}) to Cart!`);
    setIsCartDrawerOpen(true);
    setTimeout(() => {
      setCartToastMessage(null);
    }, 4000);
  };

  const handleUpdateCartItemQty = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          let newQty: number;
          if (delta < 0) {
            newQty = Math.max(10, item.quantity - 10);
          } else {
            const roundedBase = Math.floor(item.quantity / 10) * 10;
            newQty = Math.max(10, roundedBase + 10);
          }
          return {
            ...item,
            quantity: newQty
          };
        }
        return item;
      });

      const calculated = calculateCombinedCartPricing(updated, pricingConfigs);
      return calculated.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        productImage: it.productImage || '',
        sizeLabel: it.sizeLabel,
        dimensions: it.dimensions || '',
        quantity: it.quantity,
        unitPrice: it.effectiveUnitPrice,
        originalUnitPrice: it.regularUnitPrice,
        totalPrice: it.lineTotal
      }));
    });
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => {
      const filtered = prev.filter((it) => it.id !== id);
      const calculated = calculateCombinedCartPricing(filtered, pricingConfigs);
      return calculated.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        productImage: it.productImage || '',
        sizeLabel: it.sizeLabel,
        dimensions: it.dimensions || '',
        quantity: it.quantity,
        unitPrice: it.effectiveUnitPrice,
        originalUnitPrice: it.regularUnitPrice,
        totalPrice: it.lineTotal
      }));
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Cart summary calculations synced with authoritative engine
  const totalCartFrames = cartPricingResult.totalCartQty;
  const totalCartPrice = cartPricingResult.totalAmount;
  const totalCartOriginal = cartPricingResult.totalRegularAmount;
  const totalCartSavings = cartPricingResult.totalSavings;

  // Build Comprehensive Multi-Product WhatsApp Order Message
  const buildMultiCartWhatsAppMessage = () => {
    if (cart.length === 0) return '';
    let msg = `Hi KRIA Tech! I would like to place an order for multiple customized acrylic products:\n\n`;
    msg += `🛒 *ORDER SUMMARY (${cart.length} item types · ${totalCartFrames} total pcs):*\n`;
    msg += `🏆 *UNLOCKED WHOLESALE TIER: ${cartPricingResult.milestone.currentTierLabel}*\n`;
    msg += `─────────────────────────\n`;

    cartPricingResult.items.forEach((it, idx) => {
      const formattedUnitPrice = it.effectiveUnitPrice % 1 === 0 ? it.effectiveUnitPrice.toString() : it.effectiveUnitPrice.toFixed(2);
      const formattedTotalPrice = it.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: it.lineTotal % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
      msg += `${idx + 1}. *${it.productName}*\n`;
      msg += `   • Size: ${it.sizeLabel} (${it.dimensions || ''})\n`;
      msg += `   • Quantity: ${it.quantity} pcs\n`;
      msg += `   • Wholesale Price: ₹${formattedUnitPrice}/pc (₹${formattedTotalPrice})\n\n`;
    });

    msg += `─────────────────────────\n`;
    const formattedGrandTotal = totalCartPrice.toLocaleString('en-IN', { minimumFractionDigits: totalCartPrice % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
    msg += `💰 *TOTAL ESTIMATE: ₹${formattedGrandTotal}*\n`;
    if (totalCartSavings > 0) {
      const formattedSavings = totalCartSavings.toLocaleString('en-IN', { minimumFractionDigits: totalCartSavings % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
      msg += `✨ *FACTORY DIRECT SAVINGS: ₹${formattedSavings}*\n`;
    }
    msg += `Please confirm order placement and dispatch timeline!`;
    return msg;
  };
  const buildExactQuoteMessage = (prodName: string, sizeLabel: string, dimensions: string, qty: number, unitRate: number, origRate: number, total: number, savings: number) => {
    const formattedUnitRate = unitRate % 1 === 0 ? unitRate.toString() : unitRate.toFixed(2);
    const formattedTotal = total.toLocaleString('en-IN', { minimumFractionDigits: total % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
    const formattedSavings = savings.toLocaleString('en-IN', { minimumFractionDigits: savings % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
    return `Hi KRIA Tech! I have selected my product specifications on your website:

• Product Shape: ${prodName}
• Dimension: ${sizeLabel} (${dimensions})
• Batch Quantity: ${qty} pcs
• Unit Rate: ₹${formattedUnitRate} / pc (Original ₹${origRate}, ${discountPercentage}% bulk discount)
• Total Estimate: ₹${formattedTotal}
• Factory Direct Savings: ₹${formattedSavings}

Please confirm bulk order placement and dispatch timeline.`;
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
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer text-left"
          >
            <div className="h-10 w-10 rounded-2xl bg-white border border-[#761618]/40 flex items-center justify-center p-1.5 shadow-[0_4px_12px_rgba(118,22,24,0.08)] group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              <img src="/images/kria_logo_official.png" alt="KRIA Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#761618] leading-none">
              KRIA TECH
            </span>
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
              Demo Starter Kit (₹999)
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
              <a
                href={waLink("Hi KRIA Tech! I need assistance with your acrylic frames and keychains. Can you please help me?")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(37,211,102,0.28)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Support</span>
              </a>
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
            onClick={() => handleCloseProduct('#products')}
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
                    2mm Optical Cast Glass
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
                <div className={`grid ${activeProduct.sizes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
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
                      {sz.shapeName && (
                        <span className={`text-[11px] font-mono font-semibold uppercase tracking-wider mt-0.5 ${activeSizeIndex === idx ? 'text-amber-300' : 'text-[#8C6436]'}`}>
                          {sz.shapeName}
                        </span>
                      )}
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
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
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
                      placeholder="e.g. 75"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setCustomQtyValue('');
                        } else {
                          const parsed = parseInt(val, 10);
                          if (!isNaN(parsed)) {
                            setCustomQtyValue(Math.min(10000, Math.max(0, parsed)));
                          }
                        }
                      }}
                      onBlur={() => {
                        if (customQtyValue === '' || customQtyValue < 1) {
                          setCustomQtyValue(1);
                        }
                      }}
                      className="w-28 px-3 py-1.5 rounded-lg border border-[#D8C7B5] bg-white font-mono text-sm text-[#1E1B18] outline-none focus:ring-2 focus:ring-[#C4A574]"
                    />
                    <span className="text-xs font-mono text-[#8C7A68]">frames</span>
                  </div>
                )}
              </div>

              {/* 3. Unified Wholesale Price Tag & Order Action Card (Apple-Grade Proportions) */}
              {activeProduct && currentSize && (
                <KriaPriceTag
                  productId={activeProduct.id}
                  sizeLabel={currentSize.label}
                  totalCartQty={cartPricingResult.totalEligibleQty}
                  selectedBatchQty={actualQty}
                  totalPrice={totalPrice}
                  factorySavings={factorySavings}
                  onAddToCart={handleAddToCart}
                  configs={pricingConfigs}
                />
              )}

              {/* 4. Combined Cart Wholesale Price Table */}
              {activeProduct && currentSize && (
                <WholesalePriceTable
                  productId={activeProduct.id}
                  productName={activeProduct.name}
                  sizeLabel={currentSize.label}
                  totalCartQty={cartPricingResult.totalEligibleQty}
                  configs={pricingConfigs}
                />
              )}

              {/* Guarantees & Features */}
              <div className="space-y-2.5 pt-1 text-xs text-[#635547]">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#8C6436] shrink-0" />
                  <span>Your photo is printed and assembled by hand in Hyderabad, made to order</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#8C6436] shrink-0" />
                  <span>Clear 2mm cast acrylic with flush neodymium magnetic closure</span>
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
            VIEW 2: DEDICATED COMPLETE 24-PIECE BOX SET PAGE
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
                      alt="Complete 24-Piece Starter Kit Collection on Refrigerator"
                      style={{
                        transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                        transform: isHoverZooming ? 'scale(2.2)' : 'scale(1)',
                      }}
                      className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-150 pointer-events-none select-none"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#7C6348] font-mono text-xs font-bold border border-[#EADBCC] shadow-md pointer-events-none">
                      24 Pieces Total
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
                    <span>Kria Tech Demo Starter Kit</span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1E1B18] leading-tight">
                    Start Your Magnet Business for Just ₹999!
                  </h1>

                  <ul className="space-y-2 text-xs sm:text-sm text-[#52463A] font-sans">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Start a fridge magnet stall with minimal investment.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Test our quality before ordering in bulk.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>20 Acrylic Frames in different sizes & shapes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>4 FREE Bonus Keychains — <strong>24 Pieces Total</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Perfect for beginners, stall owners & resellers.</span>
                    </li>
                  </ul>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-4xl sm:text-6xl font-bold text-[#1E1B18] tracking-tight">₹999</span>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
                        Special Starter Kit Price
                      </span>
                    </div>
                  </div>
                </div>



                {/* Direct WhatsApp CTA Button */}
                <div className="space-y-3 pt-2">
                  <a
                    href={waLink("Hi KRIA Tech! I would like to order the Kria Tech Demo Starter Kit (₹999 Special Starter Kit Price: 20 Acrylic Frames in different sizes & shapes + 4 FREE Bonus Keychains — 24 Pieces Total). Please confirm order placement and dispatch timeline.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-[0.16em] shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Order Your Starter Kit</span>
                  </a>

                  <p className="text-[11px] font-mono text-center text-[#8C7A68]">
                    🔒 No upfront payment needed · Chat with us on WhatsApp to place your bulk order
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
          <section className="relative px-3 sm:px-8 pt-2 sm:pt-6 pb-3 sm:pb-8 max-w-7xl mx-auto">
            <div className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_15px_40px_rgba(180,140,80,0.12)] border border-white/80 bg-[#1E1B18] aspect-[16/9] sm:aspect-[21/9] max-h-[480px]">
              
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

              {/* Common Hovering Sentence on Slides */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-6 z-20 pointer-events-none">
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-black/55 backdrop-blur-md border border-white/20 text-white shadow-lg inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <p className="text-[11px] sm:text-xs font-serif tracking-wide drop-shadow">
                    Trusted by 500+ Stall Owners & Resellers · 1,00,000+ Acrylic Products Delivered Across India
                  </p>
                </div>
              </div>

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
          <section id="products" className="py-6 sm:py-12 max-w-7xl mx-auto px-3 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-8">
              <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#8C6436] font-bold mb-1">
                Factory-Direct B2B Wholesale
              </p>
              <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-light text-[#1E1B18]">
                Wholesale Custom Acrylic Magnets &amp; Keychains
              </h1>
              <p className="mt-1 text-[11px] sm:text-sm text-[#6E6153] leading-relaxed max-w-xl mx-auto">
                Choose a 2mm cast acrylic shape to preview dimensions, magnet specs, and bulk tier discounts.
              </p>
            </div>

            {/* 5 Cards Responsive Grid: 2 cols on Mobile, 3 cols on Tablet, 5 cols on Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-5">
              {PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleOpenProduct(prod.id)}
                  className="group rounded-2xl sm:rounded-3xl bg-white/75 backdrop-blur-xl border border-white hover:border-[#D9C4AC] p-2.5 sm:p-5 shadow-[0_8px_25px_rgba(180,140,80,0.06)] hover:shadow-[0_22px_55px_rgba(180,140,80,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Visual Area */}
                    <div className={`relative h-32 sm:h-64 rounded-xl sm:rounded-2xl bg-gradient-to-b ${prod.bgGlow} flex items-center justify-center p-1.5 sm:p-2 overflow-hidden mb-2 sm:mb-3.5 transition-transform duration-300 group-hover:scale-[1.02]`}>
                      <img
                        src={prod.image}
                        alt={`${prod.name} — Wholesale Custom 2mm Acrylic Photo Fridge Magnet by KRIA Tech`}
                        className="w-full h-full object-contain filter drop-shadow-[0_8px_18px_rgba(90,60,30,0.18)] group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5">
                        <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#7C6348] border border-[#E8DACB] shadow-xs">
                          2mm Cast
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-sm sm:text-xl font-medium text-[#1E1B18] mt-0.5 group-hover:text-[#8C6436] transition-colors leading-tight line-clamp-1 sm:line-clamp-none">
                      {prod.name}
                    </h3>

                    {/* Formats preview */}
                    <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-3 border-t border-[#EFE5D9]">
                      <p className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-[#9A8775] mb-1 font-bold hidden sm:block">
                        Available Sizes
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {prod.sizes.map((s, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#FAF4ED] border border-[#EAE0D3]"
                          >
                            <span className="text-[9px] sm:text-[10px] font-mono font-medium text-[#695B4E]">
                              {s.label}
                            </span>
                            {s.shapeName && (
                              <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-wider font-bold text-[#8C6436]">
                                {s.shapeName}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Open Separate Product Page CTA */}
                  <div className="mt-3 sm:mt-6 pt-2 sm:pt-4 border-t border-[#EFE5D9]">
                    <div className="w-full inline-flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-1.5 sm:px-4 rounded-xl bg-[#1E1B18] group-hover:bg-[#8C6436] text-[#FDFBF7] text-[9.5px] sm:text-xs font-bold uppercase tracking-wider transition-colors text-center">
                      <span>Choose Size &amp; Quantity</span>
                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── DEDICATED STARTER KIT SECTION: 2-COLUMN PREVIEW BLOCK ─── */}
          <section id="starter-kit" className="py-5 sm:py-12 max-w-7xl mx-auto px-3 sm:px-8">
            <div className="rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#FAF3EA] via-white to-[#F4E9DC] backdrop-blur-2xl border border-white p-4 sm:p-10 shadow-[0_15px_40px_rgba(180,140,80,0.08)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-10 items-center">
                
                {/* Left Side: Clickable Single Fridge Photo Preview of the Starter Kit */}
                <div 
                  onClick={handleOpenStarterKit}
                  className="lg:col-span-5 relative rounded-xl sm:rounded-3xl overflow-hidden shadow-[0_10px_25px_rgba(180,140,80,0.12)] border border-white group cursor-pointer max-h-56 sm:max-h-none"
                  title="Click to inspect the Demo Starter Kit"
                >
                  <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl sm:rounded-3xl overflow-hidden bg-[#FAF4ED]">
                    <img 
                      src="/images/starter_kit_complete_fridge_collection.jpg" 
                      alt="Kria Tech Demo Starter Kit Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/90 backdrop-blur-md text-[#7C6348] font-mono text-[9px] sm:text-[11px] font-bold border border-[#EADBCC] shadow-xs">
                      24 Pieces Total
                    </div>
                    
                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-600 text-white font-mono text-[9px] sm:text-[11px] font-bold shadow-md">
                      ₹999 Total
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between text-white text-[10px] sm:text-[11px] font-mono">
                      <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                        <ZoomIn className="h-3 w-3" />
                        <span>Tap to zoom starter kit</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Copy & Action Buttons */}
                <div className="lg:col-span-7 space-y-3 sm:space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#EFE3D3] text-[#7A562D] font-mono text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold">
                    <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8C6436]" />
                    <span>Kria Tech Demo Starter Kit</span>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl sm:text-4xl lg:text-5xl font-light text-[#1E1B18] leading-tight">
                      Start Your Magnet Business for Just ₹999!
                    </h2>
                  </div>

                  <ul className="space-y-1 sm:space-y-2 text-[11px] sm:text-sm text-[#52463A] font-sans">
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Start a fridge magnet stall with minimal investment.</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Test our quality before ordering in bulk.</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>20 Acrylic Frames in different sizes & shapes.</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>4 FREE Bonus Keychains — <strong>24 Pieces Total</strong>.</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Perfect for beginners, stall owners & resellers.</span>
                    </li>
                  </ul>

                  <div className="space-y-1 py-0.5 sm:py-1">
                    <div className="flex items-baseline gap-2.5 sm:gap-3">
                      <span className="font-serif text-3xl sm:text-6xl font-bold text-[#1E1B18] tracking-tight">₹999</span>
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider">
                        Special Starter Kit Price
                      </span>
                    </div>
                  </div>

                  {/* Below Buttons: Button to inspect kit + CTA for WhatsApp order */}
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={handleOpenStarterKit}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-[#1E1B18] hover:bg-[#8C6436] text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] shadow-md transition-all cursor-pointer group"
                    >
                      <span>View Demo Starter Kit</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <a
                      href={waLink("Hi KRIA Tech! I would like to order the Kria Tech Demo Starter Kit (₹999 Special Starter Kit Price: 20 Acrylic Frames in different sizes & shapes + 4 FREE Bonus Keychains — 24 Pieces Total). Please confirm order placement and dispatch timeline.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] shadow-[0_6px_20px_rgba(37,211,102,0.3)] transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Order Your Starter Kit</span>
                    </a>
                  </div>

                </div>

              </div>
            </div>
          </section>

          {/* ─── DEDICATED KRIA SUBSCRIPTION SECTION (FROM POSTER) ─── */}
          <section id="subscription" className="py-5 sm:py-14 max-w-7xl mx-auto px-3 sm:px-8 space-y-4 sm:space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#FAF0E2] text-[#8C6436] font-mono text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold border border-[#EAD5BA] mb-1.5">
                <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#B8860B]" />
                <span>Exclusive Member Privileges</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-[#1E1B18] leading-tight">
                KRIA Subscription Plans
              </h2>
              <p className="font-serif italic text-sm sm:text-lg text-[#8C6436] mt-0.5">
                More Savings. Priority Service. Factory Direct Privileges.
              </p>
            </div>

            {/* Mobile Plan Switcher Toggle (Visible on Mobile / Tablet, hidden on Desktop lg) */}
            <div className="flex lg:hidden justify-center pt-1 pb-1">
              <div className="inline-flex p-1 rounded-full bg-[#EFE4D6] border border-[#DECFBE] shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('annual')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'annual'
                      ? 'bg-[#1E1B18] text-[#F9E79F] shadow-sm'
                      : 'text-[#6B5744] hover:text-[#1E1B18]'
                  }`}
                >
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  <span>Annual VIP (₹999)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('quarterly')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'quarterly'
                      ? 'bg-[#1E1B18] text-white shadow-sm'
                      : 'text-[#6B5744] hover:text-[#1E1B18]'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Quarterly (₹499)</span>
                </button>
              </div>
            </div>

            {/* Plan 1: Quarterly Subscription (₹499 · 3 Months) */}
            <div className={`${activeSubTab === 'quarterly' ? 'block' : 'hidden'} lg:block rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#FCFAF6] via-white to-[#F6EDE2] backdrop-blur-2xl border border-[#EADECE] p-4 sm:p-10 shadow-[0_15px_45px_rgba(180,140,80,0.08)]`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-10 items-center">
                
                {/* Left Description & Benefits */}
                <div className="lg:col-span-7 space-y-3 sm:space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#FAF0E2] text-[#8C6436] font-mono text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold border border-[#EAD5BA]">
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8C6436]" />
                    <span>Quarterly Plan · 3 Months</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-light text-[#1E1B18] leading-tight">
                      KRIA Subscription <span className="font-sans text-base sm:text-xl text-[#8C6436] font-normal">(Quarterly)</span>
                    </h3>
                    <p className="font-serif italic text-xs sm:text-lg text-[#8C6436] mt-0.5">
                      More Savings. Priority Service.
                    </p>
                  </div>

                  {/* Gold Badge: ONLY ₹499 · 3 MONTHS VALIDITY */}
                  <div className="inline-flex items-center gap-2.5 py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl bg-gradient-to-r from-[#FDEFD8] via-[#FFF9F0] to-[#F7E7CE] border border-[#DEB887] shadow-xs">
                    <span className="font-serif text-xl sm:text-3xl font-bold text-[#8C6436]">
                      ONLY ₹499
                    </span>
                    <span className="h-4 sm:h-5 w-px bg-[#DEB887]/60" />
                    <span className="font-mono text-[9px] sm:text-xs uppercase tracking-widest text-[#6B4E2B] font-bold">
                      3 MONTHS VALIDITY
                    </span>
                  </div>

                  {/* 3 Main Value Pillars from Poster - 3 columns on Mobile for minimal scrolling */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-1">
                    {/* Pillar 1 */}
                    <div className="p-2 sm:p-3 rounded-xl bg-white border border-[#EADBCC] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-1">
                      <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto sm:mx-0">
                        <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div>
                        <div className="font-serif text-sm sm:text-base font-bold text-[#1E1B18]">₹2 OFF</div>
                        <p className="text-[8px] sm:text-[10px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold leading-tight">
                          On Every Frame
                        </p>
                      </div>
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-2 sm:p-3 rounded-xl bg-white border border-[#EADBCC] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-1">
                      <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto sm:mx-0">
                        <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div>
                        <div className="font-serif text-sm sm:text-base font-bold text-[#1E1B18]">1 Day Dispatch</div>
                        <p className="text-[8px] sm:text-[10px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold leading-tight">
                          On Ready Frames
                        </p>
                      </div>
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-2 sm:p-3 rounded-xl bg-white border border-[#EADBCC] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-1">
                      <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mx-auto sm:mx-0">
                        <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div>
                        <div className="font-serif text-sm sm:text-base font-bold text-[#1E1B18]">Priority</div>
                        <p className="text-[8px] sm:text-[10px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold leading-tight">
                          Exclusive Support
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Join Now WhatsApp CTA */}
                  <div className="pt-1">
                    <a
                      href={waLink("Hi KRIA Tech! I would like to join the KRIA Subscription Quarterly plan (ONLY ₹499 for 3 MONTHS VALIDITY). Please share activation details for ₹2 OFF on every frame, 1-day dispatch, and priority customer service.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] shadow-[0_6px_20px_rgba(37,211,102,0.3)] transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Join Quarterly Plan (₹499)</span>
                    </a>
                  </div>
                </div>

                {/* Right Visual Poster Showcase */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_12px_30px_rgba(180,140,80,0.15)] border-2 border-[#E7D6C2] bg-white group hover:shadow-[0_20px_45px_rgba(180,140,80,0.2)] transition-all duration-300 aspect-square max-w-[340px] sm:max-w-none mx-auto w-full">
                    <img 
                      src="/images/kria_subscription_banner.jpg" 
                      alt="KRIA Subscription - Only ₹499, 3 Months Validity"
                      className="w-full h-full object-contain group-hover:scale-[1.01] transition-transform duration-500"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Plan 2: Annual VIP Subscription (₹999 · 12 Months) */}
            <div className={`${activeSubTab === 'annual' ? 'block' : 'hidden'} lg:block rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E4] to-[#F5E6CC] backdrop-blur-2xl border-2 border-[#D4AF37] p-4 sm:p-10 shadow-[0_20px_55px_rgba(212,175,55,0.18)] relative overflow-hidden`}>
              {/* Gold Ribbon Tag */}
              <div className="absolute top-3 right-3 sm:top-6 sm:right-6">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#1E1B18] text-[#F9E79F] font-mono text-[9px] sm:text-xs font-bold uppercase tracking-wider shadow-md border border-[#D4AF37]/50">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Best Value · Save ₹997</span>
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-10 items-center">
                
                {/* Visual Poster Showcase (Left on Desktop, Opposite to Plan 1) */}
                <div className="lg:col-span-5 order-2 lg:order-1">
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_12px_30px_rgba(180,140,80,0.2)] border-2 border-[#D4AF37] bg-white group hover:shadow-[0_20px_45px_rgba(180,140,80,0.25)] transition-all duration-300 aspect-square max-w-[340px] sm:max-w-none mx-auto w-full">
                    <img 
                      src="/images/kria_subscription_annual_999.jpg" 
                      alt="KRIA Subscription - Only ₹999, 12 Months Validity"
                      className="w-full h-full object-contain group-hover:scale-[1.01] transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Description & Benefits (Right on Desktop, Opposite to Plan 1) */}
                <div className="lg:col-span-7 order-1 lg:order-2 space-y-3 sm:space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#FAF0E2] text-[#8C6436] font-mono text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold border border-[#D4AF37]/50">
                    <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#B8860B]" />
                    <span>Annual VIP Privilege</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-light text-[#1E1B18] leading-tight">
                      KRIA Subscription <span className="font-sans text-base sm:text-xl text-[#B8860B] font-bold">(Annual VIP)</span>
                    </h3>
                    <p className="font-serif italic text-xs sm:text-lg text-[#8C6436] mt-0.5">
                      More Savings. Priority Service.
                    </p>
                  </div>

                  {/* Gold Badge: ONLY ₹999 · 12 MONTHS VALIDITY */}
                  <div className="inline-flex items-center gap-2.5 py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl bg-gradient-to-r from-[#FDEFD8] via-[#FFF6E5] to-[#F5E0BA] border border-[#D4AF37] shadow-sm">
                    <span className="font-serif text-xl sm:text-3xl font-bold text-[#8C6436]">
                      ONLY ₹999
                    </span>
                    <span className="h-4 sm:h-5 w-px bg-[#D4AF37]/60" />
                    <span className="font-mono text-[9px] sm:text-xs uppercase tracking-widest text-[#6B4E2B] font-bold">
                      12 MONTHS VALIDITY
                    </span>
                  </div>

                  {/* 3 Main Value Pillars from Annual Poster - 3 columns on Mobile */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-1">
                    {/* Pillar 1 */}
                    <div className="p-2 sm:p-3 rounded-xl bg-white/95 border border-[#E7D0A8] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-1">
                      <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto sm:mx-0">
                        <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div>
                        <div className="font-serif text-sm sm:text-base font-bold text-[#B8860B]">₹3 OFF</div>
                        <p className="text-[8px] sm:text-[10px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold leading-tight">
                          On Every Frame
                        </p>
                      </div>
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-2 sm:p-3 rounded-xl bg-white/95 border border-[#E7D0A8] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-1">
                      <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto sm:mx-0">
                        <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div>
                        <div className="font-serif text-sm sm:text-base font-bold text-[#1E1B18]">1 Day Dispatch</div>
                        <p className="text-[8px] sm:text-[10px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold leading-tight">
                          Ready Frames
                        </p>
                      </div>
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-2 sm:p-3 rounded-xl bg-white/95 border border-[#E7D0A8] shadow-xs text-center sm:text-left flex flex-col justify-between space-y-1">
                      <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-purple-100 border border-purple-300 text-purple-800 flex items-center justify-center mx-auto sm:mx-0">
                        <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#B8860B]" />
                      </div>
                      <div>
                        <div className="font-serif text-sm sm:text-base font-bold text-[#1E1B18]">Priority</div>
                        <p className="text-[8px] sm:text-[10px] font-mono uppercase tracking-wider text-[#7A6A5A] font-semibold leading-tight">
                          Exclusive Support
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Join Now WhatsApp CTA */}
                  <div className="pt-1">
                    <a
                      href={waLink("Hi KRIA Tech! I would like to join the KRIA Annual Subscription VIP plan (ONLY ₹999 for 12 MONTHS VALIDITY). Please share activation details for ₹3 OFF on every frame, 1-day dispatch on ready to stock frames, and priority VIP customer service.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:scale-[1.01] active:scale-[0.99] text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] shadow-[0_6px_22px_rgba(37,211,102,0.35)] transition-all cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Join Annual VIP Plan (₹999)</span>
                    </a>
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
                <div className="h-8 w-8 rounded-xl bg-white border border-[#761618]/40 flex items-center justify-center p-1 shadow-xs overflow-hidden">
                  <img src="/images/kria_logo_official.png" alt="KRIA Logo" className="h-full w-full object-contain" />
                </div>
                <span className="font-serif text-xl font-bold tracking-wider text-[#761618]">
                  KRIA TECH
                </span>
              </div>
              <p className="text-xs text-[#6E6152] leading-relaxed max-w-sm">
                Diamond-cut 2mm monolithic cast acrylic photo magnets. Crafted from 100% cell-cast acrylic with rare-earth neodymium magnetic cores. Factory-direct in Hyderabad.
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
                    Demo Starter Kit (₹999)
                  </a>
                </li>
                <li>
                  <a href="#subscription" onClick={() => handleCloseProduct('#subscription')} className="hover:text-[#8C6436] transition-colors">
                    Subscription
                  </a>
                </li>
                <li>
                  <a
                    href="#products"
                    onClick={() => handleCloseProduct('#products')}
                    className="hover:text-[#8C6436] transition-colors cursor-pointer text-left"
                  >
                    Store
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsAdminModalOpen(true)}
                    className="hover:text-[#8C6436] transition-colors cursor-pointer text-left flex items-center gap-1.5 text-stone-500 hover:text-stone-800"
                    title="Configure Wholesale Tier Rates (Ctrl+Shift+W)"
                  >
                    <Settings className="h-3.5 w-3.5 text-[#8C6436]" />
                    <span>Wholesale Admin</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Direct Contact */}
            <div className="md:col-span-4 space-y-2.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C6436] font-bold">
                WhatsApp Order Desk
              </p>
              <a
                href={waLink("Hi KRIA Tech! I am interested in ordering custom acrylic photo frames and keychains. Please share your product catalog and bulk pricing.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#25D366] hover:text-[#1EBE5D] transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+91 93925 76792</span>
              </a>
            </div>

          </div>

          <div className="mt-10 pt-5 border-t border-[#E8DACB] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-[#8F7E6E]">
            <p>© {new Date().getFullYear()} KRIA Tech. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span>2mm Cast Acrylic</span>
              <span>•</span>
              <span>Optical Glass Grade</span>
              <span>•</span>
              <span>Neodymium Grip</span>
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
            if (activeProduct && currentSize) {
              window.open(waLink(buildExactQuoteMessage(activeProduct.name, currentSize.label, currentSize.dimensions, actualQty, unitDiscountedPrice, unitOriginalPrice, totalPrice, factorySavings)), '_blank');
            } else if (cart.length > 0) {
              window.open(waLink(buildMultiCartWhatsAppMessage()), '_blank');
            } else {
              window.open(waLink("Hi KRIA Tech! I need assistance with your acrylic frames and keychains. Can you please help me?"), '_blank');
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
            {activeProduct ? 'WhatsApp Order' : cart.length > 0 ? `WhatsApp Order (${cart.length})` : 'WhatsApp Support'}
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

            {/* Wholesale Rule Banner (Section 5 Requirement) */}
            <div className="py-2.5 px-4 bg-gradient-to-r from-[#FAF1E3] via-amber-50 to-[#FAF1E3] border-b border-[#E8DACB] text-center">
              <p className="text-[11px] font-mono font-bold text-[#761618] uppercase tracking-wider">
                Mix Any Models. Combine Your Quantities. Unlock Better Wholesale Prices.
              </p>
            </div>

            {/* Dynamic Combined Cart Tier Progress Bar */}
            {cartPricingResult.totalCartQty > 0 && (
              <div className="p-4 bg-white border-b border-[#EADECE] space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-[#524434] font-semibold">Combined Eligible Qty:</span>
                    <strong className="text-[#1E1B18]">{cartPricingResult.totalEligibleQty} pcs</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {cartPricingResult.milestone.currentTierLabel}
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-[#EFE8DE] h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-[#8C6436] to-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cartPricingResult.milestone.progressPercentage}%` }}
                  />
                </div>

                {/* Milestone Details */}
                <div className="flex items-center justify-between text-[10px] text-[#7A6B5C]">
                  {cartPricingResult.milestone.nextTierMinQty ? (
                    <span>
                      Add <strong className="text-[#8C6436] font-bold">{cartPricingResult.milestone.piecesNeededForNextTier} more pcs</strong> to unlock <strong className="text-emerald-700">{cartPricingResult.milestone.nextTierLabel}</strong>!
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      🎉 Highest Wholesale Tier Unlocked (2,000+ pcs)!
                    </span>
                  )}
                  <span className="font-bold text-[#1E1B18]">{cartPricingResult.milestone.progressPercentage}%</span>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {cartPricingResult.items.length === 0 ? (
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
                cartPricingResult.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#EADBCC] shadow-xs flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-14 w-14 rounded-xl bg-[#FAF5EE] border border-[#EADBCC] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img
                          src={item.productImage || '/images/kria_logo_official.png'}
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
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8A7969]">
                          <span className="text-[#1E1B18] font-bold">
                            ₹{item.effectiveUnitPrice % 1 === 0 ? item.effectiveUnitPrice : item.effectiveUnitPrice.toFixed(2)}/pc
                          </span>
                          {item.originalUnitPrice > item.effectiveUnitPrice && (
                            <span className="line-through text-stone-400" title="Original Retail MRP">
                              ₹{item.originalUnitPrice}
                            </span>
                          )}
                          <span>× {item.quantity} pcs</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-serif text-sm font-bold text-[#1E1B18]">
                        ₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: item.lineTotal % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}
                      </span>
                      {item.lineSavings > 0 && (
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                          Save ₹{item.lineSavings.toLocaleString('en-IN')}
                        </span>
                      )}

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
            {cartPricingResult.items.length > 0 && (
              <div className="p-4 sm:p-5 bg-white border-t border-[#EADECE] space-y-3">
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between items-center text-[#6E6152]">
                    <span>Total Items:</span>
                    <strong className="text-[#1E1B18]">{cart.length} types · {cartPricingResult.totalCartQty} total pcs</strong>
                  </div>
                  <div className="flex justify-between items-center text-[#6E6152]">
                    <span>Current Wholesale Tier:</span>
                    <strong className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                      {cartPricingResult.milestone.currentTierLabel}
                    </strong>
                  </div>
                  {cartPricingResult.totalSavings > 0 && (
                    <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                      <span>Total Factory Savings:</span>
                      <strong className="font-bold">₹{cartPricingResult.totalSavings.toLocaleString('en-IN', { minimumFractionDigits: cartPricingResult.totalSavings % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}</strong>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-1 border-t border-[#EFE5D9]">
                    <span className="font-bold text-[#1E1B18]">Grand Total:</span>
                    <span className="font-serif text-2xl font-bold text-[#1E1B18]">
                      ₹{cartPricingResult.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: cartPricingResult.totalAmount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Submit All to WhatsApp — Unlocked when min quantity is 50 pcs */}
                {cartPricingResult.totalCartQty >= 50 ? (
                  <a
                    href={waLink(buildMultiCartWhatsAppMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.14em] shadow-[0_6px_22px_rgba(37,211,102,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-4.5 w-4.5" />
                    <span>Order All on WhatsApp ({cartPricingResult.totalCartQty} pcs)</span>
                  </a>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl bg-stone-200 text-stone-500 text-xs sm:text-sm font-bold uppercase tracking-[0.14em] cursor-not-allowed border border-stone-300"
                    >
                      <MessageCircle className="h-4.5 w-4.5 text-stone-400" />
                      <span>Order All on WhatsApp ({cartPricingResult.totalCartQty} pcs)</span>
                    </button>
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center text-xs font-mono text-amber-800">
                      ⚠️ Minimum wholesale order is <strong>50 pcs</strong>. Add <strong>{50 - cartPricingResult.totalCartQty} more pcs</strong> to unlock WhatsApp ordering.
                    </div>
                  </div>
                )}

                <p className="text-[10px] font-mono text-center text-[#8C7A68]">
                  🔒 Your entire multi-shape order summary will be sent to WhatsApp. Please confirm order placement and dispatch timeline!
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─── WHOLESALE PRICING ADMIN MANAGEMENT MODAL ───────────── */}
      <WholesalePricingAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        configs={pricingConfigs}
        onSaveConfig={handleSavePricingConfig}
      />

    </div>
  );
}
