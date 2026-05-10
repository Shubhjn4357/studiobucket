import { db } from "@/lib/db"
import { videos, videoSchedules, uploadJobs, analytics, channels, notifications, userSettings } from "@/lib/db/schema"
import { eq, and, desc, asc, count, sum, like } from "drizzle-orm"
import { sql } from "drizzle-orm/sql"
import { redis } from "../redis"

export class VideoService {
  async getUserVideos(userId: string, status?: string, query?: string, limitValue = 50) {
    const conditions = [eq(videos.userId, userId)]
    
    // Get selected channel
    const [settings] = await db
      .select({ selectedChannelId: userSettings.selectedChannelId })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      
    if (settings?.selectedChannelId) {
      conditions.push(eq(videos.channelId, settings.selectedChannelId))
    }

    if (status) {
      conditions.push(eq(videos.status, status))
    }
    if (query) {
      conditions.push(like(videos.title, `%${query}%`))
    }

    return await db
      .select({
        id: videos.id,
        userId: videos.userId,
        channelId: videos.channelId,
        title: videos.title,
        description: videos.description,
        tags: videos.tags,
        categoryId: videos.categoryId,
        language: videos.language,
        privacy: videos.privacy,
        license: videos.license,
        location: videos.location,
        recordingDate: videos.recordingDate,
        filePath: videos.filePath,
        fileSize: videos.fileSize,
        duration: videos.duration,
        thumbnailPath: videos.thumbnailPath,
        status: videos.status,
        youtubeVideoId: videos.youtubeVideoId,
        publishAt: videos.publishAt,
        scheduledAt: videos.scheduledAt,
        uploadedAt: videos.uploadedAt,
        publishedAt: videos.publishedAt,
        retryCount: videos.retryCount,
        errorMessage: videos.errorMessage,
        metadata: videos.metadata,
        createdAt: videos.createdAt,
        updatedAt: videos.updatedAt,
        views: sql<number>`COALESCE(SUM(${analytics.views}), 0)`,
        likes: sql<number>`COALESCE(SUM(${analytics.likes}), 0)`,
      })
      .from(videos)
      .leftJoin(analytics, eq(videos.id, analytics.videoId))
      .where(and(...conditions))
      .groupBy(videos.id)
      .orderBy(desc(videos.createdAt))
      .limit(limitValue)
  }

  async getScheduledVideos(userId: string, limit = 50) {
    const scheduledVideos = await db
      .select({
        video: videos,
        schedule: videoSchedules,
      })
      .from(videos)
      .innerJoin(videoSchedules, eq(videos.id, videoSchedules.videoId))
      .where(and(eq(videos.userId, userId), eq(videoSchedules.isActive, true)))
      .limit(limit)
      .orderBy(asc(videoSchedules.scheduledAt))

    return scheduledVideos
  }

  async getQueueStatus(userId: string) {
    const [activeCount] = await db
      .select({ count: count() })
      .from(uploadJobs)
      .where(and(eq(uploadJobs.status, "active"), eq(uploadJobs.userId, userId)))

    const [completedCount] = await db
      .select({ count: count() })
      .from(uploadJobs)
      .where(
        and(eq(uploadJobs.status, "completed"), eq(uploadJobs.userId, userId))
      )

    const [failedCount] = await db
      .select({ count: count() })
      .from(uploadJobs)
      .where(and(eq(uploadJobs.status, "failed"), eq(uploadJobs.userId, userId)))

    const [waitingCount] = await db
      .select({ count: count() })
      .from(uploadJobs)
      .where(and(eq(uploadJobs.status, "waiting"), eq(uploadJobs.userId, userId)))

    return {
      active: activeCount?.count || 0,
      completed: completedCount?.count || 0,
      failed: failedCount?.count || 0,
      waiting: waitingCount?.count || 0,
    }
  }

  async getActiveJobs(userId: string, limit = 5) {
    return await db
      .select()
      .from(uploadJobs)
      .where(and(eq(uploadJobs.userId, userId), eq(uploadJobs.status, "active")))
      .limit(limit)
      .orderBy(desc(uploadJobs.updatedAt))
  }

  async getAnalyticsData(userId: string) {
    const userChannels = await db
      .select({ id: channels.id })
      .from(channels)
      .where(eq(channels.userId, userId))

    const channelIds = userChannels.map((ch) => ch.id)

    if (channelIds.length === 0) {
      return {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalVideos: 0,
      }
    }

    const [settings] = await db
      .select({ selectedChannelId: userSettings.selectedChannelId })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))

    const analyticsConditions = [eq(analytics.userId, userId)]
    const videoConditions = [eq(videos.userId, userId)]

    if (settings?.selectedChannelId) {
      analyticsConditions.push(eq(analytics.channelId, settings.selectedChannelId))
      videoConditions.push(eq(videos.channelId, settings.selectedChannelId))
    }

    const [analyticsData] = await db
      .select({
        totalViews: sum(analytics.views),
        totalLikes: sum(analytics.likes),
        totalComments: sum(analytics.comments),
      })
      .from(analytics)
      .where(and(...analyticsConditions))

    const [videoCount] = await db
      .select({ count: count() })
      .from(videos)
      .where(and(...videoConditions))

    return {
      totalViews: analyticsData?.totalViews ? Number(analyticsData.totalViews) : 0,
      totalLikes: analyticsData?.totalLikes ? Number(analyticsData.totalLikes) : 0,
      totalComments: analyticsData?.totalComments ? Number(analyticsData.totalComments) : 0,
      totalVideos: videoCount?.count || 0,
    }
  }

  async getChannels(userId: string) {
    const userChans = await db
      .select()
      .from(channels)
      .where(eq(channels.userId, userId))

    const [settings] = await db
      .select({ selectedChannelId: userSettings.selectedChannelId })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))

    return userChans.map(ch => ({
      ...ch,
      isSelected: ch.id === settings?.selectedChannelId
    }))
  }

  async getDailyStats(userId: string, days = 7) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return await db
      .select({
        date: analytics.date,
        views: sum(analytics.views),
        likes: sum(analytics.likes),
      })
      .from(analytics)
      .where(eq(analytics.userId, userId))
      .groupBy(analytics.date)
      .orderBy(asc(analytics.date))
      .limit(days)
  }

  async getNotifications(userId: string, limit = 10) {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .limit(limit)
      .orderBy(desc(notifications.createdAt))
  }

  async markNotificationRead(userId: string, notificationId: string) {
    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.id, notificationId)))
  }

  async markAllNotificationsRead(userId: string) {
    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))
  }

  async getHealth(): Promise<{
    status: "operational" | "degraded"
    services: {
      database: { status: string; latencyMs: number }
      queue: { status: string; latencyMs: number }
      storage: string
    }
    latencyMs: number
    timestamp: number
    error?: string
  }> {
    const start = Date.now()
    try {
      const dbStart = Date.now()
      await db.select({ count: count() }).from(videos).limit(1)
      const dbLatency = Date.now() - dbStart

      let redisLatency = -1
      if (redis) {
        try {
          const redisStart = Date.now()
          // Use a timeout for the ping to avoid hanging the health check
          const pingPromise = redis.ping()
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Redis Timeout")), 1000)
          )
          await Promise.race([pingPromise, timeoutPromise])
          redisLatency = Date.now() - redisStart
        } catch (e) {
          console.warn("Health Check: Redis ping failed", e)
        }
      }

      return {
        status: "operational",
        services: {
          database: {
            status: "connected",
            latencyMs: dbLatency
          },
          queue: {
            status: redis ? "active" : "offline",
            latencyMs: redisLatency
          },
          storage: "available",
        },
        latencyMs: Date.now() - start,
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        status: "degraded",
        services: {
          database: { status: "disconnected", latencyMs: -1 },
          queue: { status: "unknown", latencyMs: -1 },
          storage: "unknown",
        },
        error: error instanceof Error ? error.message : "Unknown error",
        latencyMs: Date.now() - start,
        timestamp: Date.now()
      }
    }
  }
}
