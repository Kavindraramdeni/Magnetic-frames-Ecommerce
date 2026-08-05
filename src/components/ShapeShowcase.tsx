import React, { useEffect, useState } from 'react';
import { BASE_SHAPES } from '../data';
import { MagnetShapeId } from '../types';
import { Sparkles, Check } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface ShapeShowcaseProps {
  onSelectShape: (id: MagnetShapeId) => void;
}

export default function ShapeShowcase({ onSelectShape }: ShapeShowcaseProps) {
  const [catalogShapes, setCatalogShapes] = useState<any[]>([]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) return;
        const data = await res.json();
        const visibleShapes = (data.products || []).filter((p: any) => Boolean(p.isTrending ?? true));
        setCatalogShapes(visibleShapes);
      } catch (e) {
        console.error('Failed to load catalog products', e);
      }
    };
    loadCatalog();
  }, []);

  const baseShapeLookup = new Map(BASE_SHAPES.map(shape => [shape.id, shape]));
  const visibleCatalogShapes = catalogShapes.length > 0 ? catalogShapes : BASE_SHAPES.map((shape) => ({
    id: shape.id,
    name: shape.name,
    price: shape.price,
    originalPrice: shape.originalPrice,
    dimensions: shape.dimensions,
    description: shape.description,
    shapeClass: shape.shapeClass,
    frameRatio: shape.frameRatio,
    tagline: shape.tagline,
    isTrending: true
  }));
  
  // Custom styled images for each showcases to look premium
  const shapeSampleImages: { [key in MagnetShapeId]: string } = {
    arch: '/images/shape_arch_magnet_1779653475722.png', // our high-quality generated dog arch photo
    cloud: '/images/shape_cloud_magnet_1780939383548.png',
    circle: '/images/shape_circle_magnet_1780939399489.png',
    polaroid: '/images/shape_polaroid_magnet_1780939416510.png',
    love: '/images/shape_heart_magnet_1780939430998.png',
    filmstrip: '/images/shape_filmstrip_magnet_1780939443747.png',
    custom: '/images/shape_custom_silhouette_1780939456213.png',
    landscape: '/images/scenic_landscape_sample_1782458156606.jpg',
    portrait: '/images/couple_portrait_sample_1782458143228.jpg',
    'portrait-wide': '/images/architectural_detail_sample_1782458171090.jpg',
    grande: '/images/couple_portrait_sample_1782458143228.jpg',
    'circle-bloom': '/images/scenic_landscape_sample_1782458156606.jpg',
    hexagon: '/images/architectural_detail_sample_1782458171090.jpg',
    crest: '/images/couple_portrait_sample_1782458143228.jpg',
    oval: '/images/couple_portrait_sample_1782458143228.jpg',
    'scalloped-stand': '/images/scalloped_stand_product_preview_1782458429878.jpg'
  };

  return (
    <section id="shapes-showcase" className="select-none py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-neutral-200/80 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
              PREMIUM ACRYLIC SELECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight">
              Product <span className="italic font-serif font-light">Catalog</span>
            </h2>
          </div>
          <p className="text-xs font-mono text-neutral-500 max-w-md leading-relaxed">
            13 shapes · multi-size options per shape · 3–5mm ultra-clear acrylic · custom logo & text printing available
          </p>
        </div>

        {/* Shapes Grid Layout - Multi-Size Pills & SKU Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {visibleCatalogShapes.map((shape: any) => {
            const baseShape = baseShapeLookup.get(shape.id) || BASE_SHAPES.find((item) => item.id === shape.id);
            const sampleImage = shapeSampleImages[shape.id as MagnetShapeId] || shapeSampleImages[baseShape?.id as MagnetShapeId] || shapeSampleImages.arch;
            const displayName = shape.name || baseShape?.name || 'Custom Frame';
            const displayPrice = Number(shape.price ?? baseShape?.price ?? 0);
            const displayOriginalPrice = Number(shape.originalPrice ?? baseShape?.originalPrice ?? 0);
            const displayDimensions = shape.dimensions || baseShape?.dimensions || 'Standard';
            const displayDescription = shape.description || baseShape?.description || '';
            const isTrending = Boolean(shape.isTrending ?? true);
            const skuBadge = `KRIA-${String(shape.id).toUpperCase()}`;

            return (
              <div
                key={shape.id}
                className="group bg-white rounded-2xl p-3.5 sm:p-4 border border-neutral-200 transition-all duration-300 hover:shadow-xl hover:border-neutral-400 hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Image Container with SKU Badge & Metallic Corner Studs */}
                <div>
                  <div className="relative w-full aspect-[4/3] bg-[#FAF8F5] rounded-xl overflow-hidden mb-3 flex items-center justify-center p-3 border border-neutral-100">
                    
                    {/* SKU Pill Badge at Top-Left */}
                    <div className="absolute top-2 left-2 z-20 bg-neutral-900/80 backdrop-blur-xs text-white text-[8px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                      {skuBadge}
                    </div>

                    {/* MOQ Badge at Top-Right */}
                    <div className="absolute top-2 right-2 z-20 bg-emerald-50 text-emerald-800 text-[8px] font-mono px-1.5 py-0.5 rounded border border-emerald-200 font-bold uppercase">
                      MOQ 1
                    </div>

                    {/* Styled Floating Magnet Preview */}
                    <div className={`relative ${shape.frameRatio || baseShape?.frameRatio || 'aspect-[4/5]'} w-[70%] sm:w-[60%] max-w-[120px] select-none group-hover:scale-105 transition-all duration-300 shadow-lg`}>
                      
                      {/* 4 Corner Silver Metallic Stud Accents */}
                      <div className="absolute top-1 left-1 z-30 w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-neutral-400 via-white to-neutral-300 border border-neutral-500 shadow-xs" />
                      <div className="absolute top-1 right-1 z-30 w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-neutral-400 via-white to-neutral-300 border border-neutral-500 shadow-xs" />
                      <div className="absolute bottom-1 left-1 z-30 w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-neutral-400 via-white to-neutral-300 border border-neutral-500 shadow-xs" />
                      <div className="absolute bottom-1 right-1 z-30 w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-neutral-400 via-white to-neutral-300 border border-neutral-500 shadow-xs" />

                      <div className={`w-full h-full bg-white p-1 ring-1 ring-neutral-200 overflow-hidden relative ${
                        shape.id === 'arch' ? 'shape-arch' :
                        shape.id === 'cloud' ? 'shape-cloud' :
                        shape.id === 'circle' ? 'rounded-full' :
                        shape.id === 'polaroid' ? 'shape-polaroid bg-white pb-3 sm:pb-4 pt-1 px-1 shadow-inner' :
                        shape.id === 'love' ? 'shape-heart text-clip' :
                        shape.id === 'filmstrip' ? 'bg-zinc-950 p-[2px] rounded' :
                        shape.id === 'scalloped-stand' ? 'shape-scalloped border-2 border-[#8B0000] p-1' :
                        shape.id === 'circle-bloom' ? 'shape-circle-cloud' :
                        shape.id === 'hexagon' ? 'shape-hexagon' :
                        shape.id === 'crest' ? 'shape-crest' :
                        shape.id === 'oval' ? 'shape-oval' : 'rounded-xl'
                      }`}>
                        
                        <div className="w-full h-full overflow-hidden rounded-xs sm:rounded-sm relative">
                          <img
                            src={sampleImage}
                            alt={displayName}
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110`}
                            referrerPolicy="no-referrer"
                          />
                          {/* 3D Gloss Acrylic Reflection */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-40 mix-blend-overlay pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-bold text-[#111111]">
                        {displayName}
                      </h3>
                      <div className="flex items-center gap-1">
                        {displayOriginalPrice > 0 && displayOriginalPrice > displayPrice && (
                          <span className="font-mono text-[10px] text-neutral-400 line-through">
                            ₹{displayOriginalPrice}
                          </span>
                        )}
                        <span className="font-mono text-sm font-extrabold text-[#111111]">
                          ₹{displayPrice}
                        </span>
                      </div>
                    </div>
                    
                    <p className="font-sans text-[11px] text-[#666666] leading-snug line-clamp-2 font-light">
                      {displayDescription}
                    </p>

                    {/* Multi-Size Selection Pills */}
                    <div className="pt-2">
                      <span className="text-[9px] font-mono text-neutral-400 block mb-1 uppercase font-bold">Available Sizes:</span>
                      <div className="flex items-center gap-1 flex-wrap font-mono text-[9px]">
                        <span className="px-2 py-0.5 bg-neutral-900 text-white rounded font-bold">{displayDimensions}</span>
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded border border-neutral-200">3×3"</span>
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded border border-neutral-200">4×6"</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customize & Order Trigger Button */}
                <button
                  onClick={() => onSelectShape(shape.id)}
                  className="mt-4 w-full cursor-pointer bg-[#111111] hover:bg-black text-white transition-all py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1 shadow-xs active:scale-98"
                >
                  Select & Customize
                </button>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
