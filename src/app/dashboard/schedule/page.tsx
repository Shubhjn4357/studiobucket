import { ScheduleManager } from "@/components/schedule/schedule-manager"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"

export default async function SchedulePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/sigin")

  const videoService = new VideoService()
  const scheduledVideos = (await videoService.getScheduledVideos(session.user.id)).map(item => ({
    ...item,
    video: {
      ...item.video,
      privacy: item.video.privacy as "public" | "private" | "unlisted",
      status: item.video.status as "pending" | "processing" | "uploaded" | "scheduled" | "published" | "failed",
      license: item.video.license as "youtube" | "creativeCommon" | null
    }
  }))

  return (
    <ScheduleManager initialSchedules={scheduledVideos} />
  )
}
