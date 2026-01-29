// Translation strings for Vietnamese-English bilingual support
// Vietnamese is the default language

export type Language = "vi" | "en";

export const translations = {
    vi: {
        // Header
        title: "DFW Vietnamese Biz",
        subtitle: "Hướng dẫn toàn diện về ẩm thực, mua sắm và dịch vụ Việt Nam tại Dallas-Fort Worth.",
        randomButton: "🎲 Để Vũ Trụ Quyết Định",
        addBizButton: "➕ Thêm Doanh Nghiệp",

        // Search
        searchPlaceholder: "Tìm kiếm theo tên doanh nghiệp...",
        sortBy: "Sắp xếp theo",
        sortNameAZ: "Tên A-Z",
        sortNameZA: "Tên Z-A",
        sortRating: "Đánh giá ⭐",
        sortReviews: "Nhiều đánh giá nhất",
        showing: "Hiển thị",
        of: "trong",
        businesses: "doanh nghiệp",

        // Categories
        all: "Tất cả",
        allSubcategories: "Tất cả ngành nghề",

        // Business card
        openMaps: "Bản đồ",
        viewDetails: "Xem chi tiết",
        reviews: "đánh giá",
        noResults: "Không tìm thấy doanh nghiệp nào. Hãy là người đầu tiên thêm!",

        // Random modal
        universeChose: "Vũ trụ đã chọn cho bạn!",
        spinAgain: "Quay lại",
        close: "Đóng",

        // Submit form
        addYourBusiness: "Thêm Doanh Nghiệp",
        helpGrow: "Giúp chúng tôi phát triển cộng đồng doanh nghiệp Việt Nam tại DFW!",
        businessName: "Tên doanh nghiệp",
        category: "Danh mục",
        streetAddress: "Địa chỉ",
        city: "Thành phố",
        state: "Bang",
        zip: "Mã bưu chính",
        phone: "Điện thoại",
        website: "Website",
        businessEmail: "Email doanh nghiệp",
        description: "Mô tả",
        yourName: "Tên của bạn",
        submitBusiness: "Gửi Doanh Nghiệp",
        required: "bắt buộc",
        optional: "tùy chọn",
        thankYou: "Cảm ơn bạn!",
        emailWillOpen: "Ứng dụng email sẽ mở với thông tin đã điền sẵn.",

        // Detail page
        location: "Vị trí",
        contact: "Liên hệ",
        about: "Giới thiệu",
        share: "Chia sẻ",
        backToDirectory: "← Quay lại Danh bạ",
        openInMaps: "🗺️ Mở trong Google Maps",
        noDescription: "Chưa có mô tả.",
        noContact: "Chưa có thông tin liên hệ",
    },
    en: {
        // Header
        title: "DFW Vietnamese Biz",
        subtitle: "The ultimate guide to Vietnamese cuisine, shopping, and services in Dallas-Fort Worth.",
        randomButton: "🎲 Let the Universe Decide",
        addBizButton: "➕ Add Your Biz",

        // Search
        searchPlaceholder: "Search businesses by name...",
        sortBy: "Sort by",
        sortNameAZ: "Name A-Z",
        sortNameZA: "Name Z-A",
        sortRating: "Rating ⭐",
        sortReviews: "Most Reviews",
        showing: "Showing",
        of: "of",
        businesses: "businesses",

        // Categories
        all: "All",
        allSubcategories: "All subcategories",

        // Business card
        openMaps: "Maps",
        viewDetails: "View Details",
        reviews: "reviews",
        noResults: "No businesses found. Be the first to add one!",

        // Random modal
        universeChose: "The Universe has chosen for you!",
        spinAgain: "Spin Again",
        close: "Close",

        // Submit form
        addYourBusiness: "Add Your Business",
        helpGrow: "Help us grow the Vietnamese biz community in DFW!",
        businessName: "Business Name",
        category: "Category",
        streetAddress: "Street Address",
        city: "City",
        state: "State",
        zip: "Zip",
        phone: "Phone",
        website: "Website",
        businessEmail: "Business Email",
        description: "Description",
        yourName: "Your Name",
        submitBusiness: "Submit Business",
        required: "required",
        optional: "optional",
        thankYou: "Thank You!",
        emailWillOpen: "Your email app will open with pre-filled details.",

        // Detail page
        location: "Location",
        contact: "Contact",
        about: "About",
        share: "Share",
        backToDirectory: "← Back to Directory",
        openInMaps: "🗺️ Open in Google Maps",
        noDescription: "No description available.",
        noContact: "No contact info available",
    },
} as const;

export type TranslationKey = keyof typeof translations.vi;

// Category translations (Vietnamese ↔ English)
export const categoryTranslations: Record<string, { vi: string; en: string }> = {
    "All": { vi: "Tất cả", en: "All" },
    "Automotive": { vi: "Ô tô", en: "Automotive" },
    "Restaurant": { vi: "Nhà hàng", en: "Restaurant" },
    "Healthcare": { vi: "Y tế", en: "Healthcare" },
    "Retail": { vi: "Bán lẻ", en: "Retail" },
    "Beauty & Personal Care": { vi: "Làm đẹp", en: "Beauty" },
    "Professional Services": { vi: "Dịch vụ", en: "Services" },
    "Religious": { vi: "Tôn giáo", en: "Religious" },
    "Community": { vi: "Cộng đồng", en: "Community" },
    "Entertainment": { vi: "Giải trí", en: "Entertainment" },
    "Media": { vi: "Truyền thông", en: "Media" },
    "Construction": { vi: "Xây dựng", en: "Construction" },
    "Florist": { vi: "Hoa", en: "Florist" },
    "Food & Beverage": { vi: "Ẩm thực", en: "F&B" },
    "Food Services": { vi: "Dịch vụ ăn uống", en: "Food Svc" },
    "Sports": { vi: "Thể thao", en: "Sports" },
    "Supermarket": { vi: "Siêu thị", en: "Supermarket" },
    "Bakery": { vi: "Bánh", en: "Bakery" },
    "Shopping Center": { vi: "TTTM", en: "Mall" },
    "Community Organization": { vi: "Tổ chức CĐ", en: "Org" },
};
