import IORedis from "ioredis"

const redisUrl = process.env.REDIS_URL

export const redis = redisUrl 
  ? new IORedis(redisUrl, {
      maxRetriesPerRequest: 0, // Fail immediately
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      }
    })
  : null

if (redis) {
  redis.on("error", () => {
    // Silent failure
  })
}
