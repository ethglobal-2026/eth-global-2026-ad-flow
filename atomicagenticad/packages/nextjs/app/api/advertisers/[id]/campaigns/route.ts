import { NextRequest, NextResponse } from "next/server";
import {
  createAdvertiserCampaign,
  listAdvertiserCampaigns,
} from "~~/services/database/repositories/advertiserCampaigns";
import { getAdvertiserById } from "~~/services/database/repositories/advertisers";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

export type AdvertiserCampaignsListResponse = Awaited<ReturnType<typeof listAdvertiserCampaigns>>;

export type CreateAdvertiserCampaignResponse = Awaited<ReturnType<typeof createAdvertiserCampaign>>;

export type CreateAdvertiserCampaignRequest = {
  productDescription: string;
  targetAudience: string;
  budgetUsdc: string;
  targetImpressions: number;
  creativeFileName?: string | null;
};

type RouteContext = { params: Promise<{ id: string }> };

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
    const { productDescription, targetAudience, budgetUsdc, targetImpressions, creativeFileName } =
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

    const campaign = await createAdvertiserCampaign({
      advertiserId: id,
      productDescription: productDescription.trim(),
      targetAudience: targetAudience.trim(),
      budgetUsdc: trunc(budgetUsdc.trim(), 32),
      targetImpressions,
      creativeFileName:
        typeof creativeFileName === "string" && creativeFileName.trim() ? trunc(creativeFileName.trim(), 512) : null,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    console.error("[advertisers/id/campaigns] POST", err);
    const { status, error } = routeError(err);
    return NextResponse.json({ error }, { status });
  }
}
