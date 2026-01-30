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

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");
    const [submissions, setSubmissions] = useState<BusinessSubmission[]>([]);
    const [logs, setLogs] = useState<ActionLog[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

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

    useEffect(() => {
        if (isLoggedIn) {
            fetchSubmissions();
            fetchLogs();
        }
    }, [isLoggedIn]);

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
                        onClick={() => { fetchSubmissions(); fetchLogs(); }}
                        disabled={loading}
                        className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-colors"
                    >
                        🔄 Làm mới
                    </button>
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
            </main>
        </div>
    );
}
