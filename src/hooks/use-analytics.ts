"use client"

import { useState, useEffect, useCallback } from "react"
import { getDailyStatsAction } from "@/app/dashboard/actions"
import { toast } from "sonner"

export interface DailyStat {
  date: string
  views: number | string | null
  likes: number | string | null
}

export function useAnalytics(days = 7) {
  const [data, setData] = useState<DailyStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const stats = await getDailyStatsAction(days)
      setData(stats as unknown as DailyStat[])
    } catch {
      toast.error("Status update failure")
      setError("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }, [days])

  useEffect(() => {
    // Already loading by default on mount, so skip synchronous setState
    const timeoutId = setTimeout(() => {
      loadData(false)
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [loadData])

  return {
    data,
    isLoading,
    error,
    refresh: loadData
  }
}
