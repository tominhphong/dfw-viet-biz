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

        // 2. Call Google Apps Script webhook via GET
        // Google Apps Script 302 redirect breaks POST (changes to GET per HTTP spec).
        // Using GET with query params is the most reliable method.
        const webhookUrl = process.env.GOOGLE_SCRIPT_WEBHOOK_URL;
        if (webhookUrl) {
            try {
                const params = new URLSearchParams({
                    email,
                    luckyNumber: String(luckyNumber),
                    businessName: businessName || 'N/A',
                });
                const getUrl = `${webhookUrl}?${params.toString()}`;
                const webhookRes = await fetch(getUrl, {
                    method: 'GET',
                    redirect: 'follow',
                });
                console.log('Webhook response:', webhookRes.status, await webhookRes.text());
            } catch (err) {
                console.error('Webhook error:', err);
            }
        } else {
            console.warn('GOOGLE_SCRIPT_WEBHOOK_URL not set');
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
