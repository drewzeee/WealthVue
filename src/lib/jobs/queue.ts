import { Queue, QueueOptions, Worker, WorkerOptions, Job } from 'bullmq';
import { redis } from '@/lib/redis';

const DEFAULT_QUEUE_OPTIONS: QueueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};

export function createQueue(name: string, options?: QueueOptions) {
  return new Queue(name, {
    ...DEFAULT_QUEUE_OPTIONS,
    ...options,
  });
}

export function createWorker(
  name: string,
  processor: (job: Job) => Promise<any>,
  options?: WorkerOptions
) {
  return new Worker(name, processor, {
    connection: redis,
    ...options,
  });
}
