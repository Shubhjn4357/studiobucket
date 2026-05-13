export async function registerNode() {
  const { Worker } = await import('bullmq')
  const { logger } = await import('@/lib/logger')
  const { createYouTubeService } = await import('@/lib/youtube')
  const { db } = await import('@/lib/db')
  const { downloadJobs, uploadJobs, videos } = await import('@/lib/db/schema')
  const { eq } = await import('drizzle-orm')
  const IORedis = (await import('ioredis')).default
  const { spawn } = await import('child_process')
  const path = await import('path')
  const fs = await import('fs')
  const { getStoragePath } = await import('./storage-utils')

  const connection = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    family: 0, // Support both IPv4 and IPv6
    retryStrategy: (times) => Math.min(times * 50, 2000),
  })

  connection.on('error', (err) => {
    console.error('Instrumentation Redis Error:', err)
  })

  connection.on('connect', () => {
    console.log('Instrumentation Redis Connected')
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
    const { userId, sourceUrl } = job.data
    logger.info(`Starting download for ${sourceUrl}`)

    const downloadDir = getStoragePath('downloads')
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true })

    const outputFileName = `download_${Date.now()}.mp4`
    const outputPath = path.join(downloadDir, outputFileName)
    const ytDlpPath = process.env.YT_DLP_PATH || "yt-dlp"

    return new Promise((resolve, reject) => {
      const args = [
        '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '--output', outputPath,
        '--no-playlist',
        sourceUrl
      ]

      const child = spawn(ytDlpPath, args)

      child.stdout.on('data', (data) => {
        const line = data.toString()
        const progressMatch = line.match(/\[download\]\s+(\d+\.\d+)%/)
        if (progressMatch) {
          const progress = parseFloat(progressMatch[1])
          job.updateProgress(progress).catch(() => {})
          
          db.update(downloadJobs)
            .set({ progress, status: 'downloading', updatedAt: Date.now() })
            .where(eq(downloadJobs.sourceUrl, sourceUrl))
            .catch(() => {})
        }
      })

      child.on('close', async (code) => {
        if (code === 0) {
          logger.info(`Download complete: ${outputFileName}`)
          
          await db.update(downloadJobs)
            .set({ progress: 100, status: 'completed', updatedAt: Date.now() })
            .where(eq(downloadJobs.sourceUrl, sourceUrl))

          await db.insert(videos).values({
            userId,
            title: `Recovered_Asset_${Date.now()}`,
            filePath: `downloads/${outputFileName}`,
            status: 'draft',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })

          resolve(true)
        } else {
          logger.error(`Download failed with code ${code}`)
          await db.update(downloadJobs)
            .set({ status: 'failed', updatedAt: Date.now() })
            .where(eq(downloadJobs.sourceUrl, sourceUrl))
          reject(new Error(`yt-dlp failed with code ${code}`))
        }
      })
    })
  }, { connection })

  // Studio Worker
  new Worker('studio-queue', async (job) => {
    const { type, videoId, jobId: dbJobId } = job.data
    logger.info(`Processing studio job: ${type} for ${videoId}`)

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 1000))
      await job.updateProgress(i)
      
      await db.update(uploadJobs)
        .set({ progress: i, status: 'active', updatedAt: Date.now() })
        .where(eq(uploadJobs.id, dbJobId))
        .catch(() => {})
    }

    await db.update(uploadJobs)
      .set({ progress: 100, status: 'completed', updatedAt: Date.now() })
      .where(eq(uploadJobs.id, dbJobId))
  }, { connection })

  // Transcode Worker
  new Worker('transcode-queue', async (job) => {
    const { videoId } = job.data
    logger.info(`Initiating transcoding protocol for ${videoId}`)
    await job.updateProgress(100)
  }, { connection })

  logger.info('StudioBucket Operational Workers Online')
}
