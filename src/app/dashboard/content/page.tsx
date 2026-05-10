import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { VideoService } from "@/lib/services/video-service"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default async function ContentPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/login")

  const videoService = new VideoService()
  const videos = await videoService.getUserVideos(session.user.id, undefined, searchParams.q)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.play className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none italic">Channel Content</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Video Library • Performance Overview</p>
          </div>
        </div>
        <Link href="/dashboard/upload">
          <Button className="h-11 bg-primary text-white hover:opacity-90 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
            <Icons.plus className="h-4 w-4 mr-2" />
            Create Video
          </Button>
        </Link>
      </div>

      <Card className="cyber-card border-border bg-card/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Video</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visibility</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Views</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Likes</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {videos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border border-border">
                          <Icons.video className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No videos found in repository</p>
                        <Link href="/dashboard/upload">
                          <Button variant="outline" className="h-9 rounded-xl border-border bg-muted/50 text-[9px] font-black uppercase tracking-widest">
                            Upload Now
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  videos.map((video) => (
                    <tr key={video.id} className="group hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-24 rounded-lg bg-slate-900 border border-border overflow-hidden relative group/thumb flex items-center justify-center">
                            {video.thumbnailPath ? (
                              <img src={video.thumbnailPath} alt={video.title} className="h-full w-full object-cover" />
                            ) : (
                              <Icons.video className="h-6 w-6 text-white/20 group-hover/thumb:text-primary transition-colors" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 max-w-[240px]">
                            <span className="text-sm font-black text-foreground truncate uppercase italic tracking-tight">{video.title}</span>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-1">{video.description || "No description provided"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {video.privacy === "public" ? (
                            <Icons.globe className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Icons.lock className="h-3 w-3 text-amber-500" />
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{video.privacy}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            video.status === "published" ? "bg-emerald-500" :
                            video.status === "failed" ? "bg-red-500" : "bg-amber-500"
                          )} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{video.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{(video as any).views.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{(video as any).likes.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/studio?id=${video.id}`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary">
                              <Icons.edit3 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                            <Icons.trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
