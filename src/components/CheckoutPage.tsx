import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, Lock, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import { getStoredAttribution } from '../utils/analytics';
import { bulkDiscountLabel, calculateBulkDiscount, deliveryChargeFor, calculateBogoDiscount } from '../lib/pricing';

const MOCK_CHECKOUT_ENABLED = import.meta.env.VITE_ENABLE_MOCK === 'true';

interface CheckoutPageProps {
  cart: CartItem[];
  coupon?: { code: string; label: string; discount: number } | null;
  onBack: () => void;
  onClearCart: () => void;
}

export default function CheckoutPage({ cart, coupon, onBack, onClearCart }: CheckoutPageProps) {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [pinStatus, setPinStatus] = useState<string>('');
  const [order, setOrder] = useState<{ orderId: string; estimate: string } | null>(null);
  const [pendingItems, setPendingItems] = useState<CartItem[] | null>(null);
  const [showMock, setShowMock] = useState(false);
  const [mockOrder, setMockOrder] = useState<any>(null);

  const itemCount = cart.reduce((a, i) => a + i.quantity, 0);
  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const bulk = calculateBulkDiscount(itemCount, subtotal);
  const bogoResult = calculateBogoDiscount(cart);
  const couponAmt = coupon
    ? (coupon.code === 'BOGO' ? (bogoResult.eligible ? bogoResult.discount : 0) : (coupon.discount ?? 0))
    : 0;
  const delivery = deliveryChargeFor(Math.max(0, subtotal - bulk - couponAmt));
  const total = Math.max(0, subtotal - bulk - couponAmt + delivery);

  const persistUploads = async (items: CartItem[]) =>
    Promise.all(
      items.map(async (item) => {
        const cropSpec = item.cropSpec || {
          version: 'v1' as const,
          scale: item.photoScale || 1,
          panX: item.photoPanX || 0,
          panY: item.photoPanY || 0,
          aspectRatio: 1,
          shapeId: item.shapeId,
        };

        let previewUrl = item.previewUrl;
        let originalUrl = item.originalUrl || item.previewUrl;
        let objectKey = item.objectKey;
        let originalObjectKey = item.originalObjectKey;

        // Persist cropped/rendered preview photo if base64 data URL
        if (previewUrl?.startsWith('data:image/')) {
          const uploadResponse = await fetch('/api/uploads/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl: previewUrl, fileName: item.photoName || `${item.shapeId}-preview` }),
          });
          const uploadData = await uploadResponse.json();
          if (!uploadResponse.ok) throw new Error(uploadData.error || 'Could not upload photo preview.');
          previewUrl = uploadData.url;
          objectKey = uploadData.objectKey;
        }

        // Persist raw original uncropped customer upload if base64 data URL
        if (originalUrl?.startsWith('data:image/')) {
          try {
            const origRes = await fetch('/api/uploads/image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataUrl: originalUrl, fileName: item.photoName ? `orig-${item.photoName}` : `${item.shapeId}-original` }),
            });
            const origData = await origRes.json();
            if (origRes.ok) {
              originalUrl = origData.url;
              originalObjectKey = origData.objectKey;
            }
          } catch (origErr) {
            console.warn('Could not persist raw original image, using preview:', origErr);
          }
        }

        return { 
          ...item, 
          previewUrl, 
          originalUrl: originalUrl || previewUrl, 
          objectKey, 
          originalObjectKey: originalObjectKey || objectKey,
          cropSpec 
        };
      })
    );

  const onPincode = async (pin: string) => {
    setShipping((s) => ({ ...s, pincode: pin }));
    if (pin.length !== 6) {
      setPinStatus('');
      return;
    }
    setPinStatus('Checking delivery…');
    try {
      const res = await fetch('/api/shiprocket/check-serviceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pin, orderValue: total, weight: 0.25 * Math.max(1, itemCount) }),
      });
      const data = await res.json();
      if (res.ok && data?.serviceable) {
        setPinStatus(`Delivers in ${data.estimatedDays || 3} days`);
        setShipping((s) => ({
          ...s,
          pincode: pin,
          city: s.city || data.city || data.district || '',
          state: s.state || data.state || '',
        }));
      } else {
        setPinStatus(data?.error || 'We may not ship to this pin yet.');
      }
    } catch {
      setPinStatus('Could not verify pin. You can still continue.');
    }
  };

  const paySuccess = async (paymentId: string, orderId: string, signature: string) => {
    setLoading(true);
    try {
      const items = pendingItems || (await persistUploads(cart));
      const isMock = orderId.startsWith('ORD-') || orderId.startsWith('order_mock_');
      const res = await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
          cart: items,
          shippingDetails: shipping,
          acceptedPolicies: accepted,
          isMock,
          couponCode: coupon?.code || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Order confirmation failed. Contact support before retrying.');
        return;
      }
      setOrder({
        orderId: data.transactionId || data.orderId || orderId,
        estimate: data.deliveryEstimate || '3–5 business days',
      });
      setStep('success');
      onClearCart();
    } catch (err: any) {
      setError(err?.message || 'Payment received, but confirmation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    if (!cart.length) {
      setError('Your bag is empty.');
      return;
    }
    if (!shipping.fullName || !shipping.phone || !shipping.address || !shipping.pincode) {
      setError('Please add name, phone, address, and pincode.');
      return;
    }
    if (!accepted) {
      setError('Please accept studio policies to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await persistUploads(cart);
      setPendingItems(items);
      const rawPhone = (shipping.phone || '').replace(/\D/g, '');
      const cleanShipping = {
        fullName: shipping.fullName.trim(),
        phone: rawPhone,
        address: shipping.address.trim(),
        pincode: shipping.pincode.trim(),
        email: (shipping.email && shipping.email.trim()) ? shipping.email.trim() : `${rawPhone || 'customer'}@orders.kriastudio.in`,
        city: (shipping.city && shipping.city.trim()) ? shipping.city.trim() : 'Bengaluru',
        state: (shipping.state && shipping.state.trim()) ? shipping.state.trim() : 'Karnataka',
      };
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: items,
          shippingDetails: cleanShipping,
          acceptedPolicies: accepted,
          couponCode: coupon?.code || null,
          attribution: getStoredAttribution(),
        }),
      });
      const orderRes = await response.json();
      if (!response.ok) {
        setError(orderRes.error || 'Could not start payment.');
        return;
      }
      if ((orderRes.isMock || !orderRes.razorpayKeyId) && MOCK_CHECKOUT_ENABLED) {
        setMockOrder(orderRes);
        setShowMock(true);
        return;
      }
      if (orderRes.isMock || !orderRes.razorpayKeyId) {
        setError('Payment gateway is not configured. Message us on WhatsApp to complete this order.');
        return;
      }
      if (!(window as any).Razorpay) {
        setError('Payment script failed to load. Refresh and try again.');
        return;
      }
      const rzp = new (window as any).Razorpay({
        key: orderRes.razorpayKeyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'KRIA Studio',
        description: 'Custom acrylic frame order',
        order_id: orderRes.orderId,
        handler: (response: any) =>
          paySuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature),
        prefill: { name: shipping.fullName, email: shipping.email, contact: shipping.phone },
        theme: { color: '#1a1714' },
      });
      rzp.on('payment.failed', (response: any) => {
        setError(response.error?.description || 'Payment declined.');
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="block space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-1 focus:ring-neutral-900"
      />
    </label>
  );

  if (step === 'success') {
    return (
      <div className="page-enter max-w-lg mx-auto px-4 py-10 pb-28 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
          <Check className="h-7 w-7 text-emerald-700" />
        </div>
        <h1 className="font-serif text-3xl font-light">Order received</h1>
        <p className="text-sm text-neutral-500">
          {order?.orderId ? `Reference ${order.orderId}. ` : ''}We will print your crop and ship in {order?.estimate}.
        </p>
        <button type="button" onClick={onBack} className="rounded-full bg-neutral-900 text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider">
          Back to shop
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-3xl mx-auto px-4 py-4 pb-32 md:pb-10">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-neutral-500 mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Bag
      </button>
      <h1 className="font-serif text-3xl font-light mb-1">Checkout</h1>
      <p className="text-xs text-neutral-500 mb-6 font-sans">
        Complimentary Express Delivery • GST Tax Invoice Included • Photo Encrypted &amp; Used Strictly to Print
      </p>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-3">
          {field('Full name', { value: shipping.fullName, onChange: (e) => setShipping({ ...shipping, fullName: e.target.value }), placeholder: 'Recipient name' })}
          <div className="grid grid-cols-2 gap-3">
            {field('Phone', { value: shipping.phone, onChange: (e) => setShipping({ ...shipping, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }), placeholder: '10-digit mobile' })}
            {field('Email', { type: 'email', value: shipping.email, onChange: (e) => setShipping({ ...shipping, email: e.target.value }), placeholder: 'Order & dispatch updates' })}
          </div>
          {field('Shipping Address', { value: shipping.address, onChange: (e) => setShipping({ ...shipping, address: e.target.value }), placeholder: 'House/flat number, building, street name' })}
          <div className="grid grid-cols-3 gap-3">
            {field('Pincode', {
              value: shipping.pincode,
              onChange: (e) => onPincode(e.target.value.replace(/\D/g, '').slice(0, 6)),
              placeholder: '6-digit PIN',
            })}
            {field('City', { value: shipping.city, onChange: (e) => setShipping({ ...shipping, city: e.target.value }) })}
            {field('State', { value: shipping.state, onChange: (e) => setShipping({ ...shipping, state: e.target.value }) })}
          </div>
          {pinStatus && <p className="text-[11px] text-neutral-600 font-mono">{pinStatus}</p>}
          <label className="flex items-start gap-2 text-xs text-neutral-600 pt-1 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 accent-neutral-900" />
            <span>I verify that my photo crop preview is accurate and agree to bespoke custom-order terms.</span>
          </label>
        </div>

        <aside className="md:col-span-2 rounded-[1.4rem] bg-white border border-neutral-200 p-4 h-fit space-y-3 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Order Summary</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-neutral-200 bg-white">
                  <img src={item.previewUrl} alt={item.shapeName} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-neutral-900 truncate">{item.shapeName}</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">Qty: {item.quantity}</p>
                </div>
                <span className="font-mono text-xs font-semibold text-neutral-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="text-xs space-y-1 border-t border-neutral-100 pt-2 font-sans">
            <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span className="font-mono">₹{subtotal}</span></div>
            {bulk > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>{bulkDiscountLabel(itemCount)}</span>
                <span className="font-mono">-₹{bulk}</span>
              </div>
            )}
            {coupon && couponAmt > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>{coupon.code === 'BOGO' ? 'BOGO (1 Frame Free)' : coupon.code}</span>
                <span className="font-mono">-₹{couponAmt}</span>
              </div>
            )}
            {coupon?.code === 'BOGO' && itemCount < 2 && (
              <div className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg font-medium">
                ⚠️ Buy 1 Get 1 Free: Add 1 more frame to cart to get it 100% FREE!
              </div>
            )}
            <div className="flex justify-between text-neutral-600"><span>Express Delivery</span><span className="font-mono">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
            <div className="flex justify-between font-semibold text-sm pt-1 border-t border-neutral-100 text-neutral-900"><span>Total</span><span className="font-mono font-bold">₹{total}</span></div>
          </div>
          <button
            type="button"
            disabled={loading || cart.length === 0}
            onClick={pay}
            className="w-full rounded-full bg-neutral-900 text-white py-3.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 btn-lux"
          >
            <Lock className="h-3.5 w-3.5" />
            {loading ? 'Please wait…' : `Pay ₹${total}`}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 256-Bit SSL Encrypted Razorpay Checkout • All Taxes Inclusive
          </p>
        </aside>
      </div>

      {showMock && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-3">
            <p className="font-serif text-xl">Simulated payment</p>
            <p className="text-xs text-neutral-500">Mock checkout is enabled for this environment.</p>
            <button type="button" className="w-full rounded-full bg-neutral-900 text-white py-3 text-xs" onClick={() => { setShowMock(false); paySuccess(`PAY-${Date.now()}`, mockOrder?.orderId || `ORD-${Date.now()}`, 'SIMULATED_SIG'); }}>
              Simulate success
            </button>
            <button type="button" className="w-full text-xs" onClick={() => setShowMock(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
