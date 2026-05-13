import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Suspense } from "react"
import { LatestVideoSection, VideoCardSkeleton } from "@/components/dashboard/sections"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const userName = session.user.name || "User"

  return (
    <PageContainer>
      <PageHeader 
        title={`Welcome back, ${userName}`} 
        description="Here is a summary of your video automation pipeline today." 
        iconName="layoutDashboard"
      >
        <Link href="/dashboard/upload">
          <Button className="font-bold rounded-xl h-11 px-6 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Icons.plus className="h-5 w-5 mr-2" />
            Upload Video
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recently Uploaded</h2>
                <Link href="/dashboard/content" className="text-xs font-bold text-primary hover:underline">View All</Link>
             </div>
             <Suspense fallback={<VideoCardSkeleton />}>
                <LatestVideoSection userId={session.user.id} />
             </Suspense>
          </section>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Link href="/dashboard/downloader" className="block">
                <Button variant="ghost" className="w-full justify-start font-bold h-11 rounded-xl">
                  <Icons.download className="h-4 w-4 mr-3 text-primary" />
                  Video Downloader
                </Button>
              </Link>
              <Link href="/dashboard/schedule" className="block">
                <Button variant="ghost" className="w-full justify-start font-bold h-11 rounded-xl">
                  <Icons.calendar className="h-4 w-4 mr-3 text-primary" />
                  Scheduled Tasks
                </Button>
              </Link>
              <Link href="/dashboard/analytics" className="block">
                <Button variant="ghost" className="w-full justify-start font-bold h-11 rounded-xl">
                  <Icons.barChart className="h-4 w-4 mr-3 text-primary" />
                  Analytics Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10 shadow-none">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <Icons.zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Pro Features Active</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Beta_Protocol_v4.2</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                You have unlimited access to our AI-powered transcoding and cloud sync features during the public beta.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
