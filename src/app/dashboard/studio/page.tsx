import { VideoStudio } from "@/components/dashboard/video-studio"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { Icons } from "@/components/ui/icons"
import { Suspense } from "react"
import { StudioSkeleton } from "@/components/ui/skeleton-loader"

async function StudioContent({ videoId, userId }: { videoId: string, userId: string }) {
  let initialVideo = null
  let initialData = undefined

  try {
    if (videoId !== "default") {
      initialVideo = await db.query.videos.findFirst({
        where: and(eq(videos.id, videoId), eq(videos.userId, userId))
      })
      
      if (!initialVideo) {
        console.warn(`Video ${videoId} not found for user ${userId}`)
      } else if (initialVideo.metadata) {
        try {
          initialData = JSON.parse(initialVideo.metadata)
        } catch (e) {
          console.error("Failed to parse video metadata:", e)
        }
      }
    }
  } catch (error) {
    console.error("Critical database retrieval failure in Studio:", error)
  }

  return (
    <VideoStudio 
      videoId={videoId} 
      initialData={initialData}
      title={initialVideo?.title || "ALPHA_STRIKE_DEFAULT"}
      filePath={initialVideo?.filePath || undefined}
      hlsPath={initialVideo?.hlsPath || undefined}
    />
  )
}

export default async function StudioPage(props: {
  searchParams: Promise<{ id?: string }>
}) {
  const searchParams = await props.searchParams
  const id = searchParams.id
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-16 pb-32 relative">
      {/* Background Ambience Node */}
      <div className="absolute -top-60 -right-60 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -left-60 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Industrial Studio Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 p-16 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden">
        {/* HUD Scan Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="flex items-center gap-12 relative z-10">
          <div className="h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-[0_0_40px_var(--primary)]">
            <Icons.video className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
               <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_var(--emerald-500)]" />
               <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.6em] italic leading-none">Command_Studio_Online</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none italic">Asset_Forge</h1>
            <p className="text-white/20 font-black uppercase tracking-[0.5em] text-[12px] italic">Strategic_Assets // Tactical_Orchestration</p>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-col items-end relative z-10 border-l border-white/5 pl-12 gap-3">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Process_Link</span>
              <span className="text-xs font-mono font-black text-primary italic uppercase tracking-tighter bg-primary/10 px-4 py-1 rounded-full border border-primary/20">NODE_ALPHA_{id?.slice(0,8) || "SYSTEM"}</span>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Temporal_Grid</span>
              <span className="text-xs font-mono font-black text-white/40 italic">LOCKED_STABLE</span>
           </div>
        </div>
      </div>

      <div className="px-4">
        <Suspense fallback={<StudioSkeleton />}>
          <StudioContent videoId={id || "default"} userId={session.user.id} />
        </Suspense>
      </div>
    </div>
  )
}
