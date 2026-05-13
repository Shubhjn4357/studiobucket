import { Icons } from "@/components/ui/icons"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <PageContainer maxWidth="6xl">
      <div className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="font-bold rounded-xl gap-2 text-muted-foreground hover:text-foreground">
            <Icons.chevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <PageHeader 
        title="Privacy Policy" 
        description="Operational protocols for data handling and user privacy security." 
        iconName="shield"
      />

      <div className="space-y-12 mt-12">
        <section className="space-y-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest border-l-2 border-primary pl-4">1. Data Ingestion</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            StudioBucket operates on a privacy-first synchronization model. We only ingest data required for YouTube API authentication and video processing. This includes your channel metadata, upload history, and processing preferences.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest border-l-2 border-primary pl-4">2. API Integration</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            By using StudioBucket, you authorize the application to access your YouTube account via Google OAuth. We adhere strictly to the YouTube API Services User Data Policy. Your credentials are encrypted using AES-256 standards and stored in isolated environments.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest border-l-2 border-primary pl-4">3. Asset Sovereignty</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Video assets uploaded for processing are stored in encrypted volumes and are under your full control. Automated purging protocols ensure that ephemeral data is cleared immediately after task finalization.
          </p>
        </section>
      </div>

      <div className="mt-20 pt-10 border-t border-border text-center">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Last Updated: May 13, 2026 • SECURE_COMPLIANCE_V1</p>
      </div>
    </PageContainer>
  )
}
