-- AlterEnum
ALTER TYPE "StationType" ADD VALUE 'DRIFT_BUOY';

-- CreateTable
CREATE TABLE "buoy_drift_position" (
    "id" SERIAL NOT NULL,
    "stn_id" TEXT NOT NULL,
    "obs_time" TIMESTAMPTZ(6) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "buoy_drift_position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "buoy_drift_position_stn_id_obs_time_idx" ON "buoy_drift_position"("stn_id", "obs_time");

-- CreateIndex
CREATE UNIQUE INDEX "buoy_drift_position_stn_id_obs_time_key" ON "buoy_drift_position"("stn_id", "obs_time");

-- AddForeignKey
ALTER TABLE "buoy_drift_position" ADD CONSTRAINT "buoy_drift_position_stn_id_fkey" FOREIGN KEY ("stn_id") REFERENCES "station"("stn_id") ON DELETE RESTRICT ON UPDATE CASCADE;
