import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { 
  LatestVideoSection, 
  AnalyticsSection, 
  QueueSection, 
  InsightsSection 
} from "@/components/dashboard/sections"
import { VideoCardSkeleton, StatsSkeleton, ListSkeleton } from "@/components/ui/skeleton-loader"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const userName = session.user.name || "Commander"

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamic Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {userName}</h1>
          <p className="text-sm text-muted-foreground">Monitor your channel performance and automation status.</p>
        </div>
        <Link href="/dashboard/upload">
          <Button className="rounded-full bg-primary text-white hover:bg-primary/90 px-8 font-semibold">
            <Icons.plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8">
          <section className="space-y-4">
             <h2 className="text-lg font-semibold">Latest Video</h2>
             <Suspense fallback={<VideoCardSkeleton />}>
                <LatestVideoSection userId={session.user.id} />
             </Suspense>
          </section>

          <section className="space-y-4">
             <h2 className="text-lg font-semibold">Performance Metrics</h2>
             <Suspense fallback={<StatsSkeleton />}>
                <AnalyticsSection userId={session.user.id} />
             </Suspense>
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="xl:col-span-4 space-y-8">
           <section className="space-y-4">
              <h2 className="text-lg font-semibold">Queue Status</h2>
              <Suspense fallback={<ListSkeleton />}>
                 <QueueSection userId={session.user.id} />
              </Suspense>
           </section>

           <InsightsSection userId={session.user.id} />
        </div>
      </div>
    </div>
  )
}
