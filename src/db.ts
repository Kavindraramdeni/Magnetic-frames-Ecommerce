import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// Strict server-side credential isolation: Never silently fallback to client anon key for privileged server DB tasks
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  if (isProduction) {
    throw new Error("FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in production.");
  } else {
    console.warn("⚠️ [SECURITY WARNING] Missing SUPABASE_SERVICE_ROLE_KEY. Server-side database operations may fail without service role privileges.");
  }
}

export const supabase = createClient(supabaseUrl || "http://localhost:54321", supabaseKey || "dummy-key");

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
    shipmentId: order.shipment_id || null,
    shiprocketOrderId: order.shiprocket_order_id || null,
    shiprocketLabelUrl: order.shiprocket_label_url || null,
    deliveryEstimate: order.delivery_estimate,
    transactionId: order.transaction_id,
    grandTotal: order.totals_json?.grandTotal,
    subtotal: order.totals_json?.subtotal,
    bulkDiscount: order.totals_json?.bulkDiscount,
    deliveryCharge: order.totals_json?.deliveryCharge,
    couponDiscount: order.totals_json?.couponDiscount || 0,
    giftWrapFee: order.totals_json?.giftWrapFee || 0,
    history: order.history_json || [],
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
    shipmentId: data.shipment_id || null,
    shiprocketOrderId: data.shiprocket_order_id || null,
    shiprocketLabelUrl: data.shiprocket_label_url || null,
    deliveryEstimate: data.delivery_estimate,
    transactionId: data.transaction_id,
    grandTotal: data.totals_json?.grandTotal,
    subtotal: data.totals_json?.subtotal,
    bulkDiscount: data.totals_json?.bulkDiscount,
    deliveryCharge: data.totals_json?.deliveryCharge,
    couponDiscount: data.totals_json?.couponDiscount || 0,
    giftWrapFee: data.totals_json?.giftWrapFee || 0,
    history: data.history_json || [],
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
    shipmentId: data.shipment_id || null,
    shiprocketOrderId: data.shiprocket_order_id || null,
    shiprocketLabelUrl: data.shiprocket_label_url || null,
    deliveryEstimate: data.delivery_estimate,
    transactionId: data.transaction_id,
    grandTotal: data.totals_json?.grandTotal,
    subtotal: data.totals_json?.subtotal,
    bulkDiscount: data.totals_json?.bulkDiscount,
    deliveryCharge: data.totals_json?.deliveryCharge,
    couponDiscount: data.totals_json?.couponDiscount || 0,
    giftWrapFee: data.totals_json?.giftWrapFee || 0,
    history: data.history_json || [],
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

  const completeTotals = {
    grandTotal: order.grandTotal,
    subtotal: order.subtotal,
    bulkDiscount: order.bulkDiscount || 0,
    deliveryCharge: order.deliveryCharge || 0,
    couponDiscount: order.couponDiscount || 0,
    giftWrapFee: order.giftWrapFee || 0
  };

  const { data, error } = await supabase.from('orders').insert({
    id: order.id,
    status: order.status,
    cart_json: order.cart,
    shipping_json: order.shippingDetails,
    tracking_number: order.trackingNumber,
    courier_name: order.courierName,
    shipment_id: order.shipmentId || null,
    shiprocket_label_url: order.shiprocketLabelUrl || null,
    delivery_estimate: order.deliveryEstimate,
    transaction_id: order.transactionId,
    totals_json: completeTotals,
    history_json: order.history,
    created_at: order.createdAt
  }).select().maybeSingle();

  if (error) {
    // If conflict on transaction_id, fetch and verify existing order
    console.warn('saveOrder insert notice:', error.message);
    if (order.transactionId) {
      const existing = await getOrderByTransactionId(order.transactionId);
      if (existing) return { order: existing, isDuplicate: true };
    }
    // If conflict on order id, fetch and verify existing order
    const existingById = await getOrderById(order.id);
    if (existingById) return { order: existingById, isDuplicate: true };

    // Otherwise, fail loudly to prevent ghost orders where payment was captured but order was not persisted
    throw new Error(`CRITICAL: Order persistence failed in database: ${error.message}`);
  }

  // Deduct inventory only on successful first-time insert with ledger record
  if (Array.isArray(order.cart)) {
    for (const item of order.cart) {
      try {
        const shapeId = item.shapeId || 'custom';
        const qtyToDeduct = item.quantity || 1;

        // Check if movement was already recorded for this order and item
        const { data: existingMovement } = await supabase
          .from('inventory_movements')
          .select('id')
          .eq('order_id', order.id)
          .eq('product_id', shapeId)
          .eq('movement_type', 'ORDER_DEDUCT')
          .maybeSingle();

        if (!existingMovement) {
          // Record ledger entry
          await supabase.from('inventory_movements').insert({
            order_id: order.id,
            product_id: shapeId,
            quantity_changed: -qtyToDeduct,
            movement_type: 'ORDER_DEDUCT'
          });

          // Decrement product stock safely
          const { data: prod } = await supabase.from('products').select('stock').eq('id', shapeId).maybeSingle();
          if (prod && typeof prod.stock === 'number') {
            await supabase.from('products').update({ stock: Math.max(0, prod.stock - qtyToDeduct) }).eq('id', shapeId);
          }
        }
      } catch (err) {
        console.warn("Stock update/ledger error:", err);
      }
    }
  }

  // Automatically initialize production jobs queue for factory UV printing & cutting
  if (Array.isArray(order.cart)) {
    for (let idx = 0; idx < order.cart.length; idx++) {
      const item = order.cart[idx];
      try {
        const crop = item.cropSpec || {};
        const realObjectKey = item.originalObjectKey || item.objectKey || null;
        // Never enqueue a fake placeholder as if it were a real print asset
        await supabase.from('production_jobs').insert({
          order_id: order.id,
          item_index: idx,
          shape_id: item.shapeId || 'custom',
          quantity: item.quantity || 1,
          photo_object_key: realObjectKey,
          photo_bucket: realObjectKey ? 'customer-photos' : null,
          crop_scale: crop.scale || item.photoScale || 1.0,
          crop_pan_x: crop.panX || item.photoPanX || 0,
          crop_pan_y: crop.panY || item.photoPanY || 0,
          status: 'QUEUED'
        });
      } catch (jobErr) {
        console.warn("Production job creation notice:", jobErr);
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

export async function generateOrderId(prefix = "KRIA-ORD"): Promise<string> {
  // 1. Try atomic PostgreSQL sequence function first (collision-free & race-proof)
  try {
    const { data, error } = await supabase.rpc('next_order_id', { prefix });
    if (!error && data && typeof data === 'string') {
      return data;
    }
  } catch (rpcErr) {
    // Fall back to robust client-side generator if RPC function not yet applied in Supabase
  }

  // 2. Safe fallback using high-entropy crypto UUID + date stamp
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const randomPart = crypto.randomInt(1000, 10_000);
    const orderId = `${prefix}-${datePart}-${randomPart}`;
    const { data } = await supabase.from('orders').select('id').eq('id', orderId).maybeSingle();
    if (!data) return orderId;
  }
  return `${prefix}-${datePart}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
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

export async function getWarehouse(id?: string) {
  if (id) {
    const { data, error } = await supabase.from('warehouses').select('*').eq('id', id).maybeSingle();
    if (!error && data) return data;
  }
  return await getDefaultWarehouse();
}

export async function getDefaultWarehouse() {
  const { data, error } = await supabase.from('warehouses').select('*').eq('is_default', 1).maybeSingle();
  if (error || !data) {
    // If no warehouse marked is_default=1, return first available
    const { data: first } = await supabase.from('warehouses').select('*').limit(1).maybeSingle();
    return first || {
      id: "wh_default",
      name: "KRIA Production Hub",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500085",
      shiprocket_pickup_name: "Primary_Hyderabad_500085"
    };
  }
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

export async function createB2BEnquiry(enquiry: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  estimatedQuantity: number;
  preferredShapes?: string[];
  customNotes?: string;
}) {
  const { data, error } = await supabase.from('b2b_enquiries').insert({
    company_name: enquiry.companyName,
    contact_person: enquiry.contactPerson,
    email: enquiry.email,
    phone: enquiry.phone,
    estimated_quantity: enquiry.estimatedQuantity || 5,
    preferred_shapes: enquiry.preferredShapes || [],
    custom_notes: enquiry.customNotes || '',
    status: 'PENDING'
  }).select().single();

  if (error) {
    console.error('createB2BEnquiry error:', error);
    throw error;
  }
  return data;
}

export async function getB2BEnquiries() {
  const { data, error } = await supabase.from('b2b_enquiries').select('*').order('created_at', { ascending: false });
  if (error) console.error('getB2BEnquiries error:', error);
  return data || [];
}

export async function createProductionJob(job: {
  orderId: string;
  itemIndex: number;
  shapeId: string;
  quantity: number;
  photoObjectKey: string;
  photoBucket?: string;
  cropScale?: number;
  cropPanX?: number;
  cropPanY?: number;
}) {
  const { data, error } = await supabase.from('production_jobs').insert({
    order_id: job.orderId,
    item_index: job.itemIndex,
    shape_id: job.shapeId,
    quantity: job.quantity,
    photo_object_key: job.photoObjectKey,
    photo_bucket: job.photoBucket || 'customer-photos',
    crop_scale: job.cropScale || 1.0,
    crop_pan_x: job.cropPanX || 0,
    crop_pan_y: job.cropPanY || 0,
    status: 'QUEUED'
  }).select().single();

  if (error) {
    console.error('createProductionJob error:', error);
    throw error;
  }
  return data;
}

export async function getProductionJobs(orderId?: string) {
  let query = supabase.from('production_jobs').select('*').order('created_at', { ascending: false });
  if (orderId) query = query.eq('order_id', orderId);
  const { data, error } = await query;
  if (error) {
    console.error('getProductionJobs error:', error);
    throw error;
  }
  return data || [];
}

export async function updateProductionJobStatus(jobId: string, newStatus: string, updatedBy = "Admin") {
  const STAGE_ORDER = ['QUEUED', 'PRINTING', 'LASER_CUT', 'QUALITY_CHECK', 'PACKED'];
  if (!STAGE_ORDER.includes(newStatus)) {
    throw new Error(`Invalid stage '${newStatus}'. Allowed: ${STAGE_ORDER.join(', ')}`);
  }

  // Fetch current stage to validate allowed forward transition
  const { data: currentJob, error: fetchErr } = await supabase
    .from('production_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (fetchErr || !currentJob) {
    throw new Error(`Production job '${jobId}' not found.`);
  }

  const currentIndex = STAGE_ORDER.indexOf(currentJob.status);
  const nextIndex = STAGE_ORDER.indexOf(newStatus);

  // Prevent moving backward (e.g. from PACKED back to QUEUED)
  if (nextIndex < currentIndex) {
    throw new Error(`Invalid regression: cannot move job backwards from '${currentJob.status}' to '${newStatus}'.`);
  }

  // Prevent jumping directly to PACKED without passing QUALITY_CHECK
  if (newStatus === 'PACKED' && currentJob.status !== 'QUALITY_CHECK') {
    throw new Error(`Cannot mark job as PACKED before completing QUALITY_CHECK.`);
  }

  const { data, error } = await supabase
    .from('production_jobs')
    .update({ 
      status: newStatus, 
      updated_at: new Date().toISOString(),
      last_updated_by: updatedBy
    })
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    console.error('updateProductionJobStatus error:', error);
    throw error;
  }
  return data;
}


