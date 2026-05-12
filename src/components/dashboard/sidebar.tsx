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
      width: isMobile ? "280px" : "260px",
      transition: { type: "spring", stiffness: 300, damping: 30 } as const
    },
    closed: { 
      width: isMobile ? "0px" : "80px",
      transition: { type: "spring", stiffness: 300, damping: 30 } as const
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={open ? "open" : "closed"}
      variants={sidebarVariants}
      className={cn(
        "z-50 flex flex-col glass-morphism h-screen transition-all overflow-hidden shrink-0 relative",
        isMobile ? "fixed inset-y-0 left-0" : "relative border-r"
      )}
    >
      {/* Structural Grid Overlay */}
      <div className="absolute inset-0 industrial-grid pointer-events-none opacity-5" />

      {/* Header Area */}
      <div className="flex h-16 items-center px-4 border-b border-white/5 relative z-10 shrink-0">
         <div className="flex items-center gap-3 group cursor-pointer w-full overflow-hidden">
            <div className="hud-border p-1.5 bg-primary/10 transition-all duration-500 group-hover:bg-primary/20 shrink-0">
               <Icons.logo className="h-5 w-5 text-primary" />
            </div>
            <AnimatePresence mode="wait">
              {(open || isMobile) && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col leading-none whitespace-nowrap"
                >
                  <span className="text-sm font-black tracking-tighter italic text-foreground uppercase">StudioBucket</span>
                  <span className="text-[7px] font-bold tracking-[0.4em] uppercase text-primary opacity-60">Control_Deck</span>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>

      <ScrollArea className="flex-1 py-6 px-3 custom-scrollbar relative z-10">
        <nav className="space-y-1.5">
          <div className="px-3 mb-4 h-4 flex items-center">
             <AnimatePresence>
                {(open || isMobile) && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 0.3 }}
                    className="text-[8px] font-mono font-black uppercase tracking-[0.3em] italic"
                  >
                    System_Matrix
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
                  "flex items-center gap-4 rounded-lg transition-all px-3 py-2.5 group relative overflow-hidden",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(255,0,0,0.05)]" 
                    : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 } as const}
                  />
                )}
                
                <div className="flex h-5 w-5 items-center justify-center shrink-0 relative">
                  <Icon className={cn(
                    "h-4.5 w-4.5 transition-all duration-300", 
                    isActive ? "text-primary scale-110" : "opacity-40 group-hover:opacity-100"
                  )} />
                </div>
                
                <AnimatePresence mode="wait">
                  {(open || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={cn(
                        "text-hud whitespace-nowrap transition-colors italic",
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
      <div className="p-4 border-t border-white/5 relative z-10 shrink-0">
         <AnimatePresence>
           {(open || isMobile) ? (
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="space-y-3"
             >
                <div className="flex items-center justify-between">
                   <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] italic">Stability</span>
                   <div className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                      <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] italic">Operational</span>
                   </div>
                </div>
                <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-primary/40"
                     animate={{ width: ["85%", "92%", "88%"] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   />
                </div>
             </motion.div>
           ) : (
             <div className="flex justify-center">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             </div>
           )}
         </AnimatePresence>
      </div>
    </motion.aside>
  )
}

