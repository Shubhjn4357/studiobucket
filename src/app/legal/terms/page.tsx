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
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">1. Interface Access</h2>
          <p>
            StudioBucket is a professional-grade automation interface. Users are responsible for the content they deploy and must adhere to YouTube&apos;s Community Guidelines and Terms of Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">2. API Quotas</h2>
          <p>
            Users acknowledge that YouTube API operations are subject to daily quota limits. StudioBucket provides telemetry on usage but cannot circumvent Google-imposed restrictions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">3. Termination of Node</h2>
          <p>
            Integrated Operations reserves the right to terminate access for any account found to be using the platform for malicious automation or copyright infringement.
          </p>
        </section>
      </div>
    </div>
  )
}
