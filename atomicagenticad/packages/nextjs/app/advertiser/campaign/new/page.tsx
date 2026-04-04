"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import type {
  CreateAdvertiserCampaignRequest,
  CreateAdvertiserCampaignResponse,
} from "~~/app/api/advertisers/[id]/campaigns/route";
import { Topbar } from "~~/components/adflow/Topbar";
import type { AdvertiserCampaignSessionSummary, AdvertiserSessionSummary } from "~~/types/adflow";
import { notification } from "~~/utils/scaffold-eth";

const NewAdvertiserCampaign: NextPage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [advertiser, setAdvertiser] = useState<AdvertiserSessionSummary | null>(null);
  const [product, setProduct] = useState("BeanBox — premium coffee subscription");
  const [audience, setAudience] = useState(
    "Find me English-language websites specializing in Arabic coffee, specialty brewing, or coffee culture. Target audience: coffee enthusiasts aged 25-45.",
  );
  const [budget, setBudget] = useState("200");
  const [impressions, setImpressions] = useState("50000");
  const [creativeFileName, setCreativeFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const openFilePicker = () => fileInputRef.current?.click();

  const onCreativeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCreativeFileName(file?.name ?? null);
  };

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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="card bg-base-100 border border-base-300 shadow-xl w-full max-w-lg">
          <div className="card-body">
            <h2 className="card-title text-2xl">New campaign</h2>
            <p className="text-base-content/60 text-sm mb-2 m-0">
              Brief for <span className="font-medium text-base-content">{advertiser.displayName}</span> — this drives
              publisher matching and escrow sizing.
            </p>
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
                className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
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
                    <div className="text-sm text-base-content/50 mt-1">Filename recorded (upload pipeline next)</div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl mb-2">📎</div>
                    <div className="text-sm text-base-content/50">Attach banner — PNG, JPG, or WebP</div>
                    <div className="text-xs text-base-content/30 mt-1">728×90 or 300×250 typical</div>
                  </>
                )}
              </div>
            </fieldset>
            <div className="flex gap-2 mt-2">
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
                disabled={submitting}
                onClick={async () => {
                  if (!product.trim()) {
                    notification.error("Describe what you are promoting.");
                    return;
                  }
                  if (!audience.trim()) {
                    notification.error("Describe your target audience.");
                    return;
                  }
                  const budgetNum = Number.parseFloat(budget);
                  if (Number.isNaN(budgetNum) || budgetNum <= 0) {
                    notification.error("Enter a positive budget in USDC.");
                    return;
                  }
                  const imp = Number.parseInt(impressions, 10);
                  if (!Number.isInteger(imp) || imp <= 0) {
                    notification.error("Target impressions must be a positive whole number.");
                    return;
                  }

                  setSubmitting(true);
                  try {
                    const payload: CreateAdvertiserCampaignRequest = {
                      productDescription: product.trim(),
                      targetAudience: audience.trim(),
                      budgetUsdc: budget.trim(),
                      targetImpressions: imp,
                      creativeFileName: creativeFileName ?? undefined,
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
                          : "Could not save this campaign.",
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
                    notification.success("Campaign saved — open it from the dashboard to run discovery.");
                    router.push("/advertiser/dashboard");
                  } catch {
                    notification.error("Network error — try again.");
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
                {submitting ? "Saving…" : "Save campaign"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAdvertiserCampaign;
