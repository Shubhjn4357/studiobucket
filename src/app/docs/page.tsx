import { Icons } from "@/components/ui/icons"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DocsPage() {
  const sections = [
    { 
      title: "Authentication", 
      content: "Authorize your nodes via Google OAuth with youtube.upload and youtube.readonly scopes. Secure handling of refresh tokens ensures persistent uplink.",
      icon: "lock"
    },
    { 
      title: "Video Ingestion", 
      content: "Drop assets into the upload registry. Automated validation for 4K ProRes and H.264 high-bitrate standards ensures high-fidelity playback.",
      icon: "upload"
    },
    { 
      title: "Temporal Grid", 
      content: "Schedule content via the timeline manager. Automated deployment based on target timezone parameters and regional peak viewing windows.",
      icon: "calendar"
    },
    { 
      title: "Telemetry Metrics", 
      content: "Real-time monitoring of channel health and video performance metrics. Exportable audit logs for data-driven optimization.",
      icon: "barChart"
    },
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
      </div>

      <PageHeader 
        title="Documentation" 
        description="Technical manual and operational protocols for the StudioBucket platform." 
        iconName="book"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((s, i) => {
          const Icon = Icons[s.icon as keyof typeof Icons]
          return (
            <div key={i} className="p-8 rounded-3xl bg-card border border-border space-y-4 hover:border-primary/20 transition-colors group">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">{s.title}</h2>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {s.content}
              </p>
            </div>
          )
        })}
      </div>

      <div className="p-10 rounded-3xl bg-primary/5 border border-primary/10 space-y-6 mt-12">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Icons.zap className="h-5 w-5" />
          </div>
          <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em]">System Architecture</h3>
        </div>
        <p className="text-sm text-foreground font-medium leading-relaxed">
          StudioBucket leverages a high-performance orchestration engine. Task scheduling is handled via redundant Redis clusters, while asset transcoding is distributed across optimized compute nodes for maximum throughput and minimum latency.
        </p>
      </div>
    </PageContainer>
  )
}
