import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Business {
    id: number;
    name: string;
    slug: string;
    category: string;
    originalCategory: string | null;
    subcategory: string | null;
    address: string;
    city: string | null;
    state: string | null;
    phone: string | null;
    website: string | null;
    email: string | null;
    description: string;
    googleMapsLink: string | null;
    linkType: string | null;
    images: string[];
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Allow dynamic params for approved businesses from Supabase
export const dynamicParams = true;

// ISR: Revalidate every 60 seconds to pick up admin edits (new images, etc.)
export const revalidate = 60;

// Generate static paths from Supabase
export async function generateStaticParams() {
    const { data } = await supabase
        .from("approved_businesses")
        .select("slug");
    return (data || []).map((b) => ({ slug: b.slug }));
}

// Helper to find business from Supabase
async function findBusiness(slug: string): Promise<Business | null> {
    const { data: approved, error } = await supabase
        .from("approved_businesses")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !approved) {
        return null;
    }

    // Convert Supabase format to Business interface
    return {
        id: approved.id,
        name: approved.name,
        slug: approved.slug,
        category: approved.category,
        originalCategory: approved.original_category || approved.category,
        subcategory: approved.subcategory,
        address: approved.address,
        city: approved.city || null,
        state: approved.state || "TX",
        phone: approved.phone,
        website: approved.website,
        email: approved.email,
        description: approved.description || `${approved.name} - Doanh nghiệp Việt Nam tại DFW`,
        googleMapsLink: approved.google_maps_link,
        linkType: approved.link_type,
        images: approved.images || [],
    };
}

// Extract city from business data or address
function extractCity(business: Business): string {
    if (business.city) return business.city;
    const parts = business.address.split(",");
    if (parts.length >= 2) {
        const cityPart = parts[parts.length - 2].trim();
        return cityPart.replace(/\d+/g, "").trim() || "DFW";
    }
    return "Dallas-Fort Worth";
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const business = await findBusiness(slug);

    if (!business) {
        return { title: "Business Not Found | DFW Vietnamese Biz" };
    }

    const city = extractCity(business);
    const firstImage = business.images?.[0];

    return {
        title: `${business.name} | ${business.subcategory || business.category} tại ${city}`,
        description: `${business.name} - ${business.subcategory || business.category} tại ${city}. ${business.description || "Doanh nghiệp Việt Nam uy tín tại DFW."}`,
        openGraph: {
            title: `${business.name} | DFW Vietnamese Biz`,
            description: `${business.subcategory || business.category} tại ${city}`,
            type: "website",
            ...(firstImage ? { images: [{ url: firstImage }] } : {}),
        },
    };
}

export default async function BusinessDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const business = await findBusiness(slug);

    if (!business) {
        notFound();
    }

    const city = extractCity(business);
    const hasImages = business.images && business.images.length > 0;

    const categoryColors: Record<string, string> = {
        Restaurant: "from-orange-500 to-red-500",
        Healthcare: "from-blue-500 to-cyan-500",
        Retail: "from-pink-500 to-rose-500",
        Automotive: "from-amber-500 to-orange-500",
        "Beauty & Personal Care": "from-fuchsia-500 to-pink-500",
        "Professional Services": "from-sky-500 to-blue-500",
        Religious: "from-indigo-500 to-violet-500",
        Community: "from-green-500 to-teal-500",
        Food: "from-orange-500 to-red-500",
        Services: "from-blue-500 to-cyan-500",
        Shopping: "from-pink-500 to-purple-500",
    };

    const gradientClass = categoryColors[business.originalCategory || business.category] || "from-gray-500 to-gray-600";

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
                        {/* Avatar or first image */}
                        {hasImages ? (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                                <Image
                                    src={business.images[0]}
                                    alt={business.name}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div
                                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-lg flex-shrink-0`}
                            >
                                {business.name.charAt(0)}
                            </div>
                        )}

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span
                                    className={`inline-block px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${gradientClass} text-white`}
                                >
                                    {business.subcategory || business.category}
                                </span>
                                {business.originalCategory && business.originalCategory !== (business.subcategory || business.category) && (
                                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-neutral-700 text-neutral-300">
                                        {business.originalCategory}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">
                                {business.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-neutral-400">
                                <span>📍 {city}{business.state ? `, ${business.state}` : ""}</span>
                                {business.phone && (
                                    <span>📞 {business.phone}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-8 md:py-12">
                {/* Image Gallery */}
                {hasImages && (
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            📷 Hình ảnh
                        </h2>
                        {business.images.length === 1 ? (
                            <div className="rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-800 flex items-center justify-center">
                                <Image
                                    src={business.images[0]}
                                    alt={`${business.name} - ảnh 1`}
                                    width={800}
                                    height={450}
                                    className="w-full h-auto max-h-[500px] object-contain"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {business.images.map((url, index) => (
                                    <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group rounded-xl overflow-hidden border border-neutral-700 hover:border-yellow-500 transition-colors"
                                    >
                                        <Image
                                            src={url}
                                            alt={`${business.name} - ảnh ${index + 1}`}
                                            width={400}
                                            height={300}
                                            className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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
                                {business.description || `${business.name} là doanh nghiệp ${business.subcategory || business.category} tại ${city}. Đây là một trong những địa điểm được cộng đồng Việt Nam tin tưởng tại DFW.`}
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
