import React, { useEffect, useState } from 'react';
import { FAQS } from '../data';
import { HelpCircle, MessageSquare, ChevronDown, ChevronUp, Star, Plus, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface ReviewItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  createdAt?: string;
}

export default function FAQAndReviews() {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // New Review Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setPhotoUrl(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location: location || 'India', rating, comment, photoUrl })
      });
      if (res.ok) {
        setSubmitSuccess(true);
        fetchReviews();
        setTimeout(() => {
          setIsWriteReviewOpen(false);
          setSubmitSuccess(false);
          setName('');
          setLocation('');
          setComment('');
          setPhotoUrl('');
        }, 1800);
      }
    } catch (err) {
      console.error('Review submit failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="faqs" className="select-none py-16 sm:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION 1: CUSTOMER PHOTO REVIEWS */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <span className="text-xs font-mono tracking-widest text-emerald-800 font-bold uppercase block mb-1">
                VERIFIED BUYER REVIEWS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#111111] tracking-tight">
                Loved by <span className="italic font-serif font-medium text-[#6B1D2F]">Artisan Collectors</span>
              </h2>
            </div>
            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="bg-neutral-900 hover:bg-black text-white text-xs font-mono uppercase tracking-wider font-bold px-5 py-3 rounded-full flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div 
                key={rev.id}
                className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-400 transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif font-bold text-neutral-900 text-base">{rev.name}</h4>
                      <p className="font-mono text-[10px] text-neutral-400 uppercase">{rev.location}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="font-sans text-xs text-neutral-700 leading-relaxed font-light italic">
                    "{rev.comment}"
                  </p>
                </div>

                {rev.photoUrl && (
                  <div className="pt-3 border-t border-neutral-100 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      <img src={rev.photoUrl} alt="Review Customer Photo" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified Photo Review
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* WRITE REVIEW MODAL */}
        {isWriteReviewOpen && (
          <div className="fixed inset-0 z-[150] bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md border border-neutral-200 shadow-2xl p-6 space-y-5 text-left animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-start border-b border-neutral-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Share Your Experience</span>
                  <h3 className="font-serif text-xl font-bold text-neutral-900">Write a Review</h3>
                </div>
                <button onClick={() => setIsWriteReviewOpen(false)} className="p-1 text-neutral-400 hover:text-black">✕</button>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-neutral-900">Thank You!</h4>
                  <p className="text-xs text-neutral-500">Your review has been published successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-600 block mb-1">Your Name</label>
                      <input 
                        type="text" 
                        required 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="E.g., Priya Verma" 
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-600 block mb-1">City / Location</label>
                      <input 
                        type="text" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        placeholder="E.g., Hyderabad, TS" 
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-600 block mb-1">Rating</label>
                    <div className="flex gap-1 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          onClick={() => setRating(star)} 
                          className={`h-6 w-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-600 block mb-1">Review Comment</label>
                    <textarea 
                      required 
                      rows={3} 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)} 
                      placeholder="How did your custom acrylic magnets turn out?" 
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-neutral-600 block mb-1">Attach Photo (Optional)</label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-neutral-600" />
                        <span>Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      {photoUrl && <span className="text-[10px] font-mono text-emerald-700 font-bold">✓ Attached</span>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider py-3 rounded-xl cursor-pointer"
                  >
                    {isSubmitting ? 'Publishing...' : 'Submit Review'}
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

        {/* SECTION 2: FAQS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-8 border-t border-neutral-200">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono tracking-widest text-[#666666] font-bold uppercase block">
              SPECS & SUPPORT
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#111111] tracking-tight leading-tight">
              Frequently Asked <span className="italic font-serif font-medium">Questions</span>
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#666666] font-light leading-relaxed">
              We focus on premium, high-quality production. Browse our common questions or chat with our team on WhatsApp.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none hover:bg-neutral-50 cursor-pointer"
                  >
                    <span className="font-serif font-bold text-sm sm:text-base text-[#111111]">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-neutral-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 border-t border-neutral-100 animate-in fade-in duration-200">
                      <p className="font-sans text-xs sm:text-sm text-[#666666] leading-relaxed font-light">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
