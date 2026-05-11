"use client"

import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { syncAllChannelsAction } from "@/app/dashboard/actions"
import { useState } from "react"
import { toast } from "sonner"

export function ChannelActions() {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      await syncAllChannelsAction()
      toast.success("All nodes synchronized")
    } catch (err) {
      toast.error("Synchronization failed")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleConnect = () => {
    signIn("google", { 
      callbackUrl: "/dashboard/channels",
      // These scopes are already defined in auth/config.ts but repeating here just in case for clarity
    })
  }

  return (
    <div className="flex items-center gap-3">
      <Button 
        onClick={handleSyncAll}
        disabled={isSyncing}
        variant="outline" 
        className="h-11 rounded-xl border-border bg-muted/50 text-[10px] font-black uppercase tracking-widest px-6"
      >
        <Icons.refreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
        {isSyncing ? "Syncing..." : "Sync All"}
      </Button>
      <Button 
        onClick={handleConnect}
        className="h-11 bg-primary text-white hover:opacity-90 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
      >
        <Icons.plus className="h-4 w-4 mr-2" />
        Connect Channel
      </Button>
    </div>
  )
}

import { cn } from "@/lib/utils"
