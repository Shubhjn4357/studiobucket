import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { ScheduleManager } from "@/components/schedule/schedule-manager"
import { Icons } from "@/components/ui/icons"
import { Video, Schedule } from "@/schemas"

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
    console.error("Critical Temporal Failure:", error)
  }

  return (
    <div className="space-y-16 pb-24 relative">
      {/* Structural Ambience Nodes */}
      <div className="absolute -top-60 -left-60 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />
      
      {/* HUD Telemetry Overlay */}
      <div className="fixed top-32 right-12 hidden xl:flex flex-col gap-6 z-0 opacity-20 pointer-events-none">
         <div className="space-y-2 text-right">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Temporal_Drift</p>
            <p className="text-2xl font-black text-primary italic">0.0004s</p>
         </div>
         <div className="space-y-2 text-right">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Grid_Density</p>
            <p className="text-2xl font-black text-white italic">LOW_OPTIMAL</p>
         </div>
      </div>

      <ScheduleManager initialSchedules={scheduledVideos} />

      {/* Global Mission Control Footer */}
      <div className="max-w-5xl mx-auto p-10 rounded-[3rem] bg-black/40 border border-white/5 flex items-center justify-between shadow-2xl relative overflow-hidden group">
         <div className="flex items-center gap-8 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-all">
               <Icons.shieldCheck className="h-6 w-6 text-white/20 group-hover:text-primary" />
            </div>
            <div className="space-y-1">
               <p className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic leading-none">Automated_Sortie_Verification</p>
               <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] italic">ALL SYSTEMS NOMINAL {"//"} TEMPORAL GRID LOCKED</p>
            </div>
         </div>
         <div className="flex items-center gap-6 relative z-10">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">MISSION_READY</span>
         </div>
      </div>
    </div>
  )
}
