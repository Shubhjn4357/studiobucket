"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUpload } from "@/providers/upload-provider"

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
  const { files, isUploading } = useUpload()

  const activeFiles = files.filter(f => f.status === "uploading" || f.status === "pending")
  const totalProgress = activeFiles.length > 0 
    ? activeFiles.reduce((acc, f) => acc + (f.progress || 0), 0) / activeFiles.length 
    : 0

  const sidebarVariants = {
    open: { 
      width: isMobile ? "260px" : "260px",
      transition: { type: "spring", stiffness: 300, damping: 30 } as const
    },
    closed: { 
      width: isMobile ? "0px" : "90px",
      transition: { type: "spring", stiffness: 300, damping: 30 } as const
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={open ? "open" : "closed"}
      variants={sidebarVariants}
      className={cn(
        "z-50 flex flex-col bg-card h-screen transition-all overflow-hidden shrink-0 relative shadow-[0_0_50px_rgba(0,0,0,0.02)]",
        isMobile ? "fixed inset-y-0 left-0" : "relative border-r border-border"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 md:h-20 items-center px-6 relative z-10 shrink-0 border-b border-border/50 bg-background/50 backdrop-blur-sm">
         <div className="flex items-center gap-4 group cursor-pointer w-full overflow-hidden">
            <div className="h-10 w-10 bg-primary rounded-[1.25rem] shrink-0 shadow-lg shadow-primary/20 transition-transform group-hover:rotate-6">
               <div className="h-full w-full flex items-center justify-center text-white">
                  <Icons.logo className="h-5 w-5" />
               </div>
            </div>
            <AnimatePresence mode="wait">
              {(open || isMobile) && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col leading-none whitespace-nowrap"
                >
                  <span className="text-base font-black text-foreground tracking-tight uppercase italic">Studio</span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Bucket</span>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>

      <ScrollArea className="flex-1 py-8 px-4 custom-scrollbar relative z-10">
        <nav className="space-y-2">
          <div className="px-3 mb-6 h-4 flex items-center">
             <AnimatePresence>
                {(open || isMobile) && (
                  <motion.span 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30"
                  >
                    Control Panel
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
                  "flex items-center gap-4 rounded-2xl transition-all px-4 py-3 group relative overflow-hidden",
                  isActive 
                    ? "bg-primary text-white shadow-xl shadow-primary/10" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex h-5 w-5 items-center justify-center shrink-0 relative">
                  <Icon className={cn(
                    "h-4.5 w-4.5 transition-all duration-300", 
                    isActive ? "text-white" : "opacity-40 group-hover:opacity-100 group-hover:text-primary"
                  )} />
                </div>
                
                <AnimatePresence mode="wait">
                  {(open || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={cn(
                        "text-xs font-bold whitespace-nowrap transition-colors",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute right-0 top-3 bottom-3 w-1 bg-white rounded-l-full"
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Global Upload Progress Monitor */}
      <div className="p-4 border-t border-border/50 relative z-10 shrink-0 bg-muted/5">
         <AnimatePresence>
            {(open || isMobile) ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 rounded-[1.5rem] bg-card border border-border/50 space-y-3 shadow-sm group"
              >
                 {isUploading || activeFiles.length > 0 ? (
                    <Link href="/dashboard/upload" className="space-y-3 block hover:opacity-80 transition-opacity">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Icons.cloudUpload className={cn("h-3.5 w-3.5 text-primary", isUploading && "animate-pulse")} />
                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                               {activeFiles.length} Uploading
                            </span>
                         </div>
                         <span className="text-[9px] font-black text-primary">{Math.round(totalProgress)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/20">
                         <motion.div 
                           className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                           initial={{ width: 0 }}
                           animate={{ width: `${totalProgress}%` }}
                           transition={{ duration: 0.5 }}
                         />
                      </div>
                    </Link>
                 ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">System Status</span>
                         <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                            <span className="text-[9px] font-black text-green-500 uppercase">Live</span>
                         </div>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden opacity-30">
                         <motion.div 
                           className="h-full bg-primary/30"
                           animate={{ width: ["60%", "90%", "75%"] }}
                           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                         />
                      </div>
                    </div>
                 )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                 {isUploading ? (
                    <Link href="/dashboard/upload" className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10 group">
                       <Icons.cloudUpload className="h-5 w-5 animate-pulse" />
                       <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-card">
                          {activeFiles.length}
                       </div>
                    </Link>
                 ) : (
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                 )}
              </div>
            )}
         </AnimatePresence>
      </div>
    </motion.aside>
  )
}
