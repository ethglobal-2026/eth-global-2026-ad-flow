'use client';

import { useState, useEffect } from 'react';

// 🤖 Cyber-Droid Component (Safe & Shiny)
const CyberDroid = () => (
  <div className="relative w-10 h-10 flex flex-col items-center justify-center animate-bounce">
    <div className="w-8 h-7 bg-cyan-500/20 border-2 border-cyan-400 rounded-lg relative shadow-[0_0_15px_#22d3ee]">
      <div className="flex justify-around mt-1.5 px-1">
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
      </div>
    </div>
    <div className="w-3 h-1 bg-cyan-500/40 rounded-full blur-sm mt-1" />
  </div>
);

export default function TechBlog() {
  const [ad, setAd] = useState<{ h: string; d: string } | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
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

  if (!hasMounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30">
      
      {/* Background Neon Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-cyan-900/30 px-8 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <CyberDroid />
            <h1 className="font-black text-xl tracking-tighter uppercase italic text-white">Eaton <span className="text-cyan-400">Ash</span> Tech</h1>
          </div>
          <div className="font-mono text-[10px] font-bold text-cyan-900 tracking-[0.3em] uppercase">
            Protocol_v2.4 // Edge_Node_Active
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-20 px-6 space-y-24 relative z-10">
        
        {/* Header Section */}
        <header className="space-y-6">
          <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-bold uppercase tracking-widest">
            Core_Research_Log
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none text-white uppercase">
            Recursive <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">SNARKs.</span>
          </h1>
          <p className="text-xl text-slate-500 font-serif italic max-w-2xl leading-relaxed">
            "The transition to Edge-Verification is not a choice; it is the final frontier of digital sovereignty."
          </p>
        </header>

        {/* Safe Code Block */}
        <div className="p-10 bg-slate-950 border border-slate-900 rounded-3xl space-y-4 shadow-2xl">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 border-b border-slate-900 pb-4">
            <span>adflow_core.rs</span>
            <span className="text-cyan-900">RUST_STABLE</span>
          </div>
          <div className="font-mono text-sm text-cyan-100/70 space-y-1">
            <p className="text-slate-700">// Initializing recursive proof circuit</p>
            <p className="text-cyan-500">#[derive(ZK_Circuit)]</p>
            <p className="text-white">pub struct AdMatchProtocol (</p>
            <p className="pl-6">user_vector: PrivateInput,</p>
            <p className="pl-6">ad_metadata: PublicInput,</p>
            <p className="text-white">);</p>
          </div>
        </div>

        {/* 🚀 AD MODULE: Logical Connection with Teammate */}
        {ad ? (
          /* Case A: Ad Data Exists (Shiny & Glowing) */
          <section className="relative p-12 md:p-20 bg-cyan-500/[0.03] border-2 border-cyan-400/30 rounded-[50px] overflow-hidden group shadow-[0_0_50px_rgba(34,211,238,0.1)] transition-all hover:border-cyan-400">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] -mr-40 -mt-40" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em] font-black text-white/50">Live_Network_Match_Success</span>
              </div>
              <h3 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
                {ad.h}
              </h3>
              <p className="text-slate-400 text-lg max-w-2xl">
                {ad.d}
              </p>
              <button className="bg-cyan-500 text-black px-12 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white hover:shadow-[0_0_20px_#22d3ee] transition-all">
                Execute_Handshake();
              </button>
            </div>
          </section>
        ) : (
          /* Case B: Default/Empty State (teammate hasn't uploaded yet) */
          <section className="p-16 border-2 border-dashed border-slate-800 rounded-[50px] flex flex-col items-center justify-center text-center space-y-6 opacity-40 hover:opacity-80 transition-all">
            <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center animate-spin-slow text-slate-700 font-mono">+</div>
            <div className="space-y-2">
              <h4 className="font-mono text-[10px] font-black text-slate-600 uppercase tracking-widest">Waiting_For_Ad_Signal</h4>
              <p className="text-slate-500 italic max-w-sm">
                "Load your campaign from the Advertiser Portal to activate ZK-Sync."
              </p>
            </div>
          </section>
        )}

        {/* Footer Text */}
        <article className="text-slate-600 italic text-xl border-t border-slate-900 pt-16">
          Further implementations of these folding schemes will eventually allow for 100% data locality in browser-based systems...
        </article>
      </main>

      <footer className="py-32 text-center opacity-20 border-t border-slate-900 mt-20">
        <p className="font-mono text-[9px] uppercase tracking-[1em]">End_of_Transmission // 2026</p>
      </footer>

    </div>
  );
}