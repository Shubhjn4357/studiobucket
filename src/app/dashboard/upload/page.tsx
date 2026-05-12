import { UploadCenter } from "@/components/dashboard/upload-center"

export default function UploadPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 relative">
      {/* Structural Ambience Node */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 p-12 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
        {/* HUD Scan Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
             <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">Ingestion_Protocol_Ready</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">Upload_Center</h1>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.3em] italic">Mission_Critical // Asset_Grid_Ingestion</p>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-col items-end relative z-10 pr-4">
           <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Queue_Capacity</span>
           <span className="text-xs font-mono font-black text-white italic">NODE_99_AVAILABLE</span>
        </div>
      </div>

      <UploadCenter />
    </div>
  )
}
