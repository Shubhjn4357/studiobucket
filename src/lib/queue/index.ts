import { Queue } from "bullmq"
import { logger } from "@/lib/logger"
import { redis as redisConnection } from "@/lib/redis"
import { z } from "zod"

export const UploadJobSchema = z.object({
  videoId: z.string(),
  userId: z.string(),
  channelId: z.string(),
  filePath: z.string(),
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  privacy: z.enum(["public", "private", "unlisted"]),
  publishAt: z.number().optional(),
})

export const DownloadJobSchema = z.object({
  userId: z.string(),
  sourceUrl: z.string(),
  sourceType: z.enum(["video", "playlist", "channel"]),
  outputPath: z.string().optional(),
})

export type UploadJob = z.infer<typeof UploadJobSchema>
export type DownloadJob = z.infer<typeof DownloadJobSchema>

export const uploadQueue = redisConnection ? new Queue("upload-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
  }
}) : null

export const downloadQueue = redisConnection ? new Queue("download-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
  }
}) : null

export const studioQueue = redisConnection ? new Queue("studio-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
  }
}) : null

export async function addUploadJob(data: Record<string, unknown>) {
  if (!uploadQueue) {
    logger.warn("Upload queue not available (Redis missing). Skipping background job.")
    return null
  }
  try {
    const job = await uploadQueue.add("upload-video", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    })
    logger.info(`Upload job added: ${job.id}`)
    return job
  } catch (error) {
    logger.error({ error }, "Failed to add upload job:")
    throw error
  }
}

export async function addDownloadJob(data: Record<string, unknown>) {
  if (!downloadQueue) {
    logger.warn("Download queue not available (Redis missing). Skipping background job.")
    return null
  }
  try {
    const job = await downloadQueue.add("download-video", data, {
      attempts: 2,
    })
    logger.info(`Download job added: ${job.id}`)
    return job
  } catch (error) {
    logger.error({ error }, "Failed to add download job:")
    throw error
  }
}

export async function addStudioJob(data: Record<string, unknown>) {
  if (!studioQueue) {
    logger.warn("Studio queue not available (Redis missing). Skipping background job.")
    return null
  }
  try {
    const job = await studioQueue.add("process-video", data)
    logger.info(`Studio job added: ${job.id}`)
    return job
  } catch (error) {
    logger.error({ error }, "Failed to add studio job:")
    throw error
  }
}

export function getQueueByName(name: string) {
  if (name === "upload-queue") return uploadQueue
  if (name === "download-queue") return downloadQueue
  if (name === "studio-queue") return studioQueue
  throw new Error(`Unknown queue: ${name}`)
}

export async function getQueueStatus(queueName: string) {
  const queue = getQueueByName(queueName)
  if (!queue) return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ])
  return { waiting, active, completed, failed, delayed }
}

export async function getJobStatus(queueName: string, jobId: string) {
  const queue = getQueueByName(queueName)
  if (!queue) return null
  
  const job = await queue.getJob(jobId)
  if (!job) return null
  return {
    id: job.id,
    name: job.name,
    data: job.data,
    status: await job.getState(),
    progress: job.progress,
    result: job.returnvalue,
    error: job.failedReason,
  }
}

export async function pauseQueue(queueName: string) {
  const queue = getQueueByName(queueName)
  if (queue) await queue.pause()
}

export async function resumeQueue(queueName: string) {
  const queue = getQueueByName(queueName)
  if (queue) await queue.resume()
}

export async function clearQueue(queueName: string) {
  const queue = getQueueByName(queueName)
  if (queue) {
    await queue.clean(0, 1000, "completed")
    await queue.clean(0, 1000, "failed")
  }
}
