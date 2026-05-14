"use client"

import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { syncAllChannelsAction } from "@/app/dashboard/actions"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ChannelActions() {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      await syncAllChannelsAction()
      toast.success("Channel status synchronized")
    } catch {
      toast.error("Channel synchronization failed")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleConnect = () => {
    signIn("google", { 
      callbackUrl: "/dashboard/channels",
    })
  }

  return (
    <div className="flex items-center gap-6 relative z-10">
      <Button 
        onClick={handleSyncAll}
        disabled={isSyncing}
        variant="ghost" 
        className="hidden md:flex h-16 rounded-[1.5rem] border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] px-8 hover:bg-white/10 transition-all italic text-white/40"
      >
        <Icons.refreshCw className={cn("h-5 w-5 mr-3", isSyncing && "animate-spin")} />
        {isSyncing ? "Syncing_Fleet..." : "Sync_All_Nodes"}
      </Button>
      <Button 
        onClick={handleConnect}
        className="h-16 bg-primary text-white hover:scale-[1.05] active:scale-[0.95] rounded-[1.5rem] px-10 text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary/30 transition-all italic border border-primary/20"
      >
        <Icons.plus className="h-5 w-5 mr-3" />
        Connect_Channel
      </Button>
    </div>
  )
}
