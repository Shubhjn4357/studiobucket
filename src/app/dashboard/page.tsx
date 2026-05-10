import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { db } from "@/lib/db"
import { analytics } from "@/lib/db/schema"
import { eq, sum } from "drizzle-orm"
import { UploadCenter } from "@/components/dashboard/upload-center"
import { QueueStatus } from "@/components/dashboard/queue-status"
import { Analytics } from "@/components/dashboard/analytics"
import { Icons } from "@/components/ui/icons"
import { Video, Schedule, UploadJob } from "@/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ScheduledVideo {
  video: Video
  schedule: Schedule
}

interface VideoWithViews extends Video {
  views?: number
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const videoService = new VideoService()
  
  let queueData = { active: 0, completed: 0, failed: 0, waiting: 0 }
  let analyticsData = { totalViews: 0, totalLikes: 0, totalComments: 0, totalVideos: 0 }
  let scheduledVideos: ScheduledVideo[] = []
  let activeJobs: UploadJob[] = []
  let latestVideo: VideoWithViews | null = null

  try {
    const [q, a, s, j, v] = await Promise.all([
      videoService.getQueueStatus(session.user.id),
      videoService.getAnalyticsData(session.user.id),
      videoService.getScheduledVideos(session.user.id) as Promise<ScheduledVideo[]>,
      videoService.getActiveJobs(session.user.id) as Promise<UploadJob[]>,
      videoService.getUserVideos(session.user.id, undefined, undefined, 1) as Promise<VideoWithViews[]>
    ])
    queueData = q
    analyticsData = a
    scheduledVideos = s
    activeJobs = j
    latestVideo = v[0] || null
    
    if (latestVideo) {
      const latestStats = await db.select({
        views: sum(analytics.views),
      }).from(analytics).where(eq(analytics.videoId, latestVideo.id))
      latestVideo.views = Number(latestStats[0]?.views || 0)
    }
  } catch (error) {
    console.error("Dashboard data fetch failed:", error)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.layoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none italic">Studio Dashboard</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Operational Overview • System Synchronized</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/upload">
            <Button className="h-11 bg-primary text-white hover:opacity-90 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
              <Icons.plus className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Primary Stats & Latest */}
        <div className="lg:col-span-8 space-y-8">
          {/* Latest Video Card (YT Style) */}
          {latestVideo ? (
            <Card className="cyber-card border-border bg-card/50 overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/30">
                <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                  <Icons.play className="h-4 w-4 text-primary" />
                  Latest Video Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-64 h-36 rounded-xl bg-slate-900 border border-border flex items-center justify-center relative group overflow-hidden">
                    <Icons.video className="h-12 w-12 text-white/5" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link href={`/dashboard/studio?id=${latestVideo.id}`}>
                        <Button size="sm" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                          Edit Video
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter line-clamp-1">{latestVideo.title}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Published 2 hours ago</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
                      <div className="space-y-1">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Ranking</p>
                        <p className="text-lg font-black text-foreground italic">-- / 10</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Views</p>
                        <p className="text-lg font-black text-foreground italic">{latestVideo.views || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Stability</p>
                        <p className="text-lg font-black text-emerald-500 italic">100%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
             <UploadCenter />
          )}

          <Analytics initialData={analyticsData} />
        </div>

        {/* Right Column: Queue & Tasks */}
        <div className="lg:col-span-4 space-y-8">
          <QueueStatus initialData={queueData} activeJobs={activeJobs} />
          
          {/* News / Suggestions Card */}
          <Card className="cyber-card border-border bg-card/50 overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Icons.lightbulb className="h-4 w-4 text-amber-500" />
                Studio Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">New Feature</p>
                <h4 className="text-xs font-black text-foreground uppercase tracking-tight mb-2">Bulk Metadata Editor</h4>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                  You can now update tags and categories for multiple videos at once in the Content tab.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Recommendation</p>
                <h4 className="text-xs font-black text-foreground uppercase tracking-tight mb-2">Shorts Optimization</h4>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                  Your vertical videos are getting 30% more reach. Consider converting your latest project to 9:16.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
