"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import type { AdvertiserCampaignsListResponse } from "~~/app/api/advertisers/[id]/campaigns/route";
import { Topbar } from "~~/components/adflow/Topbar";
import type {
  Advertiser,
  AdvertiserCampaign,
  AdvertiserCampaignSessionSummary,
  AdvertiserSessionSummary,
} from "~~/types/adflow";
import { notification } from "~~/utils/scaffold-eth";

const AdvertiserDashboard: NextPage = () => {
  const router = useRouter();
  const [sessionAdvertiser, setSessionAdvertiser] = useState<AdvertiserSessionSummary | null>(null);
  const [profile, setProfile] = useState<Advertiser | null>(null);
  const [campaigns, setCampaigns] = useState<AdvertiserCampaignsListResponse>([]);
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

  const openDiscoveryForCampaign = (c: AdvertiserCampaign) => {
    const summary: AdvertiserCampaignSessionSummary = {
      id: c.id,
      productDescription: c.productDescription,
      budgetUsdc: c.budgetUsdc,
      targetImpressions: c.targetImpressions,
      targetAudience: c.targetAudience,
    };
    sessionStorage.setItem("adflow_advertiser_campaign", JSON.stringify(summary));
    router.push("/advertiser/discovery");
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" activeTab="dashboard" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
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
            <Link href="/advertiser/discovery" className="btn btn-outline btn-primary btn-sm">
              Discovery
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
                      No campaigns yet. Launch one to define budget, audience, and creative — then run discovery to find
                      publishers.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Brief</th>
                            <th>Budget</th>
                            <th>Target impr.</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {campaigns.map(c => (
                            <tr key={c.id}>
                              <td className="max-w-[200px]">
                                <span className="line-clamp-2 text-sm">{c.productDescription}</span>
                              </td>
                              <td className="whitespace-nowrap">${c.budgetUsdc} USDC</td>
                              <td className="whitespace-nowrap">{c.targetImpressions.toLocaleString()}</td>
                              <td className="text-right">
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => openDiscoveryForCampaign(c)}
                                >
                                  Find publishers
                                </button>
                              </td>
                            </tr>
                          ))}
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
                <h3 className="font-semibold text-base-content m-0">Live campaign view</h3>
                <p className="text-sm text-base-content/60 m-0 mt-1">
                  Demo dashboard for a running deal (impressions, escrow) — useful once a publisher is booked.
                </p>
                <Link href="/advertiser/campaign" className="btn btn-sm btn-outline mt-3 w-fit">
                  Open campaign demo
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvertiserDashboard;
