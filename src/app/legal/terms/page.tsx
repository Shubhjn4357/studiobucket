import { Icons } from "@/components/ui/icons"

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter italic">Operational Terms</h1>
        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Version 1.0.4 • Alpha Strike</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground font-medium text-sm leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">1. Interface Access & Automation</h2>
          <p>
            StudioBucket is a professional-grade automation interface. By using the automated scheduling and posting features, you explicitly authorize StudioBucket to interact with your YouTube account via the Google API on your behalf. You remain the sole &quot;Content Commander&quot; and are responsible for all data deployed through our nodes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">2. API Quotas & Reliability</h2>
          <p>
            Users acknowledge that YouTube API operations are subject to daily quota limits. While we provide real-time telemetry, StudioBucket is not liable for failed deployments caused by quota exhaustion, Google API outages, or network latency in the distribution tier.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">3. Automated Posting Liability</h2>
          <p>
            The &quot;Fleet&quot; automation system operates on a non-deterministic background layer. You agree that StudioBucket and its parent entity, Integrated Operations, are not liable for any account strikes, community guideline violations, or channel terminations resulting from automated posting of content that violates third-party rights or YouTube policies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">4. Data Integrity & Retention</h2>
          <p>
            We maintain a &quot;Mission Control&quot; data retention policy. While we strive for 99.9% uptime of the storage nodes, we do not guarantee the permanent storage of your source files beyond the active processing window. Users should maintain local backups of all archival footage.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">5. Termination of Node</h2>
          <p>
            Integrated Operations reserves the right to terminate access for any account found to be using the platform for malicious automation, spam orchestration, or massive copyright infringement. Such termination is final and may result in the immediate purging of all associated archival data.
          </p>
        </section>
      </div>
    </div>
  )
}
