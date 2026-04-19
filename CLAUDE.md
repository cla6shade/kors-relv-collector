# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean ocean/sea observation data collector and dashboard. Fetches data from two government APIs (KHOA - Korea Hydrographic and Oceanographic Agency, KMA - Korea Meteorological Administration) and stores it in PostgreSQL via Prisma.

## Monorepo Structure

pnpm@10 workspace (`pnpm-workspace.yaml`) with three packages:

- **`packages/database`** (`@kors-relv/database`) — Prisma 7 schema and generated client (output: `src/generated/prisma`). Uses `prisma.config.ts` for config. Two models: `Station` (PK: `stn_id`) and `Observation` (composite PK: `stn_id + obs_cd + obs_time`). `StationType` enum: BUOY, TIDAL, COASTAL, FISHING, SPECIAL, LIGHTHOUSE, MARINE. Exports singleton `prisma` client and Prisma types.
- **`packages/collect`** (`@kors-relv/collect`) — CLI that fetches from KHOA buoy, KHOA tidal, and KMA sea APIs. API clients in `src/clients/`, job orchestration in `src/jobs/collect-latest.ts`, station lists in `src/stations.ts`, field-to-observation mapping in `src/obs-codes.ts`, env config in `src/config.ts`. Running with no args executes all three collectors.
- **`apps/dashboard`** (`@kors-relv/dashboard`) — Next.js 15 app (App Router, React 19, Tailwind CSS). Uses `@/*` path alias. Imports `@kors-relv/database` via `transpilePackages` in `next.config.mjs`.

## Commands

```bash
# Install dependencies
pnpm install

# Database
pnpm db:generate          # Generate Prisma client
pnpm db:migrate           # Run migrations (dev)

# Data collection CLI
pnpm collect                  # all sources
pnpm collect khoa-buoy        # KHOA buoy stations only
pnpm collect khoa-tidal       # KHOA tidal stations only
pnpm collect kma-sea          # KMA sea stations only

# Dashboard
pnpm dev:dashboard        # Next.js dev server

# Type checking
pnpm typecheck            # All packages
```

## Environment Variables

Requires `.env` (gitignored) with:
- `DATABASE_URL` — PostgreSQL connection string
- `KHOA_SERVICE_KEY` — data.go.kr API key (for KHOA endpoints)
- `KMA_AUTH_KEY` — apihub.kma.go.kr auth key

Docker Compose reads `.env.docker` (also gitignored).

## Infrastructure

Docker Compose provides PostgreSQL 18 (container: `kors-relv-postgres`, port 5432, persists to `./db/` which is gitignored).

## Key Patterns

- Station IDs are prefixed by source: `KHOA:{obsCode}` or `KMA:{stnId}`
- All observation times are parsed as KST (+09:00) then stored as `timestamptz`
- `createMany` with `skipDuplicates: true` makes collection idempotent
- The `explode()` function in `collect-latest.ts` fans out one API response row into multiple `Observation` rows (one per measured field), skipping null/NaN values
- All packages use ESM (`"type": "module"`) with `.js` extension in imports
- TypeScript strict mode with `noUncheckedIndexedAccess` (see `tsconfig.base.json`)
- Node >=20 required
