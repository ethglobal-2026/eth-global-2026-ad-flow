"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type { NextPage } from "next";
import type { CreateAdvertiserRequest, CreateAdvertiserResponse } from "~~/app/api/advertisers/route";
import { Stepper } from "~~/components/adflow/Stepper";
import { Topbar } from "~~/components/adflow/Topbar";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import type { AdvertiserSessionSummary } from "~~/types/adflow";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const STEPS = [{ label: "Account" }, { label: "Profile" }];

const AdvertiserOnboard: NextPage = () => {
  const router = useRouter();
  const { user, primaryWallet, setShowAuthFlow } = useDynamicContext();
  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [about, setAbout] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // When Dynamic auth completes, check for existing account then advance or redirect
  useEffect(() => {
    if (!user || step !== 1) return;
    const userEmail = user.email ?? "";
    setChecking(true);
    fetch(`/api/advertisers?email=${encodeURIComponent(userEmail)}`)
      .then(async res => {
        if (res.ok) {
          const advertiser = await res.json();
          if (advertiser?.id) {
            sessionStorage.setItem(
              "adflow_advertiser",
              JSON.stringify({
                id: advertiser.id,
                email: advertiser.email,
                walletAddress: advertiser.walletAddress,
                displayName: advertiser.displayName,
              }),
            );
            router.push("/advertiser/dashboard");
            return;
          }
        }
        setEmail(userEmail);
        setWalletAddress(primaryWallet?.address ?? "");
        setStep(2);
      })
      .catch(() => {
        setEmail(userEmail);
        setWalletAddress(primaryWallet?.address ?? "");
        setStep(2);
      })
      .finally(() => setChecking(false));
  }, [user, step, primaryWallet, router]);
  const walletTrimmed = walletAddress.trim();
  const walletLooksValid = /^0x[a-fA-F0-9]{40}$/i.test(walletTrimmed);
  const { writeContractAsync: writeAdvertiserRegistryAsync, isMining: registeringOnchain } = useScaffoldWriteContract({
    contractName: "AdvertiserRegistry",
  });
  const { refetch: refetchAdvertiserIdByAccount } = useScaffoldReadContract({
    contractName: "AdvertiserRegistry",
    functionName: "advertiserIdByAccount",
    args: [walletTrimmed as `0x${string}`],
    watch: false,
    query: {
      enabled: walletLooksValid,
    },
  });

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
                  Sign in with Google to get started. We&apos;ll create a wallet for you automatically.
                </p>
                {checking ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-base-content/60 text-sm">
                    <span className="loading loading-spinner loading-sm" />
                    Checking your account…
                  </div>
                ) : (
                  <>
                    <button className="btn btn-primary w-full mt-2 gap-2" onClick={() => setShowAuthFlow(true)}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </button>
                    <p className="text-xs text-center text-base-content/40 m-0">
                      Powered by Dynamic — no crypto wallet needed
                    </p>
                  </>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="card-title text-2xl">Wallet & profile</h2>
                <p className="text-base-content/60 text-sm mb-6">
                  Confirm your wallet address and fill in your profile. Your wallet was created automatically via
                  Dynamic.
                </p>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Wallet address</legend>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-base-200 font-mono text-sm opacity-60 cursor-not-allowed"
                    value={walletAddress}
                    readOnly
                    disabled
                  />
                  <p className="fieldset-label">Auto-assigned by Dynamic — linked to your Google account</p>
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
                    disabled={submitting || registeringOnchain || !walletLooksValid || !displayName.trim()}
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
                        let onchainAdvertiserId = (await refetchAdvertiserIdByAccount()).data ?? 0n;
                        if (onchainAdvertiserId === 0n) {
                          const metadataUri = `adflow://advertiser/${encodeURIComponent(email.trim().toLowerCase())}`;
                          await writeAdvertiserRegistryAsync({
                            functionName: "createAdvertiserProfile",
                            args: [displayName.trim(), metadataUri],
                          });
                          onchainAdvertiserId = (await refetchAdvertiserIdByAccount()).data ?? 0n;
                        }
                        if (onchainAdvertiserId === 0n) {
                          notification.error("On-chain advertiser registration did not return an ID.");
                          setSubmitting(false);
                          return;
                        }

                        const payload: CreateAdvertiserRequest = {
                          email: email.trim(),
                          walletAddress: walletTrimmed.toLowerCase(),
                          onchainAdvertiserId: onchainAdvertiserId.toString(),
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
                      } catch (error) {
                        notification.error(getParsedError(error));
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
