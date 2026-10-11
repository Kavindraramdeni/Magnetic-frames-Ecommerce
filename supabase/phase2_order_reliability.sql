-- supabase/phase2_order_reliability.sql
-- Migration for Phase 2: Order & Payment Reliability
-- Safe, idempotent execution using IF NOT EXISTS

-- 1. Create a dedicated sequence for collision-free, race-safe order numbers
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001 INCREMENT BY 1;

-- Function to generate safe, sequential, collision-proof order IDs
CREATE OR REPLACE FUNCTION public.next_order_id(prefix TEXT DEFAULT 'KRIA-ORD')
RETURNS TEXT AS $$
DECLARE
    today_str TEXT;
    seq_val BIGINT;
BEGIN
    today_str := to_char(CURRENT_TIMESTAMP, 'YYMMDD');
    seq_val := nextval('public.order_number_seq');
    RETURN prefix || '-' || today_str || '-' || lpad(seq_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. Unique Constraints & Indexes for Order and Payment Reliability
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_transaction_id ON public.orders (transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_razorpay_order_id ON public.checkout_sessions (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_external_payment_id ON public.payment_events (external_payment_id);

-- 3. Dedicated Coupon Redemptions Ledger
-- Prevents race conditions and double-spending of coupons across concurrent requests
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_code TEXT NOT NULL,
    order_id TEXT NOT NULL,
    customer_email TEXT,
    discount_amount REAL NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_coupon_per_order UNIQUE (coupon_code, order_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_code ON public.coupon_redemptions (coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_order ON public.coupon_redemptions (order_id);

-- 4. Dedicated Inventory Movement Ledger
-- Immutable audit log for stock deductions to trace every unit decremented or restocked
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    quantity_changed INTEGER NOT NULL,
    movement_type TEXT NOT NULL, -- 'ORDER_DEDUCT', 'CANCEL_RESTOCK', 'MANUAL_ADJUST'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_order_product_deduction UNIQUE (order_id, product_id, movement_type)
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_prod ON public.inventory_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_order ON public.inventory_movements (order_id);
