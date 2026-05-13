import { UploadCenter } from "@/components/dashboard/upload-center"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function UploadPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  return (
    <div className="max-w-full space-y-4 pb-12 relative">
      {/* Structural Ambience Node */}
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 bg-surface border border-border rounded-sm shadow-sm relative overflow-hidden hud-corner">
        {/* HUD Scan Pattern */}
        <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
             <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
             <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em] italic">Ingestion_Protocol_Ready</span>
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">Upload_Center</h1>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em] italic opacity-40">Mission_Critical // Asset_Grid_Ingestion</p>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-col items-end relative z-10">
           <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Queue_Capacity</span>
           <span className="text-[10px] font-mono font-black text-foreground italic uppercase">NODE_99_AVAILABLE</span>
        </div>
      </div>

      <UploadCenter />
    </div>
  )
}
