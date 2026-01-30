import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// Helper to create slug
function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '') + '-dfw';
}

// Map category to Vietnamese subcategory
function getVietnameseSubcategory(category: string): string {
    const mappings: Record<string, string> = {
        'Restaurant': 'Ẩm Thực Việt',
        'Food': 'Ẩm Thực Việt',
        'Healthcare': 'Y Khoa',
        'Retail': 'Bán Lẻ',
        'Shopping': 'Bán Lẻ',
        'Automotive': 'Sửa Xe',
        'Beauty & Personal Care': 'Tiệm Nail',
        'Professional Services': 'Dịch Vụ',
        'Services': 'Dịch Vụ',
        'Religious': 'Tôn Giáo',
        'Community': 'Cộng Đồng',
    };
    return mappings[category] || category;
}

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

        // Get submission
        const { data: submission, error: fetchError } = await supabase
            .from('business_submissions')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !submission) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            );
        }

        // Create new business entry for approved_businesses table
        const newBusiness = {
            name: submission.name,
            slug: slugify(submission.name),
            category: submission.category,
            original_category: submission.category,
            subcategory: getVietnameseSubcategory(submission.category),
            address: submission.address,
            phone: submission.phone,
            website: submission.website,
            email: submission.email,
            description: submission.description || `${submission.name} - Doanh nghiệp Việt Nam tại DFW`,
            google_maps_link: null,
            link_type: null
        };

        // Insert into approved_businesses table
        const { error: insertError } = await supabase
            .from('approved_businesses')
            .insert(newBusiness);

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json(
                { error: 'Failed to add business: ' + insertError.message },
                { status: 500 }
            );
        }

        // Update submission status to approved
        await supabase
            .from('business_submissions')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', id);

        return NextResponse.json({
            success: true,
            message: `Business "${submission.name}" đã được duyệt!`
        });
    } catch (error) {
        console.error('Approve error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
