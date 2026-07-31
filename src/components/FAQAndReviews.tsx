import React, { useState } from 'react';
import { FAQS } from '../data';
import { HelpCircle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQAndReviews() {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  return (
    <section id="faqs" className="select-none py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* FAQs Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* FAQ Column Left (Headings, specifications panel) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono tracking-widest text-[#666666] font-bold uppercase block">
              DETAILED TECHNICAL SPECS & SUPPORT
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#111111] tracking-tight leading-tight">
              Have Questions? <br />
              Let’s <span className="italic font-serif font-medium">Clear Them Out</span>
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#666666] font-light leading-relaxed">
              We focus on premium, high-quality production. Browse our common questions below or tap our constant sticky bottom WhatsApp helpline at any time to talk directly with an artisan.
            </p>
          </div>

          {/* FAQ Column Right (Dropdown toggler list) */}
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
