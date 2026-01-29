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
        return {
            title: "Business Not Found | DFW Vietnamese Biz",
        };
    }

    return {
        title: `${business.name} | DFW Vietnamese Biz`,
        description: business.description || `${business.name} - Vietnamese business in ${business.address}. ${business.category} category.`,
        openGraph: {
            title: `${business.name} | DFW Vietnamese Biz`,
            description: business.description || `${business.name} - Vietnamese business in Dallas-Fort Worth`,
            type: "website",
        },
    };
}

export default async function BusinessDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const business = (seedData as Business[]).find((b) => b.slug === slug);

    if (!business) {
        notFound();
    }

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
                        ← Back to Directory
                    </Link>

                    <div className="flex items-start gap-4">
                        <div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${categoryColors[business.category] || "from-gray-500 to-gray-600"
                                } flex items-center justify-center text-3xl font-bold text-white shadow-lg`}
                        >
                            {business.name.charAt(0)}
                        </div>

                        <div className="flex-1">
                            <span
                                className={`inline-block px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${categoryColors[business.category] || "from-gray-500 to-gray-600"
                                    } text-white mb-2`}
                            >
                                {business.category}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                                {business.name}
                            </h1>
                            <div className="flex items-center gap-4 text-neutral-400">
                                <span className="flex items-center gap-1">
                                    <span className="text-yellow-400">⭐</span>
                                    {business.rating.toFixed(1)}
                                </span>
                                <span>({business.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column - Info */}
                    <div className="space-y-6">
                        {/* Address */}
                        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                📍 Location
                            </h2>
                            <p className="text-neutral-300 mb-4">{business.address}</p>
                            {business.googleMapsLink && (
                                <a
                                    href={business.googleMapsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:from-green-500 hover:to-green-400 transition-all"
                                >
                                    🗺️ Open in Google Maps
                                </a>
                            )}
                        </div>

                        {/* Contact */}
                        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                📞 Contact
                            </h2>
                            <div className="space-y-3">
                                {business.phone && (
                                    <a
                                        href={`tel:${business.phone}`}
                                        className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
                                    >
                                        <span className="text-xl">📱</span>
                                        {business.phone}
                                    </a>
                                )}
                                {business.website && (
                                    <a
                                        href={
                                            business.website.startsWith("http")
                                                ? business.website
                                                : `https://${business.website}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
                                    >
                                        <span className="text-xl">🌐</span>
                                        {business.website}
                                    </a>
                                )}
                                {business.email && (
                                    <a
                                        href={`mailto:${business.email}`}
                                        className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
                                    >
                                        <span className="text-xl">✉️</span>
                                        {business.email}
                                    </a>
                                )}
                                {!business.phone && !business.website && !business.email && (
                                    <p className="text-neutral-500">No contact info available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Description */}
                    <div className="space-y-6">
                        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                📝 About
                            </h2>
                            <p className="text-neutral-300 leading-relaxed">
                                {business.description || "No description available."}
                            </p>

                            {business.subcategory && (
                                <div className="mt-4 pt-4 border-t border-neutral-700">
                                    <span className="text-neutral-500 text-sm">Subcategory: </span>
                                    <span className="text-neutral-300">{business.subcategory}</span>
                                </div>
                            )}

                            {business.originalCategory && (
                                <div className="mt-2">
                                    <span className="text-neutral-500 text-sm">Original: </span>
                                    <span className="text-neutral-300">{business.originalCategory}</span>
                                </div>
                            )}
                        </div>

                        {/* Share */}
                        <div className="bg-neutral-800 rounded-2xl p-6 border border-neutral-700">
                            <h2 className="text-lg font-bold text-white mb-4">🔗 Share</h2>
                            <div className="flex gap-3">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                        typeof window !== "undefined" ? window.location.href : ""
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                                >
                                    Facebook
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                        `Check out ${business.name} on DFW Vietnamese Biz!`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
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
                        ← Back to All Businesses
                    </Link>
                </div>
            </main>
        </div>
    );
}
