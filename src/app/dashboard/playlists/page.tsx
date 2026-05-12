"use client"

import { useEffect, useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { getPlaylistsAction } from "@/app/dashboard/actions"
import { motion, AnimatePresence } from "framer-motion"
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
    <div className="space-y-12 pb-24 relative">
      {/* Background Ambience */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Refined Header (The Inventory) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 p-12 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
        {/* HUD Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="flex items-center gap-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 group transition-transform hover:rotate-90 duration-700"
          >
            <Icons.playCircle className="h-8 w-8 text-white" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">Asset_Collections</h1>
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[11px] italic">Synchronized_Media_Architecture // Operational_Index</p>
          </div>
        </div>
        <Button className="h-16 bg-white text-black hover:bg-white/90 rounded-2xl px-12 text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5 border border-white/10 italic relative z-10">
          <Icons.plus className="h-5 w-5 mr-3" />
          Initialize_Collection
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
             <div key={i} className="h-[450px] rounded-[3rem] bg-white/[0.02] animate-pulse border border-white/5 shadow-2xl" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="py-48 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[4rem] bg-white/[0.01] relative overflow-hidden">
           {/* Scanline Effect */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] pointer-events-none bg-[size:100%_4px] opacity-20" />
           <Icons.playCircle className="h-24 w-24 text-white/5 mb-8" />
           <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white/10 italic">No collections detected in the operational grid.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
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
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="h-full"
                >
                  <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden group hover:border-primary/40 transition-all duration-700 shadow-2xl relative h-full flex flex-col">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50" />
                    
                    <div className="aspect-[4/5] relative overflow-hidden bg-black border-b border-white/5">
                      {thumbnail ? (
                        <Image 
                          unoptimized
                          src={thumbnail} 
                          alt={snippet?.title || "Collection"}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-5">
                           <Icons.playCircle className="h-32 w-32" />
                        </div>
                      )}
                      
                      {/* Gradient Mask */}
                      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-90" />
                      
                      {/* Status HUD */}
                      <div className="absolute top-8 left-8 flex items-center gap-4">
                         <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-2xl rounded-xl border border-white/10 shadow-2xl">
                            <Icons.list className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[11px] font-black text-white uppercase tracking-widest italic">{playlist.contentDetails?.itemCount || 0}_ASSETS</span>
                         </div>
                         <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute bottom-10 left-10 right-10 space-y-3">
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] italic leading-none">
                             {playlist.status?.privacyStatus || "PUBLIC_NODE"}
                           </span>
                           <div className="h-px w-8 bg-white/10" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-[1.1] group-hover:text-primary transition-colors duration-500 line-clamp-2">
                          {snippet?.title || "UNTITLED_COLLECTION"}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="p-10 flex-1 flex flex-col relative z-10">
                      <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest line-clamp-3 leading-relaxed flex-1 italic group-hover:text-white/40 transition-colors">
                        {snippet?.description || "Collection metadata manifest node empty. Awaiting signal injection."}
                      </p>
                      
                      <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
                         <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] italic">Commit_Date</span>
                            <span className="text-[11px] font-black text-white/60 uppercase tracking-widest italic">
                              {snippet?.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString() : "UNKNOWN"}
                            </span>
                         </div>
                         <Button variant="ghost" size="sm" className="h-12 rounded-xl bg-white/5 border border-white/5 hover:bg-primary hover:border-primary/20 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] px-8 transition-all italic shadow-2xl">
                           SYNC_UPLINK
                         </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
