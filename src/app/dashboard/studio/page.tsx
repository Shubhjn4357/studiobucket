import { VideoStudio } from "@/components/dashboard/video-studio"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { Icons } from "@/components/ui/icons"

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  let initialVideo = null

  if (id) {
    initialVideo = await db.query.videos.findFirst({
      where: and(eq(videos.id, id), eq(videos.userId, session.user.id))
    })
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Studio Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none italic">Integrated Studio</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Non-Destructive Editing • AI Pipeline</p>
          </div>
        </div>
      </div>

      <VideoStudio 
        videoId={id || "default"} 
        initialData={initialVideo ? JSON.parse(initialVideo.metadata || "{}") : undefined}
        title={initialVideo?.title || "Alpha Strike"}
      />
    </div>
  )
}
