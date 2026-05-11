"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { updateVideoMetadata, triggerAutoCut, triggerTranscription, triggerThumbnailGen, getJobStatusAction, triggerExportAction } from "@/app/dashboard/studio/actions"
import { toast } from "sonner"
import { Track, Clip, VideoProject } from "@/types/video"
import { motion, AnimatePresence } from "framer-motion"
import Hls from "hls.js"
import { AudioWaveform } from "@/components/studio/audio-waveform"
import { PropertiesPanel } from "@/components/studio/properties-panel"

type StudioTab = "details" | "editor" | "analytics" | "editor-v2"

interface JobResult {
  thumbnails?: string[]
  cuts?: number[]
  text?: string
  srt?: string
}

interface VideoStudioProps {
  videoId: string
  initialData?: VideoProject
  title?: string
  filePath?: string
  hlsPath?: string
}

export function VideoStudio({ videoId, initialData, title = "Untitled Project", filePath, hlsPath }: VideoStudioProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>("editor")
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [activeExportJobId, setActiveExportJobId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Polling for Export Progress
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
              toast.success("Asset Ready for Deployment")
            } else if (status.status === "failed") {
              setIsExporting(false)
              setActiveExportJobId(null)
              toast.error("Export Protocol Failure")
            }
          }
        } catch (error) {
          console.error("Polling error:", error)
        }
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [activeExportJobId, isExporting])
  const [tracks, setTracks] = useState<Track[]>(initialData?.tracks || [
    { id: "v1", name: "Main Video", type: "video", clips: [] },
    { id: "v2", name: "Overlay", type: "video", clips: [] },
    { id: "a1", name: "Background Music", type: "audio", clips: [] }
  ])

  // HLS Setup
  useEffect(() => {
    if (hlsPath && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls()
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
        title: title,
        tracks: tracks, // Persist tracks in metadata
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
        resolution: { width: 1920, height: 1080 },
        fps: 30
      }
      const job = await triggerExportAction(videoId, project)
      if (job?.id) {
         setActiveExportJobId(job.id)
         setExportProgress(0)
         toast.success("Export protocol initiated. You will be notified when the asset is ready.")
      }
    } catch {
      toast.error("Failed to initiate export")
    } finally {
      setIsExporting(false)
    }
  }

  const renderTimeline = () => (
    <div className="space-y-1 mt-8">
      {tracks.map((track) => (
        <div key={track.id} className="h-16 border-b border-white/5 flex items-center relative group bg-muted/5 hover:bg-muted/10 transition-colors">
          <div className="w-40 flex items-center gap-3 px-4 shrink-0 border-r border-white/5 h-full">
            <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center", 
              track.type === "video" ? "bg-primary/20 text-primary" : "bg-emerald-500/20 text-emerald-500"
            )}>
               {track.type === "video" ? <Icons.video className="h-3 w-3" /> : <Icons.music className="h-3 w-3" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">{track.name}</span>
          </div>
          <div className="flex-1 h-12 relative overflow-hidden mx-2 rounded-xl bg-black/20">
            {track.clips.map(clip => (
              <motion.div 
                key={clip.id} 
                layoutId={clip.id}
                onClick={() => setSelectedClip(clip)}
                className={cn(
                  "absolute h-full rounded-xl border transition-all cursor-pointer group/clip",
                  selectedClip?.id === clip.id ? "border-primary ring-2 ring-primary/20 shadow-2xl" : "border-white/10 hover:border-white/30",
                  clip.color
                )}
                style={{ 
                  left: `${(clip.start / duration) * 100}%`, 
                  width: `${(clip.duration / duration) * 100}%`,
                  opacity: clip.opacity || 1
                }}
              >
                 {track.type === "audio" && <AudioWaveform audioUrl={filePath || ""} width={200} height={48} />}
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/clip:opacity-100">
                    <Icons.gripVertical className="h-3 w-3 text-white/50" />
                 </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Playhead */}
      <div 
        className="absolute top-0 bottom-0 w-px bg-primary z-50 pointer-events-none shadow-[0_0_10px_rgba(var(--primary),0.5)]"
        style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: "160px" }}
      >
         <div className="h-3 w-3 bg-primary rounded-full -ml-[6px] -mt-1 shadow-lg" />
      </div>
    </div>
  )

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Button variant="ghost" onClick={() => setActiveTab("details")} className={cn("text-[10px] font-black uppercase tracking-widest", activeTab === "details" && "text-primary")}>Details</Button>
           <Button variant="ghost" onClick={() => setActiveTab("editor")} className={cn("text-[10px] font-black uppercase tracking-widest", activeTab === "editor" && "text-primary")}>Timeline</Button>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="h-9 text-[10px] font-black uppercase tracking-widest border-border bg-card/50">
             {isSaving ? <Icons.refreshCw className="h-3 w-3 animate-spin mr-2" /> : <Icons.save className="h-3 w-3 mr-2" />}
             Auto-Save
           </Button>
           
           <div className="relative group">
              {isExporting && (
                <div className="absolute -top-6 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${exportProgress}%` }}
                     className="h-full bg-primary"
                   />
                </div>
              )}
              <Button onClick={handleExport} disabled={isExporting} className="h-9 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6">
                {isExporting ? (
                  <>
                    <Icons.refreshCw className="h-3 w-3 animate-spin mr-2" />
                    Rendering {exportProgress}%
                  </>
                ) : (
                  <>
                    <Icons.zap className="h-3 w-3 mr-2" />
                    Finalize Export
                  </>
                )}
              </Button>
           </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Side: Preview & Timeline */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <Card className="flex-1 bg-slate-950 border-border relative group overflow-hidden cyber-card">
             <video 
                ref={videoRef}
                src={!hlsPath ? filePath : undefined}
                className="w-full h-full object-contain"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => {
                  setDuration(e.currentTarget.duration)
                  // Auto-populate first track if empty
                  if (tracks[0].clips.length === 0) {
                    setTracks(prev => prev.map((t, i) => i === 0 ? {
                      ...t, clips: [{ id: "main-clip", start: 0, end: e.currentTarget.duration, duration: e.currentTarget.duration, color: "bg-primary/40", offset: 0, opacity: 1, volume: 1 }]
                    } : t))
                  }
                }}
                style={{
                  filter: `brightness(${(selectedClip?.effects?.find(e => e.type === "brightness")?.keyframes[0]?.value || 100)}%)`,
                  transform: `scale(${selectedClip?.scale || 1}) rotate(${selectedClip?.rotation || 0}deg)`,
                  opacity: selectedClip?.opacity || 1
                }}
             />
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <Button 
                  size="icon" 
                  onClick={() => {
                    if (isPlaying) videoRef.current?.pause()
                    else videoRef.current?.play()
                    setIsPlaying(!isPlaying)
                  }}
                  className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20"
                >
                   {isPlaying ? <Icons.pause className="h-8 w-8 text-white fill-white" /> : <Icons.play className="h-8 w-8 text-white fill-white" />}
                </Button>
             </div>
             
             {/* Progress Bar Over Preview */}
             <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
                <span className="text-[10px] font-black text-white bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-white/10 uppercase tracking-tighter">
                   {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                </span>
                <Slider 
                  value={[currentTime]} 
                  max={duration} 
                  onValueChange={([v]) => {
                    if (videoRef.current) videoRef.current.currentTime = v
                  }}
                  className="flex-1"
                />
                <span className="text-[10px] font-black text-white bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-white/10 uppercase tracking-tighter">
                   {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
                </span>
             </div>
          </Card>

          {/* Timeline Container */}
          <Card className="h-1/3 bg-card/30 border-border p-4 relative overflow-y-auto cyber-card">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <Button 
                     size="icon" 
                     variant="ghost" 
                     onClick={() => {
                        if (!selectedClip) return
                        const splitPoint = currentTime - (selectedClip.start)
                        if (splitPoint <= 0 || splitPoint >= selectedClip.duration) return
                        
                        const leftClip = { ...selectedClip, id: selectedClip.id + "-L", duration: splitPoint, end: selectedClip.start + splitPoint }
                        const rightClip = { ...selectedClip, id: selectedClip.id + "-R", start: selectedClip.start + splitPoint, duration: selectedClip.duration - splitPoint, offset: selectedClip.offset + splitPoint }
                        
                        const newTracks = tracks.map(track => ({
                          ...track,
                          clips: track.clips.flatMap(c => c.id === selectedClip.id ? [leftClip, rightClip] : [c])
                        }))
                        setTracks(newTracks)
                        setSelectedClip(null)
                        toast.success("Clip segmented")
                     }}
                     className="h-8 w-8 rounded-lg hover:bg-primary/20 text-primary"
                   >
                     <Icons.scissors className="h-4 w-4" />
                   </Button>
                   <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-accent/20 text-accent"><Icons.type className="h-4 w-4" /></Button>
                   <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-emerald-500/20 text-emerald-500"><Icons.music className="h-4 w-4" /></Button>
                   <div className="h-4 w-px bg-border mx-2" />
                   <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg"><Icons.undo className="h-4 w-4" /></Button>
                   <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg"><Icons.redo className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-3">
                   <Icons.zoomIn className="h-3 w-3 text-muted-foreground" />
                   <Slider defaultValue={[50]} className="w-24" />
                </div>
             </div>
             {renderTimeline()}
          </Card>
        </div>

        {/* Right Side: Properties Panel */}
        <Card className="w-80 bg-card/30 border-border overflow-hidden cyber-card">
           <PropertiesPanel 
             selectedClip={selectedClip} 
             onUpdate={handleUpdateClip} 
           />
        </Card>
      </div>
    </div>
  )
}
