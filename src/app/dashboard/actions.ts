"use server"

import { VideoService } from "@/lib/services/video-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { pauseQueue, resumeQueue, clearQueue } from "@/lib/queue"
import { db } from "@/lib/db"
import { userSettings } from "@/lib/db/schema"
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

export async function purgeQueueAction() {
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
