import { desc, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { advertisers } from "~~/services/database/config/schema";
import { useInMemoryAdvertisers } from "~~/services/database/repositories/advertisersBackend";
import * as memory from "~~/services/database/repositories/advertisersMemory";
import type { Advertiser } from "~~/types/adflow";

export type { Advertiser };
export type NewAdvertiser = InferInsertModel<typeof advertisers>;

export function normalizeAdvertiserEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getAdvertisers() {
  if (useInMemoryAdvertisers()) {
    return memory.memoryListAdvertisers();
  }
  return await db.select().from(advertisers).orderBy(desc(advertisers.createdAt));
}

export async function getAdvertiserById(id: string) {
  if (useInMemoryAdvertisers()) {
    return memory.memoryGetAdvertiserById(id);
  }
  const [row] = await db.select().from(advertisers).where(eq(advertisers.id, id)).limit(1);
  return row;
}

export async function getAdvertiserByEmail(email: string) {
  if (useInMemoryAdvertisers()) {
    return memory.memoryGetAdvertiserByEmail(email);
  }
  const [row] = await db
    .select()
    .from(advertisers)
    .where(eq(advertisers.email, normalizeAdvertiserEmail(email)))
    .limit(1);
  return row;
}

export async function getAdvertiserByWallet(walletAddress: string) {
  const key = walletAddress.trim().toLowerCase();
  if (useInMemoryAdvertisers()) {
    return memory.memoryGetAdvertiserByWallet(key);
  }
  const [row] = await db.select().from(advertisers).where(eq(advertisers.walletAddress, key)).limit(1);
  return row;
}

export async function createAdvertiser(row: NewAdvertiser) {
  if (useInMemoryAdvertisers()) {
    return memory.memoryCreateAdvertiser(row);
  }
  const [created] = await db.insert(advertisers).values(row).returning();
  if (!created) {
    throw new Error("Advertiser insert did not return a row");
  }
  return created;
}
