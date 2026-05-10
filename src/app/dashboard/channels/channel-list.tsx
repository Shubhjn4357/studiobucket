"use client"

import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { switchChannelAction } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { useState } from "react"

interface Channel {
  id: string
  channelName: string
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
      toast.success("Channel switched successfully")
    } catch {
      toast.error("Failed to switch channel")
    } finally {
      setIsPending(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {channels.length === 0 ? (
        <div className="col-span-full py-32 text-center border-2 border-dashed border-border rounded-3xl">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Icons.users className="h-8 w-8 text-slate-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No channels linked to this account</p>
            <Button variant="outline" className="h-9 rounded-xl border-border bg-muted/50 text-[9px] font-black uppercase tracking-widest">
              Connect YouTube
            </Button>
          </div>
        </div>
      ) : (
        channels.map((channel) => (
          <Card key={channel.id} className={cn(
            "cyber-card border-border bg-card/50 overflow-hidden group transition-all duration-500",
            channel.isSelected ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" : "hover:border-primary/30"
          )}>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className={cn(
                    "h-14 w-14 rounded-2xl border-2 transition-colors",
                    channel.isSelected ? "border-primary" : "border-border group-hover:border-primary/50"
                  )}>
                    <AvatarImage src={channel.thumbnailUrl || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">
                      {channel.channelName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight italic">{channel.channelName}</h3>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{channel.channelId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {channel.isSelected && (
                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-1 rounded-md">Active</span>
                  )}
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    channel.isActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-red-500"
                  )} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Subscribers</p>
                  <p className="text-sm font-black text-foreground italic">{(channel.subscriberCount || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Videos</p>
                  <p className="text-sm font-black text-foreground italic">{(channel.videoCount || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  disabled={channel.isSelected || isPending === channel.id}
                  onClick={() => handleSwitch(channel.id)}
                  variant={channel.isSelected ? "secondary" : "outline"}
                  className="flex-1 h-9 rounded-xl border-border bg-muted/30 text-[9px] font-black uppercase tracking-widest hover:bg-muted transition-all"
                >
                  {isPending === channel.id ? (
                    <Icons.refreshCw className="h-3 w-3 animate-spin mr-2" />
                  ) : channel.isSelected ? (
                    <Icons.check className="h-3 w-3 mr-2" />
                  ) : null}
                  {channel.isSelected ? "Active Channel" : "Switch To"}
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground">
                  <Icons.settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
