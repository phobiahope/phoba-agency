import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Phoba Agency — Рекламное агентство полного цикла",
  description:
    "Phoba Agency — создаём кампании, которые запоминаются. Брендинг, таргетинг, SMM и аналитика под ключ. ИИ-ассистент поможет определиться и переведёт к менеджеру в Telegram.",
  keywords: [
    "Phoba Agency",
    "рекламное агентство",
    "брендинг",
    "таргетинг",
    "SMM",
    "аналитика",
    "маркетинг",
  ],
  authors: [{ name: "Phoba Agency" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#0a0c10" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
