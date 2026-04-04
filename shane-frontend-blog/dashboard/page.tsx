'use client';

import { useState, useEffect } from 'react';

export default function PublisherDashboard() {
  const [mounted, setMounted] = useState(false);
  const [adHeadline, setAdHeadline] = useState("No Active Campaign");
  
  // AI Scan States
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matchScore, setMatchScore] = useState(92.4);

  // Withdrawal Modal State
  const [showModal, setShowModal] = useState(false);
  const [txHash] = useState("0x74a9b2c5d8e1f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f");

  // --- 關鍵修改：同步邏輯 ---
  useEffect(() => {
    setMounted(true);
    const syncData = () => {
      // 修改為 ADFLOW_SYNC_H 以確保全線同步
      const savedH = window.localStorage.getItem('ADFLOW_SYNC_H');
      if (savedH) setAdHeadline(savedH);
    };
    
    syncData();
    // 監聽窗口焦點，切換回來到這個頁面時自動刷新數據
    window.addEventListener('focus', syncData);
    return () => window.removeEventListener('focus', syncData);
  }, []);

  const handleDeepScan = () => {
    setIsScanning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setMatchScore(99.8);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-20 relative">
      
      {/* 1. Navigation */}
      <nav className="bg-white border-b border-stone-200 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-100">EA</div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-emerald-900 italic">Publisher Console</h1>
          </div>
          <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-[0.2em]">
            Node Status: Active
          </div>
        </div>
      </nav>

      {/* 2. Main Content */}
      <main className="max-w-6xl mx-auto py-12 px-6 space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter">Earnings Overview</h2>
            <p className="text-stone-500 italic font-serif text-lg leading-relaxed">Monitoring content monetization performance for <span className="text-emerald-900 font-bold">Eaton Ash</span>.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto bg-emerald-900 text-white px-10 py-5 rounded-2xl font-black text-sm shadow-2xl shadow-emerald-100 hover:bg-emerald-800 transition-all active:scale-95"
          >
            Withdraw to Wallet
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[40px] border border-stone-100 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Total Payout</p>
            <p className="text-4xl font-black text-emerald-600">$1,740.50 <span className="text-xs text-stone-300">USDC</span></p>
          </div>
          <div className="bg-white p-10 rounded-[40px] border border-stone-100 shadow-sm relative overflow-hidden transition-transform hover:scale-[1.02]">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Match Precision</p>
            <p className="text-4xl font-black text-stone-900">{matchScore}%</p>
            {isScanning && (
              <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-100" style={{ width: `${progress}%` }} />
            )}
          </div>
          <div className="bg-white p-10 rounded-[40px] border border-stone-100 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Network Trust</p>
            <p className="text-4xl font-black text-blue-500">Tier A+</p>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-emerald-950 text-white rounded-[48px] p-12 shadow-[0_32px_64px_rgba(6,78,59,0.2)] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-3xl font-black tracking-tight italic">AI Agent Insight</h3>
                {isScanning && <span className="text-[10px] bg-emerald-500 px-3 py-1 rounded-full animate-pulse font-bold">SCANNING_LOCAL_CONTENT...</span>}
              </div>
              <p className="text-emerald-100/70 text-lg leading-relaxed font-medium">
                Matching for: <span className="text-white font-bold underline decoration-emerald-500 underline-offset-4">#Keto #MetabolicHealth #Biohacking</span>. <br/>
                Active Ad: <span className="italic text-emerald-400 font-black">"{adHeadline}"</span>. 
              </p>
              
              {!isScanning && progress === 0 ? (
                <button 
                  onClick={handleDeepScan}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  ⚡ Execute Deep Context Scan
                </button>
              ) : isScanning ? (
                <div className="w-full max-w-xs space-y-3">
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 animate-pulse">Computing Privacy Weights...</p>
                </div>
              ) : (
                <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest inline-block">
                  ✓ High-Accuracy Match Confirmed (+8.2% CPM)
                </div>
              )}
            </div>
            <div className="text-center bg-white/5 p-10 rounded-[40px] border border-white/10 min-w-[200px]">
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-50 mb-2">Revenue Multiplier</p>
              <p className="text-6xl font-black tracking-tighter">{matchScore > 95 ? '1.8x' : '1.5x'}</p>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-4">
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-[0.3em]">Ledger History</h3>
            <span className="text-[10px] text-stone-300 font-bold italic underline">Verified on AdFlow-Chain</span>
          </div>
          <div className="bg-white rounded-[48px] border border-stone-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-[10px] font-black uppercase text-stone-400 border-b border-stone-100">
                  <th className="px-12 py-7">Timestamp</th>
                  <th className="px-12 py-7">Campaign Identity</th>
                  <th className="px-12 py-7 text-right">Settlement Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold">
                <tr className="border-b border-stone-50 group hover:bg-stone-50/50 transition-colors">
                  <td className="px-12 py-10 text-stone-400">Apr 04, 2026</td>
                  <td className="px-12 py-10 text-stone-900 font-black italic">{adHeadline}</td>
                  <td className="px-12 py-10 text-right text-emerald-600 text-lg">+ 500.00 USDC</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* --- 🎁 提現彈窗 (WITHDRAWAL MODAL) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xl" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-white rounded-[60px] p-12 max-w-md w-full shadow-[0_32px_128px_rgba(0,0,0,0.4)] border border-stone-100 text-center space-y-8 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-5xl shadow-inner animate-bounce">
              ✓
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-stone-950 tracking-tighter italic">Transfer Initiated</h3>
              <p className="text-stone-500 text-lg leading-relaxed font-medium">
                Your <span className="text-stone-950 font-bold underline decoration-emerald-500 underline-offset-4">1,740.50 USDC</span> is being settled on-chain.
              </p>
            </div>
            <div className="bg-stone-50 p-6 rounded-[32px] border border-stone-100 text-left">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Transaction Hash</p>
              <p className="text-xs font-mono text-emerald-600 break-all leading-relaxed font-black select-all">
                {txHash}
              </p>
            </div>
            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-emerald-950 text-white py-6 rounded-[28px] font-black text-lg hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-100 active:scale-95"
            >
              Great, thanks!
            </button>
          </div>
        </div>
      )}

      <footer className="py-20 text-center">
        <p className="text-[11px] font-black text-stone-300 uppercase tracking-[0.5em] italic">AdFlow Protocol Management Console • Eaton Ash</p>
      </footer>
    </div>
  );
}
