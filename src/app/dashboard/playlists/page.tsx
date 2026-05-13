"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { getPlaylistsAction } from "@/app/dashboard/actions"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { YouTubePlaylist } from "@/types/video"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageContainer } from "@/components/layout/page-container"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getPlaylistsAction()
        if (!mounted) return
        setPlaylists((data || []) as YouTubePlaylist[])
      } catch (error) {
        console.error("Failed to fetch playlists:", error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <PageContainer>
      <PageHeader 
        title="Playlists" 
        description="Organize your video content into collections for structured channel management." 
        iconName="playCircle"
      >
        <Button className="font-bold rounded-xl h-11 px-6 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Icons.plus className="h-5 w-5 mr-2" />
          Create Playlist
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
             <div key={i} className="aspect-[3/4] rounded-[2rem] bg-card animate-pulse border border-border shadow-sm" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="py-48 flex flex-col items-center justify-center border border-dashed border-border rounded-[2.5rem] bg-muted/5">
           <Icons.playCircle className="h-20 w-20 text-muted-foreground opacity-20 mb-6" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40 italic">No playlists detected in your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {playlists.map((playlist, i) => {
              const snippet = playlist.snippet;
              if (!snippet) return null;

              const thumbnail = snippet.thumbnails?.maxres?.url || 
                                snippet.thumbnails?.standard?.url ||
                                snippet.thumbnails?.high?.url || 
                                snippet.thumbnails?.medium?.url || 
                                snippet.thumbnails?.default?.url;
              
              return (
                <motion.div
                  key={playlist.id || `playlist-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-card border-border hover:border-primary/20 transition-all rounded-[2rem] overflow-hidden group shadow-sm h-full flex flex-col">
                    <div className="aspect-video relative overflow-hidden bg-black">
                      {thumbnail ? (
                        <Image 
                          unoptimized
                          src={thumbnail} 
                          alt={snippet?.title || "Playlist"}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                           <Icons.playCircle className="h-16 w-16 text-muted-foreground/20" />
                        </div>
                      )}
                      
                      {/* Count Badge */}
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl flex items-center gap-2">
                        <Icons.list className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{playlist.contentDetails?.itemCount || 0} Videos</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            playlist.status?.privacyStatus === 'public' ? "bg-green-500" : "bg-yellow-500"
                          )} />
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {playlist.status?.privacyStatus || "private"}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {snippet?.title || "Untitled Playlist"}
                        </h3>
                        <p className="text-[11px] font-medium text-muted-foreground line-clamp-2 leading-relaxed opacity-60">
                          {snippet?.description || "No description provided."}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                         <div className="flex flex-col">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Created</span>
                            <span className="text-[10px] font-bold text-foreground/70">
                              {snippet?.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString() : "Unknown"}
                            </span>
                         </div>
                         <Button variant="ghost" size="sm" className="h-9 rounded-xl hover:bg-primary/10 hover:text-primary text-[10px] font-black uppercase tracking-widest px-4 transition-all">
                           View Details
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </PageContainer>
  )
}
