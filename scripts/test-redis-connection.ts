import { redis } from '../src/lib/redis';

async function testConnection() {
  try {
    console.log('Testing Redis connection...');
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    if (value === 'test-value') {
      console.log('✅ Redis connection successful!');
      await redis.del('test-key');
    } else {
      console.error('❌ Redis connection failed: value mismatch');
      process.exit(1);
    }
    await redis.quit();
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    process.exit(1);
  }
}

testConnection();
