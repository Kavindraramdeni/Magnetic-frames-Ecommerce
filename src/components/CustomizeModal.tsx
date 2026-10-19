import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, RotateCw, RotateCcw, CheckCircle2, Grid, Sparkles, Plus, Minus, AlertCircle
} from 'lucide-react';
import { CartItem, MagnetShape, MagnetShapeId } from '../types';

function drawImageTransformed(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  boxW: number,
  boxH: number,
  scale: number,
  panX: number,
  panY: number,
  rotation: number,
  cropMode: 'fill' | 'fit'
) {
  const imgRatio = (img.width || 1) / (img.height || 1);
  const boxRatio = boxW / boxH;

  let baseW = boxW;
  let baseH = boxH;

  if (cropMode === 'fit') {
    if (imgRatio > boxRatio) {
      baseW = boxW;
      baseH = boxW / imgRatio;
    } else {
      baseH = boxH;
      baseW = boxH * imgRatio;
    }
  } else {
    // Fill edge-to-edge
    if (imgRatio > boxRatio) {
      baseH = boxH;
      baseW = boxH * imgRatio;
    } else {
      baseW = boxW;
      baseH = boxW / imgRatio;
    }
  }

  ctx.save();
  ctx.translate(cx + panX, cy + panY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
  ctx.restore();
}

function renderShapedArtwork(
  shapeId: string,
  imgSource: string,
  scale: number,
  panX: number,
  panY: number,
  rotation: number,
  cropMode: 'fill' | 'fit',
  caption?: string
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const W = 600;
    const H = shapeId === 'grande' ? 900 : shapeId === 'polaroid' ? 750 : 600;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(imgSource);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath();
      if (shapeId === 'love') {
        const topCurve = H * 0.3;
        ctx.moveTo(W / 2, H * 0.95);
        ctx.bezierCurveTo(W * 0.05, H * 0.6, W * 0.05, topCurve, W * 0.28, topCurve * 0.3);
        ctx.bezierCurveTo(W * 0.42, 0, W / 2, topCurve * 0.6, W / 2, topCurve * 0.8);
        ctx.bezierCurveTo(W / 2, topCurve * 0.6, W * 0.58, 0, W * 0.72, topCurve * 0.3);
        ctx.bezierCurveTo(W * 0.95, topCurve, W * 0.95, H * 0.6, W / 2, H * 0.95);
        ctx.closePath();
      } else if (shapeId === 'circle' || shapeId === 'circle-bloom') {
        ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.48, 0, Math.PI * 2);
        ctx.closePath();
      } else if (shapeId === 'arch') {
        const r = W * 0.46;
        const cx = W / 2;
        const cy = r + 15;
        ctx.arc(cx, cy, r, Math.PI, 0, false);
        ctx.lineTo(cx + r, H - 15);
        ctx.lineTo(cx - r, H - 15);
        ctx.closePath();
      } else if (shapeId === 'polaroid') {
        // Polaroid card outer rounded box
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(10, 10, W - 20, H - 20, 14);
        } else {
          ctx.rect(10, 10, W - 20, H - 20);
        }
        ctx.closePath();
      } else {
        // Grande / Rectangle rounded box
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(10, 10, W - 20, H - 20, 18);
        } else {
          ctx.rect(10, 10, W - 20, H - 20);
        }
        ctx.closePath();
      }
      ctx.clip();

      if (shapeId === 'polaroid') {
        // White polaroid container
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, W, H);

        const photoMargin = 28;
        const photoBottom = H - 85;
        const photoW = W - photoMargin * 2;
        const photoH = photoBottom - photoMargin;

        ctx.save();
        ctx.beginPath();
        ctx.rect(photoMargin, photoMargin, photoW, photoH);
        ctx.clip();

        drawImageTransformed(ctx, img, photoMargin + photoW / 2, photoMargin + photoH / 2, photoW, photoH, scale, panX, panY, rotation, cropMode);
        ctx.restore();

        // Caption text
        ctx.fillStyle = '#262320';
        ctx.font = 'italic 19px "Playfair Display", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(caption || 'KRIA Memories', W / 2, H - 42);
      } else {
        drawImageTransformed(ctx, img, W / 2, H / 2, W, H, scale, panX, panY, rotation, cropMode);
      }

      ctx.restore();
      try {
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        resolve(imgSource);
      }
    };
    img.onerror = () => resolve(imgSource);
    img.src = imgSource;
  });
}

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shape: MagnetShape;
  initialSize?: string;
  onAddToCart: (item: CartItem) => void;
  onDirectCheckout?: (item: CartItem) => void;
}

export default function CustomizeModal({
  isOpen,
  onClose,
  shape,
  initialSize,
  onAddToCart,
  onDirectCheckout
}: CustomizeModalProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('Custom Photo');
  const [photoScale, setPhotoScale] = useState<number>(1);
  const [photoRotation, setPhotoRotation] = useState<number>(0);
  const [photoPanX, setPhotoPanX] = useState<number>(0);
  const [photoPanY, setPhotoPanY] = useState<number>(0);
  const [cropMode, setCropMode] = useState<'fill' | 'fit'>('fill');
  const [showCropGuides, setShowCropGuides] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isPhotoMissingShake, setIsPhotoMissingShake] = useState<boolean>(false);

  // Available sizes
  const sizes = shape.sizes && shape.sizes.length > 0 
    ? shape.sizes 
    : [{ size: shape.dimensions, label: shape.dimensions, price: shape.price }];

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    if (initialSize && sizes.some(s => s.size === initialSize)) {
      return initialSize;
    }
    return sizes[0].size;
  });

  const activeSizeOption = sizes.find(s => s.size === selectedSize) || sizes[0];
  const currentPrice = activeSizeOption.price || shape.price;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset or initialize when modal opens with a new shape
  useEffect(() => {
    if (isOpen) {
      setPhotoError(null);
      setIsPhotoMissingShake(false);
      if (initialSize && sizes.some(s => s.size === initialSize)) {
        setSelectedSize(initialSize);
      } else if (!sizes.some(s => s.size === selectedSize)) {
        setSelectedSize(sizes[0].size);
      }
    }
  }, [isOpen, initialSize, shape.id]);

  if (!isOpen) return null;

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, WEBP).');
      return;
    }

    setPhotoError(null);
    setIsPhotoMissingShake(false);
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoUrl(dataUrl);
      setOriginalPhotoUrl(dataUrl);
      setPhotoScale(1);
      setPhotoPanX(0);
      setPhotoPanY(0);
      setPhotoRotation(0);
    };
    reader.readAsDataURL(file);
  };

  // Pan Gestures (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!photoUrl) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - photoPanX, y: e.clientY - photoPanY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !photoUrl) return;
    setPhotoPanX(e.clientX - startPan.x);
    setPhotoPanY(e.clientY - startPan.y);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!photoUrl || e.touches.length !== 1) return;
    setIsPanning(true);
    setStartPan({ x: e.touches[0].clientX - photoPanX, y: e.touches[0].clientY - photoPanY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || !photoUrl || e.touches.length !== 1) return;
    setPhotoPanX(e.touches[0].clientX - startPan.x);
    setPhotoPanY(e.touches[0].clientY - startPan.y);
  };

  const handleRotate = () => {
    setPhotoRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setPhotoScale(1);
    setPhotoPanX(0);
    setPhotoPanY(0);
    setPhotoRotation(0);
    setCropMode('fill');
    setShowCropGuides(false);
  };

  // Shape-specific SVG / styling clip
  const getShapeFrameStyle = () => {
    switch (shape.id) {
      case 'love':
        return {
          wrapperClass: 'aspect-square w-full max-w-[270px] sm:max-w-[310px]',
          frameClass: 'shape-heart w-full h-full relative overflow-hidden',
          isPolaroid: false
        };
      case 'circle':
        return {
          wrapperClass: 'aspect-square w-full max-w-[270px] sm:max-w-[310px]',
          frameClass: 'rounded-full w-full h-full relative overflow-hidden border-2 border-white/40',
          isPolaroid: false
        };
      case 'polaroid':
        return {
          wrapperClass: 'aspect-[4/5] w-full max-w-[250px] sm:max-w-[280px]',
          frameClass: 'shape-polaroid w-full h-full relative overflow-hidden border border-white/50 bg-white p-3 pt-3 pb-8 text-black shadow-md flex flex-col justify-between',
          isPolaroid: true
        };
      case 'grande':
      case 'arch':
      default:
        return {
          wrapperClass: 'aspect-[3/4] w-full max-w-[260px] sm:max-w-[300px]',
          frameClass: 'shape-arch w-full h-full relative overflow-hidden border-2 border-white/40',
          isPolaroid: false
        };
    }
  };

  const frameConfig = getShapeFrameStyle();

  // Add to Bag action with zero-photo guard and high-res shaped artwork generation
  const handleAddToBag = async () => {
    if (!photoUrl) {
      setPhotoError('Please select and upload your photo before adding to bag.');
      setIsPhotoMissingShake(true);
      setTimeout(() => setIsPhotoMissingShake(false), 1000);
      fileInputRef.current?.click();
      return;
    }

    setPhotoError(null);

    // Generate accurate shaped artwork canvas
    let renderedPreview = photoUrl;
    try {
      renderedPreview = await renderShapedArtwork(
        shape.id,
        photoUrl,
        photoScale,
        photoPanX,
        photoPanY,
        photoRotation,
        cropMode,
        'KRIA Memories'
      );
    } catch (e) {
      console.warn('Canvas render fallback:', e);
    }

    const item: CartItem = {
      id: `custom-${shape.id}-${Date.now()}`,
      shapeId: shape.id,
      shapeName: `${shape.name} (${activeSizeOption.size})`,
      quantity: 1,
      previewUrl: renderedPreview,
      originalUrl: originalPhotoUrl || photoUrl,
      photoName: photoName || `${shape.name} Photo`,
      captionText: frameConfig.isPolaroid ? 'KRIA Memories' : '',
      photoScale,
      photoPanX,
      photoPanY,
      photoRotation,
      cropMode,
      cropSpec: {
        version: 'v1',
        scale: photoScale,
        panX: photoPanX,
        panY: photoPanY,
        rotation: photoRotation,
        cropMode,
        aspectRatio: shape.id === 'grande' ? 0.667 : shape.id === 'polaroid' ? 0.75 : 1.0,
        shapeId: shape.id
      },
      price: currentPrice,
      selectedSize: activeSizeOption.size,
      isReturnGift: false
    };

    onAddToCart(item);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Modal Dialog Container (Matching Screenshot 1) */}
      <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl border border-neutral-200/80 overflow-hidden relative flex flex-col my-auto max-h-[95vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-[#FAF8F5]">
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-neutral-900 tracking-tight">
            Customize your {shape.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 transition cursor-pointer shadow-2xs"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body: Left Preview, Right Adjustments */}
        <div className="p-4 sm:p-6 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
          
          {/* ════ LEFT COLUMN: PREVIEW CANVAS (WARM CONTAINER) ════ */}
          <div className="md:col-span-6 flex flex-col items-center">
            <div className="w-full bg-[#EDE8DF] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[340px] sm:min-h-[420px] relative overflow-hidden shadow-inner select-none">
              
              {/* Optional Crop Guides Button */}
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setShowCropGuides(!showCropGuides)}
                  className={`absolute top-3.5 right-3.5 z-20 p-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-1 ${
                    showCropGuides
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white/80 backdrop-blur-xs text-neutral-700 border-neutral-200 hover:bg-white'
                  }`}
                  title="Toggle alignment guides"
                >
                  <Grid className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-mono hidden sm:inline">Guides</span>
                </button>
              )}

              {/* The Acrylic Magnetic Frame Preview */}
              <div 
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setIsPanning(false)}
                onMouseLeave={() => setIsPanning(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => setIsPanning(false)}
                style={{
                  filter: 'drop-shadow(0 20px 28px rgba(0,0,0,0.22)) drop-shadow(0 4px 10px rgba(0,0,0,0.12))'
                }}
                className={`transition-all select-none ${frameConfig.wrapperClass} ${
                  photoUrl ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                }`}
                onClick={() => { if (!photoUrl) fileInputRef.current?.click(); }}
              >
                <div className={`${frameConfig.frameClass} bg-[#D9D3C7] transition-all duration-300 ${
                  isPhotoMissingShake ? 'ring-4 ring-amber-400 scale-[1.02] shadow-xl' : ''
                }`}>
                  {!photoUrl ? (
                    /* Awaiting Photo / Empty Upload State (Matching Screenshot 1) */
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#C4C8A8]/60 to-[#B48C68]/60 hover:opacity-95 transition-opacity group">
                      <div className="h-12 w-12 rounded-full bg-white/40 backdrop-blur-xs flex items-center justify-center text-neutral-900 mb-2.5 group-hover:scale-105 transition-transform">
                        <Camera className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <h4 className="font-serif text-xl sm:text-2xl text-neutral-950 font-normal">
                        Choose your photo
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="mt-3.5 px-6 py-2 rounded-full bg-[#262320] text-white text-xs font-semibold shadow-md hover:bg-black transition cursor-pointer"
                      >
                        Select photo
                      </button>
                    </div>
                  ) : (
                    /* Photo Loaded State */
                    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                      {/* Blurred backdrop when Fit mode is active */}
                      {cropMode === 'fit' && (
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-30 blur-md scale-110 pointer-events-none"
                          style={{ backgroundImage: `url(${photoUrl})` }}
                        />
                      )}

                      <img
                        src={photoUrl}
                        alt="Preview"
                        className={`w-full h-full ${
                          cropMode === 'fit' ? 'object-contain' : 'object-cover'
                        } origin-center transition-transform duration-75 select-none pointer-events-none`}
                        style={{
                          transform: `rotate(${photoRotation}deg) scale(${photoScale}) translate(${photoPanX}px, ${photoPanY}px)`
                        }}
                      />

                      {/* Crop Guides */}
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

                      {/* Subtle Acrylic Highlight */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 opacity-60 pointer-events-none mix-blend-overlay" />
                    </div>
                  )}

                  {/* Polaroid Bottom Caption */}
                  {frameConfig.isPolaroid && (
                    <div className="absolute bottom-2.5 inset-x-0 text-center font-serif italic text-xs text-neutral-800 truncate px-2">
                      KRIA Memories
                    </div>
                  )}
                </div>
              </div>

              {/* Reposition Hint */}
              <p className="text-[11px] text-neutral-500 text-center mt-3 font-light">
                {photoUrl ? 'Drag photo to reposition inside frame' : 'Tap frame or button to upload'}
              </p>
            </div>
          </div>

          {/* ════ RIGHT COLUMN: PHOTO & CROPPING ADJUSTMENTS (MATCHING SCREENSHOT 1) ════ */}
          <div className="md:col-span-6 space-y-4">
            
            {/* 1. YOUR PHOTO ROW */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                  YOUR PHOTO
                </span>
                {photoUrl ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Print-ready</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                    Awaiting photo
                  </span>
                )}
              </div>

              {/* Action Upload / Replace Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
                  photoUrl 
                    ? 'border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50' 
                    : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs'
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{photoUrl ? 'Replace photo' : 'Select photo'}</span>
              </button>
            </div>

            {/* 2. FRAMING OPTION (Fill vs Full Photo) */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-sans font-medium text-neutral-700">
                FRAMING OPTION
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF8F5] rounded-2xl border border-neutral-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setCropMode('fill');
                    setPhotoScale(1);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    cropMode === 'fill'
                      ? 'bg-white text-neutral-950 shadow-xs font-bold border border-neutral-200/60'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span className="text-sm">⛶</span>
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
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    cropMode === 'fit'
                      ? 'bg-white text-neutral-950 shadow-xs font-bold border border-neutral-200/60'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span className="text-sm">⊡</span>
                  <span>Full Photo (No Cutoff)</span>
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 pl-1">
                {cropMode === 'fill'
                  ? 'Fills entire shape edge-to-edge. Drag to adjust position.'
                  : '100% of your photo is visible without cutting faces or edges.'}
              </p>
            </div>

            {/* 3. ROTATE SLIDER (Replaces Adjust Crop) */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-medium text-neutral-700 w-12">
                Rotate
              </span>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={photoRotation}
                disabled={!photoUrl}
                onChange={(e) => setPhotoRotation(Number(e.target.value))}
                className="flex-1 accent-[#262320] cursor-pointer disabled:opacity-40 h-1.5 bg-neutral-200 rounded-lg appearance-none"
              />
              <span className="text-xs font-mono text-neutral-600 min-w-8 text-right">
                {photoRotation}°
              </span>
              <button
                type="button"
                disabled={!photoUrl}
                onClick={handleReset}
                title="Reset rotation and adjustments"
                className="px-2.5 py-1 rounded-full border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-[10px] font-mono transition cursor-pointer disabled:opacity-40 shrink-0"
              >
                Reset
              </button>
            </div>

            {/* 4. ZOOM SLIDER */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-medium text-neutral-700 w-12">
                Zoom
              </span>
              <input
                type="range"
                min={0.8}
                max={2.5}
                step={0.05}
                value={photoScale}
                disabled={!photoUrl}
                onChange={(e) => setPhotoScale(Number(e.target.value))}
                className="flex-1 accent-[#262320] cursor-pointer disabled:opacity-40 h-1.5 bg-neutral-200 rounded-lg appearance-none"
              />
              <span className="text-xs font-mono text-neutral-600 min-w-7 text-right">
                {photoScale.toFixed(1)}x
              </span>
            </div>

            {/* 5. SIZE SELECTOR RADIO CARDS */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold block">
                SIZE
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sizes.map((s) => {
                  const isSelected = selectedSize === s.size;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => setSelectedSize(s.size)}
                      className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-neutral-900 bg-white ring-1 ring-neutral-900 shadow-xs'
                          : 'border-neutral-200/90 bg-[#FAF8F5] hover:bg-white text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-neutral-900' : 'border-neutral-300'
                        }`}>
                          {isSelected && <div className="h-2 w-2 rounded-full bg-neutral-900" />}
                        </div>
                        <span className="text-xs font-semibold text-neutral-900">
                          {s.size}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-neutral-900 pl-5">
                        ₹{s.price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Required Error Alert */}
            {photoError && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-medium">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {/* 6. ADD TO BAG BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddToBag}
                className={`w-full py-3.5 px-6 rounded-full font-bold text-sm tracking-wide transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                  isAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#241F1A] text-white hover:bg-black'
                }`}
              >
                {isAdded ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <span>Add to bag · ₹{currentPrice}</span>
                )}
              </button>
              <p className="text-[10px] text-neutral-400 text-center mt-2 font-light">
                Looks great. Check the preview before adding to bag.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
