"use client"

import { useState, useSyncExternalStore } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Footer } from "@/components/dashboard/footer"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

import { Icons } from "@/components/ui/icons"

interface NavigationItem {
  title: string
  href: string
  icon: keyof typeof Icons
}

interface DashboardShellProps {
  children: React.ReactNode
  navigationItems: readonly NavigationItem[]
}

const subscribe = (callback: () => void) => {
  window.addEventListener("resize", callback)
  return () => window.removeEventListener("resize", callback)
}

const getSnapshot = () => window.innerWidth < 1024
const getServerSnapshot = () => false

export function DashboardShell({ children, navigationItems }: DashboardShellProps) {
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  // Sync sidebar state with mobile state change
  const [prevIsMobile, setPrevIsMobile] = useState(isMobile)
  if (isMobile !== prevIsMobile) {
    setPrevIsMobile(isMobile)
    setSidebarOpen(!isMobile)
  }

  // Adjust state during render if pathname changed
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={navigationItems}
        isMobile={isMobile}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar bg-surface/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="mx-auto max-w-(--breakpoint-2xl) space-y-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <Footer />
        </main>

        {/* Overlay for mobile sidebar */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
