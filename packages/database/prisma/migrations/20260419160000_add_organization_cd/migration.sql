-- CreateEnum
CREATE TYPE "Organization" AS ENUM ('KHOA', 'KMA');

-- AlterTable: add column as nullable, backfill, then set NOT NULL
ALTER TABLE "station" ADD COLUMN "organization_cd" "Organization";

-- Backfill: KHOA stn_ids have letter prefixes (HB_, DT_, KG_, TW_, IE_, ...);
-- KMA stn_ids are purely numeric.
UPDATE "station"
SET "organization_cd" = CASE
  WHEN "stn_id" ~ '^[0-9]+$' THEN 'KMA'::"Organization"
  ELSE 'KHOA'::"Organization"
END
WHERE "organization_cd" IS NULL;

ALTER TABLE "station" ALTER COLUMN "organization_cd" SET NOT NULL;

-- CreateIndex
CREATE INDEX "station_organization_cd_idx" ON "station"("organization_cd");
