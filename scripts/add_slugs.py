#!/usr/bin/env python3
"""
Add slug field to all businesses in seed.json
Slug format: business-name-city (lowercase, hyphenated)
"""

import json
import re
import unicodedata

INPUT_FILE = "/Volumes/homes/phongto/GitHub/dfw-viet-biz/src/data/seed.json"
OUTPUT_FILE = INPUT_FILE

def create_slug(name, address):
    """Create URL-friendly slug from business name and city"""
    # Extract city from address (usually after last comma before state)
    city = "texas"
    if address:
        # Try to extract city - usually format is "123 Street, City, TX 12345"
        parts = address.split(',')
        if len(parts) >= 2:
            city = parts[-2].strip() if len(parts) > 2 else parts[-1].strip()
            # Remove state abbreviation if present
            city = re.sub(r'\s*(TX|Texas)\s*\d*$', '', city, flags=re.IGNORECASE).strip()
    
    if not city:
        city = "dfw"
    
    # Combine name and city
    text = f"{name} {city}"
    
    # Normalize unicode characters (convert Vietnamese accents to base letters)
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII')
    
    # Convert to lowercase and replace non-alphanumeric with hyphens
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    
    # Remove leading/trailing hyphens and collapse multiple hyphens
    text = re.sub(r'-+', '-', text).strip('-')
    
    return text

def main():
    # Read seed.json
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        businesses = json.load(f)
    
    print(f"📂 Processing {len(businesses)} businesses...")
    
    # Track slugs to ensure uniqueness
    used_slugs = {}
    
    for biz in businesses:
        base_slug = create_slug(biz.get('name', ''), biz.get('address', ''))
        
        # Ensure uniqueness
        slug = base_slug
        counter = 1
        while slug in used_slugs:
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        used_slugs[slug] = True
        biz['slug'] = slug
    
    # Write updated seed.json
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(businesses, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Added slugs to {len(businesses)} businesses")
    
    # Show samples
    print("\n📋 Sample slugs:")
    for biz in businesses[:5]:
        print(f"  {biz['name'][:30]:30} → {biz['slug']}")

if __name__ == '__main__':
    main()
