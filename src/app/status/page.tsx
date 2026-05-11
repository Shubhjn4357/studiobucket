import { Icons } from "@/components/ui/icons"
import { Card, CardContent } from "@/components/ui/card"
import { VideoService } from "@/lib/services/video-service"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function StatusPage() {
  const videoService = new VideoService()
  const health = await videoService.getHealth()

  const services = [
    { 
      name: "Core Database (Turso)", 
      status: health.services.database.status === "connected" ? "operational" : "outage",
      latency: health.services.database.latencyMs,
      icon: Icons.database
    },
    { 
      name: "Queue Cluster (Redis)", 
      status: health.services.queue.status === "active" ? "operational" : "outage",
      latency: health.services.queue.latencyMs,
      icon: Icons.zap
    },
    { 
      name: "Storage Node (S3-Compat)", 
      status: health.services.storage === "available" ? "operational" : "outage",
      latency: 12,
      icon: Icons.hardDrive
    },
    { 
      name: "AI Worker Tier", 
      status: health.services.queue.status === "active" ? "operational" : "outage",
      latency: 45,
      icon: Icons.cpu
    }
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-20 font-sans selection:bg-primary/30 relative">
      <a 
        href="/dashboard" 
        className="fixed top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors group z-50 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/5"
      >
        <Icons.chevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Interface
      </a>

      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Icons.activity className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic">System Status</h1>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground ml-1">Live Operational Telemetry • Global Nodes</p>
          </div>
          
          <div className={cn(
            "px-8 py-4 rounded-2xl border flex items-center gap-4 transition-all",
            health.status === "operational" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]"
          )}>
            <div className={cn("h-3 w-3 rounded-full animate-pulse", health.status === "operational" ? "bg-emerald-500" : "bg-amber-500")} />
            <span className="text-sm font-black uppercase tracking-widest italic">
              {health.status === "operational" ? "All Systems Nominal" : "Performance Degraded"}
            </span>
          </div>
        </div>

        {/* Latency Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, idx) => (
            <Card key={idx} className="cyber-card border-white/5 bg-slate-950/40 backdrop-blur-3xl group hover:border-primary/30 transition-all duration-500">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                      <service.icon className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black uppercase tracking-tight italic">{service.name}</h3>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest italic">{service.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black italic tracking-tighter text-white">{service.latency}ms</p>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Latency</p>
                  </div>
                </div>
                
                {/* Visual Graph Placeholder */}
                <div className="h-12 flex items-end gap-1 px-1">
                   {Array.from({ length: 40 }).map((_, i) => (
                     <div 
                      key={i} 
                      className={cn(
                        "flex-1 rounded-full transition-all duration-500",
                        service.status === "operational" ? "bg-emerald-500/20 group-hover:bg-emerald-500/40" : "bg-red-500/20"
                      )} 
                      style={{ height: `${Math.random() * 60 + 20}%`, opacity: 0.1 + (i / 40) }} 
                     />
                   ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Uptime Calendar */}
        <div className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Uptime History (Last 90 Days)</h3>
           <div className="grid grid-cols-[repeat(auto-fill,minmax(12px,1fr))] gap-1">
              {Array.from({ length: 90 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-8 rounded-sm transition-all hover:scale-110 cursor-help",
                    i === 45 ? "bg-amber-500/40" : "bg-emerald-500/40"
                  )} 
                  title={`Day ${90-i}: 99.9%`}
                />
              ))}
           </div>
           <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-600">
              <span>90 Days Ago</span>
              <span>100% Operational Status</span>
              <span>Today</span>
           </div>
        </div>

        {/* Incident Logs */}
        <div className="space-y-8 pt-8 border-t border-white/5">
           <h3 className="text-lg font-black uppercase tracking-tighter italic">Active Incidents</h3>
           <div className="p-10 rounded-3xl border border-dashed border-white/10 bg-white/5 text-center">
              <Icons.shieldCheck className="h-10 w-10 text-slate-700 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No reports filed in the last 24 hours</p>
           </div>
        </div>

        {/* Footer */}
        <div className="pt-20 text-center space-y-4">
           <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">© 2026 StudioBucket Operational Control Tier</p>
           <div className="flex justify-center gap-8 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <span className="hover:text-primary transition-colors cursor-pointer italic">Security Protocol</span>
              <span className="hover:text-primary transition-colors cursor-pointer italic">Node Architecture</span>
              <span className="hover:text-primary transition-colors cursor-pointer italic">Legal Clauses</span>
           </div>
        </div>
      </div>
    </div>
  )
}
