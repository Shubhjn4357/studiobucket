import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { ChannelList } from "./channel-list"
import { ChannelActions } from "./channel-actions"

export default async function ChannelsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const videoService = new VideoService()
  const channels = await videoService.getChannels(session.user.id)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none italic">Channel Manager</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Multi-Channel Orchestration • Fleet Status</p>
          </div>
        </div>
        <ChannelActions />
      </div>

      <ChannelList initialChannels={channels} />
    </div>
  )
}
