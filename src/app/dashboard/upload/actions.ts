"use server"

import { db } from "@/lib/db"
import { videos, uploadJobs } from "@/lib/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { addUploadJob } from "@/lib/queue"
export async function createUploadJob(data: {
  title: string
  fileSize: number
  filePath?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const videoId = crypto.randomUUID()
  const jobId = crypto.randomUUID()

  await db.insert(videos).values({
    id: videoId,
    userId: session.user.id,
    title: data.title,
    fileSize: data.fileSize,
    filePath: data.filePath || `/uploads/${videoId}.mp4`,
    status: "pending",
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  })

  await db.insert(uploadJobs).values({
    id: jobId,
    userId: session.user.id,
    videoId: videoId,
    queueName: "upload-queue",
    status: "waiting",
    progress: 0,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  })

  // Optional background job
  await addUploadJob({
    videoId,
    jobId,
    userId: session.user.id,
    title: data.title,
    filePath: data.filePath || `/uploads/${videoId}.mp4`,
  }).catch(err => console.error("Queue error:", err))

  revalidatePath("/dashboard")
  return { videoId, jobId }
}
