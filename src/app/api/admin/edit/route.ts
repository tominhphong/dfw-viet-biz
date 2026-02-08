import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, password, updates } = body;

        // Verify admin password
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Mật khẩu không đúng' },
                { status: 401 }
            );
        }

        if (!id || !updates) {
            return NextResponse.json(
                { error: 'Thiếu ID hoặc dữ liệu cập nhật' },
                { status: 400 }
            );
        }

        // Only allow specific fields to be updated
        const allowedFields = [
            'name', 'category', 'subcategory', 'original_category',
            'address', 'city', 'state', 'phone', 'website',
            'email', 'description', 'google_maps_link', 'images'
        ];

        const sanitizedUpdates: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (key in updates) {
                sanitizedUpdates[key] = updates[key];
            }
        }

        if (Object.keys(sanitizedUpdates).length === 0) {
            return NextResponse.json(
                { error: 'Không có trường nào hợp lệ để cập nhật' },
                { status: 400 }
            );
        }

        // If category changed, also update original_category
        if (sanitizedUpdates.category && !sanitizedUpdates.original_category) {
            sanitizedUpdates.original_category = sanitizedUpdates.category;
        }

        // If address parts changed, regenerate google_maps_link
        if (sanitizedUpdates.address || sanitizedUpdates.city || sanitizedUpdates.state) {
            // First get existing data to merge
            const { data: existing } = await supabase
                .from('approved_businesses')
                .select('address, city, state')
                .eq('id', id)
                .single();

            if (existing) {
                const addr = (sanitizedUpdates.address as string) || existing.address || '';
                const city = (sanitizedUpdates.city as string) || existing.city || '';
                const state = (sanitizedUpdates.state as string) || existing.state || 'TX';
                const fullAddress = `${addr}, ${city}, ${state}`;
                sanitizedUpdates.google_maps_link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
            }
        }

        // If name changed, update slug
        if (sanitizedUpdates.name) {
            sanitizedUpdates.slug = (sanitizedUpdates.name as string)
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .trim()
                .replace(/^-+|-+$/g, '') + '-dfw';
        }

        const { data, error: updateError } = await supabase
            .from('approved_businesses')
            .update(sanitizedUpdates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.json(
                { error: 'Lỗi khi cập nhật: ' + updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
            message: `Đã cập nhật thành công!`
        });
    } catch (error) {
        console.error('Edit error:', error);
        return NextResponse.json(
            { error: 'Lỗi server: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}
