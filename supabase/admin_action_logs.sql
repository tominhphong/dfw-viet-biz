-- Admin Action Logs Table
-- Tracks all approve/reject actions for audit purposes
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin_action_logs (
    id SERIAL PRIMARY KEY,
    action_type TEXT NOT NULL CHECK (action_type IN ('approved', 'rejected')),
    business_name TEXT NOT NULL,
    business_category TEXT,
    business_address TEXT,
    business_phone TEXT,
    business_email TEXT,
    business_website TEXT,
    submission_id TEXT,
    action_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Enable RLS
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admin can read logs (protected by API password)
CREATE POLICY "Anyone can read logs" ON admin_action_logs
    FOR SELECT USING (true);

-- Policy: Allow insert from API
CREATE POLICY "Anyone can insert logs" ON admin_action_logs
    FOR INSERT WITH CHECK (true);

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_logs_action_type ON admin_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON admin_action_logs(action_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_business_name ON admin_action_logs(business_name);
