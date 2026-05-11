-- Backfill: 기존 IE_* 코드 station은 조위관측소가 아닌 해양과학기지
UPDATE "station"
SET stn_type = 'ORS'
WHERE stn_id LIKE 'IE_%';
