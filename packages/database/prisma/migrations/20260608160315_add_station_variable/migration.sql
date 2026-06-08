-- CreateTable
CREATE TABLE "station_variable" (
    "stn_id" TEXT NOT NULL,
    "obs_cd" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "station_variable_pkey" PRIMARY KEY ("stn_id","obs_cd")
);

-- CreateIndex
CREATE INDEX "station_variable_obs_cd_idx" ON "station_variable"("obs_cd");
