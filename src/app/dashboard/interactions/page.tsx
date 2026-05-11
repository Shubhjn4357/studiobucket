"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
      // Reload comments
      const data = await getCommentsAction(selectedVideoId)
      setComments(data as YouTubeComment[])
    } catch {
      toast.error("Transmission failed")
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.messageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none italic">Community Hub</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Audience Interactions • Engagement Node</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Video Selector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
           <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Signal Selection</span>
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">{videos.length} Channels</span>
           </div>
           <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/20 animate-pulse border border-white/5" />
                ))
              ) : (
                videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideoId(video.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 group",
                      selectedVideoId === video.id 
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                        : "border-border bg-card/50 hover:border-primary/30"
                    )}
                  >
                    <div className="h-10 w-10 rounded-lg bg-slate-900 border border-white/5 overflow-hidden shrink-0">
                       {video.thumbnailPath && <img src={video.thumbnailPath} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                       <p className={cn(
                         "text-[10px] font-black uppercase tracking-tight truncate",
                         selectedVideoId === video.id ? "text-primary" : "text-foreground"
                       )}>{video.title}</p>
                       <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                         {video.views?.toLocaleString() || 0} Views
                       </p>
                    </div>
                  </button>
                ))
              )}
           </div>
        </div>

        {/* Comment Thread */}
        <div className="lg:col-span-8">
           <Card className="cyber-card border-border bg-card/50 min-h-[600px] flex flex-col">
              <CardHeader className="border-b border-white/5 pb-6">
                 <div className="flex items-center justify-between">
                    <div>
                       <CardTitle className="text-xl font-black uppercase italic tracking-tighter text-foreground">Transmission Feed</CardTitle>
                       <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Monitoring community frequencies in real-time</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Uplink Active</span>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                 <div className="p-6 space-y-6">
                    {isLoadingComments ? (
                      <div className="flex flex-col items-center justify-center py-20 opacity-20">
                         <Icons.refreshCw className="h-10 w-10 animate-spin mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Feed...</p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 opacity-20">
                         <Icons.messageSquare className="h-12 w-12 mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">No frequencies detected in this sector.</p>
                      </div>
                    ) : (
                      comments.map((comment, i) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all"
                        >
                           <div className="h-10 w-10 rounded-full bg-linear-to-br from-slate-800 to-slate-900 border border-white/10 shrink-0 overflow-hidden">
                              {comment.snippet.topLevelComment.snippet.authorProfileImageUrl && (
                                <img src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} className="h-full w-full object-cover" />
                              )}
                           </div>
                           <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] font-black text-foreground uppercase tracking-tight italic">
                                   {comment.snippet.topLevelComment.snippet.authorDisplayName}
                                 </span>
                                 <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                   {new Date(comment.snippet.topLevelComment.snippet.publishedAt).toLocaleDateString()}
                                 </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {comment.snippet.topLevelComment.snippet.textOriginal}
                              </p>
                              <div className="flex items-center gap-4 pt-2">
                                 <button className="flex items-center gap-1 text-[9px] font-black text-muted-foreground hover:text-primary transition-colors">
                                    <Icons.heart className="h-3 w-3" />
                                    {comment.snippet.topLevelComment.snippet.likeCount || 0}
                                 </button>
                                 <button className="text-[9px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                                    Reply
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                      ))
                    )}
                 </div>
              </CardContent>
              <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-3xl">
                 <div className="relative">
                    <Input 
                      placeholder="Input frequency to transmit..." 
                      className="h-14 bg-white/5 border-white/10 rounded-2xl pl-6 pr-32 font-medium focus:ring-primary/20 transition-all"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                    />
                    <Button 
                      onClick={handlePostComment}
                      disabled={!replyText || !selectedVideoId}
                      className="absolute right-2 top-2 h-10 bg-primary text-white hover:opacity-90 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest"
                    >
                       Transmit
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
