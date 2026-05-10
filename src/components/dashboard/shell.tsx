"use client"

import { useState, useEffect } from "react"
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

export function DashboardShell({ children, navigationItems }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => {
      const isWindowMobile = window.innerWidth < 1024 // Increased breakpoint for better layout
      setIsMobile(isWindowMobile)
      if (isWindowMobile) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Adjust state during render if pathname changed (replaces the useEffect)
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
