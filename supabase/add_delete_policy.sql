-- Add DELETE policy for approved_businesses table
-- Run this in Supabase SQL Editor

CREATE POLICY "Anyone can delete approved" ON approved_businesses
    FOR DELETE USING (true);
