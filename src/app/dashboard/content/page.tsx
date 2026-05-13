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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Video Content" 
        description="Manage your uploaded videos, track performance, and edit metadata." 
        icon={Icons.play}
      >
        <Link href="/dashboard/upload">
          <Button className="font-bold rounded-xl h-12 px-6 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Icons.plus className="h-5 w-5 mr-2" />
            Upload Video
          </Button>
        </Link>
      </PageHeader>

      <ContentManagerClient 
        localContent={
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Video</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Visibility</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Views</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Likes</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {videos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                          <Icons.video className="h-12 w-12 opacity-20" />
                          <p className="font-bold">No videos found</p>
                          <Link href="/dashboard/upload">
                            <Button variant="outline" size="sm" className="font-bold rounded-lg">
                              Upload your first video
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    videos.map((video) => (
                      <tr key={video.id} className="group hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-20 rounded-lg bg-black border border-border overflow-hidden relative shrink-0">
                              {video.thumbnailPath ? (
                                <Image unoptimized fill src={video.thumbnailPath} alt={video.title} className="object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                   <Icons.video className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 max-w-[250px]">
                              <span className="text-sm font-bold text-foreground line-clamp-1">{video.title}</span>
                              <span className="text-[10px] text-muted-foreground line-clamp-1">{video.description || "No description"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {video.privacyStatus === "public" ? (
                              <Icons.globe className="h-3 w-3 text-green-500" />
                            ) : (
                              <Icons.lock className="h-3 w-3 text-amber-500" />
                            )}
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">{video.privacyStatus}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                             <div className="flex items-center gap-2">
                               <div className={cn(
                                 "h-1.5 w-1.5 rounded-full",
                                 video.status === "published" ? "bg-green-500" :
                                 video.status === "failed" ? "bg-red-500" : "bg-amber-500"
                               )} />
                               <span className="text-[10px] font-bold uppercase text-foreground">{video.status}</span>
                             </div>
                             <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full transition-all duration-1000", video.status === "published" ? "bg-green-500" : "bg-primary")}
                                  style={{ width: video.status === "published" ? "100%" : "40%" }}
                                />
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-foreground">{video.views.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-foreground">{video.likes.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/studio?id=${video.id}`}>
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
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
        }
      />
    </div>
  )
}
