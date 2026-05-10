"use client"

import Link from "next/link"
import { Icons } from "@/components/ui/icons"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function Footer() {
  const [status, setStatus] = useState<"operational" | "degraded" | "loading">("loading")

  useEffect(() => {
    fetch("/api/health")
      .then(res => res.ok ? setStatus("operational") : setStatus("degraded"))
      .catch(() => setStatus("degraded"))
  }, [])

  const navLinks = [
    { label: "Terms", href: "/legal/terms" },
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Docs", href: "/docs" },
    { label: "Status", href: "/status" }
  ]

  return (
    <footer className="mt-auto border-t border-border px-6 py-12">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-muted border border-border flex items-center justify-center">
            <Icons.logo className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] leading-none italic">StudioBucket</span>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mt-1">© 2026 Integrated Operations</span>
          </div>
        </div>

        <nav className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className="text-[9px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.3em] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === "operational" ? "bg-emerald-500 animate-pulse" :
              status === "degraded" ? "bg-red-500" : "bg-slate-500"
            )} />
            <span className="text-[8px] font-black text-foreground uppercase tracking-widest">
              {status === "operational" ? "Network Operational" : 
               status === "degraded" ? "Systems Degraded" : "Syncing Node..."}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
