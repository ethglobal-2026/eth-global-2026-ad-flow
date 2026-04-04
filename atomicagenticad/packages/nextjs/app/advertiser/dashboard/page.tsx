"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { formatUnits } from "viem";
import { arcTestnet } from "viem/chains";
import { usePublicClient } from "wagmi";
import type { AdvertiserCampaignsListResponse } from "~~/app/api/advertisers/[id]/campaigns/route";
import { Topbar } from "~~/components/adflow/Topbar";
import type {
  Advertiser,
  AdvertiserSessionSummary,
} from "~~/types/adflow";
import { DEAL_ESCROW_READ_ABI } from "~~/utils/adflow/dealEscrowAbi";
import { notification } from "~~/utils/scaffold-eth";

type CampaignChainStats = {
  confirmedImpressions: number;
  maxImpressions: number;
  totalPaid: number;
  closed: boolean;
};

const AdvertiserDashboard: NextPage = () => {
  const router = useRouter();
  const publicClient = usePublicClient({ chainId: arcTestnet.id });
  const [sessionAdvertiser, setSessionAdvertiser] = useState<AdvertiserSessionSummary | null>(null);
  const [profile, setProfile] = useState<Advertiser | null>(null);
  const [campaigns, setCampaigns] = useState<AdvertiserCampaignsListResponse>([]);
  const [chainStats, setChainStats] = useState<Record<string, CampaignChainStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("adflow_advertiser");
      if (raw) setSessionAdvertiser(JSON.parse(raw) as AdvertiserSessionSummary);
    } catch {
      /* ignore */
    }
  }, []);

  const advertiserId = sessionAdvertiser?.id ?? null;

  const loadData = useCallback(async () => {
    if (!advertiserId) {
      setLoading(false);
      setProfile(null);
      setCampaigns([]);
      return;
    }

    setLoading(true);
    try {
      const [profRes, campRes] = await Promise.all([
        fetch(`/api/advertisers/${advertiserId}`),
        fetch(`/api/advertisers/${advertiserId}/campaigns`),
      ]);

      const profJson = (await profRes.json().catch(() => ({}))) as Advertiser | { error?: string };
      if (!profRes.ok) {
        const msg =
          typeof profJson === "object" && profJson && "error" in profJson && typeof profJson.error === "string"
            ? profJson.error
            : "Could not load profile";
        notification.error(msg);
        setProfile(null);
      } else {
        setProfile(profJson as Advertiser);
      }

      const campJson = (await campRes.json().catch(() => ({}))) as AdvertiserCampaignsListResponse | { error?: string };
      if (!campRes.ok) {
        const msg =
          typeof campJson === "object" && campJson && "error" in campJson && typeof campJson.error === "string"
            ? campJson.error
            : "Could not load campaigns";
        notification.error(msg);
        setCampaigns([]);
      } else {
        setCampaigns(Array.isArray(campJson) ? campJson : []);
      }
    } catch {
      notification.error("Network error loading dashboard.");
      setProfile(null);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [advertiserId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const loadOnchainStats = async () => {
      if (!publicClient || campaigns.length === 0) {
        setChainStats({});
        return;
      }

      const nextEntries = await Promise.all(
        campaigns.map(async campaign => {
          if (!campaign.escrowAddress) return null;
          try {
            const [confirmedImpressions, maxImpressions, totalPaid, closed] = await Promise.all([
              publicClient.readContract({
                address: campaign.escrowAddress as `0x${string}`,
                abi: DEAL_ESCROW_READ_ABI,
                functionName: "confirmedImpressions",
              }),
              publicClient.readContract({
                address: campaign.escrowAddress as `0x${string}`,
                abi: DEAL_ESCROW_READ_ABI,
                functionName: "MAX_IMPRESSIONS",
              }),
              publicClient.readContract({
                address: campaign.escrowAddress as `0x${string}`,
                abi: DEAL_ESCROW_READ_ABI,
                functionName: "totalPaid",
              }),
              publicClient.readContract({
                address: campaign.escrowAddress as `0x${string}`,
                abi: DEAL_ESCROW_READ_ABI,
                functionName: "closed",
              }),
            ]);
            return [
              campaign.id,
              {
                confirmedImpressions: Number(confirmedImpressions),
                maxImpressions: Number(maxImpressions),
                totalPaid: Number.parseFloat(formatUnits(totalPaid, 18)),
                closed,
              } satisfies CampaignChainStats,
            ] as const;
          } catch {
            return null;
          }
        }),
      );

      const next = Object.fromEntries(nextEntries.filter(Boolean) as Array<readonly [string, CampaignChainStats]>);
      setChainStats(next);
    };

    void loadOnchainStats();
  }, [campaigns, publicClient]);

  const totalPaid = Object.values(chainStats).reduce((sum, s) => sum + s.totalPaid, 0);
  const totalDelivered = Object.values(chainStats).reduce((sum, s) => sum + s.confirmedImpressions, 0);
  const activeDeals = campaigns.filter(c => c.onchainDealId && !chainStats[c.id]?.closed).length;

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" activeTab="dashboard" />
      <div className="max-w-6xl mx-auto px-6 py-8 relative">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-20 right-0 w-80 h-80 rounded-full bg-info/10 blur-3xl" />
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xl mb-8 overflow-hidden">
          <div className="card-body relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-info to-primary" />
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-base-content/40 m-0">Control Center</p>
                <h1 className="text-3xl font-bold text-base-content">Advertiser dashboard</h1>
                <p className="text-base-content/60 mt-1 m-0">
                  {profile?.displayName ?? sessionAdvertiser?.displayName ?? "Sign in to manage campaigns"}
                  {profile?.email
                    ? ` · ${profile.email}`
                    : sessionAdvertiser?.email
                      ? ` · ${sessionAdvertiser.email}`
                      : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {advertiserId ? (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => void loadData()}>
                    Refresh
                  </button>
                ) : null}
                <Link href="/advertiser/campaign/new" className="btn btn-primary btn-sm">
                  Launch new campaign
                </Link>
                <Link href="/advertiser/settings" className="btn btn-ghost btn-sm">
                  Settings
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <div className="rounded-xl bg-base-200/70 border border-base-300 p-3">
                <p className="text-xs uppercase text-base-content/50 m-0">Campaigns</p>
                <p className="text-xl font-bold m-0">{campaigns.length}</p>
              </div>
              <div className="rounded-xl bg-base-200/70 border border-base-300 p-3">
                <p className="text-xs uppercase text-base-content/50 m-0">Live Deals</p>
                <p className="text-xl font-bold m-0">{activeDeals}</p>
              </div>
              <div className="rounded-xl bg-base-200/70 border border-base-300 p-3">
                <p className="text-xs uppercase text-base-content/50 m-0">Impressions</p>
                <p className="text-xl font-bold m-0">{totalDelivered.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-base-200/70 border border-base-300 p-3">
                <p className="text-xs uppercase text-base-content/50 m-0">Paid On-chain</p>
                <p className="text-xl font-bold text-primary m-0">${totalPaid.toFixed(4)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 hidden">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Advertiser dashboard</h1>
            <p className="text-base-content/60 mt-1 m-0">
              {profile?.displayName ?? sessionAdvertiser?.displayName ?? "Sign in to manage campaigns"}
              {profile?.email
                ? ` · ${profile.email}`
                : sessionAdvertiser?.email
                  ? ` · ${sessionAdvertiser.email}`
                  : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {advertiserId ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => void loadData()}>
                Refresh
              </button>
            ) : null}
            <Link href="/advertiser/campaign/new" className="btn btn-primary btn-sm">
              Launch new campaign
            </Link>
            <Link href="/advertiser/settings" className="btn btn-ghost btn-sm">
              Settings
            </Link>
          </div>
        </div>

        {!advertiserId && !loading && (
          <div className="card bg-base-100 border border-base-300 mb-6">
            <div className="card-body">
              <h2 className="card-title">No advertiser account in this browser</h2>
              <p className="text-base-content/60 text-sm m-0">
                Complete onboarding to save your profile, or sign in from the device where you registered.
              </p>
              <Link href="/advertiser/onboard" className="btn btn-primary btn-sm w-fit mt-2">
                Go to onboarding
              </Link>
            </div>
          </div>
        )}

        {advertiserId && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="card bg-base-100 border border-base-300 lg:col-span-2">
                <div className="card-body">
                  <h2 className="card-title text-lg">Your campaigns</h2>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <span className="loading loading-spinner loading-lg text-primary" />
                    </div>
                  ) : campaigns.length === 0 ? (
                    <p className="text-base-content/60 text-sm m-0 py-4">
                      No campaigns yet. Launch one to define budget, audience, and creative.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Brief</th>
                            <th>Budget</th>
                            <th>Impressions</th>
                            <th>On-chain</th>
                            <th className="text-right">Paid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaigns.map(c => {
                            const stats = chainStats[c.id];
                            return (
                              <tr
                                key={c.id}
                                className="cursor-pointer hover:bg-base-200/40"
                                onClick={() => {
                                  router.push(`/advertiser/campaign/${c.id}`);
                                }}
                              >
                                <td className="max-w-[200px]">
                                  <span className="line-clamp-2 text-sm">{c.productDescription}</span>
                                </td>
                                <td className="whitespace-nowrap">${c.budgetUsdc} USDC</td>
                                <td className="whitespace-nowrap">
                                  {(stats?.confirmedImpressions ?? 0).toLocaleString()} /{" "}
                                  {c.targetImpressions.toLocaleString()}
                                </td>
                                <td>
                                  {c.onchainDealId ? (
                                    <span className={`badge ${stats?.closed ? "badge-ghost" : "badge-success"}`}>
                                      {stats?.closed ? "Closed" : "Deal #" + c.onchainDealId}
                                    </span>
                                  ) : (
                                    <span className="badge badge-ghost">Off-chain</span>
                                  )}
                                </td>
                                <td className="text-right tabular-nums">${(stats?.totalPaid ?? 0).toFixed(4)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!loading && (
                    <Link href="/advertiser/campaign/new" className="btn btn-outline btn-primary btn-sm w-fit mt-2">
                      + New campaign
                    </Link>
                  )}
                </div>
              </div>

              <div className="card bg-base-100 border border-base-300">
                <div className="card-body">
                  <h2 className="card-title text-lg">Account</h2>
                  {loading && !profile ? (
                    <span className="loading loading-spinner loading-md" />
                  ) : profile ? (
                    <ul className="text-sm space-y-2 m-0 p-0 list-none">
                      <li>
                        <span className="text-base-content/50">Wallet</span>
                        <div className="font-mono text-xs break-all">{profile.walletAddress}</div>
                      </li>
                      {profile.companyName ? (
                        <li>
                          <span className="text-base-content/50">Company</span>
                          <div>{profile.companyName}</div>
                        </li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="text-sm text-base-content/60 m-0">Profile could not be loaded.</p>
                  )}
                  <Link href="/advertiser/settings" className="btn btn-ghost btn-sm w-full mt-4">
                    Settings & profile
                  </Link>
                  <Link href="/advertiser/wallet" className="btn btn-ghost btn-sm w-full">
                    Wallet & balances
                  </Link>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border border-base-300 border-dashed">
              <div className="card-body py-6">
                <h3 className="font-semibold text-base-content m-0">Tip</h3>
                <p className="text-sm text-base-content/60 m-0 mt-1">
                  Open any campaign row to view live on-chain stats for its escrow.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvertiserDashboard;
