"use client";

import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";

type TopbarVariant = "landing" | "onboarding" | "publisher" | "advertiser";

type TopbarProps = {
  variant: TopbarVariant;
  activeTab?: "dashboard" | "campaigns" | "wallet" | "discovery" | "order" | "new-campaign" | "settings";
  onboardingLabel?: string;
};

export const Topbar = ({ variant, activeTab, onboardingLabel }: TopbarProps) => {
  const router = useRouter();
  const { user, handleLogOut } = useDynamicContext();

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-base-100/80 backdrop-blur-md border-b border-base-300">
      <button className="btn btn-ghost px-2 flex items-center gap-2" onClick={() => router.push("/")}>
        <span className="flex items-center justify-center w-7 h-7 rounded bg-primary text-primary-content text-xs font-black tracking-tighter">
          AAA
        </span>
        <span className="font-bold text-base-content text-base tracking-tight">Triple A</span>
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
          <DynamicWidget />
          {user && (
            <button className="btn btn-ghost btn-sm text-base-content/60" onClick={() => handleLogOut()}>
              Log out
            </button>
          )}
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
          <DynamicWidget />
          {user && (
            <button className="btn btn-ghost btn-sm text-base-content/60" onClick={() => handleLogOut()}>
              Log out
            </button>
          )}
        </div>
      )}
    </div>
  );
};
