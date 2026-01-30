import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BusinessSubmission {
    id: string;
    name: string;
    category: string;
    address: string;
    phone: string | null;
    website: string | null;
    email: string | null;
    description: string | null;
    submitter_email: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}
