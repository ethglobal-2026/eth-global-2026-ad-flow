"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { arcTestnet } from "viem/chains";
import { useBalance, usePublicClient } from "wagmi";
import type { NextPage } from "next";
import type { PublisherDashboardResponse } from "~~/app/api/publishers/[id]/dashboard/route";
import { Topbar } from "~~/components/adflow/Topbar";
import type { PublisherSessionSummary } from "~~/types/adflow";
import { DEAL_ESCROW_READ_ABI } from "~~/utils/adflow/dealEscrowAbi";
import { notification } from "~~/utils/scaffold-eth";

const PublisherWallet: NextPage = () => {
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address as `0x${string}` | undefined;
  const publicClient = usePublicClient({ chainId: arcTestnet.id });

  const { data: balance, isLoading: balanceLoading } = useBalance({ address: walletAddress });

  const [session, setSession] = useState<PublisherSessionSummary | null>(null);
  const [dashboard, setDashboard] = useState<PublisherDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [escrowTotal, setEscrowTotal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("adflow_publisher");
      if (raw) setSession(JSON.parse(raw) as PublisherSessionSummary);
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
    fetch(`/api/publishers/${session.id}/dashboard`)
      .then(r => r.json())
      .then((data: PublisherDashboardResponse) => setDashboard(data))
      .catch(() => notification.error("Could not load wallet data."))
      .finally(() => setLoading(false));
  }, [session?.id]);

  // Read fundedAmount from each active escrow contract
  useEffect(() => {
    if (!dashboard || !publicClient) return;

    const escrowAddresses = dashboard.campaigns
      .map(c => c.escrowAddress)
      .filter((addr): addr is string => !!addr);

    if (escrowAddresses.length === 0) {
      setEscrowTotal("0.00");
      return;
    }

    Promise.all(
      escrowAddresses.map(addr =>
        publicClient.readContract({
          address: addr as `0x${string}`,
          abi: DEAL_ESCROW_READ_ABI,
          functionName: "fundedAmount",
        }),
      ),
    )
      .then(amounts => {
        const total = amounts.reduce((sum, a) => sum + a, 0n);
        setEscrowTotal(parseFloat(formatUnits(total, 18)).toFixed(4));
      })
      .catch(() => {
        // fallback to DB budget sum
        const fallback = dashboard.stats.escrowPendingUsdc;
        setEscrowTotal(fallback);
      });
  }, [dashboard, publicClient]);

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const campaigns = dashboard?.campaigns ?? [];

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="publisher" activeTab="wallet" />
      <div className="max-w-lg mx-auto px-6 py-8">

        {/* Balance hero */}
        <div className="text-center py-10">
          <p className="text-base-content/50 text-sm m-0">Active campaigns</p>
          {loading ? (
            <div className="flex justify-center py-6"><span className="loading loading-spinner loading-lg text-primary" /></div>
          ) : (
            <div className="flex items-baseline justify-center gap-1 tabular-nums mt-2">
              <span className="text-6xl font-extrabold text-primary">
                {dashboard?.stats.activeCampaignCount ?? 0}
              </span>
            </div>
          )}

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
          <div className="card bg-base-100 border border-base-300 p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {escrowTotal === null ? (
                <span className="loading loading-dots loading-sm" />
              ) : (
                `$${escrowTotal}`
              )}
            </div>
            <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">In Escrow</div>
          </div>
          <div className="card bg-base-100 border border-base-300 p-4 text-center">
            <div className="text-2xl font-bold text-base-content">
              {balanceLoading ? "—" : balance ? `${parseFloat(balance.formatted).toFixed(4)}` : "0"}
            </div>
            <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">
              {balance?.symbol ?? "ETH"}
            </div>
          </div>
        </div>

        {/* Campaign table */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <h2 className="card-title text-base">Campaign Revenue</h2>
              <span className="badge badge-success badge-sm">Live</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><span className="loading loading-spinner text-primary" /></div>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-base-content/40 text-center py-6 m-0">No active campaigns yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Advertiser</th>
                      <th>Budget</th>
                      <th>Impressions</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id}>
                        <td className="text-sm font-medium">{c.advertiserName}</td>
                        <td className="text-primary font-semibold">${c.budgetUsdc}</td>
                        <td className="text-sm text-base-content/50">
                          {c.impressionsTotal.toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge badge-sm ${c.status === "active" ? "badge-success" : "badge-ghost"}`}>
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
      </div>
    </div>
  );
};

export default PublisherWallet;
