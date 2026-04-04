"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { NextPage } from "next";
import type { PublisherDashboardResponse } from "~~/app/api/publishers/[id]/dashboard/route";
import { Topbar } from "~~/components/adflow/Topbar";
import type { PublisherSessionSummary } from "~~/types/adflow";
import { notification } from "~~/utils/scaffold-eth";

function PublisherDashboardInner() {
  const searchParams = useSearchParams();
  const [sessionPublisher, setSessionPublisher] = useState<PublisherSessionSummary | null>(null);
  const [dashboard, setDashboard] = useState<PublisherDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const publisherId = useMemo(() => {
    const q = searchParams.get("id")?.trim();
    if (q) return q;
    return sessionPublisher?.id ?? null;
  }, [searchParams, sessionPublisher]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("adflow_publisher");
      if (raw) setSessionPublisher(JSON.parse(raw) as PublisherSessionSummary);
    } catch {
      /* ignore */
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!publisherId) {
      setLoading(false);
      setDashboard(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/publishers/${publisherId}/dashboard`);
      const payload = (await res.json().catch(() => ({}))) as PublisherDashboardResponse | { error?: string };

      if (!res.ok) {
        const msg =
          typeof payload === "object" && payload && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : `Could not load dashboard (${res.status})`;
        setError(msg);
        setDashboard(null);
        notification.error(msg);
        return;
      }

      setDashboard(payload as PublisherDashboardResponse);
    } catch {
      const msg = "Network error loading dashboard.";
      setError(msg);
      setDashboard(null);
      notification.error(msg);
    } finally {
      setLoading(false);
    }
  }, [publisherId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const publisher = dashboard?.publisher;

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="publisher" activeTab="dashboard" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Publisher Dashboard</h1>
            <p className="text-base-content/60 mt-1 m-0">
              {publisher?.siteUrl ?? sessionPublisher?.siteUrl ?? "Complete onboarding to link your site"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {publisherId ? (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => void loadDashboard()}>
                Refresh
              </button>
            ) : null}
            <span className={`badge badge-lg ${publisher ? "badge-success" : "badge-ghost"}`}>
              {publisher ? "Listing active" : "No listing loaded"}
            </span>
          </div>
        </div>

        {!publisherId && !loading && (
          <div className="card bg-base-100 border border-base-300 mb-6">
            <div className="card-body">
              <h2 className="card-title">No publisher selected</h2>
              <p className="text-base-content/60 text-sm m-0">
                Complete onboarding to save your listing, or open the dashboard with{" "}
                <code className="text-xs bg-base-200 px-1 rounded">?id=</code> your publisher UUID.
              </p>
              <Link href="/publisher/onboard" className="btn btn-primary btn-sm w-fit mt-2">
                Go to onboarding
              </Link>
            </div>
          </div>
        )}

        {error && publisherId && (
          <div className="alert alert-error mb-6 text-sm">
            <span>{error}</span>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => void loadDashboard()}>
              Retry
            </button>
          </div>
        )}

        {loading && publisherId && (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        )}

        {!loading && dashboard && publisher && (
          <>
            {/* Listing summary */}
            <div className="card bg-base-100 border border-base-300 mb-6">
              <div className="card-body">
                <h2 className="card-title text-lg">Your listing</h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-base-content/50 m-0 uppercase text-xs tracking-wide">Category</p>
                    <p className="font-medium text-base-content m-0">{publisher.category}</p>
                    <p className="text-base-content/50 m-0 uppercase text-xs tracking-wide mt-3">Floor price / 1K</p>
                    <p className="font-semibold text-primary m-0">${publisher.floorPricePer1kUsd}</p>
                  </div>
                  <div>
                    <p className="text-base-content/50 m-0 uppercase text-xs tracking-wide">Ad format</p>
                    <p className="font-medium text-base-content m-0">{publisher.adFormat}</p>
                    <p className="text-base-content/50 m-0 uppercase text-xs tracking-wide mt-3">Quality score</p>
                    <p className="font-medium text-base-content m-0">{publisher.qualityScore} / 10</p>
                  </div>
                </div>
                {publisher.blockedCategories?.length ? (
                  <div className="mt-4">
                    <p className="text-base-content/50 m-0 uppercase text-xs tracking-wide mb-2">Blocked categories</p>
                    <div className="flex flex-wrap gap-2">
                      {publisher.blockedCategories.map(tag => (
                        <span key={tag} className="badge badge-outline badge-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  value: String(dashboard.stats.activeCampaignCount),
                  label: "Active campaigns",
                },
                {
                  value: `$${dashboard.stats.floorPricePer1kUsd}`,
                  label: "Price / 1K impressions",
                },
                {
                  value: `$${dashboard.stats.escrowPendingUsdc}`,
                  label: "Est. value in escrow",
                },
              ].map(s => (
                <div key={s.label} className="card bg-base-100 border border-base-300 p-5 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-base-content">{s.value}</div>
                  <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Campaigns */}
            <div id="campaigns" className="card bg-base-100 border border-base-300 scroll-mt-24">
              <div className="card-body">
                <h2 className="card-title">Active campaigns</h2>
                {dashboard.campaigns.length === 0 ? (
                  <p className="text-base-content/60 text-sm m-0">
                    No campaigns yet. When advertisers book your inventory, they will appear here.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Advertiser</th>
                          <th>Impressions</th>
                          <th>Budget</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.campaigns.map(c => (
                          <tr key={c.id}>
                            <td>
                              <div className="font-semibold text-base-content">{c.advertiserName}</div>
                            </td>
                            <td className="text-sm">{c.impressionsTotal.toLocaleString()}</td>
                            <td className="text-primary font-semibold">${c.budgetUsdc}</td>
                            <td>
                              <span className={`badge ${c.status === "active" ? "badge-success" : "badge-ghost"}`}>
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const PublisherDashboard: NextPage = () => (
  <Suspense
    fallback={
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    }
  >
    <PublisherDashboardInner />
  </Suspense>
);

export default PublisherDashboard;
