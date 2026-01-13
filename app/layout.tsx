import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-kurdish",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "هەڵسەنگاندنی مامۆستایان",
  description: "سیستەمی هەڵسەنگاندنی مامۆستایان",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ku" dir="rtl">
      <body className={`${notoSansArabic.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

