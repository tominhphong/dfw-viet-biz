import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { id, password } = await request.json();

        // Verify admin password
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Mật khẩu không đúng' },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { error: 'Thiếu ID' },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from('li_xi_entries')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete li-xi error:', error);
            return NextResponse.json(
                { error: 'Lỗi khi xóa: ' + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete li-xi error:', error);
        return NextResponse.json(
            { error: 'Lỗi server' },
            { status: 500 }
        );
    }
}
