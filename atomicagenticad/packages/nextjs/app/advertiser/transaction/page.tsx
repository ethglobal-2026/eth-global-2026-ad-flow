"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";
import { WalletModal } from "~~/components/adflow/WalletModal";

const ORDER_ROWS = [
  { label: "Impressions", value: "50,000" },
  { label: "Price per 1,000 impressions", value: "$4.00" },
  { label: "Ad Format", value: "Banner (728x90)" },
  { label: "Payment Method", value: "USDC (Streaming)" },
  { label: "Settlement", value: "Per 1,000 impressions" },
];

const Transaction: NextPage = () => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" activeTab="order" />
      <div className="max-w-lg mx-auto px-6 py-12">
        {!success ? (
          <>
            <h1 className="text-2xl font-bold text-base-content mb-2">Review Order</h1>
            <p className="text-base-content/60 mb-6">Confirm your campaign details before funding the escrow.</p>

            <div className="card bg-base-100 border border-base-300 mb-4">
              <div className="card-body py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-base-300 flex items-center justify-center text-xl">☕</div>
                  <div>
                    <div className="font-semibold text-base-content">Arabica Coffee Blog</div>
                    <div className="text-sm text-base-content/50">arabicacoffee.blog</div>
                  </div>
                  <span className="ml-auto bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-md">
                    97% match
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 divide-y divide-base-300">
              {ORDER_ROWS.map(row => (
                <div key={row.label} className="flex justify-between py-2.5 text-sm">
                  <span className="text-base-content/60">{row.label}</span>
                  <span className="font-semibold text-base-content">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between py-2.5">
                <span className="font-semibold text-base-content">Total Escrow Amount</span>
                <span className="text-xl font-bold text-primary">$200.00 USDC</span>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 mb-6 text-sm text-primary leading-relaxed">
              Funds will be locked in a smart contract escrow. Payments stream to the publisher as impressions are
              verified by Chainlink CRE. You can pause or dispute at any time.
            </div>

            <button className="btn btn-primary w-full btn-lg" onClick={() => setModalOpen(true)}>
              Fund Escrow — $200.00 USDC
            </button>
            <button className="btn btn-ghost w-full mt-3" onClick={() => router.push("/advertiser/discovery")}>
              Back to Results
            </button>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-5">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-base-content mb-2">Escrow Funded!</h2>
            <p className="text-base-content/60 mb-2">$200.00 USDC locked in smart contract</p>
            <p className="text-sm text-base-content/40 mb-8">
              Campaign will begin serving immediately. Payments stream per 1,000 impressions.
            </p>
            <div className="bg-base-100 border border-base-300 rounded-lg p-4 mb-8 font-mono text-xs text-base-content/50 text-left break-all">
              Tx: 0x8f3a...7b2e4d91c6f0a3e8
              <br />
              Contract: 0xAdFl...0wEscr0w
              <br />
              Block: 18,442,691
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => router.push("/advertiser/campaign")}>
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
