import { NextRequest, NextResponse } from "next/server";
import {
  createAdvertiserCampaignDeal,
  listDealsForCampaign,
} from "~~/services/database/repositories/advertiserCampaignDeals";
import { getAdvertiserCampaignById } from "~~/services/database/repositories/advertiserCampaigns";
import { getAdvertiserById } from "~~/services/database/repositories/advertisers";
import { getPublisherById } from "~~/services/database/repositories/publishers";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

export type AdvertiserCampaignDealsListResponse = Awaited<ReturnType<typeof listDealsForCampaign>>;

export type CreateAdvertiserCampaignDealResponse = Awaited<ReturnType<typeof createAdvertiserCampaignDeal>>;

export type CreateAdvertiserCampaignDealRequest = {
  publisherId: string;
  onchainPublisherId: string;
  onchainDealId: string;
  escrowAddress: string;
  txHash: string;
  fundedAmountWei: string;
  maxImpressions: number;
  status?: "funded" | "pending" | "failed";
};

type RouteContext = { params: Promise<{ id: string; campaignId: string }> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;
const UINT256_DECIMAL_RE = /^(0|[1-9]\d{0,77})$/;

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

    const deals = await listDealsForCampaign(campaignId);
    return NextResponse.json(deals);
  } catch (err) {
    console.error("[advertisers/id/campaigns/campaignId/deals] GET", err);
    const { status, error } = routeError(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
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

    const body = (await request.json()) as CreateAdvertiserCampaignDealRequest;
    const { publisherId, onchainPublisherId, onchainDealId, escrowAddress, txHash, fundedAmountWei, maxImpressions, status } =
      body;

    if (typeof publisherId !== "string" || !UUID_RE.test(publisherId)) {
      return NextResponse.json({ error: "publisherId must be a valid UUID" }, { status: 400 });
    }

    if (!campaign.selectedPublisherIds.includes(publisherId)) {
      return NextResponse.json({ error: "publisherId is not selected for this campaign" }, { status: 400 });
    }

    if (typeof onchainPublisherId !== "string" || !UINT256_DECIMAL_RE.test(onchainPublisherId)) {
      return NextResponse.json({ error: "onchainPublisherId must be a valid uint256 decimal string" }, { status: 400 });
    }

    if (typeof onchainDealId !== "string" || !UINT256_DECIMAL_RE.test(onchainDealId)) {
      return NextResponse.json({ error: "onchainDealId must be a valid uint256 decimal string" }, { status: 400 });
    }

    if (typeof escrowAddress !== "string" || !ETH_ADDRESS_RE.test(escrowAddress)) {
      return NextResponse.json({ error: "escrowAddress must be a valid 0x address" }, { status: 400 });
    }

    if (typeof txHash !== "string" || !TX_HASH_RE.test(txHash)) {
      return NextResponse.json({ error: "txHash must be a valid transaction hash" }, { status: 400 });
    }

    if (typeof fundedAmountWei !== "string" || !UINT256_DECIMAL_RE.test(fundedAmountWei)) {
      return NextResponse.json({ error: "fundedAmountWei must be a valid uint256 decimal string" }, { status: 400 });
    }

    if (typeof maxImpressions !== "number" || !Number.isInteger(maxImpressions) || maxImpressions <= 0) {
      return NextResponse.json({ error: "maxImpressions must be a positive integer" }, { status: 400 });
    }

    if (status !== undefined && status !== "funded" && status !== "pending" && status !== "failed") {
      return NextResponse.json({ error: "status must be one of: funded, pending, failed" }, { status: 400 });
    }

    const publisher = await getPublisherById(publisherId);
    if (!publisher) {
      return NextResponse.json({ error: "Publisher not found" }, { status: 400 });
    }

    const deal = await createAdvertiserCampaignDeal({
      campaignId,
      publisherId,
      onchainPublisherId: trunc(onchainPublisherId, 78),
      onchainDealId: trunc(onchainDealId, 78),
      escrowAddress: escrowAddress.toLowerCase(),
      txHash: txHash.toLowerCase(),
      fundedAmountWei: trunc(fundedAmountWei, 78),
      maxImpressions,
      status: status ?? "funded",
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (err) {
    console.error("[advertisers/id/campaigns/campaignId/deals] POST", err);
    const { status, error } = routeError(err);
    return NextResponse.json({ error }, { status });
  }
}
