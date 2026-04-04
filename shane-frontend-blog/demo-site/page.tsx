'use client';

import { useState, useEffect } from 'react';

export default function KetoBlog() {
  const [ad, setAd] = useState<{ h: string; d: string } | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // 📡 THE HANDSHAKE: 動態監聽隊友的廣告數據
    const syncWithAdvertiser = () => {
      const h = localStorage.getItem('ADFLOW_SYNC_H');
      const d = localStorage.getItem('ADFLOW_SYNC_D');
      if (h && d) {
        setAd({ h, d });
      } else {
        setAd(null);
      }
    };

    syncWithAdvertiser();
    window.addEventListener('focus', syncWithAdvertiser);
    return () => window.removeEventListener('focus', syncWithAdvertiser);
  }, []);

  if (!hasMounted) return <div className="min-h-screen bg-[#FDFDFB]" />;

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-stone-900 font-serif antialiased pb-40">
      
      {/* 1. 頂級雜誌導航 */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-stone-100 z-50">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-white font-black italic shadow-lg shadow-emerald-900/20">EA</div>
            <h1 className="text-xl font-black uppercase tracking-tighter font-sans">Eaton <span className="text-emerald-800">Ash</span> Journal</h1>
          </div>
          <div className="hidden md:flex items-center gap-8 font-sans text-[10px] font-bold uppercase tracking-widest text-stone-400">
            <span className="text-emerald-900 border-b-2 border-emerald-900 pb-1">Protocols</span>
            <span className="hover:text-stone-900 cursor-pointer transition-colors">Science</span>
            <span className="hover:text-stone-900 cursor-pointer transition-colors">Archive</span>
            <button className="bg-emerald-900 text-white px-6 py-2.5 rounded-full hover:bg-emerald-800 transition-all">Subscribe</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 py-20 px-8">
        
        {/* 2. 主文區域 (8格) */}
        <main className="lg:col-span-8 space-y-12">
          
          <header className="space-y-6">
            <div className="flex items-center gap-4 font-sans">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-amber-100">
                Fact Checked
              </span>
              <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest italic">Updated: April 2026</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-stone-950 leading-[0.9]">
              The Cellular <br/>Mechanism of <span className="italic text-emerald-900">Ketosis.</span>
            </h1>
            <p className="text-xl text-stone-500 leading-relaxed max-w-2xl font-medium italic font-sans">
              "Understanding how BHB molecules rewrite your biological aging clock."
            </p>
          </header>

          <div className="flex items-center gap-8 py-6 border-y border-stone-100 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
            <div className="flex items-center gap-2">👁️ <span className="text-stone-900">12,402 Views</span></div>
            <div className="flex items-center gap-2">🔄 <span className="text-stone-900">1.2k Shares</span></div>
            <div className="flex items-center gap-2">⏱️ <span className="text-stone-900">12 Min Read</span></div>
          </div>

          <div className="aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2000" 
              className="w-full h-full object-cover" 
              alt="Keto Meal Science"
            />
          </div>

          <article className="prose prose-stone lg:prose-xl space-y-8 text-stone-700 leading-[1.8] mt-10">
            {/* 高級首字放大 Drop Cap */}
            <p className="text-2xl font-medium text-stone-900 first-letter:text-7xl first-letter:float-left first-letter:mr-3 first-letter:font-black first-letter:text-emerald-950">
              When glucose availability drops, the liver initiates a primitive yet highly efficient backup system: the production of ketone bodies.
            </p>
            <p>
              This isn't just about weight loss. Recent data from the Biohackers Summit suggests that Beta-Hydroxybutyrate (BHB) acts as a signaling molecule, instructing our cells to increase antioxidant production and repair damaged DNA.
            </p>

            {/* 🚀 3. 核心動態廣告模塊 (兼顧顏值與技術) */}
            {ad ? (
              /* State A: 廣告已加載 (完美還原之前的「高顏值版本」) */
              <section className="my-16 p-12 bg-[#F8F9F2] rounded-[48px] border border-emerald-100/50 flex flex-col md:flex-row items-center gap-12 shadow-sm relative overflow-hidden group animate-in fade-in zoom-in duration-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <div className="flex-1 space-y-6 z-10">
                  <div className="flex items-center gap-2 font-sans">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-800">Journal Selection</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter text-stone-950 italic leading-none group-hover:scale-[1.02] transition-transform duration-500">
                    {ad.h}
                  </h3>
                  <p className="text-stone-600 text-lg leading-relaxed font-sans opacity-80">
                    {ad.d}
                  </p>
                  <div className="flex items-center gap-6">
                    <button className="bg-emerald-950 text-white px-10 py-4 rounded-2xl font-bold text-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                      Apply Protocol
                    </button>
                    <span className="font-sans text-[10px] font-bold text-stone-400 uppercase tracking-widest">Limited Access</span>
                  </div>
                </div>
                
                <div className="w-48 h-48 bg-emerald-900 rounded-[40px] shrink-0 flex items-center justify-center text-white text-8xl font-black italic shadow-2xl group-hover:rotate-6 transition-transform duration-700">
                  K
                </div>
              </section>
            ) : (
              /* State B: 廣告未加載 (優雅的高級佔位符) */
              <section className="my-16 p-12 border border-dashed border-stone-300 bg-stone-50/50 rounded-[48px] flex flex-col items-center justify-center text-center space-y-6 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                <div className="w-16 h-16 rounded-full border border-stone-200 bg-white flex items-center justify-center animate-spin-slow shadow-sm">
                  <span className="text-stone-400 font-sans text-2xl font-light">+</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-sans text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">Awaiting Ad Signal</h4>
                  <p className="text-stone-500 italic max-w-sm mx-auto">
                    "This editorial space is reserved for verified wellness partners. Sync via Advertiser Portal."
                  </p>
                </div>
              </section>
            )}

            <p>
              However, the challenge for most practitioners is the "transition period." Without proper electrolyte management and high-quality exogenous sources, the metabolic switch can feel like an uphill battle.
            </p>
          </article>
        </main>

        {/* 4. 側邊欄 (4格) - 保留了深綠色的高級感 */}
        <aside className="lg:col-span-4 space-y-12">
          
          <div className="p-10 bg-white rounded-[40px] border border-stone-100 shadow-sm space-y-6">
            <h4 className="font-sans text-[10px] font-black uppercase tracking-widest text-stone-400">The Author</h4>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950 flex items-center justify-center text-white font-black italic text-2xl shadow-inner">EA</div>
              <div>
                <p className="font-black text-stone-950 uppercase text-lg leading-none">Eaton Ash</p>
                <p className="text-xs text-emerald-700 font-bold font-sans mt-1">M.Sc. Human Metabolism</p>
              </div>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed italic">
              Specializing in the intersection of decentralized AI and metabolic longevity protocols.
            </p>
          </div>

          <div className="p-10 bg-emerald-950 text-white rounded-[40px] space-y-8 shadow-2xl">
            <h4 className="font-sans text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Live Protocol Stats</h4>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-emerald-900 pb-4">
                <span className="text-xs font-sans opacity-70 uppercase tracking-widest">Avg. BHB Level</span>
                <span className="text-3xl font-black tracking-tighter">2.4 <span className="text-[10px] opacity-40 uppercase tracking-normal">mmol/L</span></span>
              </div>
              <div className="flex justify-between items-end border-b border-emerald-900 pb-4">
                <span className="text-xs font-sans opacity-70 uppercase tracking-widest">Global Users</span>
                <span className="text-3xl font-black tracking-tighter">8,142</span>
              </div>
            </div>
            <button className="w-full py-4 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-colors">
              Join the Cohort
            </button>
          </div>

          <div className="space-y-6">
            <h4 className="font-sans text-[10px] font-black uppercase tracking-widest text-stone-400">Related Research</h4>
            {[1, 2].map((i) => (
              <div key={i} className="group cursor-pointer space-y-3">
                <div className="h-40 bg-stone-200 rounded-3xl overflow-hidden">
                  <div className="w-full h-full bg-stone-300 group-hover:scale-110 transition-transform duration-700" />
                </div>
                <p className="font-bold text-stone-900 leading-tight group-hover:text-emerald-700 transition-colors">
                  {i === 1 ? "Mitochondrial Biogenesis in the Fasted State." : "The Role of Magnesium in Sleep Cycles."}
                </p>
                <p className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-widest">Protocol #0{i+4}</p>
              </div>
            ))}
          </div>

        </aside>
      </div>

      <footer className="max-w-6xl mx-auto py-20 px-8 border-t border-stone-100 text-center space-y-8">
        <div className="font-sans text-[9px] font-bold text-stone-300 uppercase tracking-[0.5em] leading-loose">
          Ref [1]: Volek, J. S. (2026). The Art and Science of Longevity. <br/>
          Ref [2]: AdFlow Network Verified Publisher Database.
        </div>
        <p className="text-stone-400 italic text-sm">© 2026 Eaton Ash Journal. All biological data encrypted via ZK-Protocol.</p>
      </footer>

    </div>
  );
}