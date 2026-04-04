"use client";

import { useRouter } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

type TopbarVariant = "landing" | "onboarding" | "publisher" | "advertiser";

type TopbarProps = {
  variant: TopbarVariant;
  activeTab?: "dashboard" | "campaigns" | "wallet" | "discovery" | "order" | "new-campaign" | "settings";
  onboardingLabel?: string;
};

export const Topbar = ({ variant, activeTab, onboardingLabel }: TopbarProps) => {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-base-200/90 backdrop-blur-md border-b border-base-300">
      <button className="btn btn-ghost text-lg font-bold px-2" onClick={() => router.push("/")}>
        Ad<span className="text-primary">Flow</span>
      </button>

      {variant === "landing" && (
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => router.push("/publisher/onboard")}>
            For Publishers
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/advertiser/onboard")}>
            For Advertisers
          </button>
        </div>
      )}

      {variant === "onboarding" && <span className="text-sm text-base-content/60">{onboardingLabel}</span>}

      {variant === "publisher" && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button
              className={`btn btn-ghost btn-sm ${activeTab === "dashboard" ? "bg-base-300" : ""}`}
              onClick={() => router.push("/publisher/dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`btn btn-ghost btn-sm ${activeTab === "campaigns" ? "bg-base-300" : ""}`}
              onClick={() => router.push("/publisher/dashboard#campaigns")}
            >
              Campaigns
            </button>
            <button
              className={`btn btn-ghost btn-sm ${activeTab === "wallet" ? "bg-base-300" : ""}`}
              onClick={() => router.push("/publisher/wallet")}
            >
              Wallet
            </button>
          </div>
          <RainbowKitCustomConnectButton />
        </div>
      )}

      {variant === "advertiser" && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-wrap justify-end">
            <button
              className={`btn btn-ghost btn-sm ${activeTab === "dashboard" ? "bg-base-300" : ""}`}
              onClick={() => router.push("/advertiser/dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`btn btn-ghost btn-sm ${activeTab === "discovery" ? "bg-base-300" : ""}`}
              onClick={() => router.push("/advertiser/discovery")}
            >
              Discovery
            </button>
            <button
              className={`btn btn-ghost btn-sm ${activeTab === "new-campaign" ? "bg-base-300" : ""}`}
              onClick={() => router.push("/advertiser/campaign/new")}
            >
              New campaign
            </button>
            <button
              className={`btn btn-ghost btn-sm ${activeTab === "campaigns" ? "bg-base-300" : ""}`}
              onClick={() => router.push("/advertiser/campaign")}
            >
              Live campaign
            </button>
            <button
              className={`btn btn-ghost btn-sm ${activeTab === "settings" ? "bg-base-300" : ""}`}
              onClick={() => router.push("/advertiser/settings")}
            >
              Settings
            </button>
            <button
              className={`btn btn-ghost btn-sm ${activeTab === "wallet" ? "bg-base-300" : ""}`}
              onClick={() => router.push("/advertiser/wallet")}
            >
              Wallet
            </button>
          </div>
          <RainbowKitCustomConnectButton />
        </div>
      )}
    </div>
  );
};
