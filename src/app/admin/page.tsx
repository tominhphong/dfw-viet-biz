"use client";

import { useState, useEffect } from "react";
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
    "Restaurant": ["Phở", "Bánh Mì", "Cà Phê", "Chợ Việt", "Chợ Châu Á", "Chợ Hải Sản", "Nhà Hàng", "Quán Ăn", "Tiệm Bánh"],
    "Healthcare": ["Bác Sĩ", "Nha Khoa", "Chỉnh Hình Cột Sống", "Châm Cứu", "Thuốc Bắc", "Y Tế Tại Nhà"],
    "Retail": ["Chợ Việt", "Chợ Châu Á", "Cửa Hàng", "Tạp Hóa"],
    "Automotive": ["Sửa Xe", "Rửa Xe", "Phụ Tùng"],
    "Beauty & Personal Care": ["Tiệm Nail", "Tiệm Tóc", "Spa", "Thẩm Mỹ"],
    "Professional Services": ["Kế Toán", "Bảo Hiểm", "Bảo Hiểm & Thuế", "Luật Sư", "Địa Ốc", "Dịch Vụ Di Trú"],
    "Religious": ["Chùa Phật Giáo", "Nhà Thờ", "Tôn Giáo"],
    "Community": ["Cộng Đồng", "Hội Đoàn", "Câu Lạc Bộ Bóng Đá", "Dịch Vụ"],
};

interface SeedBusiness {
    id: number;
    name: string;
    slug: string;
    category: string;
    subcategory?: string;
    address?: string;
    city?: string;
    phone?: string;
}

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const [submissions, setSubmissions] = useState<BusinessSubmission[]>([]);
    const [approvedBusinesses, setApprovedBusinesses] = useState<ApprovedBusiness[]>([]);
    const [showApproved, setShowApproved] = useState(false);
    const [logs, setLogs] = useState<ActionLog[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [seedBusinesses, setSeedBusinesses] = useState<SeedBusiness[]>([]);
    const [showSeed, setShowSeed] = useState(false);
    const [seedSearch, setSeedSearch] = useState("");
    const [approvedSearch, setApprovedSearch] = useState("");
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
        setUploadingImages(true);
        setMessage("");
        setError("");

        try {
            // Upload new images first
            let newImageUrls: string[] = [];
            if (editImageFiles.length > 0) {
                const uploadPromises = editImageFiles.map(async (file) => {
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
                newImageUrls = results.filter((url): url is string => url !== null);
            }

            // Combine existing + new images
            const allImages = [...existingImages, ...newImageUrls];

            const response = await fetch("/api/admin/edit", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingBusiness.id,
                    password,
                    updates: {
                        name: editForm.name,
                        category: editForm.category,
                        subcategory: editForm.subcategory || null,
                        original_category: editForm.category,
                        address: editForm.address,
                        city: editForm.city || null,
                        state: editForm.state || "TX",
                        phone: editForm.phone || null,
                        website: editForm.website || null,
                        email: editForm.email || null,
                        description: editForm.description || null,
                        images: allImages,
                    },
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(`✅ Đã cập nhật "${editForm.name}" thành công!`);
                // Cleanup preview URLs
                editImagePreviews.forEach(url => URL.revokeObjectURL(url));
                setEditingBusiness(null);
                setEditImageFiles([]);
                setEditImagePreviews([]);
                setExistingImages([]);
                fetchApprovedBusinesses();
            } else {
                setError(result.error || "Có lỗi xảy ra khi cập nhật");
            }
        } catch {
            setError("Không thể kết nối server");
        }
        setUploadingImages(false);
        setLoading(false);
    };

    // Fetch seed businesses
    const fetchSeedBusinesses = async () => {
        try {
            const response = await fetch("/api/admin/seed");
            const result = await response.json();
            if (result.success) {
                setSeedBusinesses(result.businesses);
            }
        } catch {
            console.error("Không thể tải seed businesses");
        }
    };

    // Handle delete seed business
    const handleDeleteSeed = async (id: number, name: string) => {
        if (!confirm(`Xóa "${name}" khỏi danh sách gốc (seed.json)? Hành động này không thể hoàn tác!`)) return;

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch("/api/admin/seed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, password }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(`🗑️ Đã xóa "${name}" thành công! Còn ${result.remainingCount} doanh nghiệp.`);
                setSeedBusinesses(seedBusinesses.filter((b) => b.id !== id));
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
                fetchLogs(); // Refresh logs
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
            fetchSeedBusinesses();
            fetchLogs();
        }
    }, [isLoggedIn]);

    // Filter seed businesses by search
    const filteredSeedBusinesses = seedBusinesses.filter((biz) =>
        biz.name.toLowerCase().includes(seedSearch.toLowerCase()) ||
        (biz.address && biz.address.toLowerCase().includes(seedSearch.toLowerCase())) ||
        biz.category.toLowerCase().includes(seedSearch.toLowerCase())
    );

    // Handle login
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple password check (actual verification happens on API call)
        if (password.length > 0) {
            setIsLoggedIn(true);
            setError("");
        }
    };

    // Handle approve
    const handleApprove = async (id: string, name: string) => {
        if (!confirm(`Đồng ý thêm "${name}" vào website?`)) return;

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
                setMessage(`✅ Đã thêm "${name}" thành công!`);
                // Remove from list
                setSubmissions(submissions.filter((s) => s.id !== id));
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
        if (!confirm(`Từ chối "${name}"? Submission sẽ bị xóa.`)) return;

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
                setMessage(`❌ Đã từ chối "${name}"`);
                setSubmissions(submissions.filter((s) => s.id !== id));
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

    // Admin dashboard
    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            <header className="py-6 px-6 border-b border-neutral-800 bg-neutral-800">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">
                        🔐 Admin - DFW Vietnamese Biz
                    </h1>
                    <button
                        onClick={() => setIsLoggedIn(false)}
                        className="px-4 py-2 text-sm bg-neutral-700 rounded-lg hover:bg-neutral-600"
                    >
                        Đăng xuất
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Messages */}
                {message && (
                    <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-xl text-green-300">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-300">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <div className="mb-6 p-4 bg-neutral-800 rounded-xl border border-neutral-700">
                    <h2 className="text-lg font-bold mb-2">
                        📋 Pending Submissions
                    </h2>
                    <p className="text-neutral-400">
                        {loading
                            ? "Đang tải..."
                            : `${submissions.length} submissions cần duyệt`}
                    </p>
                </div>

                {/* Submissions list */}
                {submissions.length === 0 && !loading ? (
                    <div className="text-center py-12 text-neutral-500">
                        <p className="text-4xl mb-4">🎉</p>
                        <p>Không có submission nào cần duyệt!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {submissions.map((sub) => (
                            <div
                                key={sub.id}
                                className="bg-neutral-800 rounded-xl p-6 border border-neutral-700"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {sub.name}
                                        </h3>
                                        <span className="text-sm text-yellow-500">
                                            {sub.category}
                                        </span>
                                    </div>
                                    <span className="text-xs text-neutral-500">
                                        {new Date(sub.created_at).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
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
                                    <p className="text-neutral-400 text-sm mb-4 italic">
                                        "{sub.description}"
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
                                        ❌ Chưa đồng ý
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Refresh button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => { fetchSubmissions(); fetchApprovedBusinesses(); fetchSeedBusinesses(); fetchLogs(); }}
                        disabled={loading}
                        className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-colors"
                    >
                        🔄 Làm mới
                    </button>
                </div>

                {/* Approved Businesses Management Section */}
                <div className="mt-8 p-4 bg-neutral-800 rounded-xl border border-neutral-700">
                    <button
                        onClick={() => setShowApproved(!showApproved)}
                        className="w-full flex justify-between items-center text-lg font-bold"
                    >
                        <span>🏢 Quản lý doanh nghiệp đã duyệt ({approvedBusinesses.length})</span>
                        <span className="text-neutral-500">{showApproved ? '▼' : '▶'}</span>
                    </button>

                    {showApproved && (
                        <div className="mt-4">
                            {/* Search box */}
                            <input
                                type="text"
                                value={approvedSearch}
                                onChange={(e) => setApprovedSearch(e.target.value)}
                                placeholder="Tìm kiếm theo tên, địa chỉ hoặc danh mục..."
                                className="w-full px-4 py-3 mb-4 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                            <p className="text-sm text-neutral-400 mb-4">
                                Hiển thị {approvedBusinesses.filter((biz) =>
                                    biz.name.toLowerCase().includes(approvedSearch.toLowerCase()) ||
                                    (biz.address && biz.address.toLowerCase().includes(approvedSearch.toLowerCase())) ||
                                    biz.category.toLowerCase().includes(approvedSearch.toLowerCase())
                                ).length} / {approvedBusinesses.length} doanh nghiệp
                            </p>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {approvedBusinesses.length === 0 ? (
                                    <p className="text-neutral-500 text-center py-4">Chưa có doanh nghiệp nào được duyệt</p>
                                ) : (
                                    approvedBusinesses
                                        .filter((biz) =>
                                            biz.name.toLowerCase().includes(approvedSearch.toLowerCase()) ||
                                            (biz.address && biz.address.toLowerCase().includes(approvedSearch.toLowerCase())) ||
                                            biz.category.toLowerCase().includes(approvedSearch.toLowerCase())
                                        )
                                        .slice(0, 50)
                                        .map((biz) => (
                                            <div
                                                key={biz.id}
                                                className="p-3 bg-neutral-700/50 rounded-lg border border-neutral-600 flex justify-between items-center"
                                            >
                                                <div className="flex-1">
                                                    <span className="font-bold text-white">{biz.name}</span>
                                                    <span className="ml-2 text-sm text-yellow-500">({biz.category})</span>
                                                    {biz.subcategory && (
                                                        <span className="ml-1 text-xs text-neutral-500">• {biz.subcategory}</span>
                                                    )}
                                                    <p className="text-sm text-neutral-400 mt-1">📍 {biz.address}</p>
                                                    {biz.phone && (
                                                        <p className="text-sm text-neutral-400">📞 {biz.phone}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => handleOpenEdit(biz)}
                                                        disabled={loading}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        ✏️ Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(biz.id, biz.name)}
                                                        disabled={loading}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        🗑️ Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                )}
                                {approvedBusinesses.filter((biz) =>
                                    biz.name.toLowerCase().includes(approvedSearch.toLowerCase()) ||
                                    (biz.address && biz.address.toLowerCase().includes(approvedSearch.toLowerCase())) ||
                                    biz.category.toLowerCase().includes(approvedSearch.toLowerCase())
                                ).length > 50 && (
                                        <p className="text-center text-neutral-500 py-2">
                                            ... và {approvedBusinesses.filter((biz) =>
                                                biz.name.toLowerCase().includes(approvedSearch.toLowerCase()) ||
                                                (biz.address && biz.address.toLowerCase().includes(approvedSearch.toLowerCase())) ||
                                                biz.category.toLowerCase().includes(approvedSearch.toLowerCase())
                                            ).length - 50} doanh nghiệp khác. Hãy tìm kiếm cụ thể hơn.
                                        </p>
                                    )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Seed Businesses Management Section */}
                <div className="mt-8 p-4 bg-neutral-800 rounded-xl border border-neutral-700">
                    <button
                        onClick={() => setShowSeed(!showSeed)}
                        className="w-full flex justify-between items-center text-lg font-bold"
                    >
                        <span>📦 Quản lý dữ liệu gốc - seed.json ({seedBusinesses.length})</span>
                        <span className="text-neutral-500">{showSeed ? '▼' : '▶'}</span>
                    </button>

                    {showSeed && (
                        <div className="mt-4">
                            {/* Search box */}
                            <input
                                type="text"
                                value={seedSearch}
                                onChange={(e) => setSeedSearch(e.target.value)}
                                placeholder="Tìm kiếm theo tên, địa chỉ hoặc danh mục..."
                                className="w-full px-4 py-3 mb-4 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                            <p className="text-sm text-neutral-400 mb-4">
                                Hiển thị {filteredSeedBusinesses.length} / {seedBusinesses.length} doanh nghiệp
                            </p>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredSeedBusinesses.length === 0 ? (
                                    <p className="text-neutral-500 text-center py-4">Không tìm thấy doanh nghiệp nào</p>
                                ) : (
                                    filteredSeedBusinesses.slice(0, 50).map((biz) => (
                                        <div
                                            key={biz.id}
                                            className="p-3 bg-neutral-700/50 rounded-lg border border-neutral-600 flex justify-between items-center"
                                        >
                                            <div className="flex-1">
                                                <span className="font-bold text-white">{biz.name}</span>
                                                <span className="ml-2 text-sm text-blue-400">({biz.category})</span>
                                                {biz.subcategory && (
                                                    <span className="ml-1 text-xs text-neutral-500">• {biz.subcategory}</span>
                                                )}
                                                {biz.address && (
                                                    <p className="text-sm text-neutral-400 mt-1">📍 {biz.address}{biz.city ? `, ${biz.city}` : ''}</p>
                                                )}
                                                {biz.phone && (
                                                    <p className="text-sm text-neutral-400">📞 {biz.phone}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSeed(biz.id, biz.name)}
                                                disabled={loading}
                                                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                🗑️ Xóa
                                            </button>
                                        </div>
                                    ))
                                )}
                                {filteredSeedBusinesses.length > 50 && (
                                    <p className="text-center text-neutral-500 py-2">
                                        ... và {filteredSeedBusinesses.length - 50} doanh nghiệp khác. Hãy tìm kiếm cụ thể hơn.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Logs Section */}
                <div className="mt-8 p-4 bg-neutral-800 rounded-xl border border-neutral-700">
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="w-full flex justify-between items-center text-lg font-bold"
                    >
                        <span>📜 Lịch sử duyệt/từ chối ({logs.length})</span>
                        <span className="text-neutral-500">{showLogs ? '▼' : '▶'}</span>
                    </button>

                    {showLogs && (
                        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                            {logs.length === 0 ? (
                                <p className="text-neutral-500 text-center py-4">Chưa có lịch sử</p>
                            ) : (
                                logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className={`p-3 rounded-lg border ${log.action_type === 'approved'
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
                                            <span className="text-xs text-neutral-500">
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
                </div>

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
                                        {MAIN_CATEGORIES.map((cat) => (
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
