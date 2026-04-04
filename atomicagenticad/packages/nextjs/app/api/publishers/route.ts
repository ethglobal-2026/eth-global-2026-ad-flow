import { NextRequest, NextResponse } from "next/server";
import {
  createPublisher,
  getPublisherByEmail,
  getPublisherByWalletAddress,
  getPublishers,
  normalizePublisherEmail,
} from "~~/services/database/repositories/publishers";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

export type PublishersResponse = Awaited<ReturnType<typeof getPublishers>>;

export type CreatePublisherResponse = Awaited<ReturnType<typeof createPublisher>>;

/** POST body for publisher onboarding. `walletAddress` is optional until email-to-wallet (e.g. Dynamic) is wired. */
export type CreatePublisherRequest = {
  email: string;
  siteUrl: string;
  category: string;
  qualityScore: number;
  floorPricePer1kUsd: string;
  adFormat: string;
  blockedCategories: string[];
  preferredAdvertiserTypes: string[];
  walletAddress?: string;
  name?: string;
  contentFocus?: string;
  language?: string;
  estimatedMonthlyTraffic?: string;
  audience?: string;
};

const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(item => typeof item === "string");
}

function siteDisplayName(siteUrl: string): string {
  try {
    const normalized = siteUrl.startsWith("http://") || siteUrl.startsWith("https://") ? siteUrl : `https://${siteUrl}`;
    const u = new URL(normalized);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "My site";
  }
}

function trunc(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max);
}

function parseQualityScore(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseFloat(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function publisherRouteError(err: unknown): { status: number; error: string } {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (msg.includes("POSTGRES_URL is not configured")) {
    return {
      status: 503,
      error:
        "Database not configured. Add POSTGRES_URL to packages/nextjs/.env.local (Neon or local Postgres), restart the dev server, then run yarn db:migrate from packages/nextjs.",
    };
  }

  if (
    (lower.includes("relation") && lower.includes("does not exist")) ||
    (lower.includes("column") && lower.includes("does not exist")) ||
    lower.includes("42703") /* undefined_column */
  ) {
    return {
      status: 503,
      error: "Database schema is missing or outdated. From packages/nextjs run: yarn db:migrate",
    };
  }

  if (lower.includes("value too long") || lower.includes("22001")) {
    return { status: 400, error: "One of the fields is too long for the database. Try a shorter site URL or re-run analysis." };
  }

  if (lower.includes("econnrefused") || lower.includes("enotfound") || lower.includes("getaddrinfo")) {
    return { status: 503, error: "Cannot connect to PostgreSQL. Check POSTGRES_URL and network access." };
  }

  if (process.env.NODE_ENV === "development") {
    return { status: 500, error: msg };
  }

  return { status: 500, error: "Internal server error" };
}

export async function GET() {
  try {
    loadNextAppEnvLocalFallback();
    const publishers = await getPublishers();
    return NextResponse.json(publishers);
  } catch (err) {
    console.error("[publishers] GET", err);
    const { status, error } = publisherRouteError(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await create(request);
  } catch (err) {
    console.error("[publishers] POST", err);
    const { status, error } = publisherRouteError(err);
    return NextResponse.json({ error }, { status });
  }
}

async function create(request: NextRequest) {
  loadNextAppEnvLocalFallback();

  const body = await request.json();

  const {
    email,
    walletAddress,
    siteUrl,
    name,
    category,
    qualityScore,
    contentFocus,
    language,
    estimatedMonthlyTraffic,
    audience,
    floorPricePer1kUsd,
    adFormat,
    blockedCategories,
    preferredAdvertiserTypes,
  } = body ?? {};

  if (typeof email !== "string" || !email.trim().includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  if (typeof siteUrl !== "string" || !siteUrl.trim()) {
    return NextResponse.json({ error: "siteUrl is required" }, { status: 400 });
  }

  if (typeof category !== "string" || !category.trim()) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }

  const parsedScore = parseQualityScore(qualityScore);
  if (parsedScore === null) {
    return NextResponse.json({ error: "qualityScore must be a number" }, { status: 400 });
  }

  if (typeof floorPricePer1kUsd !== "string" || !floorPricePer1kUsd.trim()) {
    return NextResponse.json({ error: "floorPricePer1kUsd is required" }, { status: 400 });
  }

  if (typeof adFormat !== "string" || !adFormat.trim()) {
    return NextResponse.json({ error: "adFormat is required" }, { status: 400 });
  }

  if (!isStringArray(blockedCategories) || !isStringArray(preferredAdvertiserTypes)) {
    return NextResponse.json({ error: "blockedCategories and preferredAdvertiserTypes must be string arrays" }, { status: 400 });
  }

  if (walletAddress !== undefined && walletAddress !== null) {
    if (typeof walletAddress !== "string" || !ETH_ADDRESS_RE.test(walletAddress)) {
      return NextResponse.json({ error: "walletAddress must be a valid 0x-prefixed address" }, { status: 400 });
    }
  }

  const normalizedEmail = normalizePublisherEmail(email);

  const existingByEmail = await getPublisherByEmail(normalizedEmail);
  if (existingByEmail) {
    return NextResponse.json({ error: "A publisher listing already exists for this email" }, { status: 409 });
  }

  if (typeof walletAddress === "string" && ETH_ADDRESS_RE.test(walletAddress)) {
    const existingByWallet = await getPublisherByWalletAddress(walletAddress);
    if (existingByWallet) {
      return NextResponse.json({ error: "Publisher already exists for this wallet" }, { status: 409 });
    }
  }

  const displayNameRaw = typeof name === "string" && name.trim() ? name.trim() : siteDisplayName(siteUrl);
  const displayName = trunc(displayNameRaw, 255);
  const score = Math.min(10, Math.max(0, Math.round(parsedScore)));

  const publisher = await createPublisher({
    email: trunc(normalizedEmail, 255),
    walletAddress: typeof walletAddress === "string" && ETH_ADDRESS_RE.test(walletAddress) ? walletAddress : null,
    siteUrl: siteUrl.trim(),
    name: displayName,
    category: trunc(category.trim(), 120),
    qualityScore: score,
    contentFocus: typeof contentFocus === "string" ? contentFocus : null,
    language: typeof language === "string" ? trunc(language.trim(), 64) : null,
    estimatedMonthlyTraffic:
      typeof estimatedMonthlyTraffic === "string" ? trunc(estimatedMonthlyTraffic.trim(), 120) : null,
    audience: typeof audience === "string" ? audience : null,
    floorPricePer1kUsd: trunc(floorPricePer1kUsd.trim(), 32),
    adFormat: trunc(adFormat.trim(), 64),
    blockedCategories,
    preferredAdvertiserTypes,
  });

  return NextResponse.json(publisher, { status: 201 });
}
