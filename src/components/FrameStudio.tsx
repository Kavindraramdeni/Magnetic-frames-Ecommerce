import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  ArrowLeft, Camera, Check, Minus, Plus, RotateCcw, RotateCw, 
  ShoppingBag, Upload, Grid, CheckCircle2, AlertCircle, Sparkles, 
  Image as ImageIcon
} from 'lucide-react';
import { BASE_SHAPES, fetchLiveCatalogShapes } from '../data';
import { CartItem, MagnetShape, MagnetShapeId } from '../types';

interface FrameStudioProps {
  initialShapeId?: MagnetShapeId;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOpenCart: () => void;
  onBackToHome?: () => void;
  cartCount?: number;
}

// ── Shape Outline Vector Icons for the Shape Carousel (Matching Image 2) ─────
function ShapeOutlineIcon({ shapeId, className = 'w-6 h-6' }: { shapeId: string; className?: string }) {
  switch (shapeId) {
    case 'love':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'circle':
    case 'circle-bloom':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case 'polaroid':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2.5" width="16" height="19" rx="1.5" />
          <rect x="6.5" y="5" width="11" height="10" />
        </svg>
      );
    case 'arch':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 21.5V9.5a7 7 0 0 1 14 0v12H5z" />
        </svg>
      );
    case 'hexagon':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,2.5 20.5,7.5 20.5,16.5 12,21.5 3.5,16.5 3.5,7.5" />
        </svg>
      );
    case 'oval':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
          <ellipse cx="12" cy="12" rx="7.5" ry="10" />
        </svg>
      );
    case 'landscape':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
        </svg>
      );
    case 'cloud':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 19H9a5 5 0 0 1-.9-9.92 6 6 0 0 1 11.8 0A4 4 0 0 1 17.5 19z" />
        </svg>
      );
    case 'scalloped-stand':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.5 1.5">
          <rect x="4" y="3" width="16" height="18" rx="4" />
        </svg>
      );
    case 'grande':
    case 'portrait':
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2.5" width="14" height="19" rx="2" />
        </svg>
      );
  }
}

// ── Shape Frame Styling Definition (NO EXTRA WHITE BOUNDARIES) ───────────────
function getShapeFrameConfig(shapeId: string) {
  switch (shapeId) {
    case 'love':
      return {
        wrapperStyle: { 
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.22)) drop-shadow(0 6px 12px rgba(0,0,0,0.12))' 
        },
        // Edge-to-edge bleed into heart clip, no extra white border/padding
        frameClass: 'shape-heart aspect-square w-full max-w-[270px] sm:max-w-[330px] relative overflow-hidden',
        innerClass: 'shape-heart w-full h-full relative overflow-hidden',
        isHeart: true,
        isHexagon: false,
        isPolaroid: false
      };
    case 'arch':
      return {
        wrapperStyle: { 
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.20)) drop-shadow(0 6px 12px rgba(0,0,0,0.10))' 
        },
        frameClass: 'rounded-t-[160px] rounded-b-[18px] aspect-[3/4] w-full max-w-[260px] sm:max-w-[320px] relative overflow-hidden ring-1 ring-black/5',
        innerClass: 'rounded-t-[160px] rounded-b-[18px] w-full h-full relative overflow-hidden',
        isHeart: false,
        isHexagon: false,
        isPolaroid: false
      };
    case 'circle':
    case 'circle-bloom':
      return {
        wrapperStyle: { 
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.20)) drop-shadow(0 6px 12px rgba(0,0,0,0.10))' 
        },
        frameClass: 'rounded-full aspect-square w-full max-w-[260px] sm:max-w-[320px] relative overflow-hidden ring-1 ring-black/5',
        innerClass: 'rounded-full w-full h-full relative overflow-hidden',
        isHeart: false,
        isHexagon: false,
        isPolaroid: false
      };
    case 'hexagon':
      return {
        wrapperStyle: { 
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.22)) drop-shadow(0 6px 12px rgba(0,0,0,0.12))' 
        },
        frameClass: 'shape-hexagon aspect-[1.15/1] w-full max-w-[280px] sm:max-w-[340px] relative overflow-hidden',
        innerClass: 'shape-hexagon w-full h-full relative overflow-hidden',
        isHeart: false,
        isHexagon: true,
        isPolaroid: false
      };
    case 'oval':
      return {
        wrapperStyle: { 
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.20)) drop-shadow(0 6px 12px rgba(0,0,0,0.10))' 
        },
        frameClass: 'rounded-[50%] aspect-[2/3] w-full max-w-[250px] sm:max-w-[310px] relative overflow-hidden ring-1 ring-black/5',
        innerClass: 'rounded-[50%] w-full h-full relative overflow-hidden',
        isHeart: false,
        isHexagon: false,
        isPolaroid: false
      };
    case 'polaroid':
      return {
        wrapperStyle: { 
          filter: 'drop-shadow(0 16px 26px rgba(0,0,0,0.16))' 
        },
        // Polaroid preserves its classic white photo card bottom border
        frameClass: 'rounded-xs aspect-[3.5/4.5] w-full max-w-[260px] sm:max-w-[320px] bg-white pt-3 px-3 pb-12 shadow-2xl border border-neutral-200/90 ring-1 ring-black/5 relative',
        innerClass: 'w-full h-full relative overflow-hidden bg-neutral-100',
        isHeart: false,
        isHexagon: false,
        isPolaroid: true
      };
    case 'landscape':
      return {
        wrapperStyle: { 
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.20))' 
        },
        frameClass: 'rounded-2xl aspect-[1.33/1] w-full max-w-[310px] sm:max-w-[370px] relative overflow-hidden ring-1 ring-black/5',
        innerClass: 'rounded-2xl w-full h-full relative overflow-hidden',
        isHeart: false,
        isHexagon: false,
        isPolaroid: false
      };
    case 'cloud':
      return {
        wrapperStyle: { 
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.20))' 
        },
        frameClass: 'rounded-t-[44px] rounded-b-[30px] aspect-[1.35/1] w-full max-w-[300px] sm:max-w-[360px] relative overflow-hidden ring-1 ring-black/5',
        innerClass: 'rounded-t-[44px] rounded-b-[30px] w-full h-full relative overflow-hidden',
        isHeart: false,
        isHexagon: false,
        isPolaroid: false
      };
    case 'scalloped-stand':
      return {
        wrapperStyle: { 
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.20))' 
        },
        frameClass: 'rounded-3xl aspect-[3/4] w-full max-w-[260px] sm:max-w-[320px] relative overflow-hidden ring-1 ring-black/5',
        innerClass: 'rounded-2xl w-full h-full relative overflow-hidden',
        isHeart: false,
        isHexagon: false,
        isPolaroid: false
      };
    case 'grande':
    case 'portrait':
    default:
      return {
        wrapperStyle: { 
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.20)) drop-shadow(0 6px 12px rgba(0,0,0,0.10))' 
        },
        frameClass: 'rounded-2xl aspect-[2/3] w-full max-w-[260px] sm:max-w-[320px] relative overflow-hidden ring-1 ring-black/5',
        innerClass: 'rounded-2xl w-full h-full relative overflow-hidden',
        isHeart: false,
        isHexagon: false,
        isPolaroid: false
      };
  }
}

export default function FrameStudio({
  initialShapeId = 'arch',
  cart,
  setCart,
  onOpenCart,
  onBackToHome,
  cartCount = 0
}: FrameStudioProps) {
  // Shape & Catalog State: Strictly the 4 customizable frame products
  const [shapes, setShapes] = useState<MagnetShape[]>(() => 
    BASE_SHAPES.filter(s => ['love', 'circle', 'polaroid', 'grande'].includes(s.id))
  );
  const [selectedShapeId, setSelectedShapeId] = useState<MagnetShapeId>(() => 
    ['love', 'circle', 'polaroid', 'grande'].includes(initialShapeId as any) ? (initialShapeId as MagnetShapeId) : 'love'
  );
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Photo & Transform State
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('Your photo');
  const [photoScale, setPhotoScale] = useState<number>(1);
  const [photoPanX, setPhotoPanX] = useState<number>(0);
  const [photoPanY, setPhotoPanY] = useState<number>(0);
  const [photoRotation, setPhotoRotation] = useState<number>(0);
  const [imageResolution, setImageResolution] = useState<{ width: number; height: number } | null>(null);

  // 2 Crop Options (Requested: Auto-Crop vs Full Photo No Cutoff)
  const [cropMode, setCropMode] = useState<'fill' | 'fit'>('fill');

  // Editing UI State
  const [showCropGuides, setShowCropGuides] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [caption, setCaption] = useState<string>('Our favorite memory');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);

  // Drag-to-position Panning State
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pinchStart, setPinchStart] = useState<number | null>(null);

  // DOM Refs
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const shapeScrollRef = useRef<HTMLDivElement>(null);

  // Load live shapes from database (filter to 4 customizable shapes)
  useEffect(() => {
    fetchLiveCatalogShapes().then((live) => {
      if (live?.length) {
        setShapes(live.filter(s => ['love', 'circle', 'polaroid', 'grande'].includes(s.id)));
      }
    });
  }, []);

  useEffect(() => {
    if (initialShapeId && ['love', 'circle', 'polaroid', 'grande'].includes(initialShapeId)) {
      setSelectedShapeId(initialShapeId);
    }
  }, [initialShapeId]);

  // Mouse wheel zoom on preview canvas
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setPhotoScale((prev) => 
        Math.min(3.0, Math.max(0.6, parseFloat((prev + (e.deltaY < 0 ? 0.08 : -0.08)).toFixed(2))))
      );
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const activeShape = useMemo(() => {
    return shapes.find((s) => s.id === selectedShapeId) || shapes[0] || BASE_SHAPES[0];
  }, [shapes, selectedShapeId]);

  const activeSizeOption = useMemo(() => {
    if (activeShape.sizes && activeShape.sizes.length > 0) {
      const match = activeShape.sizes.find(s => s.size === selectedSize);
      return match || activeShape.sizes[0];
    }
    return { size: activeShape.dimensions, label: activeShape.dimensions, price: activeShape.price, originalPrice: (activeShape.originalPrice || activeShape.price + 100) };
  }, [activeShape, selectedSize]);

  const currentPrice = activeSizeOption.price;
  const lineTotal = currentPrice * quantity;
  const frameConfig = useMemo(() => getShapeFrameConfig(selectedShapeId), [selectedShapeId]);

  // Honest Print Quality Calculation
  const printQuality = useMemo(() => {
    if (!imageResolution || !photoUrl) {
      return { status: 'none', label: 'Awaiting photo', badgeColor: 'bg-neutral-100 text-neutral-500 border-neutral-200' };
    }
    const minDim = Math.min(imageResolution.width, imageResolution.height);
    if (minDim >= 1200) {
      return { 
        status: 'high', 
        label: 'Print-ready', 
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        detail: `${imageResolution.width} × ${imageResolution.height}px · 300 DPI Ultra Sharp`
      };
    } else if (minDim >= 600) {
      return { 
        status: 'medium', 
        label: 'Good quality', 
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
        detail: `${imageResolution.width} × ${imageResolution.height}px · Crisp for 4×6" print`
      };
    } else {
      return { 
        status: 'low', 
        label: 'Low resolution', 
        badgeColor: 'bg-rose-50 text-rose-800 border-rose-300',
        detail: `${imageResolution.width} × ${imageResolution.height}px · May appear soft in print`
      };
    }
  }, [imageResolution, photoUrl]);

  // Handle Image Upload with Safe Headroom (prevents cutting off faces by default)
  const onFiles = (files: FileList | null) => {
    const file = files && Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = String(e.target?.result || '');
      const img = new Image();
      img.onload = () => {
        setImageResolution({ width: img.naturalWidth, height: img.naturalHeight });
        setPhotoUrl(url);
        setOriginalPhotoUrl(url);
        setPhotoName(file.name.slice(0, 32));
        setPhotoScale(1);
        setPhotoPanX(0);
        // If image is portrait or shape is heart/arch, default panY downwards slightly (+18px) to preserve headroom/faces
        const isPortrait = img.naturalHeight > img.naturalWidth;
        setPhotoPanY(isPortrait || selectedShapeId === 'love' || selectedShapeId === 'arch' ? 18 : 0);
        setPhotoRotation(0);
        setIsUploading(false);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // Drag-to-position Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!photoUrl) return;
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - photoPanX, y: e.clientY - photoPanY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPhotoPanX(Math.min(240, Math.max(-240, Math.round(e.clientX - panStart.x))));
    setPhotoPanY(Math.min(240, Math.max(-240, Math.round(e.clientY - panStart.y))));
  };

  // Touch handlers for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!photoUrl) return;
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - photoPanX, y: e.touches[0].clientY - photoPanY });
      setPinchStart(null);
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      setPinchStart(Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      if (e.cancelable) e.preventDefault();
      setPhotoPanX(Math.min(240, Math.max(-240, Math.round(e.touches[0].clientX - panStart.x))));
      setPhotoPanY(Math.min(240, Math.max(-240, Math.round(e.touches[0].clientY - panStart.y))));
    } else if (e.touches.length === 2 && pinchStart) {
      if (e.cancelable) e.preventDefault();
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setPhotoScale((prev) => 
        Math.min(3.0, Math.max(0.6, parseFloat((prev + (dist - pinchStart) * 0.006).toFixed(2))))
      );
      setPinchStart(dist);
    }
  };

  // Rotate 90° Clockwise
  const handleRotate = () => {
    setPhotoRotation((prev) => (prev + 90) % 360);
  };

  // Reset all edits
  const handleResetEdits = () => {
    setPhotoScale(1);
    setPhotoPanX(0);
    setPhotoPanY(selectedShapeId === 'love' || selectedShapeId === 'arch' ? 18 : 0);
    setPhotoRotation(0);
    setCropMode('fill');
  };

  // Add to Bag with exact cropSpec for print output fidelity
  const addToBag = () => {
    if (!photoUrl) {
      fileRef.current?.click();
      return;
    }

    const item: CartItem = {
      id: `cart-${Date.now()}`,
      shapeId: activeShape.id,
      shapeName: `${activeShape.name} (${activeSizeOption.size})`,
      quantity,
      previewUrl: photoUrl,
      originalUrl: originalPhotoUrl || photoUrl,
      photoName,
      captionText: activeShape.id === 'polaroid' ? caption : '',
      photoScale,
      photoPanX,
      photoPanY,
      cropMode,
      cropSpec: {
        version: 'v1',
        scale: photoScale,
        panX: photoPanX,
        panY: photoPanY,
        aspectRatio: 1,
        shapeId: activeShape.id,
        cropMode
      },
      price: currentPrice,
      selectedSize: activeSizeOption.size,
    };

    setCart((prev) => [...prev, item]);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onOpenCart();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 flex flex-col font-sans selection:bg-[#E8DCCF]">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />

      {/* ── DESIGN STUDIO HEADER (MATCHING REFERENCE IMAGE 2) ────────────────── */}
      <header className="bg-[#FAF8F5] border-b border-neutral-200/70 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {onBackToHome && (
            <button 
              onClick={onBackToHome}
              className="p-1 text-neutral-600 hover:text-black transition cursor-pointer flex items-center gap-1.5 text-xs"
              title="Return to Storefront"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-normal text-lg sm:text-xl tracking-wide text-neutral-950">
              KRIA
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase font-sans text-neutral-500 font-medium">
              STUDIO
            </span>
          </div>
        </div>

        {/* Cart Bag Icon with Live Badge (Matching Top Right of Image 2) */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative p-2.5 rounded-full bg-[#1C1917] hover:bg-black text-white transition shadow-sm cursor-pointer"
          title="Open Cart"
        >
          <ShoppingBag className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D97706] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#FAF8F5]">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* ── 1 · SHAPE HORIZONTAL CAROUSEL (MATCHING EXACT CARDS IN IMAGE 2) ─── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-2">
        <div className="text-[11px] font-sans uppercase font-medium tracking-[0.2em] text-neutral-500 mb-2.5">
          1 · SHAPE
        </div>

        {/* Horizontal Carousel of Shape Cards */}
        <div 
          ref={shapeScrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
        >
          {shapes.map((shape) => {
            const isSelected = shape.id === selectedShapeId;
            return (
              <button
                key={shape.id}
                type="button"
                onClick={() => setSelectedShapeId(shape.id)}
                className={`snap-start shrink-0 w-[78px] sm:w-[88px] p-2.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between cursor-pointer ${
                  isSelected 
                    ? 'bg-white border-[#A38A6E] ring-2 ring-[#A38A6E]/30 shadow-xs' 
                    : 'bg-white/60 border-neutral-200/90 hover:border-neutral-400 hover:bg-white'
                }`}
              >
                {/* Vector Shape Silhouette Outline Icon */}
                <div className={`w-8 h-8 flex items-center justify-center mb-1 ${isSelected ? 'text-[#8C6D4F]' : 'text-neutral-500'}`}>
                  <ShapeOutlineIcon shapeId={shape.id} className="w-6 h-6" />
                </div>

                {/* Shape Name */}
                <div className={`text-xs font-serif leading-tight truncate w-full ${isSelected ? 'font-bold text-neutral-950' : 'font-normal text-neutral-800'}`}>
                  {shape.name.replace('Classic ', '').replace('Sculpted ', '').replace('Minimal ', '').replace('Modern ', '')}
                </div>

                {/* Dimensions */}
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {shape.dimensions}
                </div>

                {/* Price */}
                <div className="text-[11px] font-semibold text-neutral-800 mt-0.5">
                  ₹{shape.price}
                </div>
              </button>
            );
          })}
        </div>

        {/* Subtle Scroll Track Bar Indicator */}
        <div className="w-24 h-1 bg-neutral-200/80 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-neutral-400 rounded-full w-1/3" />
        </div>
      </section>

      {/* ── ACTIVE SHAPE TITLE & SIZE SELECTOR PILLS ───────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-3 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-950 leading-tight">
              {activeShape.name}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5 font-light">
              Personalize your luxury magnetic acrylic frame · {activeSizeOption.size}
            </p>
          </div>

          {/* Size Selector Pills */}
          {activeShape.sizes && activeShape.sizes.length > 0 && (
            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-neutral-200 self-start sm:self-auto">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold px-2">Size:</span>
              {activeShape.sizes.map((opt) => {
                const isSizeActive = (activeSizeOption.size === opt.size);
                return (
                  <button
                    key={opt.size}
                    type="button"
                    onClick={() => setSelectedSize(opt.size)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer ${
                      isSizeActive
                        ? 'bg-neutral-900 text-white shadow-xs font-bold'
                        : 'bg-transparent text-neutral-700 hover:bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── MAIN STUDIO CONTENT: CANVAS PREVIEW & PHOTO CONTROLS ─────────────── */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-2 flex-1 pb-24 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ════ LEFT / CENTER PREVIEW CANVAS (WARM CONTAINER AS IN IMAGE 2) ═══ */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full bg-[#EBE7DF] rounded-3xl p-6 sm:p-10 shadow-inner flex flex-col items-center justify-center min-h-[360px] sm:min-h-[440px] relative overflow-hidden">
              
              {/* Optional Grid Guides Toggle Button in top corner */}
              {photoUrl && (
                <div className="absolute top-4 right-4 z-20">
                  <button
                    type="button"
                    onClick={() => setShowCropGuides(!showCropGuides)}
                    className={`p-1.5 rounded-xl border text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                      showCropGuides 
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs' 
                        : 'bg-white/80 backdrop-blur-xs text-neutral-600 border-neutral-200 hover:bg-white'
                    }`}
                    title="Toggle Rule-of-Thirds Crop Guides"
                  >
                    <Grid className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-mono hidden sm:inline">Guides</span>
                  </button>
                </div>
              )}

              {/* Interactive Frame Canvas */}
              <div 
                className="w-full flex items-center justify-center py-4 select-none"
                onClick={() => { if (!photoUrl) fileRef.current?.click(); }}
              >
                <div
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={() => setIsPanning(false)}
                  onMouseLeave={() => setIsPanning(false)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => { setIsPanning(false); setPinchStart(null); }}
                  style={frameConfig.wrapperStyle}
                  className={`relative touch-none select-none ${
                    photoUrl ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                  }`}
                >
                  {/* Luxury Acrylic Frame (NO ARTIFICIAL THICK WHITE BORDER) */}
                  <div className={`relative transition-all duration-300 ${frameConfig.frameClass}`}>
                    
                    {/* Inner Content Area */}
                    <div className={`${frameConfig.innerClass} ${frameConfig.isPolaroid ? '' : 'bg-[#E3DDCF]'}`}>
                      
                      {!photoUrl ? (
                        /* Empty Upload State (Matching Image 2 Reference) */
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#C4C8A8]/60 to-[#B48C68]/60 hover:opacity-95 transition-opacity group">
                          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/40 backdrop-blur-xs flex items-center justify-center text-neutral-900 mb-3 group-hover:scale-105 transition-transform">
                            <Camera className="h-6 w-6 stroke-[1.5]" />
                          </div>
                          <h4 className="font-serif text-xl sm:text-2xl text-neutral-950 font-normal">
                            Choose your photo
                          </h4>
                          <span className="mt-4 px-6 py-2.5 rounded-full bg-[#262320] text-white text-xs font-sans font-medium shadow-md group-hover:bg-black transition-colors">
                            {isUploading ? 'Opening…' : 'Select photo'}
                          </span>
                        </div>
                      ) : (
                        /* Photo Loaded with 2 Options: Fill (Cover) vs Fit (Contain) */
                        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                          
                          {/* If 'fit' mode: Soft luxury blurred backdrop to eliminate harsh empty bars */}
                          {cropMode === 'fit' && (
                            <div 
                              className="absolute inset-0 bg-cover bg-center opacity-25 blur-lg scale-110 pointer-events-none"
                              style={{ backgroundImage: `url(${photoUrl})` }}
                            />
                          )}

                          <img
                            src={photoUrl}
                            alt="Custom frame preview"
                            className={`w-full h-full ${
                              cropMode === 'fit' ? 'object-contain' : 'object-cover'
                            } origin-center transition-transform duration-75 select-none pointer-events-none`}
                            style={{ 
                              transform: `rotate(${photoRotation}deg) scale(${photoScale}) translate(${photoPanX}px, ${photoPanY}px)` 
                            }}
                          />

                          {/* Rule-of-Thirds Crop Alignment Guides */}
                          {showCropGuides && (
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/40">
                              <div className="border-r border-b border-white/30" />
                              <div className="border-r border-b border-white/30" />
                              <div className="border-b border-white/30" />
                              <div className="border-r border-b border-white/30" />
                              <div className="border-r border-b border-white/30" />
                              <div className="border-b border-white/30" />
                              <div className="border-r border-b border-white/30" />
                              <div className="border-r border-b border-white/30" />
                              <div />
                            </div>
                          )}

                          {/* Subtle Acrylic Glass Specular Highlight (Authentic floating shine) */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 opacity-60 pointer-events-none mix-blend-overlay" />
                        </div>
                      )}

                    </div>

                    {/* Polaroid Bottom Caption Area */}
                    {frameConfig.isPolaroid && (
                      <div className="absolute bottom-3 inset-x-0 text-center font-serif italic text-sm text-neutral-800 truncate px-4">
                        {caption}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reposition instruction hint (Matching Image 1 & 2) */}
              <p className="text-xs text-neutral-600 text-center mt-2 font-light">
                {photoUrl ? 'Drag photo to reposition inside frame' : 'Tap frame to upload your photo'}
              </p>
            </div>
          </div>

          {/* ════ RIGHT: 2 · YOUR PHOTO CARD (MATCHING EXACT CONTROLS IN IMAGE 2) ═ */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-5">
              
              {/* Card Section Header: 2 · YOUR PHOTO */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <span className="text-[11px] font-sans uppercase font-medium tracking-[0.2em] text-neutral-500">
                  2 · YOUR PHOTO
                </span>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-xs font-medium text-neutral-700 hover:text-black underline cursor-pointer"
                  >
                    Replace photo
                  </button>
                )}
              </div>

              {/* Top Row: Print-ready Badge or Upload Trigger */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    photoUrl ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{printQuality.label}</span>
                  </span>
                  {printQuality.status === 'high' && (
                    <span className="text-[10px] text-neutral-400 hidden sm:inline">300 DPI</span>
                  )}
                </div>

                {!photoUrl && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-xs font-medium text-neutral-700 hover:text-black underline cursor-pointer"
                  >
                    Select photo
                  </button>
                )}
              </div>

              {/* ── 2 OPTIONS: AUTO-CROP (FILL) VS FULL PHOTO (NO CUTOFF) ────────── */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-sans text-neutral-500 font-medium">
                  Framing Option:
                </div>
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setCropMode('fill');
                      setPhotoScale(1);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      cropMode === 'fill'
                        ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <span>⛶</span>
                    <span>Fill (Auto-Crop)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCropMode('fit');
                      setPhotoScale(1);
                      setPhotoPanX(0);
                      setPhotoPanY(0);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      cropMode === 'fit'
                        ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <span>⊡</span>
                    <span>Full Photo (No Cutoff)</span>
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 pl-1">
                  {cropMode === 'fill' 
                    ? 'Fills entire shape edge-to-edge. Drag to adjust position.' 
                    : '100% of your photo is visible without cutting faces or edges.'}
                </p>
              </div>

              {/* ── ACTION PILL BUTTONS (MATCHING IMAGE 2 EXACTLY) ───────────── */}
              <div className="grid grid-cols-3 gap-2">
                {/* Adjust Crop (Toggles Grid Guides) */}
                <button
                  type="button"
                  onClick={() => setShowCropGuides(!showCropGuides)}
                  className={`py-2.5 px-2 rounded-full border text-xs font-medium transition-all text-center cursor-pointer ${
                    showCropGuides 
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs' 
                      : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  Adjust crop
                </button>

                {/* Rotate 90° */}
                <button
                  type="button"
                  disabled={!photoUrl}
                  onClick={handleRotate}
                  className="py-2.5 px-2 rounded-full border border-neutral-300 bg-white hover:border-neutral-500 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-all text-center disabled:opacity-40 cursor-pointer"
                >
                  Rotate
                </button>

                {/* Reset Edits */}
                <button
                  type="button"
                  disabled={!photoUrl}
                  onClick={handleResetEdits}
                  className="py-2.5 px-2 rounded-full border border-neutral-300 bg-white hover:border-neutral-500 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-all text-center disabled:opacity-40 cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* ── ZOOM SLIDER (MATCHING IMAGE 2 EXACTLY) ───────────────────── */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-medium text-neutral-700 w-12">
                  Zoom
                </span>
                <input
                  type="range"
                  min={0.6}
                  max={2.5}
                  step={0.05}
                  value={photoScale}
                  disabled={!photoUrl}
                  onChange={(e) => setPhotoScale(Number(e.target.value))}
                  className="flex-1 accent-[#262320] cursor-pointer disabled:opacity-40 h-1.5 bg-neutral-200 rounded-lg appearance-none"
                />
              </div>

              {/* Polaroid Caption Input if Polaroid selected */}
              {selectedShapeId === 'polaroid' && (
                <div className="pt-2">
                  <label className="text-[11px] font-sans text-neutral-500 block mb-1">
                    Polaroid Bottom Caption:
                  </label>
                  <input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={32}
                    placeholder="Enter short memory caption..."
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-serif italic bg-white outline-none focus:border-neutral-900 text-center"
                  />
                </div>
              )}

              {/* Horizontal Divider Line */}
              <hr className="border-neutral-200/70 my-2" />

              {/* ── PURCHASE CONTROLS: QUANTITY & ADD TO BAG (MATCHING IMAGE 2) ── */}
              <div className="flex items-center gap-3 pt-1">
                {/* Quantity Pill Stepper */}
                <div className="flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1.5 shadow-2xs">
                  <button 
                    type="button" 
                    className="p-1 hover:bg-neutral-100 rounded-full transition text-neutral-700 cursor-pointer" 
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-neutral-900">
                    {quantity}
                  </span>
                  <button 
                    type="button" 
                    className="p-1 hover:bg-neutral-100 rounded-full transition text-neutral-700 cursor-pointer" 
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Prominent Dark Button: Add to bag · ₹{price} */}
                <button
                  type="button"
                  onClick={addToBag}
                  className="flex-1 py-3 px-6 rounded-full bg-[#1C1917] hover:bg-black text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Added to bag ✓</span>
                    </>
                  ) : (
                    <>
                      <span>Add to bag · ₹{lineTotal}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ── MOBILE STICKY PURCHASE BAR (STICKY SO CUSTOMERS NEVER HAVE TO SCROLL TO BUY) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 px-4 py-2.5 flex items-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        {/* Quantity Stepper */}
        <div className="flex items-center rounded-full border border-neutral-300 bg-neutral-50 px-2.5 py-1">
          <button 
            type="button" 
            className="p-1 hover:bg-neutral-200 rounded-full transition text-neutral-700 cursor-pointer" 
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center font-bold text-xs text-neutral-900">
            {quantity}
          </span>
          <button 
            type="button" 
            className="p-1 hover:bg-neutral-200 rounded-full transition text-neutral-700 cursor-pointer" 
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Add to Bag CTA Button */}
        <button
          type="button"
          onClick={addToBag}
          className="flex-1 py-3 px-5 rounded-full bg-[#1C1917] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
        >
          {added ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Added to bag ✓</span>
            </>
          ) : (
            <>
              <span>Add to bag · ₹{lineTotal}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
