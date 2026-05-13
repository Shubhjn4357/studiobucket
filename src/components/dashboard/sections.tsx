import { VideoService } from "@/lib/services/video-service"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Analytics } from "@/components/dashboard/analytics"
import { QueueStatus } from "@/components/dashboard/queue-status"
import Image from "next/image"

const videoService = new VideoService()

interface VideoWithStats {
  id: string
  title: string
  description: string | null
  thumbnailPath: string | null
  duration: number | null
  createdAt: number
  status: string
  views: number
  likes: number
}

export async function LatestVideoSection({ userId }: { userId: string }) {
  const videos = await videoService.getUserVideos(userId, undefined, undefined, 1) as unknown as VideoWithStats[]
  const video = videos[0]

  if (!video) return (
    <div className="p-12 md:p-24 bg-card/50 border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center">
       <div className="h-16 w-16 rounded-3xl bg-muted flex items-center justify-center mb-6">
         <Icons.video className="h-8 w-8 text-muted-foreground opacity-30" />
       </div>
       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">No content uploaded yet</p>
    </div>
  )

  return (
    <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 relative">
      <div className="flex flex-col md:flex-row p-4 md:p-6 gap-6 md:gap-8 relative z-20">
        <div className="w-full md:w-[280px] lg:w-[320px] aspect-video rounded-2xl md:rounded-3xl bg-black relative group/thumb overflow-hidden shrink-0 shadow-lg border border-border/50">
           {video.thumbnailPath ? (
             <Image 
               src={video.thumbnailPath} 
               alt={video.title}
               fill
               unoptimized
               className="h-full w-full object-cover transition-transform duration-700 group-hover/thumb:scale-110" 
             />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                <Icons.video className="h-10 w-10 text-muted-foreground/30" />
             </div>
           )}
           <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/thumb:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
              <Link href={`/dashboard/studio?id=${video.id}`}>
                <Button className="h-10 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold px-6 shadow-xl transition-all hover:scale-105 active:scale-95">
                  Open in Studio
                </Button>
              </Link>
           </div>
           {video.duration && (
             <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black text-white border border-white/10 tracking-widest">
               {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
             </div>
           )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <span className={cn(
                   "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm",
                   video.status === "published" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  {video.status === "published" ? "Status: Live" : `Status: ${video.status}`}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{new Date(video.createdAt).toLocaleDateString()}</span>
             </div>
             <h3 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors duration-500 truncate">{video.title}</h3>
             <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2 md:line-clamp-3">{video.description || "No description provided for this video yet."}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 md:gap-10 mt-6 pt-6 border-t border-border/50">
             <div className="flex flex-col gap-1">
                <span className="text-[9px] text-muted-foreground/60 uppercase font-black tracking-widest">Views</span>
                <span className="text-xl md:text-2xl font-black text-foreground tracking-tighter tabular-nums">{video.views?.toLocaleString() || "0"}</span>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[9px] text-muted-foreground/60 uppercase font-black tracking-widest">Likes</span>
                <span className="text-xl md:text-2xl font-black text-foreground tracking-tighter tabular-nums">{video.likes?.toLocaleString() || "0"}</span>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[9px] text-muted-foreground/60 uppercase font-black tracking-widest">Growth</span>
                <span className="text-xl md:text-2xl font-black text-green-500 tracking-tighter tabular-nums">+0%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function AnalyticsSection({ userId }: { userId: string }) {
  const analyticsData = await videoService.getAnalyticsData(userId)
  return <Analytics initialData={analyticsData} />
}

export async function QueueSection({ userId }: { userId: string }) {
  const queueData = await videoService.getQueueStatus(userId)
  const activeJobs = await videoService.getActiveJobs(userId)
  return <QueueStatus initialData={queueData} activeJobs={activeJobs} />
}

export async function InsightsSection({ userId }: { userId: string }) {
  const insights = await videoService.getChannelInsights(userId)
  
  return (
    <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden h-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
          <Icons.lightbulb className="h-6 w-6" />
        </div>
        <div>
           <h3 className="text-lg font-bold text-foreground">Channel Insights</h3>
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">AI Recommendations</p>
        </div>
      </div>
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-4 text-center opacity-30">
             <Icons.info className="h-10 w-10 text-muted-foreground" />
             <p className="text-[10px] font-black uppercase tracking-widest italic">Collecting channel intelligence...</p>
          </div>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="p-4 md:p-5 rounded-[1.5rem] bg-muted/20 border border-border group hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300">
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-1">{insight.title}</h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">{insight.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function VideoCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden p-6 h-[260px] md:h-[220px] animate-pulse">
      <div className="flex flex-col md:flex-row gap-8 h-full">
        <div className="w-full md:w-[280px] aspect-video rounded-3xl bg-muted shrink-0" />
        <div className="flex-1 space-y-6 py-2">
          <div className="h-8 w-3/4 bg-muted rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted rounded-lg" />
            <div className="h-4 w-5/6 bg-muted rounded-lg" />
          </div>
          <div className="pt-6 flex gap-10">
            <div className="h-10 w-20 bg-muted rounded-xl" />
            <div className="h-10 w-20 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
