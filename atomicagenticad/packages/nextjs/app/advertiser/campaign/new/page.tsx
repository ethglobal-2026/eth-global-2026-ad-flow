"use client";

import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { parseEventLogs, parseUnits } from "viem";
import { arcTestnet } from "viem/chains";
import { useAccount, usePublicClient, useSwitchChain } from "wagmi";
import type {
  UpdateAdvertiserCampaignOnchainRequest,
  UpdateAdvertiserCampaignOnchainResponse,
} from "~~/app/api/advertisers/[id]/campaigns/[campaignId]/onchain/route";
import type {
  CreateAdvertiserCampaignRequest,
  CreateAdvertiserCampaignResponse,
} from "~~/app/api/advertisers/[id]/campaigns/route";
import type { PublishersResponse } from "~~/app/api/publishers/route";
import { Stepper } from "~~/components/adflow/Stepper";
import { Topbar } from "~~/components/adflow/Topbar";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import type { AdvertiserCampaignSessionSummary, AdvertiserSessionSummary, Publisher } from "~~/types/adflow";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const STEPS = [{ label: "Campaign" }, { label: "Sites" }, { label: "Confirm" }];

function scorePublisherMatch(brief: string, pub: Publisher): number {
  const text = `${pub.category} ${pub.contentFocus ?? ""} ${pub.audience ?? ""} ${pub.name}`.toLowerCase();
  const words = brief
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3);
  let hits = 0;
  for (const w of words) {
    if (text.includes(w)) hits++;
  }
  const base = 52 + Math.min(38, hits * 7) + (pub.qualityScore ?? 5);
  return Math.min(98, Math.round(base));
}

const NewAdvertiserCampaign: NextPage = () => {
  const router = useRouter();
  const { chain } = useAccount();
  const publicClient = usePublicClient({ chainId: arcTestnet.id });
  const { switchChainAsync } = useSwitchChain();
  const { data: dealFactory } = useDeployedContractInfo({
    contractName: "DealFactory",
    chainId: arcTestnet.id,
  });
  const { writeContractAsync: writeDealFactoryAsync } = useScaffoldWriteContract({
    contractName: "DealFactory",
    chainId: arcTestnet.id,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [advertiser, setAdvertiser] = useState<AdvertiserSessionSummary | null>(null);
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState("BeanBox — premium coffee subscription");
  const [audience, setAudience] = useState(
    "Find me English-language websites specializing in Arabic coffee, specialty brewing, or coffee culture. Target audience: coffee enthusiasts aged 25-45.",
  );
  const [budget, setBudget] = useState("200");
  const [impressions, setImpressions] = useState("50000");
  const [creativeFileName, setCreativeFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [pubsError, setPubsError] = useState<string | null>(null);
  const [selectedPublisherId, setSelectedPublisherId] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("adflow_advertiser");
    if (!raw) {
      notification.error("Create an advertiser account first.");
      router.replace("/advertiser/onboard");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as AdvertiserSessionSummary;
      if (!parsed?.id) throw new Error("bad");
      setAdvertiser(parsed);
    } catch {
      notification.error("Session expired — sign in again.");
      router.replace("/advertiser/onboard");
    }
  }, [router]);

  const briefText = useMemo(() => `${product} ${audience}`.trim(), [product, audience]);

  const rankedPublishers = useMemo(() => {
    return [...publishers]
      .map(p => ({ pub: p, score: scorePublisherMatch(briefText, p) }))
      .sort((a, b) => b.score - a.score);
  }, [publishers, briefText]);

  const loadPublishers = useCallback(async () => {
    setPubsLoading(true);
    setPubsError(null);
    try {
      const res = await fetch("/api/publishers");
      const data = (await res.json().catch(() => ({}))) as PublishersResponse | { error?: string };
      if (!res.ok) {
        const msg =
          typeof data === "object" && data && "error" in data && typeof data.error === "string"
            ? data.error
            : "Could not load publishers";
        setPubsError(msg);
        setPublishers([]);
        return;
      }
      setPublishers(Array.isArray(data) ? data : []);
    } catch {
      setPubsError("Network error loading publishers.");
      setPublishers([]);
    } finally {
      setPubsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 2) void loadPublishers();
  }, [step, loadPublishers]);

  const togglePublisher = (id: string) => setSelectedPublisherId(prev => (prev === id ? null : id));

  const openFilePicker = () => fileInputRef.current?.click();

  const onCreativeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCreativeFileName(file?.name ?? null);
  };

  const selectedPublisher = useMemo(() => {
    if (!selectedPublisherId) return null;
    return rankedPublishers.find(({ pub }) => pub.id === selectedPublisherId) ?? null;
  }, [rankedPublishers, selectedPublisherId]);

  const impressionsNum = Number.parseInt(impressions, 10);
  const perPubImpressions = selectedPublisher && Number.isInteger(impressionsNum) ? impressionsNum : 0;

  const confirmLineEstimates = useMemo(() => {
    if (!selectedPublisher) return [];
    const cpm = Number.parseFloat(selectedPublisher.pub.floorPricePer1kUsd) || 0;
    const est = (perPubImpressions / 1000) * cpm;
    return [{ pub: selectedPublisher.pub, score: selectedPublisher.score, estUsdc: est }];
  }, [selectedPublisher, perPubImpressions]);

  const estimatedTotalUsdc = confirmLineEstimates.reduce((s, r) => s + r.estUsdc, 0);

  const budgetNum = Number.parseFloat(budget);
  const effectivePricePer1k =
    Number.isFinite(budgetNum) && impressionsNum > 0 ? (budgetNum / (impressionsNum / 1000)).toFixed(2) : null;
  const budgetDisplay = Number.isFinite(budgetNum) ? budgetNum.toFixed(2) : budget.trim() || "0.00";

  if (!advertiser) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="advertiser" activeTab="new-campaign" />
      <div className="flex justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="card bg-base-100 border border-base-300 shadow-xl w-full max-w-3xl">
          <div className="card-body">
            <Stepper steps={STEPS} current={step} />
            <h2 className="card-title text-2xl mt-2">New campaign</h2>
            <p className="text-base-content/60 text-sm mb-4 m-0">
              Logged in as <span className="font-medium text-base-content">{advertiser.displayName}</span> — brief, pick
              sites, confirm, and fund escrow.
            </p>

            {step === 1 && (
              <>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">What are you promoting?</legend>
                  <textarea
                    className="textarea textarea-bordered w-full bg-base-200 min-h-20"
                    rows={2}
                    value={product}
                    onChange={e => setProduct(e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Target audience & placement goals</legend>
                  <textarea
                    className="textarea textarea-bordered w-full bg-base-200"
                    rows={3}
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                  />
                </fieldset>
                <div className="grid grid-cols-2 gap-4">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Budget (USDC)</legend>
                    <label className="input input-bordered flex items-center gap-2 bg-base-200">
                      <span className="text-base-content/60 font-semibold">$</span>
                      <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="grow" />
                    </label>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Target impressions</legend>
                    <input
                      type="number"
                      className="input input-bordered w-full bg-base-200"
                      value={impressions}
                      onChange={e => setImpressions(e.target.value)}
                    />
                  </fieldset>
                </div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Ad creative</legend>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={onCreativeChange}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    className="border-2 border-dashed border-base-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={openFilePicker}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openFilePicker();
                      }
                    }}
                  >
                    {creativeFileName ? (
                      <>
                        <div className="text-primary font-semibold break-all">{creativeFileName}</div>
                        <div className="text-sm text-base-content/50 mt-1">Filename recorded</div>
                      </>
                    ) : (
                      <>
                        <div className="text-xl mb-1">📎</div>
                        <div className="text-sm text-base-content/50">Attach banner (PNG, JPG, WebP)</div>
                      </>
                    )}
                  </div>
                </fieldset>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-ghost flex-1"
                    onClick={() => router.push("/advertiser/dashboard")}
                  >
                    Back to dashboard
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary flex-[2]"
                    onClick={() => {
                      if (!product.trim()) {
                        notification.error("Describe what you are promoting.");
                        return;
                      }
                      if (!audience.trim()) {
                        notification.error("Describe your target audience.");
                        return;
                      }
                      if (Number.isNaN(Number.parseFloat(budget)) || Number.parseFloat(budget) <= 0) {
                        notification.error("Enter a positive budget in USDC.");
                        return;
                      }
                      const imp = Number.parseInt(impressions, 10);
                      if (!Number.isInteger(imp) || imp <= 0) {
                        notification.error("Target impressions must be a positive whole number.");
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    Find matching sites
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm text-base-content/60 m-0 mb-4">
                  Select one publisher site. Matches are ranked from your brief and listing metadata (MVP
                  heuristic).
                </p>
                {pubsLoading && (
                  <div className="flex justify-center py-16">
                    <span className="loading loading-spinner loading-lg text-primary" />
                  </div>
                )}
                {!pubsLoading && pubsError && (
                  <div className="alert alert-warning">
                    <span>{pubsError}</span>
                  </div>
                )}
                {!pubsLoading && !pubsError && publishers.length === 0 && (
                  <div className="alert alert-info">
                    <span>No publishers in the marketplace yet. Complete publisher onboarding first.</span>
                  </div>
                )}
                {!pubsLoading && !pubsError && rankedPublishers.length > 0 && (
                  <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {rankedPublishers.map(({ pub, score }) => {
                      const on = selectedPublisherId === pub.id;
                      return (
                        <li key={pub.id}>
                          <button
                            type="button"
                            onClick={() => togglePublisher(pub.id)}
                            className={`w-full text-left rounded-lg border p-4 transition-colors ${
                              on ? "border-primary bg-primary/10" : "border-base-300 hover:border-base-content/20"
                            }`}
                          >
                            <div className="flex justify-between gap-3 items-start">
                              <div>
                                <div className="font-semibold text-base-content">{pub.name}</div>
                                <div className="text-xs text-base-content/50 break-all">{pub.siteUrl}</div>
                                <div className="text-xs text-base-content/40 mt-1">{pub.category}</div>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="badge badge-primary badge-sm">{score}% match</span>
                                <span className="text-xs text-base-content/50">${pub.floorPricePer1kUsd} / 1K</span>
                                <span className="text-xs font-medium">{on ? "Selected" : "Tap to select"}</span>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="flex gap-2 mt-6">
                  <button type="button" className="btn btn-ghost flex-1" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary flex-[2]"
                    disabled={!selectedPublisher || publishers.length === 0}
                    onClick={() => {
                      if (!selectedPublisher) {
                        notification.error("Select one publisher.");
                        return;
                      }
                      if (!selectedPublisher.pub.onchainPublisherId) {
                        notification.error("Selected publisher is not registered on-chain yet.");
                        return;
                      }
                      setStep(3);
                    }}
                  >
                    Review & confirm
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="bg-base-200 rounded-lg border border-base-300 p-5 mb-4 space-y-0 divide-y divide-base-300">
                  <p className="text-xs uppercase tracking-wide text-base-content/50 pb-3 m-0">Order summary</p>
                  <div className="flex justify-between items-baseline gap-4 py-3">
                    <span className="text-sm text-base-content/60 shrink-0">Price per 1K impressions</span>
                    <span className="font-semibold text-base-content text-right">
                      {effectivePricePer1k != null ? `$${effectivePricePer1k} USDC` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-4 py-3">
                    <span className="text-sm text-base-content/60 shrink-0">Total impressions purchased</span>
                    <span className="font-semibold text-base-content tabular-nums text-right">
                      {impressionsNum.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-4 py-3">
                    <span className="text-sm text-base-content/60 shrink-0">Split (even across sites)</span>
                    <span className="font-medium text-base-content tabular-nums text-right">
                      ~{perPubImpressions.toLocaleString()} per site
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-4 pt-3">
                    <span className="text-sm font-semibold text-base-content shrink-0">Total price (confirmed)</span>
                    <span className="text-lg font-bold text-primary tabular-nums">${budgetDisplay} USDC</span>
                  </div>
                  <p className="text-xs text-base-content/50 m-0 pt-3 leading-snug">
                    Effective blended rate for this order (budget ÷ impression thousands). Per-site floors are listed
                    below.
                  </p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 mb-4 text-sm text-base-content">
                  <p className="font-semibold text-primary m-0 mb-1">Locked in escrow</p>
                  <p className="m-0 text-base-content/80 leading-relaxed">
                    Confirming now will create and fund one on-chain deal per selected publisher, totaling{" "}
                    <span className="font-semibold text-base-content">${budgetDisplay} USDC</span>.
                  </p>
                </div>
                {estimatedTotalUsdc > 0 && (
                  <p className="text-xs text-base-content/45 m-0 mb-4">
                    Planning note: sum of publisher floor rates for your split ≈ ${estimatedTotalUsdc.toFixed(2)} USDC
                    (estimate only; escrow follows total price above).
                  </p>
                )}
                <h3 className="font-semibold text-sm text-base-content/70 m-0 mb-2">Selected publishers</h3>
                <ul className="space-y-2 mb-6">
                  {confirmLineEstimates.map(({ pub, score, estUsdc }) => (
                    <li key={pub.id} className="flex justify-between text-sm border-b border-base-200 pb-2">
                      <div>
                        <div className="font-medium">{pub.name}</div>
                        <div className="text-xs text-base-content/50">{pub.siteUrl}</div>
                      </div>
                      <div className="text-right">
                        <div className="badge badge-ghost badge-sm">{score}%</div>
                        <div className="text-xs text-base-content/50">~${estUsdc.toFixed(2)} est.</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-ghost flex-1" onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary flex-[2]"
                    disabled={submitting}
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        const imp = Number.parseInt(impressions, 10);
                        if (!Number.isInteger(imp) || imp <= 0) {
                          notification.error("Target impressions must be a positive whole number.");
                          setSubmitting(false);
                          return;
                        }
                        if (!selectedPublisherId) {
                          notification.error("Select one publisher.");
                          setSubmitting(false);
                          return;
                        }

                        const payload: CreateAdvertiserCampaignRequest = {
                          productDescription: product.trim(),
                          targetAudience: audience.trim(),
                          budgetUsdc: budget.trim(),
                          targetImpressions: imp,
                          creativeFileName: creativeFileName ?? undefined,
                          selectedPublisherId,
                        };
                        const res = await fetch(`/api/advertisers/${advertiser.id}/campaigns`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                        const data: CreateAdvertiserCampaignResponse | { error?: string } = await res
                          .json()
                          .catch(() => ({}));
                        if (!res.ok) {
                          notification.error(
                            typeof data === "object" && data && "error" in data && typeof data.error === "string"
                              ? data.error
                              : "Could not create campaign.",
                          );
                          setSubmitting(false);
                          return;
                        }
                        const created = data as CreateAdvertiserCampaignResponse;
                        const summary: AdvertiserCampaignSessionSummary = {
                          id: created.id,
                          productDescription: created.productDescription,
                          budgetUsdc: created.budgetUsdc,
                          targetImpressions: created.targetImpressions,
                          targetAudience: created.targetAudience,
                        };
                        sessionStorage.setItem("adflow_advertiser_campaign", JSON.stringify(summary));

                        if (chain?.id !== arcTestnet.id) {
                          try {
                            await switchChainAsync({ chainId: arcTestnet.id });
                          } catch {
                            notification.error(`Please switch your wallet network to ${arcTestnet.name}.`);
                            setSubmitting(false);
                            return;
                          }
                        }

                        const budgetWei = parseUnits(created.budgetUsdc, 18);
                        if (budgetWei <= 0n) {
                          notification.error("Campaign budget must be greater than zero.");
                          setSubmitting(false);
                          return;
                        }

                        if (!selectedPublisher?.pub.onchainPublisherId) {
                          throw new Error("Selected publisher is missing on-chain ID.");
                        }
                        if (!dealFactory) {
                          throw new Error("DealFactory metadata unavailable.");
                        }
                        if (!publicClient) {
                          throw new Error("Arc public client unavailable.");
                        }

                        const txHash = await writeDealFactoryAsync(
                          {
                            functionName: "createDeal",
                            args: [
                              BigInt(selectedPublisher.pub.onchainPublisherId),
                              budgetWei,
                              BigInt(created.targetImpressions),
                            ],
                            value: budgetWei,
                          },
                          {
                            blockConfirmations: 1,
                          },
                        );
                        if (!txHash) {
                          throw new Error("Deal transaction failed.");
                        }

                        const receipt = await publicClient.waitForTransactionReceipt({
                          hash: txHash,
                          confirmations: 1,
                        });

                        const parsedLogs = parseEventLogs({
                          abi: dealFactory.abi,
                          eventName: "DealCreated",
                          logs: receipt.logs,
                          strict: false,
                        });

                        const matchedLog = parsedLogs.find(log => {
                          return (
                            log.args.publisherId !== undefined &&
                            log.args.publisherId?.toString() === selectedPublisher.pub.onchainPublisherId
                          );
                        });
                        const dealId = matchedLog?.args.dealId?.toString();
                        const escrowAddress = matchedLog?.args.escrow?.toLowerCase();

                        if (!dealId || !escrowAddress) {
                          throw new Error("On-chain deal creation did not return dealId/escrow address.");
                        }

                        const onchainPayload: UpdateAdvertiserCampaignOnchainRequest = {
                          onchainPublisherId: selectedPublisher.pub.onchainPublisherId,
                          onchainDealId: dealId,
                          escrowAddress,
                          fundingTxHash: txHash,
                          fundedAmountWei: budgetWei.toString(),
                        };

                        const onchainRes = await fetch(`/api/advertisers/${advertiser.id}/campaigns/${created.id}/onchain`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(onchainPayload),
                        });

                        const onchainData: UpdateAdvertiserCampaignOnchainResponse | { error?: string } = await onchainRes
                          .json()
                          .catch(() => ({}));
                        if (!onchainRes.ok) {
                          const reason =
                            typeof onchainData === "object" &&
                            onchainData &&
                            "error" in onchainData &&
                            typeof onchainData.error === "string"
                              ? onchainData.error
                              : "Failed to persist campaign on-chain data.";
                          throw new Error(reason);
                        }

                        notification.success("Campaign created and escrow funded.");
                        router.push(`/advertiser/campaign/${created.id}`);
                      } catch (error) {
                        notification.error(getParsedError(error));
                        setSubmitting(false);
                      }
                    }}
                  >
                    {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
                    {submitting ? "Processing…" : "Confirm purchase & fund escrow"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAdvertiserCampaign;
