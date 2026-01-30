import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import fs from 'fs';
import path from 'path';

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
        'Healthcare': 'Y Khoa',
        'Retail': 'Bán Lẻ',
        'Automotive': 'Sửa Xe',
        'Beauty & Personal Care': 'Tiệm Nail',
        'Professional Services': 'Dịch Vụ',
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

        // Load current seed.json
        const seedPath = path.join(process.cwd(), 'src/data/seed.json');
        const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

        // Get next ID
        const nextId = Math.max(...seedData.map((b: { id: number }) => b.id)) + 1;

        // Create new business entry
        const newBusiness = {
            id: nextId,
            name: submission.name,
            slug: slugify(submission.name),
            category: submission.category === 'Professional Services' ? 'Services' : submission.category,
            originalCategory: submission.category,
            subcategory: getVietnameseSubcategory(submission.category),
            address: submission.address,
            phone: submission.phone,
            website: submission.website,
            email: submission.email,
            description: submission.description || `${submission.name} - Doanh nghiệp Việt Nam tại DFW`,
            googleMapsLink: null,
            linkType: null
        };

        // Add to seed data
        seedData.push(newBusiness);

        // Save seed.json
        fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2));

        // Update submission status
        await supabase
            .from('business_submissions')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', id);

        return NextResponse.json({
            success: true,
            message: `Business "${submission.name}" approved and added!`,
            businessId: nextId,
            totalBusinesses: seedData.length
        });
    } catch (error) {
        console.error('Approve error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
