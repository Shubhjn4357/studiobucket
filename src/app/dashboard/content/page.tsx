import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { VideoActions } from "@/components/dashboard/video-actions"
import { ContentManagerClient } from "@/components/dashboard/content-manager-client"
import { Video } from "@/schemas"
import Image from "next/image"

interface VideoWithStats extends Video {
  views: number
  likes: number
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const videoService = new VideoService()
  const videos = await videoService.getUserVideos(session.user.id, undefined, q) as unknown as VideoWithStats[]

  return (
    <div className="space-y-12 pb-24 relative">
      {/* Structural Ambience Nodes */}
      <div className="absolute -top-60 -left-60 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Industrial Header Deck */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 p-12 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
        {/* HUD Scan Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
            <Icons.play className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">Telemetry_Stream_Live</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">Asset_Repository</h1>
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[11px] italic">Global_Distribution // Content_Inventory_Node</p>
          </div>
        </div>

        <Link href="/dashboard/upload">
          <Button className="h-16 bg-white text-black hover:bg-white/90 rounded-2xl px-12 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-105 active:scale-95 italic border border-white/20">
            <Icons.plus className="h-5 w-5 mr-3" />
            Inject_New_Asset
          </Button>
        </Link>
      </div>

      <ContentManagerClient 
        localContent={
          <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl relative">
            {/* HUD Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none opacity-20" />
            
            <div className="overflow-x-auto custom-scrollbar relative z-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic">Asset_Identity // Spectrum</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic">Access_Protocol</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic">Sync_Status</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic">Reach</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic">Sentiment</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {videos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-10 py-48 text-center">
                        <div className="flex flex-col items-center gap-8">
                          <div className="h-24 w-24 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-inner">
                            <Icons.video className="h-10 w-10 text-white/10" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white/20 italic">Zero_Data_Synchronized</p>
                            <p className="text-[9px] font-bold text-white/5 uppercase tracking-widest italic">Node_Alpha_Requires_Injection</p>
                          </div>
                          <Link href="/dashboard/upload">
                            <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] px-8 hover:bg-white/10 transition-all italic text-white/60">
                              Initiate_Upload_Sequence
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    videos.map((video) => (
                      <tr key={video.id} className="group hover:bg-white/[0.02] transition-all duration-500">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-8">
                            <div className="h-20 w-32 rounded-2xl bg-black border border-white/10 overflow-hidden relative shrink-0 shadow-2xl group-hover:border-primary/40 transition-colors duration-500">
                              {video.thumbnailPath ? (
                                <Image unoptimized fill src={video.thumbnailPath} alt={video.title} className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
                                   <Icons.video className="h-8 w-8 text-white/10 group-hover:text-primary transition-colors" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            <div className="flex flex-col gap-2 max-w-[320px]">
                              <span className="text-sm font-black text-white uppercase italic tracking-tight group-hover:text-primary transition-colors duration-500 truncate">{video.title}</span>
                              <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest line-clamp-1 italic">{video.description || "No_Metadata_Injected"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 w-fit px-4 py-2 rounded-xl">
                            {video.privacyStatus === "public" ? (
                              <Icons.globe className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Icons.lock className="h-3 w-3 text-amber-500" />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 italic">{video.privacyStatus}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-3">
                               <div className={cn(
                                 "h-2 w-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                                 video.status === "published" ? "bg-emerald-500 shadow-emerald-500/40" :
                                 video.status === "failed" ? "bg-red-500 shadow-red-500/40" : "bg-amber-500 shadow-amber-500/40"
                               )} />
                               <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white italic">{video.status}</span>
                             </div>
                             <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full transition-all duration-1000", video.status === "published" ? "bg-emerald-500" : "bg-primary")}
                                  style={{ width: video.status === "published" ? "100%" : "40%" }}
                                />
                             </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-white italic tracking-tighter">{video.views.toLocaleString()}</span>
                             <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">IMPRESSIONS</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex flex-col">
                             <span className="text-sm font-black text-white italic tracking-tighter">{video.likes.toLocaleString()}</span>
                             <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">REACTION_SCORE</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <Link href={`/dashboard/studio?id=${video.id}`}>
                              <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/20 text-white/20 hover:text-primary transition-all">
                                <Icons.edit3 className="h-5 w-5" />
                              </Button>
                            </Link>
                            <VideoActions videoId={video.id} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        }
      />
    </div>
  )
}
