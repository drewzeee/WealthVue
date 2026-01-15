# Price Updates Feature

## Overview
Implement automatic price updates for investments (Stocks/ETFs via Yahoo Finance, Crypto via CoinGecko).

## Goals
- Fetch real-time (or delayed) prices for user investments.
- Update `currentPrice` and `lastPriceUpdate` in `Investment` table.
- Record price history in `AssetPrice` table.
- Run automatically every 15 minutes.

## Integrations

### Yahoo Finance (Stocks/ETFs)
- **Source:** Unofficial Yahoo Finance API (via `yahoo-finance2` package or direct fetch if package is too heavy/problematic, but package is preferred for stability).
- **Function:** `updateStockPrices(symbols: string[])`
- **Rate Limits:** Be mindful, batch requests if possible.

### CoinGecko (Crypto)
- **Source:** CoinGecko Public API (Free tier).
- **Function:** `updateCryptoPrices(symbols: string[])`
- **Rate Limits:** 10-30 calls/minute. Need to respect this. Batching is supported.

## Data Model Changes
- None required (tables `Investment` and `AssetPrice` already exist).

## Implementation Steps

1. **Install Dependencies:**
   - `npm install yahoo-finance2` (or similar)
   - `npm install coingecko-api-v3` (or just use fetch)

2. **Create Integration Services:**
   - `src/lib/integrations/yahoo-finance.ts`
   - `src/lib/integrations/coingecko.ts`

3. **Create Job Queue:**
   - `src/lib/jobs/price-update.ts`
   - Define `priceUpdateQueue`
   - Define `priceUpdateWorker`

4. **Implement Worker Logic:**
   - Fetch all investments with `assetClass` in [STOCK, ETF, MUTUAL_FUND] -> Call Yahoo.
   - Fetch all investments with `assetClass` in [CRYPTO] -> Call CoinGecko.
   - Update DB.

5. **Register Worker:**
   - Add to `src/worker.ts`.

6. **Schedule Job:**
   - Use `cron` or BullMQ repeatable job to trigger every 15 minutes.

## Testing
- Unit test integration functions (mocking API calls).
- Integration test for the worker.
