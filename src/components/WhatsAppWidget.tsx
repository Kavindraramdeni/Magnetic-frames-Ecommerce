import React, { useState } from 'react';
import { MessageSquare, X, Send, Truck, Sparkles, Gift, HelpCircle, CheckCircle2 } from 'lucide-react';

interface WhatsAppWidgetProps {
  onOpenBulkModal?: () => void;
  onOpenTracking?: () => void;
}

export default function WhatsAppWidget({ onOpenBulkModal, onOpenTracking }: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const phone = '917893922754';

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    const text = encodeURIComponent(`Hi KRIA Studio! ${userQuery}`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    setUserQuery('');
    setIsOpen(false);
  };

  const handleQuickAction = (message: string) => {
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120] font-sans">
      {/* Floating Trigger Badge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open WhatsApp Support Chat"
        >
          <div className="relative">
            <MessageSquare className="h-6 w-6 text-white fill-white" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full flex items-center justify-center">
              <span className="h-2 w-2 bg-emerald-700 rounded-full animate-ping" />
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-xs font-bold uppercase tracking-wider">
            WhatsApp Support
          </span>
        </button>
      )}

      {/* Expanded Chat Popup Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300 text-left">
          
          {/* Header */}
          <div className="bg-[#111111] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                  <MessageSquare className="h-5 w-5 fill-white text-white" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-400 border-2 border-neutral-900 rounded-full" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-1.5">
                  <span>KRIA Studio Assistant</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                </h4>
                <p className="text-[10px] font-mono text-neutral-400">Replies typically in under 5 minutes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-[#FAF8F5] space-y-3 text-xs">
            {/* Bot Message Bubble */}
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border border-neutral-200/80 shadow-2xs space-y-1.5">
              <p className="font-serif text-neutral-900 font-medium leading-relaxed">
                Namaste! 🙏 How can our studio team assist you with your personalized acrylic magnets today?
              </p>
              <p className="text-[9px] font-mono text-neutral-400 text-right">Instant Bot Helper</p>
            </div>

            {/* Quick Action Pills */}
            <div className="space-y-2 pt-1 font-mono text-[11px]">
              <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider">Quick Actions:</p>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenTracking) onOpenTracking();
                }}
                className="w-full bg-white hover:bg-neutral-100 text-neutral-800 p-2.5 rounded-xl border border-neutral-200 font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <Truck className="h-4 w-4 text-blue-600" />
                <span>🚚 Track My Shipment Status</span>
              </button>

              <button
                onClick={() => handleQuickAction("Hi KRIA Studio! I need help creating my custom photo magnet design.")}
                className="w-full bg-white hover:bg-neutral-100 text-neutral-800 p-2.5 rounded-xl border border-neutral-200 font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>✨ Custom Design & Photo Help</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenBulkModal) onOpenBulkModal();
                }}
                className="w-full bg-white hover:bg-neutral-100 text-neutral-800 p-2.5 rounded-xl border border-neutral-200 font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <Gift className="h-4 w-4 text-[#6B1D2F]" />
                <span>🎁 Wedding & Corporate Bulk Order (100+)</span>
              </button>
            </div>
          </div>

          {/* Direct Custom Input Form */}
          <form onSubmit={handleSendCustomMessage} className="p-3 bg-white border-t border-neutral-200 flex gap-2">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-sans text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-2 rounded-xl flex items-center justify-center cursor-pointer transition shadow-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
