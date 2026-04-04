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
    <div className="min-h-screen bg-base-200">
      <Topbar variant="onboarding" onboardingLabel="Advertiser Onboarding" />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="card bg-base-100 border border-base-300 shadow-xl w-full max-w-lg">
          <div className="card-body">
            <Stepper steps={STEPS} current={step} />

            {step === 1 && (
              <>
                <h2 className="card-title text-2xl">Welcome, Advertiser</h2>
                <p className="text-base-content/60 text-sm mb-6">
                  Enter your email to start discovering niche publishers for your brand.
                </p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Email Address</legend>
                  <input
                    type="email"
                    className="input input-bordered w-full bg-base-200"
                    placeholder="you@company.com"
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
                <h2 className="card-title text-2xl">Describe Your Campaign</h2>
                <p className="text-base-content/60 text-sm mb-6">
                  Tell our agent what you&apos;re looking for — in plain English.
                </p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">What are you promoting?</legend>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-base-200"
                    value={product}
                    onChange={e => setProduct(e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Target Audience</legend>
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
                    <legend className="fieldset-legend">Target Impressions</legend>
                    <input
                      type="number"
                      className="input input-bordered w-full bg-base-200"
                      value={impressions}
                      onChange={e => setImpressions(e.target.value)}
                    />
                  </fieldset>
                </div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Ad Creative</legend>
                  <div
                    className="border-2 border-dashed border-base-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setFileLabel("beanbox-banner-728x90.png")}
                  >
                    {fileLabel ? (
                      <>
                        <div className="text-primary font-semibold">{fileLabel}</div>
                        <div className="text-sm text-base-content/50 mt-1">Ready to upload</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl mb-2">📎</div>
                        <div className="text-sm text-base-content/50">Drop your banner here or click to browse</div>
                        <div className="text-xs text-base-content/30 mt-1">728x90 or 300x250 PNG/JPG</div>
                      </>
                    )}
                  </div>
                </fieldset>
                <button className="btn btn-primary w-full mt-2" onClick={() => router.push("/advertiser/discovery")}>
                  Find Publishers
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserOnboard;
