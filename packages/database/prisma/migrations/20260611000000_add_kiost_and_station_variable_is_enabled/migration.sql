-- Organization enum에 KIOST 추가 (동일 마이그레이션에서 값을 사용하지 않으므로 안전)
ALTER TYPE "Organization" ADD VALUE 'KIOST';

-- station_variable 사용여부 컬럼 (기본 true → 기존 행도 자동 채워짐)
ALTER TABLE "station_variable" ADD COLUMN "is_enabled" BOOLEAN NOT NULL DEFAULT true;
