-- Change StationType enum to match KMA sea_obs TP 분류.
--   추가: WAVE_BUOY(C:파고부이), WEATHER_SHIP(J:기상1호), WAVE_GAUGE(G:파랑계)
--   제거: FISHING, SPECIAL
-- 값 제거가 포함되므로 enum 을 새로 만들어 교체한다(Postgres 는 enum 값 DROP 미지원).
-- 기존 행은 의미가 보존되도록 매핑한다: FISHING→COASTAL, SPECIAL→WEATHER_SHIP.
CREATE TYPE "StationType_new" AS ENUM (
  'BUOY',
  'WAVE_BUOY',
  'DRIFT_BUOY',
  'TIDAL',
  'COASTAL',
  'WEATHER_SHIP',
  'LIGHTHOUSE',
  'WAVE_GAUGE',
  'MARINE',
  'ORS'
);

ALTER TABLE "station"
  ALTER COLUMN "stn_type" TYPE "StationType_new"
  USING (
    CASE "stn_type"::text
      WHEN 'FISHING' THEN 'COASTAL'
      WHEN 'SPECIAL' THEN 'WEATHER_SHIP'
      ELSE "stn_type"::text
    END
  )::"StationType_new";

DROP TYPE "StationType";
ALTER TYPE "StationType_new" RENAME TO "StationType";
