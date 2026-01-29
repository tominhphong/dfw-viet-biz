"use client";

import { useState } from "react";
import seedData from "../data/seed.json";
import SubmitBusinessModal from "../components/SubmitBusinessModal";

interface Business {
  id: number;
  name: string;
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

export default function Home() {
  const [data] = useState<Business[]>(seedData);
  const [filter, setFilter] = useState("All");
  const [randomPick, setRandomPick] = useState<Business | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const filteredData =
    filter === "All"
      ? data
      : data.filter((item) => item.category === filter);

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * data.length);
    setRandomPick(data[randomIndex]);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans">
      {/* Hero Section */}
      <header className="py-20 px-6 text-center bg-gradient-to-b from-neutral-800 to-neutral-900 border-b border-neutral-800">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500 mb-4">
          DFW Vietnamese Biz
        </h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-8">
          The ultimate guide to Vietnamese cuisine, shopping, and services in Dallas-Fort Worth.
        </p>
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleRandomize}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform animate-pulse text-white"
          >
            🎲 Let the Universe Decide
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-8 py-4 bg-neutral-800 border border-neutral-700 rounded-full font-bold text-lg hover:bg-neutral-700 transition-colors text-white"
          >
            ➕ Add Your Biz
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {["All", "Food", "Services", "Shopping", "Community"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full border transition-all ${filter === cat
                ? "bg-white text-black border-white font-bold"
                : "bg-transparent text-neutral-400 border-neutral-700 hover:border-neutral-500"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredData.map((biz) => (
            <div
              key={biz.id}
              className="group relative bg-neutral-800 rounded-2xl overflow-hidden hover:bg-neutral-750 transition-colors border border-neutral-800 hover:border-neutral-600"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                    {biz.category}
                  </span>
                  <span className="text-sm bg-neutral-900 px-2 py-1 rounded text-neutral-300">
                    ★ {biz.rating} ({biz.reviewCount})
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                  {biz.name}
                </h3>
                <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                  {biz.description}
                </p>
                <div className="text-sm text-neutral-500 flex items-center gap-2">
                  <span>📍</span> {biz.address}
                </div>
                {biz.phone && (
                  <div className="text-sm text-neutral-400 flex items-center gap-2 mt-2">
                    <span>📞</span> {biz.phone}
                  </div>
                )}
                {biz.website && (
                  <a
                    href={`https://${biz.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline flex items-center gap-2 mt-1"
                  >
                    <span>🌐</span> {biz.website}
                  </a>
                )}
                {biz.googleMapsLink && (
                  <a
                    href={biz.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <span>📍</span> Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="col-span-full text-center py-20 text-neutral-500">
              No businesses found in this category yet. Be the first to add one!
            </div>
          )}
        </div>
      </main>

      {/* Random Pick Modal */}
      {randomPick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in zoom-in fade-in duration-300">
            <button
              onClick={() => setRandomPick(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white"
            >
              ✕
            </button>
            <div className="text-center">
              <span className="text-sm text-yellow-500 font-bold uppercase tracking-wider mb-2 block">
                The Universe Chose
              </span>
              <h2 className="text-4xl font-extrabold mb-4 text-white">
                {randomPick.name}
              </h2>
              <div className="text-xl text-neutral-300 mb-6">
                {randomPick.description}
              </div>
              <p className="text-neutral-400 mb-8">{randomPick.address}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setRandomPick(null)}
                  className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                >
                  Great choice!
                </button>
                <button
                  onClick={handleRandomize}
                  className="px-6 py-3 bg-neutral-800 text-white border border-neutral-700 rounded-xl font-bold hover:bg-neutral-700 transition-colors"
                >
                  Spin Again
                </button>
              </div>
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
