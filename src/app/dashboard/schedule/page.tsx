import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { ScheduleManager } from "@/components/schedule/schedule-manager"
import { Icons } from "@/components/ui/icons"
import { Video, Schedule } from "@/schemas"
import { PageHeader } from "@/components/dashboard/page-header"

export default async function SchedulePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const videoService = new VideoService()
  let scheduledVideos: { video: Video, schedule: Schedule }[] = []

  try {
    const rawSchedules = await videoService.getScheduledVideos(session.user.id)
    const results = (rawSchedules || []).map(item => {
      if (!item.video || !item.schedule) return null
      return {
        ...item,
        video: {
          ...item.video,
          channelId: item.video.channelId ?? null,
          description: item.video.description ?? null,
          tags: item.video.tags ?? null,
          location: item.video.location ?? null,
          recordingDate: item.video.recordingDate ?? null,
          filePath: item.video.filePath ?? null,
          fileSize: item.video.fileSize ?? null,
          duration: item.video.duration ?? null,
          thumbnailPath: item.video.thumbnailPath ?? null,
          hlsPath: item.video.hlsPath ?? null,
          youtubeVideoId: item.video.youtubeVideoId ?? null,
          publishAt: item.video.publishAt ?? null,
          publishedAt: item.video.publishedAt ?? null,
          uploadedAt: item.video.uploadedAt ?? null,
          errorMessage: item.video.errorMessage ?? null,
          metadata: item.video.metadata ?? null,
          privacyStatus: (item.video.privacyStatus || "private") as "public" | "private" | "unlisted",
          status: (item.video.status || "draft") as "draft" | "queued" | "processing" | "uploaded" | "scheduled" | "published" | "failed",
          license: (item.video.license || "youtube") as "youtube" | "creativeCommon",
          categoryId: item.video.categoryId || "22",
          defaultLanguage: item.video.defaultLanguage || "en",
          embeddable: !!item.video.embeddable,
          publicStatsViewable: !!item.video.publicStatsViewable,
          selfDeclaredMadeForKids: !!item.video.selfDeclaredMadeForKids,
          containsSyntheticMedia: !!item.video.containsSyntheticMedia,
          isShorts: !!item.video.isShorts,
          retryCount: item.video.retryCount || 0
        },
        schedule: {
          ...item.schedule,
          recurrencePattern: item.schedule.recurrencePattern ?? null
        }
      }
    })
    
    scheduledVideos = results.filter((item): item is { video: Video, schedule: Schedule } => item !== null)
  } catch (error) {
    console.error("Failed to load schedules:", error)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Video Schedule" 
        description="Plan and automate your video uploads with our easy-to-use calendar." 
        icon={Icons.calendar}
      />

      <ScheduleManager initialSchedules={scheduledVideos} />

      <div className="p-8 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <Icons.shieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-foreground">Automation Active</p>
            <p className="text-xs text-muted-foreground">All scheduled tasks are monitored and verified.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Status</span>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-500 uppercase">Mission Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
