"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { Stepper } from "~~/components/adflow/Stepper";
import { Topbar } from "~~/components/adflow/Topbar";

const STEPS = [{ label: "Sign Up" }, { label: "Campaign" }];

const AdvertiserOnboard: NextPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState("BeanBox — premium coffee subscription");
  const [audience, setAudience] = useState(
    "Find me English-language websites specializing in Arabic coffee, specialty brewing, or coffee culture. Target audience: coffee enthusiasts aged 25-45.",
  );
  const [budget, setBudget] = useState("200");
  const [impressions, setImpressions] = useState("50000");
  const [fileLabel, setFileLabel] = useState<string | null>(null);

  return (
    <div className="adflow">
      <Topbar variant="onboarding" onboardingLabel="Advertiser Onboarding" />
      <div className="onboard-wrap">
        <div className="onboard-card">
          <Stepper steps={STEPS} current={step} />

          {step === 1 && (
            <>
              <h2>Welcome, Advertiser</h2>
              <p className="subtitle">Enter your email to start discovering niche publishers for your brand.</p>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
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
              <h2>Describe Your Campaign</h2>
              <p className="subtitle">Tell our agent what you&apos;re looking for — in plain English.</p>

              <div className="form-group">
                <label className="form-label">What are you promoting?</label>
                <input
                  type="text"
                  placeholder="e.g., BeanBox — premium coffee subscription service"
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience (describe naturally)</label>
                <textarea rows={3} value={audience} onChange={e => setAudience(e.target.value)} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Budget (USDC)</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
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
                </div>
                <div className="form-group">
                  <label className="form-label">Target Impressions</label>
                  <input
                    type="number"
                    value={impressions}
                    onChange={e => setImpressions(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ad Creative</label>
                <div
                  style={{
                    border: "2px dashed var(--navy-mid)",
                    borderRadius: "var(--radius-sm)",
                    padding: "32px",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => setFileLabel("beanbox-banner-728x90.png")}
                >
                  {fileLabel ? (
                    <>
                      <div style={{ color: "var(--accent)", fontWeight: 600 }}>{fileLabel}</div>
                      <div style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginTop: "4px" }}>
                        Ready to upload
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>📎</div>
                      <div style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
                        Drop your banner image here or click to browse
                      </div>
                      <div style={{ color: "var(--gray-400)", fontSize: "0.8rem", marginTop: "4px" }}>
                        728x90 or 300x250 PNG/JPG
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button className="btn btn-primary btn-block" onClick={() => router.push("/advertiser/discovery")}>
                Find Publishers
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvertiserOnboard;
