"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { WalletModal } from "~~/components/adflow/WalletModal";
import { Topbar } from "~~/components/adflow/Topbar";

const Transaction: NextPage = () => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <div className="adflow">
      <Topbar variant="advertiser" activeTab="order" walletBalance="$500.00" />
      <div className="container-sm" style={{ paddingTop: "48px", paddingBottom: "48px" }}>
        {!success ? (
          <>
            <h1 style={{ fontSize: "1.5rem", color: "var(--white)", marginBottom: "8px" }}>Review Order</h1>
            <p style={{ color: "var(--text-dim)", marginBottom: "24px" }}>
              Confirm your campaign details before funding the escrow.
            </p>

            <div className="card" style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div className="pub-card-favicon">☕</div>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--white)" }}>Arabica Coffee Blog</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>arabicacoffee.blog</div>
                </div>
                <div className="match-score" style={{ marginLeft: "auto" }}>
                  97% match
                </div>
              </div>
            </div>

            <div className="order-summary">
              {[
                { label: "Impressions", value: "50,000" },
                { label: "Price per 1,000 impressions", value: "$4.00" },
                { label: "Ad Format", value: "Banner (728x90)" },
                { label: "Payment Method", value: "USDC (Streaming)" },
                { label: "Settlement", value: "Per 1,000 impressions" },
              ].map(row => (
                <div key={row.label} className="order-row">
                  <span className="label">{row.label}</span>
                  <span className="value">{row.value}</span>
                </div>
              ))}
              <div className="order-row order-total">
                <span className="label" style={{ fontWeight: 600 }}>
                  Total Escrow Amount
                </span>
                <span className="value">$200.00 USDC</span>
              </div>
            </div>

            <div
              style={{
                background: "var(--accent-dim)",
                borderRadius: "var(--radius-sm)",
                padding: "16px",
                marginBottom: "24px",
                fontSize: "0.85rem",
                color: "var(--accent)",
                lineHeight: 1.5,
              }}
            >
              Funds will be locked in a smart contract escrow. Payments stream to the publisher as impressions are
              verified by Chainlink CRE. You can pause or dispute at any time.
            </div>

            <button
              className="btn btn-primary btn-block btn-large"
              onClick={() => setModalOpen(true)}
            >
              Fund Escrow — $200.00 USDC
            </button>
            <button
              className="btn btn-ghost btn-block"
              style={{ marginTop: "12px" }}
              onClick={() => router.push("/advertiser/discovery")}
            >
              Back to Results
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="success-check">✓</div>
            <h2 style={{ color: "var(--white)", marginBottom: "8px" }}>Escrow Funded!</h2>
            <p style={{ color: "var(--text-dim)", marginBottom: "8px" }}>$200.00 USDC locked in smart contract</p>
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: "32px" }}>
              Campaign will begin serving immediately. Payments stream per 1,000 impressions.
            </p>
            <div
              style={{
                background: "var(--navy)",
                borderRadius: "var(--radius-sm)",
                padding: "16px",
                marginBottom: "32px",
                fontFamily: "monospace",
                fontSize: "0.8rem",
                color: "var(--text-dim)",
                wordBreak: "break-all",
              }}
            >
              Tx: 0x8f3a...7b2e4d91c6f0a3e8
              <br />
              Contract: 0xAdFl...0wEscr0w
              <br />
              Block: 18,442,691
            </div>
            <button className="btn btn-primary btn-large" onClick={() => router.push("/advertiser/campaign")}>
              View Campaign Dashboard
            </button>
          </div>
        )}
      </div>

      <WalletModal
        isOpen={modalOpen}
        amount="200.00"
        fromAddress="0x4b2e...a81f"
        onClose={() => setModalOpen(false)}
        onSuccess={() => setSuccess(true)}
      />
    </div>
  );
};

export default Transaction;
