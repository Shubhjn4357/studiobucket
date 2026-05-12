"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { updateVideoMetadata, triggerExportAction, getJobStatusAction } from "@/app/dashboard/studio/actions"
import { toast } from "sonner"
import { Track, Clip, VideoProject } from "@/types/video"
import { motion, AnimatePresence } from "framer-motion"
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

export function VideoStudio({ videoId, initialData, title = "ALPHA_STRIKE", filePath, hlsPath }: VideoStudioProps) {
  const [activeTab, setActiveTab] = useState<"editor" | "details" | "telemetry">("editor")
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [activeExportJobId, setActiveExportJobId] = useState<string | null>(null)
  const [localTitle, setLocalTitle] = useState(title)
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [visibility, setVisibility] = useState("Public")
  const [category, setCategory] = useState("Entertainment")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [zoom, setZoom] = useState(100)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [tracks, setTracks] = useState<Track[]>(initialData?.tracks || [
    { id: "v1", name: "Alpha Visual Core", type: "video", clips: [] },
    { id: "v2", name: "HUD Overlay Logic", type: "video", clips: [] },
    { id: "a1", name: "Acoustic Spectrum", type: "audio", clips: [] }
  ])

  const [telemetry] = useState({
    fps: 30,
    resolution: "4K_ULTRA_HDR",
    bitrate: "45.8_MBPS",
    codec: "AV1_ALPHA_CORE",
    color: "REC.2020_PRO",
    thermal: "34°C",
    load: "12.4%",
    nodes: "8_STRIKE_CORES"
  })

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeExportJobId && isExporting) {
      interval = setInterval(async () => {
        try {
          const status = await getJobStatusAction("export-queue", activeExportJobId)
          if (status) {
            setExportProgress(typeof status.progress === 'number' ? status.progress : 0)
            if (status.status === "completed") {
              setIsExporting(false)
              setActiveExportJobId(null)
              toast.success("Deployment Protocol Finalized")
            } else if (status.status === "failed") {
              setIsExporting(false)
              setActiveExportJobId(null)
              toast.error("Transmission Core Failure")
            }
          }
        } catch (error) {
          console.error("Telemetry sync error:", error)
        }
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [activeExportJobId, isExporting])

  useEffect(() => {
    if (hlsPath && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        })
        hls.loadSource(hlsPath)
        hls.attachMedia(videoRef.current)
        return () => hls.destroy()
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = hlsPath
      }
    }
  }, [hlsPath])

  const handleUpdateClip = (updatedClip: Partial<Clip>) => {
    if (!selectedClip) return
    const newTracks = tracks.map(track => ({
      ...track,
      clips: track.clips.map(c => c.id === selectedClip.id ? { ...c, ...updatedClip } : c)
    }))
    setTracks(newTracks)
    setSelectedClip({ ...selectedClip, ...updatedClip })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateVideoMetadata(videoId, {
        title: localTitle,
        tracks: tracks,
      })
      toast.success("Protocol states synchronized")
    } catch {
      toast.error("Signal synchronization failure")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const project: VideoProject = {
        tracks,
        duration,
        resolution: { width: 3840, height: 2160 },
        fps: 30
      }
      const job = await triggerExportAction(videoId, project)
      if (job?.id) {
         setActiveExportJobId(job.id)
         setExportProgress(0)
         toast.success("Alpha_Strike render initiated")
      }
    } catch {
      toast.error("Deployment protocol initialization failed")
    } finally {
      setIsExporting(false)
    }
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    const ms = Math.floor((time % 1) * 1000)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4 p-4 relative overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute inset-0 industrial-grid pointer-events-none opacity-[0.03]" />
      
      {/* Top Controller HUD */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface border border-border rounded-md shadow-sm relative overflow-hidden shrink-0">
        <div className="flex items-center gap-8 relative z-10">
           <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 1, ease: "circOut" }}
                className="h-10 w-10 rounded-md bg-primary flex items-center justify-center shadow-lg relative cursor-pointer"
              >
                 <Icons.cpu className="h-5 w-5 text-white" />
              </motion.div>
              <div className="flex flex-col">
                 <div className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] italic leading-none">Command_Core_Online</span>
                    <Badge variant="outline" className="rounded-sm bg-primary/5 border-primary/20 text-[7px] font-black uppercase text-primary px-2 tracking-widest h-4">STATION_V4</Badge>
                 </div>
                 <h2 className="text-xl font-black text-foreground uppercase tracking-tighter italic mt-1 leading-none">{localTitle}</h2>
              </div>
           </div>
           
           <div className="h-8 w-px bg-border mx-2" />
           
           <nav className="flex items-center gap-1 p-1 rounded-md bg-muted/50 border border-border">
              {[
                { id: "editor", label: "Timeline", icon: Icons.layers },
                { id: "details", label: "Manifest", icon: Icons.fileText },
                { id: "telemetry", label: "Logic", icon: Icons.activity }
              ].map((tab) => (
                <Button 
                  key={tab.id}
                  variant="ghost" 
                  onClick={() => setActiveTab(tab.id as "editor" | "details" | "telemetry")} 
                  className={cn(
                    "h-8 px-4 rounded-sm text-[9px] font-black uppercase tracking-[0.1em] italic transition-all relative",
                    activeTab === tab.id ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <tab.icon className={cn("h-3.5 w-3.5 mr-2", activeTab === tab.id ? "" : "opacity-40")} />
                  {tab.label}
                </Button>
              ))}
           </nav>
        </div>

        <div className="flex items-center gap-4 relative z-10">
           <Button variant="outline" onClick={handleSave} disabled={isSaving} className="h-9 rounded-sm border-border bg-background hover:bg-secondary/50 px-6 text-[10px] font-black uppercase tracking-widest italic text-muted-foreground hover:text-foreground">
             {isSaving ? <Icons.refreshCw className="h-3.5 w-3.5 animate-spin mr-2" /> : <Icons.save className="h-3.5 w-3.5 mr-2" />}
             Sync_Nodes
           </Button>
           <Button onClick={handleExport} disabled={isExporting} className="h-9 rounded-sm bg-primary text-white hover:bg-primary/90 px-8 text-[10px] font-black uppercase tracking-widest italic shadow-sm transition-all active:scale-95">
             {isExporting ? (
               <div className="flex items-center gap-2">
                 <Icons.refreshCw className="h-3.5 w-3.5 animate-spin" />
                 <span>RENDERING_{exportProgress}%</span>
               </div>
             ) : (
               <>
                 <Icons.zap className="h-3.5 w-3.5 mr-2" />
                 Deploy_Strike
               </>
             )}
           </Button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 relative">
        {/* Main Workspace */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 min-h-0 relative">
          <AnimatePresence mode="wait">
            {activeTab === "editor" ? (
              <motion.div 
                key="editor"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-4 h-full min-h-0"
              >
                {/* Compact Preview Box */}
                <div className="flex-1 bg-black border border-border rounded-md relative overflow-hidden group shadow-md">
                   {/* Master Grid Overlay */}
                   <div className="absolute inset-0 industrial-grid opacity-10 pointer-events-none" />
                   
                   {/* Dynamic HUD Overlays */}
                   <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                         <div className="flex flex-col gap-2 font-mono">
                            <div className="flex items-center gap-3">
                               <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                               <span className="text-[10px] font-black text-white uppercase tracking-widest italic">NODE_SIGMA_01</span>
                               <Badge variant="outline" className="border-success/30 text-success bg-success/5 text-[7px] font-black uppercase tracking-widest h-4 px-2">UPLINK_STABLE</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-2">
                               {[
                                 { k: "FPS", v: telemetry.fps },
                                 { k: "BITRATE", v: telemetry.bitrate },
                                 { k: "RES", v: telemetry.resolution.split('_')[0] },
                               ].map(stat => (
                                 <div key={stat.k} className="flex items-center gap-2">
                                    <span className="text-[8px] text-white/30 uppercase font-black">{stat.k}:</span>
                                    <span className="text-[9px] text-white/60 font-black tracking-widest">{stat.v}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="text-right flex flex-col gap-4">
                            <div className="bg-black/60 border border-white/10 p-2 rounded-sm flex flex-col items-end gap-0.5">
                               <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">Latency</span>
                               <span className="text-[14px] font-black text-white italic leading-none">0.024ms</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex justify-between items-end">
                         <div className="flex flex-col gap-2">
                            <div className="flex items-baseline gap-2">
                               <span className="text-4xl font-black italic text-white tracking-tighter leading-none">{formatTime(currentTime).split('.')[0]}</span>
                               <span className="text-lg font-black text-primary italic tracking-tighter leading-none opacity-60">.{formatTime(currentTime).split('.')[1]}</span>
                            </div>
                         </div>
                         <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-3 p-1 rounded-sm bg-black/40 border border-white/10">
                               {[Icons.maximize, Icons.monitor, Icons.cast].map((Icon, i) => (
                                 <Button key={i} size="icon" variant="ghost" className="h-7 w-7 rounded-sm hover:bg-white/5">
                                    <Icon className="h-3.5 w-3.5 text-white/20 hover:text-white transition-colors" />
                                 </Button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   <video 
                      ref={videoRef}
                      src={!hlsPath ? filePath : undefined}
                      className="w-full h-full object-contain relative z-0"
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onLoadedMetadata={(e) => {
                        setDuration(e.currentTarget.duration)
                        if (tracks[0].clips.length === 0) {
                          setTracks(prev => prev.map((t, i) => i === 0 ? {
                            ...t, clips: [{ id: "main-clip", start: 0, end: e.currentTarget.duration, duration: e.currentTarget.duration, color: "bg-primary/20", offset: 0, opacity: 1, volume: 1 }]
                          } : t))
                        }
                      }}
                   />

                   {/* Center Playback Controller (Hover Only) */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                      <Button onClick={togglePlayback} className="h-16 w-16 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl hover:scale-110 transition-all hover:border-primary/40 pointer-events-auto">
                         {isPlaying ? <Icons.pause className="h-6 w-6 text-white fill-white" /> : <Icons.play className="h-6 w-6 text-white fill-white ml-1" />}
                      </Button>
                   </div>
                   
                   {/* Bottom Progress HUD */}
                   <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 px-4 py-3 rounded-md bg-black/80 backdrop-blur-lg border border-white/10 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                      <Button onClick={togglePlayback} size="icon" variant="ghost" className="h-8 w-8 rounded-sm bg-white/5 border border-white/5 hover:bg-primary hover:text-white transition-all">
                        {isPlaying ? <Icons.pause className="h-4 w-4" /> : <Icons.play className="h-4 w-4 ml-0.5" />}
                      </Button>
                      <div className="flex flex-col min-w-[50px]">
                        <span className="text-[11px] font-black text-white italic tracking-tighter leading-none">{formatTime(currentTime).split('.')[0]}</span>
                        <span className="text-[7px] text-primary font-black uppercase tracking-widest mt-0.5">TIME</span>
                      </div>
                      <Slider 
                        value={[currentTime]} 
                        max={duration} 
                        step={0.01}
                        onValueChange={([v]) => {
                          if (videoRef.current) videoRef.current.currentTime = v
                        }}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-4">
                         <div className="flex flex-col items-end min-w-[50px]">
                            <span className="text-[11px] font-black text-white/40 italic tracking-tighter leading-none">{formatTime(duration).split('.')[0]}</span>
                            <span className="text-[7px] text-white/20 font-black uppercase tracking-widest mt-0.5">TOTAL</span>
                         </div>
                         <div className="h-6 w-px bg-white/5" />
                         <Button size="icon" variant="ghost" className="h-8 w-8 rounded-sm hover:bg-white/10 text-white/20 hover:text-white transition-all">
                           <Icons.volume2 className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                </div>


                {/* Industrial Timeline Console */}
                <div className="h-[280px] bg-surface border border-border rounded-md p-4 flex flex-col gap-4 shadow-sm relative overflow-hidden group/timeline">
                   <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-1 p-1 rounded-md bg-muted/50 border border-border">
                            {[
                              { icon: Icons.scissors, label: "CUT" },
                              { icon: Icons.type, label: "TYPE" },
                              { icon: Icons.music, label: "AUDIO" },
                              { icon: Icons.layers, label: "FX" },
                            ].map((Tool, i) => (
                              <Button key={i} size="icon" variant="ghost" className="h-8 w-8 rounded-sm hover:bg-primary/10 group transition-all">
                                 <Tool.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all" />
                              </Button>
                            ))}
                         </div>
                         <div className="h-8 w-px bg-border mx-1" />
                         <div className="flex flex-col">
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest italic leading-none">TEMPORAL_LOCK</span>
                            <div className="flex items-baseline gap-2">
                               <span className="text-xl font-black text-foreground italic tracking-tighter font-mono leading-none">{formatTime(currentTime)}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-6">
                         <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic">Zoom</span>
                            <div className="flex items-center gap-3 mt-1">
                               <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-foreground/5" onClick={() => setZoom(Math.max(10, zoom - 10))}>
                                  <Icons.minus className="h-3 w-3 text-muted-foreground" />
                               </Button>
                               <span className="text-[10px] font-black text-primary uppercase w-10 text-center italic">{zoom}%</span>
                               <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-foreground/5" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                                  <Icons.plus className="h-3 w-3 text-muted-foreground" />
                                </Button>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                      <div className="space-y-2 relative min-h-full">
                         {/* Timeline Ruler */}
                         <div className="h-6 w-full flex items-end gap-1 mb-4 opacity-10 sticky top-0 bg-transparent z-10">
                            {Array.from({ length: 120 }).map((_, i) => (
                              <div key={i} className={cn("bg-foreground shrink-0", i % 10 === 0 ? "h-4 w-px" : "h-2 w-px")} style={{ marginLeft: "49px" }} />
                            ))}
                         </div>

                        {tracks.map((track) => (
                          <div key={track.id} className="h-14 flex items-center group rounded-sm bg-muted/20 border border-border/50 hover:border-border transition-all overflow-hidden">
                            <div className="w-48 flex items-center gap-3 px-4 shrink-0 border-r border-border h-full bg-muted/50 relative overflow-hidden group/trackhead">
                              <div className="absolute inset-y-0 left-0 w-1 bg-primary/20 group-hover/trackhead:bg-primary transition-all" />
                              <div className={cn("h-8 w-8 rounded-sm flex items-center justify-center border border-border shadow-sm", 
                                track.type === "video" ? "bg-primary/5 text-primary" : "bg-success/5 text-success"
                              )}>
                                 {track.type === "video" ? <Icons.video className="h-4 w-4" /> : <Icons.music className="h-4 w-4" />}
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-[10px] font-black uppercase tracking-tight text-foreground italic truncate leading-none">{track.name}</span>
                                <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest italic">CORE_SYNC</span>
                              </div>
                            </div>
                            
                            <div className="flex-1 h-10 relative mx-4 rounded-sm bg-background overflow-hidden border border-border">
                              {track.clips.map(clip => (
                                <motion.div 
                                  key={clip.id} 
                                  onClick={() => setSelectedClip(clip)}
                                  className={cn(
                                    "absolute h-full rounded-sm border transition-all cursor-pointer group/clip flex items-center px-3 overflow-hidden",
                                    selectedClip?.id === clip.id ? "border-primary bg-primary/10 shadow-sm z-10" : "border-border/50 bg-muted/10 hover:border-border",
                                  )}
                                  style={{ 
                                    left: `${(clip.start / duration) * 100}%`, 
                                    width: `${(clip.duration / duration) * 100}%`,
                                  }}
                                >
                                   {track.type === "video" && (
                                     <div className="flex items-center gap-2">
                                        <Icons.film className={cn("h-3 w-3", selectedClip?.id === clip.id ? "text-primary" : "text-muted-foreground/30")} />
                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic truncate">SEGMENT</span>
                                     </div>
                                   )}
                                   {selectedClip?.id === clip.id && (
                                     <>
                                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary cursor-ew-resize" />
                                       <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary cursor-ew-resize" />
                                     </>
                                   )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {/* Playhead Vertical Line */}
                        <div 
                          className="absolute top-0 bottom-0 w-px bg-primary z-50 pointer-events-none"
                          style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: "192px" }}
                        >
                           <div className="h-4 w-4 bg-primary rounded-full -ml-[8px] -mt-2 shadow-lg border-2 border-background relative">
                              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase tracking-wider rounded shadow-md italic whitespace-nowrap">
                                 {formatTime(currentTime)}
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            ) : activeTab === "details" ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 bg-surface border border-border rounded-md p-6 shadow-sm overflow-y-auto custom-scrollbar relative"
              >
                 <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
                 
                 <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                         <span className="text-[10px] font-black text-primary uppercase tracking-widest italic leading-none">Manifest_Protocol_Active</span>
                      </div>
                      <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none">Global_Metadata_Forge</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-8">
                          <div className="space-y-3">
                             <div className="flex justify-between items-center px-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Transmission_ID</label>
                                <span className="text-[8px] font-black text-primary italic">REQUIRED</span>
                             </div>
                             <Input 
                               value={localTitle} 
                               onChange={(_e) => setLocalTitle(_e.target.value)}
                               className="bg-muted/50 border-border h-10 rounded-sm px-4 text-sm font-bold tracking-tight text-foreground focus:border-primary/40 transition-all uppercase italic" 
                             />
                          </div>

                          <div className="space-y-3">
                             <div className="flex justify-between items-center px-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Visual_Identifier</label>
                             </div>
                             <div className="aspect-video w-full bg-muted/50 border border-dashed border-border rounded-sm flex flex-col items-center justify-center group/thumb cursor-pointer hover:border-primary/40 transition-all relative overflow-hidden">
                                <div className="h-12 w-12 rounded-sm bg-foreground/5 flex items-center justify-center group-hover/thumb:bg-primary/10 transition-all relative z-10">
                                   <Icons.image className="h-6 w-6 text-muted-foreground group-hover/thumb:text-primary transition-colors" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover/thumb:text-foreground mt-4 relative z-10">Inject_Asset</span>
                             </div>
                          </div>

                          <div className="space-y-3">
                             <div className="flex justify-between items-center px-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Signal_Description</label>
                             </div>
                             <textarea 
                               value={description}
                               onChange={(_e) => setDescription(_e.target.value)}
                               rows={6}
                               placeholder="Inject protocol details..."
                               className="w-full bg-muted/50 border border-border rounded-sm p-4 text-xs font-bold text-foreground focus:border-primary/40 transition-all outline-none resize-none custom-scrollbar italic"
                             />
                          </div>
                       </div>

                       <div className="space-y-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-2">Visibility_Spectrum</label>
                             <div className="grid grid-cols-1 gap-2">
                                {["Public", "Unlisted", "Private"].map((tier) => (
                                  <Button 
                                    key={tier} 
                                    variant="ghost" 
                                    onClick={() => setVisibility(tier)}
                                    className={cn(
                                      "h-12 rounded-sm bg-muted/20 border transition-all px-4 flex items-center justify-between",
                                      visibility === tier ? "border-primary/40 text-primary bg-primary/5" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                  >
                                     <div className="flex items-center gap-4">
                                        <div className={cn("h-2.5 w-2.5 rounded-full", visibility === tier ? "bg-primary shadow-[0_0_10px_rgba(255,0,0,0.5)]" : "bg-muted-foreground/30")} />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">{tier}</span>
                                     </div>
                                     <Icons.shield className={cn("h-4 w-4", visibility === tier ? "text-primary" : "opacity-10")} />
                                  </Button>
                                ))}
                             </div>
                          </div>

                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-2">Logical_Sector</label>
                             <select 
                               value={category}
                               onChange={(e) => setCategory(e.target.value)}
                               className="w-full h-10 bg-muted/50 border border-border rounded-sm px-4 text-[11px] font-black uppercase tracking-widest text-foreground outline-none focus:border-primary/40 transition-all cursor-pointer italic"
                             >
                                <option>Entertainment_Sector</option>
                                <option>Technological_Hub</option>
                                <option>Educational_Node</option>
                                <option>Gaming_Protocol</option>
                             </select>
                          </div>

                          <div className="p-6 rounded-sm bg-primary/5 border border-primary/20 space-y-4">
                             <div className="flex items-center gap-3">
                                <Icons.alertTriangle className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest italic leading-none">System_Verification</span>
                             </div>
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed italic">
                                BY FINALIZING THE MANIFEST, ALL METADATA FIELDS WILL BE COMMITTED TO THE GLOBAL INDEX.
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="pt-10 border-t border-border flex justify-end gap-4 relative z-10">
                       <Button variant="ghost" className="h-10 px-8 rounded-sm text-[10px] font-black uppercase tracking-widest italic text-muted-foreground hover:text-foreground">
                          Discard_Manifest
                       </Button>
                       <Button className="h-10 px-10 rounded-sm bg-primary text-white text-[10px] font-black uppercase tracking-widest italic shadow-sm hover:bg-primary/90 transition-all active:scale-95 border border-primary/20">
                          Commit_Transmission
                       </Button>
                    </div>
                 </div>
              </motion.div>            ) : (
              <motion.div 
                key="telemetry"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 bg-surface border border-border rounded-md p-6 shadow-sm overflow-y-auto custom-scrollbar relative"
              >
                 <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
                 
                 <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                             <span className="text-[10px] font-black text-primary uppercase tracking-widest italic leading-none">Telemetry_Core_Live</span>
                          </div>
                          <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none">Logic_Matrix</h3>
                       </div>
                       <div className="text-right">
                          <span className="text-[14px] font-black text-foreground italic tracking-tighter">84.2%_OPTIMAL</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                       {[
                         { label: "Efficiency", value: "98.4%", color: "text-primary", icon: Icons.zap },
                         { label: "Drift", value: "0.002s", color: "text-success", icon: Icons.clock },
                         { label: "Memory", value: "4.2GB", color: "text-warning", icon: Icons.database },
                         { label: "Purity", value: "99.9%", color: "text-primary", icon: Icons.shieldCheck }
                       ].map((gauge, i) => (
                         <div key={i} className="p-4 rounded-sm bg-muted/20 border border-border space-y-4 shadow-sm">
                            <div className="flex justify-between items-start">
                               <div className={cn("h-8 w-8 rounded-sm flex items-center justify-center border bg-foreground/5 border-border", gauge.color)}>
                                  <gauge.icon className="h-4 w-4" />
                               </div>
                            </div>
                            <div className="space-y-1">
                               <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic block">{gauge.label}</span>
                               <span className="text-xl font-black text-foreground italic tracking-tighter block">{gauge.value}</span>
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                       <div className="lg:col-span-2 p-6 rounded-sm bg-muted/20 border border-border space-y-8 shadow-sm">
                          <div className="flex justify-between items-center">
                             <h4 className="text-xs font-black text-foreground uppercase tracking-tight italic">Processing_Load</h4>
                             <Icons.barChart className="h-4 w-4 text-primary" />
                          </div>
                          <div className="h-32 flex items-end gap-1 px-4">
                             {Array.from({ length: 32 }).map((_, i) => (
                               <motion.div 
                                 key={i} 
                                 className="flex-1 bg-primary/20 rounded-t-sm"
                                 animate={{ height: [`${20 + ((i * 13) % 60)}%`, `${30 + ((i * 17) % 70)}%`, `${15 + ((i * 19) % 50)}%`] }}
                                 transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
                               />
                             ))}
                          </div>
                       </div>

                       <div className="p-6 rounded-sm bg-primary/5 border border-primary/20 space-y-6 shadow-sm">
                          <h4 className="text-xs font-black text-foreground uppercase tracking-tight italic">Core_Status</h4>
                          <div className="space-y-4">
                             {[
                               { l: "Encoding", v: "8_STRIKE" },
                               { l: "Security", v: "ACTIVE" },
                               { l: "Uplink", v: "SECURE" },
                               { l: "Thermal", v: "34°C" }
                             ].map((s, i) => (
                               <div key={i} className="flex justify-between items-center">
                                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">{s.l}</span>
                                  <span className="text-[10px] font-black text-foreground italic tracking-tighter">{s.v}</span>
                               </div>
                             ))}
                          </div>
                          <Button className="w-full h-8 rounded-sm bg-foreground/5 border border-border hover:bg-foreground/10 text-[8px] font-black uppercase tracking-widest italic text-foreground transition-all">
                             Diagnostic_Report
                          </Button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Technical Inspector Console */}
        <div className="col-span-12 lg:col-span-3 bg-surface border border-border rounded-md overflow-hidden shadow-sm flex flex-col relative z-20 group/inspector">
           <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
           
           <div className="p-6 border-b border-border relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[9px] font-black text-primary uppercase tracking-widest italic leading-none">Inspector_Alpha</span>
              </div>
              <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">Properties</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10">
              <AnimatePresence mode="wait">
                {selectedClip ? (
                  <motion.div
                    key="props"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <PropertiesPanel 
                      clip={selectedClip} 
                      onUpdate={handleUpdateClip} 
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-clip"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
                  >
                     <div className="h-16 w-16 rounded-sm bg-foreground/5 border border-dashed border-border flex items-center justify-center">
                        <Icons.mousePointer2 className="h-6 w-6 text-muted-foreground/30" />
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Node_Selection_Required</p>
                        <p className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest italic leading-relaxed">
                          Select an asset node on the timeline to inspect its parameters.
                        </p>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mt-8 space-y-6">
                 <div className="h-px bg-border/50" />
                 <div className="space-y-4">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest italic block">Sector_Telemetry</span>
                    {[
                      { label: "Asset_Scale", value: telemetry.resolution, icon: Icons.maximize },
                      { label: "Sync_Node", value: "NOMINAL", icon: Icons.refreshCw, color: "text-success" },
                      { label: "Enc_Layer", value: "ALPHA_X", icon: Icons.shieldCheck },
                      { label: "Grid_Sector", value: "STRIKE_04", icon: Icons.target },
                      { label: "Protocol", value: "V4.2_PRO", icon: Icons.cpu },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center group/item">
                         <div className="flex items-center gap-3">
                            <item.icon className="h-3.5 w-3.5 text-muted-foreground group-hover/item:text-primary transition-all" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest group-hover/item:text-foreground transition-colors italic">{item.label}</span>
                         </div>
                         <span className={cn("text-[10px] font-black italic tracking-tighter", item.color || "text-foreground")}>{item.value}</span>
                      </div>
                    ))}
                 </div>

                 <div className="p-4 rounded-sm bg-muted/20 border border-border relative overflow-hidden group/warning">
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                       <Icons.alertCircle className="h-3 w-3 text-primary" />
                       <span className="text-[8px] font-black text-primary uppercase tracking-widest italic leading-none">Security_Logic</span>
                    </div>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest italic leading-relaxed relative z-10">
                       ALL EDITORIAL TRANSMISSIONS ARE LOGGED AT NODE LEVEL.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Global Mission Control Footer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 hidden xl:flex items-center gap-6 px-6 py-2 bg-surface/80 backdrop-blur-md border border-border rounded-sm shadow-lg z-50 group hover:border-primary/40 transition-all duration-500">
         <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[9px] font-black text-foreground uppercase tracking-widest italic">GLOBAL_SYNC: NOMINAL</span>
         </div>
         <div className="h-4 w-px bg-border" />
         <div className="flex items-center gap-4">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest italic">LATENCY: 8ms</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest italic">LOAD: 0.14%</span>
         </div>
         <div className="h-4 w-px bg-border" />
         <div className="flex items-center gap-3">
            <Icons.wifi className="h-3 w-3 text-success" />
            <span className="text-[9px] font-black text-foreground uppercase tracking-widest italic">STRIKE_HUB_ACTIVE</span>
         </div>
      </div>
    </div>
  )
}
