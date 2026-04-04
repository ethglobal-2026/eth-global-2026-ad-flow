"use client";

import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const Landing: NextPage = () => {
  const router = useRouter();

  return (
    <div className="adflow">
      <Topbar variant="landing" />
      <div className="landing-hero">
        <h1>
          The Ad Marketplace for the <em>Open Web</em>
        </h1>
        <p>
          Agent-powered discovery, blockchain-secured payments. Connect niche publishers with the right advertisers —
          no gatekeepers, no 32% commissions.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary btn-large" onClick={() => router.push("/publisher/onboard")}>
            I&apos;m a Publisher
          </button>
          <button className="btn btn-secondary btn-large" onClick={() => router.push("/advertiser/onboard")}>
            I&apos;m an Advertiser
          </button>
        </div>
        <div className="hero-features">
          <div className="hero-feature">
            <div className="hero-feature-icon">🤖</div>
            <h3>Agent Matching</h3>
            <p>AI agents discover and verify the perfect publisher-advertiser fit automatically</p>
          </div>
          <div className="hero-feature">
            <div className="hero-feature-icon">⚡</div>
            <h3>Streaming Payments</h3>
            <p>USDC flows to publishers per 1,000 impressions — no 30-day wait</p>
          </div>
          <div className="hero-feature">
            <div className="hero-feature-icon">🔒</div>
            <h3>Escrow Protection</h3>
            <p>Funds locked in smart contracts — neither party can seize them</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
