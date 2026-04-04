"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";
import type { Advertiser, AdvertiserSessionSummary } from "~~/types/adflow";
import { notification } from "~~/utils/scaffold-eth";

const AdvertiserSettings: NextPage = () => {
  const [sessionAdvertiser, setSessionAdvertiser] = useState<AdvertiserSessionSummary | null>(null);
  const [profile, setProfile] = useState<Advertiser | null>(null);
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

  const loadProfile = useCallback(async () => {
    if (!advertiserId) {
      setLoading(false);
      setProfile(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/advertisers/${advertiserId}`);
      const data = (await res.json().catch(() => ({}))) as Advertiser | { error?: string };
      if (!res.ok) {
        notification.error(
          typeof data === "object" && data && "error" in data && typeof data.error === "string"
            ? data.error
            : "Could not load settings",
        );
        setProfile(null);
        return;
      }
      setProfile(data as Advertiser);
    } catch {
      notification.error("Network error.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [advertiserId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" activeTab="settings" />
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/advertiser/dashboard" className="btn btn-ghost btn-sm gap-1 -ml-2 mb-2">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-base-content m-0">Settings</h1>
          <p className="text-base-content/60 text-sm mt-1 m-0">Account details for this browser session.</p>
        </div>

        {!advertiserId && !loading && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <p className="text-sm text-base-content/60 m-0">No advertiser session. Onboard first.</p>
              <Link href="/advertiser/onboard" className="btn btn-primary btn-sm mt-4">
                Onboarding
              </Link>
            </div>
          </div>
        )}

        {advertiserId && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body gap-4">
              {loading ? (
                <span className="loading loading-spinner loading-lg text-primary" />
              ) : profile ? (
                <>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Email</legend>
                    <p className="text-sm m-0">{profile.email}</p>
                    <p className="fieldset-label">
                      Used for notifications. Changing email is not available in this build.
                    </p>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Wallet</legend>
                    <p className="font-mono text-xs break-all m-0">{profile.walletAddress}</p>
                    <p className="fieldset-label">
                      Linked for escrow and USDC. Re-linking requires support in production.
                    </p>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Display name</legend>
                    <p className="text-sm m-0">{profile.displayName}</p>
                  </fieldset>
                  {profile.companyName ? (
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">Company</legend>
                      <p className="text-sm m-0">{profile.companyName}</p>
                    </fieldset>
                  ) : null}
                  {profile.about ? (
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">About</legend>
                      <p className="text-sm m-0 whitespace-pre-wrap">{profile.about}</p>
                    </fieldset>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-base-content/60 m-0">Could not load profile.</p>
              )}
              <button type="button" className="btn btn-outline btn-sm w-fit" onClick={() => void loadProfile()}>
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertiserSettings;
