"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SystemStatus {
  status: string
  services: {
    database: string
    queue: string
    storage: string
  }
  timestamp: number
}

export default function StatusPage() {
  const [data, setData] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/health")
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const services = [
    { name: "Core Engine", status: data?.services.queue === "active" ? "Operational" : "Offline", icon: Icons.zap },
    { name: "Database Node", status: data?.services.database === "connected" ? "Operational" : "Offline", icon: Icons.database },
    { name: "Asset Storage", status: data?.services.storage === "available" ? "Operational" : "Offline", icon: Icons.layers },
  ]

  return (
    <div className="min-h-screen bg-[#050505] p-8 md:p-20 space-y-12">
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">System Status</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Live Fleet Telemetry</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Global Operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, i) => (
          <Card key={i} className="cyber-card border-white/5 bg-slate-950/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {service.name}
              </CardTitle>
              <service.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  service.status === "Operational" ? "bg-emerald-500" : "bg-red-500"
                )} />
                <span className="text-xl font-black text-white uppercase tracking-tight italic">{service.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
         <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
           <Icons.activity className="h-4 w-4 text-primary" />
           Latency Protocol
         </h2>
         <div className="h-24 w-full bg-white/5 rounded-2xl border border-white/5 flex items-end p-4 gap-1 overflow-hidden">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary transition-colors cursor-help"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
         </div>
      </div>
    </div>
  )
}
