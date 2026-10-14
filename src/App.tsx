import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import CartDrawer from './components/CartDrawer';
import BlogSection from './components/BlogSection';
import WholesaleB2BPage from './components/WholesaleB2BPage';
import CMSLayout from './cms/CMSLayout';
import StoreHome from './components/StoreHome';
import FrameStudio from './components/FrameStudio';
import CheckoutPage from './components/CheckoutPage';
import MobileDock from './components/MobileDock';
import GalleryPage from './components/GalleryPage';
import BOGOModal from './components/BOGOModal';
import ReturnGiftDetailPage from './components/ReturnGiftDetailPage';
import WhatsAppWidget from './components/WhatsAppWidget';
import BulkCorporateModal from './components/BulkCorporateModal';
import { initAnalytics } from './utils/analytics';
import { MagnetShapeId, CartItem, ReturnGiftProduct } from './types';


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
          <input value={orderId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderId(e.target.value)} required placeholder="KRIA-ORD-1234" className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-neutral-900" />
          <input value={emailOrPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailOrPhone(e.target.value)} required placeholder="Email or phone" className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-neutral-900" />
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
  const [currentView, setCurrentView] = useState<'home' | 'studio' | 'checkout' | 'style-experience' | 'admin' | 'cms' | 'policies' | 'tracking' | 'blog' | 'b2b' | 'gallery' | 'return-gift-detail'>('home');
  const [selectedReturnGift, setSelectedReturnGift] = useState<ReturnGiftProduct | null>(null);
  const [isBOGOOpen, setIsBOGOOpen] = useState(false);
  const [isBulkCorporateOpen, setIsBulkCorporateOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string>(() => {
    try {
      return localStorage.getItem('adminToken') || '';
    } catch {
      return '';
    }
  });

  // Lifted cart state with localStorage persistence and sanitization
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kria_studio_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((item: CartItem) => item && typeof item === 'object' && item.shapeId).map((item: CartItem) => ({
          ...item,
          quantity: Math.max(1, parseInt(String(item.quantity)) || 1),
          price: item.price || 299,
          shapeName: item.shapeName || 'Custom Frame',
          previewUrl: item.previewUrl || '/images/Landingprofile.png'
        }));
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      // Strip out huge base64 data URLs (> 50KB) before saving to localStorage to prevent QuotaExceededError
      const safeCart = cart.map((item: CartItem) => {
        if (item.previewUrl && item.previewUrl.startsWith('data:image/') && item.previewUrl.length > 50000) {
          return { ...item, previewUrl: '/images/Landingprofile.png' };
        }
        return item;
      });
      localStorage.setItem('kria_studio_cart', JSON.stringify(safeCart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutCoupon, setCheckoutCoupon] = useState<{ code: string; label: string; discount: number } | null>(null);

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
    } else {
      setCart((prev: CartItem[]) =>
        prev.map((item: CartItem) => (item.id === id ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  useEffect(() => {
    initAnalytics(import.meta.env.VITE_META_PIXEL_ID, import.meta.env.VITE_GA_MEASUREMENT_ID);
    try {
      const searchParams = new URLSearchParams(window.location.search);

      // Deep link to Admin / CMS desk
      if (searchParams.has('admin') || searchParams.has('cms') || searchParams.get('view') === 'admin' || searchParams.get('view') === 'cms') {
        const storedToken = localStorage.getItem('adminToken');
        if (storedToken) {
          setAdminToken(storedToken);
          setCurrentView('admin');
        } else {
          openAdmin();
        }
        return;
      }

      const shapeParam = searchParams.get('shape');
      if (shapeParam) {
        const clean = shapeParam.toLowerCase().trim();
        const SHAPE_ALIASES: Record<string, MagnetShapeId> = {
          heart: 'love',
          love: 'love',
          filmstrip: 'filmstrip',
          film: 'filmstrip',
          polaroid: 'polaroid',
          arch: 'arch',
          circle: 'circle',
          round: 'circle',
          hexagon: 'hexagon',
          oval: 'oval',
          grande: 'grande',
          landscape: 'landscape',
          portrait: 'portrait'
        };
        const resolvedShape = SHAPE_ALIASES[clean];
        if (resolvedShape) {
          setActiveWorkspaceShape(resolvedShape);
          setCurrentView('studio');
        }
      }
    } catch (e) {
      console.warn('Deep link param resolution error:', e);
    }
  }, []);

  const [activeWorkspaceShape, setActiveWorkspaceShape] = useState<MagnetShapeId>('love');
  const [activeWorkspaceSize, setActiveWorkspaceSize] = useState<string | undefined>(undefined);
  const cartCount = cart.reduce((acc: number, x: CartItem) => acc + x.quantity, 0);

  const goStudio = (id?: MagnetShapeId, size?: string) => {
    if (id) setActiveWorkspaceShape(id);
    if (size) setActiveWorkspaceSize(size);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView('studio');
  };

  const goHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView('home');
  };

  const goCheckout = (coupon?: { code: string; label: string; discount: number } | null) => {
    if (coupon !== undefined) setCheckoutCoupon(coupon);
    setIsCartOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView('checkout');
  };

  const handleOpenReturnGifts = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('return-gifts-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('return-gifts-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAboutUs = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('about-us-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('about-us-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenShop = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('shop-frames-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('shop-frames-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenGallery = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView('gallery');
  };

  const handleOpenReturnGiftDetail = (gift: ReturnGiftProduct) => {
    setSelectedReturnGift(gift);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView('return-gift-detail');
  };

  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    setIsCartOpen(true);
  };

  const handleDirectCheckout = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    goCheckout();
  };

  const openAdmin = async () => {
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
    localStorage.setItem('adminToken', data.token);
    setCurrentView('admin');
  };

  if (currentView === 'b2b' || currentView === 'style-experience') {
    return (
      <>
        <WholesaleB2BPage
          onBackToHome={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentView('home');
          }}
          onAddToCart={(item: CartItem) => {
            setCart((prev: CartItem[]) => {
              const existingIndex = prev.findIndex((x) => x.id === item.id);
              if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex].quantity += item.quantity;
                return updated;
              }
              return [...prev, item];
            });
          }}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cart.reduce((acc: number, x: CartItem) => acc + x.quantity, 0)}
        />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onProceedToCheckout={(coupon) => {
            goCheckout(coupon);
          }}
        />
      </>
    );
  }

  if (currentView === 'tracking') {
    return <OrderTrackingView onBackToHome={() => setCurrentView('home')} />;
  }

  if (currentView === 'blog') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-2xl px-6 py-4 shadow-2xs">
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setCurrentView('home');
              }} 
              className="text-xs font-mono uppercase tracking-widest text-neutral-600 hover:text-black font-bold flex items-center gap-2 cursor-pointer"
            >
              ← Back to Storefront
            </button>
            <span className="font-serif italic font-bold text-sm text-[#6B1D2F]">KRIA Studio Gifting Journal</span>
          </div>
          <BlogSection />
        </div>
      </div>
    );
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

  // Unified Operations Desk: Orders, 300 DPI Photo Inspect, Shiprocket, Label & GST Invoice
  if (currentView === 'admin' || currentView === 'cms') {
    return (
      <AdminDashboard 
        onBackToHome={() => setCurrentView('home')}
        adminToken={adminToken}
      />
    );
  }

  return (
    <div id="home-root" className="min-h-screen bg-[#FAF8F5] text-[#111111] font-sans antialiased overflow-x-hidden selection:bg-[#E8DCCF] selection:text-neutral-900">
      {currentView !== 'studio' && (
        <Header
          cartItemsCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onHome={handleOpenShop}
          onStudio={() => goStudio()}
          onOpenReturnGifts={handleOpenReturnGifts}
          onOpenGallery={handleOpenGallery}
          onOpenAboutUs={handleOpenAboutUs}
          onOpenBOGO={() => setIsBOGOOpen(true)}
          onOpenB2B={() => setCurrentView('b2b')}
          activeView={currentView}
        />
      )}

      {currentView === 'studio' ? (
        <FrameStudio
          initialShapeId={activeWorkspaceShape}
          initialSize={activeWorkspaceSize}
          cart={cart}
          setCart={setCart}
          onOpenCart={() => setIsCartOpen(true)}
          onBackToHome={goHome}
        />
      ) : currentView === 'checkout' ? (
        <CheckoutPage
          cart={cart}
          coupon={checkoutCoupon}
          onBack={() => {
            setIsCartOpen(true);
            goHome();
          }}
          onClearCart={handleClearCart}
        />
      ) : currentView === 'gallery' ? (
        <GalleryPage
          onBackToHome={goHome}
          onCustomize={() => goStudio()}
          onOpenReturnGifts={handleOpenReturnGifts}
        />
      ) : currentView === 'return-gift-detail' && selectedReturnGift ? (
        <ReturnGiftDetailPage
          gift={selectedReturnGift}
          onBackToHome={goHome}
          onAddToCart={handleAddToCart}
          onDirectCheckout={handleDirectCheckout}
          onCustomizeShape={(shapeId) => {
            setActiveWorkspaceShape(shapeId);
            goStudio(shapeId);
          }}
        />
      ) : (
        <StoreHome 
          onCustomize={goStudio}
          onAddToCart={handleAddToCart}
          onDirectCheckout={handleDirectCheckout}
          onOpenGallery={handleOpenGallery}
          onOpenBOGO={() => setIsBOGOOpen(true)}
          onOpenReturnGiftDetail={handleOpenReturnGiftDetail}
        />
      )}

      {currentView !== 'studio' && (
        <>
          <Footer
            onOpenAdmin={openAdmin}
            onOpenPolicies={() => setCurrentView('policies')}
            onOpenTracking={() => setCurrentView('tracking')}
            onOpenBlog={() => setCurrentView('blog')}
            onOpenB2B={() => setCurrentView('b2b')}
          />

          <MobileDock
            active={currentView}
            cartCount={cartCount}
            onHome={handleOpenShop}
            onStudio={() => goStudio()}
            onReturnGifts={handleOpenReturnGifts}
            onGallery={handleOpenGallery}
            onCart={() => setIsCartOpen(true)}
          />
        </>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={(coupon) => {
          goCheckout(coupon);
        }}
      />

      <BOGOModal
        isOpen={isBOGOOpen}
        onClose={() => setIsBOGOOpen(false)}
        onCustomize={() => goStudio()}
        onShopReturnGifts={handleOpenReturnGifts}
        onApplyCoupon={(code) => setCheckoutCoupon({ code, label: 'Buy 1 Get 1 Free', discount: 249 })}
      />

      {/* Floating Real-time WhatsApp Support & Bulk Enquiry Modal */}
      {currentView !== 'admin' && currentView !== 'cms' && (
        <>
          <WhatsAppWidget
            onOpenBulkModal={() => setIsBulkCorporateOpen(true)}
            onOpenTracking={() => setCurrentView('tracking')}
          />
          <BulkCorporateModal
            isOpen={isBulkCorporateOpen}
            onClose={() => setIsBulkCorporateOpen(false)}
          />
        </>
      )}
    </div>
  );
}

