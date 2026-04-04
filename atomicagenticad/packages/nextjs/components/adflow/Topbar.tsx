"use client";

import { useRouter } from "next/navigation";

type TopbarVariant = "landing" | "onboarding" | "publisher" | "advertiser";

type TopbarProps = {
  variant: TopbarVariant;
  activeTab?: "dashboard" | "campaigns" | "wallet" | "discovery" | "order";
  walletAddress?: string;
  walletBalance?: string;
  onboardingLabel?: string;
};

export const Topbar = ({ variant, activeTab, walletAddress, walletBalance, onboardingLabel }: TopbarProps) => {
  const router = useRouter();

  return (
    <div className="topbar">
      <button className="topbar-logo" onClick={() => router.push("/")}>
        Ad<span>Flow</span>
      </button>

      {variant === "landing" && (
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push("/publisher/onboard")}>
            For Publishers
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/advertiser/onboard")}>
            For Advertisers
          </button>
        </div>
      )}

      {variant === "onboarding" && (
        <span style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>{onboardingLabel}</span>
      )}

      {variant === "publisher" && (
        <>
          <div className="topbar-nav">
            <button
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => router.push("/publisher/dashboard")}
            >
              Dashboard
            </button>
            <button
              className={activeTab === "campaigns" ? "active" : ""}
              onClick={() => router.push("/publisher/dashboard")}
            >
              Campaigns
            </button>
            <button
              className={activeTab === "wallet" ? "active" : ""}
              onClick={() => router.push("/publisher/wallet")}
            >
              Wallet
            </button>
          </div>
          <div className="topbar-wallet">
            <div className="wallet-dot" />
            <span>{walletAddress ?? "0x7a3f...c92d"}</span>
            <span className="wallet-balance">{walletBalance ?? "$142.80"}</span>
          </div>
        </>
      )}

      {variant === "advertiser" && (
        <>
          <div className="topbar-nav">
            <button
              className={activeTab === "discovery" ? "active" : ""}
              onClick={() => router.push("/advertiser/discovery")}
            >
              Discovery
            </button>
            <button
              className={activeTab === "campaigns" ? "active" : ""}
              onClick={() => router.push("/advertiser/campaign")}
            >
              Campaigns
            </button>
            <button
              className={activeTab === "wallet" ? "active" : ""}
              onClick={() => router.push("/advertiser/wallet")}
            >
              Wallet
            </button>
          </div>
          <div className="topbar-wallet">
            <div className="wallet-dot" />
            <span>{walletAddress ?? "0x4b2e...a81f"}</span>
            {walletBalance && <span className="wallet-balance">{walletBalance}</span>}
          </div>
        </>
      )}
    </div>
  );
};
