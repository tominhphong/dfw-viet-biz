"use client";

import { useState, useEffect } from "react";

// Tết Bính Ngọ 2026 decorations — festive banner + falling hoa mai
// To disable after Tết, set SHOW_TET to false
const SHOW_TET = true;

const DRAW_DAY = new Date("2026-02-21T12:00:00"); // Quay xổ số: Mùng 5 Tết, 12h trưa

const FALLING_ITEMS = ["🌸", "🧧", "🏮", "✨", "🌺", "💮", "🎋"];

interface FallingItem {
    id: number;
    emoji: string;
    left: number;
    delay: number;
    duration: number;
    size: number;
}

function TetBanner() {
    const [info, setInfo] = useState({ countdown: "", isTet: false });

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const diff = DRAW_DAY.getTime() - now.getTime();

            if (diff <= 0) {
                setInfo({ countdown: "", isTet: true });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setInfo({
                countdown: days > 0 ? `${days} ngày ${hours} giờ` : `${hours} giờ`,
                isTet: false,
            });
        };

        update();
        const id = setInterval(update, 60000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="tet-banner">
            <div className="tet-banner-content">
                <div className="tet-banner-left">
                    <span className="tet-lantern">🏮</span>
                </div>
                <div className="tet-banner-center">
                    {info.isTet ? (
                        <>
                            <h2 className="tet-greeting">🎉 Đã Quay Xổ Số! 🎉</h2>
                            <p className="tet-subtitle">Chúc mừng người trúng giải $100 lì xì Tết!</p>
                        </>
                    ) : (
                        <>
                            <h2 className="tet-greeting">🎰 Quay Xổ Số Lì Xì $100 — Mùng 5 Tết! 🧧</h2>
                            <p className="tet-subtitle">
                                {info.countdown && (
                                    <>Còn <span className="tet-countdown">{info.countdown}</span> — </>
                                )}
                                Đăng ký doanh nghiệp để nhận số may mắn!
                            </p>
                        </>
                    )}
                </div>
                <div className="tet-banner-right">
                    <span className="tet-lantern">🏮</span>
                </div>
            </div>
        </div>
    );
}

function FallingPetals() {
    const [items, setItems] = useState<FallingItem[]>([]);

    useEffect(() => {
        setItems(
            Array.from({ length: 20 }, (_, i) => ({
                id: i,
                emoji: FALLING_ITEMS[Math.floor(Math.random() * FALLING_ITEMS.length)],
                left: Math.random() * 100,
                delay: Math.random() * 10,
                duration: 8 + Math.random() * 12,
                size: 14 + Math.random() * 16,
            }))
        );
    }, []);

    if (items.length === 0) return null;

    return (
        <div className="falling-petals" aria-hidden="true">
            {items.map((item) => (
                <span
                    key={item.id}
                    className="falling-item"
                    style={{
                        left: `${item.left}%`,
                        animationDelay: `${item.delay}s`,
                        animationDuration: `${item.duration}s`,
                        fontSize: `${item.size}px`,
                    }}
                >
                    {item.emoji}
                </span>
            ))}
        </div>
    );
}

export default function TetDecorations() {
    if (!SHOW_TET) return null;

    return (
        <>
            <TetBanner />
            <FallingPetals />
        </>
    );
}
