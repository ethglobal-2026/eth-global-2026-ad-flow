import { NextResponse } from "next/server";
import { getAdvertiserCampaignById } from "~~/services/database/repositories/advertiserCampaigns";
import { getAdvertiserById } from "~~/services/database/repositories/advertisers";
import { getPublisherById } from "~~/services/database/repositories/publishers";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

export type AdvertiserCampaignDetailResponse = {
  campaign: NonNullable<Awaited<ReturnType<typeof getAdvertiserCampaignById>>>;
  publisher: Awaited<ReturnType<typeof getPublisherById>>;
};

type RouteContext = { params: Promise<{ id: string; campaignId: string }> };

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
      error: "Database schema is outdated. From packages/nextjs run: yarn db:migrate.",
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
    const { id, campaignId } = await context.params;

    const advertiser = await getAdvertiserById(id);
    if (!advertiser) {
      return NextResponse.json({ error: "Advertiser not found" }, { status: 404 });
    }

    const campaign = await getAdvertiserCampaignById(campaignId);
    if (!campaign || campaign.advertiserId !== id) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const publisher = campaign.selectedPublisherId ? await getPublisherById(campaign.selectedPublisherId) : undefined;

    const payload: AdvertiserCampaignDetailResponse = {
      campaign,
      publisher,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[advertisers/id/campaigns/campaignId] GET", err);
    const { status, error } = routeError(err);
    return NextResponse.json({ error }, { status });
  }
}
