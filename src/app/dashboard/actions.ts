"use server"

import { VideoService } from "@/lib/services/video-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []
    return await videoService.getDailyStats(session.user.id, days)
}
