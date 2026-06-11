-- 테이블 리네임 (데이터 보존)
ALTER TABLE "observation" RENAME TO "observation_data";

-- 복합 PK 제거 후 surrogate id 부여 (SERIAL → 기존 행 1부터 자동 채움)
ALTER TABLE "observation_data" DROP CONSTRAINT "observation_pkey";
ALTER TABLE "observation_data" ADD COLUMN "id" SERIAL NOT NULL;
ALTER TABLE "observation_data" ADD CONSTRAINT "observation_data_pkey" PRIMARY KEY ("id");

-- 복합키는 unique 제약으로 보존 (createMany skipDuplicates idempotency 유지)
CREATE UNIQUE INDEX "observation_data_stn_id_obs_cd_obs_time_key" ON "observation_data"("stn_id", "obs_cd", "obs_time");

-- 기존 인덱스/FK 제약 이름을 Prisma 기대값으로 리네임
ALTER INDEX "observation_obs_cd_obs_time_idx" RENAME TO "observation_data_obs_cd_obs_time_idx";
ALTER TABLE "observation_data" RENAME CONSTRAINT "observation_stn_id_fkey" TO "observation_data_stn_id_fkey";
