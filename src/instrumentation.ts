export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Avoid starting workers during the build phase
    if (process.env.NEXT_PHASE === 'phase-production-build') return

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

    const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy(times) {
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

    // Download Worker (HARDENED)
    const downloadWorker = new Worker('download-queue', async (job) => {
      const { userId, sourceUrl, sourceType } = job.data
      logger.info(`Initiating recovery protocol for ${sourceUrl} (Node: ${job.id})`)

      const downloadId = job.id || Math.random().toString(36).substring(7)
      const downloadDir = path.join(process.cwd(), 'public', 'downloads')
      if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true })

      const outputFileName = `download_${Date.now()}.mp4`
      const outputPath = path.join(downloadDir, outputFileName)
      const ytDlpPath = "C:\\Users\\shubh\\AppData\\Local\\Python\\pythoncore-3.14-64\\Scripts\\yt-dlp.exe"

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
            
            // Sync with DB for dashboard persistence
            db.update(downloadJobs)
              .set({ progress, status: 'downloading', updatedAt: Date.now() })
              .where(eq(downloadJobs.sourceUrl, sourceUrl))
              .catch(() => {})
          }
        })

        child.on('close', async (code) => {
          if (code === 0) {
            logger.info(`Recovery sequence complete: ${outputFileName}`)
            
            // Final DB Update
            await db.update(downloadJobs)
              .set({ progress: 100, status: 'completed', updatedAt: Date.now() })
              .where(eq(downloadJobs.sourceUrl, sourceUrl))

            // Register in Videos table
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
            logger.error(`Recovery sequence failed with code ${code}`)
            await db.update(downloadJobs)
              .set({ status: 'failed', updatedAt: Date.now() })
              .where(eq(downloadJobs.sourceUrl, sourceUrl))
            reject(new Error(`yt-dlp failed with code ${code}`))
          }
        })
      })
    }, { connection })

    // Studio Worker (SIMULATED)
    const studioWorker = new Worker('studio-queue', async (job) => {
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

    // Transcode Worker (SIMULATED)
    const transcodeWorker = new Worker('transcode-queue', async (job) => {
      const { videoId } = job.data
      logger.info(`Initiating transcoding protocol for ${videoId}`)
      await job.updateProgress(100)
    }, { connection })

    logger.info('StudioBucket Operational Workers Online')
  }
}
