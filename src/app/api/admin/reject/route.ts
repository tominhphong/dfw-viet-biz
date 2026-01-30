import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, password } = body;

        // Verify admin password
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get submission first for logging
        const { data: submission } = await supabase
            .from('business_submissions')
            .select('*')
            .eq('id', id)
            .single();

        // Delete the submission (reject = remove from pending)
        const { error } = await supabase
            .from('business_submissions')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json(
                { error: 'Failed to reject submission' },
                { status: 500 }
            );
        }

        // Log the rejection action
        if (submission) {
            await supabase
                .from('admin_action_logs')
                .insert({
                    action_type: 'rejected',
                    business_name: submission.name,
                    business_category: submission.category,
                    business_address: submission.address,
                    business_phone: submission.phone,
                    business_email: submission.email,
                    business_website: submission.website,
                    submission_id: id
                });
        }

        return NextResponse.json({
            success: true,
            message: 'Submission rejected and removed'
        });
    } catch (error) {
        console.error('Reject error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
