"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import type { CreateAdvertiserRequest, CreateAdvertiserResponse } from "~~/app/api/advertisers/route";
import { Stepper } from "~~/components/adflow/Stepper";
import { Topbar } from "~~/components/adflow/Topbar";
import type { AdvertiserSessionSummary } from "~~/types/adflow";
import { notification } from "~~/utils/scaffold-eth";

const STEPS = [{ label: "Account" }, { label: "Profile" }];

const AdvertiserOnboard: NextPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [about, setAbout] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const walletTrimmed = walletAddress.trim();
  const walletLooksValid = /^0x[a-fA-F0-9]{40}$/i.test(walletTrimmed);

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="onboarding" onboardingLabel="Advertiser onboarding" />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="card bg-base-100 border border-base-300 shadow-xl w-full max-w-lg">
          <div className="card-body">
            <Stepper steps={STEPS} current={step} />

            {step === 1 && (
              <>
                <h2 className="card-title text-2xl">Welcome, Advertiser</h2>
                <p className="text-base-content/60 text-sm mb-6">
                  Create your AdFlow account. We&apos;ll use your email for notifications and your wallet for USDC
                  escrow.
                </p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Email</legend>
                  <input
                    type="email"
                    className="input input-bordered w-full bg-base-200"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </fieldset>
                <button className="btn btn-primary w-full mt-2" disabled={!emailLooksValid} onClick={() => setStep(2)}>
                  Continue
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="card-title text-2xl">Wallet & profile</h2>
                <p className="text-base-content/60 text-sm mb-6">
                  Link the wallet that will fund campaigns. You can connect in the header and paste the same address
                  here.
                </p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Wallet address</legend>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-base-200 font-mono text-sm"
                    placeholder="0x…"
                    autoComplete="off"
                    spellCheck={false}
                    value={walletAddress}
                    onChange={e => setWalletAddress(e.target.value)}
                  />
                  <p className="fieldset-label">40 hex characters after 0x</p>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Your name</legend>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-base-200"
                    placeholder="Alex Kim"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Company (optional)</legend>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-base-200"
                    placeholder="Acme Brands"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">About you (optional)</legend>
                  <textarea
                    className="textarea textarea-bordered w-full bg-base-200"
                    rows={3}
                    placeholder="What you advertise, industries, or goals — helps publishers understand who you are."
                    value={about}
                    onChange={e => setAbout(e.target.value)}
                  />
                </fieldset>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-ghost flex-1"
                    onClick={() => setStep(1)}
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary flex-[2]"
                    disabled={submitting || !walletLooksValid || !displayName.trim()}
                    title={
                      submitting
                        ? "Saving…"
                        : !displayName.trim()
                          ? "Enter your name to continue"
                          : !walletLooksValid
                            ? "Enter a valid Ethereum address: 0x plus 40 hex characters"
                            : undefined
                    }
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        const payload: CreateAdvertiserRequest = {
                          email: email.trim(),
                          walletAddress: walletTrimmed.toLowerCase(),
                          displayName: displayName.trim(),
                          companyName: companyName.trim() || null,
                          about: about.trim() || null,
                        };
                        const res = await fetch("/api/advertisers", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                        const data: CreateAdvertiserResponse | { error?: string } = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          notification.error(
                            typeof data === "object" && data && "error" in data && typeof data.error === "string"
                              ? data.error
                              : "Could not create your account.",
                          );
                          setSubmitting(false);
                          return;
                        }
                        const created = data as CreateAdvertiserResponse;
                        const summary: AdvertiserSessionSummary = {
                          id: created.id,
                          email: created.email,
                          walletAddress: created.walletAddress,
                          displayName: created.displayName,
                        };
                        sessionStorage.setItem("adflow_advertiser", JSON.stringify(summary));
                        notification.success("Account ready — open your dashboard to launch campaigns.");
                        router.push("/advertiser/dashboard");
                      } catch {
                        notification.error("Network error — try again.");
                        setSubmitting(false);
                      }
                    }}
                  >
                    {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
                    {submitting ? "Saving…" : "Save account & go to dashboard"}
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

export default AdvertiserOnboard;
