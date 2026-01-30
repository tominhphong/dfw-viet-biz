"use client";

import { useState, FormEvent } from "react";

interface SubmitBusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    businessName: string;
    category: string;
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

const initialFormData: FormData = {
    businessName: "",
    category: "Food",
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

    const categories = ["Food", "Services", "Shopping", "Community"];

    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.businessName.trim()) {
            newErrors.businessName = "Business name is required";
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }

        if (formData.phone && !/^[\d\s\-()]+$/.test(formData.phone)) {
            newErrors.phone = "Invalid phone format";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (formData.website && !/^[\w\-.]+(\.[\w\-]+)+/.test(formData.website)) {
            newErrors.website = "Invalid website format";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        // Build full address
        const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;

        try {
            const response = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.businessName,
                    category: formData.category,
                    address: fullAddress,
                    phone: formData.phone || null,
                    website: formData.website || null,
                    email: formData.email || null,
                    description: formData.description || null,
                    submitterEmail: formData.ownerName || null,
                }),
            });

            if (response.ok) {
                setSubmitStatus("success");
                setTimeout(() => {
                    setFormData(initialFormData);
                    setSubmitStatus("idle");
                    onClose();
                }, 3000);
            } else {
                setSubmitStatus("error");
            }
        } catch {
            setSubmitStatus("error");
        }

        setIsSubmitting(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                            📝 Add Your Business
                        </h2>
                        <p className="text-neutral-400 text-sm mt-1">
                            Help us grow the Vietnamese biz community in DFW!
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
                {submitStatus === "success" && (
                    <div className="p-6 text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-xl font-bold text-green-400 mb-2">Đã Gửi Thành Công!</h3>
                        <p className="text-neutral-300">
                            Thông tin doanh nghiệp của bạn đã được gửi.
                            <br />
                            Admin sẽ duyệt và thêm vào website sớm nhất!
                        </p>
                    </div>
                )}

                {/* Form */}
                {submitStatus !== "success" && (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Business Name */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                                Business Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                placeholder="e.g. Phở Saigon Restaurant"
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
                                Category <span className="text-red-400">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                                Street Address <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="e.g. 2550 W Walnut St"
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
                                <label className="block text-sm font-medium text-neutral-300 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Zip</label>
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
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Phone</label>
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
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Website</label>
                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="www.example.com"
                                className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${errors.website ? "border-red-500" : "border-neutral-600"
                                    }`}
                            />
                            {errors.website && <p className="text-red-400 text-sm mt-1">{errors.website}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">
                                Business Email
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
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Tell us about your business..."
                                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                            />
                        </div>

                        {/* Owner Name */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Your Name</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                placeholder="Your name (optional)"
                                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin">⏳</span> Preparing...
                                </>
                            ) : (
                                <>
                                    Submit Business <span>→</span>
                                </>
                            )}
                        </button>

                        <p className="text-neutral-500 text-xs text-center">
                            Your email app will open with pre-filled submission details. Just hit Send!
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
