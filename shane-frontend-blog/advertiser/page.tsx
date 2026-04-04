'use client';

import { useState } from 'react';

export default function AdvertiserPortal() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 預設內容
  const [headline, setHeadline] = useState("Pure Organic MCT Oil");
  const [description, setDescription] = useState("The cleanest energy source for those in ketosis. Triple-distilled C8 MCT oil.");

  const handleLaunch = () => {
    setLoading(true);
    
    // 🔥 核心修正：統一使用 ADFLOW_SYNC 系列的 Key
    localStorage.setItem('ADFLOW_SYNC_H', headline);
    localStorage.setItem('ADFLOW_SYNC_D', description);

    // 模擬智能合約交互
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900 pb-32">
      
      {/* Navigation */}
      <nav className="bg-white border-b border-stone-100 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black italic shadow-lg shadow-blue-100 text-xl">A</div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-blue-600">Advertiser Console</h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-stone-400 uppercase tracking-widest">
             <span>Escrow: 5,000.00 USDC</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="space-y-12">
          
          <header className="space-y-4">
            <h2 className="text-5xl font-black tracking-tighter">Broadcast Campaign</h2>
            <p className="text-stone-500 text-lg font-medium font-serif italic">Deploying to all decentralized nodes in the AdFlow network.</p>
          </header>

          <div className="bg-stone-50 rounded-[40px] p-10 md:p-16 border border-stone-100 space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400 pl-1">Ad Headline</label>
                <input 
                  type="text" 
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full p-5 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-stone-900 text-lg"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400 pl-1">Targeting Protocol</label>
                <div className="w-full p-5 bg-stone-200/50 border border-stone-200 rounded-2xl text-stone-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Cross-Niche AI Matching
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400 pl-1">Campaign Description</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-5 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-stone-900"
                />
              </div>
            </div>

            <div className="pt-10 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Network Reach</p>
                <p className="text-3xl font-black text-blue-600 tracking-tighter underline decoration-blue-100 underline-offset-8">Global Multi-Site Sync</p>
              </div>
              
              {!success ? (
                <button 
                  onClick={handleLaunch}
                  disabled={loading}
                  className="w-full md:w-auto bg-blue-600 text-white px-12 py-6 rounded-[24px] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 active:scale-95 disabled:opacity-50 text-lg"
                >
                  {loading ? 'Executing Contract...' : 'Deploy to Network (500 USDC)'}
                </button>
              ) : (
                <div className="bg-emerald-500 text-white px-12 py-6 rounded-[24px] font-black shadow-xl flex items-center gap-3 animate-in zoom-in text-lg">
                  <span>✓</span> SUCCESS: DATA SYNCED
                </div>
              )}
            </div>

          </div>

          <p className="text-center text-[10px] text-stone-300 font-bold uppercase tracking-[0.4em]">
            Zero-Knowledge Ad Distribution Layer • Powered by AdFlow
          </p>
        </div>
      </main>
    </div>
  );
}