"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const Particles = dynamic(() => import("~~/components/bits/Particles").then(m => ({ default: m.Particles })), {
  ssr: false,
});

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "Agentic Matching",
    desc: "AI agents discover and verify the perfect publisher-advertiser fit — no manual browsing, no guesswork.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Streaming Payments",
    desc: "USDC flows per 1,000 impressions via on-chain escrow — no invoicing, no 30-day waits.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Escrow Protected",
    desc: "Funds locked in Chainlink-verified smart contracts. Neither party can seize them unilaterally.",
  },
];

const Landing: NextPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="landing" />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* react-bits Particles background */}
        <Particles
          particleCount={160}
          particleSpread={14}
          speed={0.04}
          particleColors={["#93c5fd", "#bfdbfe", "#2563eb", "#dbeafe"]}
          particleBaseSize={70}
          sizeRandomness={0.8}
          alphaParticles
          disableRotation
          className="opacity-60"
        />

        {/* Dot-grid overlay — matches DePINed aesthetic */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #bfdbfe 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.5,
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Powered by AI agents &amp; Chainlink
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-base-content mb-6">
            Atomic Agentic{" "}
            <span className="text-primary">Ads</span>
          </h1>

          <p className="text-lg md:text-xl text-base-content/60 max-w-xl mx-auto leading-relaxed mb-10">
            Agent-powered publisher discovery, blockchain-secured payments. Connect with the right audience — no
            gatekeepers, no 30% commissions.
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <button
              className="btn btn-primary btn-lg shadow-lg shadow-primary/25"
              onClick={() => router.push("/publisher/onboard")}
            >
              I&apos;m a Publisher →
            </button>
            <button
              className="btn btn-outline btn-lg border-base-300 bg-base-100 text-base-content hover:bg-base-200"
              onClick={() => router.push("/advertiser/onboard")}
            >
              I&apos;m an Advertiser
            </button>
          </div>

          <p className="mt-8 text-xs text-base-content/40 uppercase tracking-widest font-medium">
            Open · Permissionless · On-chain
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-base-100 border-t border-base-300">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-base-content/40 uppercase tracking-widest font-semibold mb-12">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="card bg-base-100 border border-base-300 shadow-sm p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base-content mb-2">{f.title}</h3>
                <p className="text-sm text-base-content/60 leading-relaxed m-0">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 bg-base-200 text-center border-t border-base-300">
        <h2 className="text-2xl font-bold text-base-content mb-3">Ready to get started?</h2>
        <p className="text-base-content/60 mb-6 text-sm">Publishers earn. Advertisers reach their audience. Agents do the work.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button className="btn btn-primary" onClick={() => router.push("/publisher/onboard")}>
            List your site
          </button>
          <button
            className="btn btn-outline border-base-300 bg-base-100 text-base-content hover:bg-base-200"
            onClick={() => router.push("/advertiser/onboard")}
          >
            Launch a campaign
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
