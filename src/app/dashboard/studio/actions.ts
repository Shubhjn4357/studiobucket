"use server"

import { db } from "@/lib/db"
import { videos, uploadJobs } from "@/lib/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { addStudioJob } from "@/lib/queue"
import { VideoProject } from "@/types/video"

export async function createRenderJob(videoId: string, projectData: VideoProject) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const jobId = crypto.randomUUID()

  await db.insert(uploadJobs).values({
    id: jobId,
    userId: session.user.id,
    videoId: videoId,
    queueName: "render-queue",
    status: "waiting",
    data: JSON.stringify(projectData),
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  })

  // Optional background job
  await addStudioJob({
    videoId,
    jobId,
    userId: session.user.id,
    projectData,
  }).catch(err => console.error("Queue error:", err))

  revalidatePath("/dashboard/queue")
  return { jobId }
}

export async function updateVideoMetadata(videoId: string, metadata: VideoProject) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.update(videos)
    .set({
      metadata: JSON.stringify(metadata),
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(videos.id, videoId))

  revalidatePath("/dashboard/studio")
  return { success: true }
}

export async function getVideoProject(videoId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const [video] = await db.select()
    .from(videos)
    .where(eq(videos.id, videoId))

  return video
}
