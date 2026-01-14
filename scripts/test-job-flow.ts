import { testQueue, createTestWorker } from '../src/lib/jobs/test';
import { redis } from '../src/lib/redis';

async function testJobFlow() {
  console.log('Testing Job Flow...');
  
  // Start a local worker for this test
  const worker = createTestWorker();
  
  console.log('Adding job to queue...');
  const job = await testQueue.add('test-job', { foo: 'bar' });
  console.log(`Job ${job.id} added.`);

  // Wait for job to complete
  try {
    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for job completion')), 10000);
        
        worker.on('completed', (completedJob) => {
            if (completedJob.id === job.id) {
                clearTimeout(timeout);
                console.log('✅ Job completed successfully!');
                resolve();
            }
        });
        
        worker.on('failed', (failedJob, err) => {
             if (failedJob?.id === job.id) {
                clearTimeout(timeout);
                reject(err);
            }
        });
    });

  } catch (error) {
    console.error('❌ Job flow failed:', error);
    process.exit(1);
  } finally {
    console.log('Cleaning up...');
    await worker.close();
    await testQueue.close();
    await redis.quit();
  }
}

testJobFlow();
