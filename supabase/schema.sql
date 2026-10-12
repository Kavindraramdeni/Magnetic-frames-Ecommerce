-- supabase/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    cart_json JSONB NOT NULL,
    shipping_json JSONB NOT NULL,
    tracking_number TEXT NOT NULL,
    courier_name TEXT NOT NULL,
    delivery_estimate TEXT NOT NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    totals_json JSONB NOT NULL,
    history_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.checkout_sessions (
    id TEXT PRIMARY KEY,
    razorpay_order_id TEXT UNIQUE NOT NULL,
    cart_json JSONB NOT NULL,
    shipping_json JSONB NOT NULL,
    totals_json JSONB NOT NULL,
    accepted_policies INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.shipping_quotes (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    destination_pin TEXT NOT NULL,
    courier_name TEXT NOT NULL,
    rate REAL NOT NULL,
    etd TEXT NOT NULL,
    serviceable INTEGER NOT NULL,
    response_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.payment_events (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    external_payment_id TEXT,
    external_order_id TEXT,
    payload_json JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.products (
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
    stock INTEGER DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    photo_url TEXT,
    is_approved INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    label TEXT NOT NULL,
    min_order_value REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.warehouses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address1 TEXT NOT NULL,
    address2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    gstin TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    shiprocket_pickup_name TEXT NOT NULL,
    is_default INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.business_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity_changed INTEGER NOT NULL,
    movement_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.production_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL,
    item_index INTEGER NOT NULL,
    shape_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    photo_object_key TEXT,
    photo_bucket TEXT,
    crop_scale REAL DEFAULT 1.0,
    crop_pan_x REAL DEFAULT 0.0,
    crop_pan_y REAL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'QUEUED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Atomic inventory deduction PostgreSQL function with row-level locks
CREATE OR REPLACE FUNCTION public.deduct_inventory_atomic(
    p_order_id TEXT,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item JSONB;
    v_product_id TEXT;
    v_qty INTEGER;
    v_current_stock INTEGER;
    v_existing_movement UUID;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := COALESCE(v_item->>'shapeId', 'custom');
        v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::INTEGER, 1));

        -- Check if movement was already recorded for this order and item (Idempotency)
        SELECT id INTO v_existing_movement
        FROM public.inventory_movements
        WHERE order_id = p_order_id
          AND product_id = v_product_id
          AND movement_type = 'ORDER_DEDUCT'
        LIMIT 1;

        IF v_existing_movement IS NULL THEN
            -- Acquire row-level lock on the product to prevent concurrent over-selling
            SELECT stock INTO v_current_stock
            FROM public.products
            WHERE id = v_product_id
            FOR UPDATE;

            IF FOUND THEN
                IF v_current_stock < v_qty THEN
                    RAISE EXCEPTION 'Insufficient stock for product %: requested %, available %', v_product_id, v_qty, v_current_stock;
                END IF;

                -- Record immutable audit ledger entry
                INSERT INTO public.inventory_movements (
                    order_id,
                    product_id,
                    quantity_changed,
                    movement_type
                ) VALUES (
                    p_order_id,
                    v_product_id,
                    -v_qty,
                    'ORDER_DEDUCT'
                );

                -- Decrement stock atomically
                UPDATE public.products
                SET stock = GREATEST(0, stock - v_qty)
                WHERE id = v_product_id;
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('success', true);
END;
$$;
