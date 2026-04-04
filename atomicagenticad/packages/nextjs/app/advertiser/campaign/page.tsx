"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const TIMELINE = [
  { batch: "#22", time: "April 4, 2026 at 2:14 PM" },
  { batch: "#21", time: "April 4, 2026 at 1:47 PM" },
  { batch: "#20", time: "April 4, 2026 at 1:12 PM" },
  { batch: "#19", time: "April 4, 2026 at 12:38 PM" },
];

const CampaignDashboard: NextPage = () => {
  const [impressions, setImpressions] = useState(22400);

  useEffect(() => {
    const interval = setInterval(
      () => setImpressions(prev => Math.min(prev + Math.floor(Math.random() * 3) + 1, 50000)),
      4000,
    );
    return () => clearInterval(interval);
  }, []);

  const pct = (impressions / 50000) * 100;
  const spent = ((impressions / 1000) * 4).toFixed(2);
  const remaining = (200 - parseFloat(spent)).toFixed(2);

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" activeTab="campaigns" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-base-content">Campaign: BeanBox Coffee</h1>
            <p className="text-base-content/50 text-sm mt-1 m-0">arabicacoffee.blog · Started April 3, 2026</p>
          </div>
          <div className="flex gap-2 items-center">
            <span className="badge badge-success">Active</span>
            <button className="btn btn-outline btn-primary btn-sm">Pause Campaign</button>
          </div>
        </div>

        {/* Live Impressions */}
        <div className="card bg-base-100 border border-base-300 text-center p-8 mb-6">
          <p className="text-xs uppercase tracking-widest text-base-content/40 mb-3 m-0">Impressions Delivered</p>
          <div className="text-6xl font-extrabold tabular-nums text-base-content">{impressions.toLocaleString()}</div>
          <p className="text-base-content/50 mt-1 mb-4 m-0">of 50,000 purchased</p>
          <progress className="progress progress-primary max-w-sm mx-auto h-3" value={pct} max={100} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { value: `$${remaining}`, label: "Remaining in Escrow", accent: true },
            { value: `$${spent}`, label: "Paid to Publisher" },
            { value: "$4.00", label: "CPM (Cost per 1K)" },
            { value: (50000 - impressions).toLocaleString(), label: "Impressions Remaining" },
          ].map(s => (
            <div key={s.label} className="card bg-base-100 border border-base-300 p-5 text-center">
              <div className={`text-3xl font-bold ${s.accent ? "text-primary" : "text-base-content"}`}>{s.value}</div>
              <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Payment Timeline */}
        <div className="card bg-base-100 border border-base-300 mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between mb-1">
              <h2 className="card-title">Payment Release History</h2>
              <span className="badge badge-info">Streaming</span>
            </div>
            <p className="text-sm text-base-content/50 mb-4 m-0">
              Payments auto-release per 1,000 impressions verified by the permissioned reporting service
            </p>
            <ul className="space-y-4">
              {TIMELINE.map(item => (
                <li key={item.batch} className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm shrink-0 z-10">
                    ✓
                  </div>
                  <div>
                    <div className="text-sm text-base-content font-medium">
                      1,000 impressions verified — <span className="text-primary font-semibold">$4.00 released</span>
                    </div>
                    <div className="text-xs text-base-content/40 mt-0.5">
                      Batch {item.batch} · {item.time}
                    </div>
                  </div>
                </li>
              ))}
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-base-content/40 text-xs shrink-0">
                  ...
                </div>
                <div className="text-sm text-base-content/40 self-center">18 earlier batches · April 3–4, 2026</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Verification */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <h2 className="card-title">Impression Verification</h2>
              <span className="badge badge-success">Permissioned Reporter</span>
            </div>
            <div className="bg-base-200 rounded-lg border border-base-300 divide-y divide-base-300">
              {[
                { label: "Verification Method", value: "CDN Server-Side Logging" },
                { label: "Oracle", value: "Permissioned Impression Oracle" },
                { label: "Last Verified", value: "2 minutes ago" },
                { label: "Escrow Contract", value: "0xAdFl...0wEscr0w", mono: true },
                { label: "Dispute Status", value: "None", accent: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-base-content/60">{row.label}</span>
                  <span
                    className={`font-medium ${(row as { mono?: boolean }).mono ? "font-mono text-xs" : ""} ${(row as { accent?: boolean }).accent ? "text-primary" : "text-base-content"}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDashboard;
