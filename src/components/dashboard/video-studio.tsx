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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { PageHeader } from "@/components/dashboard/page-header"

interface VideoStudioProps {
  videoId: string
  initialData?: VideoProject
  title?: string
  filePath?: string
  hlsPath?: string
}

export function VideoStudio({ initialData, title = "Untitled Project", filePath, hlsPath }: Omit<VideoStudioProps, "videoId">) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [zoom, setZoom] = useState(100)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [tracks, setTracks] = useState<Track[]>(initialData?.tracks || [
    { id: "v1", name: "Video Layer 1", type: "video", clips: [] },
    { id: "a1", name: "Audio Layer 1", type: "audio", clips: [] }
  ])

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

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-background overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Icons.scissors className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">{title}</h1>
            <p className="text-xs text-muted-foreground mt-1">Editing Mode</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="font-bold">
            <Icons.save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button size="sm" className="font-bold px-6">
            <Icons.zap className="h-4 w-4 mr-2" />
            Export Video
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Assets */}
        <div className="w-64 border-r border-border bg-card flex flex-col shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Your Assets</span>
            <Button variant="ghost" size="icon" className="h-6 w-6"><Icons.plus className="h-4 w-4" /></Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              <div className="p-3 rounded-xl bg-muted/50 border border-border group cursor-move">
                <div className="aspect-video bg-black rounded-lg mb-2 overflow-hidden relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Icons.video className="h-6 w-6 text-white/20" />
                   </div>
                </div>
                <p className="text-xs font-bold truncate">Main Clip.mp4</p>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center p-8 min-h-0">
            <div className="relative aspect-video w-full max-w-4xl bg-black rounded-2xl shadow-2xl border border-border overflow-hidden">
               <video 
                 ref={videoRef}
                 onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                 onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                 onEnded={() => setIsPlaying(false)}
                 className="w-full h-full object-contain"
               />
               
               {/* Video Overlay Controls */}
               {!isPlaying && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                   <Button size="icon" variant="secondary" className="h-16 w-16 rounded-full shadow-2xl" onClick={togglePlayback}>
                     <Icons.play className="h-8 w-8 fill-current" />
                   </Button>
                 </div>
               )}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="h-72 bg-card border-t border-border flex flex-col shrink-0">
            {/* Timeline Controls */}
            <div className="h-12 border-b border-border flex items-center justify-between px-6 bg-muted/5">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSeek(Math.max(0, currentTime - 5))}>
                    <Icons.skipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={togglePlayback}>
                    {isPlaying ? <Icons.pause className="h-6 w-6" /> : <Icons.play className="h-6 w-6" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSeek(Math.min(duration, currentTime + 5))}>
                    <Icons.skipForward className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm font-mono font-bold">
                  {formatTime(currentTime)} <span className="text-muted-foreground">/ {formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Icons.zoomOut className="h-4 w-4 text-muted-foreground" />
                  <Slider 
                    value={[zoom]} 
                    onValueChange={(v) => setZoom(v[0])}
                    min={10} 
                    max={200} 
                    className="w-32"
                  />
                  <Icons.zoomIn className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button variant="outline" size="sm" className="font-bold">Split Clip</Button>
              </div>
            </div>

            {/* Tracks Area */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2 min-w-full" style={{ width: `${zoom}%` }}>
                {tracks.map(track => (
                  <div key={track.id} className="h-12 flex items-center relative group">
                    <div className="w-40 shrink-0 flex items-center px-4 sticky left-0 z-10 bg-card border-r border-border h-full">
                       <span className="text-[10px] font-bold uppercase text-muted-foreground">{track.name}</span>
                    </div>
                    <div className="flex-1 h-10 mx-4 bg-muted/30 rounded-lg relative overflow-hidden border border-border/50">
                       {/* Playhead position indicator */}
                       <div 
                         className="absolute top-0 bottom-0 w-px bg-primary z-20 pointer-events-none"
                         style={{ left: `${(currentTime / duration) * 100}%` }}
                       />
                       
                       {track.clips.map(clip => (
                         <div 
                           key={clip.id}
                           onClick={() => setSelectedClip(clip)}
                           className={cn(
                             "absolute top-1 bottom-1 rounded-md border flex items-center px-3 cursor-pointer transition-all shadow-sm",
                             selectedClip?.id === clip.id ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary/40"
                           )}
                           style={{
                             left: `${(clip.start / duration) * 100}%`,
                             width: `${((clip.end - clip.start) / duration) * 100}%`
                           }}
                         >
                            <Icons.video className="h-3 w-3 mr-2 shrink-0" />
                            <span className="text-[10px] font-bold truncate">{clip.name}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}

                {/* Shared Timeline Playhead Line */}
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-primary z-30 pointer-events-none flex flex-col items-center"
                  style={{ left: `calc(${(currentTime / duration) * 100}% + 160px)` }}
                >
                   <div className="w-3 h-3 bg-primary rotate-45 -mt-1.5 shadow-lg" />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l border-border bg-card flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Clip Settings</span>
          </div>
          <ScrollArea className="flex-1 p-6">
            <PropertiesPanel clip={selectedClip} onUpdate={handleUpdateClip} />
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
