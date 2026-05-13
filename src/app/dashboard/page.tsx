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
import { PageHeader } from "@/components/dashboard/page-header"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const userName = session.user.name || "User"

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title={`Welcome back, ${userName}`} 
        description="Here is what's happening with your videos today." 
        icon={Icons.layoutDashboard}
      >
        <Link href="/dashboard/upload">
          <Button className="font-bold rounded-xl h-12 px-6 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Icons.plus className="h-5 w-5 mr-2" />
            Upload Video
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-10">
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recently Uploaded</h2>
                <Link href="/dashboard/content" className="text-xs font-bold text-primary hover:underline">View All</Link>
             </div>
             <Suspense fallback={<VideoCardSkeleton />}>
                <LatestVideoSection userId={session.user.id} />
             </Suspense>
          </section>

          <section className="space-y-4">
             <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Performance Summary</h2>
             <Suspense fallback={<StatsSkeleton />}>
                <AnalyticsSection userId={session.user.id} />
             </Suspense>
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="xl:col-span-4 space-y-10">
           <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Processing Queue</h2>
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
