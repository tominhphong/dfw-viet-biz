#!/usr/bin/env python3
"""
Migrate seed.json data to Supabase approved_businesses table.
Run this once to transfer all 309 businesses to the database.

Usage: python scripts/migrate_to_supabase.py
"""

import json
import os
from supabase import create_client, Client

def load_env():
    """Load environment variables from .env.local"""
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

def main():
    load_env()
    
    supabase_url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase credentials!")
        print("  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local")
        return
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Load seed data
    seed_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'seed.json')
    with open(seed_path, 'r', encoding='utf-8') as f:
        businesses = json.load(f)
    
    print(f"📦 Found {len(businesses)} businesses in seed.json")
    
    # Check existing data
    existing = supabase.table('approved_businesses').select('slug').execute()
    existing_slugs = {b['slug'] for b in existing.data} if existing.data else set()
    print(f"📊 {len(existing_slugs)} businesses already in database")
    
    # Prepare data for insert
    to_insert = []
    skipped = 0
    
    for biz in businesses:
        if biz['slug'] in existing_slugs:
            skipped += 1
            continue
            
        to_insert.append({
            'name': biz['name'],
            'slug': biz['slug'],
            'category': biz['category'],
            'original_category': biz.get('originalCategory'),
            'subcategory': biz.get('subcategory'),
            'address': biz.get('address', ''),
            'phone': biz.get('phone'),
            'website': biz.get('website'),
            'email': biz.get('email'),
            'description': biz.get('description'),
            'google_maps_link': biz.get('googleMapsLink'),
            'link_type': biz.get('linkType'),
            'rating': biz.get('rating'),
            'review_count': biz.get('reviewCount'),
            'source': 'seed'
        })
    
    if skipped:
        print(f"⏩ Skipping {skipped} already existing businesses")
    
    if not to_insert:
        print("✅ All businesses already migrated!")
        return
    
    # Insert in batches of 50
    batch_size = 50
    total_inserted = 0
    
    for i in range(0, len(to_insert), batch_size):
        batch = to_insert[i:i+batch_size]
        try:
            result = supabase.table('approved_businesses').insert(batch).execute()
            total_inserted += len(result.data) if result.data else 0
            print(f"  ✓ Inserted batch {i//batch_size + 1}: {len(batch)} businesses")
        except Exception as e:
            print(f"  ❌ Error in batch {i//batch_size + 1}: {e}")
    
    print(f"\n🎉 Migration complete! Inserted {total_inserted} businesses.")
    print(f"   Total in database: {len(existing_slugs) + total_inserted}")

if __name__ == '__main__':
    main()
