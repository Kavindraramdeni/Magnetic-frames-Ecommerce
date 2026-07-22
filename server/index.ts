import express from "express";

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Razorpay order creation endpoint
app.post("/api/razorpay/create-order", (req, res) => {
  const { amount = 6000, currency = "INR" } = req.body || {};
  
  const mockOrderId = "order_" + Math.random().toString(36).substring(2, 14);
  
  res.status(200).json({
    id: mockOrderId,
    entity: "order",
    amount: amount || 6000,
    amount_paid: 0,
    amount_due: amount || 6000,
    currency: currency || "INR",
    receipt: `rcpt_${Date.now()}`,
    status: "created",
    attempts: 0,
    notes: [],
    created_at: Math.floor(Date.now() / 1000),
    key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key"
  });
});

// Order confirmation / verification endpoint
app.post("/api/orders/confirm", (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, cart, shippingDetails } = req.body || {};
  
  const mockOrderNumber = "KRIA-" + Math.floor(100000 + Math.random() * 900000);
  
  res.status(200).json({
    success: true,
    message: "Order confirmed successfully",
    order: {
      id: mockOrderNumber,
      status: "PAID",
      transaction_id: razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 14)}`,
      razorpay_order_id: razorpay_order_id || `order_${Math.random().toString(36).substring(2, 14)}`,
      tracking_number: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      courier_name: "Shiprocket Express Air",
      delivery_estimate: "3-5 Business Days",
      created_at: new Date().toISOString(),
      shippingDetails: shippingDetails || {},
      cart: cart || []
    }
  });
});

if (process.env.RUN_STANDALONE === "true") {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Standalone Express server running on port ${PORT}`);
  });
}

export default app;
