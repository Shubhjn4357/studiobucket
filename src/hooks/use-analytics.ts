"use client"

import { useState, useEffect } from "react"
import { getDailyStatsAction } from "@/app/dashboard/actions"

export interface DailyStat {
  date: string
  views: number | string | null
  likes: number | string | null
}

export function useAnalytics(days = 7) {
  const [data, setData] = useState<DailyStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const stats = await getDailyStatsAction(days)
      // stats is returned as an array of objects with string keys from Drizzle
      setData(stats as unknown as DailyStat[])
    } catch (err) {
      setError("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [days])

  return {
    data,
    isLoading,
    error,
    refresh: loadData
  }
}
