"use client"

import * as React from "react"
import { useNotifications } from "@/hooks/use-notifications"
import { useScheduler } from "@/hooks/use-scheduler"
import { useDownload } from "@/hooks/use-download"
import { useEngine } from "@/hooks/use-engine"
import { usePayments } from "@/hooks/use-payments"
import { useAnalytics } from "@/hooks/use-analytics"
import { useQueue } from "@/hooks/use-queue"

interface ServiceContextType {
  notifications: ReturnType<typeof useNotifications>
  scheduler: ReturnType<typeof useScheduler>
  download: ReturnType<typeof useDownload>
  engine: ReturnType<typeof useEngine>
  payments: ReturnType<typeof usePayments>
  analytics: ReturnType<typeof useAnalytics>
  queue: ReturnType<typeof useQueue>
}

const ServiceContext = React.createContext<ServiceContextType | undefined>(undefined)

export function GlobalServiceProvider({ children }: { children: React.ReactNode }) {
  const notifications = useNotifications()
  const scheduler = useScheduler()
  const download = useDownload()
  const engine = useEngine()
  const payments = usePayments()
  const analytics = useAnalytics()
  const queue = useQueue("studio-queue")

  return (
    <ServiceContext.Provider value={{ notifications, scheduler, download, engine, payments, analytics, queue }}>
      {children}
    </ServiceContext.Provider>
  )
}

export const useServices = () => {
  const context = React.useContext(ServiceContext)
  if (context === undefined) {
    throw new Error("useServices must be used within a GlobalServiceProvider")
  }
  return context
}
