import { NextResponse } from "next/server";
import { getCampaignsByPublisherId } from "~~/services/database/repositories/publisherCampaigns";
import { getPublisherById } from "~~/services/database/repositories/publishers";
import { loadNextAppEnvLocalFallback } from "~~/utils/server/loadNextAppEnvLocalFallback";
import type { Publisher } from "~~/types/adflow";

export type PublisherDashboardCampaign = {
  id: string;
  advertiserName: string;
  advertiserCategory: string | null;
  impressionsServed: number;
  impressionsTotal: number;
  revenueUsdc: string;
  status: string;
};

export type PublisherDashboardStats = {
  totalRevenueUsdc: string;
  impressionsServed: number;
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

function sumRevenueUsdc(campaigns: { revenueUsdc: string }[]): string {
  const n = campaigns.reduce((s, c) => s + Number.parseFloat(c.revenueUsdc || "0"), 0);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
}

function escrowPendingUsdc(publisher: Publisher, campaigns: { impressionsServed: number; impressionsTotal: number }[]): string {
  const floor = Number.parseFloat(publisher.floorPricePer1kUsd || "0");
  const unpaid = campaigns.reduce((s, c) => s + Math.max(0, c.impressionsTotal - c.impressionsServed), 0);
  const v = (unpaid / 1000) * (Number.isNaN(floor) ? 0 : floor);
  return v.toFixed(2);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    loadNextAppEnvLocalFallback();

    const { id } = await context.params;
    const publisher = await getPublisherById(id);

    if (!publisher) {
      return NextResponse.json({ error: "Publisher not found" }, { status: 404 });
    }

    const rows = await getCampaignsByPublisherId(id);
    const campaigns: PublisherDashboardCampaign[] = rows.map(r => ({
      id: r.id,
      advertiserName: r.advertiserName,
      advertiserCategory: r.advertiserCategory,
      impressionsServed: r.impressionsServed,
      impressionsTotal: r.impressionsTotal,
      revenueUsdc: r.revenueUsdc,
      status: r.status,
    }));

    const impressionsServed = campaigns.reduce((s, c) => s + c.impressionsServed, 0);
    const activeCampaignCount = campaigns.filter(c => c.status === "active").length;

    const body: PublisherDashboardResponse = {
      publisher,
      campaigns,
      stats: {
        totalRevenueUsdc: sumRevenueUsdc(campaigns),
        impressionsServed,
        activeCampaignCount,
        escrowPendingUsdc: escrowPendingUsdc(publisher, campaigns),
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
