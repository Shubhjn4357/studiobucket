import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { ChannelList } from "./channel-list"
import { ChannelActions } from "./channel-actions"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"

export default async function ChannelsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const videoService = new VideoService()
  const channels = await videoService.getChannels(session.user.id)

  return (
    <PageContainer>
      <PageHeader 
        title="Channel Manager" 
        description="Connect and manage your multi-platform channel fleet from a unified dashboard." 
        iconName="users"
      >
        <ChannelActions />
      </PageHeader>

      <div className="mt-8">
        <ChannelList initialChannels={channels} />
      </div>
    </PageContainer>
  )
}
