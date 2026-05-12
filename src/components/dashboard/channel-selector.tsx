"use client"

import { useState, useEffect } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getChannelsAction, switchChannelAction } from "@/app/dashboard/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Channel {
  id: string
  channelName: string | null
  thumbnailUrl: string | null
  isSelected?: boolean
}

export function ChannelSelector() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const data = await getChannelsAction()
        setChannels(data as Channel[])
      } catch (error) {
        console.error("Failed to load channels:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadChannels()
  }, [])

  const handleSwitch = async (channelId: string) => {
    if (isSwitching) return
    setIsSwitching(true)
    try {
      await switchChannelAction(channelId)
      toast.success("Node Frequency Synchronized")
      // Update local state for immediate feedback
      setChannels(prev => prev.map(ch => ({
        ...ch,
        isSelected: ch.id === channelId
      })))
      router.refresh()
    } catch {
      toast.error("Frequency Shift Failed")
    } finally {
      setIsSwitching(false)
    }
  }

  const selectedChannel = channels.find(ch => ch.isSelected)

  if (isLoading) {
    return (
      <div className="h-9 w-32 bg-muted/20 animate-pulse rounded-full border border-border" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-10 px-3 rounded-full border border-border bg-surface/50 hover:bg-surface-hover flex items-center gap-2 transition-all group"
        >
          {selectedChannel ? (
            <>
              <Avatar className="h-6 w-6 border border-white/10">
                <AvatarImage src={selectedChannel.thumbnailUrl || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                  {selectedChannel.channelName?.[0] || "C"}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground max-w-[100px] truncate group-hover:text-primary transition-colors">
                {selectedChannel.channelName}
              </span>
              <Icons.chevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-all" />
            </>
          ) : (
            <>
              <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <Icons.alertCircle className="h-3 w-3 text-red-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                No Node
              </span>
              <Icons.chevronDown className="h-3 w-3 text-red-500" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 backdrop-blur-3xl bg-black/80 border-white/10 rounded-2xl p-2 shadow-2xl">
        <DropdownMenuLabel className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] px-3 py-2 italic">Active Transmitters</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar py-1">
          {channels.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-30 italic">No channels linked</p>
              <Button 
                variant="link" 
                onClick={() => router.push("/dashboard/settings")}
                className="text-primary text-[10px] font-black uppercase p-0 h-auto mt-1"
              >
                Add Node
              </Button>
            </div>
          ) : (
            channels.map((channel) => (
              <DropdownMenuItem
                key={channel.id}
                onClick={() => handleSwitch(channel.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1",
                  channel.isSelected ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-muted-foreground hover:text-white"
                )}
              >
                <Avatar className="h-8 w-8 border border-white/5">
                  <AvatarImage src={channel.thumbnailUrl || ""} />
                  <AvatarFallback className="bg-white/5 text-[12px] font-bold">
                    {channel.channelName?.[0] || "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-tight italic truncate">
                    {channel.channelName}
                  </span>
                  {channel.isSelected && (
                    <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5">Active Protocol</span>
                  )}
                </div>
                {channel.isSelected && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_#ff0000]" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem 
          onClick={() => router.push("/dashboard/settings")}
          className="gap-3 p-3 rounded-xl cursor-pointer text-muted-foreground hover:text-white hover:bg-white/5 transition-all mt-1"
        >
          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
            <Icons.settings className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest italic">Node Management</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
