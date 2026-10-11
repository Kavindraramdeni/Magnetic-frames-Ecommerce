import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Missing Supabase credentials!");
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export async function getOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) console.error('getOrders error:', error);
  return (data || []).map(order => ({
    id: order.id,
    status: order.status,
    cart: order.cart_json,
    shippingDetails: order.shipping_json,
    trackingNumber: order.tracking_number,
    courierName: order.courier_name,
    deliveryEstimate: order.delivery_estimate,
    transactionId: order.transaction_id,
    grandTotal: order.totals_json.grandTotal,
    subtotal: order.totals_json.subtotal,
    bulkDiscount: order.totals_json.bulkDiscount,
    deliveryCharge: order.totals_json.deliveryCharge,
    history: order.history_json,
    createdAt: order.created_at
  }));
}

export async function getOrderByTransactionId(transactionId: string) {
  if (!transactionId) return null;
  const { data, error } = await supabase.from('orders').select('*').eq('transaction_id', transactionId).maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    status: data.status,
    cart: data.cart_json,
    shippingDetails: data.shipping_json,
    trackingNumber: data.tracking_number,
    courierName: data.courier_name,
    deliveryEstimate: data.delivery_estimate,
    transactionId: data.transaction_id,
    grandTotal: data.totals_json?.grandTotal,
    subtotal: data.totals_json?.subtotal,
    bulkDiscount: data.totals_json?.bulkDiscount,
    deliveryCharge: data.totals_json?.deliveryCharge,
    history: data.history_json,
    createdAt: data.created_at
  };
}

export async function getOrderById(orderId: string) {
  if (!orderId) return null;
  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    status: data.status,
    cart: data.cart_json,
    shippingDetails: data.shipping_json,
    trackingNumber: data.tracking_number,
    courierName: data.courier_name,
    deliveryEstimate: data.delivery_estimate,
    transactionId: data.transaction_id,
    grandTotal: data.totals_json?.grandTotal,
    subtotal: data.totals_json?.subtotal,
    bulkDiscount: data.totals_json?.bulkDiscount,
    deliveryCharge: data.totals_json?.deliveryCharge,
    history: data.history_json,
    createdAt: data.created_at
  };
}

export async function saveOrder(order: any) {
  // Idempotency check: If an order with this transactionId already exists, do not recreate or decrement stock
  if (order.transactionId) {
    const existing = await getOrderByTransactionId(order.transactionId);
    if (existing) {
      return { order: existing, isDuplicate: true };
    }
  }

  const { data, error } = await supabase.from('orders').insert({
    id: order.id,
    status: order.status,
    cart_json: order.cart,
    shipping_json: order.shippingDetails,
    tracking_number: order.trackingNumber,
    courier_name: order.courierName,
    delivery_estimate: order.deliveryEstimate,
    transaction_id: order.transactionId,
    totals_json: { grandTotal: order.grandTotal, subtotal: order.subtotal, bulkDiscount: order.bulkDiscount, deliveryCharge: order.deliveryCharge },
    history_json: order.history,
    created_at: order.createdAt
  }).select().maybeSingle();

  if (error) {
    // If conflict on transaction_id or id, fetch and return existing
    console.warn('saveOrder insert notice:', error.message);
    if (order.transactionId) {
      const existing = await getOrderByTransactionId(order.transactionId);
      if (existing) return { order: existing, isDuplicate: true };
    }
  }

  // Deduct inventory only on successful first-time insert
  if (Array.isArray(order.cart)) {
    for (const item of order.cart) {
      try {
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.shapeId).single();
        if (prod) {
          await supabase.from('products').update({ stock: Math.max(0, prod.stock - (item.quantity || 1)) }).eq('id', item.shapeId);
        }
      } catch (err) {
        console.warn("Stock update error:", err);
      }
    }
  }

  return { order, isDuplicate: false };
}

export async function saveCheckoutSession(session: any) {
  const { error } = await supabase.from('checkout_sessions').upsert({
    id: session.id,
    razorpay_order_id: session.razorpayOrderId,
    cart_json: session.cart,
    shipping_json: session.shippingDetails || {},
    totals_json: session.totals,
    accepted_policies: session.acceptedPolicies ? 1 : 0,
    created_at: session.createdAt
  });
  if (error) console.error('saveCheckoutSession error:', error);
}

export async function getCheckoutSession(razorpayOrderId: string) {
  const { data, error } = await supabase.from('checkout_sessions').select('*').eq('razorpay_order_id', razorpayOrderId).single();
  if (error || !data) return null;
  return {
    id: data.id,
    razorpayOrderId: data.razorpay_order_id,
    cart: data.cart_json,
    shippingDetails: data.shipping_json,
    totals: data.totals_json,
    acceptedPolicies: Boolean(data.accepted_policies),
    createdAt: data.created_at,
  };
}

export async function savePaymentEvent(event: any) {
  const { error } = await supabase.from('payment_events').insert({
    id: event.id,
    provider: event.provider,
    event_type: event.eventType,
    external_payment_id: event.externalPaymentId,
    external_order_id: event.externalOrderId,
    payload_json: event.payload,
    processed_at: event.processedAt
  });
  if (error) console.error('savePaymentEvent error:', error);
}

export async function generateOrderId(prefix = "KRIA"): Promise<string> {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const randomPart = crypto.randomInt(1000, 10_000);
    const orderId = `${prefix}-${datePart}-${randomPart}`;
    const { data } = await supabase.from('orders').select('id').eq('id', orderId).maybeSingle();
    if (!data) return orderId;
  }
  return `${prefix}-${datePart}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function getBusinessSettings() {
  const { data, error } = await supabase.from('business_settings').select('*');
  if (error) console.error('getBusinessSettings error:', error);
  const settings: Record<string, string> = {};
  for (const row of (data || [])) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function getWarehouse(id: string) {
  const { data, error } = await supabase.from('warehouses').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data;
}

export async function getDefaultWarehouse() {
  const { data, error } = await supabase.from('warehouses').select('*').eq('is_default', 1).single();
  if (error || !data) return null;
  return data;
}

export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) console.error('getProducts error:', error);
  return data || [];
}

export async function getReviews() {
  const { data, error } = await supabase.from('reviews').select('*').eq('is_approved', 1).order('created_at', { ascending: false });
  if (error) console.error('getReviews error:', error);
  return data || [];
}

export async function getCoupons() {
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) console.error('getCoupons error:', error);
  return data || [];
}

export async function getBanners() {
  const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
  if (error) console.error('getBanners error:', error);
  return data || [];
}
