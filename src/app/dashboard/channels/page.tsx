import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { ChannelList } from "./channel-list"

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
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-border bg-muted/50 text-[10px] font-black uppercase tracking-widest px-6">
            <Icons.refreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
          <Button className="h-11 bg-primary text-white hover:opacity-90 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
            <Icons.plus className="h-4 w-4 mr-2" />
            Connect Channel
          </Button>
        </div>
      </div>

      <ChannelList initialChannels={channels} />
    </div>
  )
}
