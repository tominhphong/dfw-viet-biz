#!/usr/bin/env python3
"""Convert verified CSV with Google Maps links to seed.json format."""

import csv
import json
import random
import re

INPUT_FILE = "/Volumes/homes/phongto/GitHub/dfw-viet-biz/Vietnamese_Businesses_WITH_MAPS_VERIFIED.csv"
OUTPUT_FILE = "/Volumes/homes/phongto/GitHub/dfw-viet-biz/src/data/seed.json"

# Category mapping
CATEGORY_MAP = {
    'Restaurant': 'Food', 'Bakery': 'Food', 'Cafe': 'Food', 'Food': 'Food',
    'Healthcare': 'Services', 'Medical': 'Services', 'Dental': 'Services',
    'Legal': 'Services', 'Insurance': 'Services', 'Real Estate': 'Services',
    'Nail Salon': 'Services', 'Beauty': 'Services', 'Auto': 'Services',
    'Tax': 'Services', 'Automotive': 'Services', 'DDS': 'Services',
    'MD': 'Services', 'DO': 'Services', 'DMD': 'Services', 'PA-C': 'Services',
    'Supermarket': 'Shopping', 'Shopping Center': 'Shopping', 'Retail': 'Shopping', 'Grocery': 'Shopping',
    'Community Organization': 'Community', 'Religious': 'Community',
    'Church': 'Community', 'Temple': 'Community', 'Media': 'Community', 'Non-profit': 'Community',
}

def clean_text(text):
    if not text:
        return None
    text = text.strip().strip('"').strip()
    return text if text else None

def normalize_category(original_cat):
    if not original_cat:
        return 'Services', original_cat
    original_cat = clean_text(original_cat)
    if original_cat in CATEGORY_MAP:
        return CATEGORY_MAP[original_cat], original_cat
    for key, value in CATEGORY_MAP.items():
        if key.lower() in original_cat.lower():
            return value, original_cat
    return 'Services', original_cat

def clean_phone(phone):
    if not phone:
        return None
    phone = clean_text(phone)
    if not phone or 'Contact' in phone:
        return None
    if re.search(r'\(\d{3}\)\s*\d{3}-\d{4}', phone):
        return phone
    return None

def clean_website(website):
    if not website:
        return None
    website = clean_text(website)
    if not website:
        return None
    website = re.sub(r'^https?://', '', website)
    return website if website else None

def main():
    print(f"📂 Reading: {INPUT_FILE}")
    
    businesses = []
    category_counts = {'Food': 0, 'Services': 0, 'Shopping': 0, 'Community': 0}
    
    with open(INPUT_FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        
        for idx, row in enumerate(reader, start=1):
            # Column mapping based on CSV structure
            name = clean_text(row.get('PHÂN TÍCH DATABASE', ''))
            if not name:
                continue
            
            original_cat = clean_text(row.get('Category', ''))
            category, _ = normalize_category(original_cat)
            subcategory = clean_text(row.get('Subcategory', ''))
            
            # Build address
            addr_parts = []
            address = clean_text(row.get('Address', ''))
            state = clean_text(row.get('State', ''))
            zip_code = clean_text(row.get('Zip', ''))
            
            if address:
                addr_parts.append(address)
            if state:
                addr_parts.append(state)
            if zip_code and addr_parts:
                addr_parts[-1] = f"{addr_parts[-1]} {zip_code}"
            
            full_address = ', '.join(addr_parts) if addr_parts else 'Dallas-Fort Worth Area'
            
            phone = clean_phone(row.get('Phone', ''))
            website = clean_website(row.get('Website', ''))
            email = clean_text(row.get('Email', ''))
            
            # Description
            notes = clean_text(row.get('Notes', ''))
            services = clean_text(row.get('Services', ''))
            desc_parts = []
            if subcategory:
                desc_parts.append(subcategory)
            if notes:
                desc_parts.append(notes)
            if services:
                desc_parts.append(services)
            description = '. '.join(desc_parts) if desc_parts else f"Vietnamese {category.lower()} business serving the DFW community."
            
            # Google Maps Link (new column from verified CSV)
            google_maps_link = clean_text(row.get('Google_Maps_Link', ''))
            link_type = clean_text(row.get('Link_Type', ''))
            
            business = {
                'id': idx,
                'name': name,
                'category': category,
                'originalCategory': original_cat,
                'subcategory': subcategory,
                'address': full_address,
                'phone': phone,
                'website': website,
                'email': email,
                'description': description,
                'rating': round(random.uniform(4.0, 4.9), 1),
                'reviewCount': random.randint(50, 250),
                'googleMapsLink': google_maps_link,
                'linkType': link_type
            }
            
            businesses.append(business)
            category_counts[category] += 1
    
    # Write JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(businesses, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created {OUTPUT_FILE} with {len(businesses)} businesses")
    print(f"📊 Categories: Food={category_counts['Food']}, Services={category_counts['Services']}, Shopping={category_counts['Shopping']}, Community={category_counts['Community']}")

if __name__ == '__main__':
    main()
