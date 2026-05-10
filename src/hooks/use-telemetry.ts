"use client"

import { useEffect, useState } from "react"

export interface TelemetryData {
  id: string
  status: string
  progress: number
  result?: unknown
  error?: string
}

export function useTelemetry(jobId: string | null) {
  const [data, setData] = useState<TelemetryData | null>(null)

  useEffect(() => {
    if (!jobId) return

    const eventSource = new EventSource(`/api/telemetry/${jobId}`)

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data)
      setData(parsed)
      
      if (parsed.status === "completed" || parsed.status === "failed") {
        eventSource.close()
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [jobId])

  return data
}
