'use client';

import { useState } from 'react';

export default function AdFlowOnboarding() {
  const [siteUrl, setSiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalysis = async () => {
    if (!siteUrl) return;
    setLoading(true);
    
    try {
      const response = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: siteUrl }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to fetch analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-12">
      <div className="max-w-3xl mx-auto space-y-12">
        <header>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
            AdFlow Publisher Portal
          </h1>
          <p className="mt-4 text-gray-400 text-lg">AI-powered onboarding for the next generation of privacy ads.</p>
        </header>

        <section className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Publisher Site URL</label>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="https://your-technical-blog.com"
                className="flex-1 bg-zinc-950 border border-zinc-800 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
              />
              <button
                onClick={handleAnalysis}
                disabled={loading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {loading ? 'Agent Thinking...' : 'Start AI Analysis'}
              </button>
            </div>
          </div>

          {result && (
            <div className="pt-8 border-t border-zinc-800 animate-in fade-in zoom-in duration-500">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">Agent Analysis Complete</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase">Generated Site Name</h3>
                    <p className="text-lg">{result.site_name}</p>
                  </div>
                  <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase">Audience Profile</h3>
                    <p className="text-zinc-300">{result.audience}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase">Categories</h3>
                    <div className="flex gap-2 mt-1">
                      {result.categories.map((cat: string) => (
                        <span key={cat} className="px-3 py-1 bg-zinc-800 text-blue-300 text-xs rounded-full border border-zinc-700">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-zinc-500 text-xs font-bold uppercase">Suggested Floor Price</h3>
                    <p className="text-2xl font-mono text-green-400">${result.suggested_floor_cpm} USDC / 1k Imps</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}