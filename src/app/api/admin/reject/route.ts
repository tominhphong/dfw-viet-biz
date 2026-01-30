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
