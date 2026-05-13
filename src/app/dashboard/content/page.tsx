import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { VideoActions } from "@/components/dashboard/video-actions"
import { ContentManagerClient } from "@/components/dashboard/content-manager-client"
import { Video } from "@/schemas"
import Image from "next/image"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface VideoWithStats extends Video {
  views: number
  likes: number
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const videoService = new VideoService()
  const videos = await videoService.getUserVideos(session.user.id, undefined, q) as unknown as VideoWithStats[]

  return (
    <PageContainer>
      <PageHeader 
        title="Channel Content" 
        description="Manage your videos, analyze performance, and fine-tune your library." 
        iconName="play"
      >
        <Link href="/dashboard/upload" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto font-bold rounded-xl h-11 px-6 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Icons.plus className="h-5 w-5 mr-2" />
            Upload Video
          </Button>
        </Link>
      </PageHeader>

      <ContentManagerClient 
        localContent={
          <div className="mt-4 md:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Video</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Stats</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {videos.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-6 opacity-30">
                            <Icons.video className="h-16 w-16 text-muted-foreground" />
                            <div className="space-y-1">
                               <p className="font-black text-sm uppercase tracking-widest">No videos found</p>
                               <p className="text-xs font-medium">Your video library is currently empty.</p>
                            </div>
                            <Link href="/dashboard/upload">
                              <Button variant="outline" className="font-bold rounded-xl h-11 px-8 border-border">
                                Upload Your First Video
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      videos.map((video) => (
                        <tr key={video.id} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-6">
                              <div className="h-16 w-28 rounded-2xl bg-black border border-border overflow-hidden relative shrink-0 shadow-md">
                                {video.thumbnailPath ? (
                                  <Image unoptimized fill src={video.thumbnailPath} alt={video.title} className="object-cover transition-transform group-hover:scale-105 duration-500" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                                     <Icons.video className="h-6 w-6 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-1.5 min-w-0 max-w-[400px]">
                                <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{video.title}</span>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="h-5 px-2 bg-muted/50 border-border/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                                     {video.privacyStatus === "public" ? <Icons.globe className="h-2.5 w-2.5 mr-1 text-green-500" /> : <Icons.lock className="h-2.5 w-2.5 mr-1 text-amber-500" />}
                                     {video.privacyStatus}
                                  </Badge>
                                  <span className="text-[10px] font-bold text-muted-foreground/40">{new Date(video.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col items-center gap-2.5">
                               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/50">
                                 <div className={cn(
                                   "h-1.5 w-1.5 rounded-full",
                                   video.status === "published" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                                   video.status === "failed" ? "bg-red-500" : "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"
                                 )} />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">{video.status}</span>
                               </div>
                               <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full", video.status === "published" ? "bg-green-500" : "bg-primary")}
                                    style={{ width: video.status === "published" ? "100%" : "45%" }}
                                  />
                               </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-8">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-sm font-black text-foreground tabular-nums tracking-tighter">{video.views.toLocaleString()}</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Views</span>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-sm font-black text-foreground tabular-nums tracking-tighter">{video.likes.toLocaleString()}</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Likes</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                              <Link href={`/dashboard/studio?id=${video.id}`}>
                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                  <Icons.edit3 className="h-4 w-4" />
                                </Button>
                              </Link>
                              <VideoActions videoId={video.id} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {videos.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-border rounded-[2rem] opacity-30 flex flex-col items-center">
                   <Icons.video className="h-12 w-12 mb-6" />
                   <p className="text-[10px] font-black uppercase tracking-[0.3em]">No content detected</p>
                </div>
              ) : (
                videos.map((video) => (
                  <Card key={video.id} className="bg-card border-border rounded-[2rem] overflow-hidden shadow-sm group">
                    <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="h-20 w-32 md:h-24 md:w-40 rounded-xl md:rounded-2xl bg-black border border-border overflow-hidden relative shrink-0 shadow-md">
                          {video.thumbnailPath ? (
                            <Image unoptimized fill src={video.thumbnailPath} alt={video.title} className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                               <Icons.video className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                           <h3 className="text-sm md:text-base font-bold text-foreground line-clamp-2 leading-tight">{video.title}</h3>
                           <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="h-5 px-2 bg-muted/50 border-border/50 text-[8px] font-black uppercase tracking-widest text-muted-foreground/80">
                                 {video.privacyStatus}
                              </Badge>
                              <span className="text-[10px] font-bold text-muted-foreground/40">{new Date(video.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Performance</span>
                          <div className="flex items-center gap-4">
                             <div className="flex flex-col">
                                <span className="text-xs font-black text-foreground">{video.views.toLocaleString()}</span>
                                <span className="text-[8px] font-bold text-muted-foreground/40">Views</span>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-black text-foreground">{video.likes.toLocaleString()}</span>
                                <span className="text-[8px] font-bold text-muted-foreground/40">Likes</span>
                             </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                           <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Status</span>
                           <div className="flex items-center gap-2">
                              <div className={cn(
                                 "h-1.5 w-1.5 rounded-full",
                                 video.status === "published" ? "bg-green-500" : "bg-primary animate-pulse"
                              )} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">{video.status}</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Link href={`/dashboard/studio?id=${video.id}`} className="flex-1">
                               <Button variant="outline" className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest border-border">
                                  <Icons.edit3 className="h-4 w-4 mr-2" />
                                  Edit
                               </Button>
                            </Link>
                         </div>
                         <VideoActions videoId={video.id} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        }
      />
    </PageContainer>
  )
}
