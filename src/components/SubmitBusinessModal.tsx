"use client";

import { useState, FormEvent } from "react";

interface SubmitBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    businessName: string;
    category: string;
    subcategory: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    website: string;
    email: string;
    description: string;
    ownerName: string;
}

// Main categories matching homepage MAIN_CATEGORIES
const MAIN_CATEGORIES = [
    "Restaurant",
    "Healthcare",
    "Retail",
    "Automotive",
    "Beauty & Personal Care",
    "Professional Services",
    "Religious",
    "Community",
];

// Subcategories grouped by main category
const SUBCATEGORIES: Record<string, string[]> = {
    "Restaurant": ["Phở", "Bánh Mì", "Cà Phê", "Chợ Việt", "Chợ Châu Á", "Chợ Hải Sản", "Nhà Hàng", "Quán Ăn", "Tiệm Bánh"],
    "Healthcare": ["Bác Sĩ", "Nha Khoa", "Chỉnh Hình Cột Sống", "Châm Cứu", "Thuốc Bắc", "Y Tế Tại Nhà"],
    "Retail": ["Chợ Việt", "Chợ Châu Á", "Cửa Hàng", "Tạp Hóa"],
    "Automotive": ["Sửa Xe", "Rửa Xe", "Phụ Tùng"],
    "Beauty & Personal Care": ["Tiệm Nail", "Tiệm Tóc", "Spa", "Thẩm Mỹ"],
    "Professional Services": ["Kế Toán", "Bảo Hiểm", "Bảo Hiểm & Thuế", "Luật Sư", "Địa Ốc", "Dịch Vụ Di Trú"],
    "Religious": ["Chùa Phật Giáo", "Nhà Thờ", "Tôn Giáo"],
    "Community": ["Cộng Đồng", "Hội Đoàn", "Câu Lạc Bộ Bóng Đá", "Dịch Vụ"],
};

// Vietnamese labels for dropdown display
const CATEGORY_LABELS_VI: Record<string, string> = {
    "Restaurant": "Nhà hàng",
    "Healthcare": "Y tế",
    "Retail": "Bán lẻ",
    "Automotive": "Ô tô",
    "Beauty & Personal Care": "Làm đẹp",
    "Professional Services": "Dịch Vụ",
    "Religious": "Tôn giáo",
    "Community": "Cộng đồng",
};

const initialFormData: FormData = {
    businessName: "",
    category: "Restaurant",
    subcategory: "",
    address: "",
    city: "Garland",
    state: "TX",
    zip: "",
    phone: "",
    website: "",
    email: "",
    description: "",
    ownerName: "",
};

export default function SubmitBusinessModal({ isOpen, onClose }: SubmitBusinessModalProps) {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Lì xì feature states
    const [liXiEmail, setLiXiEmail] = useState("");
    const [luckyNumber, setLuckyNumber] = useState<number | null>(null);
    const [liXiStep, setLiXiStep] = useState<"greeting" | "result">("greeting");
    const [liXiSubmitting, setLiXiSubmitting] = useState(false);
    const [liXiError, setLiXiError] = useState("");

    const handleLiXiSubmit = async () => {
        if (!liXiEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(liXiEmail)) {
            setLiXiError("Vui lòng nhập email hợp lệ");
            return;
        }
        setLiXiError("");
        setLiXiSubmitting(true);

        const number = Math.floor(1000 + Math.random() * 9000);

        try {
            await fetch("/api/li-xi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: liXiEmail,
                    luckyNumber: number,
                    businessName: formData.businessName,
                }),
            });
        } catch {
            // Still show number even if save fails
        }

        setLuckyNumber(number);
        setLiXiStep("result");
        setLiXiSubmitting(false);
    };

    const handleCloseLiXi = () => {
        setFormData(initialFormData);
        setImageFiles([]);
        setImagePreviews([]);
        setSubmitStatus("idle");
        setLiXiEmail("");
        setLuckyNumber(null);
        setLiXiStep("greeting");
        setLiXiError("");
        onClose();
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.businessName.trim()) {
            newErrors.businessName = "Vui lòng nhập tên doanh nghiệp";
        }



        // Phone: just check if it has 10 digits when stripped
        if (formData.phone) {
            const digits = formData.phone.replace(/\D/g, "");
            if (digits.length !== 10 && digits.length !== 0) {
                newErrors.phone = "Vui lòng nhập đủ 10 số điện thoại";
            }
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email không đúng định dạng";
        }

        // Website: accept https://, http://, www., or just domain
        if (formData.website && !/^(https?:\/\/)?(www\.)?[\w\-.]+(\.[\w\-]+)+/.test(formData.website)) {
            newErrors.website = "Website không đúng định dạng";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        // Build full address and Google Maps link only if address is provided
        const hasAddress = formData.address.trim().length > 0;
        const fullAddress = hasAddress
            ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`
            : null;
        const googleMapsLink = hasAddress && fullAddress
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
            : null;

        // Format website to ensure it has protocol
        let formattedWebsite = formData.website || null;
        if (formattedWebsite && !formattedWebsite.startsWith('http')) {
            formattedWebsite = `https://${formattedWebsite}`;
        }

        try {
            // Upload images to Supabase Storage first (if any)
            let imageUrls: string[] = [];
            if (imageFiles.length > 0) {
                const uploadPromises = imageFiles.map(async (file) => {
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
                    const formDataUpload = new FormData();
                    formDataUpload.append('file', file);
                    formDataUpload.append('fileName', fileName);

                    const uploadRes = await fetch('/api/upload-image', {
                        method: 'POST',
                        body: formDataUpload,
                    });

                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        return uploadData.url;
                    }
                    return null;
                });

                const results = await Promise.all(uploadPromises);
                imageUrls = results.filter((url): url is string => url !== null);
            }

            const response = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.businessName,
                    category: formData.category,
                    subcategory: formData.subcategory || null,
                    address: fullAddress,
                    city: formData.city,
                    state: formData.state,
                    phone: formData.phone || null,
                    website: formattedWebsite,
                    email: formData.email || null,
                    description: formData.description || null,
                    submitterEmail: formData.ownerName || null,
                    googleMapsLink: googleMapsLink,
                    images: imageUrls,
                }),
            });

            if (response.ok) {
                setSubmitStatus("success");
                setLiXiStep("greeting");
                setLuckyNumber(null);
                setLiXiEmail("");
                // Cleanup preview URLs
                imagePreviews.forEach(url => URL.revokeObjectURL(url));
            } else {
                setSubmitStatus("error");
            }
        } catch {
            setSubmitStatus("error");
        }

        setIsSubmitting(false);
    };

    // Format phone number as user types: (xxx) xxx-xxxx
    const formatPhoneNumber = (value: string): string => {
        const digits = value.replace(/\D/g, "");
        if (digits.length === 0) return "";
        if (digits.length <= 3) return `(${digits}`;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Auto-format phone number
        if (name === "phone") {
            setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-neutral-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-neutral-700 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-neutral-800 p-6 border-b border-neutral-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            📝 Thêm Doanh Nghiệp
                        </h2>
                        <p className="text-neutral-400 text-sm mt-1">
                            Cùng phát triển cộng đồng doanh nghiệp Việt tại DFW!
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white transition-colors text-2xl leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Success Message */}
                {submitStatus === "success" && liXiStep === "greeting" && (
                    <div className="p-6 text-center">
                        {/* Lì xì envelope animation */}
                        <div className="relative inline-block mb-4">
                            <div className="text-7xl animate-bounce">🧧</div>
                            <div className="absolute -top-2 -right-2 text-2xl animate-ping">✨</div>
                        </div>

                        <h3 className="text-2xl font-bold mb-1" style={{ color: '#FFD700' }}>
                            🎊 Chúc Mừng Năm Mới!
                        </h3>
                        <p className="text-lg text-orange-300 mb-1 font-medium">
                            Phúc — Lộc — Thọ
                        </p>
                        <p className="text-neutral-300 mb-1 text-sm">
                            ✅ Doanh nghiệp của bạn đã được gửi thành công!
                        </p>
                        <p className="text-neutral-400 text-xs mb-4">
                            Admin sẽ duyệt sớm nhất có thể.
                        </p>

                        {/* Divider */}
                        <div className="border-t border-dashed border-yellow-600/40 my-4" />

                        {/* Email for lucky number */}
                        <div className="bg-gradient-to-br from-red-900/40 to-yellow-900/30 border border-yellow-600/30 rounded-xl p-4 mb-4">
                            <p className="text-yellow-300 font-bold text-sm mb-1">🎁 Nhận Số May Mắn!</p>
                            <p className="text-neutral-300 text-xs mb-3">
                                Nhập email để nhận con số may mắn — dùng quay xổ số giải đặc biệt <span className="text-green-400 font-bold">$100</span>!
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={liXiEmail}
                                    onChange={(e) => { setLiXiEmail(e.target.value); setLiXiError(""); }}
                                    placeholder="email@example.com"
                                    className="flex-1 px-3 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    onKeyDown={(e) => e.key === 'Enter' && handleLiXiSubmit()}
                                />
                                <button
                                    onClick={handleLiXiSubmit}
                                    disabled={liXiSubmitting}
                                    className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg transition-all text-sm whitespace-nowrap disabled:opacity-50"
                                >
                                    {liXiSubmitting ? "⏳" : "🧧 Nhận Số"}
                                </button>
                            </div>
                            {liXiError && <p className="text-red-400 text-xs mt-2">{liXiError}</p>}
                        </div>

                        <button
                            onClick={handleCloseLiXi}
                            className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors"
                        >
                            Bỏ qua, đóng
                        </button>
                    </div>
                )}

                {/* Lucky Number Result */}
                {submitStatus === "success" && liXiStep === "result" && luckyNumber && (
                    <div className="p-6 text-center">
                        <div className="text-5xl mb-3 animate-bounce">🎉</div>
                        <h3 className="text-xl font-bold text-yellow-300 mb-4">
                            Đây là Số May Mắn của bạn!
                        </h3>

                        {/* Lucky number card — lì xì style */}
                        <div className="relative mx-auto w-56 rounded-2xl overflow-hidden shadow-2xl mb-4"
                            style={{ background: 'linear-gradient(135deg, #C41E3A 0%, #8B0000 50%, #C41E3A 100%)' }}>
                            {/* Gold border trim */}
                            <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400/60" />
                            {/* Decorative corners */}
                            <div className="absolute top-2 left-2 text-yellow-400/80 text-lg">✦</div>
                            <div className="absolute top-2 right-2 text-yellow-400/80 text-lg">✦</div>
                            <div className="absolute bottom-2 left-2 text-yellow-400/80 text-lg">✦</div>
                            <div className="absolute bottom-2 right-2 text-yellow-400/80 text-lg">✦</div>

                            <div className="py-6 px-4">
                                <p className="text-yellow-300/80 text-xs font-medium mb-1">SỐ MAY MẮN</p>
                                <p className="text-5xl font-black text-yellow-300 tracking-widest"
                                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                                    {luckyNumber}
                                </p>
                                <div className="mt-2 w-16 h-0.5 bg-yellow-400/40 mx-auto rounded-full" />
                                <p className="text-yellow-200/60 text-xs mt-2">🐴 Bính Ngọ 2026 — Vạn Sự Như Ý</p>
                            </div>
                        </div>

                        <p className="text-neutral-300 text-sm mb-1">
                            📧 Đã gửi đến <span className="text-yellow-300 font-medium">{liXiEmail}</span>
                        </p>
                        <p className="text-neutral-400 text-xs mb-4">
                            Giữ lại số này! Chúng tôi sẽ quay xổ số giải <span className="text-green-400 font-bold">$100</span> 🎊
                        </p>

                        <button
                            onClick={handleCloseLiXi}
                            className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition-all"
                        >
                            Đóng 🎊
                        </button>
                    </div>
                )}

                {/* Form */}
                {submitStatus !== "success" && (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Business Name */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                                Tên Doanh Nghiệp <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                placeholder="Vd: Phở Sài Gòn, Tiệm Nail ABC..."
                                className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${errors.businessName ? "border-red-500" : "border-neutral-600"
                                    }`}
                            />
                            {errors.businessName && (
                                <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                                Danh Mục Chính <span className="text-red-400">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, category: e.target.value, subcategory: "" }));
                                }}
                                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                {MAIN_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {CATEGORY_LABELS_VI[cat] || cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subcategory */}
                        {SUBCATEGORIES[formData.category] && SUBCATEGORIES[formData.category].length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">
                                    Danh Mục Phụ
                                </label>
                                <select
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                >
                                    <option value="">-- Chọn danh mục phụ --</option>
                                    {SUBCATEGORIES[formData.category].map((sub) => (
                                        <option key={sub} value={sub}>
                                            {sub}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Không bắt buộc — để trống nếu chưa có địa chỉ"
                                className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${errors.address ? "border-red-500" : "border-neutral-600"
                                    }`}
                            />
                            {errors.address && (
                                <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                            )}
                        </div>

                        {/* City, State, Zip */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Thành phố</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Tiểu bang</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Mã Zip</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleChange}
                                    placeholder="75040"
                                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(972) 555-1234"
                                className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${errors.phone ? "border-red-500" : "border-neutral-600"
                                    }`}
                            />
                            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                        </div>

                        {/* Website */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Trang web</label>
                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="example.com hoặc https://www.example.com"
                                className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${errors.website ? "border-red-500" : "border-neutral-600"
                                    }`}
                            />
                            <p className="text-neutral-500 text-xs mt-1">Có thể nhập: facebook.com, www.example.com, hoặc https://...</p>
                            {errors.website && <p className="text-red-400 text-sm mt-1">{errors.website}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                                Email doanh nghiệp
                            </label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="contact@example.com"
                                className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${errors.email ? "border-red-500" : "border-neutral-600"
                                    }`}
                            />
                            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Hãy chia sẻ về doanh nghiệp của bạn..."
                                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                            />
                        </div>

                        {/* Owner Name */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Tên của bạn</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                placeholder="Tên của bạn (không bắt buộc)"
                                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                                Hình Ảnh (tối đa 5 ảnh)
                            </label>
                            <div className="border-2 border-dashed border-neutral-600 rounded-lg p-4 text-center hover:border-yellow-500 transition-colors">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        const validFiles = files.slice(0, 5 - imageFiles.length);

                                        // Create preview URLs
                                        const newPreviews = validFiles.map(file => URL.createObjectURL(file));

                                        setImageFiles(prev => [...prev, ...validFiles].slice(0, 5));
                                        setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
                                    }}
                                    className="hidden"
                                    id="image-upload"
                                    disabled={imageFiles.length >= 5}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className={`cursor-pointer ${imageFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="text-3xl mb-2">📷</div>
                                    <p className="text-neutral-400 text-sm">
                                        {imageFiles.length >= 5
                                            ? 'Đã đủ 5 ảnh'
                                            : 'Click để chọn ảnh (JPG, PNG, WEBP)'}
                                    </p>
                                    <p className="text-neutral-500 text-xs mt-1">
                                        Đã chọn: {imageFiles.length}/5 ảnh
                                    </p>
                                </label>
                            </div>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-16 h-16 object-cover rounded-lg border border-neutral-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    URL.revokeObjectURL(preview);
                                                    setImageFiles(prev => prev.filter((_, i) => i !== index));
                                                    setImagePreviews(prev => prev.filter((_, i) => i !== index));
                                                }}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin">⏳</span> Đang gửi...
                                </>
                            ) : (
                                <>
                                    Gửi Thông Tin <span>→</span>
                                </>
                            )}
                        </button>

                        <p className="text-neutral-500 text-xs text-center">
                            Thông tin sẽ được gửi trực tiếp đến hệ thống. Admin sẽ duyệt sớm nhất!
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
