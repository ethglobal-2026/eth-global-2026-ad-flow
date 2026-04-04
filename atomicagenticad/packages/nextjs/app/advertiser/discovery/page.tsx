"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { AgentLoader } from "~~/components/adflow/AgentLoader";
import { Topbar } from "~~/components/adflow/Topbar";

const AGENT_LINES = [
  'Parsing campaign brief...',
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
    match: "97% match",
    desc: "Deep-dive content on Arabic coffee culture, traditional brewing methods, single-origin bean reviews, and specialty coffee guides.",
    tags: ["Arabic Coffee", "Brewing Guides", "Bean Reviews", "Coffee Culture"],
    stats: [
      { label: "Price / 1K", value: "$4.00" },
      { label: "Available", value: "50,000 impr." },
      { label: "Monthly Traffic", value: "~12K" },
      { label: "Quality", value: "8.4", accent: true },
    ],
    reason:
      "Exact category match — site focuses exclusively on Arabic coffee culture and specialty brewing. Audience demographics align (25-45 coffee enthusiasts). High content quality score. Price within budget at $4.00 CPM.",
  },
  {
    icon: "🌱",
    name: "Specialty Roasters Weekly",
    url: "specialtyroasters.co",
    match: "82% match",
    desc: "Weekly newsletter and blog covering specialty coffee roasters worldwide, industry news, and cupping scores.",
    tags: ["Specialty Coffee", "Roasters", "Industry News"],
    stats: [
      { label: "Price / 1K", value: "$5.50" },
      { label: "Available", value: "30,000 impr." },
      { label: "Monthly Traffic", value: "~8K" },
      { label: "Quality", value: "7.9", accent: true },
    ],
    reason:
      "Strong category overlap — specialty coffee focus with engaged reader base. Slightly higher CPM but excellent audience engagement metrics. Not exclusively Arabic coffee.",
  },
  {
    icon: "🫺",
    name: "Middle Eastern Flavors",
    url: "meflavors.com",
    match: "71% match",
    desc: "Recipes, culture, and traditions around Middle Eastern cuisine including coffee, tea, and traditional beverages.",
    tags: ["Middle Eastern", "Cuisine", "Coffee & Tea", "Recipes"],
    stats: [
      { label: "Price / 1K", value: "$3.00" },
      { label: "Available", value: "80,000 impr." },
      { label: "Monthly Traffic", value: "~22K" },
      { label: "Quality", value: "7.2", accent: true },
    ],
    reason:
      "Broader food site but has significant Arabic coffee content section. Lower CPM with higher traffic. Good for volume but less targeted than top match.",
  },
];

const Discovery: NextPage = () => {
  const router = useRouter();
  const [searching, setSearching] = useState(true);

  return (
    <div className="adflow">
      <Topbar variant="advertiser" activeTab="discovery" walletBalance="$500.00" />
      <div className="container" style={{ paddingTop: "32px", paddingBottom: "48px" }}>
        {searching ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h1 style={{ fontSize: "1.5rem", color: "var(--white)", marginBottom: "8px" }}>
                Agent is Finding Publishers
              </h1>
              <p style={{ color: "var(--text-dim)" }}>
                Searching marketplace for sites matching your campaign brief...
              </p>
            </div>
            <AgentLoader
              lines={AGENT_LINES}
              msPerLine={600}
              onComplete={() => setSearching(false)}
            />
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <h1 style={{ fontSize: "1.5rem", color: "var(--white)", marginBottom: "4px" }}>
                  3 Publishers Found
                </h1>
                <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
                  Ranked by relevance to: &quot;Arabic coffee, specialty brewing, coffee culture&quot;
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSearching(true)}>
                Refine Search
              </button>
            </div>

            <div className="discovery-grid">
              {PUBLISHERS.map(pub => (
                <div key={pub.url} className="pub-card" onClick={() => router.push("/advertiser/transaction")}>
                  <div className="pub-card-header">
                    <div className="pub-card-site">
                      <div className="pub-card-favicon">{pub.icon}</div>
                      <div>
                        <div className="pub-card-name">{pub.name}</div>
                        <div className="pub-card-url">{pub.url}</div>
                      </div>
                    </div>
                    <div className="match-score">{pub.match}</div>
                  </div>
                  <div className="pub-card-body">
                    <div className="pub-card-desc">{pub.desc}</div>
                    <div className="pub-card-tags">
                      {pub.tags.map(tag => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pub-card-stats">
                    {pub.stats.map(s => (
                      <div key={s.label}>
                        <span className="label">{s.label}</span>
                        <span className="value" style={s.accent ? { color: "var(--accent)" } : {}}>
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pub-card-reason">
                    <strong>Agent Reasoning</strong>
                    {pub.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discovery;
