#!/usr/bin/env python3
"""
Script to find duplicate businesses in seed.json
Checks for:
1. Same/similar addresses
2. Similar names (fuzzy matching)
3. Same phone numbers
"""

import json
import re
from collections import defaultdict
from difflib import SequenceMatcher

def normalize_address(address: str) -> str:
    """Normalize address for comparison"""
    if not address:
        return ""
    addr = address.lower().strip()
    # Normalize common abbreviations
    addr = re.sub(r'\bst\.?\b', 'street', addr)
    addr = re.sub(r'\bave\.?\b', 'avenue', addr)
    addr = re.sub(r'\bdr\.?\b', 'drive', addr)
    addr = re.sub(r'\bln\.?\b', 'lane', addr)
    addr = re.sub(r'\bblvd\.?\b', 'boulevard', addr)
    addr = re.sub(r'\brd\.?\b', 'road', addr)
    addr = re.sub(r'\bn\.?\b', 'north', addr)
    addr = re.sub(r'\bs\.?\b', 'south', addr)
    addr = re.sub(r'\be\.?\b', 'east', addr)
    addr = re.sub(r'\bw\.?\b', 'west', addr)
    addr = re.sub(r'\bste\.?\b', 'suite', addr)
    addr = re.sub(r'#', 'suite ', addr)
    # Remove extra spaces
    addr = re.sub(r'\s+', ' ', addr)
    return addr

def normalize_phone(phone: str) -> str:
    """Normalize phone number - keep only digits"""
    if not phone:
        return ""
    return re.sub(r'\D', '', phone)

def get_street_number(address: str) -> str:
    """Extract street number from address"""
    if not address:
        return ""
    match = re.match(r'(\d+)', address)
    return match.group(1) if match else ""

def similarity(a: str, b: str) -> float:
    """Calculate string similarity ratio"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def main():
    # Load data
    with open('src/data/seed.json', 'r', encoding='utf-8') as f:
        businesses = json.load(f)
    
    print(f"📊 Total businesses: {len(businesses)}\n")
    
    # Group by normalized address
    address_groups = defaultdict(list)
    phone_groups = defaultdict(list)
    
    for biz in businesses:
        # Group by street number + first part of address
        addr = biz.get('address', '')
        street_num = get_street_number(addr)
        if street_num:
            # Use street number + first word of street name
            norm_addr = normalize_address(addr)
            key = f"{street_num}_{norm_addr[:50]}"
            address_groups[key].append(biz)
        
        # Group by phone
        phone = normalize_phone(biz.get('phone', ''))
        if phone and len(phone) >= 10:
            phone_groups[phone].append(biz)
    
    # Find duplicates
    duplicates_found = []
    seen_pairs = set()
    
    print("=" * 60)
    print("🔍 POTENTIAL DUPLICATES FOUND")
    print("=" * 60)
    
    # Check address groups
    for key, group in address_groups.items():
        if len(group) > 1:
            # Multiple businesses at similar address
            for i, biz1 in enumerate(group):
                for biz2 in group[i+1:]:
                    pair_key = tuple(sorted([biz1['id'], biz2['id']]))
                    if pair_key not in seen_pairs:
                        name_sim = similarity(biz1['name'], biz2['name'])
                        if name_sim > 0.5 or normalize_address(biz1['address']) == normalize_address(biz2['address']):
                            seen_pairs.add(pair_key)
                            duplicates_found.append({
                                'reason': 'Similar address',
                                'name_similarity': name_sim,
                                'biz1': biz1,
                                'biz2': biz2
                            })
    
    # Check phone groups
    for phone, group in phone_groups.items():
        if len(group) > 1:
            for i, biz1 in enumerate(group):
                for biz2 in group[i+1:]:
                    pair_key = tuple(sorted([biz1['id'], biz2['id']]))
                    if pair_key not in seen_pairs:
                        seen_pairs.add(pair_key)
                        duplicates_found.append({
                            'reason': 'Same phone',
                            'name_similarity': similarity(biz1['name'], biz2['name']),
                            'biz1': biz1,
                            'biz2': biz2
                        })
    
    # Also check for very similar names (regardless of address)
    for i, biz1 in enumerate(businesses):
        for biz2 in businesses[i+1:]:
            pair_key = tuple(sorted([biz1['id'], biz2['id']]))
            if pair_key not in seen_pairs:
                name_sim = similarity(biz1['name'], biz2['name'])
                if name_sim > 0.85:
                    seen_pairs.add(pair_key)
                    duplicates_found.append({
                        'reason': 'Very similar name',
                        'name_similarity': name_sim,
                        'biz1': biz1,
                        'biz2': biz2
                    })
    
    # Sort by name similarity
    duplicates_found.sort(key=lambda x: x['name_similarity'], reverse=True)
    
    # Print results
    ids_to_remove = []
    
    for i, dup in enumerate(duplicates_found, 1):
        biz1, biz2 = dup['biz1'], dup['biz2']
        print(f"\n{'─' * 60}")
        print(f"🔴 Duplicate #{i} ({dup['reason']}, similarity: {dup['name_similarity']:.0%})")
        print(f"{'─' * 60}")
        print(f"  📍 Business A (ID: {biz1['id']}):")
        print(f"     Name:    {biz1['name']}")
        print(f"     Address: {biz1.get('address', 'N/A')}")
        print(f"     Phone:   {biz1.get('phone', 'N/A')}")
        print(f"     Slug:    {biz1['slug']}")
        print()
        print(f"  📍 Business B (ID: {biz2['id']}):")
        print(f"     Name:    {biz2['name']}")
        print(f"     Address: {biz2.get('address', 'N/A')}")
        print(f"     Phone:   {biz2.get('phone', 'N/A')}")
        print(f"     Slug:    {biz2['slug']}")
        
        # Suggest which one to remove (prefer keeping the one with more info)
        score1 = sum([bool(biz1.get(k)) for k in ['phone', 'website', 'email', 'description', 'googleMapsLink']])
        score2 = sum([bool(biz2.get(k)) for k in ['phone', 'website', 'email', 'description', 'googleMapsLink']])
        
        if score1 >= score2:
            print(f"  💡 Suggest: KEEP A (ID: {biz1['id']}), REMOVE B (ID: {biz2['id']})")
            ids_to_remove.append(biz2['id'])
        else:
            print(f"  💡 Suggest: KEEP B (ID: {biz2['id']}), REMOVE A (ID: {biz1['id']})")
            ids_to_remove.append(biz1['id'])
    
    print("\n" + "=" * 60)
    print(f"📊 SUMMARY")
    print("=" * 60)
    print(f"Total potential duplicates: {len(duplicates_found)}")
    print(f"Suggested IDs to remove: {ids_to_remove}")
    print()
    
    # Save to file for review
    with open('scripts/duplicates_report.json', 'w', encoding='utf-8') as f:
        json.dump({
            'total_businesses': len(businesses),
            'duplicates_found': len(duplicates_found),
            'suggested_ids_to_remove': ids_to_remove,
            'details': [
                {
                    'reason': d['reason'],
                    'similarity': d['name_similarity'],
                    'business_a': {
                        'id': d['biz1']['id'],
                        'name': d['biz1']['name'],
                        'address': d['biz1'].get('address'),
                        'slug': d['biz1']['slug']
                    },
                    'business_b': {
                        'id': d['biz2']['id'],
                        'name': d['biz2']['name'],
                        'address': d['biz2'].get('address'),
                        'slug': d['biz2']['slug']
                    }
                }
                for d in duplicates_found
            ]
        }, f, indent=2, ensure_ascii=False)
    
    print("📄 Full report saved to: scripts/duplicates_report.json")

if __name__ == '__main__':
    main()
