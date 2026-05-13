"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  open: boolean
  isMobile?: boolean
  onClose?: () => void
  items: readonly {
    title: string
    href: string
    icon: keyof typeof Icons
  }[]
}

export function Sidebar({ open, isMobile, items }: SidebarProps) {
  const pathname = usePathname()

  const sidebarVariants = {
    open: { 
      width: isMobile ? "240px" : "200px",
      transition: { type: "spring", stiffness: 400, damping: 40 } as const
    },
    closed: { 
      width: isMobile ? "0px" : "60px",
      transition: { type: "spring", stiffness: 400, damping: 40 } as const
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={open ? "open" : "closed"}
      variants={sidebarVariants}
      className={cn(
        "z-50 flex flex-col bg-background h-screen transition-all overflow-hidden shrink-0 relative",
        isMobile ? "fixed inset-y-0 left-0" : "relative border-r border-border"
      )}
    >
      <div className="absolute inset-0 tactical-grid pointer-events-none opacity-5" />

      {/* Header Area */}
      <div className="flex h-10 items-center px-3 border-b border-border relative z-10 shrink-0">
         <div className="flex items-center gap-2 group cursor-pointer w-full overflow-hidden">
            <div className="p-1 bg-primary/10 rounded-sm shrink-0">
               <Icons.logo className="h-4 w-4 text-primary" />
            </div>
            <AnimatePresence mode="wait">
              {(open || isMobile) && (
                <motion.div 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="flex flex-col leading-none whitespace-nowrap"
                >
                  <span className="text-xs font-bold text-foreground">StudioBucket</span>
                  <span className="text-[10px] font-medium text-primary/70">Creator Studio</span>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>

      <ScrollArea className="flex-1 py-4 px-2 custom-scrollbar relative z-10">
        <nav className="space-y-1">
          <div className="px-2 mb-2 h-3 flex items-center">
             <AnimatePresence>
                {(open || isMobile) && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 0.3 }}
                    className="text-[7px] font-black uppercase tracking-[0.3em] italic"
                  >
                    Menu
                  </motion.span>
                )}
             </AnimatePresence>
          </div>
          {items.map((item) => {
            const Icon = Icons[item.icon]
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-sm transition-all px-2 py-1.5 group relative overflow-hidden",
                  isActive 
                    ? "bg-primary/5 text-primary" 
                    : "hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex h-4 w-4 items-center justify-center shrink-0 relative">
                  <Icon className={cn(
                    "h-3 w-3 transition-all duration-300", 
                    isActive ? "text-primary" : "opacity-40 group-hover:opacity-100"
                  )} />
                </div>
                
                <AnimatePresence mode="wait">
                  {(open || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className={cn(
                        "text-[9px] font-black whitespace-nowrap transition-colors italic uppercase",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}
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

      {/* Footer / System Status */}
      <div className="p-3 border-t border-border relative z-10 shrink-0 bg-muted/10">
         <AnimatePresence>
           {(open || isMobile) ? (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-2"
             >
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Status</span>
                   <div className="flex items-center gap-1">
                     <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[10px] font-bold text-green-500 uppercase tracking-tight">Online</span>
                   </div>
                </div>
                <div className="h-0.5 w-full bg-muted rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-primary/40"
                     animate={{ width: ["85%", "92%", "88%"] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   />
                </div>
             </motion.div>
           ) : (
             <div className="flex justify-center">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
             </div>
           )}
         </AnimatePresence>
      </div>
    </motion.aside>
  )
}

