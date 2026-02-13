import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { email, luckyNumber, businessName } = await request.json();

        if (!email || !luckyNumber) {
            return NextResponse.json(
                { error: 'Email and lucky number are required' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from('li_xi_entries')
            .insert({
                email,
                lucky_number: luckyNumber,
                business_name: businessName || null,
            });

        if (error) {
            console.error('Supabase li-xi error:', error);
            return NextResponse.json(
                { error: 'Failed to save lucky number' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Li xi error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
