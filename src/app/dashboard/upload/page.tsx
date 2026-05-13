import { UploadCenter } from "@/components/dashboard/upload-center"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/dashboard/page-header"
import { Icons } from "@/components/ui/icons"

export default async function UploadPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <PageHeader 
        title="Upload Video" 
        description="Select a video file to upload and customize its details." 
        icon={Icons.upload}
      />
      <UploadCenter />
    </div>
  )
}
