import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            name,
            category,
            subcategory,
            address,
            city,
            state,
            phone,
            website,
            email,
            description,
            submitterEmail,
            googleMapsLink,
            images
        } = body;

        if (!name || !category || !address) {
            return NextResponse.json(
                { error: 'Name, category, and address are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('business_submissions')
            .insert({
                name,
                category,
                subcategory: subcategory || null,
                address,
                city: city || null,
                state: state || 'TX',
                phone: phone || null,
                website: website || null,
                email: email || null,
                description: description || null,
                submitter_email: submitterEmail || null,
                google_maps_link: googleMapsLink || null,
                images: images || [],
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: 'Failed to submit business' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Submit error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
