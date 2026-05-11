"use client"

import { useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { YouTubeContentClient } from "./youtube-content-client"

interface ContentManagerClientProps {
  localContent: React.ReactNode
}

export function ContentManagerClient({ localContent }: ContentManagerClientProps) {
  const [activeTab, setActiveTab] = useState<"local" | "youtube">("local")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-1 bg-muted/30 border border-border rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("local")}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === "local" 
              ? "bg-primary text-white shadow-lg shadow-primary/20" 
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <Icons.folder className="h-3 w-3" />
          Local Assets
        </button>
        <button
          onClick={() => setActiveTab("youtube")}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === "youtube" 
              ? "bg-primary text-white shadow-lg shadow-primary/20" 
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <Icons.youtube className="h-3 w-3" />
          YouTube Live
        </button>
      </div>

      <div className="transition-all duration-500">
        {activeTab === "local" ? localContent : <YouTubeContentClient />}
      </div>
    </div>
  )
}
