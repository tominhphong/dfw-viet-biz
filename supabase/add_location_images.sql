-- Migration: Add city, state, subcategory, images columns
-- Run in Supabase SQL Editor
-- Date: 2026-02-06

-- =============================================
-- PART 1: Update business_submissions table
-- =============================================

ALTER TABLE business_submissions 
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE business_submissions 
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'TX';

ALTER TABLE business_submissions 
ADD COLUMN IF NOT EXISTS subcategory TEXT;

ALTER TABLE business_submissions 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- =============================================
-- PART 2: Update approved_businesses table
-- =============================================

ALTER TABLE approved_businesses 
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE approved_businesses 
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'TX';

ALTER TABLE approved_businesses 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- =============================================
-- PART 3: Create Storage Bucket for Images
-- (Run this in SQL Editor OR create via Dashboard)
-- =============================================

-- Note: For storage bucket, go to:
-- Supabase Dashboard > Storage > New Bucket
-- Name: business-images
-- Public: Yes (for public URLs)

-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Allow public read
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'business-images');

-- Storage Policy: Allow anonymous uploads (for form submissions)
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'business-images');

-- =============================================
-- Verify columns added
-- =============================================
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'business_submissions';
