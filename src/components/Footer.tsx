import React from 'react';
import BrandLogo from './BrandLogo';

interface FooterProps {
  onOpenAdmin?: () => void;
  onOpenPolicies?: () => void;
  onOpenTracking?: () => void;
  onOpenBlog?: () => void;
  onOpenB2B?: () => void;
}

export default function Footer({ onOpenAdmin, onOpenPolicies, onOpenTracking, onOpenB2B }: FooterProps) {
  return (
    <footer className="hidden md:block border-t border-neutral-200 mt-10 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={22} color="#111111" />
          <span className="font-serif text-lg">KRIA</span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500">
          <button type="button" onClick={onOpenTracking}>Track order</button>
          <button type="button" onClick={onOpenPolicies}>Policies</button>
          <button type="button" onClick={onOpenB2B}>Wholesale</button>
          <a href="https://wa.me/919392576792" target="_blank" rel="noreferrer">WhatsApp</a>
          {onOpenAdmin && (
            <button type="button" onClick={onOpenAdmin} className="text-neutral-400">Staff</button>
          )}
        </div>
      </div>
    </footer>
  );
}
