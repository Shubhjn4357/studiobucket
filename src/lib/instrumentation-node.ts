export async function registerNode() {
  const { Worker } = await import('bullmq')
  const { logger } = await import('@/lib/logger')
  const { createYouTubeService } = await import('@/lib/youtube')
  const { db } = await import('@/lib/db')
  const { downloadJobs, uploadJobs, videos } = await import('@/lib/db/schema')
  const { eq, sql } = await import('drizzle-orm')
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

    const ffmpegPath = (await import('ffmpeg-static')).default

    return new Promise((resolve, reject) => {
      const args = [
        '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '--output', outputPath,
        '--no-playlist',
        ...(ffmpegPath ? ['--ffmpeg-location', ffmpegPath] : []),
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
          logger.error(`Download failed: ${code}`)
          await db.update(downloadJobs)
            .set({ status: 'failed', updatedAt: Date.now() })
            .where(eq(downloadJobs.sourceUrl, sourceUrl))
          reject(new Error(`Download failed with code ${code}`))
        }
      })
    })
  }, { connection })

  // Studio Worker
  new Worker('studio-queue', async (job) => {
    const ffmpeg = (await import('fluent-ffmpeg')).default
    const ffmpegStatic = (await import('ffmpeg-static')).default
    if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic)

    const { videoId, filePath, tracks, jobId: dbJobId } = job.data
    logger.info(`Processing video edits for ${videoId}`)

    if (dbJobId) {
      await db.update(uploadJobs).set({ status: 'active', updatedAt: Date.now() }).where(eq(uploadJobs.id, dbJobId)).catch(() => {})
    }

    const fullPath = getStoragePath("uploads", filePath)
    const outputFileName = `final_${Date.now()}_${path.basename(filePath)}`
    const outputDir = getStoragePath("uploads", "final")
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
    const outputPath = path.join(outputDir, outputFileName)
    const relativeFinalPath = `uploads/final/${outputFileName}`

    // Extract video clips from tracks
    const videoTrack = tracks?.find((t: { type: string; clips: { start: number; end: number }[] }) => t.type === 'video')
    const clips = videoTrack?.clips || []

    if (clips.length === 0) {
      logger.warn(`No clips found for ${videoId}. Skipping render.`)
      if (dbJobId) await db.update(uploadJobs).set({ status: 'completed' }).where(eq(uploadJobs.id, dbJobId)).catch(() => {})
      return
    }

    return new Promise((resolve, reject) => {
      const cmd = ffmpeg(fullPath)
      
      const filterGraph: string[] = []
      const concatInputs: string[] = []

      clips.forEach((clip: { start: number; end: number }, index: number) => {
        filterGraph.push(`[0:v]trim=start=${clip.start}:end=${clip.end},setpts=PTS-STARTPTS[v${index}]`)
        filterGraph.push(`[0:a]atrim=start=${clip.start}:end=${clip.end},asetpts=PTS-STARTPTS[a${index}]`)
        concatInputs.push(`[v${index}][a${index}]`)
      })

      filterGraph.push(`${concatInputs.join('')}concat=n=${clips.length}:v=1:a=1[outv][outa]`)

      cmd.complexFilter(filterGraph, ['outv', 'outa'])
         .outputOptions(['-map [outv]', '-map [outa]'])
         .output(outputPath)
         .on('progress', (progress) => {
            if (progress.percent) {
               job.updateProgress(Math.round(progress.percent)).catch(() => {})
               if (dbJobId) db.update(uploadJobs).set({ progress: Math.round(progress.percent) }).where(eq(uploadJobs.id, dbJobId)).catch(() => {})
            }
         })
         .on('end', async () => {
            logger.info(`Video ${videoId} processed and saved to ${outputPath}`)
            await db.update(videos)
              .set({ status: 'published', filePath: relativeFinalPath, updatedAt: Date.now() })
              .where(eq(videos.id, videoId))
            if (dbJobId) await db.update(uploadJobs).set({ progress: 100, status: 'completed', updatedAt: Date.now() }).where(eq(uploadJobs.id, dbJobId)).catch(() => {})
            resolve(true)
         })
         .on('error', (err) => {
            logger.error(err, `Studio rendering failed for ${videoId}`)
            db.update(videos).set({ status: 'failed', errorMessage: err.message }).where(eq(videos.id, videoId)).catch(()=>{})
            if (dbJobId) db.update(uploadJobs).set({ status: 'failed', error: err.message, updatedAt: Date.now() }).where(eq(uploadJobs.id, dbJobId)).catch(() => {})
            reject(err)
         })
         .run()
    })
  }, { connection })

  // Transcode Worker
  new Worker('transcode-queue', async (job) => {
    const ffmpeg = (await import('fluent-ffmpeg')).default
    const ffmpegStatic = (await import('ffmpeg-static')).default
    if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic)

    const { videoId, filePath } = job.data
    logger.info(`Preparing video for editing: ${videoId}`)
    
    const fullPath = getStoragePath("uploads", filePath)
    const outputDir = path.join(path.dirname(fullPath), 'hls')
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
    
    const outputPlaylist = path.join(outputDir, 'index.m3u8')
    const relativeHlsPath = path.join(path.dirname(filePath), 'hls', 'index.m3u8').replace(/\\/g, '/')

    return new Promise((resolve, reject) => {
      ffmpeg(fullPath)
        .outputOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls'
        ])
        .output(outputPlaylist)
        .on('progress', (progress) => {
          if (progress.percent) {
            job.updateProgress(Math.round(progress.percent)).catch(() => {})
          }
        })
        .on('end', async () => {
          logger.info(`Transcoding complete for ${videoId}`)
          await db.update(videos)
            .set({ 
              status: 'ready',
              metadata: sql`${videos.metadata} || ${JSON.stringify({ hlsPath: relativeHlsPath })}`,
              updatedAt: Date.now() 
            })
            .where(eq(videos.id, videoId))
          resolve(true)
        })
        .on('error', (err) => {
          logger.error(err, `Transcoding failed for ${videoId}:`)
          db.update(videos)
            .set({ status: 'failed', errorMessage: err.message, updatedAt: Date.now() })
            .where(eq(videos.id, videoId))
            .catch(() => {})
          reject(err)
        })
        .run()
    })
  }, { connection })

  logger.info('StudioBucket Operational Workers Online')
}
