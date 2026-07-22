import Header from "@/components/Header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nông Trại Luyện Tập TOEIC",
  description: "Website luyện thi TOEIC Master miễn phí",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* Gọi Component Header thông minh tại đây */}
        <Header />

        <div className="min-h-screen bg-emerald-50/50">
          {children}
        </div>
      </body>
    </html>
  );
}