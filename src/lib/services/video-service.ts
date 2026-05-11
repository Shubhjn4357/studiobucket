import { db } from "@/lib/db"
import { videos, videoSchedules, uploadJobs, analytics, channels, notifications, userSettings } from "@/lib/db/schema"
import { eq, and, desc, asc, count, sum, like, sql } from "drizzle-orm"
import { redis } from "../redis"
import path from "path"
import fs from "fs"

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
        defaultLanguage: videos.defaultLanguage,
        privacyStatus: videos.privacyStatus,
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
        publishedAt: videos.publishedAt,
        retryCount: videos.retryCount,
        errorMessage: videos.errorMessage,
        metadata: videos.metadata,
        createdAt: videos.createdAt,
        updatedAt: videos.updatedAt,
        views: sql<number>`COALESCE(SUM(${analytics.views}), 0)`.as("views"),
        likes: sql<number>`COALESCE(SUM(${analytics.likes}), 0)`.as("likes"),
      })
      .from(videos)
      .leftJoin(analytics, eq(videos.id, analytics.videoId))
      .where(and(...conditions))
      .groupBy(videos.id)
      .orderBy(desc(videos.createdAt))
      .limit(limitValue)
  }

  async deleteVideo(userId: string, videoId: string) {
    const [video] = await db
      .select({ filePath: videos.filePath, thumbnailPath: videos.thumbnailPath })
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)))

    if (!video) throw new Error("Video not found or unauthorized")

    // Physically remove files if they exist
    if (video.filePath) {
      const fullPath = path.join(process.cwd(), "public", video.filePath)
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    }
    if (video.thumbnailPath) {
      const fullPath = path.join(process.cwd(), "public", video.thumbnailPath)
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    }

    return await db.delete(videos).where(and(eq(videos.id, videoId), eq(videos.userId, userId)))
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

  async getGlobalTrends(userId: string) {
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const prev7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const [current] = await db
      .select({
        views: sum(analytics.views),
        likes: sum(analytics.likes)
      })
      .from(analytics)
      .where(and(eq(analytics.userId, userId), sql`${analytics.date} >= ${last7Days.toISOString()}`))

    const [previous] = await db
      .select({
        views: sum(analytics.views),
        likes: sum(analytics.likes)
      })
      .from(analytics)
      .where(and(
        eq(analytics.userId, userId), 
        sql`${analytics.date} >= ${prev7Days.toISOString()}`,
        sql`${analytics.date} < ${last7Days.toISOString()}`
      ))

    const calculateChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return Math.round(((curr - prev) / prev) * 100)
    }

    return {
      viewsChange: calculateChange(Number(current?.views || 0), Number(previous?.views || 0)),
      likesChange: calculateChange(Number(current?.likes || 0), Number(previous?.likes || 0)),
    }
  }

  async getChannelInsights(userId: string) {
    const stats = await this.getAnalyticsData(userId)
    const insights = []

    if (stats.totalViews > 1000) {
      insights.push({
        title: "High Performance",
        description: "Your content is gaining significant traction. Consider increasing upload frequency.",
        type: "growth"
      })
    } else {
      insights.push({
        title: "Growth Opportunity",
        description: "Consistency is key. Schedule 2 more videos this week to boost visibility.",
        type: "growth"
      })
    }

    if (stats.totalLikes / (stats.totalViews || 1) > 0.1) {
      insights.push({
        title: "Strong Engagement",
        description: "Users love your style! Your like-to-view ratio is exceptional.",
        type: "engagement"
      })
    } else {
      insights.push({
        title: "Engagement Tip",
        description: "Try adding a Call to Action (CTA) in the first 30 seconds of your videos.",
        type: "engagement"
      })
    }

    return insights
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
