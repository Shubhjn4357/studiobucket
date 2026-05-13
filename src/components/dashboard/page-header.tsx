"use client"

import { Icons } from "@/components/ui/icons"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: string
  description: string
  icon: LucideIcon
  children?: React.ReactNode
}

export function PageHeader({ title, description, icon: Icon, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-card border border-border rounded-2xl shadow-sm relative overflow-hidden mb-8">
      <div className="flex items-center gap-6 relative z-10">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground font-medium">{description}</p>
        </div>
      </div>
      
      {children && (
        <div className="relative z-10 flex items-center gap-4">
          {children}
        </div>
      )}
    </div>
  )
}
