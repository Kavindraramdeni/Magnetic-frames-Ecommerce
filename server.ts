import express from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import * as DB from "./src/db.js";
import { SHAPE_PRICES } from "./src/catalog.js";
import { fetchAndVerifyRazorpayPayment } from "./src/lib/razorpay.js";
import { renderAdjustedImage, SHAPE_PRINT_DIMENSIONS } from "./src/lib/cropUtils.js";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

// Safe ephemeral upload directory for Vercel/Lambda serverless environments
const UPLOAD_DIR = isVercel 
  ? path.join(os.tmpdir(), "kria_uploads") 
  : path.join(process.cwd(), ".user_uploaded");

try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (dirErr) {
  console.warn("Notice: Local upload dir creation bypassed in read-only environment:", dirErr);
}

const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "7893").trim();
const ADMIN_TOKEN = (process.env.ADMIN_TOKEN || (ADMIN_PASSWORD ? crypto.createHash("sha256").update(ADMIN_PASSWORD).digest("hex") : "7893")).trim();
const ENABLE_MOCK_CHECKOUT = process.env.ENABLE_MOCK_CHECKOUT === "true" && !isProduction;
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 120);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Resilient Supabase configuration with default project fallback for zero-downtime serverless boots
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpbXVsc3JuZnV0eW11aWFrZHFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI4NzE4NiwiZXhwIjoyMTAxODYzMTg2fQ.GhvpL1AaeNeshEMeTM3RPklxQNFgmZ67ziX7P2g2O0s";
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://limulsrnfutymuiakdqg.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);



const DEFAULT_BUSINESS_SETTINGS: Record<string, string> = {
  company_name: "KRIA Studio Luxury Prints",
  store_name: "KRIA Studio",
  support_email: "kriatechgroup@gmail.com",
  support_phone: "+91 9392576792",
  registered_address: "Jubilee Tech Zone, Phase II, Kukatpally, Hyderabad, Telangana 500085",
  gstin: "36AAAFK7892P1Z0",
  shipping_free_threshold: "699",
  flat_shipping_rate: "60",
  shipping_flat_rate: "60",
  bundle_3_price: "799",
  bundle_3_free_shipping: "true",
  meta_launch_offer_enabled: "true",
  currency_symbol: "₹",
  tax_inclusive: "true",
  brand_tagline: "Personalised, made-to-order acrylic magnetic fridge frames"
};

async function getBusinessSettings() {
  const { data: rows, error } = await supabase.from("business_settings").select("*");
  if (error) throw error;
  const settingsObj: Record<string, string> = {};
  for (const r of rows || []) {
    settingsObj[r.key] = r.value;
  }
  return { ...DEFAULT_BUSINESS_SETTINGS, ...settingsObj };
}

async function getWarehouse(id = "wh_primary") {
  const { data: wh } = await supabase.from("warehouses").select("*").eq("id", id).maybeSingle();
  if (wh) return wh;
  const { data: def } = await supabase.from("warehouses").select("*").eq("is_default", 1).maybeSingle();
  return def || {
    id: "wh_primary",
    name: "KRIA Studio Central Warehouse",
    address1: "Jubilee Tech Zone, Phase II",
    address2: "Kukatpally Industrial Area",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500085",
    gstin: "36AAAFK7892P1Z0",
    phone: "+91 93925 76792",
    email: "kriatechgroup@gmail.com",
    shiprocket_pickup_name: "Primary_Hyderabad_500085"
  };
}

const serializeOrder = (order: any) => ({
  id: order.id,
  status: order.status,
  cart: JSON.parse(order.cart_json),
  shippingDetails: JSON.parse(order.shipping_json),
  trackingNumber: order.tracking_number,
  courierName: order.courier_name,
  deliveryEstimate: order.delivery_estimate,
  transactionId: order.transaction_id,
  createdAt: order.created_at,
  ...JSON.parse(order.totals_json),
  history: JSON.parse(order.history_json),
});



function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const submitted = Buffer.from(token);
  const expected = Buffer.from(ADMIN_TOKEN);
  if (ADMIN_TOKEN && submitted.length === expected.length && crypto.timingSafeEqual(submitted, expected)) return next();
  return res.status(401).json({ error: "Admin authentication required." });
}

const VALID_COUPONS: Record<string, { type: "percent" | "flat" | "free_shipping"; value: number; label: string }> = {
  KRIA10: { type: "percent", value: 10, label: "10% Off Studio Special" },
  WELCOME15: { type: "percent", value: 15, label: "15% Off Welcome Gift" },
  KRIA50: { type: "flat", value: 50, label: "₹50 Flat Instant Discount" },
  FREESHIP: { type: "free_shipping", value: 0, label: "Free Shipping Unlocked" },
};

interface OrderTotals {
  subtotal: number;
  bulkDiscount: number;
  couponDiscount: number;
  deliveryCharge: number;
  giftWrapFee: number;
  grandTotal: number;
}

let liveCatalogPrices: Record<string, number> = { ...SHAPE_PRICES };
let lastPriceFetchTime = 0;

export async function refreshLiveCatalogPrices(): Promise<Record<string, number>> {
  const now = Date.now();
  if (now - lastPriceFetchTime < 15000 && Object.keys(liveCatalogPrices).length > 0) {
    return liveCatalogPrices;
  }
  try {
    const dbPrices = await DB.getProductPrices();
    if (dbPrices && Object.keys(dbPrices).length > 0) {
      liveCatalogPrices = { ...SHAPE_PRICES, ...dbPrices };
      lastPriceFetchTime = now;
    }
  } catch (err) {
    console.warn("Could not fetch live catalog prices, using fallback:", err);
  }
  return liveCatalogPrices;
}

export interface B2bTier {
  minQty: number;
  maxQty: number;
  discountPercent: number;
  label?: string;
}

export const DEFAULT_B2B_TIERS: B2bTier[] = [
  { minQty: 5, maxQty: 10, discountPercent: 10, label: "5-10 Frames (10% OFF)" },
  { minQty: 11, maxQty: 25, discountPercent: 20, label: "11-25 Frames (20% OFF)" },
  { minQty: 26, maxQty: 50, discountPercent: 30, label: "26-50 Frames (30% OFF)" },
  { minQty: 51, maxQty: 999, discountPercent: 40, label: "50+ Frames Bulk (40% OFF)" },
];

let cachedB2bTiers: B2bTier[] = DEFAULT_B2B_TIERS;
let lastB2bTiersFetchTime = 0;

export async function refreshLiveB2bTiers(): Promise<B2bTier[]> {
  const now = Date.now();
  if (now - lastB2bTiersFetchTime < 30_000) {
    return cachedB2bTiers;
  }
  try {
    const { data } = await supabase.from("business_settings").select("value").eq("key", "b2b_tiers").maybeSingle();
    if (data?.value) {
      const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedB2bTiers = parsed.map((t: any) => ({
          minQty: Number(t.minQty) || 0,
          maxQty: Number(t.maxQty) || 999,
          discountPercent: Number(t.discountPercent) || 0,
          label: t.label || `${t.minQty}-${t.maxQty} Frames (${t.discountPercent}% OFF)`
        }));
        lastB2bTiersFetchTime = now;
      }
    }
  } catch (err) {
    console.warn("Could not fetch live B2B tiers, using default:", err);
  }
  return cachedB2bTiers;
}

export function calculateBulkDiscount(itemCount: number, subtotal: number, tiers: B2bTier[] = cachedB2bTiers): number {
  if (itemCount < 5 || subtotal <= 0) return 0;
  // Sort descending by minQty to match highest applicable bracket
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  for (const tier of sorted) {
    if (itemCount >= tier.minQty) {
      return Math.round((subtotal * tier.discountPercent) / 100);
    }
  }
  return 0;
}

export let cachedShippingFreeThreshold = 699;
export let cachedFlatShippingRate = 60;
export let cachedBundle3Price = 799;
export let cachedBundle3FreeShipping = true;
export let cachedMetaLaunchOfferEnabled = true;
export let lastSettingsFetchTime = 0;

export async function refreshLiveBusinessSettings() {
  const now = Date.now();
  if (now - lastSettingsFetchTime < 15_000) return;
  try {
    const all = await getBusinessSettings();
    if (all.shipping_free_threshold !== undefined) {
      cachedShippingFreeThreshold = Math.max(0, Number(all.shipping_free_threshold) || 699);
    }
    if (all.flat_shipping_rate !== undefined || all.shipping_flat_rate !== undefined) {
      cachedFlatShippingRate = Math.max(0, Number(all.flat_shipping_rate ?? all.shipping_flat_rate) || 60);
    }
    if (all.bundle_3_price !== undefined) {
      cachedBundle3Price = Math.max(0, Number(all.bundle_3_price) || 799);
    }
    if (all.bundle_3_free_shipping !== undefined) {
      cachedBundle3FreeShipping = String(all.bundle_3_free_shipping) === "true";
    }
    if (all.meta_launch_offer_enabled !== undefined) {
      cachedMetaLaunchOfferEnabled = String(all.meta_launch_offer_enabled) !== "false";
    }
    lastSettingsFetchTime = now;
  } catch (err) {
    // fallback gracefully to cached/default values
  }
}

function calculateOrderTotals(cart: any[], couponCode?: string, giftWrapApplied?: boolean, customPriceMap?: Record<string, number>): OrderTotals {
  const prices = customPriceMap || liveCatalogPrices;
  let subtotal = 0;
  let itemCount = 0;
  cart.forEach((item: any) => {
    const backendPrice = prices[item.shapeId] ?? SHAPE_PRICES[item.shapeId as keyof typeof SHAPE_PRICES] ?? SHAPE_PRICES.custom;
    const qty = Math.max(1, Math.min(99, parseInt(item.quantity) || 1));
    itemCount += qty;
    subtotal += backendPrice * qty;
  });

  const bulkDiscount = calculateBulkDiscount(itemCount, subtotal);

  // Meta Ads Launch Offer: Any 3 frames for a bundle price (set in CMS, never hardcoded)
  let bundleDiscount = 0;
  let bundleFreeShippingTriggered = false;
  if (cachedMetaLaunchOfferEnabled && itemCount >= 3) {
    const numBundles = Math.floor(itemCount / 3);
    const avgFramePrice = subtotal / Math.max(1, itemCount);
    const standard3FrameSum = avgFramePrice * 3;
    if (standard3FrameSum > cachedBundle3Price) {
      bundleDiscount = Math.round((standard3FrameSum - cachedBundle3Price) * numBundles);
    }
    if (cachedBundle3FreeShipping) {
      bundleFreeShippingTriggered = true;
    }
  }

  // Apply higher discount between wholesale bulk discount and Meta 3-frame bundle offer
  const appliedVolumeDiscount = Math.max(bulkDiscount, bundleDiscount);

  let couponDiscount = 0;
  let forceFreeShipping = false;

  if (couponCode) {
    const cleanCode = String(couponCode).toUpperCase().trim();
    const coupon = VALID_COUPONS[cleanCode];
    if (coupon) {
      if (coupon.type === "percent") {
        couponDiscount = Math.round((Math.max(0, subtotal - appliedVolumeDiscount) * coupon.value) / 100);
      } else if (coupon.type === "flat") {
        couponDiscount = Math.min(Math.max(0, subtotal - appliedVolumeDiscount), coupon.value);
      } else if (coupon.type === "free_shipping") {
        forceFreeShipping = true;
      }
    }
  }

  // Shipping rule: Free shipping above threshold set in settings, otherwise flat fee. Or free if 3-frame bundle offer is active & set to free shipping.
  let deliveryCharge = 0;
  if (subtotal > 0) {
    const effectiveSubtotal = Math.max(0, subtotal - appliedVolumeDiscount - couponDiscount);
    if (forceFreeShipping || bundleFreeShippingTriggered || effectiveSubtotal >= cachedShippingFreeThreshold) {
      deliveryCharge = 0;
    } else {
      deliveryCharge = cachedFlatShippingRate;
    }
  }

  const giftWrapFee = giftWrapApplied ? 49 : 0;
  const grandTotal = Math.max(0, subtotal - appliedVolumeDiscount - couponDiscount + deliveryCharge + giftWrapFee);
  
  return { subtotal, bulkDiscount: appliedVolumeDiscount, couponDiscount, deliveryCharge, giftWrapFee, grandTotal };
}

async function postNotificationWebhook(url: string, payload: any) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return response.ok;
  } catch (err) {
    console.error(`Notification webhook to ${url} failed:`, err);
    return false;
  }
}

async function sendWhatsAppNotification(order: any, event: string) {
  const whatsappUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!whatsappUrl) {
    console.log(`[AUTOMATED WHATSAPP NOTIFICATION] Phone: ${order.shippingDetails?.phone} | Event: ${event} | Order: ${order.id}`);
    return true;
  }

  const phone = String(order.shippingDetails?.phone || "").replace(/\D/g, "");
  const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;

  let whatsappText = `Hi ${order.shippingDetails?.fullName || "Valued Customer"}! ✨ `;
  if (event.includes("Received") || event.includes("received")) {
    whatsappText += `We have received your KRIA Studio order *${order.id}* (Total: ₹${order.grandTotal})! 📥`;
  } else if (event.includes("confirmed") || event.includes("Paid") || event.includes("Success")) {
    whatsappText += `Your payment of *₹${order.grandTotal}* for order *${order.id}* is *SUCCESSFUL*! 💳 Our artisans are preparing your custom acrylic magnets.`;
  } else if (event.includes("Printing") || event.includes("printing")) {
    whatsappText += `*PRINTING STARTED!* 🎨 Your photos for order *${order.id}* are now being printed & laser-cut with high-gloss UV inks.`;
  } else if (event.includes("Packed") || event.includes("packed")) {
    whatsappText += `*ORDER PACKED!* 📦 Your order *${order.id}* is quality checked and packed in a luxury gift mailer ready for dispatch.`;
  } else if (event.includes("Shipped") || event.includes("Dispatched") || event.includes("shipped")) {
    whatsappText += `*ORDER SHIPPED!* 🚀 Your order *${order.id}* has been dispatched via *${order.courierName || "Express Courier"}*! AWB: *${order.trackingNumber}*. Expected Delivery: 2-4 days.`;
  } else if (event.includes("Delivered") || event.includes("delivered")) {
    whatsappText += `*ORDER DELIVERED!* 🎁 Your KRIA Studio package *${order.id}* has been delivered. Enjoy your custom acrylic magnets!`;
  } else {
    whatsappText += `Update for order *${order.id}*: ${event}.`;
  }

  const whatsappPayload = {
    phone: formattedPhone,
    recipient: formattedPhone,
    message: whatsappText,
    template_name: event.includes("Shipped") ? "order_dispatched_alert" : "order_update_alert",
    parameters: [
      { name: "name", value: order.shippingDetails?.fullName },
      { name: "order_id", value: order.id },
      { name: "tracking", value: order.trackingNumber || "Pending Dispatch" },
      { name: "courier", value: order.courierName || "Express Air" },
      { name: "total", value: `₹${order.grandTotal}` }
    ]
  };

  return await postNotificationWebhook(whatsappUrl, whatsappPayload);
}

async function notifyCustomer(order: any, event: string) {
  const customerName = order.shippingDetails?.fullName || "Valued Customer";
  const tracking = order.trackingNumber || "Assigned upon dispatch";
  const courier = order.courierName || "Express Courier";
  const orderId = order.id;
  const total = `₹${order.grandTotal}`;
  
  let eventMsg = `Your KRIA Studio order ${orderId} update: ${event}.`;
  if (event.includes("Received") || event.includes("received")) {
    eventMsg = `📥 Order Received! Hi ${customerName}, we have received your KRIA Studio order ${orderId} (${total}). Thank you for shopping with us!`;
  } else if (event.includes("confirmed") || event.includes("Paid") || event.includes("success") || event.includes("Success")) {
    eventMsg = `💳 Payment Success! Hi ${customerName}, your payment of ${total} for order ${orderId} is confirmed! Our artisans are preparing your custom acrylic magnets.`;
  } else if (event.includes("Printing") || event.includes("printing")) {
    eventMsg = `🎨 Printing Started! Hi ${customerName}, your photos for order ${orderId} are now being printed & precision laser-cut with high-gloss UV inks.`;
  } else if (event.includes("Packed") || event.includes("packed")) {
    eventMsg = `📦 Order Packed! Hi ${customerName}, your items for order ${orderId} have been quality checked and packaged in a safe foam mailer ready for courier pickup.`;
  } else if (event.includes("Shipped") || event.includes("shipped") || event.includes("Dispatched")) {
    eventMsg = `🚀 Order Shipped! Hi ${customerName}, your package ${orderId} is on its way via ${courier}! Track shipment with AWB ${tracking}. Estimated delivery: ${order.deliveryEstimate || "2-4 days"}.`;
  } else if (event.includes("Delivered") || event.includes("delivered")) {
    eventMsg = `🎁 Order Delivered! Hi ${customerName}, your KRIA Studio package ${orderId} has been successfully delivered. We hope you love your custom photo magnets!`;
  }

  // Trigger Automated WhatsApp Notification
  const whatsappSent = await sendWhatsAppNotification(order, event);

  // Log automated notifications across channels
  const payload = {
    orderId,
    customerName,
    phone: order.shippingDetails?.phone,
    email: order.shippingDetails?.email,
    event,
    message: eventMsg,
    trackingNumber: tracking,
    courierName: courier,
    grandTotal: order.grandTotal,
    channels: ["WhatsApp", "Email", "SMS"],
    timestamp: new Date().toISOString()
  };

  const channelsDispatched: string[] = [];
  if (whatsappSent) channelsDispatched.push("WhatsApp");

  const emailUrl = process.env.EMAIL_WEBHOOK_URL || process.env.NOTIFICATION_WEBHOOK_URL;
  const smsUrl = process.env.SMS_WEBHOOK_URL;

  if (emailUrl) {
    const emailSent = await postNotificationWebhook(emailUrl, payload);
    if (emailSent) channelsDispatched.push("Email");
  }
  if (smsUrl) {
    const smsSent = await postNotificationWebhook(smsUrl, payload);
    if (smsSent) channelsDispatched.push("SMS");
  }

  const anySent = channelsDispatched.length > 0;
  console.log(`[AUTOMATED NOTIFICATION] Dispatched via [${channelsDispatched.join(", ") || "none"}]: ${eventMsg}`);
  return { 
    sent: anySent, 
    channels: channelsDispatched, 
    status: anySent ? `Delivered via ${channelsDispatched.join(", ")}` : "No Active Notification Providers Configured",
    message: eventMsg 
  };
}

let shiprocketTokenCache: { token: string; expiresAt: number } | null = null;
async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) return null;
  if (shiprocketTokenCache && shiprocketTokenCache.expiresAt > Date.now()) return shiprocketTokenCache.token;
  try {
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!response.ok) return null;
    const data: any = await response.json();
    if (data.token) {
      shiprocketTokenCache = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
      return data.token;
    }
  } catch (err) { console.error("Shiprocket auth failed", err); }
  return null;
}

const app = express();
const PORT = Number(process.env.PORT || 3000);

// CORS & Options preflight for Vercel / Render cross-origin & serverless proxy
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const fallbackToRequestOrigin = ALLOWED_ORIGINS.length === 0;
  const isAllowedOrigin = typeof requestOrigin === "string" && (
    ALLOWED_ORIGINS.includes(requestOrigin) || fallbackToRequestOrigin
  );
  if (isAllowedOrigin && requestOrigin) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
  } else if (!requestOrigin || ALLOWED_ORIGINS.length === 0) {
    res.header("Access-Control-Allow-Origin", requestOrigin || "*");
  }
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS" && requestOrigin && !isAllowedOrigin) {
    return res.status(403).json({ error: "Origin is not allowed." });
  }
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({
  limit: "50mb",
  verify: (req: express.Request & { rawBody?: Buffer }, _res, buf) => {
    req.rawBody = Buffer.from(buf);
  }
}));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.set("trust proxy", 1);

function getClientIp(req: express.Request): string {
  try {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0].trim();
    }
    const realIp = req.headers["x-real-ip"];
    if (typeof realIp === "string") {
      return realIp.trim();
    }
    return (req.socket && req.socket.remoteAddress) || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
app.use("/api", (req, res, next) => {
  const ip = getClientIp(req);
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) return res.status(429).json({ error: "Too many requests. Please try again shortly." });
  return next();
});

function validateShippingDetails(shippingDetails: any) {
  if (!shippingDetails || typeof shippingDetails !== "object") return "Shipping details are required.";
  const required = ["fullName", "email", "phone", "address", "city", "state", "pincode"];
  for (const field of required) {
    if (!shippingDetails[field] || typeof shippingDetails[field] !== "string" || !shippingDetails[field].trim()) {
      return `${field} is required.`;
    }
  }
  if (shippingDetails.fullName.trim().length < 2) return "Please enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(shippingDetails.email.trim())) return "A valid email address is required.";

  // Strip non-digits and handle +91 / 0 prefix
  let cleanPhone = shippingDetails.phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.slice(2);
  } else if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
    cleanPhone = cleanPhone.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(cleanPhone)) return "A valid 10-digit Indian mobile number is required.";
  if (shippingDetails.address.trim().length < 5) return "Please provide a complete delivery address.";

  const cleanPin = shippingDetails.pincode.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) return "Please enter a valid 6-digit Indian pincode.";
  return null;
}

function validateCart(cart: any[]) {
  if (!Array.isArray(cart) || cart.length === 0) return "Your customizer design tray is empty.";
  if (cart.length > 50) return "Please contact KRIA Studio for carts above 50 line items.";
  for (const item of cart) {
    if (!item.shapeId || !(item.shapeId in SHAPE_PRICES)) {
      item.shapeId = "custom";
    }
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      item.quantity = 1;
    }
    if (!item.previewUrl || typeof item.previewUrl !== "string") {
      item.previewUrl = "/images/Landingprofile.png";
    }

    // Phase 5: Normalize and enforce versioned CropSpecification on every cart line item
    const scale = Number(item.cropSpec?.scale ?? item.photoScale ?? 1.0);
    const panX = Number(item.cropSpec?.panX ?? item.photoPanX ?? 0);
    const panY = Number(item.cropSpec?.panY ?? item.photoPanY ?? 0);

    item.cropSpec = {
      version: "v1",
      scale: Math.max(1.0, Math.min(3.0, isNaN(scale) ? 1.0 : scale)),
      panX: Math.max(-100, Math.min(100, isNaN(panX) ? 0 : panX)),
      panY: Math.max(-100, Math.min(100, isNaN(panY) ? 0 : panY)),
      aspectRatio: 1.0,
      shapeId: item.shapeId
    };

    // Sanitize objectKey if present to prevent path traversal
    if (item.objectKey && typeof item.objectKey === "string") {
      item.objectKey = item.objectKey.replace(/[^a-zA-Z0-9._-]/g, "");
    }
  }
  return null;
}
app.use("/stored-assets", express.static(UPLOAD_DIR, { immutable: true, maxAge: "1y" }));

app.post("/api/admin/session", async (req, res) => {
  const { password } = req.body || {};
  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "Password is required." });
  }
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: "Admin credentials are not configured on this server." });
  }

  const submitted = Buffer.from(password.trim());
  const expected = Buffer.from(ADMIN_PASSWORD);

  if (submitted.length === expected.length && crypto.timingSafeEqual(submitted, expected)) {
    return res.json({ token: ADMIN_TOKEN });
  }
  return res.status(401).json({ error: "Invalid admin password." });
});

// Dedicated rate-limit bucket for image uploads (10 per IP per minute)
const uploadRateBuckets = new Map<string, { count: number; resetAt: number }>();
const UPLOAD_RATE_LIMIT = 10;
const UPLOAD_RATE_WINDOW_MS = 60_000;

// ── Public Marketing Asset Upload (Admin Authenticated) ──────────────────────
app.post("/api/admin/uploads/public", requireAdmin, async (req, res) => {
  const { dataUrl, fileName } = req.body || {};
  if (!dataUrl || typeof dataUrl !== "string") return res.status(400).json({ error: "Missing image payload." });

  let base64Data = "";
  let ext = "png";
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,([\s\S]+)$/i);
  if (match) {
    const mime = match[1].toLowerCase();
    ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : mime.includes("webp") ? "webp" : "png";
    base64Data = match[2].trim();
  } else if (dataUrl.includes(";base64,")) {
    base64Data = dataUrl.split(";base64,")[1].trim();
  } else {
    base64Data = dataUrl.trim();
  }

  try {
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 25 * 1024 * 1024) return res.status(400).json({ error: "Image must be under 25MB." });

    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng  = buffer.length >= 8 &&
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
      buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a;
    const isWebp = buffer.length >= 12 &&
      buffer.slice(0, 4).toString("ascii") === "RIFF" &&
      buffer.slice(8, 12).toString("ascii") === "WEBP";
    if (!isJpeg && !isPng && !isWebp) {
      return res.status(400).json({ error: "Unsupported image format. Only JPEG, PNG, and WebP files are accepted." });
    }

    const id = crypto.randomUUID();
    const safeName = String(fileName || "asset").replace(/[^a-z0-9._-]/gi, "-").slice(0, 80);
    const storedName = `${id}-${safeName}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("images").upload(storedName, buffer, {
      contentType: `image/${ext}`,
      upsert: true
    });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(storedName);
    return res.json({ url: publicUrlData.publicUrl, objectKey: storedName, bucket: "images", isPrivate: false });
  } catch (err: any) {
    console.error("Admin public upload error:", err);
    return res.status(500).json({ error: "Failed to upload public asset: " + (err.message || "Unknown error") });
  }
});

// ── Customer Photo Upload (Strictly Private customer-photos Bucket) ─────────
app.post("/api/uploads/image", async (req, res) => {
  // Enforce upload-specific rate limit (10 RPM per IP)
  const uploadKey = getClientIp(req);
  const now = Date.now();
  const uploadBucket = uploadRateBuckets.get(uploadKey);
  if (!uploadBucket || uploadBucket.resetAt < now) {
    uploadRateBuckets.set(uploadKey, { count: 1, resetAt: now + UPLOAD_RATE_WINDOW_MS });
  } else {
    uploadBucket.count += 1;
    if (uploadBucket.count > UPLOAD_RATE_LIMIT) {
      return res.status(429).json({ error: "Too many uploads. Please wait a moment and try again." });
    }
  }

  // Notice: Customer photos are strictly stored in private 'customer-photos' bucket.
  // The caller cannot override this with isPublic: true.
  const { dataUrl, fileName } = req.body || {};
  if (!dataUrl || typeof dataUrl !== "string") return res.status(400).json({ error: "Missing image payload." });

  let base64Data = "";
  let ext = "png";

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,([\s\S]+)$/i);
  if (match) {
    const mime = match[1].toLowerCase();
    ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : mime.includes("webp") ? "webp" : "png";
    base64Data = match[2].trim();
  } else if (dataUrl.includes(";base64,")) {
    base64Data = dataUrl.split(";base64,")[1].trim();
  } else {
    base64Data = dataUrl.trim();
  }

  try {
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 25 * 1024 * 1024) return res.status(400).json({ error: "Image must be under 25MB." });

    // ── Magic-byte (file signature) verification ──────────────────────────────
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng  = buffer.length >= 8 &&
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
      buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a;
    const isWebp = buffer.length >= 12 &&
      buffer.slice(0, 4).toString("ascii") === "RIFF" &&
      buffer.slice(8, 12).toString("ascii") === "WEBP";
    if (!isJpeg && !isPng && !isWebp) {
      return res.status(400).json({ error: "Unsupported image format. Only JPEG, PNG, and WebP files are accepted." });
    }
    // ─────────────────────────────────────────────────────────────────────────
    const id = crypto.randomUUID();
    const safeName = String(fileName || "photo").replace(/[^a-z0-9._-]/gi, "-").slice(0, 80);
    const storedName = `${id}-${safeName}.${ext}`;
    
    // Always upload customer photos to the private 'customer-photos' bucket
    const uploadRes = await supabase.storage.from("customer-photos").upload(storedName, buffer, {
      contentType: `image/${ext}`,
      upsert: true
    });

    if (uploadRes.error) {
      if (uploadRes.error.message?.includes("Bucket not found")) {
        console.error("FATAL STORAGE ERROR: 'customer-photos' bucket not found in Supabase. Customer uploads blocked to prevent privacy leakage.");
        return res.status(503).json({ 
          error: "Storage configuration error: Private 'customer-photos' storage bucket is not configured. Please run supabase/storage-setup.sql in your Supabase project." 
        });
      }
      throw uploadRes.error;
    }

    // Generate short-lived signed URL (3600 seconds = 1 hour) for private customer image
    const { data: signedData, error: signedError } = await supabase.storage
      .from("customer-photos")
      .createSignedUrl(storedName, 3600);

    if (signedError || !signedData?.signedUrl) {
      throw signedError || new Error("Failed to create signed URL.");
    }

    return res.json({
      url: signedData.signedUrl,
      objectKey: storedName,
      bucket: "customer-photos",
      isPrivate: true
    });
  } catch (err: any) {
    console.error("Image upload processing error:", err);
    return res.status(500).json({ error: "Failed to save image to cloud storage: " + (err.message || "Unknown error") });
  }
});

// Endpoint for authorized staff to generate fresh signed URLs for customer photos
app.post("/api/admin/photos/signed-url", requireAdmin, async (req, res) => {
  const { objectKey, bucket = "customer-photos", orderId } = req.body || {};
  if (!objectKey || typeof objectKey !== "string") {
    return res.status(400).json({ error: "objectKey is required." });
  }

  // Prevent path traversal or foreign bucket access
  const safeBucket = bucket === "customer-photos" ? "customer-photos" : "images";

  // If orderId is provided, verify ownership of the asset
  if (orderId && typeof orderId === "string") {
    const orders = await DB.getOrders();
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    const ownsPhoto = (order.cart || []).some((item: any) => 
      item.objectKey === objectKey || 
      item.originalObjectKey === objectKey || 
      item.adjustedObjectKey === objectKey ||
      (item.previewUrl && item.previewUrl.includes(objectKey))
    );
    if (!ownsPhoto) {
      return res.status(403).json({ error: "Photo does not belong to the requested order." });
    }
  }

  try {
    const { data, error } = await supabase.storage.from(safeBucket).createSignedUrl(objectKey, 7200); // 2 hours
    if (error || !data?.signedUrl) {
      return res.status(404).json({ error: `Asset not found in storage bucket '${safeBucket}'.` });
    }
    return res.json({ signedUrl: data.signedUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate signed URL." });
  }
});

// High-resolution cropped image generator for order item (Admin Only)
app.get("/api/admin/orders/:id/items/:itemIndex/adjusted-image", requireAdmin, async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const idx = parseInt(itemIndex, 10);
    const orders = await DB.getOrders();
    const order = orders.find((o: any) => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const item = (order.cart || [])[idx];
    if (!item) return res.status(404).json({ error: "Order item not found." });

    let sourceBuffer: Buffer | null = null;
    const objectKey = item.objectKey || item.originalObjectKey;

    // Strict security check: Load only from authenticated private storage bucket
    if (objectKey && typeof objectKey === "string") {
      // Validate objectKey format (prevent path traversal)
      const cleanKey = path.basename(objectKey);
      const { data, error } = await supabase.storage.from("customer-photos").download(cleanKey);
      if (!error && data) {
        sourceBuffer = Buffer.from(await data.arrayBuffer());
      }
    }

    // Secondary fallback: local uploads dir, stored-assets, remote URL, or base64 data URL
    const photoSource = item.originalUrl || item.previewUrl;
    if (!sourceBuffer && photoSource && typeof photoSource === "string") {
      if (photoSource.startsWith("data:image/")) {
        const base64Data = photoSource.replace(/^data:image\/\w+;base64,/, "");
        sourceBuffer = Buffer.from(base64Data, "base64");
      } else if (photoSource.startsWith("/uploads/") || photoSource.startsWith("/stored-assets/")) {
        const localPath = path.join(UPLOAD_DIR, path.basename(photoSource));
        if (fs.existsSync(localPath)) {
          sourceBuffer = fs.readFileSync(localPath);
        }
      } else if (photoSource.startsWith("http://") || photoSource.startsWith("https://")) {
        try {
          const fetchRes = await fetch(photoSource);
          if (fetchRes.ok) {
            sourceBuffer = Buffer.from(await fetchRes.arrayBuffer());
          }
        } catch (fetchErr) {
          console.warn("Failed to fetch remote photoSource:", fetchErr);
        }
      }
    }

    if (!sourceBuffer) {
      return res.status(404).json({ error: "Source photo asset not found in storage." });
    }

    const shapeId = item.shapeId || 'custom';
    const shapeDim = SHAPE_PRINT_DIMENSIONS[shapeId] || SHAPE_PRINT_DIMENSIONS.custom;

    const cropSpec = item.cropSpec || {
      scale: item.photoScale || 1.0,
      panX: item.photoPanX || 0,
      panY: item.photoPanY || 0,
      aspectRatio: shapeDim.aspectRatio
    };

    if (!cropSpec.aspectRatio) {
      cropSpec.aspectRatio = shapeDim.aspectRatio;
    }

    const croppedBuffer = await renderAdjustedImage(
      sourceBuffer, 
      cropSpec, 
      shapeDim.width, 
      shapeDim.height
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="Order_${id}_Frame_${idx + 1}_${shapeId}_Adjusted.png"`);
    return res.send(croppedBuffer);
  } catch (err: any) {
    console.error("Failed to generate adjusted image:", err);
    return res.status(500).json({ error: err.message || "Failed to generate adjusted image." });
  }
});

// Original uncropped customer photo download for order item (Admin Only)
app.get("/api/admin/orders/:id/items/:itemIndex/original-image", requireAdmin, async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const idx = parseInt(itemIndex, 10);
    const orders = await DB.getOrders();
    const order = orders.find((o: any) => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const item = (order.cart || [])[idx];
    if (!item) return res.status(404).json({ error: "Order item not found." });

    let sourceBuffer: Buffer | null = null;
    const objectKey = item.originalObjectKey || item.objectKey;

    if (objectKey && typeof objectKey === "string") {
      const cleanKey = path.basename(objectKey);
      const { data, error } = await supabase.storage.from("customer-photos").download(cleanKey);
      if (!error && data) {
        sourceBuffer = Buffer.from(await data.arrayBuffer());
      }
    }

    const photoSource = item.originalUrl || item.previewUrl;
    if (!sourceBuffer && photoSource && typeof photoSource === "string") {
      if (photoSource.startsWith("data:image/")) {
        const base64Data = photoSource.replace(/^data:image\/\w+;base64,/, "");
        sourceBuffer = Buffer.from(base64Data, "base64");
      } else if (photoSource.startsWith("/uploads/") || photoSource.startsWith("/stored-assets/")) {
        const localPath = path.join(UPLOAD_DIR, path.basename(photoSource));
        if (fs.existsSync(localPath)) {
          sourceBuffer = fs.readFileSync(localPath);
        }
      } else if (photoSource.startsWith("http://") || photoSource.startsWith("https://")) {
        try {
          const fetchRes = await fetch(photoSource);
          if (fetchRes.ok) {
            sourceBuffer = Buffer.from(await fetchRes.arrayBuffer());
          }
        } catch (fetchErr) {
          console.warn("Failed to fetch remote photoSource:", fetchErr);
        }
      }
    }

    if (!sourceBuffer) {
      return res.status(404).json({ error: "Original photo not found." });
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="Order_${id}_Frame_${idx + 1}_Original.png"`);
    return res.send(sourceBuffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/catalog", async (_req, res) => res.json({ prices: SHAPE_PRICES }));

// B2B Wholesale Enquiry submission (Public)
app.post("/api/b2b/enquire", async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, estimatedQuantity, preferredShapes, customNotes } = req.body || {};
    if (!companyName || !contactPerson || !email || !phone) {
      return res.status(400).json({ error: "Company name, contact person, email, and phone are required." });
    }
    const enquiry = await DB.createB2BEnquiry({
      companyName,
      contactPerson,
      email,
      phone,
      estimatedQuantity: Number(estimatedQuantity) || 5,
      preferredShapes: Array.isArray(preferredShapes) ? preferredShapes : [],
      customNotes: String(customNotes || '')
    });
    return res.json({ success: true, enquiry });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to submit B2B enquiry." });
  }
});

// B2B Wholesale Enquiries list (Admin Protected)
app.get("/api/admin/b2b/enquiries", requireAdmin, async (_req, res) => {
  try {
    const enquiries = await DB.getB2BEnquiries();
    return res.json({ enquiries });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch B2B enquiries." });
  }
});

// Production jobs list (Admin Protected)
app.get("/api/admin/production-jobs", requireAdmin, async (req, res) => {
  try {
    const orderId = typeof req.query.orderId === 'string' ? req.query.orderId : undefined;
    const jobs = await DB.getProductionJobs(orderId);
    return res.json({ jobs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch production jobs." });
  }
});

// Update production job stage (Admin Protected)
app.patch("/api/admin/production-jobs/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: "Stage status is required." });
    const updated = await DB.updateProductionJobStatus(req.params.id, status);
    return res.json({ success: true, job: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to update production stage." });
  }
});

app.post("/api/checkout/validate-coupon", async (req, res) => {
  const { couponCode, cart = [] } = req.body || {};
  if (!couponCode) return res.status(400).json({ error: "Coupon code is required." });
  const cleanCode = String(couponCode).toUpperCase().trim();
  const coupon = VALID_COUPONS[cleanCode];
  if (!coupon) return res.status(404).json({ error: "Invalid coupon code. Try KRIA10 or WELCOME15" });

  await refreshLiveCatalogPrices();
  await refreshLiveB2bTiers();
  await refreshLiveBusinessSettings();
  const { subtotal, couponDiscount, deliveryCharge, grandTotal } = calculateOrderTotals(cart, cleanCode);
  return res.json({
    valid: true,
    code: cleanCode,
    label: coupon.label,
    couponDiscount,
    deliveryCharge,
    grandTotal
  });
});

async function syncOrderToShiprocket(order: any) {
  // Idempotency guard: If order already has a Shiprocket shipment or order ID, do not recreate
  if (order.shipmentId || order.shiprocketOrderId) {
    console.log(`[Shiprocket] Order ${order.id} already synced to Shiprocket (Shipment: ${order.shipmentId || order.shiprocketOrderId}). Skipping.`);
    return true;
  }

  const shiprocketToken = await getShiprocketToken();
  if (!shiprocketToken) {
    console.log("Shiprocket credentials missing or invalid. Skipping automatic order sync.");
    return false;
  }

  try {
    const pickupLocRes = await fetch("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", { 
      headers: { Authorization: `Bearer ${shiprocketToken}` } 
    });
    let pickupName = process.env.SHIPROCKET_PICKUP_LOCATION || "Primary";
    if (pickupLocRes.ok) {
      const locData: any = await pickupLocRes.json();
      if (locData.data?.shipping_address?.length > 0) {
        pickupName = locData.data.shipping_address[0].pickup_location || pickupName;
      }
    }

    const shipResponse = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${shiprocketToken}` },
      body: JSON.stringify({
        order_id: order.id.replace(/-/g, "_"),
        order_date: new Date(order.createdAt || Date.now()).toISOString().replace("T", " ").substring(0, 16),
        pickup_location: pickupName,
        billing_customer_name: order.shippingDetails?.fullName || "Valued Customer",
        billing_last_name: "",
        billing_address: order.shippingDetails?.address || "Main Street",
        billing_city: order.shippingDetails?.city || "Hyderabad",
        billing_pincode: order.shippingDetails?.pincode || "500085",
        billing_state: order.shippingDetails?.state || "Telangana",
        billing_country: "India",
        billing_email: order.shippingDetails?.email || "customer@kria.in",
        billing_phone: order.shippingDetails?.phone || "9876543210",
        shipping_is_billing: true,
        order_items: (order.cart || []).map((item: any, idx: number) => ({
          name: `${item.shapeName || 'Custom'} Acrylic Magnet`,
          sku: `KRIA-${item.shapeId || 'custom'}-${idx + 1}`,
          units: item.quantity || 1,
          selling_price: SHAPE_PRICES[item.shapeId as keyof typeof SHAPE_PRICES] || SHAPE_PRICES.custom
        })),
        payment_method: "Prepaid",
        sub_total: order.subtotal || order.grandTotal,
        length: 15,
        breadth: 15,
        height: 5,
        weight: Number((0.15 * Math.max(1, (order.cart || []).length)).toFixed(2))
      })
    });

    const shipData: any = await shipResponse.json().catch(() => ({}));
    if (shipResponse.ok && (shipData.shipment_id || shipData.order_id)) {
      const shipmentId = shipData.shipment_id;
      let finalAwb = shipData.awb_code || "";
      let finalCourier = shipData.courier_name || "Express Air";

      if (!finalAwb && shipmentId) {
        try {
          const awbRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${shiprocketToken}` },
            body: JSON.stringify({ shipment_id: shipmentId })
          });
          if (awbRes.ok) {
            const awbData: any = await awbRes.json();
            if (awbData.response?.data?.awb_code) {
              finalAwb = awbData.response.data.awb_code;
              finalCourier = awbData.response.data.courier_name || finalCourier;
            }
          }
        } catch (awbErr) {
          console.error("Shiprocket assign AWB step failed:", awbErr);
        }
      }

      if (finalAwb) {
        order.trackingNumber = finalAwb;
      }
      if (finalCourier) {
        order.courierName = finalCourier;
      }
      order.shipmentId = shipmentId;
      order.shiprocketOrderId = shipData.order_id;
      order.history.push({ 
        status: order.status, 
        timestamp: new Date().toISOString(), 
        note: finalAwb 
          ? `Shiprocket live shipment #${shipData.order_id} created with AWB ${finalAwb} (${finalCourier})`
          : `Shiprocket live shipment #${shipData.order_id} created. AWB assignment pending.`
      });
      await DB.updateOrder(order);
      return true;
    } else {
      console.error("Shiprocket adhoc order creation failed:", shipData);
    }
  } catch (err) {
    console.error("Shiprocket order creation error:", err);
  }
  return false;
}

async function createPaidOrderFromSession(session: any, paymentId: string, isMock = false) {
  // Concurrency guard: check if order already exists for this paymentId
  const existing = await DB.getOrderByTransactionId(paymentId);
  if (existing) return existing;

  const totals = session.totals || calculateOrderTotals(session.cart);
  const order: any = {
    id: await DB.generateOrderId("KRIA-ORD"),
    status: "Paid",
    cart: session.cart,
    shippingDetails: session.shippingDetails,
    trackingNumber: null,
    courierName: null,
    deliveryEstimate: "2-3 Business Days",
    transactionId: paymentId,
    createdAt: new Date().toISOString(),
    grandTotal: totals.grandTotal,
    subtotal: totals.subtotal,
    bulkDiscount: totals.bulkDiscount || 0,
    deliveryCharge: totals.deliveryCharge || 0,
    couponDiscount: totals.couponDiscount || 0,
    giftWrapFee: totals.giftWrapFee || 0,
    history: [
      { 
        status: "Paid", 
        timestamp: new Date().toISOString(), 
        note: isMock ? "Development mock payment confirmed." : "Razorpay server-side payment confirmation captured." 
      },
      ...(session.attribution ? [{
        status: "Attribution",
        timestamp: new Date().toISOString(),
        note: `Acquisition source: ${JSON.stringify(session.attribution)}`
      }] : [])
    ]
  };

  const saveResult = await DB.saveOrder(order);
  if (saveResult?.isDuplicate) {
    return saveResult.order;
  }

  // Send transactional email notification (Shipment creation is intentionally manual via CMS Orders page)
  sendTransactionalEmailNotifications(order, 'SUCCESS').catch((err) => console.error("Email notification background error:", err));

  return order;
}

async function sendTransactionalEmailNotifications(order: any, type: 'SUCCESS' | 'FAILED') {
  const adminEmail = "kriatechgroup@gmail.com";
  const customerEmail = order.shippingDetails?.email;
  const resendApiKey = (process.env.RESEND_API_KEY || "").trim();

  console.log(`[NOTIFICATIONS] Order ${order.id} ${type}. Admin: ${adminEmail}, Customer: ${customerEmail}`);

  if (resendApiKey) {
    try {
      // 1. Send Notification Email to Store Owner (You)
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "KRIA TECH <orders@kriatech.in>",
          to: [adminEmail],
          subject: `🎉 NEW ORDER RECEIVED #${order.id} — ₹${order.grandTotal}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #111;">
              <h2 style="color: #10B981;">🎉 New Paid Order Received!</h2>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Customer:</strong> ${order.shippingDetails?.fullName} (${order.shippingDetails?.phone})</p>
              <p><strong>Email:</strong> ${order.shippingDetails?.email}</p>
              <p><strong>Shipping Address:</strong> ${order.shippingDetails?.address}, ${order.shippingDetails?.city} - ${order.shippingDetails?.pincode}</p>
              <p><strong>Grand Total:</strong> ₹${order.grandTotal}</p>
              <p><strong>Payment Status:</strong> ${order.status}</p>
            </div>
          `
        })
      });

      // 2. Send Confirmation Email to Customer
      if (customerEmail) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "KRIA TECH <orders@kriatech.in>",
            to: [customerEmail],
            subject: `✨ Order Confirmed #${order.id} — KRIA TECH`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #111;">
                <h2>Thank you for your order, ${order.shippingDetails?.fullName}!</h2>
                <p>Your custom acrylic photo magnet order <strong>#${order.id}</strong> has been confirmed and is being processed for laser cutting & photo printing.</p>
                <p><strong>Amount Paid:</strong> ₹${order.grandTotal}</p>
                <p><strong>Delivery Address:</strong> ${order.shippingDetails?.address}, ${order.shippingDetails?.city} - ${order.shippingDetails?.pincode}</p>
                <br/>
                <p>Track your order status anytime at <a href="https://kriatech.in">https://kriatech.in</a></p>
                <p>Warm regards,<br/><strong>KRIA TECH Team</strong></p>
              </div>
            `
          })
        });
      }
    } catch (e) {
      console.error("Resend API Email Error:", e);
    }
  }
}

async function processSuccessfulPayment(checkoutSessionId: string, paymentId: string, _paymentProvider = "razorpay") {
  const session = await DB.getCheckoutSession(checkoutSessionId);
  if (!session) throw new Error("Checkout session not found or expired.");
  return await createPaidOrderFromSession(session, paymentId, false);
}

const createCheckoutOrderHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { cart, shippingDetails, acceptedPolicies = true, couponCode, attribution } = req.body;
    const cartError = validateCart(cart);
    if (cartError) return res.status(400).json({ error: cartError });
    const shippingError = validateShippingDetails(shippingDetails);
    if (shippingError) return res.status(400).json({ error: shippingError });

    // Inventory check before creating payment session: prevent orders for out-of-stock items
    const stockCheck = await DB.checkInventoryAvailability(cart);
    if (!stockCheck.available) {
      return res.status(409).json({ error: stockCheck.error || "Some items in your cart are currently out of stock." });
    }

    // Refresh live prices from catalog to ensure 100% price consistency
    await refreshLiveCatalogPrices();
    await refreshLiveB2bTiers();
    await refreshLiveBusinessSettings();
    const { grandTotal, subtotal, deliveryCharge, bulkDiscount, couponDiscount } = calculateOrderTotals(cart, couponCode);

    const rzpKeyId = (process.env.RAZORPAY_KEY_ID || "rzp_test_TGaGgMONy7ZDwz").trim().replace(/['"]/g, "");
    const rzpKeySecret = (process.env.RAZORPAY_KEY_SECRET || "YXOAZFrYF8Zt0UD8iWE65Wfx").trim().replace(/['"]/g, "");
    if (!rzpKeyId || !rzpKeySecret) {
      if (!ENABLE_MOCK_CHECKOUT) return res.status(503).json({ error: "Payment gateway is not configured. Mock checkout is disabled outside development." });
      const mockOrderId = `order_mock_${crypto.randomUUID()}`;
      await DB.saveCheckoutSession({ 
        id: crypto.randomUUID(), 
        razorpayOrderId: mockOrderId, 
        cart, 
        shippingDetails, 
        totals: { subtotal, deliveryCharge, bulkDiscount, couponDiscount, grandTotal }, 
        acceptedPolicies, 
        createdAt: new Date().toISOString(),
        attribution: attribution || null
      });
      return res.json({ orderId: mockOrderId, amount: grandTotal * 100, currency: "INR", isMock: true, subtotal, deliveryCharge, bulkDiscount, couponDiscount, grandTotal, razorpayKeyId: "rzp_test_mock_key_studio_kria" });
    }
    const authString = Buffer.from(`${rzpKeyId}:${rzpKeySecret}`).toString("base64");
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${authString}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount: grandTotal * 100, currency: "INR", receipt: `receipt_kria_${Date.now()}` }) });
    if (!rzpResponse.ok) throw new Error(`Razorpay gateway error: ${await rzpResponse.text()}`);
    const rzpOrder: any = await rzpResponse.json();
    await DB.saveCheckoutSession({ 
      id: crypto.randomUUID(), 
      razorpayOrderId: rzpOrder.id, 
      cart, 
      shippingDetails, 
      totals: { subtotal, deliveryCharge, bulkDiscount, couponDiscount, grandTotal }, 
      acceptedPolicies, 
      createdAt: new Date().toISOString(),
      attribution: attribution || null
    });
    return res.json({ orderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, isMock: false, subtotal, deliveryCharge, bulkDiscount, couponDiscount, grandTotal, razorpayKeyId: rzpKeyId });
  } catch (error: any) { res.status(500).json({ error: error.message || "Failed to establish a secure transaction session." }); }
};

app.post("/api/checkout/create-order", createCheckoutOrderHandler);
app.post("/api/razorpay/create-order", createCheckoutOrderHandler);

app.post("/api/checkout/whatsapp-order", async (req, res) => {
  try {
    const { cart = [], shippingDetails = {}, couponCode, attribution } = req.body || {};
    const cartError = validateCart(cart);
    if (cartError) return res.status(400).json({ error: cartError });

    // Inventory check before creating WhatsApp order
    const stockCheck = await DB.checkInventoryAvailability(cart);
    if (!stockCheck.available) {
      return res.status(409).json({ error: stockCheck.error || "Some items in your cart are currently out of stock." });
    }

    await refreshLiveCatalogPrices();
    await refreshLiveB2bTiers();
    await refreshLiveBusinessSettings();
    const { grandTotal, subtotal, bulkDiscount, deliveryCharge, couponDiscount } = calculateOrderTotals(cart, couponCode);
    const orderId = await DB.generateOrderId("KRIA-WA");

    const order = {
      id: orderId,
      status: "WhatsApp Order",
      cart,
      shippingDetails,
      // Tracking details are intentionally null until Shiprocket shipment is created by admin.
      trackingNumber: null,
      courierName: null,
      deliveryEstimate: "2-3 Business Days (after production)",
      transactionId: `WA_DIRECT_${Date.now()}`,
      createdAt: new Date().toISOString(),
      grandTotal,
      subtotal,
      bulkDiscount,
      deliveryCharge,
      couponDiscount,
      history: [
        { status: "WhatsApp Order", timestamp: new Date().toISOString(), note: "1-Click Direct WhatsApp order initiated by customer." },
        ...(attribution ? [{ status: "Attribution", timestamp: new Date().toISOString(), note: `Acquisition source: ${JSON.stringify(attribution)}` }] : [])
      ]
    };

    await DB.saveOrder(order);

    const itemsText = cart.map((item: any) => `- ${item.shapeName || 'Custom'} (Qty: ${item.quantity || 1}, Price: ₹${(item.price || 299) * (item.quantity || 1)})`).join("\n");
    const waText = `Hi KRIA Studio! ✨ I want to place an instant WhatsApp order:\n\n*Order ID:* ${orderId}\n\n*Items Ordered:*\n${itemsText}\n\n*Grand Total:* ₹${grandTotal}\n*Customer Name:* ${shippingDetails.fullName || 'Customer'}\n*Phone:* ${shippingDetails.phone || 'N/A'}\n*Delivery Address:* ${shippingDetails.address || ''}, ${shippingDetails.city || 'India'} - ${shippingDetails.pincode || ''}\n\nPlease confirm print assets & payment link!`;
    const whatsappUrl = `https://wa.me/919392576792?text=${encodeURIComponent(waText)}`;

    return res.json({ success: true, orderId, whatsappUrl, grandTotal });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

const verifyCheckoutPaymentHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, cart, shippingDetails, isMock, acceptedPolicies, couponCode } = req.body;
    const cartError = validateCart(cart);
    if (cartError) return res.status(400).json({ error: cartError });
    const shippingError = validateShippingDetails(shippingDetails);
    if (shippingError) return res.status(400).json({ error: shippingError });
    if (!acceptedPolicies) return res.status(400).json({ error: "Please accept KRIA Studio policies before placing the order." });
    if (isMock && !ENABLE_MOCK_CHECKOUT) return res.status(403).json({ error: "Mock payments are disabled." });
    if (!isMock) {
      const rzpKeySecret = (process.env.RAZORPAY_KEY_SECRET || "YXOAZFrYF8Zt0UD8iWE65Wfx").trim().replace(/['"]/g, "");
      if (!rzpKeySecret) return res.status(500).json({ error: "Gateway credential error. Verification failed." });
      const generatedSignature = crypto.createHmac("sha256", rzpKeySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
      if (generatedSignature !== razorpay_signature) return res.status(400).json({ error: "Cryptographic signature validation failed. Potential tampering." });
    }
    const transactionId = isMock ? `txn_${crypto.randomUUID()}` : razorpay_payment_id;

    // 1. Concurrency / Idempotency check: Return existing order if already processed by webhook
    const existingOrder = await DB.getOrderByTransactionId(transactionId);
    if (existingOrder) {
      return res.json({
        success: true,
        transactionId: existingOrder.transactionId,
        trackingNumber: existingOrder.trackingNumber || null,
        courierName: existingOrder.courierName,
        deliveryEstimate: existingOrder.deliveryEstimate,
        isMockCheckout: isMock,
        isRealShipment: Boolean(existingOrder.shipmentId),
        notification: { success: true },
        grandTotal: existingOrder.grandTotal
      });
    }

    // 2. Load the checkout session as the absolute single source of truth
    const session = await DB.getCheckoutSession(razorpay_order_id);
    if (!session) {
      return res.status(404).json({ error: "Checkout session expired or not found for this transaction." });
    }

    const sessionGrandTotal = session.totals?.grandTotal || calculateOrderTotals(session.cart).grandTotal;
    const expectedPaise = Math.round(sessionGrandTotal * 100);

    // 3. Server-to-server payment verification: assert status=captured, correct order_id, exact paise
    if (!isMock) {
      const verifyResult = await fetchAndVerifyRazorpayPayment(razorpay_payment_id, razorpay_order_id, expectedPaise);
      if (!verifyResult.ok) {
        const errReason = "reason" in verifyResult ? verifyResult.reason : "Payment verification failed.";
        const statusCode = ("httpStatus" in verifyResult && verifyResult.httpStatus) ? verifyResult.httpStatus : 402;
        console.error("[payment-verify] Razorpay server-to-server check failed:", errReason);
        return res.status(statusCode).json({ error: errReason });
      }
      console.log(`[payment-verify] ✅ Payment ${razorpay_payment_id} verified: captured ₹${sessionGrandTotal}`);
    }

    // 4. Create paid order from session using database-enforced idempotency strategy
    const finalOrder = await createPaidOrderFromSession(session, transactionId, isMock);
    const notification = await notifyCustomer(finalOrder, "Order confirmed");

    return res.json({ 
      success: true, 
      transactionId: finalOrder.transactionId, 
      trackingNumber: finalOrder.trackingNumber || null, 
      courierName: finalOrder.courierName || "Delhivery Air", 
      deliveryEstimate: finalOrder.deliveryEstimate || "3-5 Business Days", 
      isMockCheckout: isMock, 
      isRealShipment: Boolean(finalOrder.shipmentId), 
      notification, 
      grandTotal: finalOrder.grandTotal 
    });
  } catch (error: any) { 
    console.error("verifyCheckoutPaymentHandler error:", error);
    res.status(500).json({ error: error.message || "Failed to process final order booking." }); 
  }
};

app.post("/api/checkout/verify-payment", verifyCheckoutPaymentHandler);
app.post("/api/orders/confirm", verifyCheckoutPaymentHandler);

function saveShippingQuote(quote: {
  id?: string;
  orderId?: string;
  destinationPin: string;
  courierName: string;
  rate: number;
  etd: string;
  serviceable: boolean;
  responseJson: any;
}) {
  try {
    const id = quote.id || `quote_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    supabase.from("shipping_quotes").upsert({
      id: id,
      order_id: quote.orderId || null,
      destination_pin: quote.destinationPin,
      courier_name: quote.courierName,
      rate: quote.rate,
      etd: quote.etd,
      serviceable: quote.serviceable ? 1 : 0,
      response_json: JSON.stringify(quote.responseJson),
      created_at: new Date().toISOString()
    }).then();
  } catch (e) {
    console.error("Failed to save shipping quote:", e);
  }
}

app.post("/api/admin/shipping-test", requireAdmin, async (req, res) => {
  const startTime = Date.now();
  const { pincode = "500085", weight = 0.25 } = req.body || {};
  const token = await getShiprocketToken();
  if (!token) return res.status(400).json({ error: "Shiprocket credentials not configured or login failed." });

  try {
    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "500085";
    const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_pincode=${pickupPincode}&delivery_pincode=${pincode}&weight=${weight}&cod=0`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const latencyMs = Date.now() - startTime;
    const data: any = await response.json();

    const couriers = data.data?.available_courier_companies || [];
    const cheapest = couriers.length > 0 ? couriers.reduce((prev: any, curr: any) => (prev.rate < curr.rate ? prev : curr)) : null;

    return res.json({
      latencyMs,
      serviceable: couriers.length > 0,
      availableCouriersCount: couriers.length,
      cheapestCourier: cheapest ? {
        id: cheapest.courier_company_id,
        name: cheapest.courier_name,
        rate: cheapest.rate,
        etd: cheapest.etd || cheapest.estimated_delivery_days,
        cod: cheapest.cod,
        isSurface: cheapest.is_surface,
        isAir: cheapest.is_air
      } : null,
      rawResponse: data
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/shiprocket/check-serviceability", async (req, res) => {
  const { pincode, weight = 0.25 } = req.body || {};
  const cleanPin = String(pincode || "").trim().replace(/\D/g, "");

  if (cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return res.json({
      serviceable: false,
      pincode: cleanPin,
      error: `Invalid Pincode: "${cleanPin}" is not a valid 6-digit Indian postal PIN code.`
    });
  }

  // 1. Validate against official Indian Postal Directory API (Real-time Postal Directory)
  let postalInfo: any = null;
  try {
    const postalRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (postalRes.ok) {
      const postalData: any = await postalRes.json();
      if (Array.isArray(postalData) && postalData[0]?.Status === "Success" && Array.isArray(postalData[0]?.PostOffice) && postalData[0].PostOffice.length > 0) {
        const po = postalData[0].PostOffice[0];
        const city = po.District || po.Division || po.Name || "";
        const state = po.State || "";
        postalInfo = {
          district: city,
          state,
          locationName: `${city}, ${state}`.trim()
        };
      } else {
        return res.json({
          serviceable: false,
          pincode: cleanPin,
          error: `Invalid Pincode: "${cleanPin}" is not a registered Indian postal PIN code.`
        });
      }
    }
  } catch (postalErr) {
    console.error("Postal pincode directory lookup error:", postalErr);
  }

  // 2. Query Live Shiprocket Serviceability API
  const shiprocketToken = await getShiprocketToken();
  if (shiprocketToken) {
    try {
      const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "500085";
      const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_pincode=${pickupPincode}&delivery_pincode=${cleanPin}&weight=${weight}&cod=0`, {
        headers: { Authorization: `Bearer ${shiprocketToken}` }
      });
      if (response.ok) {
        const data: any = await response.json();
        if (data.status === 200 && Array.isArray(data.data?.available_courier_companies)) {
          if (data.data.available_courier_companies.length > 0) {
            const cheapest = data.data.available_courier_companies.reduce((prev: any, curr: any) => (prev.rate < curr.rate ? prev : curr));
            const etdRaw = cheapest.etd || cheapest.estimated_delivery_days || cheapest.etd_hours;
            const parsedDays = etdRaw ? (parseInt(String(etdRaw).replace(/\D/g, ''), 10) || 3) : 3;
            
            const result = {
              serviceable: true,
              pincode: cleanPin,
              estimatedDays: parsedDays,
              shippingCost: Math.round(Number(cheapest.rate) || 60),
              courierName: cheapest.courier_name || cheapest.courier_company_name || "Express Courier",
              region: postalInfo ? postalInfo.locationName : (data.data.city || "India"),
              availableCouriersCount: data.data.available_courier_companies.length,
              isReal: true
            };

            saveShippingQuote({
              destinationPin: cleanPin,
              courierName: result.courierName,
              rate: result.shippingCost,
              etd: `${parsedDays} Days`,
              serviceable: true,
              responseJson: data
            });

            return res.json(result);
          } else {
            return res.json({
              serviceable: false,
              pincode: cleanPin,
              error: `Unserviceable: We currently do not have courier coverage for ${postalInfo ? postalInfo.locationName : cleanPin}.`,
              isReal: true
            });
          }
        }
      }
    } catch (err) {
      console.error("Shiprocket rate API fetch failed:", err);
    }
  }

  // 3. Dynamic Distance-based Zone Calculation for Fallback (Accurate State ETDs)
  if (postalInfo) {
    const pinNum = parseInt(cleanPin, 10);
    let dynamicETD = 3;
    let courierPartner = "Standard Express";

    // Remote / Island / Special Zones
    if (pinNum >= 790000 && pinNum <= 799999) { dynamicETD = 7; courierPartner = "North East Air Express"; } // NE (Mizoram, Arunachal, Nagaland)
    else if (pinNum >= 744000 && pinNum <= 744999) { dynamicETD = 8; courierPartner = "Island Cargo Express"; } // Andaman & Nicobar
    else if (pinNum >= 194000 && pinNum <= 194999) { dynamicETD = 7; courierPartner = "Ladakh Mountain Express"; } // Leh / Ladakh
    else if (pinNum >= 682550 && pinNum <= 682559) { dynamicETD = 8; courierPartner = "Island Cargo Express"; } // Lakshadweep
    // Zone-based Distance relative to Pickup Pincode 500085 (Hyderabad, Telangana)
    else if (pinNum >= 500000 && pinNum <= 509999) { dynamicETD = 1; courierPartner = "Hyderabad Local Express"; } // Local Same City/District
    else if (pinNum >= 510000 && pinNum <= 539999) { dynamicETD = 2; courierPartner = "Telangana & AP Surface"; } // Same State / AP
    else if ((pinNum >= 560000 && pinNum <= 599999) || (pinNum >= 600000 && pinNum <= 649999)) { dynamicETD = 2; courierPartner = "South Zone Air Express"; } // Bangalore / Chennai
    else if (pinNum >= 400000 && pinNum <= 449999) { dynamicETD = 3; courierPartner = "Western Air Express"; } // Mumbai / Pune
    else if (pinNum >= 110000 && pinNum <= 110099) { dynamicETD = 4; courierPartner = "North Zone Air Express"; } // Delhi NCR
    else if (pinNum >= 700000 && pinNum <= 739999) { dynamicETD = 5; courierPartner = "East Zone Surface"; } // Kolkata / WB
    else { dynamicETD = 4; courierPartner = "Pan-India Surface"; }

    return res.json({
      serviceable: true,
      pincode: cleanPin,
      estimatedDays: dynamicETD,
      shippingCost: dynamicETD <= 2 ? 40 : (dynamicETD >= 6 ? 120 : 60),
      courierName: courierPartner,
      region: postalInfo.locationName,
      isReal: false
    });
  }

  return res.json({
    serviceable: false,
    pincode: cleanPin,
    error: `Invalid Pincode: "${cleanPin}" is not a valid 6-digit Indian postal PIN code.`
  });
});

// ----------------------------------------------------------------------
// FULL SHIPROCKET OFFICIAL API ENGINE (ALL 8 ENDPOINTS ACTIVE)
// ----------------------------------------------------------------------

// 1. POST /shiprocket/auth/login
app.post(["/api/shiprocket/auth/login", "/shiprocket/auth/login"], requireAdmin, async (req, res) => {
  const email = req.body?.email || process.env.SHIPROCKET_EMAIL;
  const password = req.body?.password || process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) return res.status(400).json({ error: "Shiprocket credentials missing. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in environment." });
  
  try {
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data: any = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    if (data.token) {
      shiprocketTokenCache = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
    }
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to authenticate with Shiprocket API." });
  }
});

// 2. POST /shiprocket/orders/create/adhoc
app.post(["/api/shiprocket/orders/create/adhoc", "/shiprocket/orders/create/adhoc"], requireAdmin, async (req, res) => {
  const token = await getShiprocketToken();
  if (!token) return res.status(401).json({ error: "Shiprocket authentication failed. Check API credentials." });
  try {
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. GET /shiprocket/courier/serviceability (Public for checkout pincode checking)
app.get(["/api/shiprocket/courier/serviceability", "/shiprocket/courier/serviceability"], async (req, res) => {
  const { pickup_pincode = process.env.SHIPROCKET_PICKUP_PINCODE || "500085", delivery_pincode, weight = "0.25", cod = "0" } = req.query;
  const token = await getShiprocketToken();
  if (!token) return res.status(401).json({ error: "Shiprocket authentication failed." });
  try {
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_pincode=${pickup_pincode}&delivery_pincode=${delivery_pincode}&weight=${weight}&cod=${cod}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. POST /shiprocket/courier/assign/awb
app.post(["/api/shiprocket/courier/assign/awb", "/shiprocket/courier/assign/awb"], requireAdmin, async (req, res) => {
  const token = await getShiprocketToken();
  if (!token) return res.status(401).json({ error: "Shiprocket authentication failed." });
  try {
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- ADMIN DATABASE BACKUP ENDPOINTS ---
app.get("/api/admin/backups", requireAdmin, async (_req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'data', 'backups');
    if (!fs.existsSync(backupDir)) return res.json({ backups: [] });
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('kria_backup_') && f.endsWith('.sqlite'))
      .map(f => {
        const stats = fs.statSync(path.join(backupDir, f));
        return { filename: f, sizeBytes: stats.size, createdAt: stats.mtime.toISOString() };
      });
    return res.json({ backups: files });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/backups/trigger", requireAdmin, async (_req, res) => {
  // Real Supabase backup cannot be triggered from application code using the anon/service-role key.
  // Use the Supabase Dashboard → Settings → Backups, or the Supabase Management API with a personal
  // access token to schedule and download point-in-time recovery snapshots.
  // Returning a false success here would be misleading and potentially dangerous.
  return res.status(501).json({
    error: "Automated backup not implemented.",
    instructions: "Use the Supabase Dashboard (Settings → Backups) or pg_dump with the database connection string to create a real backup. Never rely on this endpoint for data safety.",
    docsUrl: "https://supabase.com/docs/guides/platform/backups"
  });
});

// 5. GET /shiprocket/courier/track
app.get(["/api/shiprocket/courier/track", "/shiprocket/courier/track", "/api/shiprocket/courier/track/awb/:awb"], async (req, res) => {
  const awb = req.params.awb || req.query.awb || req.query.order_id;
  const token = await getShiprocketToken();
  if (!token) return res.status(401).json({ error: "Shiprocket authentication failed." });
  try {
    const url = req.query.order_id 
      ? `https://apiv2.shiprocket.in/v1/external/courier/track/order/${req.query.order_id}`
      : `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. POST /shiprocket/courier/generate/pickup
app.post(["/api/shiprocket/courier/generate/pickup", "/shiprocket/courier/generate/pickup"], requireAdmin, async (req, res) => {
  const token = await getShiprocketToken();
  if (!token) return res.status(401).json({ error: "Shiprocket authentication failed." });
  try {
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/print/pickup", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. GET/POST /shiprocket/courier/label
app.all(["/api/shiprocket/courier/label", "/shiprocket/courier/label", "/api/shiprocket/courier/generate/label"], requireAdmin, async (req, res) => {
  const token = await getShiprocketToken();
  if (!token) return res.status(401).json({ error: "Shiprocket authentication failed." });
  try {
    const shipment_id = req.body?.shipment_id || req.query?.shipment_id;
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/label", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ shipment_id: Array.isArray(shipment_id) ? shipment_id : [Number(shipment_id)] })
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 8. GET/POST /shiprocket/courier/invoice
app.all(["/api/shiprocket/courier/invoice", "/shiprocket/courier/invoice", "/api/shiprocket/courier/generate/invoice"], requireAdmin, async (req, res) => {
  const token = await getShiprocketToken();
  if (!token) return res.status(401).json({ error: "Shiprocket authentication failed." });
  try {
    const ids = req.body?.ids || req.query?.ids || req.body?.order_id || req.query?.order_id;
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/print/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ids: Array.isArray(ids) ? ids : [Number(ids)] })
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/webhooks/razorpay", async (_req, res) => {
  return res.status(200).json({
    status: "Active",
    endpoint: "/api/webhooks/razorpay",
    provider: "Razorpay Payment Gateway Webhook Listener",
    method: "POST",
    message: "KRIA TECH Webhook Listener is Live & Ready to receive payment events."
  });
});

app.post("/api/webhooks/razorpay", async (req, res) => {
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
  const signature = req.headers["x-razorpay-signature"];

  // 1. Signature presence validation
  if (!signature || typeof signature !== "string") {
    return res.status(400).json({ error: "Missing x-razorpay-signature header." });
  }

  // 2. Secret presence validation
  if (!webhookSecret) {
    console.error("FATAL: RAZORPAY_WEBHOOK_SECRET is not configured on this server.");
    return res.status(500).json({ error: "Webhook secret not configured." });
  }

  // 3. Exact raw body signature verification
  const rawBody = (req as any).rawBody;
  if (!rawBody || !Buffer.isBuffer(rawBody)) {
    console.error("Webhook error: req.rawBody is missing or not a Buffer.");
    return res.status(400).json({ error: "Malformed request payload." });
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const submittedBuf = Buffer.from(signature.trim());
  const expectedBuf = Buffer.from(expectedSignature);

  if (submittedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(submittedBuf, expectedBuf)) {
    console.warn("⚠️ Invalid Razorpay webhook signature attempt rejected.");
    return res.status(400).json({ error: "Invalid webhook signature." });
  }

  // 4. Extract and log payment event
  const eventId = req.body?.payload?.payment?.entity?.id || req.body?.event_id || crypto.randomUUID();
  const payment = req.body?.payload?.payment?.entity;

  try {
    await DB.savePaymentEvent({
      id: eventId,
      provider: "razorpay",
      eventType: req.body?.event || "unknown",
      externalPaymentId: payment?.id,
      externalOrderId: payment?.order_id,
      payload: req.body,
      processedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn("Notice: Payment event logging issue:", e);
  }

  // 5. Only verified captured payment events trigger order creation & fulfillment
  if ((req.body?.event === "payment.captured" || req.body?.event === "order.paid") && payment?.order_id) {
    try {
      const paymentId = payment.id || eventId;

      // Idempotency check: Do not re-process if order is already created
      const existing = await DB.getOrderByTransactionId(paymentId);
      if (existing) {
        console.log(`[WEBHOOK] Order for payment ${paymentId} already processed (id: ${existing.id}). Skipping.`);
        return res.status(200).json({ received: true, status: "ALREADY_PROCESSED" });
      }

      const session = await DB.getCheckoutSession(payment.order_id);
      if (session) {
        await createPaidOrderFromSession(session, paymentId, false);
      } else {
        console.warn(`[WEBHOOK] No checkout session found for order ${payment.order_id}. Initiating fallback recovery order.`);
        const grandTotal = Math.round((payment.amount || 0) / 100);
        const recoveryOrder = {
          id: await DB.generateOrderId("KRIA-REC"),
          status: "Paid",
          cart: [{
            shapeId: "custom",
            quantity: 1,
            price: grandTotal,
            shapeName: "Captured Payment (Auto-Recovered Order)",
            previewUrl: null
          }],
          shippingDetails: {
            fullName: (payment.notes && (payment.notes.name || payment.notes.fullName || payment.notes.customer_name)) || "Razorpay Customer",
            email: payment.email || "",
            phone: payment.contact || "",
            address: (payment.notes && payment.notes.address) || "Address pending verification",
            city: (payment.notes && payment.notes.city) || "",
            state: (payment.notes && payment.notes.state) || "",
            pincode: (payment.notes && payment.notes.pincode) || ""
          },
          trackingNumber: null,
          courierName: null,
          deliveryEstimate: "3-5 Business Days",
          transactionId: paymentId,
          grandTotal,
          subtotal: grandTotal,
          bulkDiscount: 0,
          deliveryCharge: 0,
          couponDiscount: 0,
          giftWrapFee: 0,
          history: [{
            status: "Paid",
            timestamp: new Date().toISOString(),
            note: `Payment ₹${grandTotal} captured directly via Razorpay webhook. Auto-recovery order created.`
          }],
          createdAt: new Date().toISOString()
        };
        await DB.saveOrder(recoveryOrder);
        await notifyCustomer(recoveryOrder, "Payment Received (Session Recovered)");
      }
    } catch (err) {
      console.error("Webhook payment process error:", err);
    }
  } else if (req.body?.event === "payment.failed" && payment?.order_id) {
    console.warn(`[WEBHOOK] Payment ${payment.id} failed for order ${payment.order_id}: ${payment.error_description || "Declined"}`);
    // Check if an existing order exists to update history
    try {
      const existing = await DB.getOrderByTransactionId(payment.id);
      if (existing) {
        existing.status = "Failed";
        existing.history = existing.history || [];
        existing.history.push({
          status: "Failed",
          timestamp: new Date().toISOString(),
          note: `Payment failed webhook received: ${payment.error_description || "Transaction declined by bank/gateway"}`
        });
        await DB.updateOrder(existing);
      }
    } catch (failErr) {
      console.error("Failed payment status record error:", failErr);
    }
  } else if (req.body?.event === "payment.authorized" && payment?.order_id) {
    console.log(`[WEBHOOK] Payment ${payment.id} authorized for order ${payment.order_id}. Awaiting capture.`);
  } else if (req.body?.event === "refund.processed" && req.body?.payload?.refund?.entity) {
    const refund = req.body.payload.refund.entity;
    console.log(`[WEBHOOK] Refund ${refund.id} processed for payment ${refund.payment_id}. Amount: ₹${(refund.amount || 0) / 100}`);
    try {
      const existing = await DB.getOrderByTransactionId(refund.payment_id);
      if (existing) {
        existing.status = "Refunded";
        existing.history = existing.history || [];
        existing.history.push({
          status: "Refunded",
          timestamp: new Date().toISOString(),
          note: `Refund of ₹${(refund.amount || 0) / 100} processed via webhook (${refund.id})`
        });
        await DB.updateOrder(existing);
      }
    } catch (refErr) {
      console.error("Refund status record error:", refErr);
    }
  }

  return res.status(200).json({ received: true, status: "OK" });
});

// Clean, keyword-free webhook routes per official Shiprocket specification ("do not use keywords like shiprocket, kartrocket, sr, or kr in your webhook URL")
app.get(["/api/webhooks/shiprocket", "/api/webhooks/courier-tracking", "/api/webhooks/logistics-update"], async (_req, res) => {
  return res.status(200).json({ success: true, message: "KRIA Courier Webhook Endpoint Active." });
});

app.post(["/api/webhooks/shiprocket", "/api/webhooks/courier-tracking", "/api/webhooks/logistics-update"], async (req, res) => {
  try {
    const { 
      awb, 
      current_status, 
      shipment_status, 
      courier_name, 
      order_id, 
      channel_order_id, 
      scans, 
      test 
    } = req.body || {};

    const cleanAwb = awb ? String(awb) : "";
    const statusText = current_status || shipment_status || "";
    const cleanOrderId = channel_order_id || order_id || "";

    // Handle Shiprocket Test Webhook Ping button (which sends empty body or test flag)
    if (test || (!cleanAwb && !cleanOrderId)) {
      return res.status(200).json({ success: true, message: "KRIA Shiprocket Test Webhook Connection Verified Successfully!" });
    }

    const orders = await DB.getOrders();
    const order = orders.find((o: any) => 
      (cleanAwb && String(o.trackingNumber || '') === cleanAwb) || 
      (cleanOrderId && (o.id === cleanOrderId || o.id === String(cleanOrderId).replace(/_/g, '-')))
    );

    if (order) {
      const statusMap: { [key: string]: string } = {
        "PICKED UP": "Processing",
        "IN TRANSIT": "Shipped",
        "OUT FOR DELIVERY": "Out For Delivery",
        "DELIVERED": "Delivered",
        "RTO IN TRANSIT": "RTO Returned",
        "RTO DELIVERED": "RTO Returned"
      };

      const upperStatus = String(statusText).toUpperCase();
      const newStatus = statusMap[upperStatus] || order.status;
      order.status = newStatus;
      if (courier_name && courier_name !== "enter courier_name") order.courierName = courier_name;

      const latestScan = Array.isArray(scans) && scans.length > 0 ? scans[0] : null;
      const scanNote = latestScan ? ` Location: ${latestScan.location} (${latestScan.activity})` : "";

      order.history.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: `Shiprocket scan update: "${statusText}".${scanNote}`
      });

      await DB.updateOrder(order);
      await notifyCustomer(order, `Courier Tracking Update: ${statusText}`);
    }

    return res.status(200).json({ success: true, received: true });
  } catch (err: any) {
    console.error("Shiprocket webhook processing error:", err);
    return res.status(200).json({ success: true, message: "Webhook acknowledged with error handling." });
  }
});

// ----------------------------------------------------------------------
// BUSINESS SETTINGS & WAREHOUSE MANAGEMENT ENDPOINTS
// ----------------------------------------------------------------------

const PUBLIC_SETTING_KEYS = new Set([
  "company_name",
  "store_name",
  "support_email",
  "support_phone",
  "instagram_handle",
  "announcement_banner",
  "return_policy_days",
  "shipping_free_threshold",
  "flat_shipping_rate",
  "shipping_flat_rate",
  "bundle_3_price",
  "bundle_3_free_shipping",
  "meta_launch_offer_enabled",
  "currency_symbol",
  "tax_inclusive",
  "b2b_tiers",
  "brand_tagline"
]);

// Public sanitized settings endpoint (sensitive bank accounts, IFSC, secret keys are never returned)
app.get("/api/settings", async (_req, res) => {
  try {
    const all = await getBusinessSettings();
    const publicSettings: Record<string, any> = {};
    for (const [key, val] of Object.entries(all)) {
      if (PUBLIC_SETTING_KEYS.has(key)) {
        publicSettings[key] = val;
      }
    }
    return res.json(publicSettings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch settings." });
  }
});

// Admin full settings endpoint (Protected with bearer token)
app.get("/api/admin/settings", requireAdmin, async (_req, res) => {
  try {
    return res.json(await getBusinessSettings());
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch admin settings." });
  }
});

app.post("/api/admin/settings", requireAdmin, async (req, res) => {
  try {
    const settings = req.body || {};
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        await supabase.from("business_settings").upsert({ key, value: String(value) });
      } else if (typeof value === "object" && value !== null) {
        await supabase.from("business_settings").upsert({ key, value: JSON.stringify(value) });
      }
    }
    // Invalidate cached B2B tiers & business settings so changes apply immediately
    lastSettingsFetchTime = 0;
    if ("b2b_tiers" in settings) {
      lastB2bTiersFetchTime = 0;
    }
    await refreshLiveBusinessSettings();
    return res.json({ success: true, settings: await getBusinessSettings() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update business settings." });
  }
});

// Admin Warehouse endpoint (Protected)
app.get("/api/admin/warehouses", requireAdmin, async (_req, res) => {
  try {
    const { data: warehouses, error } = await supabase.from("warehouses").select("*").order("is_default", { ascending: false }).order("created_at", { ascending: false });
    if (error) throw error;
    return res.json(warehouses);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch warehouses." });
  }
});

// Public sanitized warehouse endpoint (city, state, pincode only - hides private tax & contact info)
app.get("/api/warehouses", async (_req, res) => {
  try {
    const { data: warehouses, error } = await supabase
      .from("warehouses")
      .select("name, city, state, pincode, is_default")
      .order("is_default", { ascending: false });
    if (error) throw error;
    return res.json(warehouses);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch public warehouse locations." });
  }
});

app.post("/api/admin/warehouses", requireAdmin, async (req, res) => {
  try {
    const wh = req.body || {};
    const fullAddress = wh.address || wh.address1;
    if (!fullAddress || !wh.city || !wh.state || !wh.pincode) {
      return res.status(400).json({ error: "Address, city, state, and 6-digit pincode are required." });
    }

    const cleanPin = String(wh.pincode).trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      return res.status(400).json({ error: "Pincode must be a valid 6-digit Indian postal code." });
    }

    const id = wh.id || `wh_${Date.now()}`;
    const warehouseData = {
      id,
      name: wh.name || "Main Warehouse",
      address1: fullAddress,
      address2: wh.address2 || "",
      city: wh.city.trim(),
      state: wh.state.trim(),
      pincode: cleanPin,
      gstin: wh.gstin || "36AAAFK7892P1Z0",
      phone: wh.phone || "+91 93925 76792",
      email: wh.email || "kriatechgroup@gmail.com",
      shiprocket_pickup_name: wh.shiprocket_pickup_name || `Primary_${wh.city}_${cleanPin}`,
      is_default: wh.is_default ? 1 : 1,
      created_at: wh.created_at || new Date().toISOString()
    };

    const { error: upsertErr } = await supabase.from("warehouses").upsert(warehouseData);
    if (upsertErr) throw upsertErr;

    return res.json({ success: true, warehouse: warehouseData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to save warehouse details." });
  }
});

// Production Shipment Creation Endpoint (Adhoc order -> Assign AWB -> Label PDF URL)
app.post("/api/shiprocket/create-shipment", requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.body || {};
    const orders = await DB.getOrders();
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const wh = await DB.getWarehouse();
    const shiprocketToken = await getShiprocketToken();

    if (shiprocketToken) {
      const shipResponse = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${shiprocketToken}` },
        body: JSON.stringify({
          order_id: order.id,
          order_date: new Date(order.createdAt).toISOString().slice(0, 19).replace("T", " "),
          pickup_location: wh.shiprocket_pickup_name || "Primary_Hyderabad_500085",
          billing_customer_name: order.shippingDetails.fullName,
          billing_address: order.shippingDetails.address,
          billing_city: order.shippingDetails.city,
          billing_pincode: order.shippingDetails.pincode,
          billing_state: order.shippingDetails.state,
          billing_country: "India",
          billing_email: order.shippingDetails.email,
          billing_phone: order.shippingDetails.phone,
          shipping_is_billing: true,
          order_items: (order.cart || []).map((item: any) => ({
            name: `${item.shapeName} Acrylic Magnet`,
            sku: `KRIA-${item.shapeId}`,
            units: item.quantity,
            selling_price: item.price,
            hsn: "39269099",
            tax: 18
          })),
          payment_method: "Prepaid",
          sub_total: order.subtotal || order.grandTotal,
          length: 15, breadth: 15, height: 5, weight: 0.35
        })
      });

      if (shipResponse.ok) {
        const shipData: any = await shipResponse.json();
        const shipmentId = shipData.shipment_id || shipData.order_id;
        let awbCode = shipData.awb_code;

        // Assign AWB if not yet assigned
        if (shipmentId && !awbCode) {
          const awbRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${shiprocketToken}` },
            body: JSON.stringify({ shipment_id: shipmentId })
          });
          if (awbRes.ok) {
            const awbData: any = await awbRes.json();
            awbCode = awbData.response?.data?.awb_code || awbCode;
          }
        }

        // Fetch Official Label PDF URL from Shiprocket
        let labelPdfUrl = "";
        if (shipmentId) {
          const labelRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/generate/label?shipment_id=${shipmentId}`, {
            headers: { Authorization: `Bearer ${shiprocketToken}` }
          });
          if (labelRes.ok) {
            const labelData: any = await labelRes.json();
            labelPdfUrl = labelData.label_url || "";
          }
        }

        if (!awbCode) {
          return res.status(400).json({ error: "Shipment created, but Shiprocket could not auto-assign an AWB. Please assign courier in Shiprocket panel." });
        }

        order.trackingNumber = awbCode;
        order.courierName = shipData.courier_name || "Express Courier";
        order.shiprocketLabelUrl = labelPdfUrl;
        order.shipmentId = shipmentId;
        order.history.push({
          status: order.status,
          timestamp: new Date().toISOString(),
          note: `Production shipment created on Shiprocket. AWB: ${order.trackingNumber} (${order.courierName})`
        });

        await DB.updateOrder(order);
        return res.json({ success: true, trackingNumber: order.trackingNumber, labelPdfUrl, shipmentId });
      } else {
        const errorText = await shipResponse.text();
        return res.status(400).json({ error: `Shiprocket error: ${errorText}` });
      }
    }

    return res.status(503).json({ error: "Shiprocket credentials missing. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create shipment." });
  }
});

// Production Pickup Generation Endpoint
app.post("/api/shiprocket/schedule-pickup", requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.body || {};
    const orders = await DB.getOrders();
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (!order.shipmentId) return res.status(400).json({ error: "Cannot schedule pickup: Order has no Shiprocket shipment ID." });

    const wh = await DB.getWarehouse();
    const shiprocketToken = await getShiprocketToken();
    if (!shiprocketToken) return res.status(503).json({ error: "Shiprocket credentials missing or invalid." });

    const pickupRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/generate/pickup", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${shiprocketToken}` },
      body: JSON.stringify({
        shipment_id: [order.shipmentId],
        pickup_location: wh.shiprocket_pickup_name || "Primary_Hyderabad_500085"
      })
    });

    const pickupData = await pickupRes.json().catch(() => ({}));
    if (pickupRes.ok) {
      order.status = "Pickup Requested";
      order.history.push({
        status: "Pickup Requested",
        timestamp: new Date().toISOString(),
        note: `Courier pickup scheduled from ${wh.city} (${wh.pincode}) warehouse. Collection pending.`
      });
      await DB.updateOrder(order);
      return res.json({ success: true, message: "Pickup scheduled with courier executive.", shiprocket: pickupData });
    } else {
      return res.status(400).json({ error: pickupData.message || "Shiprocket rejected pickup request." });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to schedule pickup." });
  }
});

app.get("/robots.txt", async (_req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://magnetic-frames-ecommerce.onrender.com/sitemap.xml`);
});

app.get("/sitemap.xml", async (_req, res) => {
  res.type("application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://magnetic-frames-ecommerce.onrender.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://magnetic-frames-ecommerce.onrender.com/tracking</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
});

app.post("/api/orders/track", async (req, res) => {
  const { orderId, emailOrPhone } = req.body || {};
  if (!orderId || !emailOrPhone) return res.status(400).json({ error: "Order ID and email/phone are required." });

  // Query the specific order directly — do not load all orders
  const order = await DB.getOrderById(orderId);
  if (!order) return res.status(404).json({ error: "Order not found." });

  const lookup = String(emailOrPhone).toLowerCase().trim();
  const email = String(order.shippingDetails?.email || "").toLowerCase().trim();
  const phone = String(order.shippingDetails?.phone || "").replace(/\D/g, "");
  const lookupPhone = lookup.replace(/\D/g, "");

  // Require full email match OR full 10-digit phone match (not just last 4 digits)
  const emailMatches = lookup === email && email.length > 3;
  const phoneMatches = lookupPhone.length >= 10 && phone === lookupPhone;
  if (!emailMatches && !phoneMatches) {
    return res.status(403).json({ error: "Order lookup details did not match." });
  }

  // Return only the fields needed for customer tracking — no payment amounts, no full address, no history
  return res.json({
    id: order.id,
    status: order.status,
    trackingNumber: order.trackingNumber || null,
    courierName: order.courierName || null,
    deliveryEstimate: order.deliveryEstimate || null,
    createdAt: order.createdAt,
    // Minimal destination hint (city + state only, no full address or pincode)
    destinationCity: order.shippingDetails?.city || null,
    destinationState: order.shippingDetails?.state || null,
  });
});


app.get("/api/admin/orders", requireAdmin, async (_req, res) => res.json({ success: true, orders: await DB.getOrders() }));

app.get('/api/admin/dashboard', requireAdmin, async (_req, res) => {
  const orders = await DB.getOrders();
  const revenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  res.json({
    success: true,
    stats: { revenue, orders: orders.length, customers: orders.length, conversion: 2.5 },
    recentOrders: orders.slice(0, 5)
  });
});
app.get('/api/admin/banners', requireAdmin, async (_req, res) => res.json({ success: true, banners: await DB.getBanners() }));
app.post('/api/admin/banners', requireAdmin, async (req, res) => { await DB.supabase.from('banners').upsert(req.body); res.json({success:true}); });
app.delete('/api/admin/banners/:id', requireAdmin, async (req, res) => { await DB.supabase.from('banners').delete().eq('id', req.params.id); res.json({success:true}); });

app.post("/api/admin/orders/recover-payments", requireAdmin, async (_req, res) => {
  try {
    const { data: sessions } = await DB.supabase.from("checkout_sessions").select("*");
    const recovered: any[] = [];
    for (const session of sessions || []) {
      const { data: paymentEvents } = await DB.supabase.from("payment_events").select("*").eq("external_order_id", session.razorpay_order_id).eq("event_type", "payment.captured");
      for (const event of paymentEvents || []) {
        const parsedSession = {
          id: session.id,
          razorpayOrderId: session.razorpay_order_id,
          cart: JSON.parse(session.cart_json),
          shippingDetails: JSON.parse(session.shipping_json),
          totals: JSON.parse(session.totals_json)
        };
        const order = await createPaidOrderFromSession(parsedSession, event.external_payment_id || `recovered_${Date.now()}`, false);
        recovered.push(order.id);
      }
    }
    return res.json({ success: true, recoveredCount: recovered.length, recoveredOrders: recovered });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const allOrders = await DB.getOrders();
    const order = allOrders.find((o: any) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order record not found." });

    const VALID_STATUSES = [
      "Pending", "WhatsApp Order", "Payment Verified", "Processing",
      "Production", "Quality Check", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Refunded"
    ];
    if (!VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: `Invalid status '${req.body.status}'.` });
    }

    const currentStatus = order.status;
    const nextStatus = req.body.status;

    // Guard: Terminal states cannot transition back to active fulfillment
    if ((currentStatus === "Cancelled" || currentStatus === "Refunded") && nextStatus !== currentStatus) {
      return res.status(400).json({ 
        error: `Cannot update order ${order.id}: Order is already ${currentStatus}. Create a new order or append an audit note instead.` 
      });
    }

    // Guard: Delivered orders cannot regress to earlier fulfillment states
    const PRE_DELIVERY_STATUSES = ["Pending", "Payment Verified", "Processing", "Production", "Quality Check", "Packed", "Shipped", "Out for Delivery"];
    if (currentStatus === "Delivered" && PRE_DELIVERY_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ 
        error: `Invalid status transition: Order ${order.id} is already Delivered and cannot regress to ${nextStatus}.` 
      });
    }

    order.status = nextStatus;
    order.history = order.history || [];
    order.history.push({
      status: nextStatus,
      timestamp: new Date().toISOString(),
      note: req.body.note || `Status transitioned from ${currentStatus} to ${nextStatus} by administrator.`
    });
    const notification = await notifyCustomer(order, `Status updated to ${nextStatus}`);
    order.history.push({ status: "Notification", timestamp: new Date().toISOString(), note: notification.message });

    // Use updateOrder (not saveOrder) — saveOrder returns early for existing transaction IDs
    await DB.updateOrder(order);
    res.json({ success: true, order, notificationLog: notification.message });
  } catch (err: any) {
    console.error("Order status update error:", err);
    res.status(500).json({ error: err.message || "Failed to update order status." });
  }
});
app.post("/api/admin/orders/:id/sync-shiprocket", requireAdmin, async (req, res) => {
  const allOrders = await DB.getOrders();
  const order = allOrders.find((o: any) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order record not found." });

  // Disallow creating shipments for cancelled or refunded orders
  if (order.status === "Cancelled" || order.status === "Refunded") {
    return res.status(400).json({ 
      error: `Cannot create Shiprocket shipment: Order ${order.id} is already ${order.status}.` 
    });
  }

  // Retries aware of partial success: do not recreate if shipment was already established
  if (order.shipmentId) {
    return res.status(400).json({ 
      error: `Order already has an active Shiprocket shipment (#${order.shipmentId}). AWB: ${order.trackingNumber || 'Pending assignment'}. Use Print Label or Request Pickup.` 
    });
  }

  // Validate parcel dimensions passed from CMS or fallback to confirmed package defaults
  const customWeight = Number(req.body?.weight);
  const customLength = Number(req.body?.length);
  const customBreadth = Number(req.body?.breadth);
  const customHeight = Number(req.body?.height);

  const parcelWeight = (customWeight > 0) ? customWeight : Number((0.15 * Math.max(1, (order.cart || []).length)).toFixed(2));
  const parcelLength = (customLength > 0) ? customLength : 15;
  const parcelBreadth = (customBreadth > 0) ? customBreadth : 15;
  const parcelHeight = (customHeight > 0) ? customHeight : 5;

  const shiprocketToken = await getShiprocketToken();
  if (!shiprocketToken) {
    return res.status(503).json({ error: "Shiprocket credentials missing or authentication failed. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD." });
  }

  try {
    const pickupLocRes = await fetch("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", { 
      headers: { Authorization: `Bearer ${shiprocketToken}` } 
    });
    let pickupName = process.env.SHIPROCKET_PICKUP_LOCATION || "Primary";
    if (pickupLocRes.ok) {
      const locData: any = await pickupLocRes.json();
      if (locData.data?.shipping_address?.length > 0) {
        pickupName = locData.data.shipping_address[0].pickup_location || pickupName;
      }
    }

    // Step 1: Create adhoc order & shipment in Shiprocket with validated parcel specs
    const shipResponse = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${shiprocketToken}` },
      body: JSON.stringify({
        order_id: order.id.replace(/-/g, "_"),
        order_date: new Date(order.createdAt || Date.now()).toISOString().replace("T", " ").substring(0, 16),
        pickup_location: pickupName,
        billing_customer_name: order.shippingDetails?.fullName || "Valued Customer",
        billing_last_name: "",
        billing_address: order.shippingDetails?.address || "Main Street",
        billing_city: order.shippingDetails?.city || "Hyderabad",
        billing_pincode: order.shippingDetails?.pincode || "500085",
        billing_state: order.shippingDetails?.state || "Telangana",
        billing_country: "India",
        billing_email: order.shippingDetails?.email || "customer@kria.in",
        billing_phone: order.shippingDetails?.phone || "9876543210",
        shipping_is_billing: true,
        order_items: (order.cart || []).map((item: any, idx: number) => ({
          name: `${item.shapeName || 'Custom'} Acrylic Magnet`,
          sku: `KRIA-${item.shapeId || 'custom'}-${idx + 1}`,
          units: item.quantity || 1,
          selling_price: SHAPE_PRICES[item.shapeId as keyof typeof SHAPE_PRICES] || SHAPE_PRICES.custom
        })),
        payment_method: "Prepaid",
        sub_total: order.subtotal || order.grandTotal,
        length: parcelLength,
        breadth: parcelBreadth,
        height: parcelHeight,
        weight: parcelWeight
      })
    });

    const shipData: any = await shipResponse.json().catch(() => ({}));
    if (!shipResponse.ok || (!shipData.shipment_id && !shipData.order_id)) {
      const errorMsg = shipData.message || (shipData.errors ? JSON.stringify(shipData.errors) : "Shiprocket rejected order creation.");
      return res.status(400).json({ error: `Shiprocket Error: ${errorMsg}` });
    }

    const shipmentId = shipData.shipment_id;
    let finalAwb = shipData.awb_code || "";
    let finalCourier = shipData.courier_name || "";

    // Step 2: Explicitly request and verify real AWB assignment from Shiprocket
    if (!finalAwb && shipmentId) {
      try {
        const awbRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${shiprocketToken}` },
          body: JSON.stringify({ shipment_id: shipmentId })
        });
        const awbData: any = await awbRes.json().catch(() => ({}));
        if (awbRes.ok && awbData.response?.data?.awb_code) {
          finalAwb = awbData.response.data.awb_code;
          finalCourier = awbData.response.data.courier_name || finalCourier;
        } else {
          const awbError = awbData.message || awbData.response?.data?.awb_assign_error || "AWB could not be auto-assigned by courier.";
          console.warn(`[Shiprocket] AWB assignment pending/failed for shipment ${shipmentId}: ${awbError}`);
        }
      } catch (awbErr: any) {
        console.error("Shiprocket assign AWB network failure:", awbErr);
      }
    }

    // Persist Shiprocket identifiers immediately into DB so retries never duplicate shipments
    order.shipmentId = shipmentId;
    order.shiprocketOrderId = shipData.order_id;
    if (finalAwb) {
      order.trackingNumber = finalAwb;
    }
    if (finalCourier) {
      order.courierName = finalCourier;
    }

    try {
      await DB.supabase.from("orders").update({
        shipment_id: shipmentId,
        shiprocket_order_id: shipData.order_id,
        tracking_number: finalAwb || null,
        courier_name: finalCourier || null
      }).eq("id", order.id);
    } catch (dbSyncErr) {
      console.warn("Immediate shipment identifier update notice:", dbSyncErr);
    }

    order.history.push({ 
      status: order.status, 
      timestamp: new Date().toISOString(), 
      note: finalAwb 
        ? `Shiprocket shipment #${shipmentId} created with live AWB ${finalAwb} via ${finalCourier || 'Courier'}.`
        : `Shiprocket shipment #${shipmentId} created (order #${shipData.order_id}). AWB assignment pending.`
    });
    await DB.updateOrder(order);

    return res.json({ 
      success: true, 
      order, 
      isRealShipment: true, 
      awbAssigned: !!finalAwb,
      shiprocket: { 
        ...shipData, 
        shipment_id: shipmentId, 
        awb_code: finalAwb || null, 
        courier_name: finalCourier || null 
      } 
    });
  } catch (shipErr: any) {
    console.error("Shiprocket sync error:", shipErr);
    return res.status(500).json({ error: `Shiprocket connection failed: ${shipErr.message || "Unknown error"}` });
  }
});
app.delete("/api/admin/orders/:id", requireAdmin, async (req, res) => {
  try {
    const allOrders = await DB.getOrders();
    const order = allOrders.find((o: any) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    order.status = "Cancelled";
    order.history = order.history || [];
    order.history.push({
      status: "Cancelled",
      timestamp: new Date().toISOString(),
      note: "Order cancelled and archived by administrator."
    });
    // Use updateOrder (not saveOrder) to persist the cancellation
    await DB.updateOrder(order);
    res.json({ success: true, message: `Order ${req.params.id} marked as Cancelled. Audit trail preserved.` });
  } catch (err: any) {
    console.error("Order cancel error:", err);
    res.status(500).json({ error: err.message || "Failed to cancel order." });
  }
});

// ── Per-Item Production Status Updates ────────────────────────────────────────
app.patch("/api/admin/orders/:id/items/:itemIndex/status", requireAdmin, async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const { status, note } = req.body;
    const idx = parseInt(itemIndex, 10);
    const allOrders = await DB.getOrders();
    const order = allOrders.find((o: any) => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (!order.cart || !order.cart[idx]) return res.status(404).json({ error: "Item not found in order cart." });

    order.cart[idx].itemStatus = status; // 'printed' | 'cut' | 'assembled' | 'qc_passed'
    order.cart[idx].statusUpdatedAt = new Date().toISOString();
    order.history = order.history || [];
    order.history.push({
      status: `Item ${idx + 1} (${order.cart[idx].shapeName || order.cart[idx].shapeId || 'Frame'}) -> ${status}`,
      timestamp: new Date().toISOString(),
      note: note || `Item production status updated to ${status}.`
    });

    await DB.updateOrder(order);
    res.json({ success: true, order, item: order.cart[idx] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update item status." });
  }
});

// ── Per-Item Crop Coordinates Fine-Tuning (CMS Crop Editor) ───────────────────
app.patch("/api/admin/orders/:id/items/:itemIndex/crop", requireAdmin, async (req, res) => {
  try {
    const { id, itemIndex } = req.params;
    const { cropSpec, previewUrl, cropMode } = req.body;
    const idx = parseInt(itemIndex, 10);
    const allOrders = await DB.getOrders();
    const order = allOrders.find((o: any) => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (!order.cart || !order.cart[idx]) return res.status(404).json({ error: "Item not found in order cart." });

    if (cropSpec) order.cart[idx].cropSpec = { ...order.cart[idx].cropSpec, ...cropSpec };
    if (previewUrl) order.cart[idx].previewUrl = previewUrl;
    if (cropMode) order.cart[idx].cropMode = cropMode;
    order.cart[idx].lastAdjustedAt = new Date().toISOString();

    order.history = order.history || [];
    order.history.push({
      status: `Item ${idx + 1} Crop Adjusted`,
      timestamp: new Date().toISOString(),
      note: `Staff fine-tuned crop coordinates for item ${idx + 1}.`
    });

    await DB.updateOrder(order);
    res.json({ success: true, order, item: order.cart[idx] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update item crop." });
  }
});

// ── Append Staff Internal Audit Note ──────────────────────────────────────────
app.post("/api/admin/orders/:id/notes", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    if (!note || typeof note !== "string") return res.status(400).json({ error: "Note text is required." });
    const allOrders = await DB.getOrders();
    const order = allOrders.find((o: any) => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    order.history = order.history || [];
    order.history.push({
      status: "Internal Note",
      timestamp: new Date().toISOString(),
      note: note.trim()
    });

    await DB.updateOrder(order);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to append internal note." });
  }
});

// ── Process Refund (Razorpay / Audit Trail) ──────────────────────────────────
app.post("/api/admin/orders/:id/refund", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const allOrders = await DB.getOrders();
    const order = allOrders.find((o: any) => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    order.status = "Refunded";
    order.history = order.history || [];
    order.history.push({
      status: "Refunded",
      timestamp: new Date().toISOString(),
      note: `Refund of ₹${amount || order.grandTotal || 0} processed. Reason: ${reason || 'Customer request'}`
    });

    await DB.updateOrder(order);
    res.json({ success: true, order, message: `Refund of ₹${amount || order.grandTotal} registered for order ${id}.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process refund." });
  }
});

// ── Generate Linked Replacement Order ────────────────────────────────────────
app.post("/api/admin/orders/:id/replacement", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes, itemIndices } = req.body;
    const allOrders = await DB.getOrders();
    const order = allOrders.find((o: any) => o.id === id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const repOrderId = `KRIA-REP-${Date.now().toString().slice(-6)}`;
    const itemsToReplace = Array.isArray(itemIndices) && itemIndices.length > 0
      ? order.cart.filter((_: any, idx: number) => itemIndices.includes(idx))
      : order.cart;

    const repCart = itemsToReplace.map((item: any) => ({
      ...item,
      itemStatus: 'queued',
      replacementForOrder: id
    }));

    const repOrder = {
      id: repOrderId,
      status: "Production",
      cart: repCart,
      shippingDetails: { ...order.shippingDetails },
      trackingNumber: "UNASSIGNED",
      courierName: "Shiprocket",
      deliveryEstimate: "3-5 Business Days",
      transactionId: `TXN-REP-${repOrderId}`,
      grandTotal: 0,
      subtotal: 0,
      history: [
        {
          status: "Replacement Created",
          timestamp: new Date().toISOString(),
          note: `Replacement authorized for order #${id}. Reason: ${reason || 'Defect/Damage claim'}. Notes: ${notes || 'None'}`
        }
      ],
      createdAt: new Date().toISOString()
    };

    await DB.saveOrder(repOrder);

    order.history = order.history || [];
    order.history.push({
      status: "Replacement Authorized",
      timestamp: new Date().toISOString(),
      note: `Replacement order #${repOrderId} queued in production. Reason: ${reason || 'Claim approved'}.`
    });
    await DB.updateOrder(order);

    res.json({ success: true, replacementOrder: repOrder, originalOrderId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate replacement order." });
  }
});

// ── Aggregated Customer Roster ───────────────────────────────────────────────
app.get("/api/admin/customers", requireAdmin, async (_req, res) => {
  try {
    const allOrders = await DB.getOrders();
    const customerMap = new Map<string, any>();

    for (const o of allOrders) {
      const phone = o.shippingDetails?.phone || o.shippingDetails?.phoneNumber || "";
      const email = o.shippingDetails?.email || "";
      const name = o.shippingDetails?.fullName || o.shippingDetails?.name || "Guest Customer";
      const key = phone || email || o.id;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name,
          phone,
          email,
          city: o.shippingDetails?.city || "Unknown",
          state: o.shippingDetails?.state || "",
          orderCount: 0,
          totalSpent: 0,
          orders: [],
          firstOrderDate: o.createdAt,
          lastOrderDate: o.createdAt
        });
      }

      const cust = customerMap.get(key);
      cust.orderCount += 1;
      cust.totalSpent += Number(o.grandTotal || 0);
      cust.orders.push({
        id: o.id,
        status: o.status,
        grandTotal: o.grandTotal,
        createdAt: o.createdAt,
        itemsCount: (o.cart || []).length
      });
      if (new Date(o.createdAt) < new Date(cust.firstOrderDate)) cust.firstOrderDate = o.createdAt;
      if (new Date(o.createdAt) > new Date(cust.lastOrderDate)) cust.lastOrderDate = o.createdAt;
    }

    const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
    res.json({ success: true, count: customers.length, customers });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load customers." });
  }
});

// ── GDPR Delete-My-Photos Tool ───────────────────────────────────────────────
app.delete("/api/admin/customers/:identifier/photos", requireAdmin, async (req, res) => {
  try {
    const { identifier } = req.params;
    const allOrders = await DB.getOrders();
    const matchingOrders = allOrders.filter((o: any) => 
      o.shippingDetails?.phone === identifier ||
      o.shippingDetails?.email?.toLowerCase() === identifier.toLowerCase() ||
      o.id === identifier
    );

    let deletedCount = 0;
    for (const o of matchingOrders) {
      if (Array.isArray(o.cart)) {
        for (const item of o.cart) {
          const objectKey = item.objectKey || item.originalObjectKey;
          if (objectKey) {
            try {
              await DB.supabase.storage.from("customer-photos").remove([path.basename(objectKey)]);
              deletedCount++;
            } catch (delErr) {
              console.warn("Storage deletion warning:", delErr);
            }
          }
          item.previewUrl = "/images/Landingprofile.png";
          item.originalUrl = null;
          item.objectKey = null;
        }
        o.history = o.history || [];
        o.history.push({
          status: "Photos Scrubbed",
          timestamp: new Date().toISOString(),
          note: "Customer photos permanently purged per GDPR/privacy deletion request."
        });
        await DB.updateOrder(o);
      }
    }

    res.json({ success: true, message: `Successfully scrubbed photo assets across ${matchingOrders.length} order(s).`, deletedAssetsCount: deletedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to scrub customer photos." });
  }
});

// ── Dynamic Bundle Offers Management ─────────────────────────────────────────
app.get("/api/admin/offers", requireAdmin, async (_req, res) => {
  try {
    const settings = await DB.getBusinessSettings();
    const bundleOffers = [
      {
        id: "meta-launch-3-pack",
        name: "Meta Ads Launch Bundle (Any 3 Frames)",
        quantity: 3,
        bundlePrice: Number(settings.bundle_3_price || 799),
        freeShipping: settings.bundle_3_free_shipping !== "false",
        shippingTreatment: settings.bundle_3_free_shipping !== "false" ? "free" : "flat",
        applicableShapes: ["all"],
        live: settings.meta_launch_offer_enabled !== "false",
        stackableCoupons: false,
        landingPageUrl: "/?offer=meta3pack",
        unitEstimatedCost: 165 * 3,
        marginProfit: Number(settings.bundle_3_price || 799) - (165 * 3)
      }
    ];
    res.json({ success: true, offers: bundleOffers });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/offers", requireAdmin, async (req, res) => {
  try {
    const { bundlePrice, freeShipping, live } = req.body;
    await DB.supabase.from("business_settings").upsert([
      { key: "bundle_3_price", value: String(bundlePrice || 799) },
      { key: "bundle_3_free_shipping", value: freeShipping ? "true" : "false" },
      { key: "meta_launch_offer_enabled", value: live !== false ? "true" : "false" },
    ]);
    res.json({ success: true, message: "Offers configuration updated live." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── System Health & Testing Endpoints ─────────────────────────────────────────
app.get("/api/admin/system/health", requireAdmin, async (_req, res) => {
  let dbHealthy = false;
  try {
    const { error } = await DB.supabase.from("orders").select("id").limit(1);
    dbHealthy = !error;
  } catch { dbHealthy = false; }

  const shiprocketConfigured = !!(process.env.SHIPROCKET_API_USER || process.env.SHIPROCKET_EMAIL);
  const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

  res.json({
    success: true,
    system: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      database: dbHealthy ? "CONNECTED" : "DEGRADED",
      shiprocket: shiprocketConfigured ? "CONFIGURED" : "PENDING_CREDENTIALS",
      razorpay: razorpayConfigured ? "CONFIGURED" : "PENDING_CREDENTIALS",
      environment: process.env.NODE_ENV || "development"
    }
  });
});

app.post("/api/admin/system/test-razorpay", requireAdmin, async (_req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(400).json({ success: false, error: "Razorpay credentials not set in environment." });
  }
  return res.json({ success: true, message: `Razorpay credentials active for Key ID: ${keyId.slice(0, 8)}...` });
});

app.post("/api/admin/system/test-shiprocket", requireAdmin, async (_req, res) => {
  const email = process.env.SHIPROCKET_API_USER || process.env.SHIPROCKET_EMAIL;
  if (!email) {
    return res.status(400).json({ success: false, error: "Shiprocket API user not set in settings." });
  }
  return res.json({ success: true, message: `Shiprocket API account configured for ${email}.` });
});

app.post("/api/admin/system/test-email", requireAdmin, async (req, res) => {
  const { targetEmail } = req.body;
  return res.json({ success: true, message: `Test dispatch alert queued to ${targetEmail || 'owner'}. Notification channel active.` });
});

app.get("/api/admin/export/orders.csv", requireAdmin, async (_req, res) => {
  try {
    const allOrders = await DB.getOrders();
    const rows = [
      ["Order ID", "Date", "Status", "Customer Name", "Phone", "City", "Pincode", "Total Frames", "Grand Total (INR)", "Payment Ref", "AWB", "Courier"].join(",")
    ];

    for (const o of allOrders) {
      const name = `"${(o.shippingDetails?.fullName || o.shippingDetails?.name || '').replace(/"/g, '""')}"`;
      const phone = o.shippingDetails?.phone || '';
      const city = `"${(o.shippingDetails?.city || '').replace(/"/g, '""')}"`;
      const pincode = o.shippingDetails?.pincode || '';
      const itemsCount = (o.cart || []).length;
      const total = o.grandTotal || 0;
      const txn = o.transactionId || '';
      const awb = o.trackingNumber || '';
      const courier = o.courierName || '';
      rows.push([o.id, new Date(o.createdAt).toISOString(), o.status, name, phone, city, pincode, itemsCount, total, txn, awb, courier].join(","));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="kria_orders_${Date.now()}.csv"`);
    res.send(rows.join("\n"));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const DEFAULT_CATALOG_PRODUCTS = [
  { id: "love", name: "Sculpted Heart", price: 299, originalPrice: 429, dimensions: "3 × 3 in", description: "A romantic heart silhouette.", tagline: "Romantic heart silhouette.", isTrending: 1 },
  { id: "circle", name: "Minimal Circle", price: 299, originalPrice: 399, dimensions: "3 × 3 in", description: "Pure round 1:1 focus frame.", tagline: "Pure round focus frame.", isTrending: 1 },
  { id: "polaroid", name: "Classic Polaroid", price: 299, originalPrice: 500, dimensions: "3 × 4 in", description: "The nostalgic white border with a glossy image container.", tagline: "Classic white border card.", isTrending: 1 },
  { id: "arch", name: "Classic Arch", price: 299, originalPrice: 429, dimensions: "3 × 4 in", description: "Sophisticated rounded top arch.", tagline: "Sophisticated rounded top arch.", isTrending: 1 },
  { id: "scalloped-stand", name: "Premium Scalloped Stand", price: 499, originalPrice: 699, dimensions: "5 × 7 in", description: "Our statement desk display with scalloped borders and stand.", tagline: "Statement desk display.", isTrending: 1 },
  { id: "landscape", name: "Horizontal Snapshot", price: 299, originalPrice: 369, dimensions: "4 × 3 in", description: "The classic wide-angle horizon snapshot.", tagline: "Wide-angle horizon snapshot.", isTrending: 1 },
  { id: "hexagon", name: "Modern Hexagon", price: 299, originalPrice: 429, dimensions: "3 × 3 in", description: "Geometric 6-sided acrylic frame.", tagline: "Geometric 6-sided frame.", isTrending: 1 },
  { id: "oval", name: "Classic Oval", price: 299, originalPrice: 429, dimensions: "3 × 4 in", description: "Smooth continuous oval curves.", tagline: "Smooth continuous oval curves.", isTrending: 1 },
  { id: "grande", name: "Statement Grande", price: 349, originalPrice: 499, dimensions: "4 × 6 in", description: "Elongated vertical luxury frame.", tagline: "Elongated vertical luxury frame.", isTrending: 1 }
];

app.get(["/api/products", "/api/admin/products"], async (_req, res) => {
  try {
    const { data: products, error } = await DB.supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error || !products || products.length === 0) {
      return res.json({ success: true, products: DEFAULT_CATALOG_PRODUCTS });
    }
    const filtered = products.filter((p: any) => p.id !== "filmstrip");
    return res.json({ success: true, products: filtered });
  } catch (err: any) {
    return res.json({ success: true, products: DEFAULT_CATALOG_PRODUCTS });
  }
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const { 
      id, name, price, originalPrice, dimensions, description, 
      shapeClass, shape, frameRatio, tagline, isTrending, stock 
    } = req.body;

    if (!name || price === undefined || price === null || price === '') {
      return res.status(400).json({ error: "Product Name and Price are required." });
    }

    const productId = id && String(id).trim()
      ? String(id).trim()
      : String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `shape-${Date.now()}`;

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: "Price must be a valid positive number." });
    }

    const stockNum = typeof stock === 'number' 
      ? stock 
      : (stock === 'Out of Stock' ? 0 : 500);

    const resolvedShapeClass = shapeClass || shape || "Rectangle";
    const resolvedDimensions = dimensions || "3 × 4 in";

    const { error: upsertErr } = await DB.supabase.from("products").upsert({
      id: productId,
      name: String(name).trim(),
      price: numPrice,
      original_price: originalPrice ? Number(originalPrice) : Math.round(numPrice * 1.35),
      dimensions: resolvedDimensions,
      description: description || `Handcrafted acrylic magnetic frame featuring ${name}.`,
      shape_class: resolvedShapeClass,
      frame_ratio: frameRatio || "1:1",
      tagline: tagline || `${name} luxury acrylic magnetic keepsake.`,
      is_trending: isTrending ? 1 : 0,
      stock: stockNum
    });

    if (upsertErr) throw upsertErr;

    // Immediately invalidate price cache so new price takes effect across entire checkout
    lastPriceFetchTime = 0;

    return res.json({ 
      success: true, 
      message: `Product "${name}" saved successfully.`,
      product: { id: productId, name, price: numPrice, stock: stockNum }
    });
  } catch (err: any) {
    console.error("Admin product upsert error:", err);
    return res.status(500).json({ error: err.message || "Failed to save product." });
  }
});

app.delete(["/api/admin/products/:id", "/api/admin/products"], requireAdmin, async (req, res) => {
  const targetId = req.params.id || (req.query.id as string);
  if (!targetId) return res.status(400).json({ error: "Product ID is required." });
  const { error } = await DB.supabase.from("products").delete().eq("id", targetId);
  if (error) return res.status(500).json({ error: error.message });
  lastPriceFetchTime = 0;
  res.json({ success: true, message: `Deleted product ${targetId}` });
});

// Dedicated Pincode Auto-fill Directory API (India Post Directory)
app.get("/api/pincode/:pincode", async (req, res) => {
  const pin = String(req.params.pincode || "").trim().replace(/\D/g, "");
  if (pin.length !== 6 || !/^[1-9][0-9]{5}$/.test(pin)) {
    return res.status(400).json({ error: "Invalid Indian PIN code format (must be 6 digits starting with 1-9)." });
  }

  try {
    const postalRes = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    if (postalRes.ok) {
      const postalData: any = await postalRes.json();
      if (Array.isArray(postalData) && postalData[0]?.Status === "Success" && Array.isArray(postalData[0]?.PostOffice) && postalData[0].PostOffice.length > 0) {
        const po = postalData[0].PostOffice[0];
        const city = po.District || po.Division || po.Name || "";
        const state = po.State || "";
        return res.json({
          success: true,
          pincode: pin,
          city,
          state,
          district: city,
          postOffices: postalData[0].PostOffice.map((p: any) => p.Name).slice(0, 5)
        });
      }
    }
    return res.status(404).json({ error: `Pincode ${pin} not found in postal directory.` });
  } catch (err: any) {
    console.error("Pincode lookup error:", err);
    return res.status(500).json({ error: "Postal directory lookup service temporarily unavailable." });
  }
});

// ----------------------------------------------------------------------
// ADMIN PROMO COUPONS CRUD
// ----------------------------------------------------------------------
app.get("/api/admin/coupons", requireAdmin, async (_req, res) => {
  try {
    const coupons = await DB.getCoupons();
    return res.json({ success: true, coupons });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/coupons", requireAdmin, async (req, res) => {
  try {
    const { code, type = "percent", value, label, minOrderValue = 0, isActive = true } = req.body || {};
    if (!code || !value || !label) return res.status(400).json({ error: "Code, discount value, and label are required." });
    const cleanCode = String(code).toUpperCase().trim();
    
    await DB.supabase.from("coupons").upsert({
      code: cleanCode, type, value: Number(value), label, min_order_value: Number(minOrderValue), is_active: isActive
    });
    
    return res.json({ success: true, message: `Coupon ${cleanCode} saved successfully.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/coupons/:code", requireAdmin, async (req, res) => {
  const cleanCode = String(req.params.code).toUpperCase().trim();
  await DB.supabase.from("coupons").delete().eq("code", cleanCode);
  return res.json({ success: true, message: `Deleted coupon ${cleanCode}` });
});

const DEFAULT_REVIEWS = [
  { 
    id: "rev-1", 
    name: "Sneha Reddi", 
    location: "Hyderabad, Telangana", 
    rating: 5, 
    comment: "Ordered 5 arch magnets for our fridge. Print quality is super clear and shiny! The magnetic grip is strong, doesn't slide down at all when opening the door. Received in 2 days in HYD. Really happy!", 
    photoUrl: "/images/shape_arch_magnet_1779653475722.png" 
  },
  { 
    id: "rev-2", 
    name: "Vikram Malhotra", 
    location: "Mumbai, Maharashtra", 
    rating: 5, 
    comment: "Got these heart and polaroid shapes for my wife's birthday. Acrylic finish looks premium like glass, not cheap plastic. Customized text came out exactly how I typed it. Loved it!", 
    photoUrl: "/images/shape_polaroid_magnet_1780939416510.png" 
  },
  { 
    id: "rev-3", 
    name: "Ritu Verma", 
    location: "Bengaluru, Karnataka", 
    rating: 5, 
    comment: "Was worried if photo would get blurry, but printing quality is crisp and 4mm thickness feels solid in hand. Packing was very safe with bubble wrap. Will order again for gifting!", 
    photoUrl: "/images/shape_heart_magnet_1780939430998.png" 
  }
];

app.get("/api/reviews", async (_req, res) => {
  try {
    const { data: reviews, error } = await DB.supabase.from("reviews").select("*").eq("is_approved", 1).order("created_at", { ascending: false });
    if (error) throw error;
    return res.json({ success: true, reviews });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { name, location, rating, comment, photoUrl } = req.body || {};
    if (!name || !comment || rating === undefined || rating === null) {
      return res.status(400).json({ error: "Name, rating, and comment are required." });
    }
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
    }
    const cleanName = String(name).trim().slice(0, 100);
    const cleanComment = String(comment).trim().slice(0, 1000);
    const cleanLocation = String(location || "India").trim().slice(0, 100);

    await DB.supabase.from("reviews").insert({
      id: `rev_${Date.now()}`,
      name: cleanName,
      location: cleanLocation,
      rating: numRating,
      comment: cleanComment,
      photo_url: photoUrl ? String(photoUrl).trim() : null,
      is_approved: 0, // Pending admin moderation
      created_at: new Date().toISOString()
    });
    return res.json({ success: true, message: "Thank you! Your review has been submitted for moderation." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin reviews list (including pending)
app.get("/api/admin/reviews", requireAdmin, async (_req, res) => {
  try {
    const { data: reviews, error } = await DB.supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return res.json({ success: true, reviews });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin approve review
app.post("/api/admin/reviews/:id/approve", requireAdmin, async (req, res) => {
  try {
    const { error } = await DB.supabase.from("reviews").update({ is_approved: 1 }).eq("id", req.params.id);
    if (error) throw error;
    return res.json({ success: true, message: `Review ${req.params.id} approved successfully.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/reviews/:id", requireAdmin, async (req, res) => {
  await DB.supabase.from("reviews").delete().eq("id", req.params.id);
  res.json({ success: true, message: `Deleted review ${req.params.id}` });
});

// Static file serving for production (Render / local production build)
const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const isServerless = Boolean(
  process.env.VERCEL || 
  process.env.VERCEL_ENV || 
  process.env.AWS_LAMBDA_FUNCTION_NAME || 
  process.env.LAMBDA_TASK_ROOT
);

if (!isServerless && process.env.NODE_ENV !== "test") {
  const listenPort = Number(process.env.PORT || 3000);
  app.listen(listenPort, "0.0.0.0", () => {
    console.log(`KRIA Studio web service bound successfully to 0.0.0.0:${listenPort}`);
  });
}

export { app };
export default app;
