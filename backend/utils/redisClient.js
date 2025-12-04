const { createClient } = require('redis');

// Build Redis URL from environment variables
const redisUrl = process.env.REDIS_URL || 
  `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis: Too many reconnection attempts, giving up');
        return new Error('Too many retries');
      }
      // Exponential backoff: 50ms, 100ms, 200ms, etc.
      return Math.min(retries * 50, 3000);
    }
  }
});

redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('Redis: Connected'));
redis.on('ready', () => console.log('Redis: Ready to accept commands'));
redis.on('reconnecting', () => console.log('Redis: Reconnecting...'));

// Connect with error handling
(async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error('Redis: Failed to connect:', err);
    // Don't crash the app if Redis is unavailable
    // Let it retry in the background
  }
})();

module.exports = redis;