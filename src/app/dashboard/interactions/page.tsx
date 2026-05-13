"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getVideosAction, getCommentsAction, postCommentAction } from "@/app/dashboard/actions"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { YouTubeComment, VideoWithStats } from "@/types/video"
import Image from "next/image"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

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
      toast.success("Comment posted successfully")
      setReplyText("")
      const data = await getCommentsAction(selectedVideoId)
      setComments(data as YouTubeComment[])
    } catch {
      toast.error("Failed to post comment")
    }
  }


  return (
    <PageContainer>
      <PageHeader 
        title="Community" 
        description="Engage with your audience, manage comments, and build your community across platforms." 
        iconName="messageSquare"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Video Selector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
           <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Video</span>
              <span className="text-[10px] font-bold text-primary uppercase">{videos.length} Active</span>
           </div>
           <ScrollArea className="h-[calc(100vh-24rem)] pr-4">
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl bg-card animate-pulse border border-border" />
                  ))
                ) : (
                  videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideoId(video.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all duration-300 text-left flex items-center gap-4 group relative overflow-hidden",
                        selectedVideoId === video.id 
                          ? "border-primary/40 bg-primary/5 shadow-sm" 
                          : "border-border bg-card hover:border-primary/20"
                      )}
                    >
                      <div className="h-14 w-24 rounded-xl bg-muted border border-border overflow-hidden shrink-0 relative">
                         {video.thumbnailPath ? (
                           <Image 
                             src={video.thumbnailPath} 
                             alt={video.title}
                             fill
                             unoptimized
                             className="h-full w-full object-cover transition-opacity" 
                           />
                         ) : (
                           <div className="h-full w-full flex items-center justify-center">
                             <Icons.video className="h-6 w-6 text-muted-foreground/20" />
                           </div>
                         )}
                      </div>
                      <div className="min-w-0 space-y-1">
                         <p className={cn(
                           "text-xs font-bold truncate leading-tight",
                           selectedVideoId === video.id ? "text-primary" : "text-foreground"
                         )}>{video.title}</p>
                         <div className="flex items-center gap-2">
                           <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                             {video.views?.toLocaleString() || 0} Views
                           </span>
                         </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
           </ScrollArea>
        </div>

        {/* Comment Thread */}
        <div className="lg:col-span-8">
           <Card className="bg-card border-border rounded-[2rem] flex flex-col shadow-sm overflow-hidden min-h-[600px]">
              <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
                 <div>
                    <h2 className="text-lg font-bold text-foreground">Comments Feed</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Real-time community engagement</p>
                 </div>
                 <div className="flex items-center gap-4 border-l border-border pl-8">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live Sync Active</span>
                 </div>
              </div>

              <ScrollArea className="flex-1 max-h-[600px]">
                 <CardContent className="p-8 space-y-8">
                    <AnimatePresence mode="popLayout">
                      {isLoadingComments ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-20">
                           <Icons.refreshCw className="h-10 w-10 animate-spin mb-6" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Feed...</p>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-20 border border-dashed border-border rounded-3xl">
                           <Icons.messageSquare className="h-16 w-16 mb-6" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-center px-12">No comments found for this video.</p>
                        </div>
                      ) : (
                        comments.map((comment, i) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex gap-6 p-6 rounded-3xl bg-muted/30 border border-border group hover:border-primary/20 transition-all shadow-sm"
                          >
                             <div className="h-12 w-12 rounded-xl bg-muted border border-border shrink-0 overflow-hidden shadow-sm">
                                {comment.snippet.topLevelComment.snippet.authorProfileImageUrl && (
                                  <Image 
                                    src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} 
                                    alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
                                    fill
                                    unoptimized
                                    className="h-full w-full object-cover" 
                                  />
                                )}
                             </div>
                             <div className="space-y-3 min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <span className="text-sm font-bold text-foreground">
                                        {comment.snippet.topLevelComment.snippet.authorDisplayName}
                                      </span>
                                      <span className="text-[10px] font-bold text-muted-foreground opacity-60">
                                        {new Date(comment.snippet.topLevelComment.snippet.publishedAt).toLocaleDateString()}
                                      </span>
                                   </div>
                                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                                      <Icons.heart className="h-3 w-3 text-primary" />
                                      <span className="text-[10px] font-black text-primary italic leading-none">
                                         {comment.snippet.topLevelComment.snippet.likeCount || 0}
                                      </span>
                                   </div>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                  {comment.snippet.topLevelComment.snippet.textOriginal}
                                </p>
                             </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                 </CardContent>
              </ScrollArea>

              <div className="p-8 border-t border-border bg-card">
                 <div className="relative">
                    <Input 
                      placeholder="Write a response..." 
                      className="h-16 bg-muted/40 border-border rounded-2xl pl-6 pr-40 text-sm focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                    />
                    <div className="absolute right-2 top-2 h-12">
                      <Button 
                        onClick={handlePostComment}
                        disabled={!replyText || !selectedVideoId}
                        className="h-full font-bold rounded-xl px-8 shadow-lg shadow-primary/10 transition-all"
                      >
                         <Icons.send className="h-4 w-4 mr-2" />
                         Post
                      </Button>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </PageContainer>
  )
}
