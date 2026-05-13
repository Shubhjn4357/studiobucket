"use client"

import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Track, Clip, VideoProject } from "@/types/video"
import Hls from "hls.js"
import { PropertiesPanel } from "@/components/studio/properties-panel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface VideoStudioProps {
  videoId: string
  initialData?: VideoProject
  title?: string
  filePath?: string
  hlsPath?: string
}

export function VideoStudio({ initialData, filePath, hlsPath }: Omit<VideoStudioProps, "videoId" | "title">) {
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

  const timelineRef = useRef<HTMLDivElement>(null)

  const handleUpdateClip = (updatedClip: Partial<Clip>) => {
    if (!selectedClip) return
    const newTracks = tracks.map(track => ({
      ...track,
      clips: track.clips.map(c => c.id === selectedClip.id ? { ...c, ...updatedClip } : c)
    }))
    setTracks(newTracks)
    setSelectedClip({ ...selectedClip, ...updatedClip })
  }

  const handleDeleteClip = (clipId: string) => {
    const newTracks = tracks.map(track => ({
      ...track,
      clips: track.clips.filter(c => c.id !== clipId)
    }))
    setTracks(newTracks)
    if (selectedClip?.id === clipId) setSelectedClip(null)
  }

  const handleSplitClip = () => {
    if (!selectedClip) return
    if (currentTime <= selectedClip.start || currentTime >= selectedClip.end) return

    const newTracks = tracks.map(track => {
      const clipIndex = track.clips.findIndex(c => c.id === selectedClip.id)
      if (clipIndex === -1) return track

      const originalClip = track.clips[clipIndex]
      const firstHalf: Clip = { ...originalClip, end: currentTime }
      const secondHalf: Clip = { 
        ...originalClip, 
        id: originalClip.id + "_split", 
        start: currentTime 
      }

      const newClips = [...track.clips]
      newClips.splice(clipIndex, 1, firstHalf, secondHalf)
      return { ...track, clips: newClips }
    })

    setTracks(newTracks)
    setSelectedClip(null)
  }

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const cleanupDrag = useRef<(() => void) | null>(null)

  const onPointerDown = (e: React.PointerEvent, type: 'move' | 'trim-start' | 'trim-end' | 'playhead', clip?: Clip) => {
    e.stopPropagation()
    if (clip) setSelectedClip(clip)
    
    const startX = e.clientX
    const initialStart = clip?.start || 0
    const initialEnd = clip?.end || 0
    const initialCurrentTime = currentTime
    const clipId = clip?.id || null

    const handlePointerMove = (ev: PointerEvent) => {
      if (!timelineRef.current || duration === 0) return

      const rect = timelineRef.current.getBoundingClientRect()
      const dx = ev.clientX - startX
      const dt = (dx / rect.width) * duration

      if (type === 'playhead') {
        const newTime = Math.max(0, Math.min(duration, initialCurrentTime + dt))
        handleSeek(newTime)
      } else if (clipId) {
        setTracks(prevTracks => prevTracks.map(track => ({
          ...track,
          clips: track.clips.map(c => {
            if (c.id !== clipId) return c
            let newStart = c.start
            let newEnd = c.end
            
            if (type === 'move') {
              const clipDur = initialEnd - initialStart
              newStart = Math.max(0, initialStart + dt)
              newEnd = newStart + clipDur
            } else if (type === 'trim-start') {
              newStart = Math.min(c.end - 0.1, Math.max(0, initialStart + dt))
            } else if (type === 'trim-end') {
              newEnd = Math.max(c.start + 0.1, Math.min(duration, initialEnd + dt))
            }
            
            return { ...c, start: newStart, end: newEnd }
          })
        })))
        
        setSelectedClip(prev => {
           if (prev?.id === clipId) {
              let newStart = prev.start
              let newEnd = prev.end
              if (type === 'move') {
                 const clipDur = initialEnd - initialStart
                 newStart = Math.max(0, initialStart + dt)
                 newEnd = newStart + clipDur
              } else if (type === 'trim-start') {
                 newStart = Math.min(prev.end - 0.1, Math.max(0, initialStart + dt))
              } else if (type === 'trim-end') {
                 newEnd = Math.max(prev.start + 0.1, Math.min(duration, initialEnd + dt))
              }
              return { ...prev, start: newStart, end: newEnd }
           }
           return prev
        })
      }
    }

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove)
      document.removeEventListener("pointerup", handlePointerUp)
      cleanupDrag.current = null
    }

    document.addEventListener("pointermove", handlePointerMove)
    document.addEventListener("pointerup", handlePointerUp)
    
    cleanupDrag.current = handlePointerUp
  }

  useEffect(() => {
    return () => {
      if (cleanupDrag.current) cleanupDrag.current()
    }
  }, [])

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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] bg-background overflow-hidden border-t border-border">
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Assets (Hidden on Mobile) */}
        <div className="hidden lg:flex w-72 border-r border-border bg-card/30 flex-col shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Media Library</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Icons.plus className="h-4 w-4" /></Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <div className="p-3 rounded-2xl bg-card border border-border shadow-sm group cursor-grab hover:border-primary/30 transition-all">
                <div className="aspect-video bg-black rounded-xl mb-3 overflow-hidden relative shadow-inner">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Icons.video className="h-6 w-6 text-white/10" />
                   </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold truncate pr-2 text-foreground/80">source_media_01.mp4</p>
                  <span className="text-[8px] font-black text-muted-foreground uppercase">04:20</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/2 relative">
          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-12 min-h-0 relative z-10">
            <div className="relative aspect-video w-full max-w-5xl bg-black rounded-2xl md:rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden group">
               <video 
                 ref={videoRef}
                 onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                 onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                 onEnded={() => setIsPlaying(false)}
                 className="w-full h-full object-contain"
               />
               
               {/* Video Overlay Controls */}
               {!isPlaying && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all group-hover:bg-black/20">
                   <Button size="icon" variant="secondary" className="h-16 w-16 md:h-20 md:w-20 rounded-full shadow-2xl scale-100 hover:scale-110 transition-transform" onClick={togglePlayback}>
                     <Icons.play className="h-8 w-8 md:h-10 md:w-10 fill-current" />
                   </Button>
                 </div>
               )}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="h-64 md:h-80 bg-card/90 backdrop-blur-md border-t border-border flex flex-col shrink-0 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            {/* Timeline Controls */}
            <div className="h-12 md:h-14 border-b border-border flex items-center justify-between px-4 md:px-8 bg-muted/5">
              <div className="flex items-center gap-4 md:gap-8">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-xl hidden sm:flex" onClick={() => handleSeek(Math.max(0, currentTime - 5))}>
                    <Icons.skipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" onClick={togglePlayback}>
                    {isPlaying ? <Icons.pause className="h-5 w-5" /> : <Icons.play className="h-5 w-5 fill-current" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-xl hidden sm:flex" onClick={() => handleSeek(Math.min(duration, currentTime + 5))}>
                    <Icons.skipForward className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-[10px] md:text-xs font-mono font-black tracking-tighter">
                  <span className="text-foreground">{formatTime(currentTime)}</span>
                  <span className="text-muted-foreground opacity-40 mx-1 md:mx-2">/</span>
                  <span className="text-muted-foreground">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-6">
                <div className="hidden md:flex items-center gap-3 bg-background px-4 py-2 rounded-2xl border border-border/50">
                  <Icons.zoomOut className="h-3.5 w-3.5 text-muted-foreground" />
                  <Slider 
                    value={[zoom]} 
                    onValueChange={(v) => setZoom(v[0])}
                    min={10} 
                    max={200} 
                    className="w-24 lg:w-40"
                  />
                  <Icons.zoomIn className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                
                <Sheet>
                   <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl lg:hidden">
                         <Icons.settings className="h-4 w-4" />
                      </Button>
                   </SheetTrigger>
                   <SheetContent side="right" className="w-[300px] p-0 border-l border-border bg-card">
                      <div className="p-6 border-b border-border">
                         <h3 className="font-black text-xs uppercase tracking-widest">Properties</h3>
                      </div>
                      <ScrollArea className="h-full p-6">
                         <PropertiesPanel clip={selectedClip} onUpdate={handleUpdateClip} onDelete={handleDeleteClip} />
                      </ScrollArea>
                   </SheetContent>
                </Sheet>

                <Button 
                  onClick={handleSplitClip}
                  disabled={!selectedClip}
                  variant="outline" 
                  size="sm" 
                  className="font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl h-9 px-4 md:px-6 border-border hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50"
                >
                  Split
                </Button>
              </div>
            </div>

            {/* Tracks Area */}
            <ScrollArea className="flex-1">
              <div 
                ref={timelineRef}
                className="p-4 md:p-6 space-y-2 md:space-y-3 min-w-full relative select-none" 
                style={{ width: `${Math.max(zoom, 100)}%` }}
              >
                {tracks.map(track => (
                  <div key={track.id} className="h-12 md:h-14 flex items-center relative group">
                    <div className="w-32 md:w-44 shrink-0 flex items-center px-3 md:px-4 sticky left-0 z-40 bg-card/95 backdrop-blur-sm border-r border-border h-full shadow-lg">
                       <div className="flex items-center gap-2 md:gap-3">
                         {track.type === 'video' ? <Icons.video className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary/60" /> : <Icons.music className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-500/60" />}
                         <span className="text-[8px] md:text-[9px] font-black uppercase text-muted-foreground tracking-widest truncate">{track.name}</span>
                       </div>
                    </div>
                    <div className="flex-1 h-10 md:h-12 mx-2 md:mx-4 bg-muted/10 rounded-lg md:rounded-lg relative overflow-visible border border-border/20 z-10">                       
                       {track.clips.map(clip => {
                         const startPercent = (clip.start / (duration || 1)) * 100
                         const widthPercent = ((clip.end - clip.start) / (duration || 1)) * 100
                         const isSelected = selectedClip?.id === clip.id

                         return (
                           <div 
                             key={clip.id}
                             onPointerDown={(e) => onPointerDown(e, 'move', clip)}
                             className={cn(
                               "absolute top-1 bottom-1 md:top-1.5 md:bottom-1.5 rounded-md md:rounded-lg border flex items-center px-2 cursor-grab active:cursor-grabbing transition-shadow",
                               isSelected ? "bg-primary/90 text-white border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] z-30" : "bg-card border-border hover:border-primary/40 text-foreground z-20"
                             )}
                             style={{
                               left: `${startPercent}%`,
                               width: `${widthPercent}%`
                             }}
                           >
                              {/* Left Trim Handle */}
                              <div 
                                onPointerDown={(e) => onPointerDown(e, 'trim-start', clip)}
                                className={cn(
                                  "absolute left-0 top-0 bottom-0 w-2 md:w-3 cursor-ew-resize hover:bg-white/20 transition-colors rounded-l-md md:rounded-l-lg",
                                  isSelected ? "block" : "hidden group-hover:block"
                                )} 
                              />
                              
                              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter truncate px-2 md:px-4 pointer-events-none">
                                {clip.name}
                              </span>

                              {/* Right Trim Handle */}
                              <div 
                                onPointerDown={(e) => onPointerDown(e, 'trim-end', clip)}
                                className={cn(
                                  "absolute right-0 top-0 bottom-0 w-2 md:w-3 cursor-ew-resize hover:bg-white/20 transition-colors rounded-r-md md:rounded-r-lg",
                                  isSelected ? "block" : "hidden group-hover:block"
                                )} 
                              />
                           </div>
                         )
                       })}
                    </div>
                  </div>
                ))}

                {/* Shared Timeline Playhead Line */}
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-primary z-50 pointer-events-none flex flex-col items-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                  style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% + ${window.innerWidth < 768 ? 128 : 176}px)` }}
                >
                   <div 
                     onPointerDown={(e) => onPointerDown(e, 'playhead')}
                     className="w-4 h-4 md:w-5 md:h-5 bg-primary rotate-45 -mt-2 md:-mt-2.5 shadow-xl border-2 border-background cursor-grab active:cursor-grabbing pointer-events-auto hover:scale-110 transition-transform" 
                   />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Sidebar - Properties (Hidden on Mobile, replaced by Sheet) */}
        <div className="hidden lg:flex w-80 border-l border-border bg-card flex-col shrink-0">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Icons.settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Properties</span>
          </div>
          <ScrollArea className="flex-1 p-8">
            <PropertiesPanel clip={selectedClip} onUpdate={handleUpdateClip} onDelete={handleDeleteClip} />
          </ScrollArea>
          <div className="p-6 border-t border-border bg-muted/5">
             <Button className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-95">
               Finalize Video
             </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
