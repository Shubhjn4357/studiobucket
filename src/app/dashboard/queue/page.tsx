import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { QueueClient } from "./queue-client"

export default async function QueuePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/login")

  const videoService = new VideoService()
  const activeJobs = await videoService.getActiveJobs(session.user.id)
  const stats = await videoService.getQueueStatus(session.user.id)

  return (
    <QueueClient 
      initialJobs={activeJobs as any} 
      initialStats={stats} 
    />
  )
}
