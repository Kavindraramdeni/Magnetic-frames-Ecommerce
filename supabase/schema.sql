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
