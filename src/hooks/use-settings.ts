"use client"

import { useState } from "react"
import { switchChannelAction } from "@/app/dashboard/actions"
import { toast } from "sonner"

export function useSettings() {
  const [isUpdating, setIsUpdating] = useState(false)

  const switchChannel = async (channelId: string) => {
    setIsUpdating(true)
    try {
      await switchChannelAction(channelId)
      toast.success("Channel switched successfully")
    } catch {
      toast.error("Failed to switch channel")
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    isUpdating,
    switchChannel,
  }
}
