import { createTestWorker } from '@/lib/jobs/test';
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

  console.log('Workers started successfully');
  
  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down workers...');
    await testWorker.close();
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
