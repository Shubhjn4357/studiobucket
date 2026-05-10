import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { AnalyticsClient } from "./analytics-client"

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/login")

  const videoService = new VideoService()
  const stats = await videoService.getAnalyticsData(session.user.id)
  const recentVideos = await videoService.getUserVideos(session.user.id, undefined, undefined, 5)
  const dailyStats = await videoService.getDailyStats(session.user.id, 7)

  // Map real data to client components
  const metrics = [
    { label: "Total Views", value: stats.totalViews.toLocaleString(), change: "+0.0%", trending: "up" as const },
    { label: "Videos", value: stats.totalVideos.toLocaleString(), change: "+0.0%", trending: "up" as const },
    { label: "Likes", value: stats.totalLikes.toLocaleString(), change: "+0.0%", trending: "up" as const },
    { label: "Engagement", value: "0%", change: "+0.0%", trending: "up" as const },
  ]

  return (
    <AnalyticsClient 
      metrics={metrics}
      dailyStats={dailyStats.map(s => ({ 
        date: s.date, 
        views: s.views ? Number(s.views) : 0, 
        likes: s.likes ? Number(s.likes) : 0 
      }))}
      recentVideos={recentVideos.map(v => ({
        id: v.id,
        title: v.title,
        views: "0", // Need actual views per video from DB if possible
        reach: "0%",
        retention: "0%"
      }))}
    />
  )
}
