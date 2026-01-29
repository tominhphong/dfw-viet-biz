#!/usr/bin/env python3
"""
Data cleanup script for DFW Vietnamese Business Directory
- Fix Vietnamese encoding issues
- Remove duplicate businesses (same address)
- Keep entry with highest review count
"""

import json
from pathlib import Path

# Encoding fixes (mojibake to proper Vietnamese)
ENCODING_FIXES = {
    "Má»¹ Lan Restaurant": "Mỹ Lan Restaurant",
    "VÄ©nh BÃ¬nh": "Vĩnh Bình",
    "VÄ©nh BÃ¬nh Restaurant": "Vĩnh Bình Restaurant",
    "Phá»Ÿ ThiÃªn Ã": "Phở Thiên Ẩn",
    "Phá»Ÿ ThiÃªn Ã Deli": "Phở Thiên Ẩn Deli",
}

def fix_encoding(data):
    """Fix Vietnamese encoding issues in names"""
    fixed_count = 0
    for item in data:
        if item["name"] in ENCODING_FIXES:
            old_name = item["name"]
            item["name"] = ENCODING_FIXES[old_name]
            # Also update slug
            item["slug"] = generate_slug(item["name"])
            print(f"  ✓ Fixed: '{old_name}' → '{item['name']}'")
            fixed_count += 1
    return fixed_count

def generate_slug(name):
    """Generate URL-friendly slug from name"""
    import re
    import unicodedata
    
    # Normalize and remove accents
    normalized = unicodedata.normalize('NFD', name)
    ascii_name = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    
    # Convert to lowercase and replace non-alphanumeric with hyphens
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', ascii_name.lower())
    slug = slug.strip('-')
    
    return f"{slug}-dfw"

def remove_duplicates(data):
    """Remove duplicate businesses at same address, keep highest review count"""
    # Group by address
    address_groups = {}
    for item in data:
        addr = item["address"]
        if addr not in address_groups:
            address_groups[addr] = []
        address_groups[addr].append(item)
    
    # Keep best entry from each group
    cleaned = []
    removed_count = 0
    
    for addr, items in address_groups.items():
        if len(items) == 1:
            cleaned.append(items[0])
        else:
            # Sort by review count (descending), then rating
            items.sort(key=lambda x: (x.get("reviewCount", 0), x.get("rating", 0)), reverse=True)
            best = items[0]
            
            # Merge unique info from other entries
            for other in items[1:]:
                if not best.get("phone") and other.get("phone"):
                    best["phone"] = other["phone"]
                if not best.get("website") and other.get("website"):
                    best["website"] = other["website"]
                if not best.get("email") and other.get("email"):
                    best["email"] = other["email"]
            
            cleaned.append(best)
            removed_count += len(items) - 1
            print(f"  ✓ Deduplicated: '{addr}' (kept '{best['name']}', removed {len(items)-1})")
    
    return cleaned, removed_count

def main():
    seed_path = Path("src/data/seed.json")
    
    # Load data
    print("📂 Loading seed.json...")
    with open(seed_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    original_count = len(data)
    print(f"   Found {original_count} businesses\n")
    
    # Fix encoding
    print("🔤 Fixing Vietnamese encoding...")
    encoding_fixed = fix_encoding(data)
    print(f"   Fixed {encoding_fixed} records\n")
    
    # Remove duplicates
    print("🗑️  Removing duplicates...")
    data, removed = remove_duplicates(data)
    print(f"   Removed {removed} duplicates\n")
    
    # Reassign IDs
    print("🔢 Reassigning IDs...")
    for i, item in enumerate(data, 1):
        item["id"] = i
    
    # Save cleaned data
    print(f"💾 Saving {len(data)} businesses...")
    with open(seed_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Done!")
    print(f"   Before: {original_count} businesses")
    print(f"   After:  {len(data)} businesses")
    print(f"   Removed: {original_count - len(data)} duplicates")

if __name__ == "__main__":
    main()
