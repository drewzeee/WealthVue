import { createTestWorker } from '@/lib/jobs/test';
import { priceUpdateWorker, priceUpdateQueue } from '@/lib/jobs/price-update';
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

  // Schedule recurring price update (every 15 minutes)
  // We remove the existing repeatable job configuration if it exists to ensure updates to the schedule apply
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

  console.log('Workers started successfully');
  
  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down workers...');
    await testWorker.close();
    await priceUpdateWorker.close();
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
