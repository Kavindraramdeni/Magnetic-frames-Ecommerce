/**
 * Server-side Razorpay payment verification helpers.
 *
 * fetchAndVerifyRazorpayPayment performs a server-to-server call to the
 * Razorpay Payments API and asserts:
 *   1. The payment exists and belongs to the expected Razorpay order.
 *   2. The payment status is "captured" (fully settled, not just authorized).
 *   3. The captured amount exactly matches what the server calculated.
 *
 * Never rely solely on the client-supplied signature for payment confirmation.
 * The HMAC signature only proves the callback came from Razorpay; it does NOT
 * prove the amount was captured or that the order ID matches.
 */

export interface RazorpayPaymentDetails {
  id: string;
  entity: string;
  amount: number;       // in paise
  currency: string;
  status: string;       // "created" | "authorized" | "captured" | "refunded" | "failed"
  order_id: string;
  captured: boolean;
  description: string;
  email: string;
  contact: string;
  created_at: number;
}

export interface VerifyPaymentResult {
  ok: true;
  payment: RazorpayPaymentDetails;
}

export interface VerifyPaymentError {
  ok: false;
  reason: string;
  httpStatus?: number;
}

/**
 * Fetch the payment record from Razorpay and validate amount + status.
 *
 * @param paymentId         - razorpay_payment_id from the checkout callback
 * @param expectedOrderId   - razorpay_order_id we created; payment must belong to it
 * @param expectedAmountPaise - grand total in paise (rupees × 100) as calculated server-side
 * @returns VerifyPaymentResult on success, VerifyPaymentError on any mismatch
 */
export async function fetchAndVerifyRazorpayPayment(
  paymentId: string,
  expectedOrderId: string,
  expectedAmountPaise: number
): Promise<VerifyPaymentResult | VerifyPaymentError> {
  const keyId = (process.env.RAZORPAY_KEY_ID || "rzp_test_TGaGgMONy7ZDwz").trim().replace(/['"]/g, "");
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "YXOAZFrYF8Zt0UD8iWE65Wfx").trim().replace(/['"]/g, "");

  if (!keyId || !keySecret) {
    return { ok: false, reason: "Razorpay API credentials not configured." };
  }

  // Basic format guard — prevents SSRF via crafted payment IDs
  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
    return { ok: false, reason: "Invalid payment ID format.", httpStatus: 400 };
  }

  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  let res: Response;
  try {
    res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    });
  } catch (networkErr: any) {
    return { ok: false, reason: `Network error reaching Razorpay: ${networkErr.message}` };
  }

  if (res.status === 404) {
    return { ok: false, reason: `Payment ${paymentId} not found in Razorpay.`, httpStatus: 404 };
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, reason: `Razorpay API error (${res.status}): ${body.slice(0, 200)}`, httpStatus: res.status };
  }

  let payment: RazorpayPaymentDetails;
  try {
    payment = await res.json() as RazorpayPaymentDetails;
  } catch {
    return { ok: false, reason: "Malformed JSON response from Razorpay API." };
  }

  // 1. Status must be captured
  if (payment.status !== "captured") {
    return {
      ok: false,
      reason: `Payment not captured. Current status: ${payment.status}. Order will not be confirmed.`,
      httpStatus: 402
    };
  }

  // 2. Payment must belong to the expected Razorpay order
  if (payment.order_id !== expectedOrderId) {
    return {
      ok: false,
      reason: `Payment order_id mismatch. Expected ${expectedOrderId}, got ${payment.order_id}. Possible replay attack.`,
      httpStatus: 400
    };
  }

  // 3. Amount must match exactly
  if (payment.amount !== expectedAmountPaise) {
    return {
      ok: false,
      reason: `Payment amount mismatch. Expected ${expectedAmountPaise} paise, got ${payment.amount} paise.`,
      httpStatus: 402
    };
  }

  return { ok: true, payment };
}
