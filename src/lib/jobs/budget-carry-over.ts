import { Queue, Worker } from 'bullmq';
import { redis } from '@/lib/redis';
import { BudgetService } from '@/lib/services/budget.service';

const QUEUE_NAME = 'budget-carry-over';

export const budgetCarryOverQueue = new Queue(QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
    },
});

export const budgetCarryOverWorker = new Worker(
    QUEUE_NAME,
    async (job) => {
        console.log(`[BudgetCarryOver] Running budget carry-over job: ${job.id}`);

        // We can pass a specific month or just use the current month
        const today = new Date();
        const result = await BudgetService.processCarryOver(today);

        return {
            success: true,
            processed: result.length,
        };
    },
    { connection: redis }
);
