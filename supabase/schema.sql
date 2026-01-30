-- Supabase Schema for DFW Vietnamese Biz Submissions
-- Run this in Supabase SQL Editor

-- Create submissions table
CREATE TABLE IF NOT EXISTS business_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    email TEXT,
    description TEXT,
    submitter_email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE business_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (submit)
CREATE POLICY "Anyone can submit" ON business_submissions
    FOR INSERT WITH CHECK (true);

-- Policy: Anyone can read (for admin page - we'll use password protection)
CREATE POLICY "Anyone can read" ON business_submissions
    FOR SELECT USING (true);

-- Policy: Anyone can update (for approve/reject - protected by admin password)
CREATE POLICY "Anyone can update" ON business_submissions
    FOR UPDATE USING (true);

-- Policy: Anyone can delete (for cleanup)
CREATE POLICY "Anyone can delete" ON business_submissions
    FOR DELETE USING (true);

-- Create index for faster queries
CREATE INDEX idx_submissions_status ON business_submissions(status);
CREATE INDEX idx_submissions_created ON business_submissions(created_at DESC);
