import React from 'react';
import { X, Gift, Building2, Heart, Award, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';

interface BulkCorporateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkCorporateModal({ isOpen, onClose }: BulkCorporateModalProps) {
  if (!isOpen) return null;

  const handleWhatsAppRedirect = (useCase: string) => {
    const text = encodeURIComponent(
      `Hi KRIA Studio! 👋 I am interested in a Bulk / Corporate / Wholesale Order (100+ Pcs) for: ${useCase}. Please share your wholesale rate card and custom design catalog!`
    );
    window.open(`https://wa.me/919392576792?text=${text}`, '_blank');
  };

  const useCases = [
    {
      title: "Corporate Gifting",
      subtitle: "Employee Onboarding & Client Appreciation",
      icon: Building2,
      badge: "100+ Pcs Wholesale",
      query: "Corporate Gifts & Brand Merchandise"
    },
    {
      title: "Wedding Return Gifts",
      subtitle: "Personalized Keepsakes for Guests",
      icon: Heart,
      badge: "Luxury Custom Packaging",
      query: "Wedding Return Gifts & Ceremonies"
    },
    {
      title: "Wholesale & Reseller",
      subtitle: "Retailers, Event Planners & Boutiques",
      icon: Gift,
      badge: "Tiered Volume Discounts",
      query: "Wholesale Distribution & Retail"
    },
    {
      title: "Manufacturing Partner",
      subtitle: "Custom Acrylic OEM & White-Label Printing",
      icon: Award,
      badge: "Factory Direct Rates",
      query: "Manufacturing & OEM White-Labeling"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl border border-neutral-200 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header Banner */}
        <div className="bg-[#111111] text-white p-6 md:p-8 relative border-b border-neutral-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#E8DCCF] font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              BULK, WHOLESALE & CORPORATE INQUIRIES
            </span>
            <h2 className="font-serif text-3xl font-light text-white tracking-wide">
              Corporate Orders & <span className="italic font-serif font-bold text-[#E8DCCF]">Wedding Gifts</span>
            </h2>
            <p className="font-sans text-xs text-neutral-300 leading-relaxed font-light">
              Need 100+ custom acrylic photo magnets? Get factory-direct bulk pricing, custom branding, and luxury box packaging.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 bg-[#FAF8F5]">
          
          <div className="grid md:grid-cols-2 gap-4">
            {useCases.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={idx}
                  onClick={() => handleWhatsAppRedirect(item.query)}
                  className="bg-white border border-neutral-200 hover:border-neutral-900 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-[#E8DCCF] rounded-xl text-neutral-800 transition-colors">
                        <IconComp className="h-5 w-5 stroke-[1.5]" />
                      </div>
                      <span className="text-[9px] font-mono uppercase font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-neutral-900 group-hover:text-[#6B1D2F] transition-colors">
                      {item.title}
                    </h4>
                    <p className="font-sans text-xs text-neutral-500 font-light leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-mono font-bold text-emerald-700">
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                      Get WhatsApp Quote
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Direct CTA Box */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-serif text-lg font-bold text-[#E8DCCF]">Have a custom bulk requirement?</h4>
              <p className="text-xs text-neutral-300 font-light">Chat directly with our Hyderabad factory operations team on WhatsApp.</p>
            </div>
            <button
              onClick={() => handleWhatsAppRedirect("Custom Bulk Order (100+ Pcs)")}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center gap-2 whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4 fill-neutral-950" />
              Chat on WhatsApp Now
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
