import { Icons } from "@/components/ui/icons"

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter italic italic">Privacy Protocol</h1>
        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Effective Date: May 10, 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground font-medium text-sm leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">1. Data Ingestion</h2>
          <p>
            StudioBucket operates on a &quot;privacy-first&quot; synchronization model. We only ingest data required for YouTube API authentication and video processing. This includes your channel metadata, upload history, and processing preferences.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">2. YouTube API Integration</h2>
          <p>
            By using StudioBucket, you authorize the application to access your YouTube account via Google OAuth. We adhere strictly to the YouTube API Services User Data Policy. Your tokens are encrypted and stored in an isolated environment.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">3. Asset Processing</h2>
          <p>
            Video assets uploaded for processing are stored in temporary, ephemeral storage and deleted immediately after the rendering or upload job is finalized.
          </p>
        </section>
      </div>
    </div>
  )
}
