ALTER TABLE "advertisers" ADD COLUMN "onchain_advertiser_id" varchar(78);
ALTER TABLE "advertisers" ADD CONSTRAINT "advertisers_onchain_advertiser_id_unique" UNIQUE("onchain_advertiser_id");

ALTER TABLE "publishers" ADD COLUMN "onchain_publisher_id" varchar(78);
ALTER TABLE "publishers" ADD COLUMN "price_per_impression_wei" varchar(78);
ALTER TABLE "publishers" ADD CONSTRAINT "publishers_onchain_publisher_id_unique" UNIQUE("onchain_publisher_id");
