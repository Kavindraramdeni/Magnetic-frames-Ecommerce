-- supabase/phase3_tables_and_rls.sql
-- Migration for Phase 3: Supabase Database & Storage
-- Safe, idempotent execution using IF NOT EXISTS and DO blocks

-- 1. B2B Enquiries & Quotations Management Table
CREATE TABLE IF NOT EXISTS public.b2b_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    estimated_quantity INTEGER NOT NULL DEFAULT 5,
    preferred_shapes TEXT[],
    custom_notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'QUOTED', 'ACCEPTED', 'DECLINED'
    quoted_price_per_unit REAL,
    quoted_total REAL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_b2b_enquiries_status ON public.b2b_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_b2b_enquiries_created_at ON public.b2b_enquiries (created_at DESC);

-- 2. Factory Production Print Jobs Table
CREATE TABLE IF NOT EXISTS public.production_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    item_index INTEGER NOT NULL DEFAULT 0,
    shape_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    photo_object_key TEXT NOT NULL,
    photo_bucket TEXT NOT NULL DEFAULT 'customer-photos',
    crop_scale REAL NOT NULL DEFAULT 1.0,
    crop_pan_x REAL NOT NULL DEFAULT 0,
    crop_pan_y REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'QUEUED', -- 'QUEUED', 'PRINTING', 'LASER_CUT', 'QUALITY_CHECK', 'PACKED'
    assigned_technician TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_production_jobs_order ON public.production_jobs (order_id);
CREATE INDEX IF NOT EXISTS idx_production_jobs_status ON public.production_jobs (status);

-- 3. Row Level Security (RLS) Configuration
-- Enable RLS on core tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Public Read Policies for Storefront
DO $$
BEGIN
    -- Public read on active products
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public read active products') THEN
        CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (true);
    END IF;

    -- Public read on active coupons (for checkout coupon validation)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Public read active coupons') THEN
        CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT USING (is_active = 1);
    END IF;

    -- Public read on approved reviews
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Public read approved reviews') THEN
        CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (is_approved = 1);
    END IF;

    -- Public read on active banners
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Public read active banners') THEN
        CREATE POLICY "Public read active banners" ON public.banners FOR SELECT USING (is_active = 1);
    END IF;
END $$;

-- 5. Service Role Policies (Backend API server has unrestricted administrative access)
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'orders',
        'checkout_sessions',
        'payment_events',
        'coupon_redemptions',
        'inventory_movements',
        'b2b_enquiries',
        'production_jobs',
        'products',
        'coupons',
        'banners',
        'reviews',
        'shipping_quotes',
        'warehouses',
        'business_settings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = tbl AND policyname = 'Service role full access on ' || tbl
        ) THEN
            EXECUTE format('CREATE POLICY "Service role full access on %I" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
        END IF;
    END LOOP;
END $$;
