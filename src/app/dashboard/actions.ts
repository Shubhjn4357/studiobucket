"use server"

import { VideoService } from "@/lib/services/video-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { pauseQueue, resumeQueue, clearQueue } from "@/lib/queue"
import { db } from "@/lib/db"
import { userSettings, channels as channelsTable, videos } from "@/lib/db/schema"
import { createYouTubeService } from "@/lib/youtube"
import { eq } from "drizzle-orm"

const videoService = new VideoService()

export async function getNotificationsAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []
  return await videoService.getNotifications(session.user.id)
}

export async function markAsReadAction(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return
  await videoService.markNotificationRead(session.user.id, id)
  revalidatePath("/")
}

export async function markAllAsReadAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return
  await videoService.markAllNotificationsRead(session.user.id)
  revalidatePath("/")
}

export async function getDailyStatsAction(days = 7) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []
    return await videoService.getDailyStats(session.user.id, days)
  } catch {
    return []
  }
}

export async function pauseQueueAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  await pauseQueue("upload-queue")
  await pauseQueue("download-queue")
  await pauseQueue("studio-queue")
  
  revalidatePath("/dashboard/queue")
  return { success: true }
}

export async function resumeQueueAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  await resumeQueue("upload-queue")
  await resumeQueue("download-queue")
  await resumeQueue("studio-queue")
  
  revalidatePath("/dashboard/queue")
  return { success: true }
}

export async function removeQueueAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  await clearQueue("upload-queue")
  await clearQueue("download-queue")
  await clearQueue("studio-queue")
  
  revalidatePath("/dashboard/queue")
  return { success: true }
}

export async function switchChannelAction(channelId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  await db.update(userSettings)
    .set({ selectedChannelId: channelId, updatedAt: Date.now() })
    .where(eq(userSettings.userId, session.user.id))
    
  revalidatePath("/dashboard/channels")
  return { success: true }
}

export async function syncAllChannelsAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const videoService = new VideoService()
  const userChannels = await videoService.getChannels(session.user.id)
  
  const { YouTubeService } = await import("@/lib/youtube")
  
  for (const channel of userChannels) {
    const ytService = new YouTubeService(channel.accessToken || undefined, channel.refreshToken || undefined)
    try {
      const channelData = await ytService.getChannelById(channel.id)
      if (channelData) {
        await db.update(channelsTable)
          .set({
            channelName: channelData.snippet?.title,
            thumbnailUrl: channelData.snippet?.thumbnails?.default?.url,
            subscriberCount: Number(channelData.statistics?.subscriberCount || 0),
            viewCount: Number(channelData.statistics?.viewCount || 0),
            videoCount: Number(channelData.statistics?.videoCount || 0),
            updatedAt: Date.now()
          })
          .where(eq(channelsTable.id, channel.id))
      }
    } catch (err) {
      console.error(`Failed to sync channel ${channel.id}:`, err)
    }
  }
  
  revalidatePath("/dashboard/channels")
  return { success: true }
}

export async function syncChannelAction(channelId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const { YouTubeService } = await import("@/lib/youtube")
  const channel = await db.query.channels.findFirst({
    where: eq(channelsTable.id, channelId)
  })
  
  if (!channel) throw new Error("Channel not found")
  
  const ytService = new YouTubeService(channel.accessToken || undefined, channel.refreshToken || undefined)
  const channelData = await ytService.getChannelById(channelId)
  
  if (channelData) {
    await db.update(channelsTable)
      .set({
        channelName: channelData.snippet?.title,
        thumbnailUrl: channelData.snippet?.thumbnails?.default?.url,
        subscriberCount: Number(channelData.statistics?.subscriberCount || 0),
        viewCount: Number(channelData.statistics?.viewCount || 0),
        videoCount: Number(channelData.statistics?.videoCount || 0),
        updatedAt: Date.now()
      })
      .where(eq(channelsTable.id, channelId))
  }
  
  revalidatePath("/dashboard/channels")
  return { success: true }
}

export async function triggerTranscriptionAction(videoId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const video = await db.query.videos.findFirst({
    where: eq(videos.id, videoId)
  })

  if (!video?.filePath) throw new Error("Asset not found")

  // Simulate or Call OpenAI Whisper
  if (process.env.OPENAI_API_KEY) {
     // Implementation would go here calling Whisper API
     // For the demo, we'll simulate a successful transcription return
     await new Promise(resolve => setTimeout(resolve, 2000))
     return { text: "Simulated transcription for " + video.title }
  } else {
     await new Promise(resolve => setTimeout(resolve, 1000))
     return { text: "Please set OPENAI_API_KEY to enable Whisper transcription." }
  }
}

export async function triggerAutoCutAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  // Simulation: In a real app, this would queue a job to detect silences and cut the video.
  await new Promise(resolve => setTimeout(resolve, 2000))
  return { success: true, cuts: [10, 45, 120] }
}

export async function deleteVideoAction(videoId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  await videoService.deleteVideo(session.user.id, videoId)
  
  revalidatePath("/dashboard/content")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function disconnectChannelAction(channelId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  await db.delete(channelsTable).where(eq(channelsTable.id, channelId))
  
  revalidatePath("/dashboard/channels")
  return { success: true }
}

export async function deleteScheduleAction(scheduleId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const { videoSchedules } = await import("@/lib/db/schema")
  await db.delete(videoSchedules).where(eq(videoSchedules.id, scheduleId))
  
  revalidatePath("/dashboard/schedule")
  return { success: true }
}

export async function updateUserSettingsAction(data: {
  notifications?: string
  apiSettings?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  await db.update(userSettings)
    .set({ 
      ...(data.notifications && { notifications: data.notifications }),
      ...(data.apiSettings && { apiSettings: data.apiSettings }),
      updatedAt: Date.now() 
    })
    .where(eq(userSettings.userId, session.user.id))
    
  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function getVideosAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  return await videoService.getUserVideos(session.user.id)
}

export async function scheduleVideoAction(data: {
  videoId: string
  scheduledAt: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const { videoSchedules, videos } = await import("@/lib/db/schema")
  
  await db.insert(videoSchedules).values({
    videoId: data.videoId,
    scheduledAt: data.scheduledAt,
    createdAt: Date.now(),
    updatedAt: Date.now()
  })

  // Update video status to scheduled
  await db.update(videos)
    .set({ status: "scheduled", publishAt: data.scheduledAt })
    .where(eq(videos.id, data.videoId))

  revalidatePath("/dashboard/schedule")
  revalidatePath("/dashboard/content")
  return { success: true }
}

export async function getPlaylistsAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const ytService = await createYouTubeService(session.user.id)
  return await ytService.getPlaylists()
}

export async function getCommentsAction(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  // Resolve DB ID to YouTube ID
  const video = await db.query.videos.findFirst({
    where: eq(videos.id, id)
  })

  const youtubeVideoId = video?.youtubeVideoId || id

  const ytService = await createYouTubeService(session.user.id)
  return await ytService.listComments(youtubeVideoId)
}

export async function postCommentAction(id: string, text: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  // Resolve DB ID to YouTube ID
  const video = await db.query.videos.findFirst({
    where: eq(videos.id, id)
  })

  const youtubeVideoId = video?.youtubeVideoId || id

  const ytService = await createYouTubeService(session.user.id)
  await ytService.insertComment(youtubeVideoId, text)
  return { success: true }
}
export async function getYouTubeVideosAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id)
  })

  if (!settings?.selectedChannelId) throw new Error("No channel selected")

  const ytService = await createYouTubeService(session.user.id)
  return await ytService.getChannelVideos(settings.selectedChannelId)
}

export async function getChannelsAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []
  return await videoService.getChannels(session.user.id)
}

export async function deleteYouTubeVideoAction(videoId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const ytService = await createYouTubeService(session.user.id)
  await ytService.deleteVideo(videoId)
  
  revalidatePath("/dashboard/content")
  return { success: true }
}
