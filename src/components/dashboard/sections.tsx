import { VideoService } from "@/lib/services/video-service"
import { Icons } from "@/components/ui/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Analytics } from "@/components/dashboard/analytics"
import { QueueStatus } from "@/components/dashboard/queue-status"
import { VideoCardSkeleton, StatsSkeleton, ListSkeleton } from "@/components/ui/skeleton-loader"

const videoService = new VideoService()

export async function LatestVideoSection({ userId }: { userId: string }) {
  const videos = await videoService.getUserVideos(userId, undefined, undefined, 1)
  const video = videos[0]

  if (!video) return null

  return (
    <Card className="border-border bg-card overflow-hidden">
      <div className="flex flex-col md:flex-row p-4 gap-6">
        <div className="w-full md:w-[320px] aspect-video rounded-xl bg-secondary relative group overflow-hidden shrink-0">
           <div className="absolute inset-0 flex items-center justify-center">
              <Icons.video className="h-10 w-10 text-muted-foreground/20" />
           </div>
           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Link href={`/dashboard/studio?id=${video.id}`}>
                <Button size="sm" className="rounded-full bg-white text-black hover:bg-slate-200 text-xs font-bold px-6">
                  Edit
                </Button>
              </Link>
           </div>
        </div>
        <div className="flex-1 flex flex-col justify-between py-2">
          <div className="space-y-1">
             <h3 className="text-xl font-bold line-clamp-2">{video.title}</h3>
             <p className="text-xs text-muted-foreground">Status: <span className="text-primary font-semibold uppercase">{video.status}</span></p>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-4 pt-4 border-t border-border">
             <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Views</span>
                <span className="text-lg font-bold">--</span>
             </div>
             <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Likes</span>
                <span className="text-lg font-bold">--</span>
             </div>
             <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Duration</span>
                <span className="text-lg font-bold">--</span>
             </div>
          </div>
        </div>
      </div>
    </Card>
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

export function InsightsSection() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Icons.lightbulb className="h-4 w-4 text-amber-500" />
          Channel Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <h4 className="text-xs font-bold mb-1">Growth Opportunity</h4>
          <p className="text-xs text-muted-foreground">Your recent Shorts are performing 40% better than average.</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <h4 className="text-xs font-bold mb-1">Engagement Tip</h4>
          <p className="text-xs text-muted-foreground">Replying to comments in the first hour can boost reach by 15%.</p>
        </div>
      </CardContent>
    </Card>
  )
}
