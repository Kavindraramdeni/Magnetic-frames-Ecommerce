// Analytics & Meta Pixel / Google Analytics 4 Event Tracker

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const initAnalytics = (metaPixelId?: string, gaMeasurementId?: string) => {
  if (typeof window === 'undefined') return;

  // Initialize Meta Pixel if ID provided
  if (metaPixelId && !window.fbq) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', metaPixelId);
    window.fbq('track', 'PageView');
  }

  // Initialize GA4 if ID provided
  if (gaMeasurementId && !window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaMeasurementId);
  }
};

export const trackAddToCart = (item: { shapeId: string; shapeName: string; price: number; quantity: number }) => {
  if (typeof window === 'undefined') return;

  // Meta Pixel AddToCart
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: item.shapeName,
      content_category: 'Acrylic Magnet',
      content_ids: [item.shapeId],
      value: item.price * item.quantity,
      currency: 'INR'
    });
  }

  // GA4 add_to_cart
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: item.price * item.quantity,
      items: [{ item_id: item.shapeId, item_name: item.shapeName, price: item.price, quantity: item.quantity }]
    });
  }

  console.log('📊 [ANALYTICS LOG] AddToCart event fired:', item);
};

export const trackInitiateCheckout = (cart: any[], total: number) => {
  if (typeof window === 'undefined') return;

  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      num_items: cart.length,
      value: total,
      currency: 'INR'
    });
  }

  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: total,
      items: cart.map(i => ({ item_id: i.shapeId, item_name: i.shapeName, price: i.price, quantity: i.quantity }))
    });
  }

  console.log('📊 [ANALYTICS LOG] InitiateCheckout event fired for total:', total);
};

export const trackPurchase = (orderId: string, total: number, cart: any[]) => {
  if (typeof window === 'undefined') return;

  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: total,
      currency: 'INR',
      order_id: orderId,
      num_items: cart.length
    });
  }

  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: total,
      currency: 'INR',
      items: cart.map(i => ({ item_id: i.shapeId, item_name: i.shapeName, price: i.price, quantity: i.quantity }))
    });
  }

  console.log('📊 [ANALYTICS LOG] Purchase event fired for order:', orderId, total);
};
