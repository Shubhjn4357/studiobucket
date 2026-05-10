"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Footer } from "@/components/dashboard/footer"
import { NAVIGATION_ITEMS } from "@/constants/route.constant"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 0)
    const checkMobile = () => {
      const isWindowMobile = window.innerWidth < 768
      setTimeout(() => {
        setIsMobile(prev => {
          if (prev !== isWindowMobile) return isWindowMobile
          return prev
        })
        // eslint-disable-next-line
        setSidebarOpen(prev => {
          if (isWindowMobile && prev) return false
          if (!isWindowMobile && !prev) return true
          return prev
        })
      }, 0)
    }
    setTimeout(() => checkMobile(), 0)
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) setTimeout(() => setSidebarOpen(false), 0)
  }, [pathname, isMobile])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={NAVIGATION_ITEMS}
        isMobile={isMobile}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto max-w-(--breakpoint-2xl) space-y-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <Footer />
        </main>

        {/* Overlay for mobile sidebar */}
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </div>
    </div>
  )
}
