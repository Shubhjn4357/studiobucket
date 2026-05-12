"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getVideosAction, getCommentsAction, postCommentAction } from "@/app/dashboard/actions"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { YouTubeComment, VideoWithStats } from "@/types/video"

export default function InteractionsPage() {
  const [videos, setVideos] = useState<VideoWithStats[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [comments, setComments] = useState<YouTubeComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [replyText, setReplyText] = useState("")

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getVideosAction()
        if (!mounted) return
        setVideos(data as VideoWithStats[])
        if (data.length > 0) {
          setSelectedVideoId(data[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    if (selectedVideoId) {
      const loadComments = async () => {
        setIsLoadingComments(true)
        try {
          const data = await getCommentsAction(selectedVideoId)
          if (!mounted) return
          setComments(data as YouTubeComment[])
        } catch (error) {
          console.error("Failed to fetch comments:", error)
          if (mounted) setComments([])
        } finally {
          if (mounted) setIsLoadingComments(false)
        }
      }
      loadComments()
    }
    return () => { mounted = false }
  }, [selectedVideoId])

  const handlePostComment = async () => {
    if (!selectedVideoId || !replyText) return
    try {
      await postCommentAction(selectedVideoId, replyText)
      toast.success("Frequency transmitted successfully")
      setReplyText("")
      const data = await getCommentsAction(selectedVideoId)
      setComments(data as YouTubeComment[])
    } catch {
      toast.error("Transmission failed")
    }
  }

  const selectedVideo = videos.find(v => v.id === selectedVideoId)

  return (
    <div className="space-y-16 pb-24 relative max-w-7xl mx-auto">
      {/* Structural Ambience Nodes */}
      <div className="absolute -top-60 -left-60 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Industrial Header Console */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-16 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden">
        {/* HUD Scanline FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="h-24 w-24 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 relative group"
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-primary blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <Icons.messageSquare className="h-12 w-12 text-white relative z-10" />
          </motion.div>
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
               <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic">Community_Node_Linked</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Transmission_Feed</h1>
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[11px] italic">Audience_Interaction_Hub // Community_Sync</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 px-4">
        {/* Video Selector Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="flex items-center justify-between px-6">
              <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic">Signal_Selection</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">{videos.length} NODES</span>
           </div>
           <div className="space-y-4 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-[2rem] bg-white/[0.02] animate-pulse border border-white/5" />
                ))
              ) : (
                videos.map((video) => (
                  <motion.button
                    key={video.id}
                    layout
                    onClick={() => setSelectedVideoId(video.id)}
                    className={cn(
                      "w-full p-6 rounded-[2.5rem] border transition-all duration-700 text-left flex items-center gap-6 group relative overflow-hidden shadow-2xl",
                      selectedVideoId === video.id 
                        ? "border-primary/40 bg-primary/[0.05] shadow-primary/10" 
                        : "border-white/5 bg-black/40 hover:border-primary/20"
                    )}
                  >
                    <div className="h-16 w-24 rounded-2xl bg-black border border-white/10 overflow-hidden shrink-0 relative z-10">
                       {video.thumbnailPath ? (
                         <img src={video.thumbnailPath} className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                       ) : (
                         <div className="h-full w-full bg-[radial-gradient(circle_at_center,#ffffff05_1px,transparent_1px)] bg-[size:10px_10px]" />
                       )}
                    </div>
                    <div className="min-w-0 relative z-10 space-y-2">
                       <p className={cn(
                         "text-sm font-black uppercase tracking-tight truncate italic",
                         selectedVideoId === video.id ? "text-primary" : "text-white/60 group-hover:text-white"
                       )}>{video.title}</p>
                       <div className="flex items-center gap-3">
                         <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic leading-none">
                           {video.views?.toLocaleString() || 0} UNITS
                         </span>
                         {selectedVideoId === video.id && (
                           <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                         )}
                       </div>
                    </div>
                  </motion.button>
                ))
              )}
           </div>
        </div>

        {/* Comment Thread */}
        <div className="lg:col-span-8">
           <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] min-h-[700px] flex flex-col shadow-2xl relative overflow-hidden">
              {/* Internal HUD Elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
              
              <div className="p-12 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative z-10">
                 <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Frequency_Feed</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mt-1 italic">Monitoring community sectors in real-time</p>
                 </div>
                 <div className="hidden sm:flex items-center gap-4 border-l border-white/5 pl-8">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500 italic">UPLINK_STABLE</span>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                 <div className="p-12 space-y-10">
                    <AnimatePresence mode="popLayout">
                      {isLoadingComments ? (
                        <div className="flex flex-col items-center justify-center py-40 opacity-20">
                           <Icons.refreshCw className="h-12 w-12 animate-spin mb-6" />
                           <p className="text-[11px] font-black uppercase tracking-[0.5em] italic">Synchronizing_Frequencies...</p>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 opacity-20 border border-dashed border-white/5 rounded-[3rem]">
                           <Icons.messageSquare className="h-16 w-16 mb-6" />
                           <p className="text-[11px] font-black uppercase tracking-[0.5em] italic text-center px-12">No frequency detected in this sector.<br/>Awaiting community transmission.</p>
                        </div>
                      ) : (
                        comments.map((comment, i) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex gap-8 p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 group hover:border-primary/30 transition-all duration-700 shadow-xl relative overflow-hidden"
                          >
                             {/* Individual Comment HUD Scanline */}
                             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.02)_50%)] pointer-events-none bg-[size:100%_4px] opacity-10" />

                             <div className="h-14 w-14 rounded-2xl bg-black border border-white/10 shrink-0 overflow-hidden relative z-10 shadow-2xl">
                                {comment.snippet.topLevelComment.snippet.authorProfileImageUrl && (
                                  <img src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                )}
                             </div>
                             <div className="space-y-4 min-w-0 relative z-10 flex-1">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-4">
                                      <span className="text-[12px] font-black text-white uppercase tracking-tight italic group-hover:text-primary transition-colors">
                                        {comment.snippet.topLevelComment.snippet.authorDisplayName}
                                      </span>
                                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">
                                        {new Date(comment.snippet.topLevelComment.snippet.publishedAt).toLocaleDateString()}
                                      </span>
                                   </div>
                                   <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                         <Icons.heart className="h-3 w-3 text-primary" />
                                         <span className="text-[10px] font-black text-primary italic leading-none">
                                            {comment.snippet.topLevelComment.snippet.likeCount || 0}
                                         </span>
                                      </div>
                                   </div>
                                </div>
                                <p className="text-[13px] text-white/60 leading-relaxed italic whitespace-pre-wrap font-medium group-hover:text-white/80 transition-colors">
                                  {comment.snippet.topLevelComment.snippet.textOriginal}
                                </p>
                             </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                 </div>
              </div>

              <div className="p-10 border-t border-white/5 bg-black/40 backdrop-blur-3xl relative z-20">
                 <div className="relative group">
                    <Input 
                      placeholder="Transmitting frequency response protocol..." 
                      className="h-20 bg-white/5 border-white/10 rounded-[2rem] pl-10 pr-48 font-black uppercase text-[11px] tracking-[0.2em] italic focus:ring-primary/20 focus:border-primary/40 transition-all duration-500 placeholder:text-white/10"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                    />
                    <div className="absolute right-3 top-3 h-14">
                      <Button 
                        onClick={handlePostComment}
                        disabled={!replyText || !selectedVideoId}
                        className="h-full bg-primary text-white hover:scale-[1.05] active:scale-[0.95] rounded-[1.5rem] px-10 text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary/30 transition-all italic border border-primary/20"
                      >
                         <Icons.send className="h-4 w-4 mr-3" />
                         Transmit
                      </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
