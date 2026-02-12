"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SubmitBusinessModal from "../components/SubmitBusinessModal";
import SearchBar from "../components/SearchBar";
const TetDecorations = dynamic(() => import("../components/TetDecorations"), { ssr: false });
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "../lib/supabase";

interface Business {
  id: number;
  name: string;
  slug: string;
  category: string;
  originalCategory: string | null;
  subcategory: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  description: string;
  rating: number;
  reviewCount: number;
  googleMapsLink: string | null;
  linkType: string | null;
  images: string[];
}

// Main categories derived from originalCategory
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

export default function Home() {
  const { language, toggleLanguage, t, tc } = useLanguage();
  const [data, setData] = useState<Business[]>([]);
  const [filter, setFilter] = useState("All");
  const [subcategoryFilter, setSubcategoryFilter] = useState("All");
  const [randomPick, setRandomPick] = useState<Business | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Fetch all businesses from Supabase
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const { data: dbData, error } = await supabase
          .from("approved_businesses")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching businesses:", error);
          return;
        }

        if (dbData && dbData.length > 0) {
          const convertedData: Business[] = dbData.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            category: item.category,
            originalCategory: item.original_category || item.category,
            subcategory: item.subcategory,
            address: item.address || "",
            phone: item.phone,
            website: item.website,
            email: item.email,
            description: item.description || `${item.name} - Doanh nghiệp Việt Nam tại DFW`,
            rating: item.rating || 0,
            reviewCount: item.review_count || 0,
            googleMapsLink: item.google_maps_link,
            linkType: item.link_type,
            images: item.images || [],
          }));
          setData(convertedData);
        }
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
      }
    };

    fetchBusinesses();
  }, []);


  // Get subcategories for current main category
  const availableSubcategories = useMemo(() => {
    const filtered = filter === "All"
      ? data
      : data.filter((item) => item.originalCategory === filter);

    const subs = new Set<string>();
    filtered.forEach((item) => {
      if (item.subcategory) subs.add(item.subcategory);
    });
    return Array.from(subs).sort();
  }, [data, filter]);

  const filteredData = useMemo(() => {
    let result = data;

    // Filter by main category (originalCategory)
    if (filter !== "All") {
      result = result.filter((item) => item.originalCategory === filter);
    }

    // Filter by subcategory
    if (subcategoryFilter !== "All") {
      result = result.filter((item) => item.subcategory === subcategoryFilter);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rating":
          return b.rating - a.rating;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    return result;
  }, [data, filter, subcategoryFilter, searchQuery, sortBy]);

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * data.length);
    setRandomPick(data[randomIndex]);
  };

  const handleCategoryChange = (cat: string) => {
    setFilter(cat);
    setSubcategoryFilter("All"); // Reset subcategory when main category changes
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans">
      {/* Tết Ất Tỵ 2025 Decorations */}
      <TetDecorations />

      {/* Hero Section */}
      <header className="py-16 px-6 text-center bg-gradient-to-b from-neutral-800 to-neutral-900 border-b border-neutral-800">
        {/* Language Toggle */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-full text-sm font-medium hover:bg-neutral-700 transition-colors"
          >
            {language === "vi" ? "🇻🇳 VI" : "🇺🇸 EN"}
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500 mb-4">
          {t("title")}
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-8">
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={handleRandomize}
            className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-full font-bold text-base md:text-lg shadow-lg hover:scale-105 transition-transform animate-pulse text-white"
          >
            {t("randomButton")}
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-6 md:px-8 py-3 md:py-4 bg-neutral-800 border border-neutral-700 rounded-full font-bold text-base md:text-lg hover:bg-neutral-700 transition-colors text-white"
          >
            {t("addBizButton")}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Main Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
          {MAIN_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 md:px-5 py-2 rounded-full border text-sm md:text-base transition-all ${filter === cat
                ? "bg-white text-black border-white font-bold"
                : "bg-transparent text-neutral-400 border-neutral-700 hover:border-neutral-500"
                }`}
            >
              {tc(cat)}
            </button>
          ))}
        </div>

        {/* Subcategory Filter */}
        {availableSubcategories.length > 0 && (
          <div className="flex justify-center mb-6">
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 max-w-xs"
            >
              <option value="All">{t("allSubcategories")}</option>
              {availableSubcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Bar */}
        <SearchBar
          onSearch={setSearchQuery}
          onSort={setSortBy}
          resultCount={filteredData.length}
          totalCount={data.length}
        />

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredData.map((biz) => (
            <div
              key={biz.id}
              className="group relative bg-neutral-800 rounded-2xl overflow-hidden hover:bg-neutral-750 transition-colors border border-neutral-800 hover:border-neutral-600"
            >
              {/* Image thumbnail */}
              {biz.images && biz.images.length > 0 && (
                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-700">
                  <img
                    src={biz.images[0]}
                    alt={biz.name}
                    className="w-full h-full object-cover object-top"
                  />
                  {biz.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      +{biz.images.length - 1} ảnh
                    </span>
                  )}
                </div>
              )}
              <div className="p-5 md:p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                      {tc(biz.originalCategory || biz.category)}
                    </span>
                    {biz.subcategory && (
                      <span className="text-xs text-neutral-500">
                        {biz.subcategory}
                      </span>
                    )}
                  </div>

                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                  {biz.name}
                </h3>
                <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                  {biz.description}
                </p>
                {biz.address && (
                  <div className="text-sm text-neutral-500 flex items-center gap-2">
                    <span>📍</span> {biz.address}
                  </div>
                )}
                {biz.phone && (
                  <div className="text-sm text-neutral-400 flex items-center gap-2 mt-2">
                    <span>📞</span> {biz.phone}
                  </div>
                )}
                {biz.website && (
                  <a
                    href={biz.website.startsWith("http") ? biz.website : `https://${biz.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline flex items-center gap-2 mt-1"
                  >
                    <span>🌐</span> {biz.website}
                  </a>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/business/${biz.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    👁️ {t("viewDetails")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="col-span-full text-center py-20 text-neutral-500">
              {t("noResults")}
            </div>
          )}
        </div>
      </main>

      {/* Random Pick Modal */}
      {randomPick && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-3xl p-6 md:p-8 max-w-md w-full text-center border border-neutral-700 animate-scale-in">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">
              ✨ {t("universeChose")}
            </h2>
            <div className="bg-neutral-900 rounded-2xl p-5 md:p-6 mb-6">
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                {tc(randomPick.originalCategory || randomPick.category)}
              </span>
              <h3 className="text-2xl font-bold my-2">{randomPick.name}</h3>
              <p className="text-neutral-400 text-sm mb-3 line-clamp-2">
                {randomPick.description}
              </p>
              {randomPick.address && (
                <p className="text-sm text-neutral-500">📍 {randomPick.address}</p>
              )}
              <div className="flex justify-center gap-2 mt-4">
                <Link
                  href={`/business/${randomPick.slug}`}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-medium text-sm transition-colors"
                >
                  {t("viewDetails")}
                </Link>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setRandomPick(null)}
                className="px-6 py-3 bg-neutral-700 text-white rounded-xl font-bold hover:bg-neutral-600 transition-colors"
              >
                {t("close")}
              </button>
              <button
                onClick={handleRandomize}
                className="px-6 py-3 bg-neutral-800 text-white border border-neutral-700 rounded-xl font-bold hover:bg-neutral-700 transition-colors"
              >
                {t("spinAgain")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Business Modal */}
      <SubmitBusinessModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
