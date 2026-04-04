import { desc, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { advertiserCampaigns } from "~~/services/database/config/schema";
import { useInMemoryAdvertisers } from "~~/services/database/repositories/advertisersBackend";
import * as memory from "~~/services/database/repositories/advertiserCampaignsMemory";
import type { AdvertiserCampaign } from "~~/types/adflow";

export type { AdvertiserCampaign };
export type NewAdvertiserCampaign = InferInsertModel<typeof advertiserCampaigns>;

export async function listAdvertiserCampaigns(advertiserId: string) {
  if (useInMemoryAdvertisers()) {
    return memory.memoryListCampaignsForAdvertiser(advertiserId);
  }
  return await db
    .select()
    .from(advertiserCampaigns)
    .where(eq(advertiserCampaigns.advertiserId, advertiserId))
    .orderBy(desc(advertiserCampaigns.createdAt));
}

export async function getAdvertiserCampaignById(id: string) {
  if (useInMemoryAdvertisers()) {
    return memory.memoryGetAdvertiserCampaignById(id);
  }
  const [row] = await db.select().from(advertiserCampaigns).where(eq(advertiserCampaigns.id, id)).limit(1);
  return row;
}

export async function createAdvertiserCampaign(row: NewAdvertiserCampaign) {
  if (useInMemoryAdvertisers()) {
    return memory.memoryCreateAdvertiserCampaign(row);
  }
  const [created] = await db.insert(advertiserCampaigns).values(row).returning();
  if (!created) {
    throw new Error("Advertiser campaign insert did not return a row");
  }
  return created;
}
