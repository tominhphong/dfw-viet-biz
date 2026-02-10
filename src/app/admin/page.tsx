"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase, BusinessSubmission } from "../../lib/supabase";

interface ActionLog {
    id: number;
    action_type: 'approved' | 'rejected';
    business_name: string;
    business_category: string | null;
    business_address: string | null;
    action_timestamp: string;
}

interface ApprovedBusiness {
    id: number;
    name: string;
    slug: string;
    category: string;
    subcategory: string | null;
    original_category: string | null;
    address: string;
    city: string | null;
    state: string | null;
    phone: string | null;
    website: string | null;
    email: string | null;
    description: string | null;
    images: string[] | null;
    created_at: string;
}

// Main categories matching homepage
const MAIN_CATEGORIES = [
    "All",
    "Restaurant",
    "Healthcare",
    "Retail",
    "Automotive",
    "Beauty & Personal Care",
    "Professional Services",
    "Religious",
    "Community",
];

const SUBCATEGORIES: Record<string, string[]> = {
    "Restaurant": ["Nhà Hàng", "Phở & Bún", "Bánh Mì", "Chè & Trà Sữa", "Quán Ăn"],
    "Healthcare": ["Nha Khoa", "Bác Sĩ", "Y Tế", "Dược Phẩm"],
    "Retail": ["Cửa Hàng", "Chợ / Siêu Thị", "Tiệm Vàng"],
    "Automotive": ["Tiệm Sửa Xe", "Đại Lý Xe"],
    "Beauty & Personal Care": ["Nail", "Tóc", "Spa", "Thẩm Mỹ"],
    "Professional Services": ["Bất Động Sản", "Luật Sư", "Kế Toán", "Bảo Hiểm", "Dịch Vụ"],
    "Religious": ["Chùa Phật Giáo", "Nhà Thờ", "Tôn Giáo"],
    "Community": ["Cộng Đồng", "Hội Đoàn", "Câu Lạc Bộ Bóng Đá", "Dịch Vụ"],
};

// Category display labels (Vietnamese)
const CATEGORY_LABELS: Record<string, string> = {
    "All": "Tất cả",
    "Restaurant": "Nhà hàng",
    "Healthcare": "Y tế",
    "Retail": "Bán lẻ",
    "Automotive": "Ô tô",
    "Beauty & Personal Care": "Làm đẹp",
    "Professional Services": "Dịch vụ",
    "Religious": "Tôn giáo",
    "Community": "Cộng đồng",
};

// Category colors matching homepage
const CATEGORY_COLORS: Record<string, string> = {
    "Restaurant": "text-red-400",
    "Healthcare": "text-emerald-400",
    "Retail": "text-blue-400",
    "Automotive": "text-orange-400",
    "Beauty & Personal Care": "text-pink-400",
    "Professional Services": "text-yellow-500",
    "Religious": "text-purple-400",
    "Community": "text-cyan-400",
};

// Compress image client-side to avoid Vercel 4.5MB limit
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        if (file.size <= MAX_IMAGE_SIZE) {
            resolve(file);
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            const maxDim = 1200;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
                if (w > h) { h = (h / w) * maxDim; w = maxDim; }
                else { w = (w / h) * maxDim; h = maxDim; }
            }
            canvas.width = w;
            canvas.height = h;
            ctx?.drawImage(img, 0, 0, w, h);
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
                } else {
                    resolve(file);
                }
            }, 'image/jpeg', 0.8);
        };
        img.src = URL.createObjectURL(file);
    });
};

type TabType = 'businesses' | 'submissions' | 'logs';

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const [submissions, setSubmissions] = useState<BusinessSubmission[]>([]);
    const [approvedBusinesses, setApprovedBusinesses] = useState<ApprovedBusiness[]>([]);
    const [logs, setLogs] = useState<ActionLog[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('businesses');
    const [approvedSearch, setApprovedSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editingBusiness, setEditingBusiness] = useState<ApprovedBusiness | null>(null);
    const [editForm, setEditForm] = useState<Record<string, string>>({});
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
    const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Fetch pending submissions
    const fetchSubmissions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("business_submissions")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (error) {
            setError("Không thể tải dữ liệu");
        } else {
            setSubmissions(data || []);
        }
        setLoading(false);
    };

    // Fetch action logs
    const fetchLogs = async () => {
        const { data, error } = await supabase
            .from("admin_action_logs")
            .select("*")
            .order("action_timestamp", { ascending: false })
            .limit(50);

        if (!error && data) {
            setLogs(data);
        }
    };

    // Fetch approved businesses
    const fetchApprovedBusinesses = async () => {
        const { data, error } = await supabase
            .from("approved_businesses")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setApprovedBusinesses(data);
        }
    };

    // Handle edit business
    const handleOpenEdit = (biz: ApprovedBusiness) => {
        setEditingBusiness(biz);
        setEditForm({
            name: biz.name || "",
            category: biz.original_category || biz.category || "Restaurant",
            subcategory: biz.subcategory || "",
            address: biz.address || "",
            city: biz.city || "",
            state: biz.state || "TX",
            phone: biz.phone || "",
            website: biz.website || "",
            email: biz.email || "",
            description: biz.description || "",
        });
        setExistingImages(biz.images || []);
        setEditImageFiles([]);
        setEditImagePreviews([]);
    };

    const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalImages = existingImages.length + editImageFiles.length + files.length;
        if (totalImages > 5) {
            setError("Tối đa 5 ảnh. Hãy xóa bớt ảnh cũ trước.");
            return;
        }
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setEditImageFiles(prev => [...prev, ...files]);
        setEditImagePreviews(prev => [...prev, ...newPreviews]);
        e.target.value = "";
    };

    const handleRemoveExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveNewImage = (index: number) => {
        URL.revokeObjectURL(editImagePreviews[index]);
        setEditImageFiles(prev => prev.filter((_, i) => i !== index));
        setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveEdit = async () => {
        if (!editingBusiness) return;

        setLoading(true);
        setError("");
        setMessage("");

        try {
            // Upload new images first
            let allImageUrls = [...existingImages];

            if (editImageFiles.length > 0) {
                setUploadingImages(true);
                for (const file of editImageFiles) {
                    try {
                        const compressed = await compressImage(file);
                        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${compressed.name}`;
                        const formDataUpload = new FormData();
                        formDataUpload.append('file', compressed);
                        formDataUpload.append('fileName', fileName);

                        const uploadRes = await fetch('/api/upload-image', {
                            method: 'POST',
                            body: formDataUpload,
                        });

                        if (uploadRes.ok) {
                            const uploadResult = await uploadRes.json();
                            allImageUrls.push(uploadResult.url);
                        }
                    } catch (uploadErr) {
                        console.error('Upload error:', uploadErr);
                    }
                }
                setUploadingImages(false);
            }

            const response = await fetch("/api/admin/edit", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingBusiness.id,
                    password,
                    updates: {
                        name: editForm.name,
                        category: editForm.category,
                        original_category: editForm.category,
                        subcategory: editForm.subcategory || null,
                        address: editForm.address,
                        city: editForm.city || null,
                        state: editForm.state || "TX",
                        phone: editForm.phone || null,
                        website: editForm.website || null,
                        email: editForm.email || null,
                        description: editForm.description || null,
                        images: allImageUrls.length > 0 ? allImageUrls : null,
                    },
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(`✅ Đã cập nhật "${editForm.name}" thành công!`);
                setEditingBusiness(null);
                fetchApprovedBusinesses();
            } else {
                setError(result.error || "Có lỗi xảy ra");
            }
        } catch {
            setError("Không thể kết nối server");
        }
        setLoading(false);
    };

    // Handle delete approved business
    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Xóa "${name}" khỏi website? Hành động này không thể hoàn tác!`)) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch("/api/admin/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, password, businessName: name }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(`🗑️ Đã xóa "${name}" thành công!`);
                setApprovedBusinesses(approvedBusinesses.filter((b) => b.id !== id));
                fetchLogs();
            } else {
                setError(result.error || "Có lỗi xảy ra");
            }
        } catch {
            setError("Không thể kết nối server");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchSubmissions();
            fetchApprovedBusinesses();
            fetchLogs();
        }
    }, [isLoggedIn]);

    // Filter approved businesses
    const filteredBusinesses = useMemo(() => {
        let result = approvedBusinesses;

        if (categoryFilter !== "All") {
            result = result.filter(
                (biz) => (biz.original_category || biz.category) === categoryFilter
            );
        }

        if (approvedSearch) {
            const q = approvedSearch.toLowerCase();
            result = result.filter(
                (biz) =>
                    biz.name.toLowerCase().includes(q) ||
                    (biz.address && biz.address.toLowerCase().includes(q)) ||
                    biz.category.toLowerCase().includes(q) ||
                    (biz.subcategory && biz.subcategory.toLowerCase().includes(q))
            );
        }

        return result;
    }, [approvedBusinesses, categoryFilter, approvedSearch]);

    // Handle login
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password) {
            setIsLoggedIn(true);
        }
    };

    // Handle approve
    const handleApprove = async (id: string, name: string) => {
        if (!confirm(`Duyệt "${name}"?`)) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch("/api/admin/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, password }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(`✅ Đã duyệt "${name}" thành công!`);
                fetchSubmissions();
                fetchApprovedBusinesses();
                fetchLogs();
            } else {
                setError(result.error || "Có lỗi xảy ra");
            }
        } catch {
            setError("Không thể kết nối server");
        }
        setLoading(false);
    };

    // Handle reject
    const handleReject = async (id: string, name: string) => {
        if (!confirm(`Từ chối "${name}"?`)) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch("/api/admin/reject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, password }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(`❌ Đã từ chối "${name}".`);
                fetchSubmissions();
                fetchLogs();
            } else {
                setError(result.error || "Có lỗi xảy ra");
            }
        } catch {
            setError("Không thể kết nối server");
        }
        setLoading(false);
    };

    // Login screen
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
                    <h1 className="text-2xl font-bold text-white mb-6 text-center">
                        🔐 Admin Login
                    </h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập password..."
                            className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
                        >
                            Đăng nhập
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Tab definitions
    const tabs: { key: TabType; label: string; count: number }[] = [
        { key: 'businesses', label: '🏢 Doanh Nghiệp', count: approvedBusinesses.length },
        { key: 'submissions', label: '📋 Đơn Duyệt', count: submissions.length },
        { key: 'logs', label: '📜 Lịch Sử', count: logs.length },
    ];

    // Admin dashboard
    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans">
            {/* Header - matches homepage style */}
            <header className="py-8 px-6 text-center bg-gradient-to-b from-neutral-800 to-neutral-900 border-b border-neutral-800">
                <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500 mb-2">
                    🔐 Admin Panel
                </h1>
                <p className="text-neutral-400 mb-4">DFW Vietnamese Biz — Quản lý doanh nghiệp</p>
                <button
                    onClick={() => setIsLoggedIn(false)}
                    className="px-5 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-full hover:bg-neutral-700 transition-colors"
                >
                    Đăng xuất
                </button>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
                {/* Messages */}
                {message && (
                    <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-xl text-green-300 flex justify-between items-center">
                        <span>{message}</span>
                        <button onClick={() => setMessage("")} className="text-green-400 hover:text-white ml-4">✕</button>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-300 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError("")} className="text-red-400 hover:text-white ml-4">✕</button>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-neutral-800 pb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === tab.key
                                ? "bg-white text-black font-bold"
                                : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-500"
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                                ? "bg-neutral-200 text-black"
                                : "bg-neutral-700 text-neutral-300"
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}

                    {/* Refresh button */}
                    <button
                        onClick={() => { fetchSubmissions(); fetchApprovedBusinesses(); fetchLogs(); }}
                        disabled={loading}
                        className="ml-auto px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-full text-sm hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    >
                        🔄 Làm mới
                    </button>
                </div>

                {/* ═══════════════════════════════════════════════ */}
                {/* TAB: Approved Businesses — Card Grid */}
                {/* ═══════════════════════════════════════════════ */}
                {activeTab === 'businesses' && (
                    <div>
                        {/* Category filter pills — same as homepage */}
                        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
                            {MAIN_CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-4 md:px-5 py-2 rounded-full border text-sm md:text-base transition-all ${categoryFilter === cat
                                        ? "bg-white text-black border-white font-bold"
                                        : "bg-transparent text-neutral-400 border-neutral-700 hover:border-neutral-500"
                                        }`}
                                >
                                    {CATEGORY_LABELS[cat] || cat}
                                </button>
                            ))}
                        </div>

                        {/* Search bar */}
                        <div className="max-w-2xl mx-auto mb-6">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">🔍</span>
                                <input
                                    type="text"
                                    value={approvedSearch}
                                    onChange={(e) => setApprovedSearch(e.target.value)}
                                    placeholder="Tìm kiếm theo tên, địa chỉ hoặc danh mục..."
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                            <p className="text-center text-sm text-neutral-500 mt-2">
                                Hiển thị <span className="text-white font-bold">{filteredBusinesses.length}</span> trong {approvedBusinesses.length} doanh nghiệp
                            </p>
                        </div>

                        {/* Business Card Grid — matches homepage layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {filteredBusinesses.map((biz) => (
                                <div
                                    key={biz.id}
                                    className="group relative bg-neutral-800 rounded-2xl overflow-hidden hover:bg-neutral-750 transition-colors border border-neutral-800 hover:border-neutral-600"
                                >
                                    {/* Image thumbnail at top */}
                                    {biz.images && biz.images.length > 0 && (
                                        <div className="relative h-40 overflow-hidden">
                                            <img
                                                src={biz.images[0]}
                                                alt={biz.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {biz.images.length > 1 && (
                                                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                                    +{biz.images.length - 1} ảnh
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-5 md:p-6">
                                        {/* Category + Action Buttons row */}
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-xs font-bold uppercase tracking-wider ${CATEGORY_COLORS[biz.original_category || biz.category] || "text-yellow-500"}`}>
                                                    {CATEGORY_LABELS[biz.original_category || biz.category] || biz.category}
                                                </span>
                                                {biz.subcategory && (
                                                    <span className="text-xs text-neutral-500">
                                                        {biz.subcategory}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Admin action buttons */}
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleOpenEdit(biz)}
                                                    disabled={loading}
                                                    className="p-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs rounded-lg transition-all disabled:opacity-50"
                                                    title="Chỉnh sửa"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(biz.id, biz.name)}
                                                    disabled={loading}
                                                    className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs rounded-lg transition-all disabled:opacity-50"
                                                    title="Xóa"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        {/* Business Name */}
                                        <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                                            {biz.name}
                                        </h3>

                                        {/* Description */}
                                        {biz.description && (
                                            <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                                                {biz.description}
                                            </p>
                                        )}

                                        {/* Info */}
                                        <div className="space-y-1.5 text-sm">
                                            <div className="text-neutral-500 flex items-center gap-2">
                                                <span>📍</span> {biz.address}
                                                {biz.city && <span className="text-neutral-600">• {biz.city}</span>}
                                            </div>
                                            {biz.phone && (
                                                <div className="text-neutral-400 flex items-center gap-2">
                                                    <span>📞</span> {biz.phone}
                                                </div>
                                            )}
                                            {biz.website && (
                                                <a
                                                    href={biz.website.startsWith("http") ? biz.website : `https://${biz.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline flex items-center gap-2"
                                                >
                                                    <span>🌐</span> {biz.website}
                                                </a>
                                            )}
                                            {biz.email && (
                                                <div className="text-neutral-400 flex items-center gap-2">
                                                    <span>✉️</span> {biz.email}
                                                </div>
                                            )}
                                        </div>

                                        {/* View detail link */}
                                        <div className="mt-4 pt-3 border-t border-neutral-700/50">
                                            <a
                                                href={`/business/${biz.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-neutral-500 hover:text-yellow-400 transition-colors"
                                            >
                                                👁️ Xem trang chi tiết →
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredBusinesses.length === 0 && (
                                <div className="col-span-full text-center py-20 text-neutral-500">
                                    <p className="text-4xl mb-4">🏢</p>
                                    <p>Chưa có doanh nghiệp nào{categoryFilter !== "All" ? ` trong danh mục "${CATEGORY_LABELS[categoryFilter]}"` : ""}.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* TAB: Pending Submissions */}
                {/* ═══════════════════════════════════════════════ */}
                {activeTab === 'submissions' && (
                    <div>
                        {submissions.length === 0 && !loading ? (
                            <div className="text-center py-20 text-neutral-500">
                                <p className="text-4xl mb-4">🎉</p>
                                <p>Không có submission nào cần duyệt!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {submissions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700 hover:border-neutral-600 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                                                    {sub.category}
                                                </span>
                                                <h3 className="text-xl font-bold text-white mt-1">
                                                    {sub.name}
                                                </h3>
                                            </div>
                                            <span className="text-xs text-neutral-500 bg-neutral-700 px-2 py-1 rounded-full">
                                                {new Date(sub.created_at).toLocaleDateString("vi-VN")}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 text-sm mb-4">
                                            <div className="flex gap-2">
                                                <span className="text-neutral-500">📍</span>
                                                <span className="text-neutral-300">{sub.address}</span>
                                            </div>
                                            {sub.phone && (
                                                <div className="flex gap-2">
                                                    <span className="text-neutral-500">📞</span>
                                                    <span className="text-neutral-300">{sub.phone}</span>
                                                </div>
                                            )}
                                            {sub.email && (
                                                <div className="flex gap-2">
                                                    <span className="text-neutral-500">✉️</span>
                                                    <span className="text-neutral-300">{sub.email}</span>
                                                </div>
                                            )}
                                            {sub.website && (
                                                <div className="flex gap-2">
                                                    <span className="text-neutral-500">🌐</span>
                                                    <span className="text-neutral-300">{sub.website}</span>
                                                </div>
                                            )}
                                        </div>

                                        {sub.description && (
                                            <p className="text-neutral-400 text-sm mb-4 italic line-clamp-3">
                                                &ldquo;{sub.description}&rdquo;
                                            </p>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(sub.id, sub.name)}
                                                disabled={loading}
                                                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                ✅ Đồng ý
                                            </button>
                                            <button
                                                onClick={() => handleReject(sub.id, sub.name)}
                                                disabled={loading}
                                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                            >
                                                ❌ Từ chối
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* TAB: Action Logs */}
                {/* ═══════════════════════════════════════════════ */}
                {activeTab === 'logs' && (
                    <div className="space-y-3">
                        {logs.length === 0 ? (
                            <div className="text-center py-20 text-neutral-500">
                                <p className="text-4xl mb-4">📜</p>
                                <p>Chưa có lịch sử</p>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div
                                    key={log.id}
                                    className={`p-4 rounded-xl border ${log.action_type === 'approved'
                                        ? 'bg-green-900/20 border-green-800'
                                        : 'bg-red-900/20 border-red-800'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-bold text-white">
                                                {log.action_type === 'approved' ? '✅' : '❌'} {log.business_name}
                                            </span>
                                            {log.business_category && (
                                                <span className="ml-2 text-sm text-neutral-400">
                                                    ({log.business_category})
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded-full">
                                            {new Date(log.action_timestamp).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    {log.business_address && (
                                        <p className="text-sm text-neutral-400 mt-1">
                                            📍 {log.business_address}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Edit Business Modal */}
                {editingBusiness && (
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setEditingBusiness(null); }}
                    >
                        <div className="bg-neutral-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-neutral-700 shadow-2xl">
                            {/* Header */}
                            <div className="sticky top-0 bg-neutral-800 p-6 border-b border-neutral-700 flex justify-between items-center z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        ✏️ Chỉnh Sửa Doanh Nghiệp
                                    </h2>
                                    <p className="text-neutral-400 text-sm mt-1">
                                        Cập nhật thông tin cho &quot;{editingBusiness.name}&quot;
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEditingBusiness(null)}
                                    className="text-neutral-400 hover:text-white transition-colors text-2xl leading-none"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Business Name */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                                        Tên Doanh Nghiệp <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name || ""}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                                        Danh Mục Chính
                                    </label>
                                    <select
                                        value={editForm.category || "Restaurant"}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value, subcategory: "" }))}
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        {MAIN_CATEGORIES.filter(c => c !== "All").map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subcategory */}
                                {SUBCATEGORIES[editForm.category] && SUBCATEGORIES[editForm.category].length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                                            Danh Mục Phụ
                                        </label>
                                        <select
                                            value={editForm.subcategory || ""}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, subcategory: e.target.value }))}
                                            className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        >
                                            <option value="">-- Chọn danh mục phụ --</option>
                                            {SUBCATEGORIES[editForm.category].map((sub) => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                                        Địa Chỉ
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.address || ""}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* City, State */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-1">City</label>
                                        <input
                                            type="text"
                                            value={editForm.city || ""}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-1">State</label>
                                        <input
                                            type="text"
                                            value={editForm.state || ""}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                                            className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={editForm.phone || ""}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="(972) 555-1234"
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Website */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Website</label>
                                    <input
                                        type="text"
                                        value={editForm.website || ""}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                                        placeholder="example.com"
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
                                    <input
                                        type="text"
                                        value={editForm.email || ""}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="contact@example.com"
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Mô tả</label>
                                    <textarea
                                        value={editForm.description || ""}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                                    />
                                </div>

                                {/* Image Management */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        📷 Hình ảnh ({existingImages.length + editImageFiles.length}/5)
                                    </label>

                                    {/* Existing Images */}
                                    {existingImages.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            {existingImages.map((url, index) => (
                                                <div key={`existing-${index}`} className="relative group">
                                                    <img
                                                        src={url}
                                                        alt={`Ảnh ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border border-neutral-600"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExistingImage(index)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400"
                                                    >
                                                        ✕
                                                    </button>
                                                    <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1 rounded">Đã lưu</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* New Image Previews */}
                                    {editImagePreviews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            {editImagePreviews.map((url, index) => (
                                                <div key={`new-${index}`} className="relative group">
                                                    <img
                                                        src={url}
                                                        alt={`Ảnh mới ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border-2 border-yellow-500/50"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveNewImage(index)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400"
                                                    >
                                                        ✕
                                                    </button>
                                                    <span className="absolute bottom-1 left-1 text-xs bg-yellow-500/80 text-black px-1 rounded font-medium">Mới</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    {existingImages.length + editImageFiles.length < 5 && (
                                        <label className="flex items-center justify-center gap-2 p-3 bg-neutral-700/50 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-yellow-500 hover:bg-neutral-700 transition-all">
                                            <span className="text-neutral-400 text-sm">📷 Thêm ảnh (tối đa 5)</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleEditImageSelect}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={loading || uploadingImages || !editForm.name?.trim()}
                                        className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploadingImages ? "📷 Đang tải ảnh..." : loading ? "⏳ Đang lưu..." : "💾 Lưu Thay Đổi"}
                                    </button>
                                    <button
                                        onClick={() => setEditingBusiness(null)}
                                        className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-xl transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
