import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, password, businessName } = body;

        // Verify admin password
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Mật khẩu không đúng' },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { error: 'Thiếu ID doanh nghiệp' },
                { status: 400 }
            );
        }

        // Get business info before deleting for logging
        const { data: business, error: fetchError } = await supabase
            .from('approved_businesses')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Fetch error:', fetchError);
            return NextResponse.json(
                { error: 'Không tìm thấy doanh nghiệp với ID: ' + id },
                { status: 404 }
            );
        }

        // Delete the business
        const { error: deleteError } = await supabase
            .from('approved_businesses')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Delete error:', deleteError);
            return NextResponse.json(
                { error: 'Lỗi khi xóa: ' + deleteError.message },
                { status: 500 }
            );
        }

        // Log the delete action (non-blocking - don't fail if logging fails)
        try {
            await supabase
                .from('admin_action_logs')
                .insert({
                    action_type: 'rejected',
                    business_name: businessName || business?.name || 'Unknown',
                    business_category: business?.category,
                    business_address: business?.address,
                    business_phone: business?.phone,
                    business_email: business?.email,
                    business_website: business?.website,
                    notes: 'Deleted from approved businesses'
                });
        } catch (logError) {
            console.warn('Failed to log delete action:', logError);
            // Don't fail the request if logging fails
        }

        return NextResponse.json({
            success: true,
            message: `Đã xóa "${businessName || business?.name}" thành công!`
        });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Lỗi server: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}

