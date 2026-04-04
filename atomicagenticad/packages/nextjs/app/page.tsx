"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { Topbar } from "~~/components/adflow/Topbar";

const Aurora = dynamic(() => import("~~/components/bits/Aurora").then(m => ({ default: m.Aurora })), { ssr: false });

// ─── Feature card icons ───────────────────────────────────────────────────────

const IconAgent = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    {/* Central node */}
    <circle cx="24" cy="24" r="5" fill="#2563eb" />
    {/* Orbit ring */}
    <circle cx="24" cy="24" r="12" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
    {/* Satellite nodes */}
    <circle cx="24" cy="12" r="3" fill="#2563eb" opacity="0.7" />
    <circle cx="35" cy="30" r="3" fill="#2563eb" opacity="0.7" />
    <circle cx="13" cy="30" r="3" fill="#2563eb" opacity="0.7" />
    {/* Connection lines */}
    <line x1="24" y1="19" x2="24" y2="15" stroke="#bfdbfe" strokeWidth="1.5" />
    <line x1="28.5" y1="27" x2="32.5" y2="29" stroke="#bfdbfe" strokeWidth="1.5" />
    <line x1="19.5" y1="27" x2="15.5" y2="29" stroke="#bfdbfe" strokeWidth="1.5" />
    {/* Outer ring pulse */}
    <circle cx="24" cy="24" r="20" stroke="#dbeafe" strokeWidth="1" />
  </svg>
);

const IconStream = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    {/* Lightning bolt */}
    <path d="M26 6L14 26h10l-2 16L38 22H28L26 6z" fill="#2563eb" />
    {/* Speed lines */}
    <line x1="6" y1="18" x2="11" y2="18" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="4" y1="24" x2="10" y2="24" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6" y1="30" x2="11" y2="30" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    {/* Coin circles */}
    <circle cx="41" cy="16" r="4" stroke="#bfdbfe" strokeWidth="1.5" />
    <text x="41" y="20" textAnchor="middle" fontSize="5" fill="#2563eb" fontWeight="bold">$</text>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
    {/* Shield body */}
    <path
      d="M24 4L8 10v14c0 9 7 16.5 16 20 9-3.5 16-11 16-20V10L24 4z"
      fill="#dbeafe"
      stroke="#2563eb"
      strokeWidth="1.5"
    />
    {/* Shield fill gradient effect */}
    <path
      d="M24 8L11 13v11c0 7 5.5 13 13 16.5 7.5-3.5 13-9.5 13-16.5V13L24 8z"
      fill="#bfdbfe"
      opacity="0.5"
    />
    {/* Checkmark */}
    <path d="M16 24l5 5 10-10" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Link icon at bottom */}
    <circle cx="38" cy="38" r="6" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5" />
    <path d="M35.5 38h5M38 35.5v5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FEATURES = [
  {
    step: "01",
    icon: <IconAgent />,
    gradient: "from-blue-50 to-indigo-50",
    ring: "bg-blue-100",
    title: "Agentic Matching",
    desc: "AI agents discover and verify the perfect publisher-advertiser fit. No manual browsing, no guesswork.",
  },
  {
    step: "02",
    icon: <IconStream />,
    gradient: "from-sky-50 to-blue-50",
    ring: "bg-sky-100",
    title: "Streaming Payments",
    desc: "USDC flows per 1,000 impressions via on-chain escrow. No invoicing, no 30-day waits.",
  },
  {
    step: "03",
    icon: <IconShield />,
    gradient: "from-indigo-50 to-blue-50",
    ring: "bg-indigo-100",
    title: "Escrow Protected",
    desc: "Funds locked in Chainlink-verified smart contracts. Neither party can seize them unilaterally.",
  },
];

const Landing: NextPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-base-200">
      <Topbar variant="landing" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 min-h-[calc(100vh-4rem)] overflow-hidden">

        {/* Aurora — flowing WebGL light waves (react-bits) */}
        <Aurora
          colorStops={["#dbeafe", "#93c5fd", "#2563eb"]}
          amplitude={1.2}
          blend={0.5}
          speed={0.5}
        />

        {/* Dot-grid overlay — DePINed-style grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #93c5fd 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.35,
          }}
        />

        {/* Radial vignette so edges fade to white */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, #eff6ff 100%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Powered by AI agents &amp; Chainlink
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-base-content mb-6">
            Atomic Agentic{" "}
            <span className="text-primary">Ads</span>
          </h1>

          <p className="text-lg md:text-xl text-base-content/60 max-w-xl mx-auto leading-relaxed mb-10">
            Agent-powered publisher discovery, blockchain-secured payments. Connect with the right audience, no
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
              className="btn btn-outline btn-lg border-base-300 bg-base-100/80 text-base-content hover:bg-base-200"
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

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-base-100 border-t border-base-300">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-base-content/40 uppercase tracking-widest font-semibold mb-16">
            How it works
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

            {FEATURES.map(f => (
              <div
                key={f.title}
                className={`group relative rounded-2xl border border-base-300 bg-gradient-to-br ${f.gradient} p-7 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 cursor-default overflow-hidden`}
              >
                {/* Large step watermark */}
                <span className="absolute top-4 right-5 text-6xl font-black text-primary/8 leading-none select-none">
                  {f.step}
                </span>

                {/* Icon ring */}
                <div className={`relative z-10 w-14 h-14 rounded-2xl ${f.ring} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  {f.icon}
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-base-content text-lg mb-1.5">{f.title}</h3>
                  <p className="text-sm text-base-content/60 leading-relaxed m-0">{f.desc}</p>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ─────────────────────────────────────────────────────── */}
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
