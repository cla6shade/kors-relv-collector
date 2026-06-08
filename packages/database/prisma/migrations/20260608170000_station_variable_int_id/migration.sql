-- 기존 복합 PK(stn_id, obs_cd)를 제거하고 정수 id를 PK로 부여한다.
-- SERIAL 컬럼이라 기존 행에도 1부터 순차적으로 id가 자동 채워진다.
ALTER TABLE "station_variable" DROP CONSTRAINT "station_variable_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "station_variable_pkey" PRIMARY KEY ("id");

-- (stn_id, obs_cd) 조합은 여전히 유일해야 하므로 unique 인덱스로 보존한다.
CREATE UNIQUE INDEX "station_variable_stn_id_obs_cd_key" ON "station_variable"("stn_id", "obs_cd");
