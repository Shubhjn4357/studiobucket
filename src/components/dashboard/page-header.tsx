"use client"

import { Icons } from "@/components/ui/icons"


interface PageHeaderProps {
  title: string
  description: string
  iconName: keyof typeof Icons
  children?: React.ReactNode
}

export function PageHeader({ title, description, iconName, children }: PageHeaderProps) {
  const Icon = Icons[iconName]
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 md:p-8 bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] shadow-sm relative overflow-hidden mb-6 md:mb-10">
      <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full lg:w-auto">
        <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
          <Icon className="h-6 w-6 md:h-7 md:w-7" />
        </div>
        <div className="space-y-1 min-w-0">
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-foreground truncate">{title}</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium line-clamp-1">{description}</p>
        </div>
      </div>
      
      {children && (
        <div className="relative z-10 flex flex-wrap items-center gap-3 md:gap-4 w-full lg:w-auto pt-2 lg:pt-0">
          {children}
        </div>
      )}
    </div>
  )
}
