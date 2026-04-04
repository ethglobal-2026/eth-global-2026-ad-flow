"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const PAYMENTS = [
  { from: "BeanBox Coffee Co.", amount: "+$4.00", batch: "#22 (1K impr.)", time: "2 min ago" },
  { from: "BrewMaster App", amount: "+$4.00", batch: "#13 (1K impr.)", time: "8 min ago" },
  { from: "BeanBox Coffee Co.", amount: "+$4.00", batch: "#21 (1K impr.)", time: "29 min ago" },
  { from: "BeanBox Coffee Co.", amount: "+$4.00", batch: "#20 (1K impr.)", time: "54 min ago" },
];

const PublisherWallet: NextPage = () => {
  const [amount, setAmount] = useState(142.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setAmount(prev => prev + 0.004 * Math.random());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const whole = Math.floor(amount);
  const dec = Math.floor((amount - whole) * 100)
    .toString()
    .padStart(2, "0");

  return (
    <div className="adflow">
      <Topbar variant="publisher" activeTab="wallet" />
      <div className="container-sm" style={{ paddingTop: "32px", paddingBottom: "48px" }}>
        <div className="wallet-big-balance">
          <div className="currency">Total Earned</div>
          <div className="streaming-ticker" style={{ justifyContent: "center" }}>
            <span className="ticker-symbol">$</span>
            <span>{whole}</span>
            <span className="ticker-decimals">.{dec}</span>
            <span className="ticker-symbol" style={{ marginLeft: "4px" }}>
              USDC
            </span>
          </div>
          <div className="wallet-address" style={{ marginTop: "16px" }}>
            0x7a3f2b01...e4c92d <span style={{ cursor: "pointer" }}>📋</span>
          </div>
        </div>

        <div className="stat-grid" style={{ marginBottom: "32px" }}>
          <div className="card stat-card">
            <div className="stat-value" style={{ color: "var(--accent)" }}>
              ${amount.toFixed(2)}
            </div>
            <div className="stat-label">Received</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value" style={{ color: "var(--blue)" }}>
              $57.20
            </div>
            <div className="stat-label">Pending in Escrow</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Payments</span>
            <span className="badge badge-green">Streaming</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>Amount</th>
                  <th>Batch</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENTS.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: "0.85rem" }}>{p.from}</td>
                    <td style={{ color: "var(--accent)", fontWeight: 600 }}>{p.amount}</td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>{p.batch}</td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>{p.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublisherWallet;
