import React, { useState, useRef, useEffect } from 'react';
import { BASE_SHAPES, PRESET_PHOTOS } from '../data';
import { MagnetShapeId } from '../types';
import { 
  ArrowLeft, Upload, ChevronLeft, ChevronRight, Sparkles, Check, 
  RotateCcw, Plus, ShoppingBag
} from 'lucide-react';

interface StyleCarouselProps {
  onBackToHome: () => void;
  onSelectAndCustomize: (shapeId: MagnetShapeId, photoUrl: string, photoName: string, scale: number, panX: number, panY: number) => void;
  onAddDirectlyToTrayAndCheckout: (shapeId: MagnetShapeId, photoUrl: string, photoName: string, scale: number, panX: number, panY: number) => void;
  onOpenCart?: () => void;
  cartItemCount?: number;
  initialShapeId?: MagnetShapeId;
}

export default function StyleCarousel({ onBackToHome, onSelectAndCustomize, onAddDirectlyToTrayAndCheckout, onOpenCart, cartItemCount = 0, initialShapeId }: StyleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (initialShapeId) {
      const idx = BASE_SHAPES.findIndex(s => s.id === initialShapeId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  // Photo transform states (Shared with Customizer)
  const [photoScale, setPhotoScale] = useState<number>(1.0);
  const [photoPanX, setPhotoPanX] = useState<number>(0);
  const [photoPanY, setPhotoPanY] = useState<number>(0);

  const [photoPool, setPhotoPool] = useState<{ id: string; url: string; name: string }[]>(() =>
    PRESET_PHOTOS.map((p, i) => ({ id: `preset-${i}`, url: p.url, name: p.name }))
  );
  const [photoUrl, setPhotoUrl] = useState<string>(PRESET_PHOTOS[0].url);
  const [photoName, setPhotoName] = useState<string>('Sunny Sunset Preset');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize index when initialShapeId changes (e.g. from Home Shape Showcase)
  React.useEffect(() => {
    if (initialShapeId) {
      const idx = BASE_SHAPES.findIndex(s => s.id === initialShapeId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [initialShapeId]);

  // Non-passive wheel event listener on container to prevent browser page zoom on laptops/trackpads
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomStep = 0.05;
      setPhotoScale((prev) =>
        Math.min(2.5, Math.max(0.1, parseFloat((prev + (e.deltaY < 0 ? zoomStep : -zoomStep)).toFixed(2))))
      );
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => container.removeEventListener('wheel', handleWheelNative);
  }, []);

  const handleResetFitAndZoom = () => {
    setPhotoScale(1.0);
    setPhotoPanX(0);
    setPhotoPanY(0);
  };

  // Interaction states
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

  const activeShape = BASE_SHAPES[currentIndex];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ 
      x: e.clientX - photoPanX, 
      y: e.clientY - photoPanY 
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const deltaX = e.clientX - panStart.x;
    const deltaY = e.clientY - panStart.y;
    setPhotoPanX(Math.min(150, Math.max(-150, Math.round(deltaX))));
    setPhotoPanY(Math.min(150, Math.max(-150, Math.round(deltaY))));
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ 
        x: e.touches[0].clientX - photoPanX, 
        y: e.touches[0].clientY - photoPanY 
      });
      setLastTouchDistance(null);
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isPanning) {
      if (e.cancelable) e.preventDefault();
      const deltaX = e.touches[0].clientX - panStart.x;
      const deltaY = e.touches[0].clientY - panStart.y;
      setPhotoPanX(Math.min(150, Math.max(-150, Math.round(deltaX))));
      setPhotoPanY(Math.min(150, Math.max(-150, Math.round(deltaY))));
    } else if (e.touches.length === 2 && lastTouchDistance !== null) {
      if (e.cancelable) e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = distance - lastTouchDistance;
      const zoomStep = delta * 0.005;
      const newScale = photoScale + zoomStep;
      setPhotoScale(Math.min(2.5, Math.max(0.1, parseFloat(newScale.toFixed(2)))));
      setLastTouchDistance(distance);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const zoomStep = 0.05;
    const newScale = photoScale + (e.deltaY < 0 ? zoomStep : -zoomStep);
    setPhotoScale(Math.min(2.5, Math.max(0.1, parseFloat(newScale.toFixed(2)))));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % BASE_SHAPES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + BASE_SHAPES.length) % BASE_SHAPES.length);
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi Kria Studio 🧲,

I am looking at the beautiful "${activeShape.name}" Acrylic Photo Magnet style on your catalog and would love to order it!

- Style Name: ${activeShape.name}
- Dimensions: ${activeShape.dimensions}
- Price: ₹${activeShape.price}
- Acrylic: 4mm Premium Glass-like gloss
- Backing: Neodymium magnetic disk

Please guide me on how to send my photos to customize this design. Thank you!`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919392576792?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new window.Image();
        img.onload = () => {
          const newPhoto = {
            id: `upload-${Date.now()}`,
            url: reader.result as string,
            name: file.name
          };
          setPhotoPool((prev) => [newPhoto, ...prev]);
          setPhotoUrl(newPhoto.url);
          setPhotoName(newPhoto.name);
          
          // Auto-fill zoom: Calculate scale to cover the square container
          const aspectRatio = img.width / img.height;
          const fillScale = aspectRatio > 1 ? aspectRatio : (1 / aspectRatio);
          setPhotoScale(parseFloat(fillScale.toFixed(2)));
          setPhotoPanX(0);
          
          if (img.height > img.width) {
            setPhotoPanY(10);
          } else {
            setPhotoPanY(0);
          }
        };
        img.src = reader.result;
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const selectPreset = (url: string, name: string) => {
    setPhotoUrl(url);
    setPhotoName(name);
    setPhotoScale(1.0);
    setPhotoPanX(0);
    setPhotoPanY(0);
  };

  // Helper to resolve specific shape sizing container in the carousel
  const getShapeContainerClass = (shapeId: MagnetShapeId) => {
    switch (shapeId) {
      case 'arch':
        return 'shape-arch aspect-[3/4] max-h-[560px] w-auto max-w-[420px] md:scale-110';
      case 'cloud':
        return 'shape-cloud aspect-[1.4/1] max-h-[480px] w-auto max-w-[540px] md:scale-115';
      case 'circle':
        return 'rounded-full aspect-square max-h-[480px] w-auto max-w-[480px] md:scale-115';
      case 'circle-bloom':
        return 'shape-circle-cloud aspect-square max-h-[480px] w-auto max-w-[480px] md:scale-115';
      case 'landscape':
        return 'rounded-2xl aspect-[1.4/1] max-h-[480px] w-auto max-w-[540px] md:scale-115';
      case 'portrait':
        return 'rounded-2xl aspect-[3/4] max-h-[560px] w-auto max-w-[420px] md:scale-110';
      case 'portrait-wide':
        return 'rounded-2xl aspect-[3.5/4.25] max-h-[540px] w-auto max-w-[440px] md:scale-110';
      case 'grande':
        return 'rounded-[32px] aspect-[2/3] max-h-[580px] w-auto max-w-[380px] md:scale-110';
      case 'hexagon':
        return 'shape-hexagon aspect-[1.15/1] max-h-[480px] w-auto max-w-[520px] md:scale-115';
      case 'crest':
        return 'shape-crest aspect-square max-h-[480px] w-auto max-w-[480px] md:scale-115';
      case 'oval':
        return 'shape-oval aspect-[2/3] max-h-[580px] w-auto max-w-[380px] md:scale-110';
      case 'scalloped-stand':
        return 'shape-scalloped border-8 border-red-900 bg-white p-4 aspect-[3/4] max-h-[560px] w-auto max-w-[420px] md:scale-110';
      case 'polaroid':
        return 'shape-polaroid bg-white pb-14 pt-3.5 px-3.5 shadow-md max-h-[540px] w-auto max-w-[400px] border border-neutral-100 md:scale-110';
      case 'love':
        return 'shape-heart aspect-square max-h-[480px] w-auto max-w-[480px] md:scale-115';
      case 'filmstrip':
        return 'bg-zinc-950 p-[3px] rounded-lg aspect-[1/3] max-h-[600px] w-auto max-w-[200px] md:scale-110';
      default:
        return 'rounded-2xl aspect-[3/4] max-h-[540px] w-auto max-w-[420px] md:scale-110';
    }
  };

  return (
    <div id="immersive-experience-root" className="min-h-screen bg-[#FAF8F5] text-[#111111] font-sans antialiased selection:bg-[#E8DCCF] selection:text-neutral-900 flex flex-col">
      {/* Global CSS SVG ClipPath definitions for complex custom shapes */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0 overflow-hidden" aria-hidden="true">
        <defs>
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5, 0.25 C 0.35, 0.05, 0.05, 0.05, 0.05, 0.35 C 0.05, 0.65, 0.25, 0.85, 0.5, 1 C 0.75, 0.85, 0.95, 0.65, 0.95, 0.35 C 0.95, 0.05, 0.65, 0.05, 0.5, 0.25 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Immersive Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-neutral-200/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-neutral-600 hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          <div className="text-center pr-8 sm:pr-20">
            <span className="font-serif text-xl sm:text-2xl font-light tracking-tight text-[#111111]">
              KRIA <span className="font-sans text-[10px] tracking-widest uppercase ml-0.5 font-light">Studio</span>
            </span>
          </div>

          <div className="w-8" />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 items-center">
        
        {/* 1. UPLOAD YOUR PHOTOS WORKSPACE TRAY (Matching Image 1) */}
        <div className="w-full max-w-2xl bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 z-20">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-[#6B1D2F] text-white font-sans font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              1
            </div>
            <h3 className="font-sans font-bold text-lg sm:text-xl text-[#111111] tracking-tight">
              Upload your photos
            </h3>
          </div>

          {/* Horizontal Scrollable Thumbnails Tray */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin">
            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              ref={fileInputRef} 
              className="hidden" 
            />

            {/* Add Photo Dashed Card Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-500 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shrink-0 hover:shadow-xs group/add"
            >
              <Plus className="h-6 w-6 text-neutral-400 group-hover/add:text-neutral-700 transition-colors" />
              <span className="font-sans text-xs font-medium text-neutral-600 group-hover/add:text-neutral-900">
                {isUploading ? 'Uploading...' : 'Add photo'}
              </span>
            </button>

            {/* Available Photos Pool Cards */}
            {photoPool.map((photo) => {
              const isActive = photoUrl === photo.url;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => selectPreset(photo.url, photo.name)}
                  className={`relative w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-neutral-100 ${
                    isActive 
                      ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-md scale-[1.02]' 
                      : 'border-neutral-200/90 hover:border-neutral-400'
                  }`}
                >
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  
                  {isActive && (
                    <div className="absolute bottom-1.5 inset-x-2 bg-neutral-900/90 backdrop-blur-xs text-white text-[10px] font-mono font-bold py-0.5 rounded-full text-center tracking-wide uppercase">
                      Active
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Caption */}
          <p className="font-sans text-[11px] text-neutral-500 font-light px-1 pt-1 border-t border-neutral-200/50">
            Click any photo above to select & edit its acrylic shape and crop in the workspace below.
          </p>
        </div>

        {/* IMMERSIVE SLIDING GRID */}
        <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 relative py-2 max-w-6xl">
          
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-0 md:relative z-30 bg-white hover:bg-neutral-900 text-neutral-800 hover:text-white rounded-full p-3 sm:p-4 border border-neutral-200 shadow-lg transition-all active:scale-95 cursor-pointer"
            aria-label="Previous Shape"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Core Shape Frame Visualizer Area */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] md:min-h-[620px] w-full max-w-md mx-auto">
            
            {/* Magnetic steel panel replica backdrop */}
            <div className="relative w-full aspect-[9/16] bg-[#F3ECE4]/35 rounded-[40px] border border-neutral-200/50 p-6 sm:p-10 flex items-center justify-center overflow-hidden shadow-inner group">
              {/* Subtle brushed metal look */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
              
              {/* 3D Acrylic Frame Container */}
              <div 
                ref={previewContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUpOrLeave}
                className="relative select-none transition-transform duration-500 hover:scale-[1.01] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
              >
                
                {/* Acrylic 3D Soft Shadow backing */}
                <div className="absolute inset-2 bg-black/15 blur-xl pointer-events-none rounded-3xl" />

                {/* Live Shape Frame Profile */}
                <div className={`relative overflow-hidden bg-neutral-300/10 border-4 border-white/60 shadow-2xl transition-all duration-300 ${getShapeContainerClass(activeShape.id)}`}>
                  
                  {/* Photo content mapped into the shape frame */}
                  <div className={`w-full h-full relative overflow-hidden ${
                    activeShape.id === 'love' ? 'shape-heart' :
                    activeShape.id === 'hexagon' ? 'shape-hexagon' :
                    activeShape.id === 'arch' ? 'shape-arch' :
                    activeShape.id === 'cloud' ? 'shape-cloud' :
                    activeShape.id === 'circle-bloom' ? 'shape-circle-cloud' :
                    activeShape.id === 'crest' ? 'shape-crest' :
                    activeShape.id === 'oval' ? 'shape-oval' :
                    activeShape.id === 'circle' ? 'rounded-full' :
                    activeShape.id === 'custom' ? 'rounded-[2rem]' :
                    activeShape.id === 'scalloped-stand' ? 'rounded-lg' :
                    'rounded-xs'
                  }`}>
                    {activeShape.id === 'filmstrip' ? (
                      <div className="grid grid-rows-3 h-full gap-1 p-[2px]">
                        <div className="bg-zinc-800 rounded-xs overflow-hidden relative">
                          <img 
                            src={photoUrl} 
                            style={{
                              transform: `scale(${photoScale}) translate(${photoPanX}px, ${photoPanY}px)`,
                            }}
                            className="w-full h-full object-contain origin-center transition-transform duration-150" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                        <div className="bg-zinc-800 rounded-xs overflow-hidden relative">
                          <img src="/images/couple_portrait_sample_1782458143228.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="bg-zinc-800 rounded-xs overflow-hidden relative">
                          <img src="/images/scenic_landscape_sample_1782458156606.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={photoUrl}
                        alt={activeShape.name}
                        style={{
                          transform: `scale(${photoScale}) translate(${photoPanX}px, ${photoPanY}px)`,
                        }}
                        className={`w-full h-full object-contain origin-center transition-transform duration-150 ${activeShape.id === 'circle' || activeShape.id === 'circle-bloom' ? 'rounded-full' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Highly authentic polished acrylic highlight */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-55 pointer-events-none mix-blend-overlay shine-effect" />
                    <div className="absolute inset-0 shadow-[inset_0_2px_12px_rgba(0,0,0,0.15)] pointer-events-none rounded-xs" />
                  </div>

                  {/* Polaroid layout text */}
                  {activeShape.id === 'polaroid' && (
                    <div className="absolute bottom-[10px] inset-x-0 text-center font-serif italic text-neutral-800 text-[10px] tracking-tight px-1 select-none truncate">
                      Sunny Moments
                    </div>
                  )}

                  {/* Subtle polished edge line */}
                  <div className="absolute inset-0 border border-white/20 pointer-events-none" />
                </div>

                {/* Acrylic Stand Base (For scalloped-stand only) */}
                {activeShape.id === 'scalloped-stand' && (
                  <div className="mt-[-10px] w-64 flex justify-center gap-24 relative z-0">
                    <div className="w-10 h-32 bg-neutral-200/30 backdrop-blur-md rounded-lg border border-white/50 skew-x-12 origin-top shadow-xl" />
                    <div className="w-10 h-32 bg-neutral-200/30 backdrop-blur-md rounded-lg border border-white/50 -skew-x-12 origin-top shadow-xl" />
                  </div>
                )}
              </div>

              {/* Reset Fit & Zoom Button Overlay */}
              <button
                type="button"
                onClick={handleResetFitAndZoom}
                className="absolute top-4 left-4 bg-white/90 hover:bg-white text-neutral-800 text-[10px] font-mono uppercase font-bold px-3 py-1.5 rounded-full border border-neutral-200/80 shadow-sm flex items-center gap-1.5 transition-all z-20 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Fit & Zoom</span>
              </button>

              {/* Progress Index Badge */}
              <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md border border-neutral-200/80 rounded-full px-3 py-1 text-[10px] font-mono tracking-widest text-neutral-500">
                {currentIndex + 1} / {BASE_SHAPES.length}
              </div>
            </div>

          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-0 md:relative z-30 bg-white hover:bg-neutral-900 text-neutral-800 hover:text-white rounded-full p-3 sm:p-4 border border-neutral-200 shadow-lg transition-all active:scale-95 cursor-pointer"
            aria-label="Next Shape"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

        </div>

        {/* BOTTOM METADATA & CTA ACTION PANEL */}
        <div className="w-full max-w-xl text-center space-y-5">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[#666666] font-bold uppercase block">
              {activeShape.tagline || 'Aesthetic Style'}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#111111] tracking-tight">
              {activeShape.name}
            </h3>
            <div className="flex items-center justify-center gap-3 font-mono text-xs text-neutral-500">
              <span>SIZE: {activeShape.dimensions}</span>
              <span className="text-neutral-300">•</span>
              <span className="text-[#111111] font-bold">₹{activeShape.price} EACH</span>
            </div>
            <p className="font-sans text-xs text-[#666666] leading-relaxed max-w-sm mx-auto font-light">
              {activeShape.description}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onAddDirectlyToTrayAndCheckout(activeShape.id, photoUrl, photoName, photoScale, photoPanX, photoPanY)}
              className="w-full sm:w-auto bg-[#111111] hover:bg-[#222222] text-[#FAF8F5] text-xs font-sans tracking-widest font-bold uppercase px-8 py-4.5 rounded-full flex items-center justify-center gap-2 shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-[#E8DCCF]" />
              Order Now
            </button>
            <button
              onClick={() => {
                onAddDirectlyToTrayAndCheckout(activeShape.id, photoUrl, photoName, photoScale, photoPanX, photoPanY);
                setAddedFeedback(true);
                setTimeout(() => setAddedFeedback(false), 2500);
              }}
              className={`w-full sm:w-auto text-xs font-sans tracking-widest font-bold uppercase px-8 py-4.5 rounded-full shadow-md border flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer ${
                addedFeedback 
                  ? 'bg-emerald-700 text-white border-emerald-800' 
                  : 'bg-[#E8DCCF] hover:bg-[#dfd0bf] text-neutral-900 border-[#d3c0ad]'
              }`}
            >
              <Check className={`h-4 w-4 ${addedFeedback ? 'text-white' : 'text-neutral-900'}`} />
              {addedFeedback ? 'Added to Cart!' : 'Add to Cart'}
            </button>
          </div>
        </div>

      </main>

      {/* Hovering Cart Floating Button in Bottom Right Corner */}
      <button
        type="button"
        onClick={() => onOpenCart ? onOpenCart() : onAddDirectlyToTrayAndCheckout(activeShape.id, photoUrl, photoName, photoScale, photoPanX, photoPanY)}
        className="fixed bottom-6 right-6 z-50 bg-[#111111] text-[#FAF8F5] hover:bg-neutral-800 p-4 rounded-full shadow-2xl border border-neutral-700/80 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer group relative"
        title="View Cart & Checkout"
      >
        <ShoppingBag className="h-5 w-5 text-[#E8DCCF]" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider pr-1 hidden sm:inline">
          Cart{cartItemCount > 0 ? ` (${cartItemCount})` : ''}
        </span>
        {cartItemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#6B1D2F] text-white text-[11px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-neutral-900 shadow-md">
            {cartItemCount}
          </span>
        )}
      </button>

      {/* Footer Details */}
      <footer className="bg-neutral-50 border-t border-neutral-200/50 py-6 text-center text-neutral-400 font-mono text-[9px] uppercase tracking-wider mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <span>KRIA Studio © 2026</span>
          <span className="hidden sm:inline-block text-neutral-300">•</span>
          <span>4mm Hand-polished Glossy Premium Acrylic</span>
          <span className="hidden sm:inline-block text-neutral-300">•</span>
          <span>High-grade Neodymium Magnetic Grip</span>
        </div>
      </footer>
    </div>
  );
}
