-- CreateEnum
CREATE TYPE "StationType" AS ENUM ('BUOY', 'TIDAL', 'COASTAL', 'FISHING', 'SPECIAL', 'LIGHTHOUSE', 'MARINE');

-- CreateTable
CREATE TABLE "station" (
    "stn_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stn_type" "StationType" NOT NULL,
    "lat" DOUBLE PRECISION,
    "lot" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "station_pkey" PRIMARY KEY ("stn_id")
);

-- CreateTable
CREATE TABLE "observation" (
    "stn_id" TEXT NOT NULL,
    "obs_cd" TEXT NOT NULL,
    "obs_time" TIMESTAMPTZ(6) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "observation_pkey" PRIMARY KEY ("stn_id","obs_cd","obs_time")
);

-- CreateIndex
CREATE INDEX "station_stn_type_idx" ON "station"("stn_type");

-- CreateIndex
CREATE INDEX "observation_obs_cd_obs_time_idx" ON "observation"("obs_cd", "obs_time");

-- AddForeignKey
ALTER TABLE "observation" ADD CONSTRAINT "observation_stn_id_fkey" FOREIGN KEY ("stn_id") REFERENCES "station"("stn_id") ON DELETE RESTRICT ON UPDATE CASCADE;
