import { Icons } from "@/components/ui/icons"

export default function DocsPage() {
  const sections = [
    { title: "Authentication", content: "Authorize your nodes via Google OAuth with youtube.upload and youtube.readonly scopes." },
    { title: "Video Ingestion", content: "Drop assets into the Command Center. Support for 4K ProRes and H.264 high-bitrate files." },
    { title: "Temporal Logic", content: "Schedule sorties via the Mission Timeline. Automated deployment based on target timezone parameters." },
    { title: "Telemetry", content: "Real-time monitoring of engine health and video performance metrics via the Dashboard." },
  ]

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 space-y-12 relative">
      <a 
        href="/dashboard" 
        className="fixed top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors group z-50"
      >
        <Icons.chevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Interface
      </a>

      <div className="space-y-4">
        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter italic">Technical Manual</h1>
        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Version 2026.1 • Integrated Operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((s, i) => (
          <div key={i} className="p-6 rounded-2xl bg-muted/50 border border-border space-y-4">
             <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
               <Icons.box className="h-4 w-4 text-primary" />
               {s.title}
             </h2>
             <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide leading-relaxed">
               {s.content}
             </p>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-2xl bg-primary/10 border border-primary/20 space-y-4">
         <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em]">System Architecture</h3>
         <p className="text-[11px] text-foreground font-bold uppercase tracking-tight leading-relaxed">
           StudioBucket leverages a decentralized processing engine. Task orchestration is handled by the Core Intelligence Unit, while asset rendering is distributed across regional edge nodes for minimum latency.
         </p>
      </div>
    </div>
  )
}
