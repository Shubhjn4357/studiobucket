"use client"

import { useState } from "react"
import { createCheckoutSession, createPortalSession } from "@/app/dashboard/settings/actions"
import { toast } from "sonner"

export function usePayments() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscription = async (priceId: string) => {
    setIsLoading(true)
    try {
      const { url } = await createCheckoutSession(priceId as "alpha" | "pro" | "pro-monthly" | "fleet" | "fleet-monthly")
      if (url) window.location.href = url
    } catch {
      toast.error("Failed to initiate payment")
    } finally {
      setIsLoading(false)
    }
  }

  const openPortal = async () => {
    setIsLoading(true)
    try {
      const { url } = await createPortalSession()
      if (url) window.location.href = url
    } catch {
      toast.error("Failed to open billing portal")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    handleSubscription,
    openPortal,
  }
}
