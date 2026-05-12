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
      width: isMobile ? "100%" : 280,
      transition: { type: "spring" as const, stiffness: 400, damping: 40 }
    },
    closed: { 
      x: isMobile ? -300 : 0,
      width: isMobile ? 0 : 100,
      transition: { type: "spring" as const, stiffness: 400, damping: 40 }
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={open ? "open" : "closed"}
      variants={sidebarVariants}
      className={cn(
        "z-50 flex flex-col backdrop-blur-3xl bg-black/60 border-r border-white/5 h-screen transition-all overflow-hidden shrink-0 shadow-2xl relative",
        isMobile ? "fixed inset-y-0 left-0 max-w-[320px]" : "relative"
      )}
    >
      {/* Structural Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none opacity-20" />

      {/* Header Area */}
      <div className="flex h-24 items-center px-8 border-b border-white/5 relative z-10">
         <div className="flex items-center gap-4 group cursor-pointer">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-105 transition-transform duration-500">
               <Icons.logo className="h-6 w-6 text-white" />
            </div>
            {(open || isMobile) && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col leading-none"
              >
                <span className="text-xl font-black tracking-tighter italic text-white uppercase">StudioBucket</span>
                <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-primary opacity-60">System_Node_01</span>
              </motion.div>
            )}
         </div>
      </div>

      <ScrollArea className="flex-1 py-10 px-4 custom-scrollbar relative z-10">
        <nav className="space-y-4">
          <div className="px-4 mb-6">
             <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">Navigation_Matrix</span>
          </div>
          {items.map((item) => {
            const Icon = Icons[item.icon]
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-6 rounded-2xl transition-all px-4 py-4 group relative overflow-hidden",
                  isActive 
                    ? "bg-white/[0.03] border border-white/5 shadow-xl" 
                    : "hover:bg-white/[0.02] border border-transparent hover:border-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.8)]"
                  />
                )}
                
                <div className="flex h-6 w-6 items-center justify-center shrink-0 relative">
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-500", 
                    isActive ? "text-primary scale-110" : "text-white/40 group-hover:text-white"
                  )} />
                </div>
                
                <AnimatePresence mode="wait">
                  {(open || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={cn(
                        "text-[11px] font-black uppercase tracking-[0.2em] italic whitespace-nowrap transition-colors",
                        isActive ? "text-white" : "text-white/40 group-hover:text-white"
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
      {(open || isMobile) && (
        <div className="p-8 border-t border-white/5 bg-black/20 relative z-10">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Core_Stability</span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Nominal</span>
           </div>
           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500"
                animate={{ width: ["90%", "95%", "92%"] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
           </div>
        </div>
      )}
    </motion.aside>
  )
}
