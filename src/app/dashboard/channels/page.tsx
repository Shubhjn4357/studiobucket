import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { ChannelList } from "./channel-list"
import { ChannelActions } from "./channel-actions"
import { motion } from "framer-motion"
import { Icons } from "@/components/ui/icons"

export default async function ChannelsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const videoService = new VideoService()
  const channels = await videoService.getChannels(session.user.id)

  return (
    <div className="space-y-16 pb-24 relative max-w-7xl mx-auto">
      {/* Structural Ambience Nodes */}
      <div className="absolute -top-60 -left-60 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Industrial Header Console */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-16 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden">
        {/* HUD Scanline FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="h-24 w-24 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 relative group">
            <div className="absolute inset-0 rounded-[2.5rem] bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <Icons.users className="h-12 w-12 text-white relative z-10" />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
               <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic">Fleet_Orchestration_Active</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Channel_Manager</h1>
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[11px] italic">Multi-Channel_Fleet_Status // Node_Controller</p>
          </div>
        </div>
        
        <ChannelActions />
      </div>

      <ChannelList initialChannels={channels} />
    </div>
  )
}
