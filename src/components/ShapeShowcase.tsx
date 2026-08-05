import React, { useEffect, useState } from 'react';
import { BASE_SHAPES } from '../data';
import { MagnetShapeId } from '../types';
import { Sparkles, Check, Flame } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface ShapeShowcaseProps {
  onSelectShape: (id: MagnetShapeId) => void;
}

export default function ShapeShowcase({ onSelectShape }: ShapeShowcaseProps) {
  const [catalogShapes, setCatalogShapes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  // Filter shapes by category
  const filteredShapes = visibleCatalogShapes.filter((shape: any) => {
    if (activeCategory === 'popular') return shape.id === 'arch' || shape.id === 'love' || shape.id === 'polaroid';
    if (activeCategory === 'classic') return shape.id === 'landscape' || shape.id === 'oval' || shape.id === 'grande';
    if (activeCategory === 'specialty') return shape.id === 'filmstrip' || shape.id === 'hexagon' || shape.id === 'scalloped-stand' || shape.id === 'circle';
    return true;
  });

  const shapeSampleImages: { [key in MagnetShapeId]: string } = {
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
    <section id="shapes-showcase" className="select-none py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase font-semibold">
            DISTINCTIVE ACRYLIC SHAPES
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#111111] tracking-tight">
            Curate Your Wall in <span className="italic font-serif font-medium">Distinctive Shapes</span>
          </h2>
          <div className="w-12 h-[1px] bg-neutral-400 mx-auto my-2"></div>
        </div>

        {/* Category Filter Chips - Quick Mobile Tap Navigation */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap font-mono text-[10px] sm:text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-full font-bold uppercase transition cursor-pointer ${
              activeCategory === 'all' ? 'bg-neutral-900 text-white shadow-sm' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            All Shapes ({visibleCatalogShapes.length})
          </button>
          <button
            onClick={() => setActiveCategory('popular')}
            className={`px-3.5 py-1.5 rounded-full font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
              activeCategory === 'popular' ? 'bg-amber-900 text-white shadow-sm' : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span>Best Sellers</span>
          </button>
          <button
            onClick={() => setActiveCategory('classic')}
            className={`px-3.5 py-1.5 rounded-full font-bold uppercase transition cursor-pointer ${
              activeCategory === 'classic' ? 'bg-neutral-900 text-white shadow-sm' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            Classics & Frames
          </button>
          <button
            onClick={() => setActiveCategory('specialty')}
            className={`px-3.5 py-1.5 rounded-full font-bold uppercase transition cursor-pointer ${
              activeCategory === 'specialty' ? 'bg-neutral-900 text-white shadow-sm' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            Specialty Cuts
          </button>
        </div>

        {/* Shapes Grid Layout - Compact 2-Column Mobile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
          {filteredShapes.map((shape: any) => {
            const baseShape = baseShapeLookup.get(shape.id) || BASE_SHAPES.find((item) => item.id === shape.id);
            const sampleImage = shapeSampleImages[shape.id as MagnetShapeId] || shapeSampleImages[baseShape?.id as MagnetShapeId] || shapeSampleImages.arch;
            const displayName = shape.name || baseShape?.name || 'Custom Frame';
            const displayPrice = Number(shape.price ?? baseShape?.price ?? 0);
            const displayOriginalPrice = Number(shape.originalPrice ?? baseShape?.originalPrice ?? 0);
            const displayDimensions = shape.dimensions || baseShape?.dimensions || 'Standard';
            const isTrending = Boolean(shape.isTrending ?? true);
            
            return (
              <div
                key={shape.id}
                className="group bg-white rounded-2xl p-2.5 sm:p-4 border border-neutral-200/80 transition-all duration-300 hover:shadow-lg hover:border-neutral-300 flex flex-col justify-between"
              >
                {/* Image Preview Container */}
                <div>
                  <div className="relative w-full aspect-[4/3] bg-[#FAF8F5] rounded-xl overflow-hidden mb-2 flex items-center justify-center p-1.5 border border-neutral-100">
                    <div className={`relative ${shape.frameRatio || baseShape?.frameRatio || 'aspect-[4/5]'} w-[75%] sm:w-[65%] max-w-[110px] select-none group-hover:scale-105 transition-all duration-300`}>
                      <div className={`w-full h-full bg-white p-1 shadow-xs ring-1 ring-black/5 overflow-hidden relative ${
                        shape.id === 'arch' ? 'shape-arch' :
                        shape.id === 'circle' ? 'rounded-full' :
                        shape.id === 'polaroid' ? 'shape-polaroid bg-white pb-3 pt-1 px-1' :
                        shape.id === 'love' ? 'shape-heart' :
                        shape.id === 'filmstrip' ? 'bg-zinc-950 p-[2px] rounded' :
                        shape.id === 'scalloped-stand' ? 'shape-scalloped border-2 border-[#8B0000] p-1' :
                        shape.id === 'hexagon' ? 'shape-hexagon' :
                        shape.id === 'oval' ? 'shape-oval' : 'rounded-xl'
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
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-40 mix-blend-overlay pointer-events-none" />
                        </div>

                        {shape.id === 'polaroid' && (
                          <div className="absolute bottom-0.5 left-0 w-full text-center text-[5px] font-serif italic text-stone-500">
                            Paris Sunshine
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Compact Details */}
                  <div className="space-y-1 text-left">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-serif text-xs sm:text-base font-bold text-[#111111] leading-tight truncate">
                        {displayName}
                      </h3>
                      <span className="font-mono text-[10px] sm:text-xs font-bold text-[#111111] bg-neutral-100 px-1.5 py-0.5 rounded-md shrink-0">
                        ₹{displayPrice}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
                      <span>SIZE: {displayDimensions}</span>
                      {(isTrending || shape.id === 'polaroid' || shape.id === 'arch') && (
                        <span className="text-amber-800 font-bold">🔥 POPULAR</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compact Order Trigger Button */}
                <button
                  onClick={() => onSelectShape(shape.id)}
                  className="mt-2.5 w-full cursor-pointer bg-neutral-900 hover:bg-black text-white transition-all py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95"
                >
                  Order Now
                </button>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
