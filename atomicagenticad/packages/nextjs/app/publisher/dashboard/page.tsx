"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const PublisherDashboard: NextPage = () => {
  const [tickerAmount, setTickerAmount] = useState(142.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerAmount(prev => prev + 0.004 * Math.random());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const whole = Math.floor(tickerAmount);
  const dec = Math.floor((tickerAmount - whole) * 100)
    .toString()
    .padStart(2, "0");

  return (
    <div className="adflow">
      <Topbar variant="publisher" activeTab="dashboard" walletBalance={`$${tickerAmount.toFixed(2)}`} />
      <div className="container" style={{ paddingTop: "32px", paddingBottom: "48px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--white)" }}>Publisher Dashboard</h1>
            <p style={{ color: "var(--text-dim)", marginTop: "4px" }}>arabicacoffee.blog</p>
          </div>
          <span className="badge badge-green">Listing Active</span>
        </div>

        {/* Revenue Ticker */}
        <div className="card" style={{ marginBottom: "24px", textAlign: "center", padding: "32px" }}>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px",
            }}
          >
            Total Revenue Earned
          </div>
          <div className="streaming-ticker">
            <span className="ticker-symbol">$</span>
            <span>{whole}</span>
            <span className="ticker-decimals">.{dec}</span>
            <span className="ticker-symbol" style={{ marginLeft: "4px" }}>
              USDC
            </span>
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginTop: "8px" }}>
            Streaming in real-time as impressions are served
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid">
          {[
            { value: "35,700", label: "Impressions Served" },
            { value: "$4.00", label: "Price / 1K Impressions" },
            { value: "2", label: "Active Campaigns" },
            { value: "$57.20", label: "Remaining in Escrow" },
          ].map(s => (
            <div key={s.label} className="card stat-card">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active Campaigns */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Active Campaigns</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Advertiser</th>
                  <th>Impressions</th>
                  <th>Progress</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong style={{ color: "var(--white)" }}>BeanBox Coffee Co.</strong>
                    <br />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>E-commerce — Coffee subscriptions</span>
                  </td>
                  <td>22,400 / 50,000</td>
                  <td>
                    <div className="progress-bar" style={{ width: "120px" }}>
                      <div className="progress-fill" style={{ width: "44.8%" }} />
                    </div>
                  </td>
                  <td style={{ color: "var(--accent)", fontWeight: 600 }}>$89.60</td>
                  <td>
                    <span className="badge badge-green">Active</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style={{ color: "var(--white)" }}>BrewMaster App</strong>
                    <br />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>SaaS — Coffee brewing assistant</span>
                  </td>
                  <td>13,300 / 25,000</td>
                  <td>
                    <div className="progress-bar" style={{ width: "120px" }}>
                      <div className="progress-fill" style={{ width: "53.2%" }} />
                    </div>
                  </td>
                  <td style={{ color: "var(--accent)", fontWeight: 600 }}>$53.20</td>
                  <td>
                    <span className="badge badge-green">Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublisherDashboard;
