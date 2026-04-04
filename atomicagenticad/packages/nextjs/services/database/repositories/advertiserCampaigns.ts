import { and, desc, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { advertiserCampaigns, advertisers } from "~~/services/database/config/schema";
import { useInMemoryAdvertisers } from "~~/services/database/repositories/advertisersBackend";
import * as memory from "~~/services/database/repositories/advertiserCampaignsMemory";
import * as advertisersMemory from "~~/services/database/repositories/advertisersMemory";
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

export type AdvertiserCampaignOnchainUpdate = Pick<
  AdvertiserCampaign,
  "onchainPublisherId" | "onchainDealId" | "escrowAddress" | "fundingTxHash" | "fundedAmountWei"
>;

export async function getAdvertiserCampaignsByPublisherId(publisherId: string) {
  if (useInMemoryAdvertisers()) {
    const campaigns = memory.memoryListCampaignsByPublisherId(publisherId);
    return campaigns.map(c => ({
      ...c,
      advertiserName: advertisersMemory.memoryGetAdvertiserById(c.advertiserId)?.displayName ?? "Unknown",
    }));
  }

  const rows = await db
    .select({
      campaign: advertiserCampaigns,
      advertiserName: advertisers.displayName,
    })
    .from(advertiserCampaigns)
    .innerJoin(advertisers, eq(advertiserCampaigns.advertiserId, advertisers.id))
    .where(eq(advertiserCampaigns.selectedPublisherId, publisherId))
    .orderBy(desc(advertiserCampaigns.createdAt));

  return rows.map(r => ({ ...r.campaign, advertiserName: r.advertiserName }));
}

export async function updateAdvertiserCampaignOnchainData(
  campaignId: string,
  advertiserId: string,
  values: AdvertiserCampaignOnchainUpdate,
) {
  if (useInMemoryAdvertisers()) {
    return memory.memoryUpdateCampaignOnchainData(campaignId, values);
  }
  const [updated] = await db
    .update(advertiserCampaigns)
    .set(values)
    .where(and(eq(advertiserCampaigns.id, campaignId), eq(advertiserCampaigns.advertiserId, advertiserId)))
    .returning();
  return updated;
}
