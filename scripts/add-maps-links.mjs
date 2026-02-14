// Update google_maps_link for all businesses with addresses
// Run with: node scripts/add-maps-links.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envContent = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        env[key.trim()] = rest.join('=').trim();
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabase
        .from('approved_businesses')
        .select('id, name, address, google_maps_link')
        .not('address', 'is', null)
        .order('name');

    if (error) { console.error('Error:', error.message); process.exit(1); }

    const needsUpdate = data.filter(b => !b.google_maps_link && b.address && b.address.trim().length > 0);
    console.log(`📊 Total with address: ${data.length}`);
    console.log(`🔗 Already have Maps link: ${data.length - needsUpdate.length}`);
    console.log(`📍 Need Maps link: ${needsUpdate.length}\n`);

    if (needsUpdate.length === 0) {
        console.log('✅ All businesses already have Google Maps links!');
        process.exit(0);
    }

    let updated = 0;
    for (const biz of needsUpdate) {
        const mapsLink = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(biz.address);
        const { error: err } = await supabase
            .from('approved_businesses')
            .update({ google_maps_link: mapsLink })
            .eq('id', biz.id);

        if (err) {
            console.error(`  ❌ ${biz.name}: ${err.message}`);
        } else {
            console.log(`  ✓ ${biz.name}`);
            updated++;
        }
    }
    console.log(`\n✅ Updated ${updated}/${needsUpdate.length} businesses with Google Maps links`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
