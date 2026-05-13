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
    <div className="p-6 bg-black/20 border border-dashed border-white/5 rounded-none flex flex-col items-center justify-center text-center">
       <Icons.video className="h-8 w-8 text-white/5 mb-3" />
       <span className="text-hud opacity-20 italic">No transmission data found.</span>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-none overflow-hidden group shadow-2xl relative">
      <div className="absolute inset-0 industrial-grid pointer-events-none opacity-5" />
      
      <div className="flex flex-col md:flex-row p-4 gap-6 relative z-20">
        <div className="w-full md:w-[240px] aspect-video rounded-none bg-black relative group/thumb overflow-hidden shrink-0 border border-white/10">
           {video.thumbnailPath ? (
             <Image 
               src={video.thumbnailPath} 
               alt={video.title}
               fill
               unoptimized
               className="h-full w-full object-cover transition-transform duration-1000 group-hover/thumb:scale-110 opacity-80 group-hover/thumb:opacity-100" 
             />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
                <Icons.video className="h-10 w-10 text-white/5" />
             </div>
           )}
           <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/thumb:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
              <Link href={`/dashboard/studio?id=${video.id}`}>
                <Button className="h-8 rounded-none bg-white text-black hover:bg-white/90 text-[9px] font-black uppercase tracking-[0.2em] px-6 transition-all hover:scale-105 italic">
                  LAUNCH_CONSOLE
                </Button>
              </Link>
           </div>
           {video.duration && (
             <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/90 backdrop-blur-xl rounded-none text-[8px] font-mono font-black text-white border border-white/10 tracking-widest">
               {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
             </div>
           )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-2 py-0.5 rounded-none border border-primary/10 italic">STATUS: LIVE</span>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] italic">{new Date(video.createdAt).toLocaleDateString()} {"//"} GMT+0</span>
             </div>
             <h3 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-primary transition-colors duration-500">{video.title}</h3>
             <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.1em] leading-relaxed line-clamp-2 italic">{video.description || "No metadata description injected."}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
             <div className="flex flex-col">
                <span className="text-[7px] text-white/20 uppercase font-black tracking-[0.2em] mb-1 italic">REACH</span>
                <span className="text-lg font-black text-white italic tracking-tight">{video.views?.toLocaleString() || "0"}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[7px] text-white/20 uppercase font-black tracking-[0.2em] mb-1 italic">LIKES</span>
                <span className="text-lg font-black text-white italic tracking-tight">{video.likes?.toLocaleString() || "0"}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[7px] text-white/20 uppercase font-black tracking-[0.2em] mb-1 italic">STATE</span>
                <span className={cn(
                   "text-lg font-black italic uppercase tracking-tight",
                   video.status === "published" ? "text-emerald-500" : "text-primary"
                )}>{video.status}</span>
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
    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-none p-4 shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-none bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Icons.lightbulb className="h-4 w-4 text-amber-500" />
        </div>
        <div className="flex flex-col">
           <span className="text-hud text-white tracking-[0.2em]">INTELLIGENT_INSIGHTS</span>
           <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.1em]">Neural Engine</span>
        </div>
      </div>
      <div className="space-y-2">
        {insights.length === 0 ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
             <Icons.info className="h-6 w-6 text-white/5" />
             <p className="text-hud text-white/10 italic px-2">Gathering intelligence...</p>
          </div>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="p-3 rounded-none bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group">
              <h4 className="text-hud text-white group-hover:text-primary transition-colors">{insight.title}</h4>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.1em] leading-relaxed italic">{insight.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
export function VideoCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden p-4 h-[200px] animate-pulse">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="w-full md:w-[240px] aspect-video rounded-2xl bg-muted shrink-0" />
        <div className="flex-1 space-y-4 py-2">
          <div className="h-6 w-3/4 bg-muted rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded-md" />
            <div className="h-4 w-5/6 bg-muted rounded-md" />
          </div>
          <div className="pt-4 flex gap-4">
            <div className="h-8 w-16 bg-muted rounded-lg" />
            <div className="h-8 w-16 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
