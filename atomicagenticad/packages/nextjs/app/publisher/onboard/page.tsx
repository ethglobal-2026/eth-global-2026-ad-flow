"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { AgentLoader } from "~~/components/adflow/AgentLoader";
import { Stepper } from "~~/components/adflow/Stepper";
import { Topbar } from "~~/components/adflow/Topbar";

const AGENT_LINES = [
  "Fetching site content from arabicacoffee.blog...",
  "Analyzing page structure and content...",
  "Detecting site category: Food & Beverage > Coffee",
  "Extracting audience demographics...",
  "Estimating monthly traffic from public signals...",
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
  const [analyzed, setAnalyzed] = useState(false);
  const [price, setPrice] = useState("4.00");
  const [format, setFormat] = useState("Both");
  const [blockedCategories, setBlockedCategories] = useState(["Gambling", "Crypto Trading"]);
  const [preferredTypes, setPreferredTypes] = useState(["SaaS / Software", "E-commerce", "Food & Beverage"]);

  const toggleTag = (tag: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag]);
  };

  return (
    <div className="adflow">
      <Topbar variant="onboarding" onboardingLabel="Publisher Onboarding" />
      <div className="onboard-wrap">
        <div className="onboard-card">
          <Stepper steps={STEPS} current={step} />

          {step === 1 && (
            <>
              <h2>Welcome, Publisher</h2>
              <p className="subtitle">Enter your email to get started. We&apos;ll create a wallet for you automatically.</p>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="you@yoursite.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-block" onClick={() => setStep(2)}>
                Continue
              </button>
              <p className="form-hint" style={{ textAlign: "center", marginTop: "16px" }}>
                Powered by Dynamic — no crypto wallet needed
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Tell Us About Your Site</h2>
              <p className="subtitle">Our agent will analyze your site to create the perfect listing.</p>
              <div className="form-group">
                <label className="form-label">Website URL</label>
                <input
                  type="url"
                  placeholder="https://yourblog.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
              </div>

              {!analyzing && !analyzed && (
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => {
                    setAnalyzing(true);
                    setAnalyzed(false);
                  }}
                >
                  Analyze My Site
                </button>
              )}

              {analyzing && !analyzed && (
                <AgentLoader
                  lines={AGENT_LINES}
                  status="Agent is analyzing your site..."
                  onComplete={() => {
                    setAnalyzing(false);
                    setAnalyzed(true);
                  }}
                />
              )}

              {analyzed && (
                <>
                  <div className="analysis-result">
                    <div className="analysis-row">
                      <span className="label">Category</span>
                      <span className="value">Food & Beverage — Specialty Coffee</span>
                    </div>
                    <div className="analysis-row">
                      <span className="label">Content Focus</span>
                      <span className="value">Arabic coffee culture, brewing guides, bean reviews</span>
                    </div>
                    <div className="analysis-row">
                      <span className="label">Language</span>
                      <span className="value">English</span>
                    </div>
                    <div className="analysis-row">
                      <span className="label">Est. Monthly Traffic</span>
                      <span className="value">~12,000 visitors</span>
                    </div>
                    <div className="analysis-row">
                      <span className="label">Audience</span>
                      <span className="value">Coffee enthusiasts, ages 25-45</span>
                    </div>
                    <div className="analysis-row">
                      <span className="label">Quality Score</span>
                      <span className="value" style={{ color: "var(--accent)" }}>
                        8.4 / 10
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-block" style={{ marginTop: "16px" }} onClick={() => setStep(3)}>
                    Looks Good — Continue
                  </button>
                </>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h2>Set Your Ad Preferences</h2>
              <p className="subtitle">Define how ads appear on your site and your pricing.</p>

              <div className="form-group">
                <label className="form-label">Floor Price (per 1,000 impressions)</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    style={{ paddingLeft: "48px" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-dim)",
                      fontWeight: 600,
                    }}
                  >
                    $
                  </span>
                </div>
                <p className="form-hint">Advertisers pay at least this amount per 1K impressions</p>
              </div>

              <div className="form-group">
                <label className="form-label">Ad Format</label>
                <select value={format} onChange={e => setFormat(e.target.value)}>
                  <option>Banner (728x90)</option>
                  <option>Sidebar (300x250)</option>
                  <option>Both</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Content Policies — Block These Categories</label>
                <div className="checkbox-group">
                  {["Gambling", "Adult Content", "Crypto Trading", "Political Ads", "Alcohol", "Firearms"].map(tag => (
                    <button
                      key={tag}
                      className={`tag-check ${blockedCategories.includes(tag) ? "selected" : ""}`}
                      onClick={() => toggleTag(tag, blockedCategories, setBlockedCategories)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Advertiser Types</label>
                <div className="checkbox-group">
                  {["SaaS / Software", "E-commerce", "Education", "Food & Beverage", "Any"].map(tag => (
                    <button
                      key={tag}
                      className={`tag-check ${preferredTypes.includes(tag) ? "selected" : ""}`}
                      onClick={() => toggleTag(tag, preferredTypes, setPreferredTypes)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-block" onClick={() => router.push("/publisher/dashboard")}>
                Publish Listing
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublisherOnboard;
