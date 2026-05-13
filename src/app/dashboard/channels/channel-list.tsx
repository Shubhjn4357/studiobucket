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
import { Card, CardContent } from "@/components/ui/card"

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
      toast.success("Active channel switched")
    } catch {
      toast.error("Failed to switch channel")
    } finally {
      setIsPending(null)
    }
  }

  const handleSync = async (id: string) => {
    setIsPending(id)
    try {
      await syncChannelAction(id)
      toast.success("Channel data synchronized")
    } catch {
      toast.error("Sync failed")
    } finally {
      setIsPending(null)
    }
  }

  const handleDisconnect = async (id: string) => {
    setIsPending(id)
    try {
      await disconnectChannelAction(id)
      setChannels(prev => prev.filter(ch => ch.id !== id))
      toast.success("Channel disconnected")
    } catch {
      toast.error("Disconnection failed")
    } finally {
      setIsPending(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {channels.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 text-center bg-card border border-dashed border-border rounded-[2.5rem]"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="h-16 w-16 rounded-3xl bg-muted flex items-center justify-center">
                <Icons.users className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">No channels connected yet</p>
            </div>
          </motion.div>
        ) : (
          channels.map((channel, i) => (
            <motion.div
              key={channel.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className={cn(
                "bg-card border-border overflow-hidden group hover:border-primary/20 transition-all rounded-[2.5rem] shadow-sm relative h-full flex flex-col",
                channel.isSelected && "border-primary/40 shadow-lg shadow-primary/5"
              )}>
                <CardContent className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <Avatar className={cn(
                            "h-16 w-16 rounded-2xl border-2 transition-all",
                            channel.isSelected ? "border-primary shadow-lg shadow-primary/20" : "border-border"
                          )}>
                            <AvatarImage src={channel.thumbnailUrl || ""} className="object-cover" />
                            <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                              {(channel.channelName || "U")[0]}
                            </AvatarFallback>
                          </Avatar>
                          {channel.isActive && (
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-card rounded-full border border-border flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{channel.channelName || "Unnamed Channel"}</h3>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-muted-foreground opacity-60 font-mono tracking-tighter">{channel.channelId.slice(0, 16)}...</span>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted transition-all">
                            <Icons.moreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border">
                          <DropdownMenuItem 
                            onClick={() => handleSync(channel.id)}
                            disabled={isPending === channel.id}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all"
                          >
                            <Icons.refreshCw className={cn("h-4 w-4", isPending === channel.id && "animate-spin")} />
                            Sync Data
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all"
                          >
                            <Icons.externalLink className="h-4 w-4" />
                            Open on YouTube
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-2" />
                          <DropdownMenuItem 
                            onClick={() => handleDisconnect(channel.id)}
                            disabled={isPending === channel.id}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer hover:bg-destructive/10 text-destructive transition-all"
                          >
                            <Icons.zapOff className="h-4 w-4" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-border/50">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subscribers</p>
                        <p className="text-xl font-black text-foreground italic tracking-tighter">{(channel.subscriberCount || 0).toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Videos</p>
                        <p className="text-xl font-black text-foreground italic tracking-tighter">{(channel.videoCount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button 
                      disabled={channel.isSelected || isPending === channel.id}
                      onClick={() => handleSwitch(channel.id)}
                      className={cn(
                        "w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic shadow-md",
                        channel.isSelected 
                          ? "bg-primary/10 text-primary hover:bg-primary/20 shadow-none border border-primary/20" 
                          : "bg-primary text-white hover:scale-[1.02]"
                      )}
                    >
                      {isPending === channel.id ? (
                        <Icons.refreshCw className="h-4 w-4 animate-spin mr-3" />
                      ) : channel.isSelected ? (
                        <Icons.shieldCheck className="h-4 w-4 mr-3" />
                      ) : (
                        <Icons.zap className="h-4 w-4 mr-3" />
                      )}
                      {channel.isSelected ? "Active Session" : "Switch To Channel"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
