"use client";

import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const TRANSACTIONS = [
  {
    type: "Escrow",
    badgeClass: "badge-orange",
    amount: "-$200.00",
    amountColor: "var(--red)",
    details: "Campaign: BeanBox → arabicacoffee.blog",
    date: "Apr 3, 2026",
  },
  {
    type: "Deposit",
    badgeClass: "badge-green",
    amount: "+$500.00",
    amountColor: "var(--accent)",
    details: "USDC deposit from external wallet",
    date: "Apr 3, 2026",
  },
];

const AdvertiserWallet: NextPage = () => (
  <div className="adflow">
    <Topbar variant="advertiser" activeTab="wallet" />
    <div className="container-sm" style={{ paddingTop: "32px", paddingBottom: "48px" }}>
      <div className="wallet-big-balance">
        <div className="currency">Available Balance</div>
        <div className="amount">
          $300.00 <span style={{ fontSize: "1.2rem", color: "var(--text-dim)", fontWeight: 400 }}>USDC</span>
        </div>
        <div className="wallet-address">
          0x4b2e8f91...da3a81f <span style={{ cursor: "pointer" }}>📋</span>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: "32px" }}>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: "var(--orange)" }}>
            $200.00
          </div>
          <div className="stat-label">In Escrow</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">$300.00</div>
          <div className="stat-label">Available</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Transaction History</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Details</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((tx, i) => (
                <tr key={i}>
                  <td>
                    <span className={`badge ${tx.badgeClass}`}>{tx.type}</span>
                  </td>
                  <td style={{ color: tx.amountColor, fontWeight: 600 }}>{tx.amount}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>{tx.details}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export default AdvertiserWallet;
