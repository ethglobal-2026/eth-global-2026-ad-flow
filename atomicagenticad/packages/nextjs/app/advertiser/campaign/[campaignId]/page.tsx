"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { NextPage } from "next";
import { formatUnits } from "viem";
import { arcTestnet } from "viem/chains";
import { usePublicClient } from "wagmi";
import type { AdvertiserCampaignDetailResponse } from "~~/app/api/advertisers/[id]/campaigns/[campaignId]/route";
import { Topbar } from "~~/components/adflow/Topbar";
import type { AdvertiserSessionSummary } from "~~/types/adflow";
import { DEAL_ESCROW_READ_ABI } from "~~/utils/adflow/dealEscrowAbi";
import { notification } from "~~/utils/scaffold-eth";

type OnchainSnapshot = {
  fundedAmount: bigint;
  confirmedImpressions: bigint;
  totalPaid: bigint;
  maxImpressions: bigint;
  pricePerImpression: bigint;
  closed: boolean;
};

const CampaignDashboard: NextPage = () => {
  const params = useParams<{ campaignId: string }>();
  const campaignId = typeof params.campaignId === "string" ? params.campaignId : "";
  const publicClient = usePublicClient({ chainId: arcTestnet.id });

  const [advertiser, setAdvertiser] = useState<AdvertiserSessionSummary | null>(null);
  const [detail, setDetail] = useState<AdvertiserCampaignDetailResponse | null>(null);
  const [onchain, setOnchain] = useState<OnchainSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("adflow_advertiser");
      if (!raw) {
        setLoading(false);
        return;
      }
      setAdvertiser(JSON.parse(raw) as AdvertiserSessionSummary);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!advertiser?.id || !campaignId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/advertisers/${advertiser.id}/campaigns/${campaignId}`);
        const json = (await res.json().catch(() => ({}))) as AdvertiserCampaignDetailResponse | { error?: string };
        if (!res.ok) {
          const message =
            typeof json === "object" && json && "error" in json && typeof json.error === "string"
              ? json.error
              : "Could not load campaign.";
          notification.error(message);
          setDetail(null);
          return;
        }

        const payload = json as AdvertiserCampaignDetailResponse;
        setDetail(payload);

        if (!payload.campaign.escrowAddress || !publicClient) {
          setOnchain(null);
          return;
        }

        const [fundedAmount, confirmedImpressions, totalPaid, maxImpressions, pricePerImpression, closed] =
          await Promise.all([
            publicClient.readContract({
              address: payload.campaign.escrowAddress as `0x${string}`,
              abi: DEAL_ESCROW_READ_ABI,
              functionName: "fundedAmount",
            }),
            publicClient.readContract({
              address: payload.campaign.escrowAddress as `0x${string}`,
              abi: DEAL_ESCROW_READ_ABI,
              functionName: "confirmedImpressions",
            }),
            publicClient.readContract({
              address: payload.campaign.escrowAddress as `0x${string}`,
              abi: DEAL_ESCROW_READ_ABI,
              functionName: "totalPaid",
            }),
            publicClient.readContract({
              address: payload.campaign.escrowAddress as `0x${string}`,
              abi: DEAL_ESCROW_READ_ABI,
              functionName: "MAX_IMPRESSIONS",
            }),
            publicClient.readContract({
              address: payload.campaign.escrowAddress as `0x${string}`,
              abi: DEAL_ESCROW_READ_ABI,
              functionName: "PRICE_PER_IMPRESSION",
            }),
            publicClient.readContract({
              address: payload.campaign.escrowAddress as `0x${string}`,
              abi: DEAL_ESCROW_READ_ABI,
              functionName: "closed",
            }),
          ]);

        setOnchain({
          fundedAmount,
          confirmedImpressions,
          totalPaid,
          maxImpressions,
          pricePerImpression,
          closed,
        });
      } catch {
        notification.error("Network error loading campaign.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [advertiser?.id, campaignId, publicClient]);

  const numbers = useMemo(() => {
    const funded = onchain ? Number.parseFloat(formatUnits(onchain.fundedAmount, 18)) : null;
    const paid = onchain ? Number.parseFloat(formatUnits(onchain.totalPaid, 18)) : null;
    const remaining = funded != null && paid != null ? Math.max(funded - paid, 0) : null;
    const confirmed = onchain ? Number(onchain.confirmedImpressions) : null;
    const maxImp = onchain ? Number(onchain.maxImpressions) : detail?.campaign.targetImpressions ?? null;
    const pct = confirmed != null && maxImp && maxImp > 0 ? Math.min((confirmed / maxImp) * 100, 100) : 0;
    const cpm = onchain ? Number.parseFloat(formatUnits(onchain.pricePerImpression * 1000n, 18)) : null;
    return { funded, paid, remaining, confirmed, maxImp, pct, cpm };
  }, [detail?.campaign.targetImpressions, onchain]);

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        )}

        {!loading && !advertiser && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h1 className="card-title">No advertiser session</h1>
              <p className="text-sm text-base-content/60 m-0">Open advertiser onboarding in this browser first.</p>
              <Link href="/advertiser/onboard" className="btn btn-primary btn-sm w-fit mt-3">
                Go to onboarding
              </Link>
            </div>
          </div>
        )}

        {!loading && advertiser && !detail && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h1 className="card-title">Campaign not found</h1>
              <Link href="/advertiser/dashboard" className="btn btn-primary btn-sm w-fit mt-3">
                Back to dashboard
              </Link>
            </div>
          </div>
        )}

        {!loading && detail && (
          <>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-base-content">Campaign</h1>
                <p className="text-base-content/60 text-sm mt-1 m-0">{detail.campaign.productDescription}</p>
                <p className="text-base-content/40 text-xs mt-1 m-0">
                  {detail.publisher?.name ?? "Unknown publisher"} · {detail.publisher?.siteUrl ?? "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/advertiser/campaign/new" className="btn btn-primary btn-sm">
                  New campaign
                </Link>
                <span className={`badge ${onchain?.closed ? "badge-ghost" : "badge-success"}`}>
                  {onchain?.closed ? "Closed" : "Active"}
                </span>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 text-center p-8 mb-6">
              <p className="text-xs uppercase tracking-widest text-base-content/40 mb-3 m-0">Impressions Delivered</p>
              <div className="text-6xl font-extrabold tabular-nums text-base-content">
                {(numbers.confirmed ?? 0).toLocaleString()}
              </div>
              <p className="text-base-content/50 mt-1 mb-4 m-0">of {(numbers.maxImp ?? 0).toLocaleString()} purchased</p>
              <progress className="progress progress-primary max-w-sm mx-auto h-3" value={numbers.pct} max={100} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="card bg-base-100 border border-base-300 p-5 text-center">
                <div className="text-3xl font-bold text-primary">
                  {numbers.remaining != null ? `$${numbers.remaining.toFixed(4)}` : "—"}
                </div>
                <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">Remaining in Escrow</div>
              </div>
              <div className="card bg-base-100 border border-base-300 p-5 text-center">
                <div className="text-3xl font-bold text-base-content">
                  {numbers.paid != null ? `$${numbers.paid.toFixed(4)}` : "—"}
                </div>
                <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">Paid to Publisher</div>
              </div>
              <div className="card bg-base-100 border border-base-300 p-5 text-center">
                <div className="text-3xl font-bold text-base-content">
                  {numbers.cpm != null ? `$${numbers.cpm.toFixed(4)}` : "—"}
                </div>
                <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">On-Chain CPM</div>
              </div>
              <div className="card bg-base-100 border border-base-300 p-5 text-center">
                <div className="text-3xl font-bold text-base-content">
                  {numbers.maxImp != null && numbers.confirmed != null
                    ? Math.max(numbers.maxImp - numbers.confirmed, 0).toLocaleString()
                    : "—"}
                </div>
                <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">Impressions Remaining</div>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h2 className="card-title">On-chain state</h2>
                <div className="bg-base-200 rounded-lg border border-base-300 divide-y divide-base-300">
                  <div className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-base-content/60">Escrow Contract</span>
                    <span className="font-mono text-xs break-all text-base-content">
                      {detail.campaign.escrowAddress ?? "Not created"}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-base-content/60">Deal ID</span>
                    <span className="font-medium text-base-content">{detail.campaign.onchainDealId ?? "N/A"}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-base-content/60">Funding Tx</span>
                    <span className="font-mono text-xs break-all text-base-content">
                      {detail.campaign.fundingTxHash ?? "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-base-content/60">Status</span>
                    <span className="font-medium text-base-content">{onchain?.closed ? "Closed" : "Open"}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignDashboard;
