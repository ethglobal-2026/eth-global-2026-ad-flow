import { NextRequest, NextResponse } from "next/server";
import { getAdvertiserCampaignById, updateAdvertiserCampaignOnchainData } from "~~/services/database/repositories/advertiserCampaigns";
import { getAdvertiserById } from "~~/services/database/repositories/advertisers";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

export type UpdateAdvertiserCampaignOnchainRequest = {
  onchainPublisherId: string;
  onchainDealId: string;
  escrowAddress: string;
  fundingTxHash: string;
  fundedAmountWei: string;
};

export type UpdateAdvertiserCampaignOnchainResponse = NonNullable<
  Awaited<ReturnType<typeof updateAdvertiserCampaignOnchainData>>
>;

type RouteContext = { params: Promise<{ id: string; campaignId: string }> };

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

export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const body = (await request.json()) as UpdateAdvertiserCampaignOnchainRequest;
    const { onchainPublisherId, onchainDealId, escrowAddress, fundingTxHash, fundedAmountWei } = body;

    if (typeof onchainPublisherId !== "string" || !UINT256_DECIMAL_RE.test(onchainPublisherId)) {
      return NextResponse.json({ error: "onchainPublisherId must be a valid uint256 decimal string" }, { status: 400 });
    }

    if (typeof onchainDealId !== "string" || !UINT256_DECIMAL_RE.test(onchainDealId)) {
      return NextResponse.json({ error: "onchainDealId must be a valid uint256 decimal string" }, { status: 400 });
    }

    if (typeof escrowAddress !== "string" || !ETH_ADDRESS_RE.test(escrowAddress)) {
      return NextResponse.json({ error: "escrowAddress must be a valid 0x address" }, { status: 400 });
    }

    if (typeof fundingTxHash !== "string" || !TX_HASH_RE.test(fundingTxHash)) {
      return NextResponse.json({ error: "fundingTxHash must be a valid transaction hash" }, { status: 400 });
    }

    if (typeof fundedAmountWei !== "string" || !UINT256_DECIMAL_RE.test(fundedAmountWei)) {
      return NextResponse.json({ error: "fundedAmountWei must be a valid uint256 decimal string" }, { status: 400 });
    }

    const updated = await updateAdvertiserCampaignOnchainData(campaignId, id, {
      onchainPublisherId: trunc(onchainPublisherId, 78),
      onchainDealId: trunc(onchainDealId, 78),
      escrowAddress: escrowAddress.toLowerCase(),
      fundingTxHash: fundingTxHash.toLowerCase(),
      fundedAmountWei: trunc(fundedAmountWei, 78),
    });

    if (!updated) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[advertisers/id/campaigns/campaignId/onchain] PATCH", err);
    const { status, error } = routeError(err);
    return NextResponse.json({ error }, { status });
  }
}
