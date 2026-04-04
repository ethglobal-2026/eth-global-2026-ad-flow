"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { AgentLoader } from "~~/components/adflow/AgentLoader";
import { Topbar } from "~~/components/adflow/Topbar";
import type { AdvertiserCampaignSessionSummary } from "~~/types/adflow";

const AGENT_LINES = [
  "Parsing campaign brief...",
  'Keywords: "Arabic coffee", "specialty brewing", "coffee culture"',
  "Audience: English-language, ages 25-45, coffee enthusiasts",
  "Budget: $200 USDC — Target: 50,000 impressions",
  "Searching marketplace for matching publishers...",
  "Found 12 candidates — filtering by relevance...",
  "Running compatibility checks with publisher agents...",
  "Publisher agent @ arabicacoffee.blog: APPROVED",
  "Publisher agent @ specialtyroasters.co: APPROVED",
  "Publisher agent @ meflavors.com: APPROVED",
  "3 publishers passed dual-agent verification.",
];

type Publisher = {
  icon: string;
  name: string;
  url: string;
  match: string;
  desc: string;
  tags: string[];
  stats: { label: string; value: string; accent?: boolean }[];
  reason: string;
};

const PUBLISHERS: Publisher[] = [
  {
    icon: "☕",
    name: "Arabica Coffee Blog",
    url: "arabicacoffee.blog",
    match: "97%",
    desc: "Deep-dive content on Arabic coffee culture, traditional brewing methods, single-origin bean reviews, and specialty coffee guides.",
    tags: ["Arabic Coffee", "Brewing Guides", "Bean Reviews", "Coffee Culture"],
    stats: [
      { label: "Price / 1K", value: "$4.00" },
      { label: "Available", value: "50K impr." },
      { label: "Traffic", value: "~12K/mo" },
      { label: "Quality", value: "8.4", accent: true },
    ],
    reason:
      "Exact category match — site focuses exclusively on Arabic coffee culture. Audience demographics align. High quality score. Price within budget at $4.00 CPM.",
  },
  {
    icon: "🌱",
    name: "Specialty Roasters Weekly",
    url: "specialtyroasters.co",
    match: "82%",
    desc: "Weekly newsletter covering specialty coffee roasters worldwide, industry news, and cupping scores.",
    tags: ["Specialty Coffee", "Roasters", "Industry News"],
    stats: [
      { label: "Price / 1K", value: "$5.50" },
      { label: "Available", value: "30K impr." },
      { label: "Traffic", value: "~8K/mo" },
      { label: "Quality", value: "7.9", accent: true },
    ],
    reason:
      "Strong category overlap with engaged reader base. Slightly higher CPM but excellent audience engagement. Not exclusively Arabic coffee.",
  },
  {
    icon: "🫺",
    name: "Middle Eastern Flavors",
    url: "meflavors.com",
    match: "71%",
    desc: "Recipes and culture around Middle Eastern cuisine including coffee, tea, and traditional beverages.",
    tags: ["Middle Eastern", "Cuisine", "Coffee & Tea", "Recipes"],
    stats: [
      { label: "Price / 1K", value: "$3.00" },
      { label: "Available", value: "80K impr." },
      { label: "Traffic", value: "~22K/mo" },
      { label: "Quality", value: "7.2", accent: true },
    ],
    reason:
      "Broader food site with significant Arabic coffee section. Lower CPM with higher traffic. Good for volume but less targeted.",
  },
];

const DEFAULT_BRIEF_SNIPPET = "Arabic coffee, specialty brewing, coffee culture";

const Discovery: NextPage = () => {
  const router = useRouter();
  const [searching, setSearching] = useState(true);
  const [briefSnippet, setBriefSnippet] = useState(DEFAULT_BRIEF_SNIPPET);

  useEffect(() => {
    const raw = sessionStorage.getItem("adflow_advertiser_campaign");
    if (!raw) return;
    try {
      const c = JSON.parse(raw) as AdvertiserCampaignSessionSummary;
      const text = [c.productDescription, c.targetAudience].filter(Boolean).join(" · ");
      if (text.trim()) {
        const max = 120;
        setBriefSnippet(text.length > max ? `${text.slice(0, max)}…` : text);
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" activeTab="discovery" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {searching ? (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-base-content">Agent is Finding Publishers</h1>
              <p className="text-base-content/60 mt-2 m-0">
                Searching marketplace for sites matching your campaign brief...
              </p>
            </div>
            <AgentLoader lines={AGENT_LINES} msPerLine={600} onComplete={() => setSearching(false)} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-base-content">3 Publishers Found</h1>
                <p className="text-base-content/60 text-sm mt-1 m-0">
                  Ranked by relevance to: &quot;{briefSnippet}&quot;
                </p>
              </div>
              <button className="btn btn-outline btn-primary btn-sm" onClick={() => setSearching(true)}>
                Refine Search
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {PUBLISHERS.map(pub => (
                <div
                  key={pub.url}
                  className="card bg-base-100 border border-base-300 cursor-pointer hover:border-primary hover:-translate-y-0.5 transition-all overflow-hidden"
                  onClick={() => router.push("/advertiser/transaction")}
                >
                  <div className="p-5 pb-0 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-base-300 flex items-center justify-center text-xl">
                        {pub.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-base-content">{pub.name}</div>
                        <div className="text-xs text-base-content/50">{pub.url}</div>
                      </div>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md">
                      {pub.match} match
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-base-content/60 leading-relaxed mb-3 m-0">{pub.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pub.tags.map(tag => (
                        <span key={tag} className="badge badge-ghost badge-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-6 px-5 py-4 border-t border-base-300">
                    {pub.stats.map(s => (
                      <div key={s.label} className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-base-content/40">{s.label}</span>
                        <span className={`font-semibold text-sm ${s.accent ? "text-primary" : "text-base-content"}`}>
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-3 bg-primary/10 border-t border-primary/10 text-sm text-primary">
                    <span className="block text-[10px] uppercase tracking-wider mb-1 font-bold opacity-70">
                      Agent Reasoning
                    </span>
                    {pub.reason}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Discovery;
