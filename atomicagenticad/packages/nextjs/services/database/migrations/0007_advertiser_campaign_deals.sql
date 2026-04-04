CREATE TABLE "advertiser_campaign_deals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "campaign_id" uuid NOT NULL,
  "publisher_id" uuid NOT NULL,
  "onchain_publisher_id" varchar(78) NOT NULL,
  "onchain_deal_id" varchar(78) NOT NULL,
  "escrow_address" varchar(42) NOT NULL,
  "tx_hash" varchar(66) NOT NULL,
  "funded_amount_wei" varchar(78) NOT NULL,
  "max_impressions" integer NOT NULL,
  "status" varchar(32) DEFAULT 'funded' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "advertiser_campaign_deals_onchain_deal_id_unique" UNIQUE("onchain_deal_id"),
  CONSTRAINT "advertiser_campaign_deals_escrow_address_unique" UNIQUE("escrow_address"),
  CONSTRAINT "advertiser_campaign_deals_tx_hash_unique" UNIQUE("tx_hash")
);

ALTER TABLE "advertiser_campaign_deals"
  ADD CONSTRAINT "advertiser_campaign_deals_campaign_id_advertiser_campaigns_id_fk"
  FOREIGN KEY ("campaign_id") REFERENCES "public"."advertiser_campaigns"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "advertiser_campaign_deals"
  ADD CONSTRAINT "advertiser_campaign_deals_publisher_id_publishers_id_fk"
  FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE cascade ON UPDATE no action;
