-- Add businesses table for approved submissions
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS approved_businesses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    original_category TEXT,
    subcategory TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    email TEXT,
    description TEXT,
    google_maps_link TEXT,
    link_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE approved_businesses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read (for public display)
CREATE POLICY "Anyone can read approved" ON approved_businesses
    FOR SELECT USING (true);

-- Policy: Anyone can insert (from admin approval - protected by password in API)
CREATE POLICY "Anyone can insert approved" ON approved_businesses
    FOR INSERT WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_approved_category ON approved_businesses(category);
CREATE INDEX IF NOT EXISTS idx_approved_slug ON approved_businesses(slug);
