import { db } from "@/lib/db"
import { videos, videoSchedules, uploadJobs, analytics, channels } from "@/lib/db/schema"
import { eq, and, desc, asc, count, sum, like } from "drizzle-orm"

export class VideoService {
  async getUserVideos(userId: string, status?: string, query?: string, limit = 50) {
    const conditions = [eq(videos.userId, userId)]
    if (status) {
      conditions.push(eq(videos.status, status))
    }
    if (query) {
      // Simple like search for title
      const { like } = require("drizzle-orm")
      conditions.push(like(videos.title, `%${query}%`))
    }

    const videoQuery = db.select().from(videos).where(and(...conditions))

    const userVideos = await videoQuery
      .limit(limit)
      .orderBy(desc(videos.createdAt))

    return userVideos
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

    const [analyticsData] = await db
      .select({
        totalViews: sum(analytics.views),
        totalLikes: sum(analytics.likes),
        totalComments: sum(analytics.comments),
      })
      .from(analytics)
      .where(eq(analytics.userId, userId))

    const [videoCount] = await db
      .select({ count: count() })
      .from(videos)
      .where(eq(videos.userId, userId))

    return {
      totalViews: analyticsData?.totalViews ? Number(analyticsData.totalViews) : 0,
      totalLikes: analyticsData?.totalLikes ? Number(analyticsData.totalLikes) : 0,
      totalComments: analyticsData?.totalComments ? Number(analyticsData.totalComments) : 0,
      totalVideos: videoCount?.count || 0,
    }
  }

  async getChannels(userId: string) {
    return await db
      .select()
      .from(channels)
      .where(eq(channels.userId, userId))
  }

  async getHealth() {
    try {
      await db.select({ count: count() }).from(videos).limit(1)
      const { redis } = require("@/lib/redis")
      return {
        status: "operational",
        services: {
          database: "connected",
          queue: redis ? "active" : "offline",
          storage: "available",
        },
        timestamp: Date.now()
      }
    } catch {
      return {
        status: "degraded",
        services: {
          database: "disconnected",
          queue: "unknown",
          storage: "unknown",
        },
        timestamp: Date.now()
      }
    }
  }
}
