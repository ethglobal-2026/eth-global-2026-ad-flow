import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. 定義字體變數（這部分不能少，否則會報錯）
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AdFlow Protocol | Hackathon Demo",
  description: "AI-Powered Privacy-Preserving Ad Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black relative">
        {/* 主要內容區域 */}
        {children}

        {/* --- 🚀 全局 Demo 導航條 (包含三個主題 Blog) --- */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1 bg-stone-900/95 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-110 md:scale-100 whitespace-nowrap">
          
          {/* 角色切換 */}
          <a href="/advertiser" className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-blue-400 hover:bg-white/5 rounded-xl transition-all">
            1. Ad
          </a>
          <a href="/dashboard" className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-white/5 rounded-xl transition-all">
            2. Console
          </a>

          {/* 分隔線 */}
          <div className="w-px h-3 bg-white/10 mx-1" />

          {/* 不同主題的 Blog 展示 */}
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-stone-600 uppercase tracking-tighter mr-1 ml-1">Blogs:</span>
            <a href="/demo-site" className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-stone-400 hover:bg-white/5 rounded-xl transition-all">
              Keto
            </a>
            <a href="/demo-tech" className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-stone-400 hover:bg-white/5 rounded-xl transition-all">
              Tech
            </a>
            <a href="/demo-travel" className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-stone-400 hover:bg-white/5 rounded-xl transition-all">
              Travel
            </a>
          </div>
          
        </div>
      </body>
    </html>
  );
}