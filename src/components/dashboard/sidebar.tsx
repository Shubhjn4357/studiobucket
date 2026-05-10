"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ROUTES } from "@/constants/route.constant"

interface SidebarProps {
  open: boolean
  onClose: () => void
  isMobile?: boolean
  items: readonly {
    title: string
    href: string
    icon: keyof typeof Icons
  }[]
}

export function Sidebar({ open, onClose, isMobile, items }: SidebarProps) {
  const pathname = usePathname()

  const sidebarVariants = {
    open: { 
      x: 0,
      width: isMobile ? "100%" : 240,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 }
    },
    closed: { 
      x: isMobile ? -300 : 0,
      width: isMobile ? 0 : 72,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 }
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={open ? "open" : "closed"}
      variants={sidebarVariants}
      className={cn(
        "z-50 flex flex-col bg-background border-r border-border h-screen transition-all overflow-hidden shrink-0",
        isMobile ? "fixed inset-y-0 left-0 max-w-[280px]" : "relative"
      )}
    >
      {/* Header for Mobile only */}
      {isMobile && (
        <div className="flex h-14 items-center px-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
            <Icons.menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
             <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
                <Icons.logo className="h-6 w-6" />
             </div>
             <span className="font-bold text-lg tracking-tighter italic">StudioBucket</span>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 py-3 px-2 custom-scrollbar">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = Icons[item.icon]
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-6 rounded-lg transition-all px-3 py-3",
                  isActive 
                    ? "bg-secondary text-foreground" 
                    : "text-foreground hover:bg-surface-hover"
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center shrink-0">
                  <Icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-foreground")} />
                </div>
                
                <AnimatePresence mode="wait">
                  {(open || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </motion.aside>
  )
}
