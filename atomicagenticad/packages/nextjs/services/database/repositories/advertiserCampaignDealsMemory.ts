import { randomUUID } from "node:crypto";
import type { InferInsertModel } from "drizzle-orm";
import { advertiserCampaignDeals } from "~~/services/database/config/schema";
import type { AdvertiserCampaignDeal } from "~~/types/adflow";

type Insert = InferInsertModel<typeof advertiserCampaignDeals>;

const store: AdvertiserCampaignDeal[] = [];

export function memoryListDealsForCampaign(campaignId: string): AdvertiserCampaignDeal[] {
  return [...store]
    .filter(d => d.campaignId === campaignId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function memoryCreateAdvertiserCampaignDeal(values: Insert): AdvertiserCampaignDeal {
  const now = new Date();
  const row: AdvertiserCampaignDeal = {
    id: randomUUID(),
    createdAt: now,
    campaignId: values.campaignId,
    publisherId: values.publisherId,
    onchainPublisherId: values.onchainPublisherId,
    onchainDealId: values.onchainDealId,
    escrowAddress: values.escrowAddress,
    txHash: values.txHash,
    fundedAmountWei: values.fundedAmountWei,
    maxImpressions: values.maxImpressions,
    status: values.status ?? "funded",
  };
  store.push(row);
  return row;
}
