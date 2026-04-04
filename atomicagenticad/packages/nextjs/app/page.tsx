"use client";

import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const Landing: NextPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="landing" />
      <div className="flex flex-col items-center justify-center text-center px-6 py-12 min-h-[calc(100vh-4rem)]">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-base-content max-w-3xl mb-5">
          The Ad Marketplace for the <em className="not-italic text-primary">Open Web</em>
        </h1>
        <p className="text-xl text-base-content/60 max-w-lg leading-relaxed mb-10">
          Agent-powered discovery, blockchain-secured payments. Connect niche publishers with the right advertisers — no
          gatekeepers, no 32% commissions.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button className="btn btn-primary btn-lg" onClick={() => router.push("/publisher/onboard")}>
            I&apos;m a Publisher
          </button>
          <button className="btn btn-outline btn-primary btn-lg" onClick={() => router.push("/advertiser/onboard")}>
            I&apos;m an Advertiser
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-3xl">
          {[
            {
              icon: "🤖",
              title: "Agent Matching",
              desc: "AI agents discover and verify the perfect publisher-advertiser fit automatically",
            },
            {
              icon: "⚡",
              title: "Streaming Payments",
              desc: "USDC flows to publishers per 1,000 impressions — no 30-day wait",
            },
            {
              icon: "🔒",
              title: "Escrow Protection",
              desc: "Funds locked in smart contracts — neither party can seize them",
            },
          ].map(f => (
            <div key={f.title} className="flex flex-col items-center text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-base-content mb-1">{f.title}</h3>
              <p className="text-sm text-base-content/60 leading-relaxed m-0">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
