"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import type { SiteAnalysis } from "~~/app/api/analyze-site/route";
import type { CreatePublisherRequest, CreatePublisherResponse } from "~~/app/api/publishers/route";
import { AgentLoader } from "~~/components/adflow/AgentLoader";
import { Stepper } from "~~/components/adflow/Stepper";
import { Topbar } from "~~/components/adflow/Topbar";
import { notification } from "~~/utils/scaffold-eth";

const AGENT_LINES = [
  "Fetching site content...",
  "Analyzing page structure and topics...",
  "Detecting site category...",
  "Extracting audience demographics...",
  "Estimating monthly traffic...",
  "Generating quality score...",
  "Analysis complete.",
];

const STEPS = [{ label: "Sign Up" }, { label: "Your Site" }, { label: "Ad Prefs" }];

const PublisherOnboard: NextPage = () => {
  const router = useRouter();
  const { user, primaryWallet, setShowAuthFlow } = useDynamicContext();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");

  // When Dynamic auth completes, pre-fill email and advance
  useEffect(() => {
    if (user && step === 1) {
      setEmail(user.email ?? "");
      setStep(2);
    }
  }, [user, step]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SiteAnalysis | null>(null);
  const [price, setPrice] = useState("4.00");
  const [format, setFormat] = useState("Both");
  const [blockedCategories, setBlockedCategories] = useState(["Gambling", "Crypto Trading"]);
  const [preferredTypes, setPreferredTypes] = useState(["SaaS / Software", "E-commerce", "Food & Beverage"]);
  const [publishing, setPublishing] = useState(false);

  // Holds the API result while the animation is still running
  const pendingAnalysis = useRef<SiteAnalysis | null>(null);

  const toggleTag = (tag: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag]);

  const handleAnalyze = () => {
    if (!url.trim()) {
      notification.error("Enter your website URL first.");
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    pendingAnalysis.current = null;

    // Fire API call in parallel with the animation
    fetch("/api/analyze-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then(async res => {
        const body = (await res.json().catch(() => ({}))) as SiteAnalysis | { error?: string };
        if (!res.ok) {
          const msg =
            typeof body === "object" && body && "error" in body && typeof body.error === "string"
              ? body.error
              : `Analysis failed (${res.status})`;
          throw new Error(msg);
        }
        return body as SiteAnalysis;
      })
      .then(data => {
        pendingAnalysis.current = data;
      })
      .catch((e: unknown) => {
        notification.error(e instanceof Error ? e.message : "Site analysis failed.");
        setAnalyzing(false);
      });
  };

  // Called when the AgentLoader animation finishes
  const handleAnimationComplete = () => {
    if (pendingAnalysis.current) {
      // API already returned — show results immediately
      setAnalysis(pendingAnalysis.current);
      setAnalyzing(false);
      notification.info("Site analysis complete.");
    } else {
      // API still running — poll every 500ms until it's ready
      const poll = setInterval(() => {
        if (pendingAnalysis.current) {
          clearInterval(poll);
          setAnalysis(pendingAnalysis.current);
          setAnalyzing(false);
          notification.info("Site analysis complete.");
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="onboarding" onboardingLabel="Publisher Onboarding" />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="card bg-base-100 border border-base-300 shadow-xl w-full max-w-lg">
          <div className="card-body">
            <Stepper steps={STEPS} current={step} />

            {step === 1 && (
              <>
                <h2 className="card-title text-2xl">Welcome, Publisher</h2>
                <p className="text-base-content/60 text-sm mb-6">
                  Sign in with Google to get started. We&apos;ll create a wallet for you automatically.
                </p>
                <button
                  className="btn btn-primary w-full mt-2 gap-2"
                  onClick={() => setShowAuthFlow(true)}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
                <p className="text-xs text-center text-base-content/40 m-0">
                  Powered by Dynamic — no crypto wallet needed
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="card-title text-2xl">Tell Us About Your Site</h2>
                <p className="text-base-content/60 text-sm mb-6">
                  Our AI agent will analyze your site to create the perfect listing.
                </p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Website URL</legend>
                  <input
                    type="url"
                    className="input input-bordered w-full bg-base-200"
                    placeholder="https://yourblog.com"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    disabled={analyzing}
                  />
                </fieldset>

                {!analyzing && !analysis && (
                  <button className="btn btn-primary w-full" onClick={handleAnalyze}>
                    Analyze My Site
                  </button>
                )}

                {analyzing && (
                  <AgentLoader
                    lines={AGENT_LINES}
                    status="Agent is analyzing your site..."
                    onComplete={handleAnimationComplete}
                  />
                )}

                {analysis && (
                  <>
                    <div className="bg-base-200 rounded-lg border border-base-300 divide-y divide-base-300">
                      {[
                        { label: "Category", value: analysis.category },
                        { label: "Content Focus", value: analysis.contentFocus },
                        { label: "Language", value: analysis.language },
                        { label: "Est. Monthly Traffic", value: analysis.estimatedMonthlyTraffic },
                        { label: "Audience", value: analysis.audience },
                        { label: "Quality Score", value: `${analysis.qualityScore} / 10`, accent: true },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between px-4 py-2.5 text-sm">
                          <span className="text-base-content/60">{row.label}</span>
                          <span
                            className={`font-medium text-right max-w-[60%] ${row.accent ? "text-primary" : "text-base-content"}`}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setAnalysis(null);
                          pendingAnalysis.current = null;
                        }}
                      >
                        Re-analyze
                      </button>
                      <button
                        className="btn btn-primary flex-1"
                        onClick={() => {
                          if (!analysis) return;
                          setStep(3);
                        }}
                      >
                        Looks Good — Continue
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {step === 3 && !analysis && (
              <>
                <h2 className="card-title text-2xl">Site analysis required</h2>
                <p className="text-base-content/60 text-sm mb-6">
                  Go back and run analysis so we can publish your listing with accurate details.
                </p>
                <button className="btn btn-primary w-full" onClick={() => setStep(2)}>
                  Back to your site
                </button>
              </>
            )}

            {step === 3 && analysis && (
              <>
                <h2 className="card-title text-2xl">Set Your Ad Preferences</h2>
                <p className="text-base-content/60 text-sm mb-6">
                  Define how ads appear on your site and your pricing.
                </p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Floor Price (per 1,000 impressions)</legend>
                  <label className="input input-bordered flex items-center gap-2 bg-base-200">
                    <span className="text-base-content/60 font-semibold">$</span>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="grow" />
                  </label>
                  <p className="fieldset-label">Advertisers pay at least this amount per 1K impressions</p>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Ad Format</legend>
                  <select
                    className="select select-bordered w-full bg-base-200"
                    value={format}
                    onChange={e => setFormat(e.target.value)}
                  >
                    <option>Banner (728x90)</option>
                    <option>Sidebar (300x250)</option>
                    <option>Both</option>
                  </select>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Block These Categories</legend>
                  <div className="flex flex-wrap gap-2">
                    {["Gambling", "Adult Content", "Crypto Trading", "Political Ads", "Alcohol", "Firearms"].map(
                      tag => (
                        <button
                          key={tag}
                          className={`btn btn-sm btn-outline ${blockedCategories.includes(tag) ? "btn-primary" : "btn-ghost"}`}
                          onClick={() => toggleTag(tag, blockedCategories, setBlockedCategories)}
                        >
                          {tag}
                        </button>
                      ),
                    )}
                  </div>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Preferred Advertiser Types</legend>
                  <div className="flex flex-wrap gap-2">
                    {["SaaS / Software", "E-commerce", "Education", "Food & Beverage", "Any"].map(tag => (
                      <button
                        key={tag}
                        className={`btn btn-sm btn-outline ${preferredTypes.includes(tag) ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => toggleTag(tag, preferredTypes, setPreferredTypes)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </fieldset>
                {primaryWallet?.address && (
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Your wallet</legend>
                    <input
                      type="text"
                      className="input input-bordered w-full bg-base-200 font-mono text-sm opacity-60 cursor-not-allowed"
                      value={primaryWallet.address}
                      readOnly
                      disabled
                    />
                    <p className="fieldset-label">Auto-assigned by Dynamic — linked to your Google account</p>
                  </fieldset>
                )}
                <button
                  className="btn btn-primary w-full mt-2"
                  disabled={publishing || !analysis}
                  onClick={async () => {
                    if (!analysis) {
                      notification.error("Complete site analysis before publishing.");
                      return;
                    }
                    setPublishing(true);
                    try {
                      const payload: CreatePublisherRequest = {
                        email: email.trim(),
                        siteUrl: url.trim(),
                        category: analysis.category,
                        qualityScore: analysis.qualityScore,
                        contentFocus: analysis.contentFocus,
                        language: analysis.language,
                        estimatedMonthlyTraffic: analysis.estimatedMonthlyTraffic,
                        audience: analysis.audience,
                        floorPricePer1kUsd: price.trim() || "0",
                        adFormat: format,
                        blockedCategories,
                        preferredAdvertiserTypes: preferredTypes,
                        walletAddress: primaryWallet?.address,
                      };
                      const res = await fetch("/api/publishers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });
                      const data: CreatePublisherResponse | { error?: string } = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        notification.error(
                          typeof data === "object" && data && "error" in data && typeof data.error === "string"
                            ? data.error
                            : "Could not publish listing.",
                        );
                        setPublishing(false);
                        return;
                      }
                      const created = data as CreatePublisherResponse;
                      sessionStorage.setItem(
                        "adflow_publisher",
                        JSON.stringify({
                          id: created.id,
                          email: created.email,
                          siteUrl: created.siteUrl,
                          floorPricePer1kUsd: created.floorPricePer1kUsd,
                          category: created.category,
                        }),
                      );
                      notification.success("Listing published!");
                      router.push("/publisher/dashboard");
                    } catch {
                      notification.error("Network error — try again.");
                      setPublishing(false);
                    }
                  }}
                >
                  {publishing ? <span className="loading loading-spinner loading-sm" /> : null}
                  {publishing ? "Publishing…" : "Publish Listing"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublisherOnboard;
