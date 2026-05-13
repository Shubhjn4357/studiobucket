import { Icons } from "@/components/ui/icons"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
        title="Terms of Service"
        description="Legal framework and operational protocols for utilizing the StudioBucket platform."
        iconName="fileText"
      />

      <div className="space-y-12 mt-12">
        <section className="space-y-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest border-l-2 border-primary pl-4">1. Interface Access & Automation</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            StudioBucket is a professional-grade automation interface. By using the automated scheduling and posting features, you explicitly authorize StudioBucket to interact with your YouTube account via the Google API on your behalf. You remain the sole owner of your content and are responsible for all data deployed through our infrastructure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest border-l-2 border-primary pl-4">2. API Quotas & Reliability</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Users acknowledge that YouTube API operations are subject to daily quota limits. While we provide real-time telemetry, StudioBucket is not liable for failed deployments caused by quota exhaustion, platform API outages, or regional network latency.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest border-l-2 border-primary pl-4">3. Automated Posting Liability</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            The automation system operates on a high-availability background layer. You agree that StudioBucket is not liable for any account actions, community guideline violations, or channel terminations resulting from automated posting of content that violates third-party rights or YouTube policies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest border-l-2 border-primary pl-4">4. Data Integrity</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            While we strive for 99.9% uptime, we do not guarantee the permanent storage of source files beyond the active processing window. Users are encouraged to maintain local backups of all critical archival footage.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest border-l-2 border-primary pl-4">5. Termination</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            We reserve the right to terminate access for any account found to be using the platform for malicious automation, spam orchestration, or massive copyright infringement. Such termination is final and may result in the immediate purging of all associated data.
          </p>
        </section>
      </div>

      <div className="mt-20 pt-10 border-t border-border text-center">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Version 1.0.5 • Last Updated: May 13, 2026</p>
      </div>
    </PageContainer>
  )
}
