import React, { useState } from 'react';
import { Sparkles, Calendar, User, ArrowRight, BookOpen, Gift, Heart, ShieldCheck } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  summary: string;
  content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'wedding-return-gifts-india-2026',
    title: 'Top 10 Personalized Return Gift Ideas for Indian Weddings & Anniversaries (2026 Guide)',
    category: 'Wedding & Gifting Guide',
    readTime: '4 min read',
    date: 'August 2026',
    author: 'KRIA Studio Artisans',
    image: '/images/couple_portrait_sample_1782458143228.jpg',
    summary: 'Discover why custom acrylic photo magnets are replacing generic sweets and traditional return gifts for modern Indian weddings and luxury anniversaries.',
    content: [
      'Indian weddings are grand celebrations of love, family, and timeless memories. But for years, hosts have struggled with finding return gifts that guests actually keep rather than discard.',
      'Enter KRIA Studio Custom Acrylic Photo Magnets: hand-crafted 3mm thick, glass-cut acrylic keepsakes that stick onto any refrigerator or metallic surface.',
      'Why Guests Love Them:',
      '• Highly Personal: Custom photo cutouts of the couple or family memories.',
      '• Ultra Durable: Waterproof, scratch-resistant UV inks with lifetime magnetic hold.',
      '• Luxury Gold Packaging: Arrives in hand-wrapped burgundy velvet gift boxes with custom handwritten foil cards.',
      'Whether you are planning a 100-guest intimate wedding or a 1000-guest royal reception, custom acrylic magnets offer high emotional value at affordable bulk prices.'
    ]
  },
  {
    id: 'acrylic-magnet-home-decor-trend',
    title: 'Why Custom Acrylic Fridge Magnets Are the #1 Minimalist Home Decor Trend',
    category: 'Home Decor & Design',
    readTime: '3 min read',
    date: 'July 2026',
    author: 'KRIA Studio Artisans',
    image: '/images/scenic_landscape_sample_1782458156606.jpg',
    summary: 'Move over cheap plastic fridge souvenirs! Learn how polished acrylic arch, polaroid, and heart shapes turn ordinary kitchens into fine art galleries.',
    content: [
      'The modern kitchen is no longer just a place for cooking — it is the centerpiece of the home. Flat, cheap tourist magnets often clutter the fridge and peel over time.',
      'Polished 3mm acrylic magnets bring a sleek, museum-grade aesthetic to your living space.',
      'Key Aesthetic Features:',
      '• 3D Glossy Acrylic Depth: Light refractor edges that glow under kitchen lights.',
      '• 13 Unique Shapes: From Vintage Arch and Retro Polaroid to Custom Silhouette Contours.',
      '• Neodymium Magnetic Strength: Holds up to 5 sheets of heavy cardstock without sliding.',
      'Transform your favorite travel memories and family portraits into timeless acrylic art pieces today!'
    ]
  },
  {
    id: 'anniversary-gift-ideas-couples',
    title: '5 Unique Anniversary Surprise Gift Ideas for Couples That Will Make Them Smile',
    category: 'Gifting Ideas',
    readTime: '5 min read',
    date: 'August 2026',
    author: 'KRIA Studio Artisans',
    image: '/images/shape_heart_magnet_1780939430998.png',
    summary: 'Stuck looking for a meaningful 1st, 5th, or 10th-anniversary gift? Here are 5 thoughtful, personalized gift ideas that stand out from flowers and chocolates.',
    content: [
      'Finding the perfect anniversary gift can feel overwhelming. Flowers fade and chocolates vanish in days — but personalized memory magnets last a lifetime.',
      '1. The Polaroid Memory Set: 4 custom acrylic polaroids with your wedding date and song lyrics engraved.',
      '2. The Custom Silhouette Cutout: Hand-contoured acrylic outline of your favorite vacation photo.',
      '3. The Arch Travel Wall: A collection of 6 arch magnets capturing every major trip taken together.',
      '4. Handwritten Foil Gift Box: Pair your custom magnets with a handwritten gold-foil message card.',
      'Make your partner feel cherished with a custom keepsake made specifically for them!'
    ]
  }
];

export default function BlogSection() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="py-20 bg-[#FAF8F5] text-neutral-900 border-t border-neutral-200 select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-neutral-200 pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 font-bold block mb-1">
              SEO GIFTING & DESIGN GUIDES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-[#111111]">
              The KRIA <span className="italic font-serif font-medium text-[#6B1D2F]">Journal & Style Guides</span>
            </h2>
          </div>
          <p className="text-xs font-mono text-neutral-500 max-w-sm text-left">
            Inspiration for personalized gifting, home interior trends, and wedding return gift ideas.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {BLOG_POSTS.map((post) => (
            <article 
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Image */}
                <div className="h-48 w-full bg-neutral-100 overflow-hidden relative">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 bg-neutral-900/90 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-xs">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-2">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-neutral-900 group-hover:text-[#6B1D2F] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="font-sans text-xs text-neutral-600 font-light leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 group-hover:translate-x-1 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#6B1D2F]" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Read Article Full Modal */}
        {selectedPost && (
          <div className="fixed inset-0 z-[160] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl border border-neutral-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left animate-in zoom-in-95 duration-200">
              
              <div className="bg-neutral-900 text-white p-5 flex justify-between items-center shrink-0">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#E8DCCF] font-bold">{selectedPost.category}</span>
                  <h4 className="font-serif text-lg font-bold text-white line-clamp-1">{selectedPost.title}</h4>
                </div>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 font-sans text-neutral-800">
                <div className="h-56 w-full rounded-2xl overflow-hidden bg-neutral-100">
                  <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-4 leading-relaxed font-light text-sm sm:text-base text-neutral-700">
                  {selectedPost.content.map((paragraph, idx) => (
                    <p key={idx} className={paragraph.startsWith('•') || paragraph.startsWith('1.') ? 'font-medium text-neutral-900 pl-2' : ''}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="pt-6 border-t border-neutral-200 flex justify-between items-center text-xs font-mono text-neutral-500">
                  <span>Author: {selectedPost.author}</span>
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="px-5 py-2 bg-neutral-900 text-white font-bold rounded-xl uppercase font-mono cursor-pointer"
                  >
                    Close Article
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
