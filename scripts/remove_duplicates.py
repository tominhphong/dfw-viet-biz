#!/usr/bin/env python3
"""
Script to remove confirmed duplicate businesses from seed.json
"""

import json

# TRUE DUPLICATES - these are the same business listed twice
# Format: ID to REMOVE -> reason
DUPLICATES_TO_REMOVE = {
    155: "Chua Dao Quang duplicate - keep 148 (has phone)",
    267: "Mỹ Lan Restaurant duplicate - keep 226 (has zip code)",
    270: "Bun Dong Ba duplicate - keep 228 (has full zip code)",
    311: "Hong Kong Market duplicate - keep 289 (same info)",
    156: "St Peter Vietnamese Catholic Church duplicate - keep 146 (has full address)",
    106: "Dr. Thanh Pham - Smiley Chiropractic duplicate - keep 96 (has more details)",
    317: "Vietnam Plaza Grocery duplicate - keep 315 (has full zip)",
    139: "Julie Nguyen - Realtor/Ultima duplicate - same person same address - keep 122",
    281: "My Lan Restaurant at different address but same slug causing conflict - keep 226",
    # Note: I Luv Pho - these are DIFFERENT LOCATIONS (Forest Ln vs MacArthur) - NOT DUPLICATES
    # Note: Pho Pasteur, Pho Pasteur II, Pho Pasteur 4 - these are DIFFERENT RESTAURANTS - NOT DUPLICATES
    # Note: Different Dr. Nguyen - these are DIFFERENT DOCTORS - NOT DUPLICATES
    # Note: Top Nail Supply vs Pro Nail Supply - DIFFERENT BUSINESSES - NOT DUPLICATES
    # Note: Pho Bistro vs Pho Bistro 2 - DIFFERENT LOCATIONS - NOT DUPLICATES
    # Note: St. Peter vs St. Joseph churches - DIFFERENT CHURCHES - NOT DUPLICATES
}

def main():
    print("🔧 Removing duplicate businesses from seed.json")
    print("=" * 60)
    
    # Load data
    with open('src/data/seed.json', 'r', encoding='utf-8') as f:
        businesses = json.load(f)
    
    print(f"📊 Original count: {len(businesses)} businesses")
    print()
    
    # Remove duplicates
    removed = []
    cleaned = []
    
    for biz in businesses:
        if biz['id'] in DUPLICATES_TO_REMOVE:
            removed.append({
                'id': biz['id'],
                'name': biz['name'],
                'address': biz.get('address'),
                'reason': DUPLICATES_TO_REMOVE[biz['id']]
            })
            print(f"❌ Removing ID {biz['id']}: {biz['name']}")
            print(f"   Reason: {DUPLICATES_TO_REMOVE[biz['id']]}")
        else:
            cleaned.append(biz)
    
    print()
    print(f"✅ Removed {len(removed)} duplicates")
    print(f"📊 New count: {len(cleaned)} businesses")
    
    # Backup original
    with open('src/data/seed.json.backup', 'w', encoding='utf-8') as f:
        json.dump(businesses, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Backup saved to: src/data/seed.json.backup")
    
    # Save cleaned data
    with open('src/data/seed.json', 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)
    print(f"✅ Cleaned data saved to: src/data/seed.json")
    
    # Save removal log
    with open('scripts/removed_duplicates.json', 'w', encoding='utf-8') as f:
        json.dump({
            'removed_count': len(removed),
            'original_count': len(businesses),
            'new_count': len(cleaned),
            'removed': removed
        }, f, indent=2, ensure_ascii=False)
    print(f"📄 Removal log saved to: scripts/removed_duplicates.json")

if __name__ == '__main__':
    main()
