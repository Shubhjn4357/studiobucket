import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { QueueClient } from "./queue-client"
import { UploadJob } from "@/schemas"

export default async function QueuePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const videoService = new VideoService()
  const activeJobs = await videoService.getActiveJobs(session.user.id) as unknown as UploadJob[]
  const stats = await videoService.getQueueStatus(session.user.id)

  return (
    <QueueClient 
      initialJobs={activeJobs} 
      initialStats={stats} 
    />
  )
}
