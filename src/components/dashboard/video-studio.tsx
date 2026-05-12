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
import { AudioWaveform } from "@/components/studio/audio-waveform"
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
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-8 p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />
      
      {/* Top Controller HUD */}
      <div className="flex items-center justify-between px-12 py-8 backdrop-blur-3xl bg-black/40 border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px)] bg-[size:100px_100%] pointer-events-none opacity-10" />
        
        <div className="flex items-center gap-12 relative z-10">
           <div className="flex items-center gap-6">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 1, ease: "circOut" }}
                className="h-16 w-16 rounded-[2rem] bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.4)] relative cursor-pointer"
              >
                 <Icons.cpu className="h-8 w-8 text-white" />
                 <div className="absolute inset-0 rounded-[2rem] bg-primary blur-2xl opacity-20" />
              </motion.div>
              <div className="flex flex-col">
                 <div className="flex items-center gap-4">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic leading-none">Command_Core_Online</span>
                    <Badge variant="outline" className="rounded-full bg-primary/10 border-primary/20 text-[8px] font-black uppercase text-primary px-3 tracking-widest">TRANSMISSION_STATION_V4</Badge>
                 </div>
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mt-2 leading-none">{localTitle}</h2>
              </div>
           </div>
           
           <div className="h-12 w-px bg-white/5 mx-4" />
           
           <nav className="flex items-center gap-2 p-2 rounded-3xl bg-black/40 border border-white/5 shadow-inner">
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
                    "h-12 px-10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic transition-all relative overflow-hidden group/tab",
                    activeTab === tab.id ? "bg-primary text-white shadow-2xl shadow-primary/20" : "text-white/20 hover:text-white hover:bg-white/5"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4 mr-3 transition-transform duration-500", activeTab === tab.id ? "scale-110" : "group-hover/tab:scale-110")} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="tab-glow" className="absolute inset-0 bg-primary/20 blur-xl pointer-events-none" />
                  )}
                </Button>
              ))}
           </nav>
        </div>

        <div className="flex items-center gap-6 relative z-10">
           <div className="flex flex-col items-end gap-2 mr-8 hidden xl:flex">
              <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic">System_Stability</span>
              <div className="flex items-center gap-1.5">
                 {[1,2,3,4,5,6,7,8].map(i => (
                   <div key={i} className={cn("h-4 w-1.5 rounded-full", i < 7 ? "bg-emerald-500" : "bg-white/5")} />
                 ))}
              </div>
           </div>
           <Button variant="outline" onClick={handleSave} disabled={isSaving} className="h-16 rounded-[1.8rem] border-white/5 bg-white/5 hover:bg-white/10 px-12 text-[11px] font-black uppercase tracking-[0.4em] transition-all italic text-white/60 group">
             {isSaving ? <Icons.refreshCw className="h-4 w-4 animate-spin mr-4" /> : <Icons.save className="h-4 w-4 mr-4 group-hover:scale-125 transition-transform" />}
             Sync_Nodes
           </Button>
           <Button onClick={handleExport} disabled={isExporting} className="h-16 rounded-[1.8rem] bg-primary text-white shadow-[0_0_50px_rgba(var(--primary),0.3)] hover:scale-105 active:scale-95 px-14 text-[11px] font-black uppercase tracking-[0.5em] transition-all italic border border-primary/20 relative overflow-hidden group">
             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[size:250%_250%] group-hover:animate-shimmer pointer-events-none" />
             {isExporting ? (
               <div className="flex items-center gap-4">
                 <Icons.refreshCw className="h-5 w-5 animate-spin" />
                 <span>RENDERING_{exportProgress}%</span>
               </div>
             ) : (
               <>
                 <Icons.zap className="h-5 w-5 mr-4" />
                 Deploy_Strike
               </>
             )}
           </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0 relative">
        {/* Main Workspace */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-8 min-h-0 relative">
          <AnimatePresence mode="wait">
            {activeTab === "editor" ? (
              <motion.div 
                key="editor"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-8 h-full min-h-0"
              >
                {/* High-Fidelity Preview Box */}
                <div className="flex-1 backdrop-blur-3xl bg-black/60 border border-white/5 rounded-[4.5rem] relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                   {/* Master Grid Overlay */}
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
                   
                   {/* Dynamic HUD Overlays */}
                   <div className="absolute inset-0 z-10 pointer-events-none p-16 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                         <div className="flex flex-col gap-4 font-mono">
                            <div className="flex items-center gap-6">
                               <div className="h-4 w-4 rounded-full bg-primary animate-pulse shadow-[0_0_20px_rgba(var(--primary),1)]" />
                               <span className="text-[12px] font-black text-white uppercase tracking-[0.6em] italic">NODE_SIGMA_01 {"//"} {telemetry.resolution}</span>
                               <div className="px-4 py-1.5 rounded-full border border-emerald-500/20 text-emerald-500 bg-emerald-500/5 text-[9px] font-black uppercase tracking-widest italic">UPLINK_STABLE</div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-2 mt-4">
                               {[
                                 { k: "FPS", v: telemetry.fps },
                                 { k: "BITRATE", v: telemetry.bitrate },
                                 { k: "CODEC", v: telemetry.codec },
                                 { k: "TEMP", v: telemetry.thermal },
                                 { k: "LOAD", v: telemetry.load },
                                 { k: "NODES", v: telemetry.nodes }
                               ].map(stat => (
                                 <div key={stat.k} className="flex items-center gap-4">
                                    <span className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-black">{stat.k}:</span>
                                    <span className="text-[10px] text-white/60 font-black tracking-widest">{stat.v}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="text-right flex flex-col gap-6">
                            <div className="space-y-2">
                               <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic">Transmission_Buffer</span>
                               <div className="flex gap-1.5 justify-end">
                                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                                    <motion.div 
                                      key={i} 
                                      className="h-6 w-1.5 bg-primary/20 rounded-full"
                                      animate={{ height: [12, 24, 16, 28, 20] }}
                                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                    />
                                  ))}
                               </div>
                            </div>
                            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-end gap-1">
                               <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Latency</span>
                               <span className="text-xl font-black text-white italic">0.024ms</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex justify-between items-end">
                         <div className="flex flex-col gap-4">
                            <div className="flex items-baseline gap-6">
                               <span className="text-8xl font-black italic text-white tracking-tighter leading-none">{formatTime(currentTime).split('.')[0]}</span>
                               <span className="text-4xl font-black text-primary italic tracking-tighter leading-none mt-2 opacity-60">.{formatTime(currentTime).split('.')[1]}</span>
                            </div>
                            <div className="flex items-center gap-8 bg-black/40 backdrop-blur-2xl border border-white/5 px-10 py-4 rounded-[2rem] shadow-inner">
                               <div className="flex items-center gap-4">
                                  <Icons.clock className="h-5 w-5 text-primary" />
                                  <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.4em]">Duration: {formatTime(duration)}</span>
                                </div>
                               <div className="h-6 w-px bg-white/5" />
                               <div className="flex items-center gap-4">
                                  <Icons.layers className="h-5 w-5 text-primary" />
                                  <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.4em]">Frames: {Math.floor(currentTime * telemetry.fps)}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-col items-end gap-6">
                            <div className="flex items-center gap-4 bg-primary text-white px-8 py-3 rounded-2xl shadow-2xl shadow-primary/40 animate-pulse">
                               <Icons.zap className="h-4 w-4" />
                               <span className="text-[10px] font-black uppercase tracking-[0.4em]">PRO_ENGINE_ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-6 p-2 rounded-2xl bg-black/40 border border-white/5">
                               {[Icons.maximize, Icons.monitor, Icons.cast].map((Icon, i) => (
                                 <Button key={i} size="icon" variant="ghost" className="h-12 w-12 rounded-xl hover:bg-white/5">
                                    <Icon className="h-5 w-5 text-white/20 hover:text-white transition-colors" />
                                 </Button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   <video 
                      ref={videoRef}
                      src={!hlsPath ? filePath : undefined}
                      className="w-full h-full object-contain relative z-0 transition-all duration-1000 scale-[1.01]"
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
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 scale-90 group-hover:scale-100 z-20 pointer-events-none">
                      <Button onClick={togglePlayback} className="h-32 w-32 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.8)] hover:scale-110 transition-all hover:border-primary/40 pointer-events-auto">
                         {isPlaying ? <Icons.pause className="h-16 w-16 text-white fill-white" /> : <Icons.play className="h-16 w-16 text-white fill-white ml-3" />}
                      </Button>
                   </div>
                   
                   {/* Bottom Progress HUD */}
                   <div className="absolute bottom-16 left-16 right-16 flex items-center gap-12 px-12 py-10 rounded-[3.5rem] bg-black/60 backdrop-blur-3xl border border-white/10 z-20 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-12 group-hover:translate-y-0 shadow-[0_-40px_100px_rgba(0,0,0,0.6)]">
                      <div className="flex items-center gap-6">
                         <Button onClick={togglePlayback} size="icon" variant="ghost" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary hover:text-white transition-all group/playbtn">
                            {isPlaying ? <Icons.pause className="h-6 w-6" /> : <Icons.play className="h-6 w-6 ml-1" />}
                         </Button>
                         <div className="flex flex-col min-w-[80px]">
                            <span className="text-[14px] font-black text-white italic tracking-tighter leading-none">{formatTime(currentTime).split('.')[0]}</span>
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">CURRENT</span>
                         </div>
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
                      <div className="flex items-center gap-8">
                         <div className="flex flex-col items-end min-w-[80px]">
                            <span className="text-[14px] font-black text-white/40 italic tracking-tighter leading-none">{formatTime(duration).split('.')[0]}</span>
                            <span className="text-[10px] text-white/10 font-black uppercase tracking-widest mt-1">TOTAL</span>
                         </div>
                         <div className="h-10 w-px bg-white/5" />
                         <div className="flex items-center gap-4">
                            <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl hover:bg-white/10 text-white/20 hover:text-white transition-all">
                               <Icons.volume2 className="h-6 w-6" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl hover:bg-white/10 text-white/20 hover:text-white transition-all">
                               <Icons.settings className="h-6 w-6" />
                            </Button>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Industrial Timeline Console */}
                <div className="h-[350px] backdrop-blur-3xl bg-black/40 border border-white/5 rounded-[4.5rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden group/timeline">
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px)] bg-[size:80px_100%] pointer-events-none opacity-20" />
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-10">
                         <div className="flex items-center gap-3 p-2.5 rounded-[1.8rem] bg-black/40 border border-white/5 shadow-inner">
                            {[
                              { icon: Icons.scissors, label: "CUT" },
                              { icon: Icons.type, label: "TYPE" },
                              { icon: Icons.music, label: "AUDIO" },
                              { icon: Icons.layers, label: "FX" },
                              { icon: Icons.hand, label: "GRAB" }
                            ].map((Tool, i) => (
                              <Button key={i} size="icon" variant="ghost" className="h-14 w-14 rounded-2xl hover:bg-primary/10 group transition-all relative overflow-hidden">
                                 <Tool.icon className="h-6 w-6 text-white/20 group-hover:text-primary transition-all relative z-10" />
                                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Button>
                            ))}
                         </div>
                         <div className="h-12 w-px bg-white/5 mx-2" />
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic leading-none">TEMPORAL_LOCK</span>
                            <div className="flex items-baseline gap-4">
                               <span className="text-4xl font-black text-white italic tracking-tighter font-mono leading-none">{formatTime(currentTime)}</span>
                               <span className="text-[10px] text-white/10 font-black uppercase tracking-[0.2em]">MS_ACCURACY</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-12">
                         <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Timeline_Zoom</span>
                            <div className="flex items-center gap-6 bg-black/40 p-2.5 rounded-2xl border border-white/5">
                               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10" onClick={() => setZoom(Math.max(10, zoom - 10))}>
                                  <Icons.minus className="h-4 w-4 text-white/40" />
                               </Button>
                               <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] w-16 text-center italic">{zoom}%</span>
                               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                                  <Icons.plus className="h-4 w-4 text-white/40" />
                               </Button>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 relative z-10">
                      <div className="space-y-6 relative min-h-full">
                         {/* Timeline Ruler */}
                         <div className="h-8 w-full flex items-end gap-1 mb-10 opacity-20 sticky top-0 bg-transparent z-10">
                            {Array.from({ length: 120 }).map((_, i) => (
                              <div key={i} className={cn("bg-white shrink-0", i % 10 === 0 ? "h-6 w-px" : "h-3 w-px")} style={{ marginLeft: "79px" }} />
                            ))}
                         </div>

                        {tracks.map((track) => (
                          <div key={track.id} className="h-24 flex items-center group rounded-[2.5rem] bg-white/[0.02] border border-white/[0.02] hover:border-white/5 transition-all overflow-hidden shadow-xl">
                            <div className="w-72 flex items-center gap-6 px-12 shrink-0 border-r border-white/5 h-full bg-black/40 relative overflow-hidden group/trackhead">
                              <div className="absolute inset-y-0 left-0 w-1.5 bg-primary/20 group-hover/trackhead:bg-primary transition-all" />
                              <div className={cn("h-12 w-12 rounded-[1.4rem] flex items-center justify-center border border-white/5 shadow-2xl relative overflow-hidden", 
                                track.type === "video" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"
                              )}>
                                 <div className={cn("absolute inset-0 opacity-10", track.type === "video" ? "bg-primary" : "bg-emerald-500")} />
                                 {track.type === "video" ? <Icons.video className="h-6 w-6 relative z-10" /> : <Icons.music className="h-6 w-6 relative z-10" />}
                              </div>
                              <div className="flex flex-col gap-1 overflow-hidden">
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic truncate leading-none">{track.name}</span>
                                <span className="text-[9px] font-bold text-white/10 uppercase tracking-[0.4em] italic">0{track.id.replace(/\D/g, '')}_CORE_SYNC</span>
                              </div>
                              <div className="absolute right-6 opacity-0 group-hover/trackhead:opacity-100 transition-all">
                                 <Icons.moreHorizontal className="h-5 w-5 text-white/20" />
                              </div>
                            </div>
                            
                            <div className="flex-1 h-16 relative mx-12 rounded-2xl bg-black/60 overflow-hidden shadow-inner border border-white/5">
                              {track.clips.map(clip => (
                                <motion.div 
                                  key={clip.id} 
                                  onClick={() => setSelectedClip(clip)}
                                  className={cn(
                                    "absolute h-full rounded-2xl border transition-all cursor-pointer group/clip flex items-center px-6 overflow-hidden",
                                    selectedClip?.id === clip.id ? "border-primary bg-primary/20 shadow-[0_0_50px_rgba(var(--primary),0.3)] z-10" : "border-white/10 bg-white/5 hover:border-white/20",
                                  )}
                                  style={{ 
                                    left: `${(clip.start / duration) * 100}%`, 
                                    width: `${(clip.duration / duration) * 100}%`,
                                  }}
                                >
                                   {track.type === "video" && (
                                     <div className="flex items-center gap-3">
                                        <Icons.film className={cn("h-4 w-4", selectedClip?.id === clip.id ? "text-primary" : "text-white/20")} />
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic truncate">{title}_SEGMENT</span>
                                     </div>
                                   )}
                                   {track.type === "audio" && (
                                     <div className="absolute inset-0 opacity-40 flex items-center px-8 gap-1.5">
                                       {[1,2,3,2,1,4,3,2,5,3,2,1,2,4,3,2,1,2,4,2,3,1,2].map((h, i) => (
                                         <motion.div 
                                           key={i} 
                                           className="flex-1 bg-emerald-400/60 rounded-full" 
                                           style={{ height: `${h * 8}px` }}
                                           animate={selectedClip?.id === clip.id && isPlaying ? { height: [h*8, h*12, h*6, h*10] } : {}}
                                           transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                                         />
                                       ))}
                                     </div>
                                   )}
                                   {selectedClip?.id === clip.id && (
                                     <>
                                       <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary rounded-l-2xl cursor-ew-resize hover:scale-x-150 transition-transform shadow-[5px_0_15px_rgba(var(--primary),0.5)]" />
                                       <div className="absolute right-0 top-0 bottom-0 w-2 bg-primary rounded-r-2xl cursor-ew-resize hover:scale-x-150 transition-transform shadow-[-5px_0_15px_rgba(var(--primary),0.5)]" />
                                     </>
                                   )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {/* Playhead Vertical Line */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-primary z-50 pointer-events-none shadow-[0_0_40px_rgba(var(--primary),1)]"
                          style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: "288px" }}
                        >
                           <div className="h-8 w-8 bg-primary rounded-full -ml-[14px] -mt-4 shadow-[0_0_30px_rgba(var(--primary),0.8)] border-[4px] border-white relative group-hover/timeline:scale-125 transition-transform">
                              <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
                              <div className="absolute top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-2xl italic whitespace-nowrap">
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 backdrop-blur-3xl bg-black/40 border border-white/5 rounded-[4.5rem] p-20 shadow-2xl overflow-y-auto custom-scrollbar relative"
              >
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff02_1.5px,transparent_1.5px)] bg-[size:48px_48px] pointer-events-none" />
                 
                 <div className="max-w-4xl mx-auto space-y-20 relative z-10">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                         <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                         <span className="text-[12px] font-black text-primary uppercase tracking-[0.6em] italic leading-none">Manifest_Protocol_Active</span>
                      </div>
                      <h3 className="text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Global_Metadata_Forge</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                       <div className="space-y-12">
                          <div className="space-y-6">
                             <div className="flex justify-between items-center px-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic">Transmission_ID</label>
                                <span className="text-[9px] font-black text-primary italic">REQUIRED_FIELD</span>
                             </div>
                             <div className="relative group">
                                <Input 
                                  value={localTitle} 
                                  onChange={(e) => setLocalTitle(e.target.value)}
                                  className="bg-black/60 border-white/5 h-20 rounded-[2rem] px-10 text-xl font-black tracking-tight text-white focus:border-primary/40 transition-all uppercase italic shadow-inner" 
                                />
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary opacity-0 group-focus-within:opacity-100 transition-opacity" />
                             </div>
                          </div>

                          <div className="space-y-6">
                             <div className="flex justify-between items-center px-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic">Visual_Identifier (Cover)</label>
                                <Icons.helpCircle className="h-4 w-4 text-white/10" />
                             </div>
                             <div className="aspect-video w-full bg-black/60 border border-dashed border-white/10 rounded-[3.5rem] flex flex-col items-center justify-center group/thumb cursor-pointer hover:border-primary/40 transition-all relative overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                                <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center group-hover/thumb:bg-primary/20 transition-all relative z-10">
                                   <Icons.image className="h-10 w-10 text-white/10 group-hover/thumb:text-primary transition-colors" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 group-hover/thumb:text-white transition-colors mt-6 relative z-10">Inject_Asset_Node</span>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-20">
                                   {[1,2,3,4,5].map(i => <div key={i} className="h-1 w-8 bg-white rounded-full" />)}
                                </div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <div className="flex justify-between items-center px-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic">Signal_Description</label>
                             </div>
                             <div className="relative group">
                                <textarea 
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  rows={10}
                                  placeholder="Inject protocol details for global indexing..."
                                  className="w-full bg-black/60 border border-white/5 rounded-[3rem] p-10 text-sm font-bold tracking-wide text-white/60 focus:text-white focus:border-primary/40 transition-all outline-none resize-none custom-scrollbar shadow-inner italic"
                                />
                                <div className="absolute bottom-8 right-8 text-[9px] font-black text-white/10 uppercase tracking-widest">UTF-8_ENCODED</div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-12">
                          <div className="space-y-6">
                             <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic ml-4">Visibility_Spectrum</label>
                             <div className="grid grid-cols-1 gap-4">
                                {["Public", "Unlisted", "Private"].map((tier) => (
                                  <Button 
                                    key={tier} 
                                    variant="ghost" 
                                    onClick={() => setVisibility(tier)}
                                    className={cn(
                                      "h-20 rounded-[2rem] bg-black/60 border transition-all relative overflow-hidden group/btn px-10 flex items-center justify-between shadow-xl",
                                      visibility === tier ? "border-primary/40 text-primary bg-primary/5" : "border-white/5 text-white/30 hover:text-white hover:border-white/20"
                                    )}
                                  >
                                     <div className="flex items-center gap-6">
                                        <div className={cn("h-3 w-3 rounded-full shadow-2xl", visibility === tier ? "bg-primary shadow-primary/50" : "bg-white/10")} />
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">{tier}_TRANSMISSION</span>
                                     </div>
                                     <Icons.shield className={cn("h-5 w-5", visibility === tier ? "text-primary opacity-100" : "opacity-10")} />
                                  </Button>
                                ))}
                             </div>
                          </div>

                          <div className="space-y-6">
                             <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic ml-4">Logical_Sector (Category)</label>
                             <div className="relative group">
                                <select 
                                  value={category}
                                  onChange={(e) => setCategory(e.target.value)}
                                  className="w-full h-20 bg-black/60 border border-white/5 rounded-[2rem] px-10 text-sm font-black uppercase tracking-[0.3em] text-white outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer italic shadow-inner"
                                >
                                   <option>Entertainment_Sector</option>
                                   <option>Technological_Hub</option>
                                   <option>Educational_Node</option>
                                   <option>Gaming_Protocol</option>
                                </select>
                                <Icons.chevronDown className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-primary transition-all pointer-events-none" />
                             </div>
                          </div>

                          <div className="space-y-6">
                             <label className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 italic ml-4">Metadata_Tags</label>
                             <div className="relative group">
                                <Input 
                                  value={tags}
                                  onChange={(e) => setTags(e.target.value)}
                                  placeholder="TAG_01, TAG_02, PROTOCOL_ALPHA..."
                                  className="bg-black/60 border-white/5 h-20 rounded-[2rem] px-10 text-[11px] font-black tracking-[0.3em] text-white focus:border-primary/40 transition-all uppercase italic shadow-inner" 
                                />
                                <Icons.hash className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 text-white/10 group-hover:text-primary transition-all" />
                             </div>
                          </div>

                          <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/20 space-y-6 relative overflow-hidden group/notice">
                             <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/notice:opacity-100 transition-opacity" />
                             <div className="flex items-center gap-4 relative z-10">
                                <Icons.alertTriangle className="h-5 w-5 text-primary" />
                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">System_Verification</span>
                             </div>
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-relaxed italic relative z-10">
                                BY FINALIZING THE MANIFEST, ALL METADATA FIELDS WILL BE COMMITTED TO THE GLOBAL YOUTUBE INDEX. ENSURE COMPLIANCE WITH MISSION PROTOCOLS.
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="pt-20 border-t border-white/5 flex justify-end gap-8 relative z-10">
                       <Button variant="ghost" className="h-20 px-16 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] italic hover:bg-white/5 transition-all text-white/20">
                          Discard_Manifest
                       </Button>
                       <Button className="h-20 px-20 rounded-[2rem] bg-primary text-white text-[11px] font-black uppercase tracking-[0.5em] italic shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all border border-primary/20">
                          Commit_Transmission_Details
                       </Button>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div 
                key="telemetry"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 backdrop-blur-3xl bg-black/40 border border-white/5 rounded-[4.5rem] p-20 shadow-2xl overflow-y-auto custom-scrollbar relative"
              >
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] pointer-events-none bg-[size:100%_4px] opacity-10" />
                 
                 <div className="max-w-5xl mx-auto space-y-20 relative z-10">
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                             <div className="h-3 w-3 rounded-full bg-primary animate-ping" />
                             <span className="text-[12px] font-black text-primary uppercase tracking-[0.6em] italic leading-none">Telemetry_Core_Live</span>
                          </div>
                          <h3 className="text-6xl font-black text-white uppercase tracking-tighter italic leading-none">System_Logic_Matrix</h3>
                       </div>
                       <div className="flex flex-col items-end gap-3 text-right">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic">Current_Node_Load</span>
                          <span className="text-4xl font-black text-white italic tracking-tighter">84.2%_OPTIMAL</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                       {[
                         { label: "Core_Efficiency", value: "98.4%", color: "primary", icon: Icons.zap },
                         { label: "Temporal_Drift", value: "0.002s", color: "emerald-500", icon: Icons.clock },
                         { label: "Memory_Density", value: "4.2GB", color: "amber-500", icon: Icons.database },
                         { label: "Signal_Purity", value: "99.9%", color: "primary", icon: Icons.shieldCheck }
                       ].map((gauge, i) => (
                         <div key={i} className="p-10 rounded-[3.5rem] bg-black/60 border border-white/5 space-y-8 relative overflow-hidden group shadow-2xl">
                            <div className={cn("absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r transition-all duration-700", `from-${gauge.color}/0 via-${gauge.color}/40 to-${gauge.color}/0`)} />
                            <div className="flex justify-between items-start">
                               <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border transition-all", `bg-${gauge.color}/10 border-${gauge.color}/20 text-${gauge.color}`)}>
                                  <gauge.icon className="h-6 w-6" />
                               </div>
                               <Icons.trendingUp className="h-4 w-4 text-white/10" />
                            </div>
                            <div className="space-y-2">
                               <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic block">{gauge.label}</span>
                               <span className="text-4xl font-black text-white italic tracking-tighter block">{gauge.value}</span>
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                       <div className="lg:col-span-2 p-16 rounded-[4rem] bg-black/60 border border-white/5 space-y-12 shadow-2xl relative overflow-hidden">
                          <div className="flex justify-between items-center relative z-10">
                             <div className="space-y-2">
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Neural_Processing_Load</h4>
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] italic">ALPHA_CORE_COORDINATION_TELEMETRY</p>
                             </div>
                             <Icons.barChart className="h-6 w-6 text-primary" />
                          </div>
                          <div className="h-64 flex items-end gap-3 relative z-10 px-8">
                             {Array.from({ length: 32 }).map((_, i) => (
                               <motion.div 
                                 key={i} 
                                 className="flex-1 bg-primary/20 rounded-t-lg group/bar relative"
                                 animate={{ height: [`${20 + ((i * 13) % 60)}%`, `${30 + ((i * 17) % 70)}%`, `${15 + ((i * 19) % 50)}%`] }}
                                 transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
                               >
                                  <div className="absolute inset-0 bg-primary opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-lg" />
                               </motion.div>
                             ))}
                          </div>
                          <div className="flex justify-between items-center pt-8 border-t border-white/5 relative z-10">
                             <div className="flex gap-10">
                                <div className="flex items-center gap-3">
                                   <div className="h-3 w-3 rounded-full bg-primary" />
                                   <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">RENDER_STRIKE</span>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className="h-3 w-3 rounded-full bg-white/10" />
                                   <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">BUFFER_LOAD</span>
                                </div>
                             </div>
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">T-MINUS_INFINITY</span>
                          </div>
                       </div>

                       <div className="p-16 rounded-[4rem] bg-primary/5 border border-primary/20 space-y-12 shadow-2xl relative overflow-hidden group/stats">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20" />
                          <div className="space-y-2 relative z-10">
                             <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Alpha_Status</h4>
                             <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] italic">CORE_SYSTEM_HEALTH</p>
                          </div>
                          <div className="space-y-10 relative z-10">
                             {[
                               { l: "Encoding_Cores", v: "8_STRIKE", s: "NOMINAL" },
                               { l: "Security_Vanguard", v: "ACTIVE", s: "SECURE" },
                               { l: "Uplink_Identity", v: "ENCRYPTED", s: "NOMINAL" },
                               { l: "Cache_Sector", v: "L1_CLEAR", s: "NOMINAL" }
                             ].map((s, i) => (
                               <div key={i} className="flex justify-between items-center">
                                  <div className="flex flex-col gap-1">
                                     <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">{s.l}</span>
                                     <span className="text-lg font-black text-white italic tracking-tighter leading-none">{s.v}</span>
                                  </div>
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black tracking-widest px-3 uppercase">{s.s}</Badge>
                               </div>
                             ))}
                          </div>
                          <Button className="w-full h-16 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.4em] italic text-white transition-all relative z-10">
                             Full_Diagnostic_Report
                          </Button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Technical Inspector Console */}
        <div className="col-span-12 lg:col-span-3 backdrop-blur-3xl bg-black/40 border border-white/5 rounded-[4.5rem] overflow-hidden shadow-2xl flex flex-col relative z-20 group/inspector">
           <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:100%_60px] pointer-events-none" />
           <div className="absolute inset-y-0 left-0 w-px bg-white/5 group-hover/inspector:bg-primary/20 transition-all" />
           
           <div className="p-16 border-b border-white/5 relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic leading-none">Inspector_Alpha</span>
              </div>
              <h3 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">Properties</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-16 relative z-10">
              <AnimatePresence mode="wait">
                {selectedClip ? (
                  <motion.div
                    key="props"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <PropertiesPanel 
                      selectedClip={selectedClip} 
                      onUpdate={handleUpdateClip} 
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-clip"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20"
                  >
                     <div className="h-24 w-24 rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center">
                        <Icons.mousePointer2 className="h-10 w-10 text-white/5" />
                     </div>
                     <div className="space-y-3">
                        <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.5em] italic">Node_Selection_Required</p>
                        <p className="text-[10px] text-white/10 font-black uppercase tracking-[0.3em] italic leading-relaxed">
                          Select an asset node on the timeline to inspect its technical parameters.
                        </p>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mt-20 space-y-12">
                 <div className="h-px bg-white/5" />
                 <div className="space-y-10">
                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.6em] italic block">Sector_Telemetry</span>
                    {[
                      { label: "Asset_Scale", value: telemetry.resolution, icon: Icons.maximize },
                      { label: "Sync_Node", value: "NOMINAL", icon: Icons.refreshCw, color: "text-emerald-500" },
                      { label: "Enc_Layer", value: "ALPHA_X", icon: Icons.shieldCheck },
                      { label: "Grid_Sector", value: "STRIKE_04", icon: Icons.target },
                      { label: "Protocol", value: "V4.2_PRO", icon: Icons.cpu },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center group/item">
                         <div className="flex items-center gap-5">
                            <item.icon className="h-5 w-5 text-white/10 group-hover/item:text-primary transition-all group-hover/item:scale-125" />
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] group-hover/item:text-white transition-colors italic">{item.label}</span>
                         </div>
                         <span className={cn("text-[12px] font-black italic tracking-tighter", item.color || "text-white")}>{item.value}</span>
                      </div>
                    ))}
                 </div>

                 <div className="p-10 rounded-[2.5rem] bg-black/40 border border-white/5 relative overflow-hidden group/warning mt-12">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/warning:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                       <Icons.alertCircle className="h-4 w-4 text-primary" />
                       <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">Security_Logic</span>
                    </div>
                    <p className="text-[9px] font-black text-white/10 uppercase tracking-widest italic leading-relaxed relative z-10">
                       ALL EDITORIAL TRANSMISSIONS ARE LOGGED AT NODE LEVEL. ENSURE ASSET INTEGRITY BEFORE DEPLOYMENT.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Global Mission Control Footer */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 hidden xl:flex items-center gap-12 px-12 py-5 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_20px_100px_rgba(0,0,0,0.8)] z-50 group hover:border-primary/40 transition-all duration-700">
         <div className="flex items-center gap-6">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">GLOBAL_SYNC: NOMINAL</span>
         </div>
         <div className="h-6 w-px bg-white/10" />
         <div className="flex items-center gap-8">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">LATENCY: 8ms</span>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">LOAD: 0.14%</span>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">TEMP: 32°C</span>
         </div>
         <div className="h-6 w-px bg-white/10" />
         <div className="flex items-center gap-6">
            <Icons.wifi className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">STRIKE_HUB_ACTIVE</span>
         </div>
      </div>
    </div>
  )
}
