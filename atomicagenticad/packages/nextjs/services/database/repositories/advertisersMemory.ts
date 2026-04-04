import { randomUUID } from "node:crypto";
import type { InferInsertModel } from "drizzle-orm";
import { advertisers } from "~~/services/database/config/schema";
import type { Advertiser } from "~~/types/adflow";

type Insert = InferInsertModel<typeof advertisers>;

const store: Advertiser[] = [];

let warned = false;

function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    "[advertisers] POSTGRES_URL is unset — using in-memory advertiser store (development only; data is lost on server restart).",
  );
}

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

export function memoryListAdvertisers(): Advertiser[] {
  warnOnce();
  return [...store].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function memoryGetAdvertiserById(id: string): Advertiser | undefined {
  warnOnce();
  return store.find(a => a.id === id);
}

export function memoryGetAdvertiserByEmail(email: string): Advertiser | undefined {
  warnOnce();
  const key = normEmail(email);
  return store.find(a => a.email === key);
}

export function memoryGetAdvertiserByWallet(wallet: string): Advertiser | undefined {
  warnOnce();
  const w = wallet.trim().toLowerCase();
  return store.find(a => a.walletAddress.toLowerCase() === w);
}

export function memoryCreateAdvertiser(values: Insert): Advertiser {
  warnOnce();
  const now = new Date();
  const row: Advertiser = {
    id: randomUUID(),
    createdAt: now,
    onchainAdvertiserId: values.onchainAdvertiserId ?? null,
    email: values.email,
    walletAddress: values.walletAddress,
    displayName: values.displayName,
    companyName: values.companyName ?? null,
    about: values.about ?? null,
  };
  store.push(row);
  return row;
}
