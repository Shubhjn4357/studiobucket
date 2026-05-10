import IORedis from "ioredis"

const redisUrl = process.env.REDIS_URL

export const redis = redisUrl 
  ? new IORedis(redisUrl, {
      maxRetriesPerRequest: 3, // Don't retry indefinitely
      enableOfflineQueue: false,
      lazyConnect: true, // Only connect when needed
      retryStrategy(times) {
        if (times > 3) return null // Stop retrying after 3 attempts
        return Math.min(times * 100, 2000)
      }
    })
  : null

if (redis) {
  redis.on("error", (err: NodeJS.ErrnoException) => {
    // Silently handle connection errors to prevent terminal flooding
    if (err.code === "ECONNREFUSED") {
      // Redis is not available, services depending on it will be degraded
    } else {
      console.error("Redis Error:", err)
    }
  })
}
