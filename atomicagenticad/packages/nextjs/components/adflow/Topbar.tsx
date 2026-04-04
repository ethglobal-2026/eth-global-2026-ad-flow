"use client";

import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";

type TopbarVariant = "landing" | "onboarding" | "publisher" | "advertiser";

type TopbarProps = {
  variant: TopbarVariant;
  activeTab?: "dashboard" | "wallet" | "discovery" | "order" | "new-campaign" | "settings";
  onboardingLabel?: string;
};

export const Topbar = ({ variant, activeTab, onboardingLabel }: TopbarProps) => {
  const router = useRouter();
  const { user, handleLogOut } = useDynamicContext();

  const navLink = (label: string, active: boolean, onClick: () => void) => (
    <button
      className={`btn btn-ghost btn-sm ${active ? "bg-base-300 text-base-content" : "text-base-content/60"}`}
      style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.02em" }}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-base-100/90 backdrop-blur-md border-b border-base-300">
      <button
        className="btn btn-ghost px-2 flex items-center gap-2.5"
        onClick={() => router.push("/")}
      >
        <span
          className="flex items-center justify-center w-7 h-7 rounded text-xs font-black tracking-tighter text-white"
          style={{ background: "var(--color-primary)", fontFamily: "var(--font-mono)" }}
        >
          AF
        </span>
        <span
          className="font-bold text-base-content text-base tracking-tight"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          AdFlow
        </span>
      </button>

      {variant === "landing" && (
        <div className="flex gap-2">
          {navLink("For Publishers", false, () => router.push("/publisher/onboard"))}
          <button
            className="btn btn-primary btn-sm"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
            onClick={() => router.push("/advertiser/onboard")}
          >
            For Advertisers
          </button>
        </div>
      )}

      {variant === "onboarding" && (
        <span
          className="text-sm text-base-content/50"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.04em" }}
        >
          {onboardingLabel}
        </span>
      )}

      {variant === "publisher" && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {navLink("Dashboard", activeTab === "dashboard", () => router.push("/publisher/dashboard"))}
            {navLink("Wallet", activeTab === "wallet", () => router.push("/publisher/wallet"))}
          </div>
          <DynamicWidget />
          {user && (
            <button
              className="btn btn-ghost btn-sm text-base-content/50"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
              onClick={() => handleLogOut()}
            >
              Log out
            </button>
          )}
        </div>
      )}

      {variant === "advertiser" && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-wrap justify-end">
            {navLink("Dashboard", activeTab === "dashboard", () => router.push("/advertiser/dashboard"))}
            {navLink("Discovery", activeTab === "discovery", () => router.push("/advertiser/discovery"))}
            {navLink("New campaign", activeTab === "new-campaign", () => router.push("/advertiser/campaign/new"))}
            {navLink("Settings", activeTab === "settings", () => router.push("/advertiser/settings"))}
            {navLink("Wallet", activeTab === "wallet", () => router.push("/advertiser/wallet"))}
          </div>
          <DynamicWidget />
          {user && (
            <button
              className="btn btn-ghost btn-sm text-base-content/50"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
              onClick={() => handleLogOut()}
            >
              Log out
            </button>
          )}
        </div>
      )}
    </div>
  );
};
