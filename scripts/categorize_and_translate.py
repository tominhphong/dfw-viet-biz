#!/usr/bin/env python3
"""
Script to:
1. Categorize restaurants by food type based on name analysis
2. Add Vietnamese translations for all subcategories
"""

import json
import re
from pathlib import Path

# Vietnamese translations for all subcategories
SUBCATEGORY_TRANSLATIONS = {
    # Restaurant food types
    "Phở": "Phở",
    "Bánh Mì": "Bánh Mì",
    "Bún Bò": "Bún Bò",
    "Hủ Tiếu": "Hủ Tiếu",
    "Cơm": "Cơm",
    "Chè & Trà Sữa": "Chè & Trà Sữa",
    "Cà Phê": "Cà Phê",
    "Bánh Ngọt": "Bánh Ngọt",
    "Hải Sản": "Hải Sản",
    "Lẩu & Nướng": "Lẩu & Nướng",
    "Ẩm Thực Việt": "Ẩm Thực Việt",
    "Fusion": "Fusion",
    
    # Healthcare
    "Acupuncture": "Châm Cứu",
    "Cardiology": "Tim Mạch",
    "Chiropractic": "Chỉnh Hình Cột Sống",
    "Chiropractor": "Chỉnh Hình Cột Sống",
    "Dentistry": "Nha Khoa",
    "Family Medicine": "Y Khoa Gia Đình",
    "Herbal Medicine": "Đông Y",
    "Home Health": "Chăm Sóc Tại Nhà",
    "Optometry": "Nhãn Khoa",
    "Pediatrics": "Nhi Khoa",
    "Pharmacy": "Nhà Thuốc",
    "Physician": "Bác Sĩ",
    "Traditional Medicine": "Y Học Cổ Truyền",
    "Internal Medicine & Sleep Medicine (Dr. Linh Ba)": "Nội Khoa & Giấc Ngủ",
    
    # Retail
    "Asian Grocery": "Chợ Châu Á",
    "Asian Mall": "Trung Tâm Thương Mại Á Châu",
    "Beauty Supply": "Đồ Làm Đẹp",
    "Grocery": "Tạp Hóa",
    "Jewelry": "Vàng Bạc Trang Sức",
    "Mall": "Trung Tâm Thương Mại",
    "Plaza": "Khu Thương Mại",
    "Seafood Market": "Chợ Hải Sản",
    "Vietnamese Bakery": "Tiệm Bánh Việt",
    "Vietnamese Grocery": "Chợ Việt",
    
    # Automotive
    "Auto Repair": "Sửa Xe",
    "Car Dealership": "Đại Lý Xe Hơi",
    
    # Beauty & Personal Care
    "Cosmetics & Skincare": "Mỹ Phẩm & Da Liễu",
    "Hair Salon": "Tiệm Tóc",
    "Nail Salon": "Tiệm Nail",
    "Nail Supply": "Vật Tư Nail",
    
    # Professional Services
    "Accountant": "Kế Toán",
    "Alterations": "Sửa Đồ",
    "Computer Repair": "Sửa Máy Tính",
    "Dry Cleaner": "Giặt Khô",
    "General Contractor": "Nhà Thầu",
    "IT Services": "Dịch Vụ IT",
    "Immigration": "Di Trú",
    "Immigration Services": "Dịch Vụ Di Trú",
    "Insurance": "Bảo Hiểm",
    "Insurance & Tax": "Bảo Hiểm & Thuế",
    "Legal Services": "Dịch Vụ Pháp Lý",
    "Notary": "Công Chứng",
    "Real Estate": "Địa Ốc",
    "Tailoring": "May Đo",
    
    # Religious
    "Baptist Church": "Nhà Thờ Baptist",
    "Buddhist Temple": "Chùa Phật Giáo",
    "Catholic Church": "Nhà Thờ Công Giáo",
    "Church": "Nhà Thờ",
    
    # Community
    "Billiards": "Bi-a",
    "Coffee Shop": "Quán Cà Phê",
    "Community Center": "Trung Tâm Cộng Đồng",
    "Donut Shop": "Tiệm Bánh Donut",
    "Funeral Flowers": "Hoa Tang Lễ",
    "Newspaper": "Báo Chí",
    "Non-Profit": "Phi Lợi Nhuận",
    "Radio": "Phát Thanh",
    "Soccer Club": "Câu Lạc Bộ Bóng Đá",
    "Television": "Truyền Hình",
    
    # Existing
    "Vietnamese": "Ẩm Thực Việt",
    "Asian Fusion": "Fusion",
}

# Food type detection patterns
FOOD_PATTERNS = [
    (r'\bpho\b', "Phở"),
    (r'\bphở\b', "Phở"),
    (r'\bbanh mi\b', "Bánh Mì"),
    (r'\bbánh mì\b', "Bánh Mì"),
    (r'\bbun bo\b', "Bún Bò"),
    (r'\bbún bò\b', "Bún Bò"),
    (r'\bhu tieu\b', "Hủ Tiếu"),
    (r'\bhủ tiếu\b', "Hủ Tiếu"),
    (r'\bcom\b', "Cơm"),
    (r'\bcơm\b', "Cơm"),
    (r'\bche\b', "Chè & Trà Sữa"),
    (r'\bchè\b', "Chè & Trà Sữa"),
    (r'\bboba\b', "Chè & Trà Sữa"),
    (r'\btea\b', "Chè & Trà Sữa"),
    (r'\bcoffee\b', "Cà Phê"),
    (r'\bcà phê\b', "Cà Phê"),
    (r'\bcafe\b', "Cà Phê"),
    (r'\bbakery\b', "Bánh Ngọt"),
    (r'\bseafood\b', "Hải Sản"),
    (r'\bhải sản\b', "Hải Sản"),
    (r'\bhotpot\b', "Lẩu & Nướng"),
    (r'\blau\b', "Lẩu & Nướng"),
    (r'\blẩu\b', "Lẩu & Nướng"),
    (r'\bbbq\b', "Lẩu & Nướng"),
    (r'\bnướng\b', "Lẩu & Nướng"),
]


def categorize_restaurant_by_name(name):
    """Detect food type from business name"""
    name_lower = name.lower()
    
    for pattern, food_type in FOOD_PATTERNS:
        if re.search(pattern, name_lower):
            return food_type
    
    return "Ẩm Thực Việt"  # Default


def translate_subcategory(sub):
    """Translate subcategory to Vietnamese"""
    return SUBCATEGORY_TRANSLATIONS.get(sub, sub)


def main():
    seed_path = Path("src/data/seed.json")
    
    print("📂 Loading seed.json...")
    with open(seed_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    print(f"   Found {len(data)} businesses\n")
    
    # Categorize restaurants by food type
    print("🍜 Categorizing restaurants by food type...")
    restaurant_count = 0
    food_type_counts = {}
    
    for item in data:
        if item.get("originalCategory") == "Restaurant":
            food_type = categorize_restaurant_by_name(item["name"])
            item["subcategory"] = food_type
            restaurant_count += 1
            food_type_counts[food_type] = food_type_counts.get(food_type, 0) + 1
    
    print(f"   Categorized {restaurant_count} restaurants:")
    for ft, count in sorted(food_type_counts.items(), key=lambda x: -x[1]):
        print(f"     {ft}: {count}")
    
    # Translate all subcategories
    print("\n🇻🇳 Translating all subcategories to Vietnamese...")
    translated = 0
    for item in data:
        if item.get("subcategory"):
            old_sub = item["subcategory"]
            new_sub = translate_subcategory(old_sub)
            if old_sub != new_sub:
                item["subcategory"] = new_sub
                translated += 1
    
    print(f"   Translated {translated} subcategories\n")
    
    # Save
    print("💾 Saving updated data...")
    with open(seed_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("\n✅ Done!")


if __name__ == "__main__":
    main()
