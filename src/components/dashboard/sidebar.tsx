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
  items: readonly {
    title: string
    href: string
    icon: keyof typeof Icons
  }[]
}

export function Sidebar({ open, onClose, items }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : -300,
          width: open ? 280 : 80,
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card/80 backdrop-blur-2xl lg:static lg:translate-x-0 border-r border-border transition-all duration-500 ease-in-out overflow-hidden"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-border">
          <Link href={ROUTES.dashboard} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-linear-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-500" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border group-hover:border-primary/50 transition-colors">
                <Icons.logo className="h-6 w-6 text-primary group-hover:text-foreground transition-colors" />
              </div>
            </div>
            <AnimatePresence mode="wait">
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-lg font-black tracking-tighter text-foreground uppercase italic"
                >
                  Studio<span className="text-primary">Bucket</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {open && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Icons.x className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-8 px-4 custom-scrollbar">
          <nav className="space-y-1.5">
            {items.map((item) => {
              const Icon = Icons[item.icon]
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300",
                    isActive
                      ? "bg-primary/5 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20 shadow-[0_0_20px_-5px_rgba(255,0,0,0.1)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 font-black",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-muted group-hover:bg-muted-foreground/10 text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-transform duration-300", !isActive && "group-hover:scale-110")} />
                  </div>

                  <AnimatePresence mode="wait">
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="relative text-[10px] font-black uppercase tracking-widest"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isActive && open && (
                    <motion.div
                      layoutId="active-dot"
                      className="relative ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Footer info removed as per request */}
      </motion.aside>
    </>
  )
}
