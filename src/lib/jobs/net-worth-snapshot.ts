import { createQueue, createWorker } from './queue';
import { prisma } from '@/lib/db/client';
import { NetWorthService } from '@/lib/services/net-worth.service';

export const NET_WORTH_SNAPSHOT_QUEUE_NAME = 'net-worth-snapshot';

export const netWorthSnapshotQueue = createQueue(NET_WORTH_SNAPSHOT_QUEUE_NAME);

export const netWorthSnapshotWorker = createWorker(NET_WORTH_SNAPSHOT_QUEUE_NAME, async (job) => {
  const jobName = job.name;
  console.log(`[NetWorthSnapshot] Starting job ${job.id} (${jobName})`);

  try {
    if (jobName === 'daily-snapshot-trigger') {
      // 1. Fetch all users
      const users = await prisma.user.findMany({
        select: { id: true }
      });

      console.log(`[NetWorthSnapshot] Triggering snapshots for ${users.length} users...`);

      // 2. Add a job for each user
      const jobs = users.map(user => ({
        name: 'snapshot-user',
        data: { userId: user.id },
        opts: {
          removeOnComplete: true,
          jobId: `snapshot-${user.id}-${new Date().toISOString().split('T')[0]}` // Prevent duplicates per day
        }
      }));

      await netWorthSnapshotQueue.addBulk(jobs);

      return { triggered: users.length };
    } 
    
    else if (jobName === 'snapshot-user') {
      const { userId } = job.data;
      if (!userId) throw new Error('userId is required for snapshot-user job');

      const snapshot = await NetWorthService.generateSnapshot(userId);
      console.log(`[NetWorthSnapshot] Snapshot created for user ${userId}: $${snapshot.netWorth}`);
      
      return { 
        userId, 
        netWorth: snapshot.netWorth,
        snapshotId: snapshot.id 
      };
    }

    else {
      console.warn(`[NetWorthSnapshot] Unknown job name: ${jobName}`);
      return { success: false, reason: 'Unknown job name' };
    }

  } catch (error) {
    console.error(`[NetWorthSnapshot] Job ${jobName} failed:`, error);
    throw error;
  }
});
