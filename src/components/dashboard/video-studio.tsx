"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Track, Clip, VideoProject } from "@/types/video"
import Hls from "hls.js"
import { PropertiesPanel } from "@/components/studio/properties-panel"
import { Badge } from "@/components/ui/badge"

interface VideoStudioProps {
  videoId: string
  initialData?: VideoProject
  title?: string
  filePath?: string
  hlsPath?: string
}

export function VideoStudio({ initialData, title = "ALPHA_STRIKE", filePath, hlsPath }: Omit<VideoStudioProps, "videoId">) {
  const [activeTab, setActiveTab] = useState<"timeline" | "manifest" | "logic">("timeline")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [zoom, setZoom] = useState(100)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [tracks, setTracks] = useState<Track[]>(initialData?.tracks || [
    { id: "v1", name: "ALPHA_VISUAL_CORE", type: "video", clips: [] },
    { id: "v2", name: "HUD_OVERLAY_LOGIC", type: "video", clips: [] },
    { id: "a1", name: "ACOUSTIC_SPECTRUM", type: "audio", clips: [] }
  ])

  const telemetry = {
    fps: 30,
    resolution: "4K_ULTRA_HDR",
    bitrate: "45.8_MBPS",
    latency: "0.024ms",
    nodes: "NODE_SIGMA_01",
    sector: "STRIKE_04"
  }

  useEffect(() => {
    if (hlsPath && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true })
        hls.loadSource(hlsPath)
        hls.attachMedia(videoRef.current)
        return () => hls.destroy()
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = hlsPath
      }
    } else if (filePath && videoRef.current) {
        videoRef.current.src = filePath
    }
  }, [hlsPath, filePath])

  const handleUpdateClip = (updatedClip: Partial<Clip>) => {
    if (!selectedClip) return
    const newTracks = tracks.map(track => ({
      ...track,
      clips: track.clips.map(c => c.id === selectedClip.id ? { ...c, ...updatedClip } : c)
    }))
    setTracks(newTracks)
    setSelectedClip({ ...selectedClip, ...updatedClip })
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    const ms = Math.floor((time % 1) * 1000)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-2 p-2 bg-background relative overflow-hidden">
      <div className="absolute inset-0 tactical-grid opacity-5 pointer-events-none" />
      
      {/* Tactical Header */}
      <div className="h-10 micro-border bg-surface flex items-center justify-between px-3 relative z-10 hud-corner">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="h-6 w-6 bg-primary flex items-center justify-center rounded-sm shadow-sm">
                  <Icons.cpu className="h-3.5 w-3.5 text-white" />
               </div>
               <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 leading-none">
                     <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                     <span className="text-[7px] font-black text-primary uppercase tracking-widest italic">Command_Studio_Online</span>
                  </div>
                  <span className="text-[11px] font-black text-foreground uppercase tracking-tight italic">{title}</span>
               </div>
            </div>
            <div className="h-5 w-px bg-border mx-1" />
            <nav className="flex items-center gap-0.5">
               {["Timeline", "Manifest", "Logic"].map(tab => (
                 <Button 
                   key={tab} 
                   variant="ghost" 
                   onClick={() => setActiveTab(tab.toLowerCase() as "timeline" | "manifest" | "logic")}
                   className={cn(
                     "h-6 px-3 text-[8px] font-black uppercase tracking-widest italic rounded-sm transition-all",
                     activeTab === tab.toLowerCase() ? "bg-primary text-white" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                   )}
                 >
                   {tab}
                 </Button>
               ))}
            </nav>
         </div>

         <div className="flex items-center gap-2">
            <Button variant="outline" className="h-6 px-3 text-[8px] font-black uppercase tracking-widest italic border-border hover:bg-primary/5 hover:text-primary rounded-sm">
               Sync_Nodes
            </Button>
            <Button className="h-6 px-4 bg-primary text-white text-[8px] font-black uppercase tracking-widest italic hover:bg-primary/90 rounded-sm">
               Deploy_Strike
            </Button>
         </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0 relative z-10">
         {/* Sector_A: Visual Feed */}
         <div className="col-span-12 lg:col-span-9 flex flex-col gap-2 min-h-0">
            <div className="flex-1 bg-black micro-border relative overflow-hidden group rounded-sm shadow-inner">
               <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
               
               {/* HUD Overlays */}
               <div className="absolute inset-0 z-20 pointer-events-none p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                           <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                           <span className="text-[8px] font-black text-white uppercase tracking-widest italic">{telemetry.nodes}</span>
                           <Badge variant="outline" className="h-3 px-1 border-success/30 bg-success/5 text-success text-[5px] font-black uppercase tracking-widest">UPLINK_STABLE</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-x-3 gap-y-0.5">
                           {[{k:"FPS",v:telemetry.fps},{k:"BIT",v:telemetry.bitrate},{k:"RES",v:telemetry.resolution.split('_')[0]}].map(s => (
                             <div key={s.k} className="flex items-center gap-1">
                                <span className="text-[6px] text-white/30 font-black uppercase">{s.k}:</span>
                                <span className="text-[7px] text-white/70 font-black">{s.v}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="bg-black/60 border border-white/5 p-1 rounded-sm text-right">
                        <span className="text-[6px] text-white/30 font-black block uppercase leading-none mb-0.5">Latency</span>
                        <span className="text-[10px] text-white font-black block italic leading-none">{telemetry.latency}</span>
                     </div>
                  </div>

                  <div className="flex justify-between items-end">
                     <div className="space-y-1">
                        <div className="flex items-baseline gap-1 leading-none">
                           <span className="text-2xl font-black italic text-white tracking-tighter">{formatTime(currentTime).split('.')[0]}</span>
                           <span className="text-[10px] font-black text-primary italic opacity-70">.{formatTime(currentTime).split('.')[1]}</span>
                        </div>
                     </div>
                     <div className="flex gap-1">
                        {[Icons.maximize, Icons.monitor].map((Icon, i) => (
                          <div key={i} className="h-5 w-5 bg-black/40 border border-white/5 rounded-sm flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors pointer-events-auto">
                             <Icon className="h-2.5 w-2.5 text-white/30" />
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               <video 
                 ref={videoRef}
                 onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                 onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                 className="w-full h-full object-contain"
               />
               
               <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-30">
                  <div className="h-full bg-primary" style={{ width: `${(currentTime / duration) * 100}%` }} />
               </div>
            </div>

            {/* Sector_B: Temporal Grid (Timeline) */}
            <div className="h-40 micro-border bg-surface flex flex-col overflow-hidden rounded-sm shadow-sm relative">
               <div className="absolute inset-0 tactical-grid opacity-5 pointer-events-none" />
               
               <div className="h-6 border-b border-border bg-muted/20 flex items-center justify-between px-3 relative z-20">
                  <div className="flex items-center gap-3">
                     <span className="text-[8px] font-black text-foreground uppercase tracking-[0.2em] italic">Temporal_Grid</span>
                     <Badge className="h-3 px-1.5 bg-primary/10 border-primary/20 text-primary text-[5px] font-black uppercase">LOCKED_STABLE</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-[8px] font-mono text-muted-foreground">{formatTime(currentTime)} / {formatTime(duration)}</span>
                     <div className="flex items-center gap-1 border-l border-border pl-3">
                        <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => setZoom(Math.max(10, zoom-10))}><Icons.zoomOut className="h-2.5 w-2.5" /></Button>
                        <span className="text-[7px] font-black text-muted-foreground w-6 text-center">{zoom}%</span>
                        <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => setZoom(Math.min(200, zoom+10))}><Icons.zoomIn className="h-2.5 w-2.5" /></Button>
                     </div>
                  </div>
               </div>

               <div className="flex-1 overflow-x-auto custom-scrollbar relative z-10 no-drag">
                  <div className="min-w-full flex flex-col" style={{ width: `${zoom}%` }}>
                     {tracks.map(track => (
                       <div key={track.id} className="h-8 border-b border-border/40 flex group/track relative">
                          <div className="w-32 bg-muted/30 border-r border-border shrink-0 flex items-center px-2 sticky left-0 z-30">
                             <span className="text-[7px] font-black text-muted-foreground uppercase tracking-tighter truncate group-hover/track:text-primary transition-colors">{track.name}</span>
                          </div>
                          <div className="flex-1 relative bg-background/20 overflow-hidden">
                             {/* Grid Lines */}
                             <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                                {Array.from({length: 10}).map((_, i) => <div key={i} className="w-px h-full bg-border" />)}
                             </div>
                             {track.clips.map(clip => (
                               <div 
                                 key={clip.id}
                                 onClick={() => setSelectedClip(clip)}
                                 className={cn(
                                   "absolute top-1 bottom-1 rounded-sm border flex flex-col justify-center px-1.5 cursor-pointer transition-all shadow-sm",
                                   selectedClip?.id === clip.id ? "bg-primary border-primary" : "bg-surface border-border hover:border-primary/40"
                                 )}
                                 style={{
                                   left: `${(clip.start / duration) * 100}%`,
                                   width: `${((clip.end - clip.start) / duration) * 100}%`
                                 }}
                               >
                                  <div className="flex items-center gap-1 overflow-hidden">
                                     <Icons.video className={cn("h-2 w-2 shrink-0", selectedClip?.id === clip.id ? "text-white" : "text-primary")} />
                                     <span className={cn("text-[6px] font-black uppercase italic truncate", selectedClip?.id === clip.id ? "text-white" : "text-foreground")}>{clip.name}</span>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
                  {/* Playhead */}
                  <div 
                    className="absolute top-0 bottom-0 w-px bg-primary z-40 pointer-events-none"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  >
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
                  </div>
               </div>

               {/* Transport Bar */}
               <div className="h-6 border-t border-border flex items-center justify-center gap-4 bg-muted/10 relative z-20">
                  {[Icons.skipBack, isPlaying ? Icons.pause : Icons.play, Icons.skipForward].map((Icon, i) => (
                    <Button 
                      key={i} 
                      size="icon" 
                      variant="ghost" 
                      onClick={i === 1 ? togglePlayback : undefined}
                      className="h-5 w-5 hover:text-primary transition-colors"
                    >
                       <Icon className={i === 1 ? "h-3 w-3" : "h-2 w-2"} />
                    </Button>
                  ))}
               </div>
            </div>
         </div>

         {/* Sector_C: Tactical Inspector */}
         <div className="col-span-12 lg:col-span-3 flex flex-col gap-2 min-h-0">
            <div className="flex-1 micro-border bg-surface flex flex-col overflow-hidden rounded-sm shadow-sm hud-corner">
               <div className="absolute inset-0 tactical-grid opacity-5 pointer-events-none" />
               <div className="h-7 border-b border-border bg-muted/20 flex items-center justify-between px-3 relative z-10">
                  <div className="flex items-center gap-2">
                     <Icons.search className="h-3 w-3 text-primary" />
                     <span className="text-[8px] font-black text-foreground uppercase tracking-widest italic">Inspector_Alpha</span>
                  </div>
                  <Badge variant="secondary" className="h-3 px-1 text-[5px] font-black uppercase">SECTOR_04</Badge>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar p-3 relative z-10">
                  <PropertiesPanel clip={selectedClip} onUpdate={handleUpdateClip} />
               </div>
            </div>

            {/* Telemetry Block */}
            <div className="h-32 micro-border bg-surface p-3 relative overflow-hidden rounded-sm shadow-sm">
               <div className="absolute inset-0 tactical-grid opacity-5 pointer-events-none" />
               <div className="relative z-10 space-y-2">
                  <h3 className="text-[8px] font-black text-primary uppercase tracking-[0.2em] italic">Sector_Telemetry</h3>
                  <div className="grid grid-cols-2 gap-2">
                     {[
                       {l:"Grid_Node",v:telemetry.nodes},
                       {l:"Sector",v:telemetry.sector},
                       {l:"Protocol",v:"ALPHA_X"},
                       {l:"Status",v:"NOMINAL"}
                     ].map(t => (
                       <div key={t.l} className="space-y-0.5">
                          <p className="text-[6px] text-muted-foreground font-black uppercase">{t.l}</p>
                          <p className="text-[8px] text-foreground font-black italic">{t.v}</p>
                       </div>
                     ))}
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="space-y-1">
                     <div className="flex justify-between items-center text-[6px] font-black text-primary/40 uppercase">
                        <span>Sync_Protocol</span>
                        <span>Locked</span>
                     </div>
                     <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/40 w-full" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
