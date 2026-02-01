import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Business {
    id: number;
    name: string;
    slug: string;
    category: string;
    subcategory?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    website?: string;
    description?: string;
}

// GET: List all seed businesses
export async function GET() {
    try {
        const seedPath = path.join(process.cwd(), "src/data/seed.json");
        const seedData = fs.readFileSync(seedPath, "utf-8");
        const businesses: Business[] = JSON.parse(seedData);

        return NextResponse.json({
            success: true,
            count: businesses.length,
            businesses
        });
    } catch (error) {
        console.error("Error reading seed.json:", error);
        return NextResponse.json(
            { error: "Không thể đọc dữ liệu seed.json" },
            { status: 500 }
        );
    }
}

// POST: Delete a business from seed.json
export async function POST(request: Request) {
    try {
        const { id, password } = await request.json();

        // Verify password
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword || password !== adminPassword) {
            return NextResponse.json(
                { error: "Mật khẩu không đúng" },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { error: "Thiếu ID doanh nghiệp" },
                { status: 400 }
            );
        }

        const seedPath = path.join(process.cwd(), "src/data/seed.json");
        const seedData = fs.readFileSync(seedPath, "utf-8");
        const businesses: Business[] = JSON.parse(seedData);

        // Find the business to delete
        const businessToDelete = businesses.find(b => b.id === id);
        if (!businessToDelete) {
            return NextResponse.json(
                { error: "Không tìm thấy doanh nghiệp với ID: " + id },
                { status: 404 }
            );
        }

        // Filter out the business
        const updatedBusinesses = businesses.filter(b => b.id !== id);

        // Write back to file
        fs.writeFileSync(seedPath, JSON.stringify(updatedBusinesses, null, 2), "utf-8");

        return NextResponse.json({
            success: true,
            message: `Đã xóa "${businessToDelete.name}" thành công!`,
            deletedBusiness: businessToDelete,
            remainingCount: updatedBusinesses.length
        });

    } catch (error) {
        console.error("Error deleting from seed.json:", error);
        return NextResponse.json(
            { error: "Có lỗi khi xóa doanh nghiệp" },
            { status: 500 }
        );
    }
}
