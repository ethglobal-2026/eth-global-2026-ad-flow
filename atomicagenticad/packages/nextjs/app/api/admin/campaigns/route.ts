import { NextResponse } from "next/server";
import { getAllFundedCampaigns } from "~~/services/database/repositories/advertiserCampaigns";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";

export type AdminCampaign = {
  id: string;
  advertiserName: string;
  publisherName: string | null;
  escrowAddress: string;
  targetImpressions: number;
  fundedAmountWei: string;
};

export type AdminCampaignsResponse = AdminCampaign[];

export async function GET() {
  try {
    loadNextAppEnvLocalFallback();

    const rows = await getAllFundedCampaigns();

    const campaigns: AdminCampaignsResponse = rows
      .filter(r => r.escrowAddress)
      .map(r => ({
        id: r.id,
        advertiserName: r.advertiserName,
        publisherName: r.publisherName,
        escrowAddress: r.escrowAddress!,
        targetImpressions: r.targetImpressions,
        fundedAmountWei: r.fundedAmountWei ?? "0",
      }));

    return NextResponse.json(campaigns);
  } catch (err) {
    console.error("[admin/campaigns]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
