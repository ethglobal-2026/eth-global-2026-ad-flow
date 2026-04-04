import { NextRequest, NextResponse } from "next/server";
import {
  createAdvertiser,
  getAdvertiserByEmail,
  getAdvertiserByWallet,
  getAdvertisers,
  normalizeAdvertiserEmail,
} from "~~/services/database/repositories/advertisers";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

export type AdvertisersListResponse = Awaited<ReturnType<typeof getAdvertisers>>;

export type CreateAdvertiserResponse = Awaited<ReturnType<typeof createAdvertiser>>;

/** POST body: first-time advertiser account (wallet + profile). Campaigns are created separately. */
export type CreateAdvertiserRequest = {
  email: string;
  walletAddress: string;
  displayName: string;
  companyName?: string | null;
  about?: string | null;
};

const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

function trunc(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max);
}

function routeError(err: unknown): { status: number; error: string } {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (msg.includes("POSTGRES_URL is not configured")) {
    return {
      status: 503,
      error:
        "Database not configured. Add POSTGRES_URL to packages/nextjs/.env.local and restart, or use dev without Postgres for in-memory mode.",
    };
  }

  if (
    (lower.includes("relation") && lower.includes("does not exist")) ||
    (lower.includes("column") && lower.includes("does not exist"))
  ) {
    return { status: 503, error: "Database schema is outdated. From packages/nextjs run: yarn db:migrate" };
  }

  if (process.env.NODE_ENV === "development") {
    return { status: 500, error: msg };
  }

  return { status: 500, error: "Internal server error" };
}

export async function GET() {
  try {
    loadNextAppEnvLocalFallback();
    const list = await getAdvertisers();
    return NextResponse.json(list);
  } catch (err) {
    console.error("[advertisers] GET", err);
    const { status, error } = routeError(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await createHandler(request);
  } catch (err) {
    console.error("[advertisers] POST", err);
    const { status, error } = routeError(err);
    return NextResponse.json({ error }, { status });
  }
}

async function createHandler(request: NextRequest) {
  loadNextAppEnvLocalFallback();

  const body = await request.json();
  const { email, walletAddress, displayName, companyName, about } = body as CreateAdvertiserRequest;

  if (typeof email !== "string" || !email.trim().includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  if (typeof walletAddress !== "string" || !ETH_ADDRESS_RE.test(walletAddress.trim())) {
    return NextResponse.json({ error: "A valid 0x-prefixed wallet address is required" }, { status: 400 });
  }

  if (typeof displayName !== "string" || !displayName.trim()) {
    return NextResponse.json({ error: "displayName is required" }, { status: 400 });
  }

  if (companyName !== undefined && companyName !== null && typeof companyName !== "string") {
    return NextResponse.json({ error: "companyName must be a string" }, { status: 400 });
  }

  if (about !== undefined && about !== null && typeof about !== "string") {
    return NextResponse.json({ error: "about must be a string" }, { status: 400 });
  }

  const normalizedEmail = normalizeAdvertiserEmail(email);
  const walletKey = walletAddress.trim().toLowerCase();

  const existingEmail = await getAdvertiserByEmail(normalizedEmail);
  if (existingEmail) {
    return NextResponse.json({ error: "An advertiser profile already exists for this email" }, { status: 409 });
  }

  const existingWallet = await getAdvertiserByWallet(walletKey);
  if (existingWallet) {
    return NextResponse.json({ error: "This wallet is already linked to an advertiser profile" }, { status: 409 });
  }

  const advertiser = await createAdvertiser({
    email: trunc(normalizedEmail, 255),
    walletAddress: walletKey,
    displayName: trunc(displayName.trim(), 255),
    companyName: typeof companyName === "string" && companyName.trim() ? trunc(companyName.trim(), 255) : null,
    about: typeof about === "string" && about.trim() ? about.trim() : null,
  });

  return NextResponse.json(advertiser, { status: 201 });
}
