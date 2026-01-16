# Timezone-Aware Net Worth Snapshots

This plan outlines the changes required to allow users to configure their timezone and ensure that net worth snapshots are taken at midnight in their local time, rather than midnight UTC.

## User Review Required

> [!IMPORTANT]
> The daily net worth snapshot job will be updated to run every hour. It will only generate a snapshot for a user if it's currently midnight (00:00 - 00:59) in their configured timezone.

## Proposed Changes

### Database

#### [MODIFY] [schema.prisma](file:///home/andrew/wealthvue/prisma/schema.prisma)
- Add `timezone` field to `User` model with a default value of "UTC".

### Backend Services & Jobs

#### [MODIFY] [net-worth.service.ts](file:///home/andrew/wealthvue/src/lib/services/net-worth.service.ts)
- Update `generateSnapshot` to calculate "today" based on the user's timezone.

#### [MODIFY] [net-worth-snapshot.ts](file:///home/andrew/wealthvue/src/lib/jobs/net-worth-snapshot.ts)
- Update the `daily-snapshot-trigger` logic to filter users whose current local time is midnight.

#### [MODIFY] [worker.ts](file:///home/andrew/wealthvue/src/worker.ts)
- Change the `daily-snapshot-trigger` schedule from `0 0 * * *` (daily) to `0 * * * *` (hourly).

### UI Components

#### [MODIFY] [settings/page.tsx](file:///home/andrew/wealthvue/src/app/(auth)/settings/page.tsx)
- Add a "Preferences" tab to the settings page.
- Implement a timezone selector in the "Preferences" tab.

#### [NEW] [profile-actions.ts](file:///home/andrew/wealthvue/src/app/actions/profile.ts)
- Add a server action to update the user's timezone.

## Verification Plan

### Automated Tests
- Run `pnpm test` to ensure no existing tests are broken.
- Add a unit test for `NetWorthService.generateSnapshot` to verify it handles different timezones correctly (manual mock of current time).

### Manual Verification
1. Go to Settings and change the timezone.
2. Verify that the timezone is saved correctly.
3. Trigger the snapshot job manually (via a temporary API or by adjusting the schedule/server time) and verify that the snapshot date corresponds to the user's local midnight.
