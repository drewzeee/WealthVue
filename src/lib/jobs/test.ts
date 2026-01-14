import { Job } from 'bullmq';
import { createQueue, createWorker } from './queue';

export const TEST_QUEUE_NAME = 'test-queue';

export const testQueue = createQueue(TEST_QUEUE_NAME);

export const createTestWorker = () => 
  createWorker(TEST_QUEUE_NAME, async (job: Job) => {
    console.log(`[Worker] Processing job ${job.id} with data:`, job.data);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
    console.log(`[Worker] Job ${job.id} completed`);
    return { result: 'success', processedAt: new Date() };
  });
