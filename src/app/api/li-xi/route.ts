import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-server';
import { sendLixiEmail } from '../../../lib/email';

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

        // 1. Save to Supabase
        const { error } = await supabaseAdmin
            .from('li_xi_entries')
            .insert({
                email,
                lucky_number: luckyNumber,
                business_name: businessName || null,
            });

        if (error) {
            console.error('Supabase li-xi error:', error);
        }

        // 2. Send li xi email via Hostinger SMTP (info@candiachi.com)
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                const info = await sendLixiEmail(
                    email,
                    String(luckyNumber),
                    businessName || 'N/A'
                );
                console.log('Email sent:', info.messageId);
            } catch (err) {
                console.error('Email send error:', err);
            }
        } else {
            console.warn('SMTP credentials not configured — email not sent');
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
