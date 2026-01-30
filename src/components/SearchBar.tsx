"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "../context/LanguageContext";

interface SearchBarProps {
    onSearch: (query: string) => void;
    onSort: (sortBy: string) => void;
    resultCount: number;
    totalCount: number;
}

export default function SearchBar({ onSearch, onSort, resultCount, totalCount }: SearchBarProps) {
    const { t } = useLanguage();
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");

    // Debounce search
    const debounce = useCallback((func: (value: string) => void, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (value: string) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(value), delay);
        };
    }, []);

    const debouncedSearch = useCallback(
        debounce((value: string) => onSearch(value), 300),
        [onSearch]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    };

    const handleClear = () => {
        setQuery("");
        onSearch("");
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSortBy(value);
        onSort(value);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-6">
            {/* Search Input */}
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-neutral-400 text-xl">🔍</span>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={t("searchPlaceholder")}
                    className="w-full pl-12 pr-12 py-3 md:py-4 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base md:text-lg"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Sort & Results Count */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-neutral-400">{t("sortBy")}:</span>
                    <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        <option value="name">{t("sortNameAZ")}</option>
                        <option value="name-desc">{t("sortNameZA")}</option>
                    </select>
                </div>

                <div className="text-neutral-400">
                    {t("showing")} <span className="text-white font-bold">{resultCount}</span> {t("of")}{" "}
                    <span className="text-white">{totalCount}</span> {t("businesses")}
                </div>
            </div>
        </div>
    );
}
