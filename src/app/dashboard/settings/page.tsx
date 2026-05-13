import { SettingsManager } from "@/components/settings/settings-manager"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { VideoService } from "@/lib/services/video-service"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })

  const videoService = new VideoService()
  const userChannels = await videoService.getChannels(session.user.id)

  return (
    <PageContainer maxWidth="6xl">
      <PageHeader 
        title="Settings" 
        description="Manage your account profile, connected channels, and application preferences." 
        iconName="settings"
      />
      
      <SettingsManager 
        initialUser={user ? {
          ...user,
          emailVerified: user.emailVerified || null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        } : undefined} 
        initialChannels={userChannels} 
      />
    </PageContainer>
  )
}
