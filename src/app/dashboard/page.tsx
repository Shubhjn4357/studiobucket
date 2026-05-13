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

  const userName = session.user.name || "Creator"

  return (
    <PageContainer>
      <PageHeader 
        title={`Welcome back, ${userName}`} 
        description="Here is your channel overview and production pipeline status." 
        iconName="layoutDashboard"
      >
        <Link href="/dashboard/upload" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto font-bold rounded-xl h-11 px-6 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Icons.plus className="h-5 w-5 mr-2" />
            Upload Video
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10">
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
          <section className="space-y-4 md:space-y-6">
             <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Recently Uploaded</h2>
                <Link href="/dashboard/content" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary hover:underline transition-all">View Library</Link>
             </div>
             <Suspense fallback={<VideoCardSkeleton />}>
                <LatestVideoSection userId={session.user.id} />
             </Suspense>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <Card className="bg-card border-border shadow-sm rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 px-6 md:px-8 py-4 md:py-6">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground/70">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-2">
              <Link href="/dashboard/downloader" className="block">
                <Button variant="ghost" className="w-full justify-start font-bold h-11 md:h-12 rounded-xl md:rounded-2xl hover:bg-primary/5 hover:text-primary transition-all px-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                    <Icons.download className="h-4 w-4 text-primary" />
                  </div>
                  Video Downloader
                </Button>
              </Link>
              <Link href="/dashboard/schedule" className="block">
                <Button variant="ghost" className="w-full justify-start font-bold h-11 md:h-12 rounded-xl md:rounded-2xl hover:bg-primary/5 hover:text-primary transition-all px-4">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
                    <Icons.calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  Content Calendar
                </Button>
              </Link>
              <Link href="/dashboard/analytics" className="block">
                <Button variant="ghost" className="w-full justify-start font-bold h-11 md:h-12 rounded-xl md:rounded-2xl hover:bg-primary/5 hover:text-primary transition-all px-4">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center mr-4">
                    <Icons.barChart className="h-4 w-4 text-purple-500" />
                  </div>
                  Performance Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10 shadow-none rounded-[2rem] md:rounded-[2.5rem]">
            <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner shrink-0">
                  <Icons.zap className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm md:text-base font-bold text-foreground truncate">Premium Access</p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest truncate">Beta Participant</p>
                </div>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                You have unrestricted access to all creator features during the public beta phase. Enjoy high-speed transcoding and cloud synchronization.
              </p>
              <Button variant="outline" className="w-full h-10 md:h-11 rounded-xl md:rounded-2xl font-bold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all text-xs">
                Explore Pro Features
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
