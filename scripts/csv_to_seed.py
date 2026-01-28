#!/usr/bin/env python3
"""Convert CSV database to seed.json format for DFW Vietnamese Directory."""

import csv
import json
import random
import re
import sys

# Category mapping from original categories to app categories
CATEGORY_MAP = {
    # Food category
    'Restaurant': 'Food',
    'Bakery': 'Food',
    'Cafe': 'Food',
    'Food': 'Food',
    
    # Services category  
    'Healthcare': 'Services',
    'Medical': 'Services',
    'Dental': 'Services',
    'Legal': 'Services',
    'Insurance': 'Services',
    'Real Estate': 'Services',
    'Nail Salon': 'Services',
    'Beauty': 'Services',
    'Auto': 'Services',
    'Tax': 'Services',
    'DDS': 'Services',
    'MD': 'Services',
    'DO': 'Services',
    'DMD': 'Services',
    'PA-C': 'Services',
    
    # Shopping category
    'Supermarket': 'Shopping',
    'Shopping Center': 'Shopping',
    'Retail': 'Shopping',
    'Grocery': 'Shopping',
    
    # Community category
    'Community Organization': 'Community',
    'Religious': 'Community',
    'Church': 'Community',
    'Temple': 'Community',
    'Media': 'Community',
    'Non-profit': 'Community',
}

def clean_text(text):
    """Clean text by removing extra quotes and whitespace."""
    if not text:
        return None
    text = text.strip().strip('"').strip()
    return text if text else None

def normalize_category(original_cat):
    """Map original category to one of the 4 main categories."""
    if not original_cat:
        return 'Services', original_cat
        
    original_cat = clean_text(original_cat)
    
    # Check for exact match first
    if original_cat in CATEGORY_MAP:
        return CATEGORY_MAP[original_cat], original_cat
    
    # Check if any key is contained in the category
    for key, value in CATEGORY_MAP.items():
        if key.lower() in original_cat.lower():
            return value, original_cat
    
    # Default to Services for professional/business categories
    return 'Services', original_cat

def generate_rating():
    """Generate realistic rating between 4.0 and 4.9."""
    return round(random.uniform(4.0, 4.9), 1)

def generate_review_count():
    """Generate realistic review count between 50 and 250."""
    return random.randint(50, 250)

def clean_phone(phone):
    """Clean and normalize phone number."""
    if not phone:
        return None
    phone = clean_text(phone)
    if not phone or 'Contact' in phone:
        return None
    # Keep only phone numbers that look valid
    if re.search(r'\(\d{3}\)\s*\d{3}-\d{4}', phone):
        return phone
    return None

def clean_website(website):
    """Clean website URL."""
    if not website:
        return None
    website = clean_text(website)
    if not website:
        return None
    # Remove http(s):// prefix if present
    website = re.sub(r'^https?://', '', website)
    return website if website else None

def main():
    csv_file = sys.argv[1] if len(sys.argv) > 1 else '/Volumes/homes/phongto/Miniforums_Windows/CSV Files/Vietnamese_Businesses_Garland_Full_Database.csv'
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'src/data/seed.json'
    
    businesses = []
    category_counts = {'Food': 0, 'Services': 0, 'Shopping': 0, 'Community': 0}
    
    try:
        with open(csv_file, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.DictReader(f)
            
            for idx, row in enumerate(reader, start=1):
                name = clean_text(row.get('Business_Name', ''))
                if not name:
                    continue
                
                category, original_cat = normalize_category(row.get('Category', ''))
                subcategory = clean_text(row.get('Subcategory', ''))
                
                # Build full address
                addr_parts = []
                for field in ['Address', 'City', 'State']:
                    val = clean_text(row.get(field, ''))
                    if val:
                        addr_parts.append(val)
                        
                zip_code = clean_text(row.get('Zip', ''))
                if zip_code:
                    addr_parts[-1] = f"{addr_parts[-1]} {zip_code}"
                
                address = ', '.join(addr_parts) if addr_parts else 'Dallas-Fort Worth Area'
                
                phone = clean_phone(row.get('Phone', ''))
                website = clean_website(row.get('Website', ''))
                email = clean_text(row.get('Email', ''))
                
                # Generate description
                notes = clean_text(row.get('Notes', ''))
                services = clean_text(row.get('Services', ''))
                
                desc_parts = []
                if notes:
                    desc_parts.append(notes)
                if services:
                    desc_parts.append(f"Services: {services}")
                if subcategory:
                    desc_parts.append(f"Specializing in {subcategory}")
                    
                description = '. '.join(desc_parts) if desc_parts else f"Vietnamese {category.lower()} business serving the DFW community."
                
                business = {
                    'id': idx,
                    'name': name,
                    'category': category,
                    'originalCategory': original_cat,
                    'subcategory': subcategory,
                    'address': address,
                    'phone': phone,
                    'website': website,
                    'email': email,
                    'description': description,
                    'rating': generate_rating(),
                    'reviewCount': generate_review_count()
                }
                
                businesses.append(business)
                category_counts[category] += 1
    
    except Exception as e:
        print(f"Error reading CSV: {e}")
        sys.exit(1)
    
    # Write JSON output
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(businesses, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Converted {len(businesses)} businesses to {output_file}")
    print(f"📊 Category breakdown:")
    for cat, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        print(f"   {cat}: {count}")

if __name__ == '__main__':
    main()
