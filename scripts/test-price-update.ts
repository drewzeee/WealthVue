import { priceUpdateQueue } from '@/lib/jobs/price-update';
import { redis } from '@/lib/redis';

async function main() {
  console.log('Triggering manual price update...');

  const job = await priceUpdateQueue.add('manual-test-update', {});
  console.log(`Job added with ID: ${job.id}`);

  console.log('Waiting for job to be processed (make sure the worker is running via "npm run worker" or similar)...');
  
  // In a real scenario, we'd listen to events, but here we just add it.
  // The worker process needs to be running separately or we can't process it here 
  // (unless we instantiate the worker here too, but that conflicts with the main worker).
  
  // For this test script, we just queue it. The user needs to run `npm run worker` to process it.
  
  console.log('Check your worker logs for output.');
  
  await redis.quit();
}

main().catch(console.error);
