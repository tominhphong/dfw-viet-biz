import { notFound } from "next/navigation";
import Link from "next/link";
import seedData from "../../../data/seed.json";
import type { Metadata } from "next";

interface Business {
    id: number;
    name: string;
    slug: string;
    category: string;
    originalCategory: string | null;
    subcategory: string | null;
    address: string;
    phone: string | null;
    website: string | null;
    email: string | null;
    description: string;
    rating: number;
    reviewCount: number;
    googleMapsLink: string | null;
    linkType: string | null;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Generate static paths for all businesses
export async function generateStaticParams() {
    return (seedData as Business[]).map((business) => ({
        slug: business.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const business = (seedData as Business[]).find((b) => b.slug === slug);

    if (!business) {
        return { title: "Business Not Found | DFW Vietnamese Biz" };
    }

    const city = extractCity(business.address);
    return {
        title: `${business.name} | ${business.subcategory || business.category} tại ${city}`,
        description: `${business.name} - ${business.subcategory || business.category} tại ${city}. ⭐ ${business.rating}/5 (${business.reviewCount} đánh giá). ${business.description || "Doanh nghiệp Việt Nam uy tín."}`,
        openGraph: {
            title: `${business.name} | DFW Vietnamese Biz`,
            description: `${business.subcategory || business.category} - ⭐ ${business.rating}/5`,
            type: "website",
        },
    };
}

// Extract city from address
function extractCity(address: string): string {
    const parts = address.split(",");
    if (parts.length >= 2) {
        // Get the part before state (TX)
        const cityPart = parts[parts.length - 2].trim();
        return cityPart.replace(/\d+/g, "").trim() || "DFW";
    }
    return "Dallas-Fort Worth";
}

// Get rating tier
function getRatingTier(rating: number): { label: string; color: string; emoji: string } {
    if (rating >= 4.5) return { label: "Xuất sắc", color: "text-green-400", emoji: "🏆" };
    if (rating >= 4.0) return { label: "Rất tốt", color: "text-yellow-400", emoji: "⭐" };
    if (rating >= 3.5) return { label: "Tốt", color: "text-blue-400", emoji: "👍" };
    return { label: "Bình thường", color: "text-neutral-400", emoji: "📍" };
}

// Get review tier
function getReviewTier(count: number): string {
    if (count >= 200) return "Rất phổ biến";
    if (count >= 100) return "Phổ biến";
    if (count >= 50) return "Được nhiều người biết";
    return "";
}

export default async function BusinessDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const business = (seedData as Business[]).find((b) => b.slug === slug);

    if (!business) {
        notFound();
    }

    const city = extractCity(business.address);
    const ratingInfo = getRatingTier(business.rating);
    const popularityLabel = getReviewTier(business.reviewCount);

    const categoryColors: Record<string, string> = {
        Food: "from-orange-500 to-red-500",
        Services: "from-blue-500 to-cyan-500",
        Shopping: "from-pink-500 to-purple-500",
        Community: "from-green-500 to-teal-500",
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100">
            {/* Header */}
            <header className="py-8 px-6 bg-gradient-to-b from-neutral-800 to-neutral-900 border-b border-neutral-800">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
                    >
                        ← Quay lại Danh bạ
                    </Link>

                    <div className="flex items-start gap-4">
                        <div
                            className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${categoryColors[business.category] || "from-gray-500 to-gray-600"
                                } flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-lg`}
                        >
                            {business.name.charAt(0)}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span
                                    className={`inline-block px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${categoryColors[business.category] || "from-gray-500 to-gray-600"
                                        } text-white`}
                                >
                                    {business.subcategory || business.category}
                                </span>
                                {popularityLabel && (
                                    <span className="px-2 py-1 text-xs bg-neutral-700 rounded-full text-neutral-300">
                                        🔥 {popularityLabel}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">
                                {business.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-neutral-400">
                                <span className="flex items-center gap-1">
                                    <span className="text-yellow-400">⭐</span>
                                    <span className="font-bold text-white">{business.rating.toFixed(1)}</span>
                                    <span className={`text-sm ${ratingInfo.color}`}>({ratingInfo.label})</span>
                                </span>
                                <span>{business.reviewCount} đánh giá</span>
                                <span className="text-neutral-500">📍 {city}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-8 md:py-12">
                {/* Highlights Banner */}
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-2xl p-5 mb-8 border border-yellow-800/30">
                    <h2 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        💡 Tại sao nên chọn {business.name}?
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl mb-1">{ratingInfo.emoji}</div>
                            <div className="text-sm text-neutral-300 font-medium">{ratingInfo.label}</div>
                            <div className="text-xs text-neutral-500">{business.rating}/5 sao</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl mb-1">💬</div>
                            <div className="text-sm text-neutral-300 font-medium">{business.reviewCount}+ đánh giá</div>
                            <div className="text-xs text-neutral-500">Google Reviews</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl mb-1">🏪</div>
                            <div className="text-sm text-neutral-300 font-medium">{business.subcategory || business.category}</div>
                            <div className="text-xs text-neutral-500">Chuyên ngành</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl mb-1">📍</div>
                            <div className="text-sm text-neutral-300 font-medium">{city}</div>
                            <div className="text-xs text-neutral-500">Vị trí</div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Location Card */}
                        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                📍 Địa chỉ
                            </h2>
                            <p className="text-neutral-300 mb-4">{business.address}</p>
                            {business.googleMapsLink && (
                                <a
                                    href={business.googleMapsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:from-green-500 hover:to-green-400 transition-all shadow-lg"
                                >
                                    🗺️ Chỉ đường
                                </a>
                            )}
                        </div>

                        {/* Contact Card */}
                        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                📞 Liên hệ
                            </h2>
                            <div className="space-y-3">
                                {business.phone && (
                                    <a
                                        href={`tel:${business.phone}`}
                                        className="flex items-center gap-3 p-3 bg-neutral-700/50 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-700 transition-all"
                                    >
                                        <span className="text-xl w-8 text-center">📱</span>
                                        <div>
                                            <div className="font-medium">{business.phone}</div>
                                            <div className="text-xs text-neutral-500">Nhấn để gọi ngay</div>
                                        </div>
                                    </a>
                                )}
                                {business.website && (
                                    <a
                                        href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-neutral-700/50 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-700 transition-all"
                                    >
                                        <span className="text-xl w-8 text-center">🌐</span>
                                        <div>
                                            <div className="font-medium">{business.website}</div>
                                            <div className="text-xs text-neutral-500">Truy cập website</div>
                                        </div>
                                    </a>
                                )}
                                {business.email && (
                                    <a
                                        href={`mailto:${business.email}`}
                                        className="flex items-center gap-3 p-3 bg-neutral-700/50 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-700 transition-all"
                                    >
                                        <span className="text-xl w-8 text-center">✉️</span>
                                        <div>
                                            <div className="font-medium">{business.email}</div>
                                            <div className="text-xs text-neutral-500">Gửi email</div>
                                        </div>
                                    </a>
                                )}
                                {!business.phone && !business.website && !business.email && (
                                    <p className="text-neutral-500 text-center py-4">
                                        Chưa có thông tin liên hệ
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* About Card */}
                        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                📝 Giới thiệu
                            </h2>
                            <p className="text-neutral-300 leading-relaxed">
                                {business.description || `${business.name} là doanh nghiệp ${business.subcategory || business.category} tại ${city}. Với ${business.reviewCount} đánh giá và rating ${business.rating}/5 sao trên Google, đây là một trong những địa điểm được cộng đồng Việt Nam tin tưởng tại DFW.`}
                            </p>

                            {(business.subcategory || business.originalCategory) && (
                                <div className="mt-4 pt-4 border-t border-neutral-700 flex flex-wrap gap-2">
                                    {business.subcategory && (
                                        <span className="px-3 py-1 bg-neutral-700 rounded-full text-sm text-neutral-300">
                                            {business.subcategory}
                                        </span>
                                    )}
                                    {business.originalCategory && business.originalCategory !== business.subcategory && (
                                        <span className="px-3 py-1 bg-neutral-700 rounded-full text-sm text-neutral-300">
                                            {business.originalCategory}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Share Card */}
                        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
                            <h2 className="text-lg font-bold text-white mb-4">🔗 Chia sẻ</h2>
                            <p className="text-neutral-400 text-sm mb-4">
                                Giới thiệu địa điểm này cho bạn bè và gia đình
                            </p>
                            <div className="flex gap-3">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                        `https://tominhphong-dfw-viet-biz-q9rp.vercel.app/business/${business.slug}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors text-center font-medium"
                                >
                                    Facebook
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                        `${business.name} - ${business.subcategory || business.category} tại ${city} ⭐ ${business.rating}/5`
                                    )}&url=${encodeURIComponent(
                                        `https://tominhphong-dfw-viet-biz-q9rp.vercel.app/business/${business.slug}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-4 py-3 bg-neutral-700 text-white rounded-xl hover:bg-neutral-600 transition-colors text-center font-medium"
                                >
                                    X/Twitter
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-800 border border-neutral-700 rounded-full font-bold hover:bg-neutral-700 transition-colors"
                    >
                        ← Quay lại Danh bạ
                    </Link>
                </div>
            </main>
        </div>
    );
}
