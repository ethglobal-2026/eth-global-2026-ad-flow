"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { useBalance } from "wagmi";
import type { NextPage } from "next";
import type { AdvertiserCampaignsListResponse } from "~~/app/api/advertisers/[id]/campaigns/route";
import { Topbar } from "~~/components/adflow/Topbar";
import type { AdvertiserSessionSummary } from "~~/types/adflow";
import { notification } from "~~/utils/scaffold-eth";

const AdvertiserWallet: NextPage = () => {
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address as `0x${string}` | undefined;

  const { data: balance, isLoading: balanceLoading } = useBalance({ address: walletAddress });

  const [session, setSession] = useState<AdvertiserSessionSummary | null>(null);
  const [campaigns, setCampaigns] = useState<AdvertiserCampaignsListResponse>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("adflow_advertiser");
      if (raw) setSession(JSON.parse(raw) as AdvertiserSessionSummary);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!session?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/advertisers/${session.id}/campaigns`)
      .then(r => r.json())
      .then((data: AdvertiserCampaignsListResponse) => setCampaigns(data))
      .catch(() => notification.error("Could not load wallet data."))
      .finally(() => setLoading(false));
  }, [session?.id]);

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const totalSpent = campaigns.reduce((sum, c) => sum + parseFloat(c.budgetUsdc || "0"), 0);
  const activeCampaigns = campaigns.filter(c => c.createdAt);

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" activeTab="wallet" />
      <div className="max-w-lg mx-auto px-6 py-8">

        {/* Balance hero */}
        <div className="text-center py-10">
          <p className="text-base-content/50 text-sm m-0">Wallet Balance</p>
          <div className="flex items-baseline justify-center gap-1 tabular-nums mt-2">
            {balanceLoading ? (
              <span className="loading loading-spinner loading-lg text-primary" />
            ) : (
              <>
                <span className="text-5xl font-extrabold text-base-content">
                  {balance ? parseFloat(balance.formatted).toFixed(4) : "0.0000"}
                </span>
                <span className="text-xl text-base-content/40 font-normal ml-2">
                  USDC
                </span>
              </>
            )}
          </div>

          {/* Wallet address */}
          {walletAddress ? (
            <button
              className="inline-flex items-center gap-2 bg-base-100 border border-base-300 px-4 py-2 rounded-full font-mono text-sm text-base-content/50 mt-4 hover:border-primary/40 transition-colors"
              onClick={handleCopy}
            >
              {truncateAddress(walletAddress)}
              <span className="text-xs">{copied ? "✓" : "⎘"}</span>
            </button>
          ) : (
            <div className="mt-4 text-sm text-base-content/40">No wallet connected</div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card bg-base-100 border border-base-300 p-5 text-center">
            <div className="text-3xl font-bold text-warning">
              {loading ? "—" : `$${totalSpent.toFixed(2)}`}
            </div>
            <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">In Campaigns</div>
          </div>
          <div className="card bg-base-100 border border-base-300 p-5 text-center">
            <div className="text-3xl font-bold text-primary">
              {loading ? "—" : activeCampaigns.length}
            </div>
            <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">Total Campaigns</div>
          </div>
        </div>

        {/* Campaign transaction history */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-base">Campaign History</h2>
            {loading ? (
              <div className="flex justify-center py-8"><span className="loading loading-spinner text-primary" /></div>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-base-content/40 text-center py-6 m-0">No campaigns launched yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Budget</th>
                      <th>Impressions</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id}>
                        <td className="text-sm font-medium max-w-[160px] truncate">{c.productDescription}</td>
                        <td className="text-warning font-semibold">${c.budgetUsdc}</td>
                        <td className="text-sm text-base-content/50">{c.targetImpressions.toLocaleString()}</td>
                        <td className="text-sm text-base-content/50">
                          {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserWallet;
