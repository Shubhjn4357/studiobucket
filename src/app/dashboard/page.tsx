import { UploadCenter } from "@/components/dashboard/upload-center"
import { ScheduleCalendar } from "@/components/dashboard/schedule-calendar"
import { QueueStatus } from "@/components/dashboard/queue-status"
import { Analytics } from "@/components/dashboard/analytics"
import { VideoService } from "@/lib/services/video-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Icons } from "@/components/ui/icons"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const videoService = new VideoService()
  const queueData = await videoService.getQueueStatus(session.user.id)
  const analyticsData = await videoService.getAnalyticsData(session.user.id)
  const scheduledVideos = await videoService.getScheduledVideos(session.user.id)

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.layoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Mission Control</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Operational Overview • System Stable</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
          <UploadCenter />
          <QueueStatus initialData={queueData} />
        </div>
        <div className="space-y-8">
          <Analytics initialData={analyticsData} />
          <ScheduleCalendar initialData={scheduledVideos} />
        </div>
      </div>
    </div>
  )
}
