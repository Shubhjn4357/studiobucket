export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { Worker } = await import('bullmq')
    const { logger } = await import('@/lib/logger')
    const { createYouTubeService } = await import('@/lib/youtube')
    const IORedis = (await import('ioredis')).default

    const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    })

    // Upload Worker
    new Worker('upload-queue', async (job) => {
      logger.info(`Processing upload job ${job.id}`)
      const { userId, filePath, metadata } = job.data
      
      const youtube = await createYouTubeService(userId)
      await youtube.uploadVideo({
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags?.split(','),
        filePath,
        privacy: metadata.privacy || 'private',
        publishAt: metadata.publishAt ? new Date(metadata.publishAt) : undefined,
      })
      
      logger.info(`Job ${job.id} completed`)
    }, { connection })

    // Download Worker
    new Worker('download-queue', async (job) => {
      logger.info(`Processing download job ${job.id}`)
      // Add yt-dlp logic here
    }, { connection })

    logger.info('Background Workers Registered')
  }
}
