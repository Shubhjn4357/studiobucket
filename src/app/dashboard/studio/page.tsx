import { VideoStudio } from "@/components/dashboard/video-studio"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { Suspense } from "react"
import { StudioSkeleton } from "@/components/ui/skeleton-loader"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"

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
      title={initialVideo?.title || "Untitled Project"}
      initialData={initialData}
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
    <PageContainer maxWidth="full" className="px-0 py-0">
      <div className="px-6 pt-6">
        <PageHeader 
          title="Video Studio" 
          description="Edit, trim, and customize your video assets before publishing." 
          iconName="video"
        />
      </div>

      <div className="mt-4 border-t border-border">
        <Suspense fallback={<div className="p-8"><StudioSkeleton /></div>}>
          <StudioContent videoId={id || "default"} userId={session.user.id} />
        </Suspense>
      </div>
    </PageContainer>
  )
}
