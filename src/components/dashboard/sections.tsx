import { VideoService } from "@/lib/services/video-service"
import { Icons } from "@/components/ui/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Analytics } from "@/components/dashboard/analytics"
import { QueueStatus } from "@/components/dashboard/queue-status"
import { VideoCardSkeleton, StatsSkeleton, ListSkeleton } from "@/components/ui/skeleton-loader"

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
    <div className="p-12 bg-black/20 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
       <Icons.video className="h-12 w-12 text-white/5 mb-4" />
       <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">No transmission data found in this sector.</span>
    </div>
  )

  return (
    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden group shadow-2xl relative">
      {/* Scanline FX */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-10 pointer-events-none bg-[size:100%_2px,3px_100%]" />
      
      <div className="flex flex-col md:flex-row p-8 gap-10 relative z-20">
        <div className="w-full md:w-[400px] aspect-video rounded-3xl bg-black relative group/thumb overflow-hidden shrink-0 border border-white/10 shadow-2xl">
           {video.thumbnailPath ? (
             <img src={video.thumbnailPath} className="h-full w-full object-cover transition-transform duration-1000 group-hover/thumb:scale-110 opacity-80 group-hover/thumb:opacity-100" />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
                <Icons.video className="h-16 w-16 text-white/5" />
             </div>
           )}
           <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/thumb:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
              <Link href={`/dashboard/studio?id=${video.id}`}>
                <Button className="h-14 rounded-2xl bg-white text-black hover:bg-white/90 text-[11px] font-black uppercase tracking-[0.3em] px-10 shadow-2xl shadow-primary/40 transition-all hover:scale-105 italic">
                  Launch_Console
                </Button>
              </Link>
           </div>
           {video.duration && (
             <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/90 backdrop-blur-xl rounded-xl text-[10px] font-mono font-black text-white border border-white/10 tracking-widest">
               {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
             </div>
           )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-2">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] bg-primary/5 px-3 py-1 rounded-lg border border-primary/10 italic">Asset_Status: Live</span>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">{new Date(video.createdAt).toLocaleDateString()} {"//"} GMT+0</span>
             </div>
             <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-primary transition-colors duration-500">{video.title}</h3>
             <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest leading-relaxed line-clamp-2 italic">{video.description || "No metadata description injected for this node."}</p>
          </div>
          <div className="grid grid-cols-3 gap-10 mt-8 pt-8 border-t border-white/5">
             <div className="flex flex-col">
                <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em] mb-2 italic">Signal_Reach</span>
                <span className="text-2xl font-black text-white italic tracking-tight">{video.views?.toLocaleString() || "0"}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em] mb-2 italic">Affirmations</span>
                <span className="text-2xl font-black text-white italic tracking-tight">{video.likes?.toLocaleString() || "0"}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.3em] mb-2 italic">Node_State</span>
                <span className={cn(
                   "text-2xl font-black italic uppercase tracking-tight",
                   video.status === "published" ? "text-emerald-500" : "text-amber-500"
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
    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <Icons.lightbulb className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex flex-col">
           <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Intelligent_Insights</span>
           <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Neural Engine Analysis</span>
        </div>
      </div>
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-4 text-center">
             <Icons.info className="h-8 w-8 text-white/5" />
             <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] italic px-2">Gathering intelligence nodes...</p>
          </div>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-2 italic group-hover:text-primary transition-colors">{insight.title}</h4>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed italic">{insight.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
