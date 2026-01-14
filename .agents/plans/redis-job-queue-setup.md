# Redis & BullMQ Job Queue Setup

## Overview
Establish a robust background processing system using Redis and BullMQ. This infrastructure will handle long-running tasks such as Plaid transaction syncing, market price updates, and monthly budget resets without blocking the main request-response cycle.

## Goals
- Establish a reliable Redis connection singleton.
- Configure BullMQ for job producers and workers.
- Implement retry policies and error handling.
- Provide monitoring utilities for job status.

## Data Model Changes
None. BullMQ manages its own state within Redis.

## API Endpoints
None for the initial setup, but future endpoints will trigger or monitor jobs.

## UI Components
None for this phase. Monitoring may be added to the admin dashboard later.

## Implementation Steps
1. **Redis Client Setup**: Create `src/lib/redis.ts` to manage the ioredis connection singleton with connection pooling.
2. **Queue Configuration**: Create `src/lib/jobs/queue.ts` to define the base BullMQ Queue and Worker configurations.
3. **Job Retry Policies**: Define standard retry strategies (exponential backoff).
4. **Sample Job implementation**: Create a simple "ping" or "test" job to verify the end-to-end flow.
5. **Worker Initialization**: Ensure workers are initialized in the appropriate environment (e.g., during app startup or in a separate process for production).

## Testing Plan
- Unit test Redis connection success/failure.
- Verify job addition to the queue.
- Verify worker picks up and completes the job.
- Test retry logic by forcing a job failure.

## Potential Challenges
- **Connection Management**: Handling Redis connection drops gracefully.
- **Serverless Constraints**: Next.js API routes are ephemeral; we need to ensure workers stay alive or run in a persistent environment (handled via Docker in our case).
- **Environment Variables**: Ensuring `REDIS_URL` is correctly configured across all environments.
