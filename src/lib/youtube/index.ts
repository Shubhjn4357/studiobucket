import { google } from "googleapis"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import pino from "pino"
import fs from "fs"

const logger = pino({ level: "info" })

export class YouTubeService {
  private oauth2Client: InstanceType<typeof google.auth.OAuth2>
  private youtube: ReturnType<typeof google.youtube>

  constructor(accessToken?: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback/google`
    )

    if (accessToken && refreshToken) {
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    }

    this.youtube = google.youtube({
      version: "v3",
      auth: this.oauth2Client,
    })
  }

  async getUserChannels(userId: string) {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        accounts: true,
      },
    })

    if (!userRecord?.accounts[0]?.access_token) {
      throw new Error("No OAuth tokens found for user")
    }

    const accessToken = userRecord.accounts[0].access_token
    const refreshToken = userRecord.accounts[0].refresh_token

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    try {
      const response = await this.youtube.channels.list({
        part: ["snippet", "statistics", "contentDetails"],
        mine: true,
      })

      return response.data.items || []
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 401 && refreshToken) {
        try {
          const newTokens = await this.refreshTokens(refreshToken)
          this.oauth2Client.setCredentials({
            access_token: newTokens.accessToken,
            refresh_token: newTokens.refreshToken,
          })

          const response = await this.youtube.channels.list({
            part: ["snippet", "statistics", "contentDetails"],
            mine: true,
          })
          return response.data.items || []
        } catch (refreshError) {
          logger.error(refreshError, "Token refresh failed:")
          throw refreshError
        }
      }
      throw error
    }
  }

  async uploadVideo(data: {
    title: string
    description?: string
    tags?: string[]
    categoryId?: string
    privacy: "public" | "private" | "unlisted"
    filePath: string
    publishAt?: Date
    thumbnailPath?: string
  }) {
    try {
      if (!fs.existsSync(data.filePath)) {
        throw new Error(`File not found: ${data.filePath}`)
      }

      const fileStream = fs.createReadStream(data.filePath)

      const response = await this.youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: data.title,
            description: data.description || "",
            tags: data.tags || [],
            categoryId: data.categoryId || "22",
            defaultLanguage: "en",
            defaultAudioLanguage: "en",
          },
          status: {
            privacyStatus: data.privacy,
            publishAt: data.publishAt
              ? data.publishAt.toISOString()
              : undefined,
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: fileStream,
        },
      })

      const videoId = response.data.id

      if (data.thumbnailPath && fs.existsSync(data.thumbnailPath)) {
        try {
          if (videoId) {
            await this.youtube.thumbnails.set({
              videoId: videoId,
              media: {
                body: fs.createReadStream(data.thumbnailPath),
              },
            })
          }
        } catch (error) {
          logger.warn(error, "Failed to upload thumbnail:")
        }
      }

      logger.info(`Video uploaded successfully: ${videoId}`)
      return response.data
    } catch (error) {
      logger.error(error, "Upload video error:")
      throw error
    }
  }

  async updateVideo(
    videoId: string,
    data: {
      title?: string
      description?: string
      tags?: string[]
      categoryId?: string
      privacy?: "public" | "private" | "unlisted"
    }
  ) {
    try {
      const response = await this.youtube.videos.update({
        part: ["snippet", "status"],
        requestBody: {
          id: videoId,
          snippet: {
            title: data.title,
            description: data.description,
            tags: data.tags,
            categoryId: data.categoryId,
          },
          status: {
            privacyStatus: data.privacy,
          },
        },
      })

      return response.data
    } catch (error) {
      logger.error(error, "Update video error:")
      throw error
    }
  }

  async getVideo(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ["snippet", "statistics", "status", "contentDetails"],
        id: [videoId],
      })

      return response.data.items?.[0]
    } catch (error) {
      logger.error(error, "Get video error:")
      throw error
    }
  }

  async getChannelVideos(channelId: string, maxResults = 50) {
    try {
      const response = await this.youtube.search.list({
        part: ["snippet"],
        channelId: channelId,
        type: ["video"],
        order: "date",
        maxResults: maxResults,
      })

      return response.data.items || []
    } catch (error) {
      logger.error(error, "Get channel videos error:")
      throw error
    }
  }

  async deleteVideo(videoId: string) {
    try {
      await this.youtube.videos.delete({
        id: videoId,
      })

      logger.info(`Video deleted: ${videoId}`)
      return true
    } catch (error) {
      logger.error(error, "Delete video error:")
      throw error
    }
  }

  async scheduleVideo(videoId: string, publishAt: Date) {
    try {
      const response = await this.youtube.videos.update({
        part: ["status"],
        requestBody: {
          id: videoId,
          status: {
            privacyStatus: "private",
            publishAt: publishAt.toISOString(),
            selfDeclaredMadeForKids: false,
          },
        },
      })

      logger.info(`Video scheduled: ${videoId} for ${publishAt}`)
      return response.data
    } catch (error) {
      logger.error(error, "Schedule video error:")
      throw error
    }
  }

  async getVideoStats(videoId: string) {
    try {
      const video = await this.getVideo(videoId)
      if (!video) {
        return null
      }

      return {
        id: video.id,
        title: video.snippet?.title,
        viewCount: parseInt(video.statistics?.viewCount || "0"),
        likeCount: parseInt(video.statistics?.likeCount || "0"),
        commentCount: parseInt(video.statistics?.commentCount || "0"),
        favoriteCount: parseInt(video.statistics?.favoriteCount || "0"),
        status: video.status?.privacyStatus,
        uploadStatus: video.status?.uploadStatus,
        publishedAt: video.snippet?.publishedAt,
      }
    } catch (error) {
      logger.error(error, "Get video stats error:")
      throw error
    }
  }

  private async refreshTokens(refreshToken: string) {
    try {
      const response = await this.oauth2Client.refreshAccessToken()
      const credentials = response.credentials
      return {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token || refreshToken,
        expiresAt: credentials.expiry_date,
      }
    } catch (error) {
      logger.error(error, "Token refresh failed:")
      throw new Error("Failed to refresh tokens")
    }
  }

  async getCategories(region = "US") {
    try {
      const response = await this.youtube.videoCategories.list({
        part: ["snippet"],
        regionCode: region,
      })

      return response.data.items || []
    } catch (error) {
      logger.error(error, "Get categories error:")
      throw error
    }
  }

  async getChannelById(channelId: string) {
    try {
      const response = await this.youtube.channels.list({
        part: ["snippet", "statistics", "contentDetails"],
        id: [channelId],
      })

      return response.data.items?.[0]
    } catch (error) {
      logger.error(error, "Get channel error:")
      throw error
    }
  }

  async searchVideos(query: string, maxResults = 25) {
    try {
      const response = await this.youtube.search.list({
        part: ["snippet"],
        q: query,
        type: ["video"],
        maxResults: maxResults,
        order: "relevance",
      })

      return response.data.items || []
    } catch (error) {
      logger.error(error, "Search videos error:")
      throw error
    }
  }
}

export async function createYouTubeService(userId: string) {
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      accounts: true,
    },
  })

  if (!userRecord?.accounts[0]?.access_token) {
    throw new Error("No OAuth tokens found for user")
  }

  return new YouTubeService(
    userRecord.accounts[0].access_token,
    userRecord.accounts[0].refresh_token || undefined
  )
}
