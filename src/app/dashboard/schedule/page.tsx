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
      privacyStatus: item.video.privacyStatus as "public" | "private" | "unlisted",
      status: item.video.status as "draft" | "queued" | "processing" | "uploaded" | "scheduled" | "published" | "failed",
      license: (item.video.license || "youtube") as "youtube" | "creativeCommon",
      categoryId: item.video.categoryId || "22",
      defaultLanguage: item.video.defaultLanguage || "en",
      embeddable: !!item.video.embeddable,
      publicStatsViewable: !!item.video.publicStatsViewable,
      selfDeclaredMadeForKids: !!item.video.selfDeclaredMadeForKids,
      containsSyntheticMedia: !!item.video.containsSyntheticMedia,
      isShorts: !!item.video.isShorts,
      retryCount: item.video.retryCount || 0
    }
  }))

  return (
    <ScheduleManager initialSchedules={scheduledVideos} />
  )
}
