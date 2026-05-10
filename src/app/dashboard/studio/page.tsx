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

  if (videoId !== "default") {
    initialVideo = await db.query.videos.findFirst({
      where: and(eq(videos.id, videoId), eq(videos.userId, userId))
    })
  }

  return (
    <VideoStudio 
      videoId={videoId} 
      initialData={initialVideo ? JSON.parse(initialVideo.metadata || "{}") : undefined}
      title={initialVideo?.title || "Alpha Strike"}
    />
  )
}

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Studio Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Icons.video className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Creative Studio</h1>
            <p className="text-sm text-muted-foreground">Orchestrate your content with AI precision.</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<StudioSkeleton />}>
        <StudioContent videoId={id || "default"} userId={session.user.id} />
      </Suspense>
    </div>
  )
}
