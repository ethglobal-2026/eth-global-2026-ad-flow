"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { BlurText } from "~~/components/bits/BlurText";
import { CountUp } from "~~/components/bits/CountUp";
import { Topbar } from "~~/components/adflow/Topbar";

const Aurora = dynamic(() => import("~~/components/bits/Aurora").then(m => ({ default: m.Aurora })), { ssr: false });
const Particles = dynamic(() => import("~~/components/bits/Particles").then(m => ({ default: m.Particles })), {
  ssr: false,
});

// ─── Live feed data ───────────────────────────────────────────────────────────

const FEED_ITEMS = [
  { publisher: "techcrunch.com", brand: "QuantumBit Labs", usdc: "200", imp: "50K", id: 0 },
  { publisher: "theverge.com", brand: "NovaSport Gear", usdc: "350", imp: "80K", id: 1 },
  { publisher: "wired.com", brand: "CryptoFlow Inc", usdc: "450", imp: "100K", id: 2 },
  { publisher: "ars-technica.com", brand: "DeFi Horizon", usdc: "175", imp: "40K", id: 3 },
  { publisher: "hackernews.com", brand: "Stealth Protocol", usdc: "290", imp: "65K", id: 4 },
  { publisher: "producthunt.com", brand: "LayerZero Labs", usdc: "510", imp: "120K", id: 5 },
];

const LiveFeed = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setOffset(prev => (prev + 1) % FEED_ITEMS.length), 3800);
    return () => clearInterval(t);
  }, []);

  const visible = [0, 1, 2, 3].map(i => FEED_ITEMS[(offset + i) % FEED_ITEMS.length]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-base-300 bg-base-100 shadow-xl shadow-primary/8">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-base-300 bg-base-200/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs tracking-widest uppercase text-base-content/50">Live · AdFlow Network</span>
        </div>
        <span className="font-mono text-xs text-base-content/30">{new Date().toLocaleTimeString()}</span>
      </div>

      {/* Feed rows */}
      <div className="divide-y divide-base-300">
        {visible.map((item, idx) => (
          <div
            key={`${item.id}-${offset}`}
            className="flex items-start justify-between px-5 py-4 gap-4"
            style={{
              opacity: idx === 0 ? 1 : 1 - idx * 0.18,
              transition: "opacity 0.6s ease",
            }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {idx === 0 && (
                  <span className="font-mono text-[10px] bg-green-400/15 text-green-600 px-1.5 py-0.5 rounded tracking-wide">
                    NEW
                  </span>
                )}
                <span className="font-mono text-xs text-base-content/40 uppercase tracking-wide">Deal matched</span>
              </div>
              <div className="font-semibold text-sm text-base-content truncate">{item.publisher}</div>
              <div className="text-xs text-base-content/50 truncate">{item.brand}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono font-bold text-sm text-primary">${item.usdc}</div>
              <div className="font-mono text-xs text-base-content/40">{item.imp} imp</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="px-5 py-3 border-t border-base-300 bg-base-200/40">
        <div className="w-full h-1 bg-base-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${((offset % 4) + 1) * 25}%`, transition: "width 3.8s linear" }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── How it works steps ───────────────────────────────────────────────────────

const STEPS = [
  {
    n: "01",
    tag: "Agentic Matching",
    title: "AI finds the perfect fit",
    desc: "Claude agents analyze your campaign brief and discover publishers whose audiences match. No manual browsing, no RFPs, no guesswork.",
  },
  {
    n: "02",
    tag: "Streaming Payments",
    title: "USDC flows per impression",
    desc: "Funds lock in smart-contract escrow before the campaign starts. Payment streams per 1,000 verified impressions. No invoices, no 30-day waits.",
  },
  {
    n: "03",
    tag: "On-chain Proof",
    title: "Every delivery is verified",
    desc: "A permissioned reporter confirms impressions on ARC Network. Neither party can manipulate the count or seize the funds unilaterally.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const Landing: NextPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-base-200" style={{ fontFamily: "var(--font-sans)" }}>
      <Topbar variant="landing" />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        <Aurora
          colorStops={["#c7d9ff", "#246BF6", "#93c5fd"]}
          amplitude={1.0}
          blend={0.4}
          speed={0.35}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #246BF620 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Fade to bg at edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 20%, var(--color-base-200) 100%)",
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 py-20 grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-16 items-center">
          {/* Left: copy */}
          <div>
            <div
              className="inline-flex items-center gap-2.5 mb-8 px-3.5 py-1.5 rounded-full border"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-primary)",
                borderColor: "color-mix(in srgb, var(--color-primary) 25%, transparent)",
                background: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "var(--color-primary)" }}
              />
              Powered by AI agents · ARC Network
            </div>

            <h1
              className="font-extrabold leading-[0.92] tracking-tight mb-6"
              style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", color: "var(--color-neutral)" }}
            >
              <BlurText text="Agent-powered" immediate delay={70} />
              <br />
              <span style={{ color: "var(--color-primary)" }}>
                <BlurText text="ads without" immediate delay={70} duration={550} />
              </span>
              <br />
              <BlurText text="gatekeepers." immediate delay={70} duration={600} />
            </h1>

            <p
              className="leading-relaxed mb-10 max-w-lg"
              style={{ fontSize: "1.125rem", color: "color-mix(in srgb, var(--color-base-content) 55%, transparent)" }}
            >
              Publishers list their sites. Advertisers find them via AI. Payments stream on-chain per verified
              impression. No middlemen. No 30% cuts.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                className="btn btn-primary btn-lg"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
                onClick={() => router.push("/publisher/onboard")}
              >
                List your site →
              </button>
              <button
                className="btn btn-outline btn-lg"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
                onClick={() => router.push("/advertiser/onboard")}
              >
                Launch a campaign
              </button>
            </div>

            <p
              className="mt-10"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "color-mix(in srgb, var(--color-base-content) 30%, transparent)",
              }}
            >
              Open · Permissionless · On-chain
            </p>
          </div>

          {/* Right: live feed card */}
          <div className="hidden lg:block">
            <LiveFeed />
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-base-100 border-t border-base-300">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 flex items-center gap-4">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "color-mix(in srgb, var(--color-base-content) 35%, transparent)",
              }}
            >
              How it works
            </span>
            <span className="flex-1 h-px bg-base-300" />
          </div>

          <div className="space-y-0">
            {STEPS.map(step => (
              <div
                key={step.n}
                className="group grid grid-cols-[auto_1fr] gap-x-8 md:gap-x-14 items-start border-t border-base-300 py-10 md:py-12"
              >
                {/* Big step number */}
                <div
                  className="select-none leading-none transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "clamp(3.5rem, 8vw, 6rem)",
                    color: "color-mix(in srgb, var(--color-primary) 18%, transparent)",
                  }}
                >
                  {step.n}
                </div>

                {/* Content */}
                <div className="pt-2 md:pt-3">
                  <div
                    className="mb-2"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-primary)",
                    }}
                  >
                    {step.tag}
                  </div>
                  <h3
                    className="font-bold mb-3 leading-tight"
                    style={{ fontSize: "clamp(1.3rem, 3vw, 1.75rem)", color: "var(--color-neutral)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="leading-relaxed m-0 max-w-lg"
                    style={{
                      fontSize: "0.9375rem",
                      color: "color-mix(in srgb, var(--color-base-content) 55%, transparent)",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats band ────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: "#1C283B" }}>
        <Particles
          particleCount={150}
          particleColors={["#246BF6", "#5a8cff", "#3d7aff"]}
          particleBaseSize={45}
          speed={0.025}
          disableRotation
          cameraDistance={22}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <p
            className="text-center mb-14"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            AdFlow Network · Live Stats
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { end: 2400, suffix: "+", label: "Publishers listed" },
              { end: 500, prefix: "$", suffix: "K+", label: "USDC in escrow" },
              { end: 0, suffix: "%", label: "Intermediary fees" },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center gap-3">
                <span
                  className="font-extrabold leading-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(2.5rem, 6vw, 3.75rem)",
                    color: "#246BF6",
                  }}
                >
                  <CountUp end={stat.end} prefix={stat.prefix ?? ""} suffix={stat.suffix} duration={1800} />
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Split CTA ─────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* Publishers — primary blue */}
        <div
          className="flex flex-col px-10 md:px-16 py-20"
          style={{ background: "var(--color-primary)" }}
        >
          <span
            className="mb-5"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            For Publishers
          </span>
          <h2
            className="font-extrabold leading-tight mb-5"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", color: "#ffffff" }}
          >
            Earn USDC for every verified impression
          </h2>
          <p
            className="leading-relaxed mb-10"
            style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.65)", maxWidth: "28rem" }}
          >
            List your site in minutes. AI matches you with advertisers your audience actually cares about. Payments
            stream automatically per 1,000 impressions.
          </p>
          <button
            className="btn btn-lg self-start mt-auto"
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              background: "#ffffff",
              color: "var(--color-primary)",
              border: "none",
            }}
            onClick={() => router.push("/publisher/onboard")}
          >
            List your site →
          </button>
        </div>

        {/* Advertisers — dark navy */}
        <div
          className="flex flex-col px-10 md:px-16 py-20"
          style={{ background: "#1C283B" }}
        >
          <span
            className="mb-5"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            For Advertisers
          </span>
          <h2
            className="font-extrabold leading-tight mb-5"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", color: "#ffffff" }}
          >
            Find your audience without paying middlemen
          </h2>
          <p
            className="leading-relaxed mb-10"
            style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.5)", maxWidth: "28rem" }}
          >
            AI discovers the right publishers from thousands of options. Lock budget in escrow, then pay only per
            verified impression. No guesswork, no wasted spend.
          </p>
          <button
            className="btn btn-primary btn-lg self-start mt-auto"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
            onClick={() => router.push("/advertiser/onboard")}
          >
            Launch a campaign →
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="flex flex-col md:flex-row items-center justify-between px-10 py-6 border-t border-base-300 gap-4"
        style={{ background: "var(--color-base-200)" }}
      >
        <div className="flex items-center gap-2">
          <Image src="/adflow-logo.png" alt="AdFlow logo" width={24} height={24} className="rounded-sm" />
          <span
            className="font-bold text-sm"
            style={{ color: "var(--color-neutral)", fontFamily: "var(--font-sans)" }}
          >
            AdFlow
          </span>
        </div>
        <p
          className="m-0"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.08em",
            color: "color-mix(in srgb, var(--color-base-content) 35%, transparent)",
          }}
        >
          Open · Permissionless · On-chain
        </p>
        <button
          className="btn btn-ghost btn-sm"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
          onClick={() => router.push("/control")}
        >
          Control Panel
        </button>
      </footer>
    </div>
  );
};

export default Landing;
