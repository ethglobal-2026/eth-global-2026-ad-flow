"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import type { SiteAnalysis } from "~~/app/api/analyze-site/route";
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
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("https://arabicacoffee.blog");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SiteAnalysis | null>(null);
  const [price, setPrice] = useState("4.00");
  const [format, setFormat] = useState("Both");
  const [blockedCategories, setBlockedCategories] = useState(["Gambling", "Crypto Trading"]);
  const [preferredTypes, setPreferredTypes] = useState(["SaaS / Software", "E-commerce", "Food & Beverage"]);

  // Holds the API result while the animation is still running
  const pendingAnalysis = useRef<SiteAnalysis | null>(null);

  const toggleTag = (tag: string, list: string[], setList: (v: string[]) => void) =>
    setList(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag]);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setAnalysis(null);
    pendingAnalysis.current = null;

    // Fire API call in parallel with the animation
    fetch("/api/analyze-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Analysis failed");
        return res.json() as Promise<SiteAnalysis>;
      })
      .then(data => {
        pendingAnalysis.current = data;
      })
      .catch(() => {
        notification.error("Site analysis failed. Check your ANTHROPIC_API_KEY.");
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
                  Enter your email to get started. We&apos;ll create a wallet for you automatically.
                </p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Email Address</legend>
                  <input
                    type="email"
                    className="input input-bordered w-full bg-base-200"
                    placeholder="you@yoursite.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </fieldset>
                <button className="btn btn-primary w-full mt-2" onClick={() => setStep(2)}>
                  Continue
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
                      <button className="btn btn-primary flex-1" onClick={() => setStep(3)}>
                        Looks Good — Continue
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {step === 3 && (
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
                <button
                  className="btn btn-primary w-full mt-2"
                  onClick={() => {
                    notification.success("Listing published!");
                    router.push("/publisher/dashboard");
                  }}
                >
                  Publish Listing
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
