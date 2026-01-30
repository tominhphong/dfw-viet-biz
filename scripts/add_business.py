#!/usr/bin/env python3
"""
🚀 Quick Business Approval Script
Usage: python scripts/add_business.py

Paste the email content when prompted, then script will:
1. Parse the submission
2. Add to seed.json
3. Build and deploy (optional)
"""

import json
import re
from pathlib import Path

def slugify(name):
    """Create URL-friendly slug from name"""
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = slug.strip('-')
    return f"{slug}-dfw"

def get_vietnamese_subcategory(category):
    """Map category to Vietnamese subcategory"""
    mappings = {
        "Restaurant": "Ẩm Thực Việt",
        "Healthcare": "Y Khoa",
        "Retail": "Bán Lẻ",
        "Automotive": "Sửa Xe",
        "Beauty & Personal Care": "Tiệm Nail",
        "Professional Services": "Dịch Vụ",
        "Religious": "Tôn Giáo",
        "Community": "Cộng Đồng",
    }
    return mappings.get(category, category)

def parse_email(email_text):
    """Parse email submission into business data"""
    data = {}
    
    # Extract fields with regex
    patterns = {
        "name": r"Business Name:\s*(.+)",
        "category": r"Category:\s*(.+)",
        "address": r"Address:\s*(.+)",
        "phone": r"Phone:\s*(.+)",
        "website": r"Website:\s*(.+)",
        "email": r"Email:\s*(.+)",
        "description": r"Description:\s*(.+)",
    }
    
    for field, pattern in patterns.items():
        match = re.search(pattern, email_text, re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            if value.lower() in ["not provided", "none", "n/a", "-"]:
                value = None
            data[field] = value
        else:
            data[field] = None
    
    return data

def main():
    seed_path = Path("src/data/seed.json")
    
    print("\n" + "="*50)
    print("🚀 DFW Vietnamese Biz - Quick Add Business")
    print("="*50)
    
    # Load current data
    with open(seed_path, "r", encoding="utf-8") as f:
        businesses = json.load(f)
    
    next_id = max(b["id"] for b in businesses) + 1
    
    print(f"\n📊 Current: {len(businesses)} businesses")
    print(f"📝 New ID: {next_id}\n")
    
    # Get email content
    print("📧 Paste email content (end with empty line):")
    print("-"*50)
    
    lines = []
    while True:
        try:
            line = input()
            if line == "":
                break
            lines.append(line)
        except EOFError:
            break
    
    email_text = "\n".join(lines)
    
    if not email_text.strip():
        print("❌ No content provided. Exiting.")
        return
    
    # Parse
    data = parse_email(email_text)
    
    if not data["name"]:
        print("❌ Could not find business name. Exiting.")
        return
    
    # Map to category structure
    original_category = {
        "Restaurant": "Restaurant",
        "Services": "Professional Services",
        "Healthcare": "Healthcare",
        "Retail": "Retail",
        "Automotive": "Automotive",
        "Beauty": "Beauty & Personal Care",
        "Religious": "Religious",
        "Community": "Community",
    }.get(data["category"], "Professional Services")
    
    # Create business entry
    new_business = {
        "id": next_id,
        "name": data["name"],
        "slug": slugify(data["name"]),
        "category": "Services" if original_category == "Professional Services" else data["category"] or "Services",
        "originalCategory": original_category,
        "subcategory": get_vietnamese_subcategory(original_category),
        "address": data["address"] or "DFW Area, TX",
        "phone": data["phone"],
        "website": data["website"],
        "email": data["email"],
        "description": data["description"] or f"{data['name']} - Doanh nghiệp Việt Nam tại DFW",
        "googleMapsLink": None,
        "linkType": None
    }
    
    # Show preview
    print("\n" + "="*50)
    print("✅ PARSED BUSINESS:")
    print("="*50)
    print(json.dumps(new_business, ensure_ascii=False, indent=2))
    
    # Confirm
    print("\n" + "-"*50)
    confirm = input("➡️  Add this business? (y/n): ").strip().lower()
    
    if confirm != "y":
        print("❌ Cancelled.")
        return
    
    # Add and save
    businesses.append(new_business)
    
    with open(seed_path, "w", encoding="utf-8") as f:
        json.dump(businesses, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Added! Total: {len(businesses)} businesses")
    
    # Offer to deploy
    print("\n" + "-"*50)
    deploy = input("🚀 Build and deploy now? (y/n): ").strip().lower()
    
    if deploy == "y":
        import subprocess
        print("\n📦 Building...")
        subprocess.run(["npm", "run", "build"], check=True)
        print("\n📤 Committing and pushing...")
        subprocess.run(["git", "add", "-A"], check=True)
        subprocess.run(["git", "commit", "-m", f"Add business: {data['name']}"], check=True)
        subprocess.run(["git", "push", "origin", "main"], check=True)
        print("\n🎉 Done! Vercel will auto-deploy in ~1 minute.")
    else:
        print("\n💡 To deploy later, run:")
        print("   npm run build && git add -A && git commit -m 'Add business' && git push")

if __name__ == "__main__":
    main()
