import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DFW Vietnamese Business Directory - Danh Bạ Doanh Nghiệp Việt",
  description: "Tìm kiếm 239+ doanh nghiệp Việt Nam tại Dallas-Fort Worth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
