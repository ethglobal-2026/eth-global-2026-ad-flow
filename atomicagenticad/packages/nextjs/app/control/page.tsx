"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { arcTestnet } from "viem/chains";
import { usePublicClient, useWriteContract } from "wagmi";
import type { AdminCampaign, AdminCampaignsResponse } from "~~/app/api/admin/campaigns/route";
import { Topbar } from "~~/components/adflow/Topbar";
import { DEAL_ESCROW_READ_ABI, DEAL_ESCROW_WRITE_ABI } from "~~/utils/adflow/dealEscrowAbi";
import { notification } from "~~/utils/scaffold-eth";

type CampaignState = {
  confirmedImpressions: bigint;
  loading: boolean;
};

type SubmitStatus = "impressions" | "claim" | null;

const ControlPanel: NextPage = () => {
  const publicClient = usePublicClient({ chainId: arcTestnet.id });
  const { writeContractAsync } = useWriteContract();

  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [onchain, setOnchain] = useState<Record<string, CampaignState>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<{ addr: string; status: SubmitStatus }>({ addr: "", status: null });

  const loadCampaigns = async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = (await res.json()) as AdminCampaignsResponse | { error?: string };
      if (!res.ok || !Array.isArray(data)) {
        notification.error("Could not load campaigns.");
        return;
      }
      setCampaigns(data);
    } catch {
      notification.error("Network error.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void loadCampaigns();
  }, []);

  const refreshOnchain = async (list: AdminCampaign[]) => {
    if (!publicClient || list.length === 0) return;

    setOnchain(prev => {
      const next = { ...prev };
      list.forEach(c => {
        next[c.escrowAddress] = { confirmedImpressions: prev[c.escrowAddress]?.confirmedImpressions ?? 0n, loading: true };
      });
      return next;
    });

    await Promise.all(
      list.map(async c => {
        try {
          const confirmed = await publicClient.readContract({
            address: c.escrowAddress as `0x${string}`,
            abi: DEAL_ESCROW_READ_ABI,
            functionName: "confirmedImpressions",
          });
          setOnchain(prev => ({
            ...prev,
            [c.escrowAddress]: { confirmedImpressions: confirmed, loading: false },
          }));
        } catch {
          setOnchain(prev => ({
            ...prev,
            [c.escrowAddress]: { confirmedImpressions: prev[c.escrowAddress]?.confirmedImpressions ?? 0n, loading: false },
          }));
        }
      }),
    );
  };

  useEffect(() => {
    if (campaigns.length > 0) void refreshOnchain(campaigns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns, publicClient]);

  const handleRecord = async (campaign: AdminCampaign) => {
    if (!publicClient) return;
    const raw = inputs[campaign.escrowAddress]?.trim();
    const additional = Number.parseInt(raw ?? "", 10);
    if (!Number.isInteger(additional) || additional <= 0) {
      notification.error("Enter a positive number of impressions.");
      return;
    }

    const addr = campaign.escrowAddress as `0x${string}`;

    try {
      // Step 1: record impressions
      setSubmitting({ addr: campaign.escrowAddress, status: "impressions" });
      const impHash = await writeContractAsync({
        address: addr,
        abi: DEAL_ESCROW_WRITE_ABI,
        functionName: "recordConfirmedImpressions",
        args: [BigInt(additional)],
        chainId: arcTestnet.id,
      });
      await publicClient.waitForTransactionReceipt({ hash: impHash, confirmations: 1 });
      notification.success(`Recorded ${additional.toLocaleString()} impressions.`);

      // Step 2: auto-claim earnings
      setSubmitting({ addr: campaign.escrowAddress, status: "claim" });
      const claimHash = await writeContractAsync({
        address: addr,
        abi: DEAL_ESCROW_WRITE_ABI,
        functionName: "releasePayment",
        chainId: arcTestnet.id,
      });
      await publicClient.waitForTransactionReceipt({ hash: claimHash, confirmations: 1 });
      notification.success("Earnings released to publisher.");

      setInputs(prev => ({ ...prev, [campaign.escrowAddress]: "" }));
    } catch (err) {
      notification.error(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setSubmitting({ addr: "", status: null });
      // Refresh after confirmed receipts — data is up to date
      await refreshOnchain([campaign]);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="landing" />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Impression Reporter Console</h1>
            <p className="text-base-content/50 text-sm mt-1 m-0">
              Connected wallet must be the authorized reporter to submit impressions.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => void loadCampaigns()}>
            Refresh
          </button>
        </div>

        <div className="alert alert-warning mb-6 text-sm">
          <span>
            Only the <span className="font-mono font-semibold">IMPRESSION_REPORTER</span> address (contract deployer) can
            call <span className="font-mono">recordConfirmedImpressions</span>. Recording impressions will automatically
            trigger a <span className="font-mono">releasePayment</span> on the same deal.
          </span>
        </div>

        {loadingList ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body text-center text-base-content/50 text-sm py-16">
              No funded campaigns found.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map(c => {
              const state = onchain[c.escrowAddress];
              const confirmed = state?.confirmedImpressions ?? 0n;
              const remaining = Math.max(0, c.targetImpressions - Number(confirmed));
              const pct = c.targetImpressions > 0
                ? Math.min(100, (Number(confirmed) / c.targetImpressions) * 100)
                : 0;
              const isActive = submitting.addr === c.escrowAddress && submitting.status !== null;
              const statusLabel = submitting.status === "impressions"
                ? "Recording impressions…"
                : submitting.status === "claim"
                  ? "Releasing payment…"
                  : null;

              return (
                <div key={c.id} className="card bg-base-100 border border-base-300">
                  <div className="card-body">
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                      <div>
                        <div className="font-semibold text-base-content">{c.advertiserName}</div>
                        <div className="text-sm text-base-content/50">{c.publisherName ?? "Unknown publisher"}</div>
                        <div className="font-mono text-xs text-base-content/40 mt-1 break-all">{c.escrowAddress}</div>
                      </div>
                      <div className="text-right shrink-0">
                        {state?.loading ? (
                          <span className="loading loading-dots loading-sm text-primary" />
                        ) : (
                          <>
                            <div className="text-2xl font-bold text-primary tabular-nums">
                              {Number(confirmed).toLocaleString()}
                            </div>
                            <div className="text-xs text-base-content/40 uppercase tracking-wide">
                              of {c.targetImpressions.toLocaleString()} confirmed
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <progress className="progress progress-primary w-full mb-4" value={pct} max={100} />

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-sm text-base-content/50 shrink-0">
                        {remaining.toLocaleString()} remaining
                      </div>
                      {isActive ? (
                        <div className="ml-auto flex items-center gap-2 text-sm text-base-content/60">
                          <span className="loading loading-spinner loading-xs text-primary" />
                          {statusLabel}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 ml-auto">
                          <input
                            type="number"
                            min={1}
                            max={remaining}
                            placeholder="Impressions to record"
                            className="input input-bordered input-sm bg-base-200 w-52"
                            value={inputs[c.escrowAddress] ?? ""}
                            onChange={e =>
                              setInputs(prev => ({ ...prev, [c.escrowAddress]: e.target.value }))
                            }
                            disabled={remaining === 0}
                          />
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={remaining === 0}
                            onClick={() => void handleRecord(c)}
                          >
                            Record & Release
                          </button>
                        </div>
                      )}
                    </div>

                    {remaining === 0 && (
                      <div className="text-xs text-success mt-2">All impressions delivered.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
