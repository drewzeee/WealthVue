# Plaid Synchronization Architecture

This document outlines the current implementation of Plaid transaction synchronization in WealthVue.

## Overview
WealthVue uses a combination of webhook-driven updates and manual triggers to keep financial data in sync with Plaid.

## Sync Mechanisms

### 1. Webhook-Driven Sync (Primary)
The system listens for webhooks from Plaid to trigger updates as soon as they are available.
- **Endpoint**: `/api/webhooks/plaid`
- **Controller**: `src/app/api/webhooks/plaid/route.ts`
- **Supported Webhooks**:
  - `SYNC_UPDATES_AVAILABLE`: Triggers a full transaction sync using the cursor-based `transactionsSync` method.
  - `INITIAL_UPDATE`: Handles initial data availability.
  - `HISTORICAL_UPDATE`: Handles historical data availability.

### 2. Manual Sync
Users can manually trigger a sync from the Settings page.
- **Endpoint**: `POST /api/plaid/sync`
- **Component**: `SyncAccountsButton` (`src/components/settings/sync-accounts-button.tsx`)
- **Controller**: `src/app/api/plaid/sync/route.ts`

### 3. Initial Link Sync
Performed immediately after successful public token exchange.
- **Service**: `PlaidService.exchangePublicToken` (`src/lib/services/plaid.service.ts`)

---

## Core Logic: PlaidService
The central logic resides in `PlaidService.syncTransactions(plaidItemId: string)`:
1.  Fetches the latest cursor for the Plaid Item.
2.  Calls Plaid's `/transactions/sync` API.
3.  Processes `added`, `modified`, and `removed` transactions.
4.  **Categorization**: New transactions are automatically categorized using the `categorizationEngine`.
5.  **Transfer Detection**: Runs `transferDetectionService` after sync to identify and link internal transfers.
6.  Updates the cursor and `lastSyncedAt` timestamp.

---

## Planned Enhancements
- 🔲 **Scheduled Backup Sync**: Implement a BullMQ job to sync all accounts daily as a fallback for missed webhooks (noted in PRD).
- 🔲 **Real-time UI Updates**: Implement WebSockets or longer-polling to show sync progress in the UI.
