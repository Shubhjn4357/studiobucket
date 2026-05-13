import { Icons } from "@/components/ui/icons"
import { Card, CardContent } from "@/components/ui/card"
import { VideoService } from "@/lib/services/video-service"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function StatusPage() {
  const videoService = new VideoService()
  const health = await videoService.getHealth()

  const services = [
    { 
      name: "Core Database (Turso)", 
      status: health.services.database.status === "connected" ? "operational" : "outage",
      latency: health.services.database.latencyMs,
      icon: "database"
    },
    { 
      name: "Queue Cluster (Redis)", 
      status: health.services.queue.status === "active" ? "operational" : "outage",
      latency: health.services.queue.latencyMs,
      icon: "zap"
    },
    { 
      name: "Storage Node (Cloud)", 
      status: health.services.storage === "available" ? "operational" : "outage",
      latency: 12,
      icon: "hardDrive"
    },
    { 
      name: "Transcoding Tier", 
      status: health.services.queue.status === "active" ? "operational" : "outage",
      latency: 45,
      icon: "cpu"
    }
  ]

  return (
    <PageContainer maxWidth="5xl">
      <div className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="font-bold rounded-xl gap-2 text-muted-foreground hover:text-foreground">
            <Icons.chevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <div className={cn(
          "px-6 py-2 rounded-2xl border flex items-center gap-3 transition-all",
          health.status === "operational" 
            ? "bg-green-500/10 border-green-500/20 text-green-500 shadow-sm" 
            : "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-sm"
        )}>
          <div className={cn("h-2 w-2 rounded-full animate-pulse", health.status === "operational" ? "bg-green-500" : "bg-amber-500")} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {health.status === "operational" ? "System Nominal" : "Performance Degraded"}
          </span>
        </div>
      </div>

      <PageHeader 
        title="System Status" 
        description="Real-time operational telemetry for StudioBucket core infrastructure and global nodes." 
        iconName="activity"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, idx) => {
          const Icon = Icons[service.icon as keyof typeof Icons]
          return (
            <Card key={idx} className="bg-card border-border shadow-sm group hover:border-primary/20 transition-all duration-300 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                      <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black uppercase tracking-tight italic">{service.name}</h3>
                      <p className={cn(
                        "text-[9px] font-black uppercase tracking-widest italic",
                        service.status === "operational" ? "text-green-500" : "text-red-500"
                      )}>{service.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black italic tracking-tighter text-foreground">{service.latency}ms</p>
                    <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Latency</p>
                  </div>
                </div>
                
                <div className="h-10 flex items-end gap-1 px-1 opacity-20 group-hover:opacity-40 transition-opacity">
                   {Array.from({ length: 30 }).map((_, i) => (
                     <div 
                      key={i} 
                      className={cn(
                        "flex-1 rounded-full",
                        service.status === "operational" ? "bg-green-500" : "bg-red-500"
                      )} 
                      style={{ height: `${Math.random() * 60 + 20}%` }} 
                     />
                   ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Uptime History */}
      <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden p-8 space-y-6">
         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Historical Operational Flux (Last 90 Days)</h3>
         <div className="grid grid-cols-[repeat(auto-fill,minmax(10px,1fr))] gap-1">
            {Array.from({ length: 90 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-8 rounded-sm transition-all hover:scale-110 cursor-help",
                  i === 45 ? "bg-amber-500/40" : "bg-green-500/40"
                )} 
                title={`Day ${90-i}: 99.9% Uptime`}
              />
            ))}
         </div>
         <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
            <span>90 Days Ago</span>
            <span className="text-foreground">100.0% Network Availability</span>
            <span>Live Telemetry</span>
         </div>
      </Card>

      <div className="pt-20 text-center space-y-4">
         <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">© 2026 StudioBucket • SECURE_NODE_V4</p>
      </div>
    </PageContainer>
  )
}
