import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Move, Check, RotateCcw } from 'lucide-react';

interface CMSCropEditorModalProps {
  order: any;
  itemIndex: number;
  item: any;
  adminToken: string;
  onClose: () => void;
  onSaved: (updatedOrder: any) => void;
}

export default function CMSCropEditorModal({
  order,
  itemIndex,
  item,
  adminToken,
  onClose,
  onSaved
}: CMSCropEditorModalProps) {
  const [scale, setScale] = useState<number>(() => {
    return Number(item.cropSpec?.scale ?? item.photoScale ?? 1.0);
  });
  const [panX, setPanX] = useState<number>(() => {
    return Number(item.cropSpec?.panX ?? item.photoPanX ?? 0);
  });
  const [panY, setPanY] = useState<number>(() => {
    return Number(item.cropSpec?.panY ?? item.photoPanY ?? 0);
  });
  const [cropMode, setCropMode] = useState<'fill' | 'fit'>(() => {
    return item.cropMode === 'fit' ? 'fit' : 'fill';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoUrl = item.originalUrl || item.previewUrl;
  const shapeId = item.shapeId || 'arch';

  // Live render of photo inside shape contour on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photoUrl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 400;
    const H = 400;
    canvas.width = W;
    canvas.height = H;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, W, H);

      // Save canvas state for clipping
      ctx.save();

      // Shape clipping path
      ctx.beginPath();
      switch (shapeId) {
        case 'love': {
          const topCurve = H * 0.3;
          ctx.moveTo(W / 2, H * 0.95);
          ctx.bezierCurveTo(W * 0.05, H * 0.6, W * 0.05, topCurve, W * 0.28, topCurve * 0.3);
          ctx.bezierCurveTo(W * 0.42, 0, W / 2, topCurve * 0.6, W / 2, topCurve * 0.8);
          ctx.bezierCurveTo(W / 2, topCurve * 0.6, W * 0.58, 0, W * 0.72, topCurve * 0.3);
          ctx.bezierCurveTo(W * 0.95, topCurve, W * 0.95, H * 0.6, W / 2, H * 0.95);
          break;
        }
        case 'circle':
        case 'circle-bloom': {
          ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.46, 0, Math.PI * 2);
          break;
        }
        case 'arch': {
          const r = W * 0.45;
          const cx = W / 2;
          const cy = r + 20;
          ctx.arc(cx, cy, r, Math.PI, 0, false);
          ctx.lineTo(cx + r, H - 20);
          ctx.lineTo(cx - r, H - 20);
          ctx.closePath();
          break;
        }
        case 'hexagon': {
          const r = Math.min(W, H) * 0.46;
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = W / 2 + r * Math.cos(angle);
            const y = H / 2 + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
        }
        case 'oval': {
          ctx.ellipse(W / 2, H / 2, W * 0.42, H * 0.47, 0, 0, Math.PI * 2);
          break;
        }
        default: {
          // Polaroid / Rectangle
          ctx.rect(30, 30, W - 60, H - 60);
          break;
        }
      }
      ctx.clip();

      // Render image with transform
      const imgRatio = (img.width || 1) / (img.height || 1);
      let baseW = W;
      let baseH = W / imgRatio;

      if (cropMode === 'fit') {
        if (imgRatio > 1) {
          baseW = W * 0.9;
          baseH = baseW / imgRatio;
        } else {
          baseH = H * 0.9;
          baseW = baseH * imgRatio;
        }
      } else {
        if (baseH < H) {
          baseH = H;
          baseW = H * imgRatio;
        }
      }

      const drawW = baseW * scale;
      const drawH = baseH * scale;
      const offsetX = (W - drawW) / 2 + (panX * 2);
      const offsetY = (H - drawH) / 2 + (panY * 2);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      ctx.restore();

      // Draw dashed outline on top of clipping region
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      switch (shapeId) {
        case 'love': {
          const topCurve = H * 0.3;
          ctx.beginPath();
          ctx.moveTo(W / 2, H * 0.95);
          ctx.bezierCurveTo(W * 0.05, H * 0.6, W * 0.05, topCurve, W * 0.28, topCurve * 0.3);
          ctx.bezierCurveTo(W * 0.42, 0, W / 2, topCurve * 0.6, W / 2, topCurve * 0.8);
          ctx.bezierCurveTo(W / 2, topCurve * 0.6, W * 0.58, 0, W * 0.72, topCurve * 0.3);
          ctx.bezierCurveTo(W * 0.95, topCurve, W * 0.95, H * 0.6, W / 2, H * 0.95);
          ctx.stroke();
          break;
        }
        case 'circle':
        case 'circle-bloom': {
          ctx.beginPath();
          ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.46, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'arch': {
          const r = W * 0.45;
          const cx = W / 2;
          const cy = r + 20;
          ctx.beginPath();
          ctx.arc(cx, cy, r, Math.PI, 0, false);
          ctx.lineTo(cx + r, H - 20);
          ctx.lineTo(cx - r, H - 20);
          ctx.closePath();
          ctx.stroke();
          break;
        }
        case 'hexagon': {
          const r = Math.min(W, H) * 0.46;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = W / 2 + r * Math.cos(angle);
            const y = H / 2 + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
          break;
        }
        case 'oval': {
          ctx.beginPath();
          ctx.ellipse(W / 2, H / 2, W * 0.42, H * 0.47, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        default: {
          ctx.strokeRect(30, 30, W - 60, H - 60);
          break;
        }
      }
      ctx.restore();
    };
    img.src = photoUrl;
  }, [photoUrl, shapeId, scale, panX, panY, cropMode]);

  const handleReset = () => {
    setScale(1.0);
    setPanX(0);
    setPanY(0);
    setCropMode('fill');
  };

  const handleSaveCrop = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const canvas = canvasRef.current;
      const previewDataUrl = canvas ? canvas.toDataURL('image/png') : undefined;

      const response = await fetch(`/api/admin/orders/${order.id}/items/${itemIndex}/crop`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          cropSpec: {
            scale,
            panX,
            panY,
            version: 'v1'
          },
          previewUrl: previewDataUrl,
          cropMode
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save updated crop.');
      }

      const data = await response.json();
      onSaved(data.order);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving crop.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl w-full max-w-xl border border-neutral-300 shadow-2xl overflow-hidden flex flex-col text-left">
        
        {/* Header */}
        <div className="bg-[#111111] text-white p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8DCCF]">
              CMS Precision Customizer
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Adjust Crop & Orientation · Frame {itemIndex + 1} ({item.shapeName || shapeId})
            </h3>
            <p className="text-[11px] text-neutral-400">Order #{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 rounded-full transition text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Interactive Preview Canvas */}
          <div className="flex flex-col items-center justify-center bg-neutral-100 rounded-2xl p-4 border border-neutral-200">
            <canvas
              ref={canvasRef}
              className="w-[280px] h-[280px] bg-white rounded-xl shadow-md border border-neutral-300 block"
            />
            <span className="text-[11px] text-neutral-500 mt-2 font-mono">
              Live Cutting Mask Preview (Dashed line = Physical Acrylic Edge)
            </span>
          </div>

          {/* Crop Mode Switcher */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-bold tracking-wider text-neutral-600 block">
              Fitting Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCropMode('fill')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  cropMode === 'fill'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                Fill (Auto-Crop)
              </button>
              <button
                type="button"
                onClick={() => setCropMode('fit')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  cropMode === 'fit'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                Full Photo (No Cutoff)
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
            {/* Zoom Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5 text-neutral-500" />
                  Zoom Scale
                </span>
                <span className="font-mono">{scale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>

            {/* Horizontal Pan */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <Move className="h-3.5 w-3.5 text-neutral-500" />
                  Horizontal Pan (X)
                </span>
                <span className="font-mono">{panX}px</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                step="1"
                value={panX}
                onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>

            {/* Vertical Pan */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <Move className="h-3.5 w-3.5 text-neutral-500" />
                  Vertical Pan (Y)
                </span>
                <span className="font-mono">{panY}px</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                step="1"
                value={panY}
                onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Edits</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl border border-neutral-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={isSaving}
              className="px-5 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving…' : 'Save Crop to Order'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
