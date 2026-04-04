import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const publishers = pgTable("publishers", {
  id: uuid("id").defaultRandom().primaryKey(),
  onchainPublisherId: varchar("onchain_publisher_id", { length: 78 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  walletAddress: varchar("wallet_address", { length: 42 }).unique(),
  siteUrl: text("site_url").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  qualityScore: integer("quality_score").notNull(),
  contentFocus: text("content_focus"),
  language: varchar("language", { length: 64 }),
  estimatedMonthlyTraffic: varchar("estimated_monthly_traffic", { length: 120 }),
  audience: text("audience"),
  pricePerImpressionWei: varchar("price_per_impression_wei", { length: 78 }),
  floorPricePer1kUsd: varchar("floor_price_per_1k_usd", { length: 32 }).notNull().default("0"),
  adFormat: varchar("ad_format", { length: 64 }).notNull().default("Both"),
  blockedCategories: jsonb("blocked_categories")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  preferredAdvertiserTypes: jsonb("preferred_advertiser_types")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const publisherCampaigns = pgTable("publisher_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  publisherId: uuid("publisher_id")
    .notNull()
    .references(() => publishers.id, { onDelete: "cascade" }),
  advertiserName: varchar("advertiser_name", { length: 255 }).notNull(),
  advertiserCategory: varchar("advertiser_category", { length: 255 }),
  impressionsServed: integer("impressions_served").notNull().default(0),
  impressionsTotal: integer("impressions_total").notNull(),
  revenueUsdc: varchar("revenue_usdc", { length: 32 }).notNull().default("0"),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Advertiser account (wallet + identity). Campaign briefs live in `advertiser_campaigns`. */
export const advertisers = pgTable("advertisers", {
  id: uuid("id").defaultRandom().primaryKey(),
  onchainAdvertiserId: varchar("onchain_advertiser_id", { length: 78 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  about: text("about"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const advertiserCampaigns = pgTable("advertiser_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  advertiserId: uuid("advertiser_id")
    .notNull()
    .references(() => advertisers.id, { onDelete: "cascade" }),
  selectedPublisherId: uuid("selected_publisher_id").references(() => publishers.id, { onDelete: "set null" }),
  onchainPublisherId: varchar("onchain_publisher_id", { length: 78 }),
  onchainDealId: varchar("onchain_deal_id", { length: 78 }).unique(),
  escrowAddress: varchar("escrow_address", { length: 42 }).unique(),
  fundingTxHash: varchar("funding_tx_hash", { length: 66 }).unique(),
  fundedAmountWei: varchar("funded_amount_wei", { length: 78 }),
  productDescription: text("product_description").notNull(),
  targetAudience: text("target_audience").notNull(),
  budgetUsdc: varchar("budget_usdc", { length: 32 }).notNull(),
  targetImpressions: integer("target_impressions").notNull(),
  creativeFileName: varchar("creative_file_name", { length: 512 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
