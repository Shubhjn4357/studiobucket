"use client"

import { useState } from "react"
import { getJobStatusAction } from "@/app/dashboard/studio/actions"

export interface JobStatus {
  id: string
  status: "active" | "completed" | "failed" | "delayed" | "waiting"
  progress: number
  result?: unknown
  error?: string
}

export function useQueue(queueName: string) {
  const [jobs, setJobs] = useState<JobStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchStatus = async (jobIds: string[]) => {
    try {
      const statuses = await Promise.all(
        jobIds.map(async (id) => {
          const res = await getJobStatusAction(queueName, id)
          return { id, ...res } as JobStatus
        })
      )
      setJobs(statuses)
    } catch (_err) {
      console.error("Failed to fetch queue status:", _err)
    } finally {
      setIsLoading(false)
    }
  }

  const trackJob = (jobId: string) => {
    setJobs(prev => {
      if (prev.find(j => j.id === jobId)) return prev
      return [...prev, { id: jobId, status: "waiting", progress: 0 }]
    })
  }

  return {
    jobs,
    isLoading,
    fetchStatus,
    trackJob,
  }
}
