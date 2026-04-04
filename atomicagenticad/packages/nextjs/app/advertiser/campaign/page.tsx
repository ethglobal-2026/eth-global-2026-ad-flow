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
    const interval = setInterval(() => {
      setImpressions(prev => Math.min(prev + Math.floor(Math.random() * 3) + 1, 50000));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const pct = (impressions / 50000) * 100;
  const spent = ((impressions / 1000) * 4).toFixed(2);
  const remaining = (200 - parseFloat(spent)).toFixed(2);
  const impressionsRemaining = 50000 - impressions;

  return (
    <div className="adflow">
      <Topbar variant="advertiser" activeTab="campaigns" walletBalance={`$${remaining}`} />
      <div className="container" style={{ paddingTop: "32px", paddingBottom: "48px" }}>
        <div className="campaign-header">
          <div>
            <div className="campaign-title">Campaign: BeanBox Coffee</div>
            <div style={{ color: "var(--text-dim)", fontSize: "0.9rem", marginTop: "4px" }}>
              arabicacoffee.blog · Started April 3, 2026
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <span className="badge badge-green">Active</span>
            <button className="btn btn-secondary btn-sm">Pause Campaign</button>
          </div>
        </div>

        {/* Live Impressions */}
        <div className="card impression-display">
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "12px",
            }}
          >
            Impressions Delivered
          </div>
          <div className="impression-count">{impressions.toLocaleString()}</div>
          <div className="impression-total">of 50,000 purchased</div>
          <div className="progress-bar" style={{ maxWidth: "400px", margin: "20px auto 0", height: "12px" }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          <div className="card stat-card">
            <div className="stat-value" style={{ color: "var(--accent)" }}>
              ${remaining}
            </div>
            <div className="stat-label">Remaining in Escrow</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">${spent}</div>
            <div className="stat-label">Paid to Publisher</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">$4.00</div>
            <div className="stat-label">CPM (Cost per 1K)</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{impressionsRemaining.toLocaleString()}</div>
            <div className="stat-label">Impressions Remaining</div>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <span className="card-title">Payment Release History</span>
            <span className="badge badge-blue">Streaming</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginBottom: "16px" }}>
            Payments auto-release per 1,000 impressions verified by Chainlink CRE
          </div>
          <ul className="timeline">
            {TIMELINE.map(item => (
              <li key={item.batch} className="timeline-item">
                <div className="timeline-dot">✓</div>
                <div className="timeline-content">
                  <div className="timeline-title">
                    1,000 impressions verified — <span className="timeline-amount">$4.00 released</span>
                  </div>
                  <div className="timeline-meta">
                    Batch {item.batch} · {item.time}
                  </div>
                </div>
              </li>
            ))}
            <li className="timeline-item">
              <div className="timeline-dot" style={{ fontSize: "0.7rem" }}>
                ...
              </div>
              <div className="timeline-content">
                <div className="timeline-title" style={{ color: "var(--text-dim)" }}>
                  18 earlier batches
                </div>
                <div className="timeline-meta">April 3–4, 2026</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Verification Info */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Impression Verification</span>
            <span className="badge badge-green">Chainlink CRE</span>
          </div>
          <div className="order-summary" style={{ margin: 0 }}>
            {[
              { label: "Verification Method", value: "CDN Server-Side Logging" },
              { label: "Oracle", value: "Chainlink CRE (Confidential Compute)" },
              { label: "Last Verified", value: "2 minutes ago" },
              { label: "Escrow Contract", value: "0xAdFl...0wEscr0w", mono: true },
              { label: "Dispute Status", value: "None", accent: true },
            ].map(row => (
              <div key={row.label} className="order-row">
                <span className="label">{row.label}</span>
                <span
                  className="value"
                  style={{
                    ...(row.mono ? { fontFamily: "monospace", fontSize: "0.85rem" } : {}),
                    ...(row.accent ? { color: "var(--accent)" } : {}),
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDashboard;
