import IORedis from "ioredis"

const redisUrl = process.env.REDIS_URL

export const redis = redisUrl 
  ? new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    })
  : null
