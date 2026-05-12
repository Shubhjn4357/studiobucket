import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { 
  LatestVideoSection, 
  AnalyticsSection, 
  QueueSection, 
  InsightsSection 
} from "@/components/dashboard/sections"
import { VideoCardSkeleton, StatsSkeleton, ListSkeleton } from "@/components/ui/skeleton-loader"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const userName = session.user.name || "Commander"

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Background Ambience Node */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Dynamic Welcome Section (The Briefing) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-none shadow-2xl relative overflow-hidden">
        {/* Scanned Data Pattern */}
        <div className="absolute inset-0 industrial-grid pointer-events-none opacity-5" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
             <span className="text-hud text-emerald-500 tracking-[0.3em]">SYSTEM_AUTHORIZED</span>
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic leading-none">WELCOME_BACK, {userName}</h1>
            <p className="text-hud text-white/30 tracking-[0.2em]">TELEMETRY_SYNC_COMPLETE // MONITORING_OPERATIONS</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
           <div className="hidden lg:flex flex-col items-end mr-4 pr-4 border-r border-white/10">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-0.5">SESSION_ID</span>
              <span className="text-[10px] font-mono font-black text-white italic">SB-041288-02</span>
           </div>
           <Link href="/dashboard/upload">
             <Button className="h-10 rounded-none bg-primary text-white hover:bg-primary/90 px-6 font-black uppercase tracking-[0.1em] italic border border-primary/20 group">
               <Icons.plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-500" />
               INJEST_ASSET
             </Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content Area (Operational Core) */}
        <div className="xl:col-span-8 space-y-6">
          <section className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.05))] " />
                <h2 className="text-hud text-white/20 tracking-[0.4em]">LATEST_OPERATIONAL_ASSET</h2>
                <div className="h-px flex-1 bg-[linear-gradient(to_left,transparent,rgba(255,255,255,0.05))] " />
             </div>
             <Suspense fallback={<VideoCardSkeleton />}>
                <LatestVideoSection userId={session.user.id} />
             </Suspense>
          </section>

          <section className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.05))] " />
                <h2 className="text-hud text-white/20 tracking-[0.4em]">TEMPORAL_PERFORMANCE_METRICS</h2>
                <div className="h-px flex-1 bg-[linear-gradient(to_left,transparent,rgba(255,255,255,0.05))] " />
             </div>
             <Suspense fallback={<StatsSkeleton />}>
                <AnalyticsSection userId={session.user.id} />
             </Suspense>
          </section>
        </div>

        {/* Sidebar Area (Secondary Telemetry) */}
        <div className="xl:col-span-4 space-y-6">
           <section className="space-y-4">
              <div className="flex items-center gap-4">
                 <h2 className="text-hud text-white/20 tracking-[0.4em]">LOGIC_QUEUE_STATUS</h2>
                 <div className="h-px flex-1 bg-[linear-gradient(to_left,transparent,rgba(255,255,255,0.05))] " />
              </div>
              <Suspense fallback={<ListSkeleton />}>
                 <QueueSection userId={session.user.id} />
              </Suspense>
           </section>

           <InsightsSection userId={session.user.id} />
        </div>
      </div>
    </div>
  )
}
