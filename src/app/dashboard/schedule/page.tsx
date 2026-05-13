import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { ScheduleManager } from "@/components/schedule/schedule-manager"
import { Icons } from "@/components/ui/icons"
import { Video, Schedule } from "@/schemas"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"

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
    <PageContainer>
      <PageHeader 
        title="Schedule" 
        description="Plan and automate your video uploads with the temporal grid system." 
        iconName="calendar"
      />

      <ScheduleManager initialSchedules={scheduledVideos} />

      <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Icons.shieldCheck className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-foreground">Automation Active</p>
            <p className="text-xs text-muted-foreground font-medium">All scheduled tasks are monitored by the core engine.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-2.5 bg-background/50 border border-border rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Engine Status</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Operational</span>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
