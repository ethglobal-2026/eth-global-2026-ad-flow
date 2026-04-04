import { desc, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { advertiserCampaignDeals } from "~~/services/database/config/schema";
import { useInMemoryAdvertisers } from "~~/services/database/repositories/advertisersBackend";
import * as memory from "~~/services/database/repositories/advertiserCampaignDealsMemory";
import type { AdvertiserCampaignDeal } from "~~/types/adflow";

export type { AdvertiserCampaignDeal };
export type NewAdvertiserCampaignDeal = InferInsertModel<typeof advertiserCampaignDeals>;

export async function listDealsForCampaign(campaignId: string) {
  if (useInMemoryAdvertisers()) {
    return memory.memoryListDealsForCampaign(campaignId);
  }
  return await db
    .select()
    .from(advertiserCampaignDeals)
    .where(eq(advertiserCampaignDeals.campaignId, campaignId))
    .orderBy(desc(advertiserCampaignDeals.createdAt));
}

export async function createAdvertiserCampaignDeal(row: NewAdvertiserCampaignDeal) {
  if (useInMemoryAdvertisers()) {
    return memory.memoryCreateAdvertiserCampaignDeal(row);
  }
  const [created] = await db.insert(advertiserCampaignDeals).values(row).returning();
  if (!created) {
    throw new Error("Advertiser campaign deal insert did not return a row");
  }
  return created;
}
