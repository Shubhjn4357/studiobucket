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
    <div className="space-y-12 pb-24 relative">
      {/* Background Ambience Node */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Dynamic Welcome Section (The Briefing) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 p-12 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
        {/* Scanned Data Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">System_Authorized</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">Welcome_Back, {userName}</h1>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.3em] italic">Telemetry_Sync_Complete // Monitoring Command Deck Operations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
           <div className="hidden lg:flex flex-col items-end mr-6 pr-6 border-r border-white/10">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Session_Duration</span>
              <span className="text-xs font-mono font-black text-white italic">04:12:88:02</span>
           </div>
           <Link href="/dashboard/upload">
             <Button className="h-16 rounded-2xl bg-primary text-white hover:bg-primary/90 px-10 font-black uppercase tracking-[0.2em] italic shadow-2xl shadow-primary/40 transition-transform hover:scale-105 border border-primary/20 group">
               <Icons.plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
               Injest_Asset
             </Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Main Content Area (Operational Core) */}
        <div className="xl:col-span-8 space-y-12">
          <section className="space-y-6">
             <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.05))] " />
                <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] italic shrink-0">Latest_Operational_Asset</h2>
                <div className="h-px flex-1 bg-[linear-gradient(to_left,transparent,rgba(255,255,255,0.05))] " />
             </div>
             <Suspense fallback={<VideoCardSkeleton />}>
                <LatestVideoSection userId={session.user.id} />
             </Suspense>
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.05))] " />
                <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] italic shrink-0">Temporal_Performance_Metrics</h2>
                <div className="h-px flex-1 bg-[linear-gradient(to_left,transparent,rgba(255,255,255,0.05))] " />
             </div>
             <Suspense fallback={<StatsSkeleton />}>
                <AnalyticsSection userId={session.user.id} />
             </Suspense>
          </section>
        </div>

        {/* Sidebar Area (Secondary Telemetry) */}
        <div className="xl:col-span-4 space-y-12">
           <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] italic shrink-0">Logic_Queue_Status</h2>
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
