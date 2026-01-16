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
      const users = await prisma.user.findMany({
        select: { id: true, timezone: true }
      });

      const now = new Date();
      const usersToSnapshot = users.filter(user => {
        const userTimezone = user.timezone || "UTC";
        try {
          const hour = new Intl.DateTimeFormat('en-US', {
            timeZone: userTimezone,
            hour: 'numeric',
            hour12: false,
          }).format(now);

          // We trigger if it's the 0th hour (midnight)
          // Note: hour might be "24" in some locales/settings, but "00" or "0" is standard for hour12: false
          return hour === "0" || hour === "00" || hour === "24";
        } catch (e) {
          console.error(`Invalid timezone for user ${user.id}: ${userTimezone}`);
          return false;
        }
      });

      console.log(`[NetWorthSnapshot] Triggering snapshots for ${usersToSnapshot.length} users (out of ${users.length})...`);

      // 2. Add a job for each user
      const jobs = usersToSnapshot.map(user => ({
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
