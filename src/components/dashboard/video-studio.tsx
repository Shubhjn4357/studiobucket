"use client"

import { useState, useRef, useEffect } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { updateVideoMetadata, createRenderJob } from "@/app/dashboard/studio/actions"
import { toast } from "sonner"
import { Track } from "@/types/video"

type StudioTab = "edit" | "filters" | "audio" | "ai"

export function VideoStudio({ videoId = "default-project" }: { videoId?: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(60) // 1 minute default
  const [zoom, setZoom] = useState(1)
  const [activeTab, setActiveTab] = useState<StudioTab>("edit")
  const [isSaving, setIsSaving] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const tracks: Track[] = [
    { id: "v1", name: "Video 1", type: "video", clips: [{ id: "c1", start: 0, end: 15, duration: 15, color: "bg-primary/20" }, { id: "c2", start: 20, end: 45, duration: 25, color: "bg-primary/40" }] },
    { id: "a1", name: "Audio 1", type: "audio", clips: [{ id: "c3", start: 0, end: 60, duration: 60, color: "bg-emerald-500/20" }] },
    { id: "t1", name: "Captions", type: "text", clips: [{ id: "c4", start: 5, end: 10, duration: 5, color: "bg-amber-500/20" }] },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateVideoMetadata(videoId, { tracks, duration })
      toast.success("Project saved successfully")
    } catch {
      toast.error("Failed to save project")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRender = async () => {
    setIsRendering(true)
    try {
      await createRenderJob(videoId, { tracks, duration })
      toast.success("Render job submitted to queue")
    } catch {
      toast.error("Failed to start render")
    } finally {
      setIsRendering(false)
    }
  }

  const togglePlay = () => setIsPlaying(!isPlaying)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev >= duration ? 0 : prev + 0.1))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Studio Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icons.scissors className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Project: Alpha Strike</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">4K • 60 FPS • ProRes Pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            variant="outline" 
            className="cyber-card h-10 border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest px-6"
          >
            {isSaving ? <Icons.refreshCw className="h-3 w-3 animate-spin mr-2" /> : null}
            Save Project
          </Button>
          <Button 
            onClick={handleRender}
            disabled={isRendering}
            className="h-10 bg-primary text-white hover:opacity-90 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            {isRendering ? <Icons.refreshCw className="h-3 w-3 animate-spin mr-2" /> : null}
            Render Final
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[500px]">
        {/* Left Toolbar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {[
            { id: "edit", icon: Icons.scissors },
            { id: "filters", icon: Icons.sparkles },
            { id: "audio", icon: Icons.mic },
            { id: "ai", icon: Icons.brain },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={cn(
                "h-14 w-full rounded-2xl flex items-center justify-center transition-all duration-300 border",
                activeTab === tab.id 
                  ? "bg-primary border-primary shadow-lg shadow-primary/20 text-white" 
                  : "bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10"
              )}
            >
              <tab.icon className="h-6 w-6" />
            </button>
          ))}
        </div>

        {/* Video Preview */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="cyber-card border-white/5 bg-black/40 overflow-hidden flex-1 relative group">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full aspect-video bg-slate-900 flex items-center justify-center">
                <Icons.playCircle className="h-20 w-20 text-white/10 group-hover:text-primary/40 transition-colors duration-500" />
              </div>
            </div>
            
            {/* Control Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/5">
              <button className="text-slate-400 hover:text-white transition-colors">
                <Icons.skipBack className="h-5 w-5" />
              </button>
              <button onClick={togglePlay} className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
                {isPlaying ? <Icons.pause className="h-5 w-5" /> : <Icons.play className="h-5 w-5 ml-0.5" />}
              </button>
              <button className="text-slate-400 hover:text-white transition-colors">
                <Icons.skipForward className="h-5 w-5" />
              </button>
            </div>
          </Card>
        </div>

        {/* Right Properties */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="cyber-card border-white/5 bg-white/5">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Transform</h3>
                <Icons.settings className="h-4 w-4 text-slate-500" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Opacity</span>
                    <span>100%</span>
                  </div>
                  <Slider defaultValue={[100]} max={100} step={1} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Saturation</span>
                    <span>1.2x</span>
                  </div>
                  <Slider defaultValue={[60]} max={100} step={1} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Rotation</span>
                    <span>0°</span>
                  </div>
                  <Slider defaultValue={[0]} max={360} step={1} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card border-white/5 bg-white/5">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">AI Subtitles</h3>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <p className="text-[11px] text-slate-300 italic">&quot;Welcome back to the channel, today we are looking at...&quot;</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Confidence 98%</span>
                </div>
              </div>
              <Button className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 h-10 text-[10px] font-black uppercase tracking-widest">
                Regenerate AI
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline Section */}
      <Card className="cyber-card border-white/5 bg-white/5 h-[300px] flex flex-col overflow-hidden">
        {/* Timeline Toolbar */}
        <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-black/20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Icons.clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-black text-white italic tabular-nums">
                {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
              </span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Icons.search className="h-4 w-4 text-slate-500" />
              <Slider 
                value={[zoom]} 
                onValueChange={([v]) => setZoom(v)} 
                max={5} 
                min={0.5} 
                step={0.1} 
                className="w-32"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
              <Icons.plus className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>

        {/* Tracks Area */}
        <div className="flex-1 overflow-auto custom-scrollbar relative" ref={timelineRef}>
          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-px bg-primary z-20 pointer-events-none"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="h-3 w-3 rounded-full bg-primary -ml-1.5 -mt-1 shadow-lg shadow-primary/40" />
          </div>

          <div className="min-w-full space-y-px p-4">
            {tracks.map((track) => (
              <div key={track.id} className="h-14 flex gap-4 items-center group">
                <div className="w-24 shrink-0 flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate group-hover:text-white transition-colors">
                    {track.name}
                  </span>
                </div>
                <div className="flex-1 h-10 bg-white/5 rounded-lg border border-white/5 relative overflow-hidden">
                  {track.clips.map((clip) => (
                    <div
                      key={clip.id}
                      className={cn(
                        "absolute top-0 bottom-0 rounded-md border border-white/10 flex items-center px-3 cursor-move hover:brightness-125 transition-all",
                        clip.color
                      )}
                      style={{ 
                        left: `${(clip.start / duration) * 100}%`,
                        width: `${(clip.duration / duration) * 100}%`
                      }}
                    >
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter truncate">
                        Clip_{clip.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
