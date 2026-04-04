import { randomUUID } from "node:crypto";
import type { InferInsertModel } from "drizzle-orm";
import { advertiserCampaigns } from "~~/services/database/config/schema";
import type { AdvertiserCampaign } from "~~/types/adflow";

type Insert = InferInsertModel<typeof advertiserCampaigns>;

const store: AdvertiserCampaign[] = [];

export function memoryListCampaignsForAdvertiser(advertiserId: string): AdvertiserCampaign[] {
  return [...store]
    .filter(c => c.advertiserId === advertiserId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function memoryGetAdvertiserCampaignById(id: string): AdvertiserCampaign | undefined {
  return store.find(c => c.id === id);
}

export function memoryCreateAdvertiserCampaign(values: Insert): AdvertiserCampaign {
  const now = new Date();
  const row: AdvertiserCampaign = {
    id: randomUUID(),
    createdAt: now,
    advertiserId: values.advertiserId,
    productDescription: values.productDescription,
    targetAudience: values.targetAudience,
    budgetUsdc: values.budgetUsdc,
    targetImpressions: values.targetImpressions,
    creativeFileName: values.creativeFileName ?? null,
    selectedPublisherId: values.selectedPublisherId ?? null,
    onchainPublisherId: values.onchainPublisherId ?? null,
    onchainDealId: values.onchainDealId ?? null,
    escrowAddress: values.escrowAddress ?? null,
    fundingTxHash: values.fundingTxHash ?? null,
    fundedAmountWei: values.fundedAmountWei ?? null,
  };
  store.push(row);
  return row;
}

export function memoryListCampaignsByPublisherId(publisherId: string): AdvertiserCampaign[] {
  return [...store]
    .filter(c => c.selectedPublisherId === publisherId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function memoryUpdateCampaignOnchainData(
  id: string,
  values: Pick<AdvertiserCampaign, "onchainPublisherId" | "onchainDealId" | "escrowAddress" | "fundingTxHash" | "fundedAmountWei">,
): AdvertiserCampaign | undefined {
  const idx = store.findIndex(c => c.id === id);
  if (idx < 0) return undefined;
  const next: AdvertiserCampaign = {
    ...store[idx],
    ...values,
  };
  store[idx] = next;
  return next;
}
