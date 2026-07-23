import express from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import { DatabaseSync } from "node:sqlite";
import { createServer as createViteServer } from "vite";

import { SHAPE_PRICES } from "./src/catalog";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"));
const UPLOAD_DIR = path.resolve(process.env.OBJECT_STORAGE_DIR || path.join(DATA_DIR, "object-storage"));
const DB_FILE = path.resolve(process.env.DATABASE_URL?.replace(/^sqlite:/, "") || path.join(DATA_DIR, "kria.sqlite"));
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || (ADMIN_PASSWORD ? crypto.createHash("sha256").update(ADMIN_PASSWORD).digest("hex") : "");
const ENABLE_MOCK_CHECKOUT = process.env.ENABLE_MOCK_CHECKOUT === "true" && !isProduction;
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 120);

if (isProduction && (!ADMIN_PASSWORD && !process.env.ADMIN_TOKEN)) {
  throw new Error("ADMIN_PASSWORD or ADMIN_TOKEN is required in production.");
}

try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (e) {
  console.warn("[AI Studio] Warning: Could not create storage directories, using memory/tmp fallbacks:", e);
}

let db: DatabaseSync;
try {
  db = new DatabaseSync(DB_FILE);
} catch (err) {
  console.warn("[AI Studio] Could not open SQLite file at", DB_FILE, "- falling back to in-memory SQLite database:", err);
  db = new DatabaseSync(":memory:");
}
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    cart_json TEXT NOT NULL,
    shipping_json TEXT NOT NULL,
    tracking_number TEXT NOT NULL,
    courier_name TEXT NOT NULL,
    delivery_estimate TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    totals_json TEXT NOT NULL,
    history_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
  CREATE TABLE IF NOT EXISTS checkout_sessions (
    id TEXT PRIMARY KEY,
    razorpay_order_id TEXT UNIQUE NOT NULL,
    cart_json TEXT NOT NULL,
    shipping_json TEXT NOT NULL,
    totals_json TEXT NOT NULL,
    accepted_policies INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS payment_events (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    external_payment_id TEXT,
    external_order_id TEXT,
    payload_json TEXT NOT NULL,
    processed_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    dimensions TEXT NOT NULL,
    description TEXT NOT NULL,
    shape_class TEXT NOT NULL,
    frame_ratio TEXT NOT NULL,
    tagline TEXT NOT NULL,
    is_trending INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

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

function getOrders() {
  return db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all().map(serializeOrder);
}

function saveOrder(order: any) {
  db.prepare(`INSERT OR REPLACE INTO orders
    (id, status, cart_json, shipping_json, tracking_number, courier_name, delivery_estimate, transaction_id, totals_json, history_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    order.id,
    order.status,
    JSON.stringify(order.cart),
    JSON.stringify(order.shippingDetails),
    order.trackingNumber,
    order.courierName,
    order.deliveryEstimate,
    order.transactionId,
    JSON.stringify({ grandTotal: order.grandTotal, subtotal: order.subtotal, bulkDiscount: order.bulkDiscount, deliveryCharge: order.deliveryCharge }),
    JSON.stringify(order.history),
    order.createdAt
  );
}

function saveCheckoutSession(session: any) {
  db.prepare(`INSERT OR REPLACE INTO checkout_sessions
    (id, razorpay_order_id, cart_json, shipping_json, totals_json, accepted_policies, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    session.id,
    session.razorpayOrderId,
    JSON.stringify(session.cart),
    JSON.stringify(session.shippingDetails || {}),
    JSON.stringify(session.totals),
    session.acceptedPolicies ? 1 : 0,
    session.createdAt
  );
}

function getCheckoutSession(razorpayOrderId: string) {
  const session = db.prepare("SELECT * FROM checkout_sessions WHERE razorpay_order_id = ?").get(razorpayOrderId) as any;
  if (!session) return null;
  return {
    id: session.id,
    razorpayOrderId: session.razorpay_order_id,
    cart: JSON.parse(session.cart_json),
    shippingDetails: JSON.parse(session.shipping_json),
    totals: JSON.parse(session.totals_json),
    acceptedPolicies: Boolean(session.accepted_policies),
    createdAt: session.created_at,
  };
}

function savePaymentEvent(event: any) {
  db.prepare(`INSERT OR IGNORE INTO payment_events
    (id, provider, event_type, external_payment_id, external_order_id, payload_json, processed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(event.id, event.provider, event.eventType, event.externalPaymentId, event.externalOrderId, JSON.stringify(event.payload), event.processedAt);
}

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

function calculateOrderTotals(cart: any[], couponCode?: string) {
  let subtotal = 0;
  cart.forEach((item: any) => {
    const backendPrice = SHAPE_PRICES[item.shapeId as keyof typeof SHAPE_PRICES] || SHAPE_PRICES.custom;
    const qty = Math.max(1, Math.min(99, parseInt(item.quantity) || 1));
    subtotal += backendPrice * qty;
  });

  let couponDiscount = 0;
  let forceFreeShipping = false;

  if (couponCode) {
    const cleanCode = String(couponCode).toUpperCase().trim();
    const coupon = VALID_COUPONS[cleanCode];
    if (coupon) {
      if (coupon.type === "percent") {
        couponDiscount = Math.round((subtotal * coupon.value) / 100);
      } else if (coupon.type === "flat") {
        couponDiscount = Math.min(subtotal, coupon.value);
      } else if (coupon.type === "free_shipping") {
        forceFreeShipping = true;
      }
    }
  }

  const deliveryCharge = (subtotal === 0) ? 0 : (forceFreeShipping || subtotal >= 699 ? 0 : 60);
  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryCharge);
  
  return { subtotal, couponDiscount, deliveryCharge, grandTotal };
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
  if (!whatsappUrl) return false;

  const phone = String(order.shippingDetails?.phone || "").replace(/\D/g, "");
  const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;

  let whatsappText = `Hi ${order.shippingDetails?.fullName || "Valued Customer"}! ✨ `;
  if (event.includes("confirmed") || event.includes("Paid")) {
    whatsappText += `Your KRIA Studio order *${order.id}* (Total: ₹${order.grandTotal}) is *CONFIRMED*! 🎉 Our artisans are hand-crafting your acrylic magnets. Tracking AWB: *${order.trackingNumber || "Assigned on Dispatch"}*.`;
  } else if (event.includes("Shipped") || event.includes("Dispatched")) {
    whatsappText += `Your order *${order.id}* has been *DISPATCHED* via *${order.courierName || "Express Courier"}*! 🚀 Tracking AWB: *${order.trackingNumber}*. Expected Delivery: 2-4 days.`;
  } else {
    whatsappText += `Update for order *${order.id}*: ${event}.`;
  }

  // Compatible payload for Wati, Interakt, Twilio & custom WhatsApp Webhook bridges
  const whatsappPayload = {
    phone: formattedPhone,
    recipient: formattedPhone,
    message: whatsappText,
    template_name: event.includes("Shipped") ? "order_dispatched_alert" : "order_confirmation_alert",
    parameters: [
      { name: "name", value: order.shippingDetails?.fullName },
      { name: "order_id", value: order.id },
      { name: "tracking", value: order.trackingNumber || "SRW-8910" },
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
  
  let eventMsg = `Your KRIA order ${order.id} update: ${event}.`;
  if (event.includes("confirmed") || event.includes("Paid")) {
    eventMsg = `Hi ${customerName}! ✨ Your KRIA Studio order ${order.id} (₹${order.grandTotal}) is confirmed! Our artisans are preparing your custom acrylic items. Tracking AWB: ${tracking}.`;
  } else if (event.includes("Printing")) {
    eventMsg = `🎨 Production Update for ${order.id}: Your photo designs are currently being printed & laser-cut with high-precision UV inks.`;
  } else if (event.includes("Shipped") || event.includes("Logistics") || event.includes("In Transit")) {
    eventMsg = `🚀 Dispatched! Your package ${order.id} is on its way via ${courier}! Track shipment with AWB ${tracking}. Estimated delivery: ${order.deliveryEstimate || "2-4 days"}.`;
  } else if (event.includes("Delivered")) {
    eventMsg = `🎁 Delivered! Your KRIA Studio package ${order.id} has been delivered. We hope you love your custom photo magnets! Tag us @KriaStudio!`;
  }

  // Trigger Automated WhatsApp Notification
  const whatsappSent = await sendWhatsAppNotification(order, event);

  const payload = {
    orderId: order.id,
    customerName,
    phone: order.shippingDetails?.phone,
    email: order.shippingDetails?.email,
    event,
    message: eventMsg,
    trackingNumber: tracking,
    courierName: courier,
    grandTotal: order.grandTotal,
    timestamp: new Date().toISOString()
  };

  const configuredChannels = [
    ["email", process.env.EMAIL_WEBHOOK_URL || process.env.NOTIFICATION_WEBHOOK_URL],
    ["sms", process.env.SMS_WEBHOOK_URL],
  ].filter(([, url]) => Boolean(url)) as [string, string][];

  if (configuredChannels.length === 0 && !whatsappSent) {
    console.log(`[NOTIFICATION LOG] ${eventMsg}`);
    return { sent: false, channel: "console", message: eventMsg };
  }

  const results = await Promise.all(configuredChannels.map(async ([channel, url]) => ({
    channel,
    sent: await postNotificationWebhook(url, payload),
  })));

  return { sent: whatsappSent || results.some((result) => result.sent), channel: "whatsapp,email,sms", message: eventMsg };
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
app.use(express.json({
  limit: "15mb",
  verify: (req: express.Request & { rawBody?: Buffer }, _res, buf) => {
    req.rawBody = Buffer.from(buf);
  }
}));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
app.use("/api", (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
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
  if (shippingDetails.fullName.trim().length < 3) return "Please enter your complete full name (minimum 3 letters).";
  if (!/^\S+@\S+\.\S+$/.test(shippingDetails.email.trim())) return "A valid email address is required.";
  const cleanPhone = shippingDetails.phone.replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) return "A valid 10-digit Indian mobile number is required for SMS/WhatsApp updates.";
  if (shippingDetails.address.trim().length < 10) return "Please provide a complete street address with landmark/house number (minimum 10 characters).";
  const cleanPin = shippingDetails.pincode.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) return "Please enter a valid 6-digit Indian pincode (must not start with 0).";
  // Validate first digit maps to a real India postal zone (1–9)
  const firstDigit = parseInt(cleanPin[0]);
  if (firstDigit < 1 || firstDigit > 9) return "Invalid pincode — Indian pincodes start with 1–9.";
  return null;
}

function validateCart(cart: any[]) {
  if (!Array.isArray(cart) || cart.length === 0) return "Your customizer design tray is empty.";
  if (cart.length > 50) return "Please contact KRIA Studio for carts above 50 line items.";
  for (const item of cart) {
    if (!item.shapeId || !(item.shapeId in SHAPE_PRICES)) return "Invalid product shape selected.";
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) return "Invalid quantity in cart.";
    if (!item.previewUrl || typeof item.previewUrl !== "string") return "Each item needs a stored preview image.";
  }
  return null;
}
app.use("/stored-assets", express.static(UPLOAD_DIR, { immutable: true, maxAge: "1y" }));

app.post("/api/admin/session", (req, res) => {
  const { password } = req.body || {};
  if (!ADMIN_PASSWORD && !process.env.ADMIN_TOKEN && !isProduction) return res.json({ token: ADMIN_TOKEN || "dev-admin" });
  if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) return res.json({ token: ADMIN_TOKEN });
  return res.status(401).json({ error: "Invalid admin password." });
});

app.post("/api/uploads/image", async (req, res) => {
  const { dataUrl, fileName } = req.body || {};
  if (!dataUrl || typeof dataUrl !== "string") return res.status(400).json({ error: "Missing image payload." });
  const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/);
  if (!match) return res.status(400).json({ error: "Only png, jpg, jpeg, and webp images are accepted." });
  const buffer = Buffer.from(match[3], "base64");
  if (buffer.length > 10 * 1024 * 1024) return res.status(400).json({ error: "Image must be under 10MB." });
  const ext = match[2] === "jpeg" ? "jpg" : match[2];
  const id = crypto.randomUUID();
  const safeName = String(fileName || "customer-photo").replace(/[^a-z0-9._-]/gi, "-").slice(0, 80);
  const storedName = `${id}-${safeName}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, storedName), buffer);
  return res.json({ url: `/stored-assets/${storedName}`, objectKey: storedName });
});

app.get("/api/catalog", (_req, res) => res.json({ prices: SHAPE_PRICES }));

app.post("/api/checkout/validate-coupon", (req, res) => {
  const { couponCode, cart = [] } = req.body || {};
  if (!couponCode) return res.status(400).json({ error: "Coupon code is required." });
  const cleanCode = String(couponCode).toUpperCase().trim();
  const coupon = VALID_COUPONS[cleanCode];
  if (!coupon) return res.status(404).json({ error: "Invalid coupon code. Try KRIA10 or WELCOME15" });

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

function createPaidOrderFromSession(session: any, paymentId: string, isMock = false) {
  const existing = getOrders().find((order: any) => order.transactionId === paymentId);
  if (existing) return existing;
  const { grandTotal, subtotal, bulkDiscount, deliveryCharge } = calculateOrderTotals(session.cart);
  const order = {
    id: `KRIA-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "Paid",
    cart: session.cart,
    shippingDetails: session.shippingDetails,
    trackingNumber: `SRW-${Math.floor(100000000 + Math.random() * 900000000)}`,
    courierName: "Delhivery Surface",
    deliveryEstimate: "3-5 Business Days",
    transactionId: paymentId,
    createdAt: new Date().toISOString(),
    grandTotal,
    subtotal,
    bulkDiscount,
    deliveryCharge,
    history: [{ status: "Paid", timestamp: new Date().toISOString(), note: isMock ? "Development mock payment confirmed." : "Razorpay server-side payment confirmation captured." }]
  };
  saveOrder(order);
  return order;
}

app.post("/api/checkout/create-order", async (req, res) => {
  try {
    const { cart, shippingDetails, acceptedPolicies = true } = req.body;
    const cartError = validateCart(cart);
    if (cartError) return res.status(400).json({ error: cartError });
    const shippingError = validateShippingDetails(shippingDetails);
    if (shippingError) return res.status(400).json({ error: shippingError });
    const { grandTotal, subtotal, deliveryCharge, bulkDiscount } = calculateOrderTotals(cart);
    const rzpKeyId = process.env.RAZORPAY_KEY_ID;
    const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!rzpKeyId || !rzpKeySecret) {
      if (!ENABLE_MOCK_CHECKOUT) return res.status(503).json({ error: "Payment gateway is not configured. Mock checkout is disabled outside development." });
      const mockOrderId = `order_mock_${crypto.randomUUID()}`;
      saveCheckoutSession({ id: crypto.randomUUID(), razorpayOrderId: mockOrderId, cart, shippingDetails, totals: { subtotal, deliveryCharge, bulkDiscount, grandTotal }, acceptedPolicies, createdAt: new Date().toISOString() });
      return res.json({ orderId: mockOrderId, amount: grandTotal * 100, currency: "INR", isMock: true, subtotal, deliveryCharge, bulkDiscount, grandTotal, razorpayKeyId: "rzp_test_mock_key_studio_kria" });
    }
    const authString = Buffer.from(`${rzpKeyId}:${rzpKeySecret}`).toString("base64");
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${authString}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount: grandTotal * 100, currency: "INR", receipt: `receipt_kria_${Date.now()}` }) });
    if (!rzpResponse.ok) throw new Error(`Razorpay gateway error: ${await rzpResponse.text()}`);
    const rzpOrder: any = await rzpResponse.json();
    saveCheckoutSession({ id: crypto.randomUUID(), razorpayOrderId: rzpOrder.id, cart, shippingDetails, totals: { subtotal, deliveryCharge, bulkDiscount, grandTotal }, acceptedPolicies, createdAt: new Date().toISOString() });
    return res.json({ orderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, isMock: false, subtotal, deliveryCharge, bulkDiscount, grandTotal, razorpayKeyId: rzpKeyId });
  } catch (error: any) { res.status(500).json({ error: error.message || "Failed to establish a secure transaction session." }); }
});

app.post("/api/checkout/verify-payment", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, cart, shippingDetails, isMock, acceptedPolicies } = req.body;
    const cartError = validateCart(cart);
    if (cartError) return res.status(400).json({ error: cartError });
    const shippingError = validateShippingDetails(shippingDetails);
    if (shippingError) return res.status(400).json({ error: shippingError });
    if (!acceptedPolicies) return res.status(400).json({ error: "Please accept KRIA Studio policies before placing the order." });
    if (isMock && !ENABLE_MOCK_CHECKOUT) return res.status(403).json({ error: "Mock payments are disabled." });
    if (!isMock) {
      const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!rzpKeySecret) return res.status(500).json({ error: "Gateway credential error. Verification failed." });
      const generatedSignature = crypto.createHmac("sha256", rzpKeySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
      if (generatedSignature !== razorpay_signature) return res.status(400).json({ error: "Cryptographic signature validation failed. Potential tampering." });
    }
    const { grandTotal, subtotal, bulkDiscount, deliveryCharge } = calculateOrderTotals(cart);
    const shiprocketToken = await getShiprocketToken();
    let trackingNumber = `SRW-${Math.floor(100000000 + Math.random() * 900000000)}`;
    let courierName = "Delhivery Surface";
    let isRealShipment = false;
    if (shiprocketToken) {
      try {
        const shipResponse = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${shiprocketToken}` }, body: JSON.stringify({ order_id: `KRIA_ORDER_${Date.now()}`, order_date: new Date().toISOString().split('T')[0] + " 10:00", pickup_location: "KRIA Studio Warehouse", billing_customer_name: shippingDetails.fullName, billing_last_name: "", billing_address: shippingDetails.address, billing_city: shippingDetails.city, billing_pincode: shippingDetails.pincode, billing_state: shippingDetails.state, billing_country: "India", billing_email: shippingDetails.email, billing_phone: shippingDetails.phone, shipping_is_billing: true, order_items: cart.map((item: any) => ({ name: `${item.shapeName} Acrylic Magnet`, sku: `KRIA-${item.shapeId}`, units: item.quantity, selling_price: SHAPE_PRICES[item.shapeId as keyof typeof SHAPE_PRICES] || SHAPE_PRICES.custom })), payment_method: "Prepaid", sub_total: subtotal, length: 15, width: 15, height: 5, weight: 0.15 * cart.length }) });
        if (shipResponse.ok) { const shipData: any = await shipResponse.json(); if (shipData.shipment_id) { trackingNumber = `SR-${shipData.shipment_id}`; courierName = shipData.courier_name || courierName; isRealShipment = true; } }
      } catch (shipErr) { console.error("Shiprocket order failed", shipErr); }
    }
    const newOrder = { id: `KRIA-ORD-${Math.floor(1000 + Math.random() * 9000)}`, status: "Paid", cart, shippingDetails, trackingNumber, courierName, deliveryEstimate: "3-5 Business Days", transactionId: isMock ? `txn_${crypto.randomUUID()}` : razorpay_payment_id, createdAt: new Date().toISOString(), grandTotal, subtotal, bulkDiscount, deliveryCharge, history: [{ status: "Paid", timestamp: new Date().toISOString(), note: "Order prepaid and policy acceptance captured." }] };
    saveOrder(newOrder);
    const notification = await notifyCustomer(newOrder, "Order confirmed");
    return res.json({ success: true, transactionId: newOrder.transactionId, trackingNumber, courierName, deliveryEstimate: newOrder.deliveryEstimate, isMockCheckout: isMock, isRealShipment, notification, grandTotal });
  } catch (error: any) { res.status(500).json({ error: error.message || "Failed to process final order booking." }); }
});

app.post("/api/shiprocket/check-serviceability", async (req, res) => {
  const { pincode, orderValue, weight = 0.25 } = req.body;
  if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) return res.status(400).json({ error: "Please enter a valid 6-digit Indian pincode (must not start with 0)." });

  const shiprocketToken = await getShiprocketToken();
  if (shiprocketToken) {
    try {
      const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "500085";
      const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_pincode=${pickupPincode}&delivery_pincode=${pincode}&weight=${weight}&cod=0`, {
        headers: { Authorization: `Bearer ${shiprocketToken}` }
      });
      if (response.ok) {
        const data: any = await response.json();
        if (data.status === 200 && data.data?.available_courier_companies?.length > 0) {
          const cheapest = data.data.available_courier_companies.reduce((prev: any, curr: any) => (prev.rate < curr.rate ? prev : curr));
          return res.json({
            serviceable: true,
            pincode,
            estimatedDays: cheapest.etd ? Number(cheapest.etd) : 3,
            shippingCost: Math.round(Number(cheapest.rate) || 60),
            courierName: cheapest.courier_name,
            region: data.data.city || "India",
            isReal: true
          });
        }
      }
    } catch (err) {
      console.error("Shiprocket rate API fetch failed:", err);
    }
  }

  const statePrefix = pincode.substring(0, 2);
  let region = "National", estDays = 4, courierName = "Delhivery Surface";
  if (["11","12","13","14","15","16","17","18","19"].includes(statePrefix)) { region = "North India"; estDays = 3; courierName = "BlueDart Express"; }
  else if (["40","41","42","43","44","45","46","47","48","49"].includes(statePrefix)) { region = "West/Central India"; estDays = 3; courierName = "Delhivery Express"; }
  else if (["50","51","52","53","56","57","58","59","60","61","62","63","64","68","69"].includes(statePrefix)) { region = "South India"; estDays = 2; courierName = "Delhivery Air"; }
  return res.json({ serviceable: true, pincode, estimatedDays: estDays, shippingCost: 60, courierName, region, isReal: false });
});

app.post("/api/webhooks/razorpay", async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(503).json({ error: "Razorpay webhook secret is not configured." });
  const signature = req.headers["x-razorpay-signature"];
  if (typeof signature !== "string") return res.status(400).json({ error: "Missing Razorpay webhook signature." });
  const body = (req as express.Request & { rawBody?: Buffer }).rawBody || Buffer.from(JSON.stringify(req.body));
  const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  if (signature !== expected) return res.status(400).json({ error: "Invalid webhook signature." });

  const eventId = req.body?.payload?.payment?.entity?.id || crypto.randomUUID();
  const payment = req.body?.payload?.payment?.entity;
  savePaymentEvent({ id: eventId, provider: "razorpay", eventType: req.body?.event || "unknown", externalPaymentId: payment?.id, externalOrderId: payment?.order_id, payload: req.body, processedAt: new Date().toISOString() });

  if (req.body?.event === "payment.captured" && payment?.order_id) {
    const session = getCheckoutSession(payment.order_id);
    if (session) {
      const order = createPaidOrderFromSession(session, payment.id, false);
      await notifyCustomer(order, "Payment captured and order confirmed");
    }
  }

  return res.json({ received: true });
});

app.post("/api/webhooks/shiprocket", async (req, res) => {
  try {
    const { awb, current_status, courier_name, order_id } = req.body || {};
    if (!awb && !order_id) return res.status(400).json({ error: "Missing tracking payload." });
    const orders = getOrders();
    const order = orders.find((o: any) => o.trackingNumber === awb || o.id === order_id);
    if (order) {
      const statusMap: { [key: string]: string } = {
        "PICKED UP": "Processing",
        "IN TRANSIT": "Shipped",
        "OUT FOR DELIVERY": "Out For Delivery",
        "DELIVERED": "Delivered",
        "RTO IN TRANSIT": "RTO Returned",
      };
      const nextStatus = statusMap[String(current_status).toUpperCase()] || current_status || "Shipped";
      order.status = nextStatus;
      if (courier_name) order.courierName = courier_name;
      order.history.push({
        status: nextStatus,
        timestamp: new Date().toISOString(),
        note: `Shiprocket live tracking scan: ${current_status} (Courier: ${courier_name || order.courierName})`
      });
      saveOrder(order);
      await notifyCustomer(order, `Logistics update: ${nextStatus}`);
    }
    return res.json({ success: true, processed: Boolean(order) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders/track", (req, res) => {
  const { orderId, emailOrPhone } = req.body || {};
  if (!orderId || !emailOrPhone) return res.status(400).json({ error: "Order ID and email/phone are required." });
  const order = getOrders().find((candidate: any) => candidate.id === orderId);
  if (!order) return res.status(404).json({ error: "Order not found." });
  const lookup = String(emailOrPhone).toLowerCase().trim();
  const email = String(order.shippingDetails.email || "").toLowerCase();
  const phone = String(order.shippingDetails.phone || "").replace(/\D/g, "");
  const lookupPhone = lookup.replace(/\D/g, "");
  const phoneMatches = lookupPhone.length >= 4 && phone.endsWith(lookupPhone);
  if (lookup !== email && !phoneMatches) return res.status(403).json({ error: "Order lookup details did not match." });
  return res.json({
    id: order.id,
    status: order.status,
    trackingNumber: order.trackingNumber,
    courierName: order.courierName,
    deliveryEstimate: order.deliveryEstimate,
    productionLeadTime: "24 Hours Custom Laser Cutting & UV Printing",
    transitEstimate: "2-4 Business Days Express Shipping",
    shippingAddressSummary: `${order.shippingDetails?.city}, ${order.shippingDetails?.state} - ${order.shippingDetails?.pincode}`,
    createdAt: order.createdAt,
    grandTotal: order.grandTotal,
    history: order.history,
  });
});

app.get("/api/admin/orders", requireAdmin, (_req, res) => res.json({ success: true, orders: getOrders() }));

app.post("/api/admin/orders/recover-payments", requireAdmin, async (_req, res) => {
  try {
    const sessions = db.prepare("SELECT * FROM checkout_sessions").all() as any[];
    const recovered: any[] = [];
    for (const session of sessions) {
      const paymentEvents = db.prepare("SELECT * FROM payment_events WHERE external_order_id = ? AND event_type = 'payment.captured'").all(session.razorpay_order_id) as any[];
      for (const event of paymentEvents) {
        const parsedSession = {
          id: session.id,
          razorpayOrderId: session.razorpay_order_id,
          cart: JSON.parse(session.cart_json),
          shippingDetails: JSON.parse(session.shipping_json),
          totals: JSON.parse(session.totals_json)
        };
        const order = createPaidOrderFromSession(parsedSession, event.external_payment_id || `recovered_${Date.now()}`, false);
        recovered.push(order.id);
      }
    }
    return res.json({ success: true, recoveredCount: recovered.length, recoveredOrders: recovered });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const order = getOrders().find((o: any) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order record not found." });
  order.status = req.body.status;
  order.history.push({ status: req.body.status, timestamp: new Date().toISOString(), note: req.body.note || `Status updated to ${req.body.status}.` });
  const notification = await notifyCustomer(order, `Status updated to ${req.body.status}`);
  order.history.push({ status: "Notification", timestamp: new Date().toISOString(), note: notification.message });
  saveOrder(order);
  res.json({ success: true, order, notificationLog: notification.message });
});
app.post("/api/admin/orders/:id/sync-shiprocket", requireAdmin, (req, res) => {
  const order = getOrders().find((o: any) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order record not found." });
  order.trackingNumber = `SRW-${Math.floor(100000000 + Math.random() * 900000000)}`;
  order.history.push({ status: order.status, timestamp: new Date().toISOString(), note: `Fresh AWB generated: ${order.trackingNumber}` });
  saveOrder(order);
  res.json({ success: true, order });
});
app.delete("/api/admin/orders/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM orders WHERE id = ?").run(req.params.id);
  res.json({ success: true, message: `Voided order ${req.params.id}` });
});

app.get("/api/products", (_req, res) => {
  try {
    const products = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all().map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.original_price,
      dimensions: p.dimensions,
      description: p.description,
      shapeClass: p.shape_class,
      frameRatio: p.frame_ratio,
      tagline: p.tagline,
      isTrending: Boolean(p.is_trending)
    }));
    return res.json({ success: true, products });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/products", requireAdmin, (req, res) => {
  try {
    const { id, name, price, originalPrice, dimensions, description, shapeClass, frameRatio, tagline, isTrending } = req.body;
    if (!id || !name || !price) return res.status(400).json({ error: "ID, Name, and Price are required." });
    db.prepare(`INSERT OR REPLACE INTO products
      (id, name, price, original_price, dimensions, description, shape_class, frame_ratio, tagline, is_trending, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, name, price, originalPrice || null, dimensions || "Standard", description || "", shapeClass || "rounded-2xl border-2", frameRatio || "aspect-[4/5]", tagline || "Custom Product", isTrending ? 1 : 0, new Date().toISOString()
    );
    return res.json({ success: true, message: `Product ${name} saved successfully.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ success: true, message: `Deleted product ${req.params.id}` });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`KRIA Studio full-stack active on http://0.0.0.0:${PORT}`));
}

startServer();
