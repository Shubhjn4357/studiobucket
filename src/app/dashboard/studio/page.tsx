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
    <div className="space-y-4 pb-12 relative">
      {/* Background Ambience Node */}
      <div className="absolute -top-60 -right-60 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Industrial Studio Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 bg-surface border border-border rounded-sm shadow-sm relative overflow-hidden hud-corner">
        {/* HUD Scan Pattern */}
        <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="h-10 w-10 rounded-sm bg-primary flex items-center justify-center shadow-sm">
            <Icons.video className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_var(--emerald-500)]" />
               <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em] italic leading-none">Command_Studio_Online</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tighter leading-none italic">Asset_Forge</h1>
            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[8px] italic opacity-40">Strategic_Assets // Tactical_Orchestration</p>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-col items-end relative z-10 border-l border-border pl-6 gap-1">
           <div className="flex items-center gap-3">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Process_Link</span>
              <span className="text-[10px] font-mono font-black text-primary italic uppercase tracking-tighter bg-primary/5 px-2 py-0.5 rounded-sm border border-primary/10">NODE_ALPHA_{id?.slice(0,8) || "SYSTEM"}</span>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Temporal_Grid</span>
              <span className="text-[10px] font-mono font-black text-foreground/40 italic uppercase">LOCKED_STABLE</span>
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
