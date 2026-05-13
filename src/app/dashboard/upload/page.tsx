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
    <PageContainer maxWidth="6xl">
      <PageHeader 
        title="Upload Media" 
        description="Add your video assets to the platform and prepare them for your automated workflow." 
        iconName="upload"
      />
      
      <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] p-1 shadow-sm overflow-hidden mt-4 md:mt-8">
        <UploadCenter />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-8 md:pt-12">
        {[
          { 
            title: "Optimized Encoding", 
            desc: "Your videos are prepared in multiple formats for maximum compatibility.",
            icon: "zap"
          },
          { 
            title: "Cloud Storage", 
            desc: "Encrypted, high-speed storage for your raw and processed assets.",
            icon: "cloud"
          },
          { 
            title: "Secure Workflow", 
            desc: "Granular access controls ensure your content remains private.",
            icon: "shieldCheck"
          },
        ].map((item, i) => (
          <div key={i} className="p-6 md:p-8 rounded-[2rem] bg-card border border-border shadow-sm group hover:border-primary/20 transition-all duration-500">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
