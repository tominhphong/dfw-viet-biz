// Bulk insert 11 religious businesses into Supabase
// Run with: node scripts/insert-religious-businesses.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env.local manually
const envContent = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        env[key.trim()] = valueParts.join('=').trim();
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '') + '-dfw';
}

const businesses = [
    { name: "Chùa Hương Đạo", subcategory: "Chùa Phật Giáo", address: "4717 E Rosedale St, Fort Worth, TX 76105", phone: "(817) 531-0888", website: "chuahuongdao.org", description: "Chùa Hương Đạo — ngôi chùa Phật Giáo Việt Nam lớn nhất tại Fort Worth, trung tâm tâm linh và văn hóa cộng đồng Việt." },
    { name: "Chùa Liên Hoa", subcategory: "Chùa Phật Giáo", address: "2014 Rose St, Irving, TX 75061", phone: "(972) 438-6031", website: "tuvienlienhoa.net", description: "Tự Viện Liên Hoa — chùa Phật Giáo Theravada Việt Nam đầu tiên tại Texas, hoạt động từ 1980." },
    { name: "Chùa Từ Đàm", subcategory: "Chùa Phật Giáo", address: "615 N Gilbert Rd, Irving, TX 75061", phone: "(972) 721-1718", website: null, description: "Chùa Từ Đàm — Vietnamese Buddhist Congregation, hoạt động từ 1983, phục vụ cộng đồng Phật tử Việt tại DFW." },
    { name: "Chùa Đạo Quang", subcategory: "Chùa Phật Giáo", address: "3522 N Garland Ave, Garland, TX 75040", phone: "(972) 414-8148", website: null, description: "Chùa Đạo Quang — ngôi chùa Phật Giáo tại Garland, mở cửa hàng ngày phục vụ Phật tử và cộng đồng." },
    { name: "Chùa Đại Bi", subcategory: "Chùa Phật Giáo", address: "3720 14th St, Plano, TX 75074", phone: "(469) 573-5782", website: null, description: "Chùa Đại Bi (Compassion Temple) — chùa Phật Giáo tại Plano, trung tâm thiền định và tu học." },
    { name: "Giáo Xứ Các Thánh Tử Đạo Việt Nam", subcategory: "Nhà Thờ", address: "801 E Mayfield Rd, Arlington, TX 76014", phone: "(817) 466-0800", website: "cttdvn.net", description: "Giáo Xứ Các Thánh Tử Đạo VN — nhà thờ Công Giáo Việt Nam phục vụ cộng đồng Arlington và vùng phụ cận." },
    { name: "Giáo Xứ Thánh Phêrô", subcategory: "Nhà Thờ", address: "10123 Garland Rd, Dallas, TX 75218", phone: "(214) 321-9493", website: "stpetervndal.org", description: "Giáo Xứ Thánh Phêrô — giáo xứ Công Giáo Việt Nam đầu tiên tại Dallas, thành lập năm 1976." },
    { name: "Giáo Xứ Đức Mẹ Fatima", subcategory: "Nhà Thờ", address: "5109 E Lancaster Ave, Fort Worth, TX 76112", phone: "(817) 446-4114", website: "giaoxufatima.net", description: "Giáo Xứ Đức Mẹ Fatima — nhà thờ Công Giáo Việt Nam tại Fort Worth, có thánh lễ hàng ngày bằng tiếng Việt." },
    { name: "Giáo Xứ Thánh Giuse", subcategory: "Nhà Thờ", address: "1902 S Beltline Rd, Grand Prairie, TX 75051", phone: "(972) 237-1700", website: "sjvncc.org", description: "Giáo Xứ Thánh Giuse — nhà thờ Công Giáo Việt Nam tại Grand Prairie, thành lập năm 1988." },
    { name: "Giáo Xứ Đức Mẹ Hằng Cứu Giúp", subcategory: "Nhà Thờ", address: "2121 W Apollo Rd, Garland, TX 75044", phone: "(972) 414-7073", website: "dmhcg.org", description: "Giáo Xứ Đức Mẹ Hằng Cứu Giúp — nhà thờ Công Giáo Việt Nam tại Garland phục vụ giáo dân Việt." },
    { name: "Vietnamese Faith Baptist Church", subcategory: "Nhà Thờ", address: "11312 Shiloh Rd, Dallas, TX 75228", phone: "(214) 929-1230", website: "vietfaith.org", description: "Vietnamese Faith Baptist Church — nhà thờ Tin Lành Việt Nam tại Dallas, có lễ mỗi Chủ Nhật." },
];

async function main() {
    console.log('🔄 Inserting 11 religious businesses into Supabase...\n');

    const records = businesses.map(biz => ({
        name: biz.name,
        slug: slugify(biz.name),
        category: 'Religious',
        original_category: 'Religious',
        subcategory: biz.subcategory,
        address: biz.address,
        phone: biz.phone,
        website: biz.website,
        email: null,
        description: biz.description,
        images: [],
        google_maps_link: null,
        link_type: null,
    }));

    // Log slugs for verification
    records.forEach(r => console.log(`  📝 ${r.name} → ${r.slug}`));
    console.log('');

    // Check for duplicates
    const slugs = records.map(r => r.slug);
    const { data: existing } = await supabase
        .from('approved_businesses')
        .select('slug, name')
        .in('slug', slugs);

    let toInsert = records;
    if (existing && existing.length > 0) {
        console.log('⚠️  Already exist:');
        existing.forEach(e => console.log(`  - ${e.name}`));
        const existingSlugs = new Set(existing.map(e => e.slug));
        toInsert = records.filter(r => !existingSlugs.has(r.slug));
        if (toInsert.length === 0) {
            console.log('\n✅ All already in database.');
            return;
        }
        console.log(`\nInserting ${toInsert.length} new...\n`);
    }

    const { data, error } = await supabase
        .from('approved_businesses')
        .insert(toInsert)
        .select('name, slug');

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    console.log(`✅ Inserted ${data?.length} businesses:\n`);
    data?.forEach(d => console.log(`  ✓ ${d.name} → /business/${d.slug}`));
    console.log('\n🎉 Done! Live on candiachi.com');
}

main().catch(console.error);
