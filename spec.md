# Crypto Tracker — Technical Specification

**Project ID:** `crypto-tracker-mobvl5re`  
**Table Prefix:** `ct_`  
**Spec Date:** 2026-04-23  
**Stack:** Next.js 15 · TypeScript · Tailwind v4 · Supabase · Recharts · TanStack Query · Zustand  
**Theme:** Dark-mode-first with green/red P&L indicators

---

## Table of Contents

1. [Overview & Assumptions](#overview--assumptions)
2. [Requirements](#requirements)
3. [Data Models & Naming Conventions](#data-models--naming-conventions)
4. [Migration SQL](#migration-sql)
5. [API Routes](#api-routes)
6. [Component Structure](#component-structure)
7. [Third-Party Integrations](#third-party-integrations)
8. [Implementation Plan](#implementation-plan)
9. [Prerequisites](#prerequisites)
10. [Phase Scope](#phase-scope)

---

## Overview & Assumptions

### Product Summary
A personal cryptocurrency portfolio tracker. Authenticated users manage coin holdings, log buy/sell transactions, and observe live market data. The UI is dark-mode only with green/red profit-loss indicators, a scrolling live price ticker, an allocation donut chart, sparklines per holding, and a watchlist for coins not yet owned.

### Key Assumptions
- **Single currency:** All values denominated in USD. Multi-currency support is deferred.
- **Price source:** CoinGecko public REST API (no API key for Phase 1). Rate limit: 10–30 req/min on demo tier.
- **Live ticker polling:** Prices refresh every 30 seconds via TanStack Query. True WebSocket streaming (CoinGecko Pro) is Phase 2.
- **Portfolio value calculation is client-side:** Holdings stored in DB (quantity + avg_buy_price); current price fetched live; P&L computed in the browser.
- **No paper trading or simulations.** All transactions are treated as real.
- **Authentication:** Supabase Auth (email/password + magic link). OAuth deferred to Phase 2.
- **Sparklines:** 7-day price history per coin, fetched from CoinGecko `/coins/{id}/market_chart`.
- **Coin metadata** (name, symbol, logo) sourced from CoinGecko at time of adding a holding; stored locally for offline rendering.
- **No server-side price caching** beyond the Next.js route layer. A `ct_price_snapshots` table exists for optional background jobs in Phase 2.

---

## Requirements

### REQ-CT-001: Live Price Ticker

**User Story:** As a trader, I want a continuously updating price ticker at the top of the screen so that I can monitor the market at a glance.

| AC | Description |
|---|---|
| AC-001.1 | When the dashboard loads, a horizontal scrolling marquee displays at minimum 10 top coins (BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX, DOT, LINK) with their current USD price and 24h % change. |
| AC-001.2 | When 24h change is positive, the value is rendered in `green-400`. When negative, `red-400`. When zero, `slate-400`. |
| AC-001.3 | When 30 seconds elapse, prices silently refresh without a full page reload or loading spinner. |
| AC-001.4 | When a new price is received that differs from the previous price, the changed value flashes (green if up, red if down) for 800ms via CSS transition. |
| AC-001.5 | The ticker must remain visible at the top of the viewport on all pages within the authenticated layout. |

---

### REQ-CT-002: Holdings Table with Profit/Loss

**User Story:** As a user, I want to see all my coin holdings in a table with live P&L so that I can evaluate my portfolio performance.

| AC | Description |
|---|---|
| AC-002.1 | The holdings table displays columns: Coin (icon + name + symbol), Current Price, 24h Change, Amount Held, Current Value, Avg Buy Price, P&L ($), P&L (%). |
| AC-002.2 | P&L ($) = `(currentPrice − avgBuyPrice) × quantity`. Positive values render in `green-400`; negative in `red-400`. |
| AC-002.3 | P&L (%) = `((currentPrice − avgBuyPrice) / avgBuyPrice) × 100`. Formatted to 2 decimal places. |
| AC-002.4 | When a user has no holdings, an empty state with a "Add your first holding" CTA is shown. |
| AC-002.5 | Clicking a row expands an inline panel showing the 7-day sparkline and quick-add-transaction button. |
| AC-002.6 | The table is sortable by any column (client-side sort). Default sort: Current Value descending. |
| AC-002.7 | An "Add Holding" button opens a modal with coin search, quantity, and avg buy price fields. |
| AC-002.8 | Each row has an edit (pencil) and delete (trash) icon — both lucide-react icons. |

---

### REQ-CT-003: Portfolio Allocation Donut Chart

**User Story:** As a user, I want to see a donut chart of my portfolio allocation so that I can identify over-concentration.

| AC | Description |
|---|---|
| AC-003.1 | A Recharts `PieChart` (inner radius 60%, outer radius 90%) renders each holding as a proportional slice. |
| AC-003.2 | Each slice is labeled with the coin symbol and percentage when the slice is > 3% of portfolio. |
| AC-003.3 | Hovering a slice shows a tooltip with: coin name, USD value, and exact allocation %. |
| AC-003.4 | A legend below the chart lists all coins with colored dot, symbol, and %. |
| AC-003.5 | When total portfolio value is $0 (no holdings or all $0 price), the chart shows a single gray ring with "No data" in the center. |
| AC-003.6 | Colors are drawn from a deterministic 12-color palette defined in `/tmp/factory-builds/crypto-tracker-mobvl5re/lib/utils/chartColors.ts`. |

---

### REQ-CT-004: Price History Sparklines

**User Story:** As a user, I want to see a 7-day price sparkline per holding so that I can quickly assess recent momentum.

| AC | Description |
|---|---|
| AC-004.1 | Each row in the holdings table contains a 120×40px Recharts `LineChart` showing 7 days of daily close prices. |
| AC-004.2 | Sparkline color matches 24h trend: green if today's price > 7 days ago; red otherwise. |
| AC-004.3 | No axes, no tooltip, no legend — just the trend line with a subtle gradient fill beneath it. |
| AC-004.4 | Sparkline data is fetched once per coin per page load and cached for 5 minutes via TanStack Query. |
| AC-004.5 | While loading, a skeleton pulse bar replaces the sparkline. |

---

### REQ-CT-005: Watchlist

**User Story:** As a user, I want a watchlist so that I can track coins I don't yet own.

| AC | Description |
|---|---|
| AC-005.1 | The `/watchlist` page shows a table: Coin (icon + name), Current Price, 24h Change, 7-Day Sparkline, Market Cap, 24h Volume. |
| AC-005.2 | An "Add to Watchlist" button opens a coin search modal using CoinGecko `/search` endpoint. |
| AC-005.3 | Each watchlist row has a trash icon to remove, and a "Buy" button that navigates to Add Holding pre-filled with that coin. |
| AC-005.4 | Watchlist coin prices follow the same 30-second refresh cycle as portfolio prices. |
| AC-005.5 | Coins already in holdings are visually tagged with a "In Portfolio" badge in the watchlist. |
| AC-005.6 | The watchlist is persisted per user in `ct_watchlist`. |

---

### REQ-CT-006: Transaction History

**User Story:** As a user, I want a full transaction log so that I can audit my activity and track cost basis.

| AC | Description |
|---|---|
| AC-006.1 | The `/transactions` page displays a paginated table (25 per page): Date, Type, Coin, Quantity, Price/Coin, Total, Fee, Notes. |
| AC-006.2 | Transaction type is one of: `BUY`, `SELL`, `TRANSFER_IN`, `TRANSFER_OUT`. BUY rows have a green left border; SELL rows red; transfers are slate. |
| AC-006.3 | An "Add Transaction" button opens a modal with fields: coin (searchable), type, quantity, price per coin, fee, date, notes. Total auto-calculates as user types. |
| AC-006.4 | Adding a BUY or SELL transaction automatically recalculates `avg_buy_price` and `quantity` in `ct_holdings` via the `/api/transactions` POST handler. |
| AC-006.5 | Transactions are filterable by: coin, type, date range. Filters persist in URL query params. |
| AC-006.6 | Individual transactions can be deleted; deleting a BUY/SELL recalculates the holding. |
| AC-006.7 | A CSV export button downloads the filtered transaction set. |

---

### REQ-CT-007: Dark Mode

**User Story:** As a user, I want a dark-mode interface so that it is comfortable to use at night and matches trading terminal aesthetics.

| AC | Description |
|---|---|
| AC-007.1 | The application uses a dark color scheme exclusively: background `slate-950`, cards `slate-900`, borders `slate-800`. |
| AC-007.2 | Text hierarchy: primary `slate-50`, secondary `slate-400`, muted `slate-600`. |
| AC-007.3 | The Tailwind config forces `dark` class on `<html>` at build time (no light mode toggle). |
| AC-007.4 | `@theme {}` block in global CSS defines all color tokens (Tailwind v4 — PATTERN 17). |

---

### REQ-CT-008: Authentication

**User Story:** As a new user, I want to sign up with email/password so that my portfolio is private and persisted.

| AC | Description |
|---|---|
| AC-008.1 | `/login` page offers email+password and magic link sign-in. |
| AC-008.2 | `/signup` page collects email + password (min 8 chars). On success, redirects to `/dashboard`. |
| AC-008.3 | All `/app/*` routes redirect to `/login` if unauthenticated (middleware). |
| AC-008.4 | On first sign-in, a `ct_profiles` row is upserted via the `handle_ct_new_user` trigger. |
| AC-008.5 | A user's data is invisible to all other users (enforced via RLS `auth.uid() = user_id`). |

---

### REQ-CT-009: Portfolio Summary Stats

**User Story:** As a user, I want a summary header so that I can see total portfolio value and daily change at a glance.

| AC | Description |
|---|---|
| AC-009.1 | The dashboard header card shows: Total Portfolio Value, 24h Change ($), 24h Change (%), Total Cost Basis, Total P&L ($), Total P&L (%). |
| AC-009.2 | All values update whenever prices refresh (every 30s). |
| AC-009.3 | Positive changes are green; negative are red; zero is slate. |

---

## Data Models & Naming Conventions

### Table: `ct_profiles`

-- NOTE: has trigger — use upsert in onboard route

| Column | Type | App Variable | Notes |
|---|---|---|---|
| `id` | UUID PK | `id` | References `auth.users(id)` |
| `display_name` | TEXT | `displayName` | Nullable; falls back to email prefix |
| `currency` | TEXT | `currency` | Default: `'USD'`; future multi-currency |
| `created_at` | TIMESTAMPTZ | `createdAt` | Auto-set |
| `updated_at` | TIMESTAMPTZ | `updatedAt` | Auto-updated by trigger |

---

### Table: `ct_holdings`

| Column | Type | App Variable | Notes |
|---|---|---|---|
| `id` | UUID PK | `id` | `gen_random_uuid()` |
| `user_id` | UUID FK | `userId` | References `auth.users(id)` |
| `coin_id` | TEXT | `coinId` | CoinGecko ID e.g. `"bitcoin"` |
| `coin_symbol` | TEXT | `coinSymbol` | e.g. `"BTC"` |
| `coin_name` | TEXT | `coinName` | e.g. `"Bitcoin"` |
| `coin_image_url` | TEXT | `coinImageUrl` | CoinGecko thumb URL |
| `quantity` | DECIMAL(24,12) | `quantity` | Total units held |
| `avg_buy_price` | DECIMAL(24,8) | `avgBuyPrice` | Weighted average cost |
| `created_at` | TIMESTAMPTZ | `createdAt` | Auto-set |
| `updated_at` | TIMESTAMPTZ | `updatedAt` | Auto-updated by trigger |

**Unique constraint:** `(user_id, coin_id)`

---

### Table: `ct_transactions`

| Column | Type | App Variable | Notes |
|---|---|---|---|
| `id` | UUID PK | `id` | `gen_random_uuid()` |
| `user_id` | UUID FK | `userId` | References `auth.users(id)` |
| `coin_id` | TEXT | `coinId` | CoinGecko ID |
| `coin_symbol` | TEXT | `coinSymbol` | e.g. `"ETH"` |
| `coin_name` | TEXT | `coinName` | e.g. `"Ethereum"` |
| `coin_image_url` | TEXT | `coinImageUrl` | CoinGecko thumb URL |
| `transaction_type` | TEXT | `transactionType` | Enum: `BUY`, `SELL`, `TRANSFER_IN`, `TRANSFER_OUT` |
| `quantity` | DECIMAL(24,12) | `quantity` | Number of coins |
| `price_per_coin` | DECIMAL(24,8) | `pricePerCoin` | USD price at time of transaction |
| `total_value` | DECIMAL(24,8) | `totalValue` | `quantity × price_per_coin` |
| `fee` | DECIMAL(24,8) | `fee` | Exchange fee; default 0 |
| `notes` | TEXT | `notes` | Optional free text |
| `transacted_at` | TIMESTAMPTZ | `transactedAt` | User-specified date of the trade |
| `created_at` | TIMESTAMPTZ | `createdAt` | Record insertion time |

---

### Table: `ct_watchlist`

| Column | Type | App Variable | Notes |
|---|---|---|---|
| `id` | UUID PK | `id` | `gen_random_uuid()` |
| `user_id` | UUID FK | `userId` | References `auth.users(id)` |
| `coin_id` | TEXT | `coinId` | CoinGecko ID |
| `coin_symbol` | TEXT | `coinSymbol` | e.g. `"SOL"` |
| `coin_name` | TEXT | `coinName` | e.g. `"Solana"` |
| `coin_image_url` | TEXT | `coinImageUrl` | CoinGecko thumb URL |
| `added_at` | TIMESTAMPTZ | `addedAt` | Auto-set on insert |

**Unique constraint:** `(user_id, coin_id)`

---

### Table: `ct_price_snapshots` *(Phase 2 background job target)*

| Column | Type | App Variable | Notes |
|---|---|---|---|
| `id` | UUID PK | `id` | `gen_random_uuid()` |
| `coin_id` | TEXT | `coinId` | CoinGecko ID |
| `price_usd` | DECIMAL(24,8) | `priceUsd` | Price at snapshot time |
| `price_change_24h` | DECIMAL(10,4) | `priceChange24h` | % change over 24h |
| `market_cap` | DECIMAL(30,2) | `marketCap` | USD market cap |
| `volume_24h` | DECIMAL(30,2) | `volume24h` | 24h trading volume |
| `snapped_at` | TIMESTAMPTZ | `snappedAt` | Snapshot timestamp |

**Index:** `(coin_id, snapped_at DESC)` for time-series queries.

---

## Migration SQL

```sql
-- ============================================================
-- Migration: crypto-tracker initial schema
-- Project prefix: ct_
-- ============================================================

-- ------------------------------------------------------------
-- 1. ct_profiles
-- NOTE: has trigger — use upsert in onboard route
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ct_profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  currency    TEXT        NOT NULL DEFAULT 'USD',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ct_profiles_id_idx ON ct_profiles (id);

-- Updated_at auto-maintenance
CREATE OR REPLACE FUNCTION ct_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ct_profiles_updated_at
  BEFORE UPDATE ON ct_profiles
  FOR EACH ROW EXECUTE FUNCTION ct_set_updated_at();

-- Auth trigger: create profile on new user signup
-- SECURITY DEFINER + SET search_path = public (PATTERN 11)
CREATE OR REPLACE FUNCTION handle_ct_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO ct_profiles (id, display_name, currency)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    'USD'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop if exists before recreating (idempotent migration)
DROP TRIGGER IF EXISTS on_ct_auth_user_created ON auth.users;
CREATE TRIGGER on_ct_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_ct_new_user();

-- ------------------------------------------------------------
-- 2. ct_holdings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ct_holdings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id         TEXT        NOT NULL,
  coin_symbol     TEXT        NOT NULL,
  coin_name       TEXT        NOT NULL,
  coin_image_url  TEXT,
  quantity        DECIMAL(24,12) NOT NULL DEFAULT 0,
  avg_buy_price   DECIMAL(24,8)  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ct_holdings_user_coin_unique UNIQUE (user_id, coin_id)
);

CREATE INDEX IF NOT EXISTS ct_holdings_user_id_idx ON ct_holdings (user_id);
CREATE INDEX IF NOT EXISTS ct_holdings_coin_id_idx ON ct_holdings (coin_id);

CREATE TRIGGER ct_holdings_updated_at
  BEFORE UPDATE ON ct_holdings
  FOR EACH ROW EXECUTE FUNCTION ct_set_updated_at();

-- ------------------------------------------------------------
-- 3. ct_transactions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ct_transactions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id          TEXT        NOT NULL,
  coin_symbol      TEXT        NOT NULL,
  coin_name        TEXT        NOT NULL,
  coin_image_url   TEXT,
  transaction_type TEXT        NOT NULL
                   CHECK (transaction_type IN ('BUY','SELL','TRANSFER_IN','TRANSFER_OUT')),
  quantity         DECIMAL(24,12) NOT NULL,
  price_per_coin   DECIMAL(24,8)  NOT NULL,
  total_value      DECIMAL(24,8)  NOT NULL,
  fee              DECIMAL(24,8)  NOT NULL DEFAULT 0,
  notes            TEXT,
  transacted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ct_transactions_user_id_idx    ON ct_transactions (user_id);
CREATE INDEX IF NOT EXISTS ct_transactions_coin_id_idx    ON ct_transactions (coin_id);
CREATE INDEX IF NOT EXISTS ct_transactions_transacted_idx ON ct_transactions (transacted_at DESC);
CREATE INDEX IF NOT EXISTS ct_transactions_user_coin_idx  ON ct_transactions (user_id, coin_id);

-- ------------------------------------------------------------
-- 4. ct_watchlist
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ct_watchlist (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id        TEXT        NOT NULL,
  coin_symbol    TEXT        NOT NULL,
  coin_name      TEXT        NOT NULL,
  coin_image_url TEXT,
  added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ct_watchlist_user_coin_unique UNIQUE (user_id, coin_id)
);

CREATE INDEX IF NOT EXISTS ct_watchlist_user_id_idx ON ct_watchlist (user_id);

-- ------------------------------------------------------------
-- 5. ct_price_snapshots  (Phase 2 — table created now, used later)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ct_price_snapshots (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_id          TEXT        NOT NULL,
  price_usd        DECIMAL(24,8)  NOT NULL,
  price_change_24h DECIMAL(10,4),
  market_cap       DECIMAL(30,2),
  volume_24h       DECIMAL(30,2),
  snapped_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ct_price_snapshots_coin_time_idx
  ON ct_price_snapshots (coin_id, snapped_at DESC);

-- ============================================================
-- RLS POLICIES
-- (BUILD owns enabling RLS and writing policies — SPEC defines intent)
-- ============================================================

-- ct_profiles: user can only read/write their own row
ALTER TABLE ct_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_profiles_select ON ct_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY ct_profiles_insert ON ct_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY ct_profiles_update ON ct_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ct_holdings: user sees only their holdings
ALTER TABLE ct_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_holdings_all ON ct_holdings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ct_transactions: user sees only their transactions
ALTER TABLE ct_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_transactions_all ON ct_transactions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ct_watchlist: user sees only their watchlist
ALTER TABLE ct_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_watchlist_all ON ct_watchlist
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ct_price_snapshots: read-only for all authenticated users
ALTER TABLE ct_price_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY ct_price_snapshots_select ON ct_price_snapshots
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

## API Routes

> **Role definitions used below:**
> - `authenticated` — any logged-in Supabase user (verified via `supabase.auth.getUser()`)
> - `anon` — unauthenticated request
> All routes under `/api/` reject `anon` with `401 Unauthorized` unless explicitly noted.

---

### `GET /api/prices`

**Purpose:** Proxy CoinGecko simple price endpoint. Prevents exposing API key to client; adds 20s server-side cache.

**Roles:** `authenticated`

**Query params:**

| Param | Required | Example |
|---|---|---|
| `ids` | Yes | `bitcoin,ethereum,solana` |
| `include_24h_change` | No | `true` (default true) |

**Response `200`:**
```json
{
  "bitcoin":  { "usd": 62450.12, "usd_24h_change": 2.31 },
  "ethereum": { "usd": 3012.45, "usd_24h_change": -1.05 }
}
```

**Implementation notes:**
- Calls `https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd&include_24hr_change=true`
- Sets `Cache-Control: s-maxage=20, stale-while-revalidate=30`
- On CoinGecko `429`, returns cached stale data with `X-Cache-Status: STALE` header.
- Server env var `COINGECKO_API_KEY` injected as `x-cg-demo-api-key` header when set; omitted when absent (free tier).

---

### `GET /api/prices/history`

**Purpose:** Fetch 7-day daily price history for sparklines.

**Roles:** `authenticated`

**Query params:**

| Param | Required | Example |
|---|---|---|
| `id` | Yes | `bitcoin` |
| `days` | No | `7` (default 7) |

**Response `200`:**
```json
{
  "coinId": "bitcoin",
  "prices": [
    [1713916800000, 60200.12],
    [1714003200000, 61450.00]
  ]
}
```

**Implementation notes:**
- Calls `https://api.coingecko.com/api/v3/coins/{id}/market_chart?vs_currency=usd&days=7&interval=daily`
- Cache: `s-maxage=300` (5 minutes — sparklines don't need real-time freshness).

---

### `GET /api/coins/search`

**Purpose:** Search CoinGecko for coins by name or symbol to populate add-holding/watchlist modals.

**Roles:** `authenticated`

**Query params:**

| Param | Required | Example |
|---|---|---|
| `q` | Yes | `bitcoin` |

**Response `200`:**
```json
{
  "coins": [
    {
      "id": "bitcoin",
      "name": "Bitcoin",
      "symbol": "BTC",
      "thumb": "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png"
    }
  ]
}
```

**Implementation notes:**
- Calls `https://api.coingecko.com/api/v3/search?query={q}`
- Returns top 10 results only.
- Cache: `s-maxage=60`.

---

### `GET /api/holdings`

**Purpose:** Return all holdings for the authenticated user.

**Roles:** `authenticated`

**Response `200`:**
```json
{
  "holdings": [
    {
      "id": "uuid",
      "coinId": "bitcoin",
      "coinSymbol": "BTC",
      "coinName": "Bitcoin",
      "coinImageUrl": "https://...",
      "quantity": "0.500000000000",
      "avgBuyPrice": "55000.00000000"
    }
  ]
}
```

---

### `POST /api/holdings`

**Purpose:** Create or update a holding (upsert by `coin_id`).

**Roles:** `authenticated`

**Request body:**
```json
{
  "coinId": "bitcoin",
  "coinSymbol": "BTC",
  "coinName": "Bitcoin",
  "coinImageUrl": "https://...",
  "quantity": 0.5,
  "avgBuyPrice": 55000
}
```

**Implementation notes:**
- Uses Supabase `.upsert()` on `(user_id, coin_id)` conflict (PATTERN 2).
- Returns the upserted row.

---

### `PATCH /api/holdings/[id]`

**Purpose:** Edit quantity or avgBuyPrice of an existing holding.

**Roles:** `authenticated` (verified owner only — `user_id = auth.uid()` enforced via RLS)

**Request body:** Partial — any subset of `{ quantity, avgBuyPrice }`.

---

### `DELETE /api/holdings/[id]`

**Purpose:** Remove a holding. Does NOT delete associated transactions.

**Roles:** `authenticated` (owner only via RLS)

---

### `GET /api/transactions`

**Purpose:** Paginated list of transactions for the authenticated user.

**Roles:** `authenticated`

**Query params:**

| Param | Default | Notes |
|---|---|---|
| `page` | `1` | 1-indexed |
| `limit` | `25` | Max 100 |
| `coinId` | (none) | Filter by coin |
| `type` | (none) | `BUY`, `SELL`, `TRANSFER_IN`, `TRANSFER_OUT` |
| `from` | (none) | ISO date string |
| `to` | (none) | ISO date string |

**Response `200`:**
```json
{
  "transactions": [...],
  "total": 142,
  "page": 1,
  "limit": 25
}
```

---

### `POST /api/transactions`

**Purpose:** Add a new transaction. Recalculates the related holding's `quantity` and `avg_buy_price`.

**Roles:** `authenticated`

**Request body:**
```json
{
  "coinId": "ethereum",
  "coinSymbol": "ETH",
  "coinName": "Ethereum",
  "coinImageUrl": "https://...",
  "transactionType": "BUY",
  "quantity": 1.5,
  "pricePerCoin": 3000,
  "fee": 4.5,
  "notes": "Bought on Coinbase",
  "transactedAt": "2026-04-20T10:00:00Z"
}
```

**Holding recalculation logic (server-side):**
1. Fetch all non-TRANSFER transactions for `(user_id, coin_id)` ordered by `transacted_at ASC`.
2. Include the new transaction.
3. Compute running `quantity` and `avg_buy_price` using FIFO-adjusted weighted average:
   - On `BUY`: `newAvg = (prevQty × prevAvg + newQty × newPrice) / (prevQty + newQty)`
   - On `SELL`: subtract quantity; avg_buy_price unchanged.
4. Upsert into `ct_holdings`.

**Response `201`:** Created transaction + updated holding.

---

### `DELETE /api/transactions/[id]`

**Purpose:** Delete a transaction and recompute the holding.

**Roles:** `authenticated` (owner only via RLS)

**Response `200`:** Deleted transaction ID + updated holding.

---

### `GET /api/transactions/export`

**Purpose:** Stream a CSV file of the user's filtered transactions.

**Roles:** `authenticated`

**Query params:** Same filters as `GET /api/transactions`.

**Response:** `Content-Type: text/csv` attachment with filename `ct-transactions-{YYYY-MM-DD}.csv`.

---

### `GET /api/watchlist`

**Purpose:** Return all watchlist entries for the authenticated user.

**Roles:** `authenticated`

---

### `POST /api/watchlist`

**Purpose:** Add a coin to the watchlist.

**Roles:** `authenticated`

**Request body:**
```json
{
  "coinId": "solana",
  "coinSymbol": "SOL",
  "coinName": "Solana",
  "coinImageUrl": "https://..."
}
```

Uses `.upsert()` on `(user_id, coin_id)` (PATTERN 2).

---

### `DELETE /api/watchlist/[id]`

**Purpose:** Remove a coin from the watchlist.

**Roles:** `authenticated` (owner only via RLS)

---

## Component Structure

```
/tmp/factory-builds/crypto-tracker-mobvl5re/
├── app/
│   ├── globals.css                        → Tailwind v4 @theme {} dark tokens, base resets
│   ├── layout.tsx                         → Root layout, dark class on <html>, QueryProvider, font
│   ├── page.tsx                           → Redirect: auth? → /dashboard : → /login
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx                   → Email/password + magic link login form
│   │   └── signup/
│   │       └── page.tsx                   → Email/password registration form
│   └── (app)/
│       ├── layout.tsx                     → Authenticated shell: Sidebar + TopBar w/ LiveTicker
│       ├── dashboard/
│       │   └── page.tsx                   → Assembles PortfolioSummary + AllocationChart + HoldingsTable preview
│       ├── portfolio/
│       │   └── page.tsx                   → Full HoldingsTable with all columns + AddHoldingModal trigger
│       ├── transactions/
│       │   └── page.tsx                   → TransactionHistory table + AddTransactionModal trigger + export
│       └── watchlist/
│           └── page.tsx                   → WatchlistTable + AddToWatchlistModal trigger
│
├── app/api/
│   ├── prices/
│   │   ├── route.ts                       → GET: proxy CoinGecko simple price, 20s cache
│   │   └── history/
│   │       └── route.ts                   → GET: proxy CoinGecko market_chart, 5min cache
│   ├── coins/
│   │   └── search/
│   │       └── route.ts                   → GET: proxy CoinGecko /search, 60s cache
│   ├── holdings/
│   │   ├── route.ts                       → GET: list | POST: upsert
│   │   └── [id]/
│   │       └── route.ts                   → PATCH: edit | DELETE: remove
│   ├── transactions/
│   │   ├── route.ts                       → GET: paginated list | POST: create + recalc
│   │   ├── export/
│   │   │   └── route.ts                   → GET: CSV download
│   │   └── [id]/
│   │       └── route.ts                   → DELETE: remove + recalc holding
│   └── watchlist/
│       ├── route.ts                       → GET: list | POST: upsert
│       └── [id]/
│           └── route.ts                   → DELETE: remove
│
├── components/
│   ├── providers/
│   │   ├── QueryProvider.tsx              → TanStack Query client wrapper (client component)
│   │   └── SupabaseProvider.tsx           → Supabase client context + session listener
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx                    → Nav links: Dashboard, Portfolio, Transactions, Watchlist
│   │   ├── TopBar.tsx                     → App header bar housing LiveTicker + UserMenu
│   │   └── UserMenu.tsx                   → Avatar dropdown: Profile, Sign out
│   │
│   ├── ticker/
│   │   └── LiveTicker.tsx                 → Marquee scrolling price strip; 30s polling; flash animation
│   │
│   ├── dashboard/
│   │   ├── PortfolioSummary.tsx           → Stats card: total value, 24h change, P&L, cost basis
│   │   ├── AllocationChart.tsx            → Recharts PieChart donut + legend
│   │   └── TopMovers.tsx                  → Top 3 gainers / losers mini cards
│   │
│   ├── portfolio/
│   │   ├── HoldingsTable.tsx              → Sortable table with sparkline column + expand row
│   │   ├── HoldingRow.tsx                 → Single holding row; expand → detail panel
│   │   ├── HoldingDetailPanel.tsx         → Expanded row: 7-day chart + quick-add-transaction
│   │   ├── AddHoldingModal.tsx            → Modal: coin search, qty, avg buy price
│   │   └── EditHoldingModal.tsx           → Modal: edit qty + avg buy price inline
│   │
│   ├── transactions/
│   │   ├── TransactionHistory.tsx         → Paginated table + filter bar
│   │   ├── TransactionRow.tsx             → Single row with type color coding
│   │   ├── TransactionFilters.tsx         → Coin filter, type select, date range pickers
│   │   └── AddTransactionModal.tsx        → Full form: coin search, type, qty, price, fee, date, notes
│   │
│   ├── watchlist/
│   │   ├── WatchlistTable.tsx             → Price table with sparklines + "In Portfolio" badge
│   │   └── AddToWatchlistModal.tsx        → Coin search modal
│   │
│   └── shared/
│       ├── PriceSparkline.tsx             → 120×40 Recharts LineChart; color prop green|red
│       ├── PriceChange.tsx                → Formats ±% with color + ArrowUp/ArrowDown lucide icon
│       ├── CoinIcon.tsx                   → <img> with fallback to generic coin SVG
│       ├── CurrencyDisplay.tsx            → Formats numbers: $1,234.56 or $0.000123
│       ├── SortableHeader.tsx             → Table header with ChevronUp/ChevronDown sort indicator
│       ├── EmptyState.tsx                 → Generic empty state with icon + CTA
│       └── LoadingSkeleton.tsx            → Pulse skeleton variants: table-row, card, sparkline
│
├── hooks/
│   ├── useLivePrices.ts                   → TanStack Query; polls /api/prices every 30s; price flash state
│   ├── useSparkline.ts                    → TanStack Query; fetches /api/prices/history; 5min stale
│   ├── useHoldings.ts                     → TanStack Query; GET/mutate /api/holdings
│   ├── useTransactions.ts                 → TanStack Query; GET/mutate /api/transactions with filters
│   ├── useWatchlist.ts                    → TanStack Query; GET/mutate /api/watchlist
│   └── usePortfolioStats.ts               → Derives totals from holdings + live prices (useMemo)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      → createBrowserClient (client components only — PATTERN 1)
│   │   ├── server.ts                      → createServerClient (server components + API routes)
│   │   └── middleware.ts                  → Session refresh helper for Next.js middleware
│   ├── coingecko/
│   │   ├── client.ts                      → fetch wrapper with API key injection + error handling
│   │   └── types.ts                       → CoinGecko response type definitions
│   ├── store/
│   │   └── priceStore.ts                  → Zustand store: { prices, setPrices, flashMap, setFlash }
│   └── utils/
│       ├── formatters.ts                  → formatUSD(), formatPercent(), formatQuantity(), formatDate()
│       ├── calculations.ts                → calcPnl(), calcPortfolioStats(), calcAvgBuyPrice()
│       └── chartColors.ts                 → 12-color deterministic palette for AllocationChart
│
├── types/
│   ├── database.ts                        → TypeScript types matching every DB table (snake_case input, camelCase output)
│   └── coingecko.ts                       → CoinGecko API response types
│
├── middleware.ts                           → Auth guard: redirect /app/* to /login if no session
├── next.config.ts                          → Image domains: assets.coingecko.com
├── tailwind.config.ts                      → Tailwind v4 config; darkMode: 'class'
└── .env.local.example                      → Template env var file (not committed)
```

---

### Component State & Data Flow

```
CoinGecko API
    │
    ▼
/api/prices (Next.js route, 20s cache)
    │
    ▼ (TanStack Query, 30s refetch)
useLivePrices hook
    │
    ├──► priceStore (Zustand) ──► LiveTicker.tsx
    │
    ├──► usePortfolioStats ──► PortfolioSummary.tsx
    │
    └──► HoldingsTable.tsx (merges with ct_holdings rows)

Supabase DB (ct_holdings)
    │
    ▼ (TanStack Query)
useHoldings hook
    │
    └──► HoldingsTable.tsx ──► AllocationChart.tsx
```

---

## Third-Party Integrations

### CoinGecko Public API

- **Base URL:** `https://api.coingecko.com/api/v3`
- **Auth:** Optional `x-cg-demo-api-key: {COINGECKO_API_KEY}` header for higher rate limits
- **Rate limit (free/demo):** 10–30 req/min. Managed by:
  - Server-side response caching (`s-maxage`)
  - Client polls only via `/api/prices` proxy (not directly)
  - Sparkline fetches deduped by TanStack Query coin ID key
- **Endpoints used:**

| Endpoint | Used For | Cache TTL |
|---|---|---|
| `GET /simple/price` | Live prices, 24h change | 20s |
| `GET /coins/{id}/market_chart` | 7-day sparkline data | 5 min |
| `GET /search` | Coin search in modals | 60s |
| `GET /coins/markets` | Ticker top-10 market data | 30s |

- **Error handling:** On `429 Too Many Requests`, return last cached price + `X-Cache-Status: STALE`. On `5xx`, return `503` to client with user-visible toast "Price data temporarily unavailable."
- **No client-side direct calls.** All CoinGecko requests are server-side proxied to avoid CORS and to protect the API key (PATTERN 1).

---

### Supabase

- **Services used:** Auth, PostgreSQL, Row Level Security
- **Client package:** `@supabase/supabase-js` v2
- **SSR package:** `@supabase/ssr` v0.5+
- **Browser client:** `lib/supabase/client.ts` — `createBrowserClient` from `@supabase/ssr`
- **Server client:** `lib/supabase/server.ts` — `createServerClient` with cookie store from `next/headers`
- **Auth method:** Email/password + Magic Link (Supabase built-in)
- **Session refresh:** `middleware.ts` calls `supabase.auth.getUser()` on every request to `/(app)/*`

---

### Recharts

- **Version:** `^2.12`
- **Components used:**
  - `PieChart` + `Pie` + `Cell` + `Tooltip` + `Legend` — AllocationChart
  - `LineChart` + `Line` + `Area` + `ResponsiveContainer` — PriceSparkline
- **Theming:** All chart colors use the `chartColors.ts` palette; background transparent (inherits dark bg)
- **Responsive wrapper:** Every chart wrapped in `<ResponsiveContainer width="100%" height="...">` to support mobile

---

### TanStack Query (React Query)

- **Version:** `@tanstack/react-query ^5`
- **QueryClient config:**
  ```ts
  {
    defaultOptions: {
      queries: {
        staleTime: 20_000,       // 20s — matches price cache
        refetchInterval: 30_000, // 30s polling for price queries
        retry: 2,
        refetchOnWindowFocus: true
      }
    }
  }
  ```
- **Key conventions:**
  - `['prices', coinIds.join(',')]`
  - `['sparkline', coinId]`
  - `['holdings', userId]`
  - `['transactions', userId, filters]`
  - `['watchlist', userId]`

---

### Zustand

- **Version:** `^4`
- **Store:** `lib/store/priceStore.ts`
  ```ts
  interface PriceStore {
    prices: Record<string, { usd: number; usd_24h_change: number }>;
    flashMap: Record<string, 'up' | 'down' | null>;
    setPrices: (incoming: typeof prices) => void; // computes flash diffs
  }
  ```
- **Usage:** `LiveTicker` and `HoldingsTable` subscribe to `prices`. Flash state auto-clears after 800ms.

---

## Implementation Plan

### 1. File Structure
*(see Component Structure section above — every file listed with `→` annotations)*

---

### 2. Key Technical Decisions

1. **Next.js 15 App Router + Server Components** — Enables SSR for initial holdings load (better LCP), while client components handle live price subscriptions. Cleaner separation of concerns than Pages router.
2. **CoinGecko free tier, server-proxied** — No API key required for Phase 1; proxy prevents CORS issues and hides key in Phase 2. Client never calls CoinGecko directly (PATTERN 1).
3. **30-second polling over WebSocket** — CoinGecko WebSocket requires Pro plan. Polling at 30s is imperceptible UX degradation for a portfolio tracker vs. a trading terminal, and keeps Phase 1 zero-cost.
4. **Holding recalculation in API route, not DB trigger** — Weighted average recalc requires ordered transaction history; a Postgres trigger would need a full table scan. API route is clearer and testable.
5. **Zustand for price flash state** — Price flash (color animation on tick) is ephemeral UI state with no persistence. Zustand avoids prop drilling across Ticker + Table components.
6. **TanStack Query for all server state** — Replaces ad-hoc `useEffect` fetching; handles deduplication of sparkline requests across multiple rows rendering simultaneously.
7. **Recharts over Chart.js** — Recharts is React-native, tree-shakeable, and composable with JSX. No imperative canvas manipulation needed.
8. **`DECIMAL(24,12)` for quantity** — Supports high-precision altcoins (e.g., SHIB at 0.0000000018) without floating-point drift.
9. **Tailwind v4 `@theme {}` syntax** — PATTERN 17: v4 does not use `:root {}` for CSS variables; all design tokens defined in `globals.css` under `@theme {}`.
10. **lucide-react for all icons** — PATTERN 13: no emoji used as UI icons anywhere in the codebase.

---

### 3. Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | `^15.3` | Framework (App Router, Server Components) |
| `react` | `^19` | UI library |
| `react-dom` | `^19` | DOM bindings |
| `typescript` | `^5.5` | Type safety |
| `tailwindcss` | `^4.1` | Utility CSS (v4 — @theme syntax) |
| `@supabase/supabase-js` | `^2.43` | Supabase client |
| `@supabase/ssr` | `^0.5` | Supabase SSR helpers for Next.js |
| `@tanstack/react-query` | `^5.40` | Server state, polling, caching |
| `recharts` | `^2.12` | Charts (donut, sparkline, area) |
| `zustand` | `^4.5` | Price flash state store |
| `lucide-react` | `^0.395` | Icons (PATTERN 13) |
| `date-fns` | `^3.6` | Date formatting |
| `clsx` | `^2.1` | Conditional className merging |
| `tailwind-merge` | `^2.3` | Tailwind class conflict resolution |
| `papaparse` | `^5.4` | CSV generation for transaction export |
| `@radix-ui/react-dialog` | `^1.1` | Modal primitives (shadcn base) |
| `@radix-ui/react-select` | `^2.1` | Select dropdown (transaction type filter) |
| `@radix-ui/react-tooltip` | `^1.1` | Chart hover tooltips |

---

### 4. Shell Commands

```bash
# 1. Scaffold Next.js project
cd /tmp/factory-builds/crypto-tracker-mobvl5re
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --yes

# 2. Install dependencies
npm install \
  @supabase/supabase-js@^2.43.0 \
  @supabase/ssr@^0.5.0 \
  @tanstack/react-query@^5.40.0 \
  recharts@^2.12.0 \
  zustand@^4.5.0 \
  lucide-react@^0.395.0 \
  date-fns@^3.6.0 \
  clsx@^2.1.0 \
  tailwind-merge@^2.3.0 \
  papaparse@^5.4.0

# 3. Install Radix UI primitives
npm install \
  @radix-ui/react-dialog@^1.1.0 \
  @radix-ui/react-select@^2.1.0 \
  @radix-ui/react-tooltip@^1.1.0 \
  @radix-ui/react-dropdown-menu@^2.1.0

# 4. Install shadcn/ui CLI and initialize
npx shadcn@latest init --yes

# 5. Add required shadcn components
npx shadcn@latest add button input label card badge table skeleton toast

# 6. Copy environment template
cp .env.local.example .env.local
# Then fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, COINGECKO_API_KEY

# 7. Run migration in Supabase SQL editor
# (paste contents of spec.md Migration SQL section)

# 8. Start dev server
npm run dev
```

---

## Prerequisites

| Dependency | Status | Notes |
|---|---|---|
| Node.js ≥ 20 | ✅ Ready | Required for Next.js 15 |
| Supabase project | ⚠️ Needs setup | Create at supabase.com; free tier sufficient |
| `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ Needs setup | From Supabase project settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ⚠️ Needs setup | From Supabase project settings → API |
| `COINGECKO_API_KEY` | ✅ Ready (optional) | Free tier works without key; key improves rate limits. Get at coingecko.com/en/api |
| CoinGecko public API accessible | ✅ Ready | `https://api.coingecko.com/api/v3` — no key required for Phase 1 |
| Migration SQL applied | ⚠️ Needs setup | Run migration block in Supabase SQL editor before first use |
| Supabase Auth email provider | ✅ Ready | Enabled by default on all Supabase projects |
| `next.config.ts` image domain | ⚠️ Needs setup | Add `assets.coingecko.com` to `images.remotePatterns` |

> **No ❌ Blocked items.** Phase 1 can begin immediately with a new Supabase project and free CoinGecko access.

---

## Phase Scope

### Phase 1 — BUILD NOW (zero external blockers)

All features below are deliverable with only a Supabase project (free tier) and public CoinGecko API (no key):

- [x] Authentication (email/password + magic link)
- [x] Dark mode layout with Sidebar + TopBar
- [x] Live price ticker (30s polling, top 10 coins)
- [x] Holdings table with full P&L columns
- [x] 7-day price sparklines per holding
- [x] Portfolio summary stats card (total value, 24h change, total P&L)
- [x] Portfolio allocation donut chart
- [x] Add/Edit/Delete holdings modal
- [x] Transaction history table (paginated, filterable)
- [x] Add/Delete transactions with holding auto-recalculation
- [x] CSV export of transactions
- [x] Watchlist table with live prices + sparklines
- [x] Add/Remove watchlist items via coin search
- [x] "In Portfolio" badge on watchlist coins already held
- [x] Flash animation on price ticks (green/red)

### Phase 2 — DEFERRED

Features that require additional accounts, infrastructure, or compliance review:

| Feature | Blocker |
|---|---|
| CoinGecko Pro WebSocket live prices | Requires paid CoinGecko plan ($129+/mo) |
| OAuth sign-in (Google, GitHub) | Requires OAuth app setup per provider |
| Multi-currency support (EUR, GBP, JPY) | Requires forex rate API (e.g., Open Exchange Rates) |
| Price alert notifications | Requires email/push notification infrastructure |
| `ct_price_snapshots` background job | Requires a cron worker (Supabase Edge Functions or external) |
| Portfolio performance chart (all-time) | Depends on `ct_price_snapshots` historical data |
| Tax report generation (FIFO/LIFO) | Requires accounting logic + compliance review per jurisdiction |
| Mobile app (React Native) | Separate build scope |

> **Phase 2 rule:** Phase 1 is a complete, fully usable product. No Phase 1 feature stubs wait on Phase 2 infrastructure.

---

## Env Var Reference

```bash
# .env.local.example
# NEVER commit .env.local — PATTERN 6: set ALL env vars before deploying

# Supabase (public — safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# CoinGecko (server-only — NEVER expose to client — PATTERN 1)
# Optional: omit for free tier (10–30 req/min)
COINGECKO_API_KEY=CG-xxxxxxxxxxxxxxxxxxxx
```

---

## Color System (globals.css)

```css
/* Tailwind v4 — use @theme {}, NOT :root {} — PATTERN 17 */
@theme {
  --color-background:   #020617; /* slate-950 */
  --color-surface:      #0f172a; /* slate-900 */
  --color-surface-2:    #1e293b; /* slate-800 */
  --color-border:       #334155; /* slate-700 */
  --color-text-primary: #f8fafc; /* slate-50 */
  --color-text-muted:   #94a3b8; /* slate-400 */
  --color-text-faint:   #475569; /* slate-600 */
  --color-gain:         #4ade80; /* green-400 */
  --color-loss:         #f87171; /* red-400 */
  --color-gain-bg:      #052e16; /* green-950 — subtle BG for gain cells */
  --color-loss-bg:      #450a0a; /* red-950 — subtle BG for loss cells */
  --color-accent:       #6366f1; /* indigo-500 — primary CTA buttons */
}
```

---

## Calculation Reference (`lib/utils/calculations.ts`)

```ts
// All calculations are pure functions — no side effects, fully testable

export function calcPnl(quantity: number, avgBuyPrice: number, currentPrice: number) {
  const costBasis     = quantity * avgBuyPrice;
  const currentValue  = quantity * currentPrice;
  const pnlAmount     = currentValue - costBasis;
  const pnlPercent    = costBasis === 0 ? 0 : (pnlAmount / costBasis) * 100;
  return { costBasis, currentValue, pnlAmount, pnlPercent };
}

export function calcPortfolioStats(
  holdings: { quantity: number; avgBuyPrice: number; currentPrice: number }[]
) {
  return holdings.reduce(
    (acc, h) => {
      const { costBasis, currentValue, pnlAmount } = calcPnl(h.quantity, h.avgBuyPrice, h.currentPrice);
      acc.totalValue    += currentValue;
      acc.totalCost     += costBasis;
      acc.totalPnl      += pnlAmount;
      return acc;
    },
    { totalValue: 0, totalCost: 0, totalPnl: 0 }
  );
}

// Weighted average on BUY; unchanged on SELL
export function calcNewAvgBuyPrice(
  prevQty: number, prevAvg: number,
  addQty: number,  addPrice: number
): number {
  const totalQty = prevQty + addQty;
  if (totalQty === 0) return 0;
  return (prevQty * prevAvg + addQty * addPrice) / totalQty;
}
```

---

*End of specification. All sections mandatory per spec contract.*
