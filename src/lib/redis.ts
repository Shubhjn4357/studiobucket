import IORedis from "ioredis"

const redisUrl = process.env.REDIS_URL

export const redis = redisUrl 
  ? new IORedis(redisUrl, {
      maxRetriesPerRequest: 0, // Fail immediately
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null // Stop retrying
        return null // Don't retry at all
      }
    })
  : null

if (redis) {
  redis.on("error", () => {
    // Silent failure
  })
}
