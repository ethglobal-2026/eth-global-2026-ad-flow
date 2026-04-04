"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { parseUnits } from "viem";
import { arcTestnet } from "viem/chains";
import { useAccount, useSwitchChain } from "wagmi";
import { Topbar } from "~~/components/adflow/Topbar";
import { WalletModal } from "~~/components/adflow/WalletModal";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import type { AdvertiserCheckoutSession, AdvertiserSessionSummary } from "~~/types/adflow";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const CHECKOUT_SESSION_KEY = "adflow_advertiser_checkout";
type DealTx = {
  publisherName: string;
  txHash: string;
  onchainPublisherId: string;
};

function splitEvenBigInt(total: bigint, count: number): bigint[] {
  const c = BigInt(count);
  const base = total / c;
  let remainder = total % c;
  const out: bigint[] = [];
  for (let i = 0; i < count; i++) {
    const plusOne = remainder > 0n ? 1n : 0n;
    out.push(base + plusOne);
    if (remainder > 0n) remainder -= 1n;
  }
  return out;
}

function splitEvenInt(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  let remainder = total % count;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const plusOne = remainder > 0 ? 1 : 0;
    out.push(base + plusOne);
    if (remainder > 0) remainder -= 1;
  }
  return out;
}

function shortAddr(addr: string) {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const Transaction: NextPage = () => {
  const router = useRouter();
  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync: writeDealFactoryAsync, isMining: creatingDeals } = useScaffoldWriteContract({
    contractName: "DealFactory",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deals, setDeals] = useState<DealTx[]>([]);
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

  const ensureArcNetwork = async () => {
    if (chain?.id === arcTestnet.id) return true;
    try {
      await switchChainAsync({ chainId: arcTestnet.id });
    } catch {
      notification.error(`Please switch your wallet network to ${arcTestnet.name}.`);
      return false;
    }
    return true;
  };

  const fundEscrowAndCreateDeals = async () => {
    if (!checkout) {
      notification.error("No active checkout found.");
      throw new Error("missing_checkout");
    }
    if (!advertiser?.walletAddress) {
      notification.error("No advertiser wallet found in session.");
      throw new Error("missing_wallet");
    }
    if (checkout.publishers.length === 0) {
      notification.error("No publishers selected for this campaign.");
      throw new Error("missing_publishers");
    }
    if (checkout.targetImpressions < checkout.publishers.length) {
      notification.error("Target impressions must be at least the number of selected publishers.");
      throw new Error("invalid_impressions_split");
    }

    const onArc = await ensureArcNetwork();
    if (!onArc) {
      throw new Error("wrong_network");
    }

    const budgetWei = parseUnits(checkout.budgetUsdc, 18);
    if (budgetWei <= 0n) {
      notification.error("Budget must be greater than zero.");
      throw new Error("invalid_budget");
    }

    const perPublisherBudgetWei = splitEvenBigInt(budgetWei, checkout.publishers.length);
    const perPublisherImpressions = splitEvenInt(checkout.targetImpressions, checkout.publishers.length);
    const createdDeals: DealTx[] = [];

    for (let i = 0; i < checkout.publishers.length; i++) {
      const publisher = checkout.publishers[i];
      if (!publisher?.onchainPublisherId) {
        notification.error(`Publisher ${publisher?.name ?? ""} is missing on-chain publisher ID.`);
        throw new Error("missing_onchain_publisher_id");
      }

      const publisherId = BigInt(publisher.onchainPublisherId);
      const dealBudget = perPublisherBudgetWei[i];
      const dealImpressions = perPublisherImpressions[i];

      if (dealBudget <= 0n || dealImpressions <= 0) {
        notification.error("Invalid per-publisher split; increase budget or impressions.");
        throw new Error("invalid_split");
      }

      const txHash = await writeDealFactoryAsync({
        functionName: "createDeal",
        args: [publisherId, dealBudget, BigInt(dealImpressions)],
        value: dealBudget,
      });

      if (!txHash) {
        throw new Error("deal_creation_failed");
      }

      createdDeals.push({
        publisherName: publisher.name,
        txHash,
        onchainPublisherId: publisher.onchainPublisherId,
      });
    }

    setDeals(createdDeals);
    setSuccess(true);
    sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" />
      <div className="max-w-lg mx-auto px-6 py-12">
        {!checkout && !success && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h1 className="card-title">No active checkout</h1>
              <p className="text-base-content/60 text-sm m-0">
                Create a campaign, choose publishers, and confirm. You&apos;ll land here to fund escrow.
              </p>
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() => router.push("/advertiser/campaign/new")}
              >
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
                  Effective blended rate for this order (escrow ÷ impression thousands). Per-site floors are shown
                  below.
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
              Funds lock in smart-contract escrow. This demo simulates the wallet confirmation flow while payouts are
              modeled as streaming per verified impressions.
            </div>

            <button
              type="button"
              className="btn btn-primary w-full btn-lg"
              disabled={creatingDeals}
              onClick={() => setModalOpen(true)}
            >
              Fund escrow ${amountDisplay} USDC
            </button>
            <button
              type="button"
              className="btn btn-ghost w-full mt-3"
              onClick={() => router.push("/advertiser/dashboard")}
            >
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
            <p className="text-sm text-base-content/40 mb-8 m-0">
              Campaign can begin serving; streaming payouts per 1K impressions.
            </p>
            {deals.length > 0 && (
              <div className="bg-base-100 border border-base-300 rounded-lg p-4 mb-8 font-mono text-xs text-base-content/50 text-left break-all space-y-2">
                {deals.map(d => (
                  <div key={d.txHash}>
                    <div className="text-base-content/80">{d.publisherName}</div>
                    <div>publisherId: {d.onchainPublisherId}</div>
                    <div>tx: {d.txHash}</div>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() =>
                router.push(checkout?.campaignId ? `/advertiser/campaign/${checkout.campaignId}` : "/advertiser/dashboard")
              }
            >
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
        onConfirm={async () => {
          try {
            await fundEscrowAndCreateDeals();
          } catch (error) {
            const msg = getParsedError(error);
            if (
              msg !== "missing_checkout" &&
              msg !== "missing_wallet" &&
              msg !== "missing_publishers" &&
              msg !== "wrong_network" &&
              msg !== "invalid_budget" &&
              msg !== "invalid_impressions_split" &&
              msg !== "missing_onchain_publisher_id" &&
              msg !== "invalid_split"
            ) {
              notification.error(msg);
            }
            throw error;
          }
        }}
      />
    </div>
  );
};

export default Transaction;
