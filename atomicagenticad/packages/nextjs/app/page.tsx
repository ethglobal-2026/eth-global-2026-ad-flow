'use client';
import { useState, useEffect } from 'react';

export default function TravelBlog() {
  // 核心：將單一字串改為物件，用以判斷廣告是否存在
  const [ad, setAd] = useState<{ h: string; d: string } | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // 📡 數據握手：監聽 Advertiser 傳來的數據
    const syncData = () => {
      const h = localStorage.getItem('ADFLOW_SYNC_H');
      const d = localStorage.getItem('ADFLOW_SYNC_D');
      if (h && d) {
        setAd({ h, d });
      } else {
        setAd(null);
      }
    };

    syncData();
    window.addEventListener('focus', syncData);
    return () => window.removeEventListener('focus', syncData);
  }, []);

  if (!hasMounted) return <div className="min-h-screen bg-[#FDFCF9]" />;

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-stone-900 font-serif pb-64 selection:bg-stone-200">
      
      {/* 1. 全域導航 */}
      <nav className="fixed top-0 w-full p-8 flex justify-between items-center bg-[#FDFCF9]/80 backdrop-blur-md z-50 border-b border-stone-100">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.8em] text-stone-800">Eaton Ash / Edition 04</span>
        <div className="hidden md:flex gap-10 font-sans text-[9px] font-bold uppercase tracking-[0.4em] text-stone-400">
          <span className="text-stone-900 cursor-pointer border-b border-stone-900 pb-1">Provence</span>
          <span className="hover:text-stone-900 cursor-pointer transition-colors">Tuscany</span>
          <span className="hover:text-stone-900 cursor-pointer transition-colors">Kyoto</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-48 px-8">
        
        {/* 2. Hero Section */}
        <div className="space-y-16 mb-40 text-center">
          <div className="space-y-4">
            <h1 className="text-8xl md:text-[14rem] font-light tracking-tighter leading-none text-stone-950 italic">Cassis.</h1>
            <p className="font-sans text-[10px] uppercase tracking-[0.6em] text-stone-400">A journey through the limestone calanques</p>
          </div>
          
          <div className="aspect-[21/9] w-full bg-stone-100 overflow-hidden shadow-2xl rounded-sm border border-stone-100">
            <img 
              src="https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2000&auto=format&fit=crop" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[5s]" 
              alt="Mediterranean Coast" 
            />
          </div>
        </div>

        {/* 3. Editorial Text Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20 items-start mb-40">
          <div className="md:col-span-4 space-y-6 sticky top-32">
            <h3 className="text-sm font-sans font-black uppercase tracking-widest text-stone-300">The Narrative</h3>
            <p className="text-stone-500 leading-loose text-sm italic">
              "There is a specific kind of silence you only find in the south of France before the mistral wind picks up. It smells of salt, dry pine needles, and the ancient limestone that defines this coast."
            </p>
          </div>
          <div className="md:col-span-8 space-y-12">
            <p className="text-2xl leading-[2.2] text-stone-800 first-letter:text-7xl first-letter:float-left first-letter:mr-4 first-letter:font-light">
              Cassis is not just a destination; it is a ritual. We arrived at dawn, the sky a bruised purple that slowly bled into a soft peach. The port was still, the colorful houses reflecting perfectly in the glassy water. Unlike the glitter of St. Tropez, Cassis retains a certain humbleness—a fisherman’s village that happened to be blessed with the most dramatic cliffs in Europe.
            </p>
            <p className="text-lg leading-[2] text-stone-600">
              The limestone cliffs, known as the Calanques, stretch from here to Marseille. They are steep, jagged, and brilliant white against the deep turquoise of the Mediterranean. To see them is to understand the raw architecture of the coast.
            </p>
          </div>
        </div>

        {/* 4. 🚀 核心贊助位 (動態對接雙態渲染) */}
        {ad ? (
          /* 狀態 A: 廣告載入成功 (奢華雜誌主編推薦風格) */
          <section className="my-40 py-32 px-12 bg-white border border-stone-100 shadow-[0_30px_100px_rgba(0,0,0,0.03)] rounded-[80px] flex flex-col items-center text-center space-y-12 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-stone-200 to-transparent opacity-50" />
            
            <div className="absolute top-12 flex items-center gap-4">
              <div className="h-px w-12 bg-stone-200" />
              <span className="font-sans text-[8px] font-black uppercase tracking-[0.8em] text-stone-400">Journal Recommendation</span>
              <div className="h-px w-12 bg-stone-200" />
            </div>

            <div className="space-y-8 max-w-3xl z-10 pt-8">
              <h2 className="text-5xl md:text-7xl font-light tracking-tight text-stone-900 italic leading-[1.1] transition-all group-hover:tracking-tighter duration-1000">
                {ad.h}
              </h2>
              <div className="w-px h-16 bg-stone-300 mx-auto" />
              <p className="text-stone-500 font-sans text-xs leading-[2.5] tracking-[0.2em] uppercase max-w-lg mx-auto">
                {ad.d}
              </p>
            </div>

            <button className="group relative px-16 py-6 transition-all overflow-hidden border border-stone-200 rounded-full hover:border-stone-900 hover:bg-stone-900 hover:text-white active:scale-95 duration-500">
              <span className="relative z-10 font-sans text-[10px] font-bold uppercase tracking-[0.5em]">Discover Collection</span>
            </button>
          </section>
        ) : (
          /* 狀態 B: 廣告等待載入 (優雅的畫廊留白佔位符) */
          <section className="my-40 py-32 px-12 border-2 border-dashed border-stone-200 bg-stone-50/30 rounded-[80px] flex flex-col items-center text-center space-y-8 opacity-50 hover:opacity-100 transition-all duration-700 cursor-crosshair">
            <div className="w-16 h-16 rounded-full border border-stone-300 flex items-center justify-center animate-spin-slow bg-white shadow-sm">
              <span className="text-stone-300 font-sans text-2xl font-light">+</span>
            </div>
            <div className="space-y-4 max-w-lg">
              <h4 className="font-sans text-[9px] font-black uppercase tracking-[0.6em] text-stone-400">Curated Space</h4>
              <p className="text-stone-400 italic text-lg">
                "This editorial placement is reserved for premium lifestyle partners. Initialize the handshake via Advertiser Console."
              </p>
            </div>
          </section>
        )}

        {/* 5. The "Cassis Checklist" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-40">
          <div className="space-y-12">
            <h4 className="text-4xl font-light italic tracking-tight text-stone-900">The Cassis Checklist.</h4>
            <ul className="space-y-8 font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">
              <li className="flex items-center gap-8 border-b border-stone-100 pb-5 group hover:text-stone-900 transition-colors cursor-pointer">
                <span className="text-stone-300 group-hover:text-stone-900 transition-colors">01</span>
                <span>Breakfast at Le Grand Bleu</span>
              </li>
              <li className="flex items-center gap-8 border-b border-stone-100 pb-5 group hover:text-stone-900 transition-colors cursor-pointer">
                <span className="text-stone-300 group-hover:text-stone-900 transition-colors">02</span>
                <span>Hike to Calanque d’En-Vau</span>
              </li>
              <li className="flex items-center gap-8 border-b border-stone-100 pb-5 group hover:text-stone-900 transition-colors cursor-pointer">
                <span className="text-stone-300 group-hover:text-stone-900 transition-colors">03</span>
                <span>Sunset over Cap Canaille</span>
              </li>
            </ul>
          </div>
          <div className="aspect-square bg-stone-100 rounded-[40px] overflow-hidden shadow-2xl rotate-2 border border-stone-100 group">
            <img 
              src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[10s]" 
              alt="Mediterranean Texture" 
            />
          </div>
        </div>

        {/* 6. Closing Statement */}
        <footer className="max-w-2xl mx-auto text-center space-y-12 py-20 border-t border-stone-200">
          <p className="text-2xl italic text-stone-400 font-light leading-relaxed">
            "In Provence, time is measured not by hours, but by the movement of light across the limestone."
          </p>
          <div className="flex flex-col items-center gap-4 opacity-40">
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white text-[10px] font-bold">EA</div>
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-stone-500">Zero Knowledge Architecture</span>
          </div>
        </footer>
      </main>
    </div>
  );
}