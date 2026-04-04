import { NextRequest, NextResponse } from "next/server";
import {
  createAdvertiserCampaign,
  listAdvertiserCampaigns,
} from "~~/services/database/repositories/advertiserCampaigns";
import { getAdvertiserById } from "~~/services/database/repositories/advertisers";
import { getPublisherById } from "~~/services/database/repositories/publishers";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

export type AdvertiserCampaignsListResponse = Awaited<ReturnType<typeof listAdvertiserCampaigns>>;

export type CreateAdvertiserCampaignResponse = Awaited<ReturnType<typeof createAdvertiserCampaign>>;

export type CreateAdvertiserCampaignRequest = {
  productDescription: string;
  targetAudience: string;
  budgetUsdc: string;
  targetImpressions: number;
  creativeFileName?: string | null;
  /** Single publisher UUID chosen for this campaign. */
  selectedPublisherId: string;
};

type RouteContext = { params: Promise<{ id: string }> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
    (lower.includes("column") && lower.includes("does not exist")) ||
    lower.includes("failed query")
  ) {
    return {
      status: 503,
      error: "Database schema is outdated. From packages/nextjs run: npm run db:migrate (or yarn db:migrate).",
    };
  }

  if (process.env.NODE_ENV === "development") {
    return { status: 500, error: msg };
  }

  return { status: 500, error: "Internal server error" };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    loadNextAppEnvLocalFallback();
    const { id } = await context.params;
    const advertiser = await getAdvertiserById(id);
    if (!advertiser) {
      return NextResponse.json({ error: "Advertiser not found" }, { status: 404 });
    }
    const list = await listAdvertiserCampaigns(id);
    return NextResponse.json(list);
  } catch (err) {
    console.error("[advertisers/id/campaigns] GET", err);
    const { status, error } = routeError(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    loadNextAppEnvLocalFallback();
    const { id } = await context.params;
    const advertiser = await getAdvertiserById(id);
    if (!advertiser) {
      return NextResponse.json({ error: "Advertiser not found" }, { status: 404 });
    }

    const body = await request.json();
    const { productDescription, targetAudience, budgetUsdc, targetImpressions, creativeFileName, selectedPublisherId } =
      body as CreateAdvertiserCampaignRequest;

    if (typeof productDescription !== "string" || !productDescription.trim()) {
      return NextResponse.json({ error: "productDescription is required" }, { status: 400 });
    }

    if (typeof targetAudience !== "string" || !targetAudience.trim()) {
      return NextResponse.json({ error: "targetAudience is required" }, { status: 400 });
    }

    if (typeof budgetUsdc !== "string" || !budgetUsdc.trim()) {
      return NextResponse.json({ error: "budgetUsdc is required" }, { status: 400 });
    }

    const budgetNum = Number.parseFloat(budgetUsdc);
    if (Number.isNaN(budgetNum) || budgetNum <= 0) {
      return NextResponse.json({ error: "budgetUsdc must be a positive number" }, { status: 400 });
    }

    if (typeof targetImpressions !== "number" || !Number.isInteger(targetImpressions) || targetImpressions <= 0) {
      return NextResponse.json({ error: "targetImpressions must be a positive integer" }, { status: 400 });
    }

    if (creativeFileName !== undefined && creativeFileName !== null && typeof creativeFileName !== "string") {
      return NextResponse.json({ error: "creativeFileName must be a string" }, { status: 400 });
    }

    if (typeof selectedPublisherId !== "string" || !UUID_RE.test(selectedPublisherId)) {
      return NextResponse.json({ error: "selectedPublisherId must be a valid publisher UUID" }, { status: 400 });
    }
    const pub = await getPublisherById(selectedPublisherId);
    if (!pub) {
      return NextResponse.json({ error: `Publisher not found: ${selectedPublisherId}` }, { status: 400 });
    }

    const campaign = await createAdvertiserCampaign({
      advertiserId: id,
      productDescription: productDescription.trim(),
      targetAudience: targetAudience.trim(),
      budgetUsdc: trunc(budgetUsdc.trim(), 32),
      targetImpressions,
      creativeFileName:
        typeof creativeFileName === "string" && creativeFileName.trim() ? trunc(creativeFileName.trim(), 512) : null,
      selectedPublisherId,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    console.error("[advertisers/id/campaigns] POST", err);
    const { status, error } = routeError(err);
    return NextResponse.json({ error }, { status });
  }
}
