import React, { useEffect, useState } from 'react';
import { BASE_SHAPES } from '../data';
import { MagnetShapeId } from '../types';
import { Sparkles, Check } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface ShapeShowcaseProps {
  onSelectShape: (id: MagnetShapeId, selectedSize?: string, selectedPrice?: number) => void;
  onAddBulkToCart?: (shapeId: MagnetShapeId, shapeName: string, selectedSize: string, price: number) => void;
}

export default function ShapeShowcase({ onSelectShape, onAddBulkToCart }: ShapeShowcaseProps) {
  const [catalogShapes, setCatalogShapes] = useState<any[]>([]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<{ [shapeId: string]: number }>({});

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
  
  // Use BASE_SHAPES order directly to strictly enforce: 1st Rectangle, 2nd Round, 3rd Square, 4th Heart, 5th Polaroid...
  const visibleCatalogShapes = BASE_SHAPES.map((baseShape) => {
    const dbShape = catalogShapes.find((p) => p.id === baseShape.id);
    return {
      ...baseShape,
      ...(dbShape || {}),
      price: dbShape?.price || baseShape.price,
      originalPrice: dbShape?.originalPrice || baseShape.originalPrice,
      sizeOptions: baseShape.sizeOptions || []
    };
  });

  const shapeSampleImages: { [key in MagnetShapeId]?: string } = {
    arch: '/images/shape_arch_magnet_1779653475722.png',
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
    <section id="shapes-showcase" className="select-none py-16 sm:py-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase font-semibold">
            DISTINCTIVE ACRYLIC SHAPES
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-[#111111] tracking-tight">
            Curate Your Wall in <span className="italic font-serif font-medium">Distinctive Shapes</span>
          </h2>
          <div className="w-12 h-[1px] bg-neutral-400 mx-auto my-3"></div>
        </div>

        {/* Shapes Grid Layout - Compact & Ultra Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {visibleCatalogShapes.map((shape: any) => {
            const baseShape = baseShapeLookup.get(shape.id) || shape;
            const sampleImage = shapeSampleImages[shape.id as MagnetShapeId] || shapeSampleImages.arch;
            const displayName = shape.name || baseShape.name;
            const sizeOptions = shape.sizeOptions && shape.sizeOptions.length > 0 ? shape.sizeOptions : baseShape.sizeOptions || [];
            
            const activeIdx = selectedSizeIndex[shape.id] ?? 0;
            const activeSizeOpt = sizeOptions[activeIdx] || { label: shape.dimensions || baseShape.dimensions, price: shape.price || baseShape.price, originalPrice: shape.originalPrice || baseShape.originalPrice };

            const displayPrice = activeSizeOpt.price;
            const displayOriginalPrice = activeSizeOpt.originalPrice || (displayPrice > 0 ? Math.round(displayPrice * 1.5) : 0);

            return (
              <div
                key={shape.id}
                className="group bg-white rounded-3xl p-4 border border-neutral-200/80 transition-all duration-300 hover:shadow-xl hover:border-neutral-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Floating Magnet Preview Container */}
                  <div className="relative w-full aspect-[4/3] bg-[#FAF8F5] rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-3 border border-neutral-100">
                    <div className={`relative ${shape.frameRatio || 'aspect-[4/5]'} w-[70%] max-w-[130px] select-none group-hover:scale-105 transition-all duration-300`}>
                      <div className={`w-full h-full bg-white p-1 shadow-md ring-1 ring-black/5 overflow-hidden relative ${
                        shape.id === 'arch' ? 'shape-arch' :
                        shape.id === 'circle' ? 'rounded-full' :
                        shape.id === 'polaroid' ? 'shape-polaroid bg-white pb-4 pt-1 px-1 shadow-sm' :
                        shape.id === 'love' ? 'shape-heart text-clip' :
                        shape.id === 'filmstrip' ? 'bg-zinc-950 p-[2px] rounded' :
                        shape.id === 'scalloped-stand' ? 'shape-scalloped border-2 border-[#8B0000] p-1' :
                        shape.id === 'hexagon' ? 'shape-hexagon' :
                        shape.id === 'oval' ? 'shape-oval' : 'rounded-2xl'
                      }`}>
                        
                        <div className="w-full h-full overflow-hidden rounded-xs relative">
                          {shape.id === 'filmstrip' ? (
                            <div className="grid grid-rows-3 h-full gap-0.5 p-[1px]">
                              <div className="bg-zinc-800 rounded-xs overflow-hidden"><img src={sampleImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
                              <div className="bg-zinc-800 rounded-xs overflow-hidden"><img src="/images/couple_portrait_sample_1782458143228.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
                              <div className="bg-zinc-800 rounded-xs overflow-hidden"><img src="/images/scenic_landscape_sample_1782458156606.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
                            </div>
                          ) : (
                            <img
                              src={sampleImage}
                              alt={displayName}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                          )}

                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-40 mix-blend-overlay shine-effect pointer-events-none" />
                        </div>

                        {shape.id === 'polaroid' && (
                          <div className="absolute bottom-1 left-0 w-full text-center text-[6px] font-serif italic text-stone-500">
                            Paris Sunshine
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Price Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-serif text-base font-bold text-[#111111] group-hover:text-[#6B1D2F] transition-colors leading-snug">
                        {displayName}
                      </h3>
                      <div className="flex items-baseline gap-1 shrink-0 font-mono">
                        {displayOriginalPrice > 0 && displayOriginalPrice > displayPrice && (
                          <span className="text-[10px] text-neutral-400 line-through">
                            ₹{displayOriginalPrice}
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-[#111111] bg-neutral-100 px-2 py-0.5 rounded-full">
                          ₹{displayPrice} <span className="text-[8px] font-normal text-neutral-500">/ pc</span>
                        </span>
                      </div>
                    </div>

                    <p className="font-sans text-xs text-[#666666] leading-relaxed line-clamp-2 font-light">
                      {shape.description || baseShape.description}
                    </p>

                    {/* Interactive Multi-Size Selector Pills */}
                    {sizeOptions.length > 0 && (
                      <div className="pt-2.5 border-t border-neutral-100">
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 font-bold uppercase mb-1.5">
                          <span>Available Sizes:</span>
                          <span className="text-neutral-700">{sizeOptions.length} Sizes</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                          {sizeOptions.map((opt: any, idx: number) => {
                            const isSelected = activeIdx === idx;
                            return (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => setSelectedSizeIndex({ ...selectedSizeIndex, [shape.id]: idx })}
                                className={`px-2.5 py-1 rounded-lg transition-all font-bold cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#111111] text-white shadow-xs scale-105'
                                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200/80'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons: 1-pc Photo Customizer vs 5-pc Bulk Order */}
                <div className="mt-4 space-y-1.5">
                  <button
                    onClick={() => onSelectShape(shape.id, activeSizeOpt.label, activeSizeOpt.price)}
                    className="w-full cursor-pointer bg-[#111111] hover:bg-black text-white transition-all py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                  >
                    <span>🎨 Customize Photo ({activeSizeOpt.label})</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onAddBulkToCart) {
                        onAddBulkToCart(shape.id, displayName, activeSizeOpt.label, activeSizeOpt.price);
                      }
                    }}
                    className="w-full cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 transition-all py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1"
                  >
                    <span>📦 Quick Bulk Order (5 Pcs)</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
