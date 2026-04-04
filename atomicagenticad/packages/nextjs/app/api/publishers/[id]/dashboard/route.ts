import { NextResponse } from "next/server";
import { getAdvertiserCampaignsByPublisherId } from "~~/services/database/repositories/advertiserCampaigns";
import { getPublisherById } from "~~/services/database/repositories/publishers";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";
import type { Publisher } from "~~/types/adflow";

export type PublisherDashboardCampaign = {
  id: string;
  advertiserName: string;
  impressionsTotal: number;
  budgetUsdc: string;
  fundedAmountWei: string | null;
  escrowAddress: string | null;
  status: string;
};

export type PublisherDashboardStats = {
  activeCampaignCount: number;
  escrowPendingUsdc: string;
  floorPricePer1kUsd: string;
};

export type PublisherDashboardResponse = {
  publisher: Publisher;
  campaigns: PublisherDashboardCampaign[];
  stats: PublisherDashboardStats;
};

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    loadNextAppEnvLocalFallback();

    const { id } = await context.params;
    const publisher = await getPublisherById(id);

    if (!publisher) {
      return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
    }

    const rows = await getAdvertiserCampaignsByPublisherId(id);

    const campaigns: PublisherDashboardCampaign[] = rows.map(r => ({
      id: r.id,
      advertiserName: r.advertiserName,
      impressionsTotal: r.targetImpressions,
      budgetUsdc: r.budgetUsdc,
      fundedAmountWei: r.fundedAmountWei,
      escrowAddress: r.escrowAddress,
      status: r.escrowAddress ? "active" : "pending",
    }));

    const activeCampaigns = campaigns.filter(c => c.escrowAddress);
    const escrowPendingUsdc = activeCampaigns
      .reduce((s, c) => s + Number.parseFloat(c.budgetUsdc || "0"), 0)
      .toFixed(2);

    const body: PublisherDashboardResponse = {
      publisher,
      campaigns,
      stats: {
        activeCampaignCount: activeCampaigns.length,
        escrowPendingUsdc,
        floorPricePer1kUsd: publisher.floorPricePer1kUsd,
      },
    };

    return NextResponse.json(body);
  } catch (err) {
    console.error("[publishers/id/dashboard]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
