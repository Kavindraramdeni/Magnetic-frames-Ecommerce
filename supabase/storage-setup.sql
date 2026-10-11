-- supabase/storage-setup.sql
-- KRIA Studio: Secure Storage Configuration & Private Customer Upload Bucket
-- Run this in the Supabase SQL Editor to enforce private access on customer uploads.

-- 1. Create the private 'customer-photos' bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'customer-photos',
    'customer-photos',
    false, -- STRICTLY PRIVATE
    26214400, -- 25 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE 
SET public = false,
    file_size_limit = 26214400,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Ensure public 'images' bucket remains strictly for marketing & public product/banner assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images',
    'images',
    true, -- PUBLIC for catalogue and marketing banners only
    10485760, -- 10 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE 
SET public = true;

-- 3. Policy: Service Role (Backend Server) has full read/write on customer-photos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Service role full access to customer-photos'
    ) THEN
        CREATE POLICY "Service role full access to customer-photos"
        ON storage.objects FOR ALL
        TO service_role
        USING (bucket_id = 'customer-photos')
        WITH CHECK (bucket_id = 'customer-photos');
    END IF;
END $$;

-- 4. Policy: Public read access ONLY for the public 'images' bucket (catalogue & banners)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read access for images bucket'
    ) THEN
        CREATE POLICY "Public read access for images bucket"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'images');
    END IF;
END $$;
