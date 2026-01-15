import { createTestWorker } from '@/lib/jobs/test';
import { priceUpdateWorker, priceUpdateQueue } from '@/lib/jobs/price-update';
import { netWorthSnapshotWorker, netWorthSnapshotQueue } from '@/lib/jobs/net-worth-snapshot';
import { budgetCarryOverWorker, budgetCarryOverQueue } from '@/lib/jobs/budget-carry-over';
import { redis } from '@/lib/redis';

async function startWorkers() {
  console.log('Starting workers...');

  const testWorker = createTestWorker();

  testWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  testWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
  });

  // Price Update Worker Events
  priceUpdateWorker.on('completed', (job) => {
    console.log(`[PriceUpdate] Job ${job.id} completed. Updated: ${job.returnvalue?.updated ?? 0}`);
  });

  priceUpdateWorker.on('failed', (job, err) => {
    console.error(`[PriceUpdate] Job ${job?.id} failed: ${err.message}`);
  });

  // Net Worth Snapshot Worker Events
  netWorthSnapshotWorker.on('failed', (job, err) => {
    console.error(`[NetWorthSnapshot] Job ${job?.id} (${job?.name}) failed: ${err.message}`);
  });

  // Budget Carry Over Worker Events
  budgetCarryOverWorker.on('completed', (job) => {
    console.log(`[BudgetCarryOver] Job ${job.id} completed. Processed: ${job.returnvalue?.processed ?? 0}`);
  });

  budgetCarryOverWorker.on('failed', (job, err) => {
    console.error(`[BudgetCarryOver] Job ${job?.id} failed: ${err.message}`);
  });

  // Schedule recurring price update (every 15 minutes)
  await priceUpdateQueue.add(
    'recurring-price-update',
    {},
    {
      repeat: { pattern: '*/15 * * * *' },
      jobId: 'recurring-price-update-config',
      removeOnComplete: true
    }
  );
  console.log('Scheduled recurring price update job (every 15 mins).');

  // Schedule recurring net worth snapshot (daily at midnight UTC)
  await netWorthSnapshotQueue.add(
    'daily-snapshot-trigger',
    {},
    {
      repeat: { pattern: '0 0 * * *' },
      jobId: 'daily-snapshot-config',
      removeOnComplete: true
    }
  );
  console.log('Scheduled daily net worth snapshot trigger (midnight UTC).');

  // Schedule monthly budget carry-over (1st of every month at 00:05 UTC)
  await budgetCarryOverQueue.add(
    'monthly-budget-carry-over',
    {},
    {
      repeat: { pattern: '5 0 1 * *' },
      jobId: 'monthly-budget-carry-over-config',
      removeOnComplete: true
    }
  );
  console.log('Scheduled monthly budget carry-over (1st of month 00:05 UTC).');

  console.log('Workers started successfully');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down workers...');
    await testWorker.close();
    await priceUpdateWorker.close();
    await netWorthSnapshotWorker.close();
    await budgetCarryOverWorker.close();
    await redis.quit();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startWorkers().catch((err) => {
  console.error('Failed to start workers:', err);
  process.exit(1);
});
