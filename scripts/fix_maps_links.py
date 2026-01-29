#!/usr/bin/env python3
"""
Fix Google Maps Links for Mobile Compatibility
Converts place_id format to universal search format that works on all devices.
"""

import csv
import re
import urllib.parse

INPUT_FILE = "/Volumes/homes/phongto/GitHub/dfw-viet-biz/Vietnamese_Businesses_WITH_MAPS_VERIFIED.csv"
OUTPUT_FILE = "/Volumes/homes/phongto/GitHub/dfw-viet-biz/Vietnamese_Businesses_MOBILE_READY.csv"

print("=" * 60)
print("FIXING GOOGLE MAPS LINKS FOR MOBILE COMPATIBILITY")
print("=" * 60)

def extract_place_id(link):
    """Extract Place ID from various Google Maps link formats"""
    if not link or link == '':
        return None
    
    # Format: place_id:ChIJ... or query_place_id=ChIJ...
    patterns = [
        r'place_id:([A-Za-z0-9_-]+)',
        r'place_id=([A-Za-z0-9_-]+)',
        r'query_place_id=([A-Za-z0-9_-]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, str(link))
        if match:
            return match.group(1)
    
    return None

def create_universal_link(row):
    """Generate universal Google Maps link that works on all devices"""
    
    current_link = row.get('Google_Maps_Link', '')
    place_id = extract_place_id(current_link)
    
    # Build search query from business data
    business_name = row.get('PHÂN TÍCH DATABASE', '') or ''
    address = row.get('Address', '') or ''
    state = row.get('State', '') or ''
    zip_code = row.get('Zip', '') or ''
    
    # Combine query components
    query_parts = [p.strip() for p in [business_name, address, state, zip_code] if p and p.strip()]
    query = ' '.join(query_parts)
    
    # URL encode query
    encoded_query = urllib.parse.quote(query)
    
    # Create universal link
    if place_id:
        # Best format: with Place ID for accuracy + query for mobile fallback
        return f"https://www.google.com/maps/search/?api=1&query={encoded_query}&query_place_id={place_id}"
    else:
        # Fallback: search-only format
        return f"https://www.google.com/maps/search/?api=1&query={encoded_query}"

def main():
    # Read CSV
    with open(INPUT_FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames
    
    print(f"\n📊 Total businesses: {len(rows)}")
    print("\n🔧 Converting links to mobile-compatible format...")
    
    # Update links
    updated_count = 0
    for row in rows:
        old_link = row.get('Google_Maps_Link', '')
        new_link = create_universal_link(row)
        
        if new_link != old_link:
            row['Google_Maps_Link'] = new_link
            updated_count += 1
    
    # Write updated CSV
    with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✅ SUCCESS! Updated {updated_count} business links")
    print(f"📁 Output file: {OUTPUT_FILE}")
    
    # Show samples
    print("\n📋 Sample updated links:")
    for idx in [0, 13, 18]:  # JnD Auto, Quoc Bao Bakery, Vanthao
        if idx < len(rows):
            name = rows[idx].get('PHÂN TÍCH DATABASE', 'Unknown')[:40]
            link = rows[idx].get('Google_Maps_Link', '')[:80]
            print(f"\n{idx+1}. {name}")
            print(f"   {link}...")
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    main()
