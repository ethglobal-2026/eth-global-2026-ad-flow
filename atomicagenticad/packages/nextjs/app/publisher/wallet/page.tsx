"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { arcTestnet } from "viem/chains";
import { useBalance, usePublicClient, useWriteContract } from "wagmi";
import type { NextPage } from "next";
import type { PublisherDashboardResponse } from "~~/app/api/publishers/[id]/dashboard/route";
import { Topbar } from "~~/components/adflow/Topbar";
import type { PublisherSessionSummary } from "~~/types/adflow";
import { DEAL_ESCROW_READ_ABI, DEAL_ESCROW_WRITE_ABI } from "~~/utils/adflow/dealEscrowAbi";
import { notification } from "~~/utils/scaffold-eth";

type EscrowSnapshot = {
  fundedAmount: bigint;
  totalPaid: bigint;
  remaining: bigint;
};

function fmt(wei: bigint, decimals = 4): string {
  return parseFloat(formatUnits(wei, 18)).toFixed(decimals);
}

const PublisherWallet: NextPage = () => {
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address as `0x${string}` | undefined;
  const publicClient = usePublicClient({ chainId: arcTestnet.id });
  const { writeContractAsync } = useWriteContract();

  const { data: balance, isLoading: balanceLoading } = useBalance({ address: walletAddress });

  const [session, setSession] = useState<PublisherSessionSummary | null>(null);
  const [dashboard, setDashboard] = useState<PublisherDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [escrows, setEscrows] = useState<Record<string, EscrowSnapshot>>({});
  const [escrowsLoading, setEscrowsLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("adflow_publisher");
      if (raw) setSession(JSON.parse(raw) as PublisherSessionSummary);
    } catch {
      /* ignore */
    }
  }, []);

  const loadDashboard = (publisherId: string) => {
    setLoading(true);
    fetch(`/api/publishers/${publisherId}/dashboard`)
      .then(r => r.json())
      .then((data: PublisherDashboardResponse) => setDashboard(data))
      .catch(() => notification.error("Could not load wallet data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!session?.id) {
      setLoading(false);
      return;
    }
    loadDashboard(session.id);
  }, [session?.id]);

  // Read on-chain snapshot from every funded escrow
  const refreshEscrows = async () => {
    if (!dashboard || !publicClient) return;

    const funded = dashboard.campaigns.filter(c => c.escrowAddress && c.fundedAmountWei);
    if (funded.length === 0) return;

    setEscrowsLoading(true);
    try {
      const snapshots = await Promise.all(
        funded.map(async c => {
          const addr = c.escrowAddress as `0x${string}`;
          const fundedAmount = BigInt(c.fundedAmountWei!);

          // Only totalPaid is dynamic — single contract read per campaign
          const totalPaid = await publicClient.readContract({
            address: addr,
            abi: DEAL_ESCROW_READ_ABI,
            functionName: "totalPaid",
          });

          const remaining = fundedAmount > totalPaid ? fundedAmount - totalPaid : 0n;
          return [c.escrowAddress!, { fundedAmount, totalPaid, remaining }] as const;
        }),
      );

      setEscrows(Object.fromEntries(snapshots));
    } catch {
      notification.error("Could not read escrow data.");
    } finally {
      setEscrowsLoading(false);
    }
  };

  useEffect(() => {
    void refreshEscrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard, publicClient]);

  const handleClaim = async (escrowAddress: string) => {
    setClaiming(escrowAddress);
    try {
      await writeContractAsync({
        address: escrowAddress as `0x${string}`,
        abi: DEAL_ESCROW_WRITE_ABI,
        functionName: "releasePayment",
        chainId: arcTestnet.id,
      });
      notification.success("Funds claimed!");
      // Refresh escrow snapshots after claim
      await refreshEscrows();
    } catch (err) {
      notification.error(err instanceof Error ? err.message : "Claim failed.");
    } finally {
      setClaiming(null);
    }
  };

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const campaigns = dashboard?.campaigns ?? [];

  // Aggregate totals from on-chain snapshots
  const totals = Object.values(escrows).reduce(
    (acc, s) => ({
      received: acc.received + s.totalPaid,
      remaining: acc.remaining + s.remaining,
      inEscrow: acc.inEscrow + s.fundedAmount,
    }),
    { received: 0n, remaining: 0n, inEscrow: 0n },
  );

  const hasRemaining = totals.remaining > 0n;

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="publisher" activeTab="wallet" />
      <div className="max-w-lg mx-auto px-6 py-8">

        {/* Hero: total received */}
        <div className="text-center py-10">
          <p className="text-base-content/50 text-sm m-0">Total Received</p>
          {loading || escrowsLoading ? (
            <div className="flex justify-center py-6"><span className="loading loading-spinner loading-lg text-primary" /></div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-1 tabular-nums mt-2">
                <span className="text-lg text-base-content/50 font-semibold">$</span>
                <span className="text-6xl font-extrabold text-primary">
                  {fmt(totals.received, 4).split(".")[0]}
                </span>
                <span className="text-3xl text-primary/70">.{fmt(totals.received, 4).split(".")[1]}</span>
              </div>
              {hasRemaining && (
                <p className="text-sm text-warning mt-1 m-0">
                  ${fmt(totals.remaining, 4)} remaining in escrow
                </p>
              )}
            </>
          )}

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
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card bg-base-100 border border-base-300 p-4 text-center">
            <div className="text-xl font-bold text-warning">
              {escrowsLoading ? <span className="loading loading-dots loading-sm" /> : `$${fmt(totals.remaining, 4)}`}
            </div>
            <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">Remaining</div>
          </div>
          <div className="card bg-base-100 border border-base-300 p-4 text-center">
            <div className="text-xl font-bold text-base-content">
              {escrowsLoading ? <span className="loading loading-dots loading-sm" /> : `$${fmt(totals.inEscrow, 4)}`}
            </div>
            <div className="text-xs uppercase tracking-wider text-base-content/40 mt-1">In Escrow</div>
          </div>
          <div className="card bg-base-100 border border-base-300 p-4 text-center">
            <div className="text-xl font-bold text-base-content">
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
              <h2 className="card-title text-base">Campaigns</h2>
              <span className="badge badge-success badge-sm">Live</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><span className="loading loading-spinner text-primary" /></div>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-base-content/40 text-center py-6 m-0">No campaigns yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Advertiser</th>
                      <th>Received</th>
                      <th>Remaining</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => {
                      const snap = c.escrowAddress ? escrows[c.escrowAddress] : undefined;
                      const isClaiming = claiming === c.escrowAddress;

                      return (
                        <tr key={c.id}>
                          <td className="text-sm font-medium">{c.advertiserName}</td>
                          <td className="text-primary font-semibold">
                            {snap ? `$${fmt(snap.totalPaid, 4)}` : "—"}
                          </td>
                          <td className="text-warning font-semibold">
                            {snap ? `$${fmt(snap.remaining, 4)}` : "—"}
                          </td>
                          <td>
                            {c.escrowAddress && snap && snap.remaining > 0n ? (
                              <button
                                className="btn btn-primary btn-xs"
                                disabled={isClaiming}
                                onClick={() => void handleClaim(c.escrowAddress!)}
                              >
                                {isClaiming ? <span className="loading loading-spinner loading-xs" /> : "Claim"}
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
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
