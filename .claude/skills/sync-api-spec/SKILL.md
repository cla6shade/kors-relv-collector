---
name: sync-api-spec
description: >
  KHOA 부이·조위(HWP→md) 또는 KMA 해양관측(HTML→md) 최신 명세를
  scripts/fetch_*.py 파이프라인으로 생성하고, 타임스탬프 .md를
  정본으로 현행 코드와 비교해 사용자 승인 후 api-schema.ts,
  clients/*, obs-codes.ts, stations.ts, docs/*.md를 동기화합니다.
  사용자가 특정 API를 지정하지 않으면 khoa-buoy, khoa-tidal,
  kma-sea 3종 모두 확인·반영합니다. 트리거 예: "KHOA 부이 스펙
  업데이트", "apihub 해양관측 최신 반영", "openapi 명세 다시 받아서
  코드 맞춰줘", "API 스펙 전체 동기화".
---

# sync-api-spec

## 목적

공공 API(KHOA 부이·조위, KMA 해양관측)의 명세 변경을 반자동으로 감지하고 `packages/collect/` 내부 코드와 `docs/*.md`에 반영합니다.근ㄷ

## 사전 준비

한 번만 설치:

```
pip install -r scripts/requirements.txt
```

HWP 변환은 기본으로 `pyhwp`의 `hwp5html`을 씁니다. 변환 품질이 나쁘면 `HWP_TO_MD_BACKEND=libreoffice` 환경변수로 LibreOffice headless로 교체할 수 있습니다.

## 1. 소스 레지스트리

| API key | Python 스크립트 | 산출물 패턴 | 스키마 심볼 | 필드/스테이션 상수 | 클라이언트 |
|---|---|---|---|---|---|
| `khoa-buoy` | `scripts/fetch_khoa_buoy.py` | `docs/openapi_buoy__<TS>.md` | `KhoaBuoyItem` | `KHOA_BUOY_FIELDS`, `KHOA_BUOY_STATIONS` | `packages/collect/src/clients/khoa-buoy.ts` |
| `khoa-tidal` | `scripts/fetch_khoa_tidal.py` | `docs/openapi_tidal_station__<TS>.md` | `KhoaTidalItem` | `KHOA_TIDAL_FIELDS`, `KHOA_TIDAL_STATIONS` | `packages/collect/src/clients/khoa-tidal.ts` |
| `kma-sea` | `scripts/fetch_kma_sea.py` | `docs/apihub_sea_obs__<TS>.md` | `KmaSeaRow` + `COL_MAP`, `KMA_SEA_NUMERIC_FIELDS` | `KMA_SEA_FIELDS`, `KMA_SEA_STATIONS` | `packages/collect/src/clients/kma-sea.ts` (`parseKmaSea`) |

TS 포맷은 `YYYYMMDD-HHMM` 고정. Glob은 `docs/openapi_buoy__*.md` 등 `<prefix>__*.md`.

편집용 정리 문서(`docs/openapi_buoy.md`, `docs/openapi_tidal_station.md`, `docs/apihub_sea_obs.md`)와 타임스탬프 정본은 분리 유지합니다. 정본은 비교 입력으로만 쓰고, 편집용 문서는 Diff 반영 결과로 갱신합니다.

## 2. 스크립트 호출 규약

| api-key | 실행 명령 |
|---|---|
| `khoa-buoy` | `python scripts/fetch_khoa_buoy.py` |
| `khoa-tidal` | `python scripts/fetch_khoa_tidal.py` |
| `kma-sea` | `python scripts/fetch_kma_sea.py` |

- **성공**: stdout 마지막 줄 = 생성된 `.md`의 절대경로. 이 줄을 파싱해서 `Read`에 사용.
- **실패**: 비-0 exit + stderr 한 줄 요약. 해당 api-key만 스킵하고 나머지 계속 진행.
- KHOA 스크립트는 Selenium + Chromium이 필요합니다. `webdriver-manager`가 드라이버를 자동 설치하지만 Chromium 자체가 없으면 실패합니다.
- KMA 스크립트의 `SPEC_URL`은 초기값이 비어 있습니다. 비어 있으면 "SPEC_URL is empty"로 명확 실패. 값은 사용자가 제공하는 apihub 해양관측 첫 섹션 URL로 스크립트 상단을 수정하세요.
- 인증 키가 필요하면 `packages/collect/.env`에 두세요. Python은 `python-dotenv`로 자동 로드합니다. 스킬이 env를 직접 주입하지 않습니다.

## 3. 비교 전략

정본(최신 TS `.md`)과 두 대상을 비교합니다.

1. **정본 vs 직전 TS `.md`** — 원천(공공 API) 변화 포착.
2. **정본 vs 현행 코드** — 1번 표의 인터페이스/상수/클라이언트 파일을 `Read`로 읽어 drift 포착.

두 결과를 합쳐 "실제로 코드에 반영해야 할 변경 집합"을 만듭니다.

## 4. Diff 포맷 (고정)

```
## <api-key> 명세 변경 감지
- 정본: docs/openapi_buoy__20260418-1420.md
- 직전: docs/openapi_buoy__20260311-0930.md

### 필드 (원천 diff)
| 상태 | 이름 | 타입 | 비고 |
|---|---|---|---|
| + | newField | number | 신규 |
| - | oldField | string | 폐지 |
| ~ | wt → seaTemp | number | 이름 변경 |

### 관측소 (원천 diff)
| 상태 | 코드 | 이름 |
|---|---|---|
| + | TW_0001 | 신규 부이 |
| - | TW_9999 | 폐지 |

### 코드 drift (정본 vs 현행 코드)
- `KHOA_BUOY_FIELDS`에 누락: ["airTemp"]
- `KhoaBuoyItem`에 남아있는 폐지 필드: ["oldField"]

### 엔드포인트/파라미터
(변경 없음 / 변경 내용)
```

전체 모드에서는 api-key마다 위 섹션을 만들어 **한 응답**에 모아 제시합니다.

## 5. 실행 단계

### 5.1 대상 결정

- 사용자가 `khoa-buoy` / `khoa-tidal` / `kma-sea` 또는 한국어로 "부이", "조위", "해양관측", "apihub" 중 하나를 명시하면 그 api-key만.
- **명시가 없으면 3종 전부를 순차로 처리** (묻지 않음).

### 5.2 각 api-key에 대해

1. `Bash`로 해당 스크립트 실행. stdout 마지막 줄에서 정본 `.md` 절대경로 파싱.
2. 정본을 `Read`.
3. `Glob`으로 같은 `<prefix>__*.md` 나열 → 파일명 내림차순 → 두 번째 항목을 직전 TS로 `Read`. 없으면 "직전 TS 없음" 표시.
4. 1번 표의 인터페이스·상수·클라이언트 파일을 전부 `Read`.
5. Diff 포맷으로 섹션 작성.

### 5.3 승인 & 적용

- 모든 api-key의 Diff 섹션을 **한 응답**에 묶어 사용자에게 제시.
- `AskUserQuestion` `multiSelect: true`로 적용 범위 선택. 각 api-key에 대해 "전체 적용 / 필드만 / 관측소만 / 건너뛰기" 중 고르게 합니다.
- `ObsCode` 유니온에 신규 항목이 들어가야 하면 별도 확인 질문.
- 승인된 항목만 `Edit`로 반영. 한 api-key 안의 여러 파일 변경은 한 응답에 몰아서 처리.
- 편집용 정리 문서(`docs/<spec>.md`)를 정본 기준으로 갱신.
- `docs/CHANGELOG-<api-key>.md`에 `## YYYY-MM-DD` 헤더로 추가/제거/이름변경·관측소 변동 append. 파일이 없으면 신규 생성.

### 5.4 실패 격리

- 한 api-key의 스크립트 실행이 실패하면 해당 api-key만 스킵, 나머지는 계속 진행.
- 종료 시 스킵된 api-key와 실패 원인을 모아 사용자에게 보고.

## 6. 검증

1. `pnpm typecheck` — 승인·적용이 있었으면 무조건 실행.
2. `pnpm collect <api-key>` — 사용자가 최종 승인한 경우에만 실행. `.env`는 `packages/collect/.env`에서 `dotenv`로 자동 로드되므로 환경변수 주입 불필요.
3. 실패 시 stderr 요약과 수정 제안을 사용자에게 보고. 자동 롤백하지 않습니다 — 수작업 판단 여지 보존.

## 7. 제약

- 경어 유지.
- **Prisma/DB 금지**: `packages/database/prisma/schema.prisma`·마이그레이션은 감지·언급·수정 모두 금지. 신규 필드를 찾아도 스키마 변경을 제안하지 않습니다.
- **`.env` 직접 읽기 금지**: 키 주입은 `pnpm collect`와 `python-dotenv`에 위임.
- **사전 승인 필수**: diff 감지만으로 자동 수정하지 않습니다.
- **관측소 삭제 보수**: 폐지된 관측소 제거는 사용자가 명시적으로 승인한 경우에만.
- **정본 `__<TS>.md` 편집 금지**: 스크립트 산출물은 원천으로만 사용.
- **스크립트 수정 금지**: `scripts/fetch_*.py`와 `scripts/lib/*.py`는 이 스킬 스코프 바깥. 버그 발견 시 사용자에게 보고만 합니다.

## 8. 파일 변경 맵 (스킬이 수정하는 대상)

| 변경 종류 | 파일 |
|---|---|
| 응답 필드 추가/제거/이름변경 | `packages/collect/src/api-schema.ts` (인터페이스, `KMA_SEA_NUMERIC_FIELDS`, `COL_MAP`) |
| 필드 → 관측코드 매핑 | `packages/collect/src/obs-codes.ts` (`KHOA_BUOY_FIELDS` 등, 필요시 `ObsCode` 유니온) |
| 관측소 목록 | `packages/collect/src/stations.ts` |
| 엔드포인트·쿼리 파라미터 | `packages/collect/src/api-schema.ts` (`ENDPOINTS`), `packages/collect/src/clients/*.ts` |
| 파싱 로직 | `packages/collect/src/clients/*.ts`, `parseKmaSea` |
| 편집용 문서 | `docs/openapi_buoy.md`, `docs/openapi_tidal_station.md`, `docs/apihub_sea_obs.md` |
| 변경 이력 | `docs/CHANGELOG-khoa-buoy.md`, `docs/CHANGELOG-khoa-tidal.md`, `docs/CHANGELOG-kma-sea.md` |
