"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
        if (mounted) setVideos((data || []) as unknown as YouTubeSearchResult[])
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
    setIsDeleting(videoId)
    try {
      await deleteYouTubeVideoAction(videoId)
      toast.success("Frequency terminated from YouTube")
      // Reload
      const data = await getYouTubeVideosAction()
      setVideos((data || []) as unknown as YouTubeSearchResult[])
    } catch {
      toast.error("Termination failed")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative mt-12">
      {/* HUD Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none opacity-20" />
      
      <div className="p-0 relative z-10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic">Asset_ID {"//"} Live_Transmission</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic">Temporal_Stamp</th>
                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={3} className="px-10 py-12 bg-white/[0.01]" />
                  </tr>
                ))
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                       <Icons.video className="h-12 w-12 text-white/5" />
                       <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10 italic">No active assets detected in this sector.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                videos.map((video, i) => (
                  <tr key={video.id?.videoId || `video-${i}`} className="group hover:bg-white/[0.02] transition-all duration-500">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-8">
                        <div className="h-20 w-32 rounded-2xl bg-black border border-white/10 overflow-hidden relative shrink-0 shadow-2xl group-hover:border-primary/40 transition-colors duration-500">
                          {video.snippet?.thumbnails?.high?.url && (
                            <Image unoptimized fill src={video.snippet.thumbnails.high.url} alt={video.snippet?.title || "Video"} className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                          )}
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <div className="flex flex-col gap-2 max-w-[500px]">
                          <span className="text-sm font-black text-white uppercase italic tracking-tight group-hover:text-primary transition-colors duration-500">{video.snippet?.title || "UNTITLED_NODE"}</span>
                          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest line-clamp-1 italic">{video.snippet?.description || "No metadata description injected."}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-black text-white/60 uppercase tracking-widest italic">{video.snippet?.publishedAt ? new Date(video.snippet.publishedAt).toLocaleDateString() : "UNDEFINED"}</span>
                          <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">GMT_STAMP_NODE</span>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-4">
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button 
                                 size="icon" 
                                 variant="ghost" 
                                 disabled={!video.id?.videoId || isDeleting === video.id.videoId}
                                 className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-white/20 hover:text-red-500 transition-all group/delete"
                               >
                                 {isDeleting === (video.id?.videoId || "") ? (
                                   <Icons.refreshCw className="h-5 w-5 animate-spin" />
                                 ) : (
                                   <Icons.trash2 className="h-5 w-5 transition-transform group-hover/delete:scale-110" />
                                 )}
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent className="bg-black/90 backdrop-blur-3xl border-white/10 rounded-[3rem] p-12 shadow-2xl">
                               <AlertDialogHeader>
                                 <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                       <Icons.alertTriangle className="h-6 w-6 text-red-500" />
                                    </div>
                                    <div className="flex flex-col">
                                       <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">Terminate_Live_Asset</AlertDialogTitle>
                                       <span className="text-[8px] font-black text-red-500 uppercase tracking-[0.4em]">Critical Sequence Initiated</span>
                                    </div>
                                 </div>
                                 <AlertDialogDescription className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] leading-relaxed italic">
                                   This protocol will permanently remove the transmission from YouTube&apos;s global grid. 
                                   Structural recovery will be impossible after execution. Confirm to proceed with node deletion.
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter className="mt-12 gap-4">
                                 <AlertDialogCancel className="h-16 rounded-2xl border-white/10 bg-white/5 text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex-1 italic">Abort_Sequence</AlertDialogCancel>
                                 <AlertDialogAction 
                                    onClick={() => video.id?.videoId && handleDelete(video.id.videoId)}
                                    className="h-16 rounded-2xl bg-red-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-2xl shadow-red-500/40 flex-1 italic"
                                    disabled={!video.id?.videoId}
                                  >
                                    Execute_Termination
                                  </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
