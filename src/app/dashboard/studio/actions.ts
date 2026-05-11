"use server"

import { db } from "@/lib/db"
import { videos, uploadJobs } from "@/lib/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { addStudioJob, getJobStatus, addExportJob } from "@/lib/queue"
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
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

export async function updateVideoMetadata(videoId: string, data: {
  title: string
  description?: string | null
  privacy?: "public" | "private" | "unlisted"
  [key: string]: unknown
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const { title, description, privacy, ...metadata } = data

  await db.update(videos)
    .set({
      title: title,
      description: description,
      privacyStatus: privacy,
      metadata: JSON.stringify(metadata),
      updatedAt: Date.now(),
    })
    .where(eq(videos.id, videoId))

  revalidatePath("/dashboard/studio")
  revalidatePath("/dashboard/content")
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
export async function triggerAutoCut(videoId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const [video] = await db.select().from(videos).where(eq(videos.id, videoId))
  if (!video) throw new Error("Video not found")

  const jobId = crypto.randomUUID()

  await db.insert(uploadJobs).values({
    id: jobId,
    userId: session.user.id,
    videoId: videoId,
    queueName: "studio-queue",
    status: "waiting",
    data: JSON.stringify({ type: "auto-cut", title: `Auto-cut: ${video.title}` }),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  await addStudioJob({
    type: "auto-cut",
    videoId,
    jobId,
    userId: session.user.id,
    inputPath: video.filePath,
  })

  revalidatePath("/dashboard")
  return { jobId }
}

export async function triggerTranscription(videoId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const [video] = await db.select().from(videos).where(eq(videos.id, videoId))
  if (!video) throw new Error("Video not found")

  const jobId = crypto.randomUUID()

  await db.insert(uploadJobs).values({
    id: jobId,
    userId: session.user.id,
    videoId: videoId,
    queueName: "studio-queue",
    status: "waiting",
    data: JSON.stringify({ type: "transcribe", title: `Transcription: ${video.title}` }),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  await addStudioJob({
    type: "transcribe",
    videoId,
    jobId,
    userId: session.user.id,
    inputPath: video.filePath,
  })

  revalidatePath("/dashboard")
  return { jobId }
}

export async function triggerThumbnailGen(videoId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const [video] = await db.select().from(videos).where(eq(videos.id, videoId))
  if (!video) throw new Error("Video not found")

  const jobId = crypto.randomUUID()

  await db.insert(uploadJobs).values({
    id: jobId,
    userId: session.user.id,
    videoId: videoId,
    queueName: "studio-queue",
    status: "waiting",
    data: JSON.stringify({ type: "generate-thumbnails", title: `Thumbnails: ${video.title}` }),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  await addStudioJob({
    type: "generate-thumbnails",
    videoId,
    jobId,
    userId: session.user.id,
    inputPath: video.filePath,
  })

  revalidatePath("/dashboard")
  return { jobId }
}

export async function getJobStatusAction(queueName: string, jobId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  return await getJobStatus(queueName, jobId)
}
export async function triggerExportAction(videoId: string, project: VideoProject) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  return await addExportJob({ videoId, project })
}
