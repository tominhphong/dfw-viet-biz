import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, password, businessName } = body;

        // Verify admin password
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get business info before deleting for logging
        const { data: business } = await supabase
            .from('approved_businesses')
            .select('*')
            .eq('id', id)
            .single();

        // Delete the business
        const { error } = await supabase
            .from('approved_businesses')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json(
                { error: 'Failed to delete business: ' + error.message },
                { status: 500 }
            );
        }

        // Log the delete action
        await supabase
            .from('admin_action_logs')
            .insert({
                action_type: 'rejected', // Using 'rejected' for delete
                business_name: businessName || business?.name || 'Unknown',
                business_category: business?.category,
                business_address: business?.address,
                business_phone: business?.phone,
                business_email: business?.email,
                business_website: business?.website,
                notes: 'Deleted from approved businesses'
            });

        return NextResponse.json({
            success: true,
            message: `Đã xóa "${businessName}" thành công!`
        });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
