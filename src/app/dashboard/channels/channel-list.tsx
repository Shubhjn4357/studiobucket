"use client"

import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { switchChannelAction, syncChannelAction, disconnectChannelAction } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface Channel {
  id: string
  channelName: string | null | undefined
  channelId: string
  thumbnailUrl: string | null
  subscriberCount: number | null
  videoCount: number | null
  isActive: boolean
  isSelected: boolean
}

export function ChannelList({ initialChannels }: { initialChannels: Channel[] }) {
  const [channels, setChannels] = useState(initialChannels)
  const [isPending, setIsPending] = useState<string | null>(null)

  const handleSwitch = async (id: string) => {
    setIsPending(id)
    try {
      await switchChannelAction(id)
      setChannels(prev => prev.map(ch => ({
        ...ch,
        isSelected: ch.id === id
      })))
      toast.success("Operational node switched")
    } catch {
      toast.error("Handshake synchronization failed")
    } finally {
      setIsPending(null)
    }
  }

  const handleSync = async (id: string) => {
    setIsPending(id)
    try {
      await syncChannelAction(id)
      toast.success("Node telemetry updated")
    } catch {
      toast.error("Telemetry link failed")
    } finally {
      setIsPending(null)
    }
  }

  const handleDisconnect = async (id: string) => {
    setIsPending(id)
    try {
      await disconnectChannelAction(id)
      setChannels(prev => prev.filter(ch => ch.id !== id))
      toast.success("Operational link severed")
    } catch {
      toast.error("Disconnection sequence failed")
    } finally {
      setIsPending(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 px-4 relative z-10">
      <AnimatePresence mode="popLayout">
        {channels.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-40 text-center bg-black/40 backdrop-blur-3xl border border-dashed border-white/10 rounded-[4rem]"
          >
            <div className="flex flex-col items-center gap-8">
              <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <Icons.users className="h-10 w-10 text-white/10" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20 italic">Zero_Nodes_Synchronized</p>
            </div>
          </motion.div>
        ) : (
          channels.map((channel, i) => (
            <motion.div
              key={channel.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className={cn(
                "bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] overflow-hidden group transition-all duration-700 shadow-2xl relative flex flex-col h-full",
                channel.isSelected ? "border-primary/40 bg-primary/[0.02]" : "hover:border-primary/20"
              )}>
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                
                <div className="p-12 space-y-10 relative z-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-6">
                        <div className="relative group/avatar">
                          <Avatar className={cn(
                            "h-20 w-20 rounded-[1.8rem] border-2 transition-all duration-700",
                            channel.isSelected ? "border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]" : "border-white/5 group-hover:border-primary/40"
                          )}>
                            <AvatarImage src={channel.thumbnailUrl || ""} className="object-cover" />
                            <AvatarFallback className="bg-black text-primary font-black text-2xl uppercase italic">
                              {(channel.channelName || "U")[0]}
                            </AvatarFallback>
                          </Avatar>
                          {channel.isActive && (
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-black rounded-xl border border-white/10 flex items-center justify-center shadow-2xl">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-primary transition-colors">{channel.channelName || "Node_Unnamed"}</h3>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic font-mono">{channel.channelId.slice(0, 12)}...</span>
                             {channel.isSelected && (
                               <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20 italic">MISSION_ACTIVE</span>
                             )}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white/10 text-white/20 hover:text-white transition-all border border-transparent hover:border-white/10">
                            <Icons.moreHorizontal className="h-6 w-6" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 backdrop-blur-3xl bg-black/90 border-white/10 rounded-[2rem] p-3 shadow-2xl">
                          <DropdownMenuItem 
                            onClick={() => handleSync(channel.id)}
                            disabled={isPending === channel.id}
                            className="flex items-center gap-3 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer hover:bg-primary/10 hover:text-primary transition-all italic"
                          >
                            <Icons.refreshCw className={cn("h-4 w-4", isPending === channel.id && "animate-spin")} />
                            Sync_Node_Telemetry
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-3 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer hover:bg-white/10 hover:text-white transition-all italic"
                          >
                            <Icons.externalLink className="h-4 w-4" />
                            Global_View
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5 my-2" />
                          <DropdownMenuItem 
                            onClick={() => handleDisconnect(channel.id)}
                            disabled={isPending === channel.id}
                            className="flex items-center gap-3 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer hover:bg-red-500/10 text-red-500 transition-all italic"
                          >
                            <Icons.zapOff className="h-4 w-4" />
                            Sever_Operational_Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-10 border-y border-white/5">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">Sub_Count</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter">{(channel.subscriberCount || 0).toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">Asset_Count</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter">{(channel.videoCount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10">
                    <Button 
                      disabled={channel.isSelected || isPending === channel.id}
                      onClick={() => handleSwitch(channel.id)}
                      className={cn(
                        "w-full h-16 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all italic border",
                        channel.isSelected 
                          ? "bg-primary/10 text-primary border-primary/20 cursor-default" 
                          : "bg-white/5 text-white/60 hover:bg-white/10 border-white/10"
                      )}
                    >
                      {isPending === channel.id ? (
                        <Icons.refreshCw className="h-4 w-4 animate-spin mr-3" />
                      ) : channel.isSelected ? (
                        <Icons.shieldCheck className="h-4 w-4 mr-3" />
                      ) : (
                        <Icons.zap className="h-4 w-4 mr-3" />
                      )}
                      {channel.isSelected ? "Active_Node_Linked" : "Initialize_Handshake"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
