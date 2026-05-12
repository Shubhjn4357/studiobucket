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
    <div className="space-y-16 pb-24 relative max-w-7xl mx-auto">
      {/* Structural Ambience Nodes */}
      <div className="absolute -top-60 -left-60 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />

      <QueueClient 
        initialJobs={activeJobs} 
        initialStats={stats} 
      />
    </div>
  )
}
