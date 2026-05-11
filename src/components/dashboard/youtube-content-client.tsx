"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getYouTubeVideosAction, deleteYouTubeVideoAction } from "@/app/dashboard/actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"
import { YouTubeSearchResult } from "@/types/video"

export function YouTubeContentClient() {
  const [videos, setVideos] = useState<YouTubeSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const loadInit = async () => {
      setIsLoading(true)
      try {
        const data = await getYouTubeVideosAction()
        if (mounted) setVideos(data as YouTubeSearchResult[])
      } catch (error) {
        if (mounted) toast.error("Failed to fetch YouTube synchronization")
        console.error(error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadInit()
    return () => { mounted = false }
  }, [])

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video from YouTube? This action is irreversible.")) return
    
    setIsDeleting(videoId)
    try {
      await deleteYouTubeVideoAction(videoId)
      toast.success("Frequency terminated from YouTube")
      // Reload
      const data = await getYouTubeVideosAction()
      setVideos(data as YouTubeSearchResult[])
    } catch {
      toast.error("Termination failed")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <Card className="cyber-card border-border bg-card/50 overflow-hidden mt-8">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Asset</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Published At</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={3} className="px-6 py-8 bg-muted/5" />
                  </tr>
                ))
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No live assets detected on this channel.</p>
                  </td>
                </tr>
              ) : (
                videos.map((video, i) => (
                  <tr key={video.id?.videoId || `video-${i}`} className="group hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-24 rounded-lg bg-slate-900 border border-border overflow-hidden relative shrink-0">
                          {video.snippet?.thumbnails?.high?.url && (
                            <Image unoptimized fill src={video.snippet.thumbnails.high.url} alt={video.snippet?.title || "Video"} className="object-cover" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 max-w-[400px]">
                          <span className="text-sm font-black text-foreground truncate uppercase italic tracking-tight">{video.snippet?.title || "Untitled Video"}</span>
                          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-1">{video.snippet?.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                         {video.snippet?.publishedAt ? new Date(video.snippet.publishedAt).toLocaleDateString() : "Unknown Date"}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => video.id?.videoId && handleDelete(video.id.videoId)}
                            disabled={!video.id?.videoId || isDeleting === video.id.videoId}
                            className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                          >
                            {isDeleting === (video.id?.videoId || "") ? <Icons.refreshCw className="h-4 w-4 animate-spin" /> : <Icons.trash2 className="h-4 w-4" />}
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
  )
}
