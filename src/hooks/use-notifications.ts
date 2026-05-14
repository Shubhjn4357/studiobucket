"use client"

import { useState } from "react"
import { toast } from "sonner"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notif: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotif: Notification = {
      ...notif,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotif, ...prev])
    
    // Show toast for high priority
    if (newNotif.type === "error") toast.error(newNotif.message)
    if (newNotif.type === "success") toast.success(newNotif.message)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const clearAll = () => setNotifications([])

  return {
    notifications,
    addNotification,
    markAsRead,
    clearAll
  }
}
