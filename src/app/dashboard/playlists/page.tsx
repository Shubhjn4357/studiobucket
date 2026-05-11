"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPlaylistsAction } from "@/app/dashboard/actions"
import { motion } from "framer-motion"
import Image from "next/image"
import { YouTubePlaylist } from "@/types/video"

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await getPlaylistsAction()
        if (!mounted) return
        setPlaylists(data as YouTubePlaylist[])
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
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.playCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none italic">Asset Collections</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Playlist Synchronization • Channel Architecture</p>
          </div>
        </div>
        <Button className="h-11 bg-white/5 text-white border-white/10 hover:bg-white/10 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest transition-all">
          <Icons.plus className="h-4 w-4 mr-2" />
          Initialize New Collection
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
             <div key={i} className="h-64 rounded-2xl bg-muted/20 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
           <Icons.playCircle className="h-16 w-16 text-muted-foreground/20 mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No synchronized playlists found on this uplink.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, i) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="cyber-card border-border bg-card/50 overflow-hidden group hover:border-primary/30 transition-all duration-500">
                <div className="aspect-video relative overflow-hidden bg-slate-900">
                  {playlist.snippet?.thumbnails?.high?.url ? (
                    <Image 
                      src={playlist.snippet.thumbnails.high.url} 
                      alt={playlist.snippet?.title || "Playlist Thumbnail"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                       <Icons.playCircle className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                     <div className="flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                        <Icons.list className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-mono text-white">{playlist.contentDetails?.itemCount || 0} Assets</span>
                     </div>
                     <span className="text-[8px] font-black text-white/50 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/10">
                       {playlist.status?.privacyStatus}
                     </span>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-black text-foreground uppercase tracking-tighter italic leading-tight group-hover:text-primary transition-colors">
                    {playlist.snippet?.title || "Untitled Collection"}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-medium text-muted-foreground line-clamp-2 leading-relaxed h-8">
                    {playlist.snippet?.description || "No transmission log available for this collection."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex items-center justify-between border-t border-white/5">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                     Created {playlist.snippet?.publishedAt ? new Date(playlist.snippet.publishedAt).toLocaleDateString() : "Unknown Date"}
                   </span>
                   <Button variant="ghost" size="sm" className="h-8 rounded-lg hover:bg-primary/10 hover:text-primary text-[9px] font-black uppercase tracking-widest">
                     Manage Collection
                   </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
