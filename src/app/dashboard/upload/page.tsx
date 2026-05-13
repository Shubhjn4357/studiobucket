import { UploadCenter } from "@/components/dashboard/upload-center"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"

export default async function UploadPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader 
        title="Upload Video" 
        description="Select a video asset to initialize the ingestion pipeline and customize metadata." 
        iconName="upload"
      />
      
      <div className="bg-card border border-border rounded-3xl p-1 shadow-sm overflow-hidden">
        <UploadCenter />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {[
          { title: "Smart Transcoding", desc: "Automated HLS generation for all resolutions." },
          { title: "Cloud Backup", desc: "Redundant storage across multiple regions." },
          { title: "Privacy Controls", desc: "Granular access management for all assets." },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-2xl bg-muted/30 border border-border/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
