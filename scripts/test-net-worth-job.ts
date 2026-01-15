import { netWorthSnapshotQueue, netWorthSnapshotWorker } from '../src/lib/jobs/net-worth-snapshot';
import { redis } from '../src/lib/redis';
import { prisma } from '../src/lib/db/client';

async function testNetWorthJob() {
  console.log('Testing Net Worth Snapshot Job Flow...');

  // 1. Create a test user
  const user = await prisma.user.create({
    data: {
      email: `job-test-${Date.now()}@example.com`,
      name: "Job Tester",
      passwordHash: "dummy",
    },
  });
  console.log(`Created test user: ${user.id}`);

  try {
    console.log('Adding snapshot-user job to queue...');
    const job = await netWorthSnapshotQueue.add('snapshot-user', { userId: user.id });
    console.log(`Job ${job.id} added.`);

    // Wait for job to complete
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting for job completion')), 15000);
      
      netWorthSnapshotWorker.on('completed', (completedJob) => {
        if (completedJob.id === job.id) {
          clearTimeout(timeout);
          console.log('✅ Job completed successfully!');
          console.log('Result:', completedJob.returnvalue);
          resolve();
        }
      });
      
      netWorthSnapshotWorker.on('failed', (failedJob, err) => {
        if (failedJob?.id === job.id) {
          clearTimeout(timeout);
          console.error('❌ Job failed:', err);
          reject(err);
        }
      });
    });

    // Verify snapshot exists in DB
    const snapshot = await prisma.netWorthSnapshot.findFirst({
      where: { userId: user.id }
    });

    if (snapshot) {
      console.log('✅ Verified: Snapshot created in database.');
    } else {
      console.error('❌ Error: Snapshot NOT found in database.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Job flow failed:', error);
    process.exit(1);
  } finally {
    console.log('Cleaning up...');
    await prisma.user.delete({ where: { id: user.id } });
    await netWorthSnapshotWorker.close();
    await netWorthSnapshotQueue.close();
    await redis.quit();
  }
}

testNetWorthJob();
