import React from 'react';
import { BASE_SHAPES } from '../data';
import { MagnetShapeId } from '../types';
import { Sparkles, Check } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface ShapeShowcaseProps {
  onSelectShape: (id: MagnetShapeId) => void;
}

export default function ShapeShowcase({ onSelectShape }: ShapeShowcaseProps) {
  
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
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {BASE_SHAPES.map((shape) => {
            const sampleImage = shapeSampleImages[shape.id];
            
            return (
              <div
                key={shape.id}
                className="group bg-white rounded-2xl p-3 sm:p-4 border border-neutral-200/60 transition-all duration-300 hover:shadow-lg hover:border-neutral-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                {/* Image Container with Custom Stencils */}
                <div>
                  <div className="relative w-full aspect-[4/3] bg-neutral-100/80 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-2">
                    
                    {/* Background Subtle Room Blur */}
                    <div className="absolute inset-0 bg-neutral-200/30" />

                    {/* Styled Floating Magnet Preview */}
                    <div className={`relative ${shape.frameRatio} w-[70%] sm:w-[60%] max-w-[120px] select-none group-hover:scale-105 transition-all duration-300`}>
                      <div className={`w-full h-full bg-[#FAF8F5] p-1 shadow-sm sm:shadow-md ring-1 ring-white/40 overflow-hidden relative ${
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
                        
                        {/* Acrylic border shimmer wrapper */}
                        <div className="w-full h-full overflow-hidden rounded-xs sm:rounded-sm relative">
                          {shape.id === 'filmstrip' ? (
                            // Strip layout
                            <div className="grid grid-rows-3 h-full gap-0.5 p-[1px]">
                              <div className="bg-zinc-800 rounded-xs overflow-hidden"><img src={sampleImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
                              <div className="bg-zinc-800 rounded-xs overflow-hidden"><img src="/images/couple_portrait_sample_1782458143228.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
                              <div className="bg-zinc-800 rounded-xs overflow-hidden"><img src="/images/scenic_landscape_sample_1782458156606.jpg" className="w-full h-full object-cover" referrerPolicy="no-referrer" /></div>
                            </div>
                          ) : (
                            <img
                              src={sampleImage}
                              alt={shape.name}
                              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110`}
                              referrerPolicy="no-referrer"
                            />
                          )}

                          {/* Gloss Acrylic Overlay Shine */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-40 mix-blend-overlay shine-effect pointer-events-none" />
                        </div>

                        {/* Polaroid text placeholder */}
                        {shape.id === 'polaroid' && (
                          <div className="absolute bottom-0.5 left-0 w-full text-center text-[5px] sm:text-[6px] font-serif italic text-stone-500">
                            Paris Sunshine
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                    {/* Pricing and Details */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 overflow-hidden">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#888888] truncate">
                          {shape.tagline}
                        </span>
                        {(shape.isTrending || shape.id === 'polaroid' || shape.id === 'arch') && (
                          <span className="bg-amber-100 text-amber-900 font-mono text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-widest shrink-0">
                            🔥 TRENDING
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {shape.originalPrice && shape.originalPrice > shape.price && (
                          <span className="font-mono text-[10px] text-neutral-400 line-through">
                            ₹{shape.originalPrice}
                          </span>
                        )}
                        <span className="font-mono text-[10px] sm:text-xs font-bold text-[#111111] bg-neutral-100 px-2 py-0.5 rounded-full">
                          ₹{shape.price}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-serif text-sm sm:text-base font-semibold text-[#111111] group-hover:text-amber-800 transition-colors leading-snug">
                      {shape.name}
                    </h3>
                    
                    <p className="font-sans text-[11px] text-[#666666] leading-snug line-clamp-2">
                      {shape.description}
                    </p>

                    <div className="font-mono text-[9px] text-neutral-400">
                      SIZE: {shape.dimensions}
                    </div>
                  </div>
                </div>

                {/* Order Now Trigger Button */}
                <button
                  onClick={() => onSelectShape(shape.id)}
                  className="mt-3 w-full cursor-pointer bg-neutral-100/80 hover:bg-[#111111] text-[#111111] hover:text-white transition-all py-2 rounded-xl text-[10px] sm:text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1 group-hover:bg-[#111111] group-hover:text-white"
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
