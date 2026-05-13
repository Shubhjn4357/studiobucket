import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "5xl" | "6xl" | "7xl" | "full"
}

export function PageContainer({ 
  children, 
  className, 
  maxWidth = "7xl" 
}: PageContainerProps) {
  const maxWidthClass = {
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    "full": "max-w-full"
  }[maxWidth]

  return (
    <div className={cn(
      "p-6 mx-auto space-y-8 pb-24",
      maxWidthClass,
      className
    )}>
      {children}
    </div>
  )
}
