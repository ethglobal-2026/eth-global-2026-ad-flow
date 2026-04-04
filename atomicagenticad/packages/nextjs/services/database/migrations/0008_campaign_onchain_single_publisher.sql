ALTER TABLE "advertiser_campaigns" ADD COLUMN "selected_publisher_id" uuid;

UPDATE "advertiser_campaigns"
SET "selected_publisher_id" = ("selected_publisher_ids"->>0)::uuid
WHERE jsonb_typeof("selected_publisher_ids") = 'array'
  AND jsonb_array_length("selected_publisher_ids") > 0;

ALTER TABLE "advertiser_campaigns"
  ADD CONSTRAINT "advertiser_campaigns_selected_publisher_id_publishers_id_fk"
  FOREIGN KEY ("selected_publisher_id") REFERENCES "public"."publishers"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "advertiser_campaigns" ADD COLUMN "onchain_publisher_id" varchar(78);
ALTER TABLE "advertiser_campaigns" ADD COLUMN "onchain_deal_id" varchar(78);
ALTER TABLE "advertiser_campaigns" ADD COLUMN "escrow_address" varchar(42);
ALTER TABLE "advertiser_campaigns" ADD COLUMN "funding_tx_hash" varchar(66);
ALTER TABLE "advertiser_campaigns" ADD COLUMN "funded_amount_wei" varchar(78);

ALTER TABLE "advertiser_campaigns" ADD CONSTRAINT "advertiser_campaigns_onchain_deal_id_unique" UNIQUE("onchain_deal_id");
ALTER TABLE "advertiser_campaigns" ADD CONSTRAINT "advertiser_campaigns_escrow_address_unique" UNIQUE("escrow_address");
ALTER TABLE "advertiser_campaigns" ADD CONSTRAINT "advertiser_campaigns_funding_tx_hash_unique" UNIQUE("funding_tx_hash");

ALTER TABLE "advertiser_campaigns" DROP COLUMN "selected_publisher_ids";

DROP TABLE "advertiser_campaign_deals";
