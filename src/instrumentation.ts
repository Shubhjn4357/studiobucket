export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { Worker } = await import('bullmq')
    const { logger } = await import('@/lib/logger')
    const { createYouTubeService } = await import('@/lib/youtube')
    const IORedis = (await import('ioredis')).default

    const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy(times) {
        // Stop retrying after 3 failures in dev if Redis is missing
        if (process.env.NODE_ENV === 'development' && times > 3) return null
        return Math.min(times * 100, 3000)
      }
    })

    connection.on('error', (err: unknown) => {
      const error = err as NodeJS.ErrnoException
      if (error.code !== 'ECONNREFUSED') {
        console.error('Instrumentation Redis Error:', err)
      }
    })

    // Upload Worker
    const uploadWorker = new Worker('upload-queue', async (job) => {
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

    uploadWorker.on('error', (err) => {
      if (err.message.includes('ECONNREFUSED')) return
      logger.error({ err }, 'Upload Worker Error')
    })

    // Download Worker
    const downloadWorker = new Worker('download-queue', async (job) => {
      logger.info(`Processing download job ${job.id}`)
      // Add yt-dlp logic here
    }, { connection })

    downloadWorker.on('error', (err) => {
      if (err.message.includes('ECONNREFUSED')) return
      logger.error({ err }, 'Download Worker Error')
    })

    logger.info('Background Workers Registered')
  }
}
