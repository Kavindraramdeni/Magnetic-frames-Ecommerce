import React, { useState, useRef } from 'react';
import Header from './components/Header';
import TopMarquee from './components/TopMarquee';
import Hero from './components/Hero';
import ShapeShowcase from './components/ShapeShowcase';
import LifestyleGallery from './components/LifestyleGallery';
import Customizer from './components/Customizer';
import FAQAndReviews from './components/FAQAndReviews';
import Footer from './components/Footer';
import StyleCarousel from './components/StyleCarousel';
import SectionWrapper from './components/SectionWrapper';
import AdminDashboard from './components/AdminDashboard';
import CartDrawer from './components/CartDrawer';
import { MagnetShapeId, CartItem } from './types';
import { BASE_SHAPES } from './data';
import { MessageSquare, Sparkles, ShoppingBag } from 'lucide-react';


function OrderTrackingView({ onBackToHome }: { onBackToHome: () => void }) {
  const [orderId, setOrderId] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, emailOrPhone })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to find your order.');
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to track order.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white border border-neutral-200 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8">
        <button onClick={onBackToHome} className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-black">← Back to Home</button>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B09A84] font-bold">Order Tracking</p>
          <h1 className="font-serif text-4xl mt-2">Track your KRIA order</h1>
          <p className="mt-3 text-sm text-neutral-500">Enter your order ID plus the email or phone used at checkout.</p>
        </div>
        <form onSubmit={handleTrack} className="grid gap-4">
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} required placeholder="KRIA-ORD-1234" className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-neutral-900" />
          <input value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} required placeholder="Email or phone" className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-neutral-900" />
          <button disabled={isLoading} className="rounded-xl bg-neutral-900 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60">{isLoading ? 'Checking...' : 'Track Order'}</button>
        </form>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {result && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 text-sm space-y-3">
            <div className="flex justify-between gap-4"><span className="text-neutral-500">Status</span><strong>{result.status}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-neutral-500">Courier</span><strong>{result.courierName}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-neutral-500">AWB</span><strong>{result.trackingNumber}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-neutral-500">Estimate</span><strong>{result.deliveryEstimate}</strong></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // Navigation View state: 'home' is the main landing page, 'style-experience' is separate, 'admin' is the fulfillment cms
  const [currentView, setCurrentView] = useState<'home' | 'style-experience' | 'admin' | 'policies' | 'tracking'>('home');
  const [adminToken, setAdminToken] = useState<string>('');

  // Lifted cart state to share with Header and Customizer
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Customizer preloaded image and name carrying over from Immersive Style Experience
  const [customizerPhotoUrl, setCustomizerPhotoUrl] = useState<string | null>(null);
  const [customizerPhotoName, setCustomizerPhotoName] = useState<string | null>(null);
  const [customizerPhotoScale, setCustomizerPhotoScale] = useState<number>(1.0);
  const [customizerPhotoPanX, setCustomizerPhotoPanX] = useState<number>(0);
  const [customizerPhotoPanY, setCustomizerPhotoPanY] = useState<number>(0);

  // Navigation References for luxury smooth scroll
  const customizerRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Active shape state loaded directly in the customizer workspace when customized
  const [activeWorkspaceShape, setActiveWorkspaceShape] = useState<MagnetShapeId>('arch');

  const scrollToCustomizer = () => {
    customizerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToShapes = () => {
    shapesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // When user selects shape from collection card, redirect to style experience with that shape selected
  const handleSelectShapeToCustomize = (id: MagnetShapeId) => {
    setActiveWorkspaceShape(id);
    setCurrentView('style-experience');
  };

  // Transfer shape & photo from StyleCarousel to Customizer workspace
  const handleSelectAndCustomizeFromExperience = (shapeId: MagnetShapeId, photoUrl: string, photoName: string, scale: number, panX: number, panY: number) => {
    setActiveWorkspaceShape(shapeId);
    setCustomizerPhotoUrl(photoUrl);
    setCustomizerPhotoName(photoName);
    setCustomizerPhotoScale(scale);
    setCustomizerPhotoPanX(panX);
    setCustomizerPhotoPanY(panY);
    setCurrentView('home');
    
    // Smooth scroll down to customizer shortly after transitioning view back
    setTimeout(() => {
      scrollToCustomizer();
    }, 150);
  };

  // Directly add to tray and checkout from Style Experience
  const handleSelectAndAddDirectlyToTrayAndCheckout = (shapeId: MagnetShapeId, photoUrl: string, photoName: string, scale: number, panX: number, panY: number) => {
    const shapeObj = BASE_SHAPES.find(s => s.id === shapeId) || { name: 'Custom Frame', price: 399 };

    const uniqueId = `item-direct-${Date.now()}`;
    const newCartItem: CartItem = {
      id: uniqueId,
      shapeId,
      shapeName: shapeObj.name,
      quantity: 1,
      previewUrl: photoUrl,
      photoName: photoName || `${shapeObj.name} custom.jpg`,
      captionText: shapeId === 'polaroid' ? 'Sunny Moments' : '',
      photoScale: scale,
      photoPanX: panX,
      photoPanY: panY,
      price: shapeObj.price
    };

    setCart(prev => [...prev, newCartItem]);

    setActiveWorkspaceShape(shapeId);
    setCustomizerPhotoUrl(photoUrl);
    setCustomizerPhotoName(photoName);
    setCustomizerPhotoScale(scale);
    setCustomizerPhotoPanX(panX);
    setCustomizerPhotoPanY(panY);

    setIsCartOpen(true);
  };

  // If the user is on the separate immersive page
  if (currentView === 'style-experience') {
    return (
      <>
        <StyleCarousel 
          onBackToHome={() => setCurrentView('home')}
          onSelectAndCustomize={handleSelectAndCustomizeFromExperience}
          onAddDirectlyToTrayAndCheckout={handleSelectAndAddDirectlyToTrayAndCheckout}
          initialShapeId={activeWorkspaceShape}
        />
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setCurrentView('home');
            setIsCheckoutOpen(true);
            setTimeout(() => {
              scrollToCustomizer();
            }, 100);
          }}
        />
      </>
    );
  }



  if (currentView === 'tracking') {
    return <OrderTrackingView onBackToHome={() => setCurrentView('home')} />;
  }

  if (currentView === 'policies') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 px-4 py-10">
        <div className="max-w-4xl mx-auto bg-white border border-neutral-200 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8">
          <button onClick={() => setCurrentView('home')} className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-black">← Back to Home</button>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B09A84] font-bold">KRIA Studio Policies</p>
            <h1 className="font-serif text-4xl mt-2">Terms, Privacy, Shipping & Returns</h1>
          </div>
          <section className="space-y-3 text-sm leading-7 text-neutral-600">
            <h2 className="font-serif text-2xl text-neutral-900">Custom Order Terms</h2>
            <p>Every magnet is made to order from the image, crop, caption, quantity, and shape selected at checkout. Please verify previews and delivery coordinates before payment.</p>
            <h2 className="font-serif text-2xl text-neutral-900">Privacy & Photo Handling</h2>
            <p>Uploaded photos are stored only to manufacture and support your order. We do not sell customer photo assets. Production access should be limited to authorized staff.</p>
            <h2 className="font-serif text-2xl text-neutral-900">Shipping</h2>
            <p>Prepaid orders are routed through supported courier partners. Estimated delivery dates are not guarantees and may vary by pincode, courier capacity, or weather.</p>
            <h2 className="font-serif text-2xl text-neutral-900">Refunds & Replacements</h2>
            <p>Because products are personalized, cancellations after production starts are not guaranteed. Manufacturing defects or courier damage should be reported within 48 hours of delivery with photos.</p>
            <h2 className="font-serif text-2xl text-neutral-900">Contact</h2>
            <p>Email kriatechgroup@gmail.com or WhatsApp the KRIA Studio hotline for support, corrections, or business invoices.</p>
          </section>
        </div>
      </div>
    );
  }

  // If the staff is viewing the operations terminal
  if (currentView === 'admin') {
    return (
      <AdminDashboard 
        onBackToHome={() => setCurrentView('home')}
        adminToken={adminToken}
      />
    );
  }

  return (
    <div id="home-root" className="min-h-screen bg-[#FAF8F5] text-[#111111] font-sans antialiased overflow-x-hidden selection:bg-[#E8DCCF] selection:text-neutral-900">
      
      {/* Global CSS SVG ClipPath definitions for complex custom shapes */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0 overflow-hidden" aria-hidden="true">
        <defs>
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5, 0.25 C 0.35, 0.05, 0.05, 0.05, 0.05, 0.35 C 0.05, 0.65, 0.25, 0.85, 0.5, 1 C 0.75, 0.85, 0.95, 0.65, 0.95, 0.35 C 0.95, 0.05, 0.65, 0.05, 0.5, 0.25 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Top Announcement Marquee Strip */}
      <TopMarquee />

      {/* Header with anchors */}
      <Header 
        onScrollToCustomizer={scrollToCustomizer}
        onScrollToShapes={scrollToShapes}
        onScrollToGallery={scrollToGallery}
        cartItemsCount={cart.reduce((acc, x) => acc + x.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Hero Header Banner */}
      <SectionWrapper 
        backgroundImage="/images/Landingprofile.png"
        overlayColor="rgba(250, 248, 245, 0.4)"
      >
        <Hero 
          onScrollToCustomizer={scrollToCustomizer}
          onScrollToShapes={scrollToShapes}
          onOpenStyleExperience={() => setCurrentView('style-experience')}
        />
      </SectionWrapper>

      {/* Shapes Catalogue Index */}
      <div ref={shapesRef}>
        <SectionWrapper 
          backgroundImage="/images/luxury_living_room_bg_1782458094193.jpg"
          overlayColor="rgba(250, 248, 245, 0.85)"
        >
          <ShapeShowcase onSelectShape={handleSelectShapeToCustomize} />
        </SectionWrapper>
      </div>

      {/* Futuristic Interactive Live Customizer Workspace */}
      <div ref={customizerRef}>
        <SectionWrapper 
          backgroundImage="/images/clean_studio_bg_1782458110845.jpg"
          overlayColor="rgba(250, 248, 245, 0.88)"
        >
          <Customizer 
            initialShapeId={activeWorkspaceShape} 
            initialPhotoUrl={customizerPhotoUrl || undefined}
            initialPhotoName={customizerPhotoName || undefined}
            initialScale={customizerPhotoScale}
            initialPanX={customizerPhotoPanX}
            initialPanY={customizerPhotoPanY}
            cart={cart}
            setCart={setCart}
            isCheckoutOpen={isCheckoutOpen}
            setIsCheckoutOpen={setIsCheckoutOpen}
            onOpenCart={() => setIsCartOpen(true)}
          />
        </SectionWrapper>
      </div>

      {/* Real Placement Lifestyle Showcase Bento */}
      <div ref={galleryRef}>
        <SectionWrapper 
          backgroundImage="/images/lifestyle_gallery_workspace_1779653492345.png"
          overlayColor="rgba(250, 248, 245, 0.8)"
        >
          <LifestyleGallery />
        </SectionWrapper>
      </div>

      {/* Reviews, trust seals and FAQs dropdowns */}
      <SectionWrapper 
        backgroundImage="/images/soft_abstract_bg_1782458126047.jpg"
        overlayColor="rgba(25, 25, 25, 0.05)"
      >
        <FAQAndReviews />
      </SectionWrapper>

      {/* Minimal Footer */}
      <Footer onOpenAdmin={async () => {
        const password = window.prompt('Enter admin password');
        if (!password) return;
        const response = await fetch('/api/admin/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        if (!response.ok) {
          alert('Invalid admin password');
          return;
        }
        const data = await response.json();
        setAdminToken(data.token);
        setCurrentView('admin');
      }} onOpenPolicies={() => setCurrentView('policies')} onOpenTracking={() => setCurrentView('tracking')} />

      {/* FLOATING ACTION BUTTONS: Left Corner WhatsApp, Right Corner Cart */}
      <div className="fixed bottom-6 left-6 z-50">
        <a 
          href="https://wa.me/919392576792?text=Hi%20Kria%20Studio%20%E2%9C%A8%20I%20want%20to%20order%20custom%20acrylic%20magnets%20from%20my%20photos."
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white cursor-pointer group"
          title="Chat on WhatsApp"
        >
          <MessageSquare className="h-6 w-6 fill-white text-white group-hover:scale-110 transition-transform" />
        </a>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsCartOpen(true)}
          aria-label="Open Shopping Cart"
          className="w-14 h-14 rounded-full bg-[#111111] hover:bg-neutral-800 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white cursor-pointer relative group"
          title="View Shopping Cart"
        >
          <ShoppingBag className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          {cart.reduce((acc, x) => acc + x.quantity, 0) > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#6B1D2F] text-white text-[11px] font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-in zoom-in-50">
              {cart.reduce((acc, x) => acc + x.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Slide-over persistent Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

    </div>
  );
}

