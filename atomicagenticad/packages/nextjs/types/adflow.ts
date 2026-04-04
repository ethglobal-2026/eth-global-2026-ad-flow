import type { InferSelectModel } from "drizzle-orm";
import type {
  advertiserCampaignDeals,
  advertiserCampaigns,
  advertisers,
  publisherCampaigns,
  publishers,
} from "~~/services/database/config/schema";

/** Row shape for `publishers` — same as repository `Publisher`; defined here so client code never imports the DB layer. */
export type Publisher = InferSelectModel<typeof publishers>;

export type PublisherCampaign = InferSelectModel<typeof publisherCampaigns>;

/** Row shape for `advertisers` (account + wallet + profile). */
export type Advertiser = InferSelectModel<typeof advertisers>;

/** Row shape for `advertiser_campaigns`. */
export type AdvertiserCampaign = InferSelectModel<typeof advertiserCampaigns>;

/** Row shape for `advertiser_campaign_deals` (on-chain deal + escrow rows per campaign). */
export type AdvertiserCampaignDeal = InferSelectModel<typeof advertiserCampaignDeals>;

/** After `/advertiser/onboard` — who is signed in as an advertiser. */
export type AdvertiserSessionSummary = Pick<Advertiser, "id" | "email" | "walletAddress" | "displayName">;

/** After `/advertiser/campaign/new` — active campaign context for discovery / flows. */
export type AdvertiserCampaignSessionSummary = Pick<
  AdvertiserCampaign,
  "id" | "productDescription" | "budgetUsdc" | "targetImpressions" | "targetAudience"
>;

/** Checkout payload for `/advertiser/transaction` after confirming a campaign + publisher picks. */
export type AdvertiserCheckoutPublisher = Pick<
  Publisher,
  "id" | "siteUrl" | "name" | "category" | "floorPricePer1kUsd" | "adFormat" | "onchainPublisherId"
> & { matchScore: number };

export type AdvertiserCheckoutSession = {
  campaignId: string;
  budgetUsdc: string;
  targetImpressions: number;
  productDescription: string;
  publishers: AdvertiserCheckoutPublisher[];
};

/** Stored in sessionStorage after successful publisher onboarding (see `/publisher/onboard`). */
export type PublisherSessionSummary = Pick<Publisher, "id" | "email" | "siteUrl" | "floorPricePer1kUsd" | "category">;
