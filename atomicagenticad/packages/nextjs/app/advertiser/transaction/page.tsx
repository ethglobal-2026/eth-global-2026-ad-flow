"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";
import { WalletModal } from "~~/components/adflow/WalletModal";
import type { AdvertiserCheckoutSession, AdvertiserSessionSummary } from "~~/types/adflow";

const CHECKOUT_SESSION_KEY = "adflow_advertiser_checkout";

function shortAddr(addr: string) {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const Transaction: NextPage = () => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkout, setCheckout] = useState<AdvertiserCheckoutSession | null>(null);
  const [advertiser, setAdvertiser] = useState<AdvertiserSessionSummary | null>(null);

  useEffect(() => {
    try {
      const c = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
      if (c) setCheckout(JSON.parse(c) as AdvertiserCheckoutSession);
      const a = sessionStorage.getItem("adflow_advertiser");
      if (a) setAdvertiser(JSON.parse(a) as AdvertiserSessionSummary);
    } catch {
      setCheckout(null);
    }
  }, []);

  const amountDisplay = useMemo(() => {
    if (!checkout) return "200.00";
    const n = Number.parseFloat(checkout.budgetUsdc);
    if (Number.isNaN(n)) return checkout.budgetUsdc;
    return n.toFixed(2);
  }, [checkout]);

  const totalAmountNum = useMemo(() => {
    if (!checkout) return Number.NaN;
    return Number.parseFloat(checkout.budgetUsdc);
  }, [checkout]);

  /** Blended effective rate: total escrow ÷ (impressions / 1,000). */
  const pricePer1kDisplay = useMemo(() => {
    if (!checkout || checkout.targetImpressions <= 0 || Number.isNaN(totalAmountNum)) return null;
    const thousands = checkout.targetImpressions / 1000;
    if (thousands <= 0) return null;
    return (totalAmountNum / thousands).toFixed(2);
  }, [checkout, totalAmountNum]);

  const impressionsPerSite = useMemo(() => {
    if (!checkout || checkout.publishers.length === 0) return 0;
    return Math.floor(checkout.targetImpressions / checkout.publishers.length);
  }, [checkout]);

  const walletHint = advertiser?.walletAddress ? shortAddr(advertiser.walletAddress) : "0x4b2e…a81f";

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" />
      <div className="max-w-lg mx-auto px-6 py-12">
        {!checkout && !success && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h1 className="card-title">No active checkout</h1>
              <p className="text-base-content/60 text-sm m-0">
                Create a campaign, choose publishers, and confirm — you&apos;ll land here to fund escrow.
              </p>
              <button type="button" className="btn btn-primary mt-2" onClick={() => router.push("/advertiser/campaign/new")}>
                Start new campaign
              </button>
            </div>
          </div>
        )}

        {checkout && !success && (
          <>
            <h1 className="text-2xl font-bold text-base-content mb-2">Review order</h1>
            <p className="text-base-content/60 mb-6 m-0">
              Confirm placements and fund escrow. Payments stream per 1,000 impressions after verification.
            </p>

            <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 space-y-0 divide-y divide-base-300">
              <p className="text-xs uppercase tracking-wide text-base-content/50 pb-3 m-0">Order totals</p>
              <div className="flex justify-between items-baseline py-3 gap-4">
                <span className="text-sm text-base-content/60 shrink-0">Price per 1K impressions</span>
                <span className="font-semibold text-base-content text-right">
                  {pricePer1kDisplay != null ? `$${pricePer1kDisplay} USDC` : "—"}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-3 gap-4">
                <span className="text-sm text-base-content/60 shrink-0">Total impressions purchased</span>
                <span className="font-semibold text-base-content text-right tabular-nums">
                  {checkout.targetImpressions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-3 gap-4">
                <span className="text-sm font-semibold text-base-content shrink-0">Total confirmed amount</span>
                <span className="text-lg font-bold text-primary tabular-nums">${amountDisplay} USDC</span>
              </div>
              {pricePer1kDisplay != null && (
                <p className="text-xs text-base-content/45 pt-3 m-0 leading-snug">
                  Effective blended rate for this order (escrow ÷ impression thousands). Per-site floors are shown below.
                </p>
              )}
            </div>

            <div className="bg-base-100 border border-base-300 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-base-content/50 m-0">Campaign</p>
              <p className="text-sm text-base-content m-0 line-clamp-3">{checkout.productDescription}</p>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Per site (even split)</span>
                <span className="font-medium">~{impressionsPerSite.toLocaleString()} imp.</span>
              </div>
            </div>

            <p className="text-xs uppercase tracking-wide text-base-content/50 mb-2 m-0">Publishers</p>
            <div className="space-y-3 mb-4">
              {checkout.publishers.map(pub => (
                <div key={pub.id} className="card bg-base-100 border border-base-300">
                  <div className="card-body py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-base-content">{pub.name}</div>
                        <div className="text-xs text-base-content/50 break-all">{pub.siteUrl}</div>
                        <div className="text-xs text-base-content/40 mt-1">{pub.category}</div>
                      </div>
                      <span className="badge badge-primary badge-sm shrink-0">{pub.matchScore}%</span>
                    </div>
                    <div className="text-xs text-base-content/50 mt-2">
                      Floor ${pub.floorPricePer1kUsd} / 1K · {pub.adFormat}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 divide-y divide-base-300">
              <div className="flex justify-between py-2.5 text-sm">
                <span className="text-base-content/60">Payment method</span>
                <span className="font-semibold text-base-content">USDC (streaming)</span>
              </div>
              <div className="flex justify-between py-2.5 text-sm">
                <span className="text-base-content/60">Settlement</span>
                <span className="font-semibold text-base-content">Per 1,000 impressions</span>
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 mb-6 text-sm text-primary leading-relaxed">
              Funds lock in smart-contract escrow. This demo simulates the wallet confirmation flow while payouts
              are modeled as streaming per verified impressions.
            </div>

            <button type="button" className="btn btn-primary w-full btn-lg" onClick={() => setModalOpen(true)}>
              Fund escrow — ${amountDisplay} USDC
            </button>
            <button type="button" className="btn btn-ghost w-full mt-3" onClick={() => router.push("/advertiser/dashboard")}>
              Back to dashboard
            </button>
          </>
        )}

        {success && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-5">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-base-content mb-2">Escrow funded</h2>
            {checkout && (
              <div className="bg-base-100 border border-base-300 rounded-xl p-4 mb-6 text-left max-w-sm mx-auto space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-base-content/60">Price per 1K impressions</span>
                  <span className="font-medium tabular-nums">
                    {pricePer1kDisplay != null ? `$${pricePer1kDisplay}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-base-content/60">Total impressions purchased</span>
                  <span className="font-medium tabular-nums">{checkout.targetImpressions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-4 pt-1 border-t border-base-200">
                  <span className="font-semibold text-base-content">Total confirmed amount</span>
                  <span className="font-bold text-primary tabular-nums">${amountDisplay} USDC</span>
                </div>
              </div>
            )}
            {!checkout && <p className="text-base-content/60 mb-2 m-0">${amountDisplay} USDC (simulated)</p>}
            <p className="text-sm text-base-content/40 mb-8 m-0">Campaign can begin serving; streaming payouts per 1K impressions.</p>
            <div className="bg-base-100 border border-base-300 rounded-lg p-4 mb-8 font-mono text-xs text-base-content/50 text-left break-all">
              Tx: 0x8f3a…7b2e4d91c6f0a3e8
              <br />
              Contract: 0xAdFl…0wEscr0w
              <br />
              Block: 18,442,691
            </div>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => router.push("/advertiser/campaign")}>
              View campaign dashboard
            </button>
          </div>
        )}
      </div>

      <WalletModal
        isOpen={modalOpen}
        amount={amountDisplay}
        fromAddress={walletHint}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setSuccess(true);
          sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
        }}
      />
    </div>
  );
};

export default Transaction;
