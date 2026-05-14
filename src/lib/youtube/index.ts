import { google } from "googleapis"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import pino from "pino"
import fs from "fs"

const logger = pino({ level: "info" })

export class YouTubeService {
  private oauth2Client: InstanceType<typeof google.auth.OAuth2>
  private youtube: ReturnType<typeof google.youtube>

  constructor(accessToken?: string, refreshToken?: string, private userId?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback/google`
    )

    if (accessToken) {
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

  private async ensureAuth() {
    if (!this.oauth2Client.credentials.access_token) {
      if (!this.userId) throw new Error("No authentication provided")
      
      const userRecord = await db.query.users.findFirst({
        where: eq(users.id, this.userId),
        with: { accounts: true },
      })

      const account = userRecord?.accounts.find(a => a.provider === "google")
      if (!account?.access_token) throw new Error("No Google account linked")

      this.oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
      })
    }
  }

  async getUserChannels() {
    await this.ensureAuth()

    try {
      const response = await this.youtube.channels.list({
        part: ["snippet", "statistics", "contentDetails"],
        mine: true,
      })

      return response.data.items || []
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 401 && this.oauth2Client.credentials.refresh_token) {
        const newTokens = await this.refreshTokens(this.oauth2Client.credentials.refresh_token, this.userId)
        this.oauth2Client.setCredentials({
          access_token: newTokens.accessToken!,
          refresh_token: newTokens.refreshToken!,
        })
        const response = await this.youtube.channels.list({
          part: ["snippet", "statistics", "contentDetails"],
          mine: true,
        })
        return response.data.items || []
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
    location?: {
      latitude: number
      longitude: number
    }
  }) {
    await this.ensureAuth()
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
        // Location support
        ...(data.location && {
          recordingDetails: {
            location: {
              latitude: data.location.latitude,
              longitude: data.location.longitude,
            }
          }
        })
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

  async addVideoToPlaylist(videoId: string, playlistId: string) {
    await this.ensureAuth()
    try {
      const response = await this.youtube.playlistItems.insert({
        part: ["snippet"],
        requestBody: {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId: videoId,
            },
          },
        },
      })
      return response.data
    } catch (error) {
      logger.error(error, "Add video to playlist error:")
      throw error
    }
  }

  async getPlaylists(channelId?: string) {
    await this.ensureAuth()
    try {
      const response = await this.youtube.playlists.list({
        part: ["snippet", "contentDetails", "status"],
        mine: !channelId,
        channelId: channelId,
        maxResults: 50,
      })
      return response.data.items || []
    } catch (error) {
      logger.error(error, "Get playlists error:")
      throw error
    }
  }

  async listComments(videoId: string) {
    await this.ensureAuth()
    try {
      const response = await this.youtube.commentThreads.list({
        part: ["snippet", "replies"],
        videoId: videoId,
        maxResults: 100,
        order: "time",
      })
      return response.data.items || []
    } catch (error) {
      logger.error(error, "List comments error:")
      throw error
    }
  }

  async insertComment(videoId: string, text: string) {
    await this.ensureAuth()
    try {
      const response = await this.youtube.commentThreads.insert({
        part: ["snippet"],
        requestBody: {
          snippet: {
            videoId: videoId,
            topLevelComment: {
              snippet: {
                textOriginal: text,
              },
            },
          },
        },
      })
      return response.data
    } catch (error) {
      logger.error(error, "Insert comment error:")
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
    await this.ensureAuth()
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
    await this.ensureAuth()
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
    await this.ensureAuth()
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
    await this.ensureAuth()
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
    await this.ensureAuth()
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

  private async refreshTokens(refreshToken: string, userId?: string) {
    try {
      const response = await this.oauth2Client.refreshAccessToken()
      const credentials = response.credentials
      
      const newTokens = {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token || refreshToken,
        expiresAt: credentials.expiry_date,
      }

      // Persist to DB if userId is provided
      if (userId && newTokens.accessToken) {
        const { accounts, channels } = await import("@/lib/db/schema")
        
        // Update main account
        await db.update(accounts)
          .set({
            access_token: newTokens.accessToken,
            refresh_token: newTokens.refreshToken,
            expires_at: newTokens.expiresAt ? Math.floor(newTokens.expiresAt / 1000) : null,
          })
          .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")))

        // Update all channels linked to this user (they likely share the same account)
        await db.update(channels)
          .set({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            expiresAt: newTokens.expiresAt,
            updatedAt: Date.now()
          })
          .where(eq(channels.userId, userId))
          
        logger.info(`Tokens refreshed and persisted for user: ${userId}`)
      }

      return newTokens
    } catch (error) {
      logger.error(error, "Token refresh and persistence failed:")
      throw new Error("Failed to refresh and synchronize tokens")
    }
  }

  async getCategories(region = "US") {
    await this.ensureAuth()
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
    await this.ensureAuth()
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
    await this.ensureAuth()
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
    userRecord.accounts[0].access_token || undefined,
    userRecord.accounts[0].refresh_token || undefined,
    userId
  )
}
