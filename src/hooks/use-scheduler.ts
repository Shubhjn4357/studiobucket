"use client"

import { useState } from "react"
import { toast } from "sonner"

export interface ScheduledTask {
  id: string
  title: string
  scheduledAt: Date
  status: "pending" | "executing" | "completed" | "failed"
}

export function useScheduler() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const scheduleTask = async (task: Omit<ScheduledTask, "id" | "status">) => {
    setIsLoading(true)
    try {
      // In a real app, this would be a server action
      const newTask: ScheduledTask = {
        ...task,
        id: crypto.randomUUID(),
        status: "pending"
      }
      setTasks(prev => [...prev, newTask])
      toast.success("Task scheduled successfully")
      return newTask.id
    } catch {
      toast.error("Failed to schedule task")
    } finally {
      setIsLoading(false)
    }
  }

  const cancelTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    toast.info("Task cancelled")
  }

  return {
    tasks,
    isLoading,
    scheduleTask,
    cancelTask
  }
}
