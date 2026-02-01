-- Add additional fields to approved_businesses for seed migration
-- Run in Supabase SQL Editor

-- Add missing columns
ALTER TABLE approved_businesses 
ADD COLUMN IF NOT EXISTS original_category TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1),
ADD COLUMN IF NOT EXISTS review_count INTEGER,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'seed';

-- Add DELETE policy if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'approved_businesses' 
        AND policyname = 'Anyone can delete approved'
    ) THEN
        CREATE POLICY "Anyone can delete approved" ON approved_businesses
        FOR DELETE USING (true);
    END IF;
END $$;

-- Create index on source for filtering
CREATE INDEX IF NOT EXISTS idx_approved_source ON approved_businesses(source);
