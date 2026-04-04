ALTER TABLE "advertiser_campaigns" ADD COLUMN "selected_publisher_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;
