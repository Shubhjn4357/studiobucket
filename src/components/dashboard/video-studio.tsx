"use client"

import { useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { updateVideoMetadata, triggerAutoCut } from "@/app/dashboard/studio/actions"
import { toast } from "sonner"
import { Track } from "@/types/video"
import { motion, AnimatePresence } from "framer-motion"

type StudioTab = "details" | "editor" | "analytics" | "editor-v2"

interface VideoStudioProps {
  videoId: string
  initialData?: {
    tracks: Track[]
    duration: number
  }
  title?: string
}

export function VideoStudio({ videoId, initialData, title = "Untitled Project" }: VideoStudioProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>("details")
  const [isSaving, setIsSaving] = useState(false)
 
  // Metadata state
  const [metadata, setMetadata] = useState({
    title: title,
    description: "",
    tags: "",
    privacy: "private" as "public" | "private" | "unlisted",
  })

  const [tracks,setTracks] = useState<Track[]>(initialData?.tracks || [
    { id: "v1", name: "Video", type: "video", clips: [{ id: "c1", start: 0, end: 30, duration: 30, color: "bg-primary/20" }] },
    { id: "a1", name: "Audio", type: "audio", clips: [{ id: "c3", start: 0, end: 60, duration: 60, color: "bg-emerald-500/20" }] },
  ])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateVideoMetadata(videoId, { tracks, ...metadata })
      toast.success("Changes saved")
    } catch {
      toast.error("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const renderDetails = () => (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <div className="xl:col-span-8 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title (required)</label>
            <div className="relative group">
              <textarea
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-xl p-4 text-sm font-bold uppercase tracking-tight focus:border-primary/50 outline-none transition-all resize-none h-20"
                placeholder="Enter a title that describes your video"
              />
              <span className="absolute bottom-3 right-3 text-[9px] font-black text-muted-foreground">{metadata.title.length}/100</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
            <div className="relative group">
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                className="w-full bg-muted/30 border border-border rounded-xl p-4 text-sm font-medium focus:border-primary/50 outline-none transition-all resize-none h-48"
                placeholder="Tell viewers about your video"
              />
              <span className="absolute bottom-3 right-3 text-[9px] font-black text-muted-foreground">{metadata.description.length}/5000</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Thumbnail</label>
            <div className="grid grid-cols-4 gap-4">
              <div className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/30 cursor-pointer transition-colors bg-muted/20">
                <Icons.imagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center px-2">Upload Thumbnail</span>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video rounded-xl bg-slate-900 border border-border animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="xl:col-span-4 space-y-6">
        <Card className="cyber-card border-border bg-card/50 overflow-hidden sticky top-24">
          <div className="aspect-video bg-slate-950 flex items-center justify-center relative group">
            <Icons.play className="h-10 w-10 text-white/20 group-hover:text-primary transition-all scale-100 group-hover:scale-110" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] font-black text-white uppercase">0:00 / 0:00</span>
            </div>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-1">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Video Link</p>
              <div className="flex items-center gap-2 text-primary font-bold text-xs truncate">
                https://studiobucket.app/v/{videoId}
                <Icons.copy className="h-3 w-3 cursor-pointer hover:text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Filename</p>
              <p className="text-xs font-bold text-foreground truncate uppercase">{title}.mp4</p>
            </div>
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Visibility</label>
                <select 
                  value={metadata.privacy}
                  onChange={(e) => setMetadata({ ...metadata, privacy: e.target.value as "public" | "private" | "unlisted" })}
                  className="w-full bg-muted border border-border rounded-lg px-3 h-10 text-xs font-black uppercase tracking-widest outline-none focus:border-primary/50"
                >
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full bg-primary text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-xl shadow-lg shadow-primary/20">
                {isSaving ? <Icons.refreshCw className="h-3 w-3 animate-spin mr-2" /> : <Icons.save className="h-3 w-3 mr-2" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderEditor = () => (
    <div className="space-y-6">
      <div className="h-[400px] bg-slate-950 rounded-2xl border border-border flex items-center justify-center relative">
        <Icons.video className="h-20 w-20 text-white/5" />
        <div className="absolute inset-0 flex items-center justify-center">
           <Button className="rounded-full h-16 w-16 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20">
              <Icons.play className="h-8 w-8 text-white fill-white" />
           </Button>
        </div>
      </div>
      
      <Card className="cyber-card border-border bg-card/50 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button 
               size="icon" 
               variant="ghost" 
               className="h-9 w-9 rounded-xl hover:bg-muted text-primary"
               onClick={async () => {
                 toast.promise(
                   (async () => {
                     const { jobId } = await triggerAutoCut(videoId)
                     return jobId
                   })(),
                   {
                     loading: "Detecting scene cuts...",
                     success: (jobId) => `AI Detection initiated (Job: ${jobId})`,
                     error: "Detection failed"
                   }
                 )
               }}
             >
               <Icons.sparkles className="h-4 w-4" />
             </Button>
             <div className="h-4 w-px bg-border mx-2" />
             <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-muted"><Icons.undo className="h-4 w-4" /></Button>
             <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-muted"><Icons.redo className="h-4 w-4" /></Button>
             <div className="h-4 w-px bg-border mx-2" />
             <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-muted"><Icons.scissors className="h-4 w-4" /></Button>
             <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-muted text-primary"><Icons.plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Icons.zoomIn className="h-3 w-3" />
                <Slider className="w-32" defaultValue={[50]} />
             </div>
          </div>
        </div>

        <div className="space-y-2">
          {tracks.map((track) => (
            <div key={track.id} className="h-14 border-b border-border flex items-center relative group">
              <div className="w-32 flex items-center gap-3 px-3 shrink-0">
                {track.type === "video" ? <Icons.video className="h-3 w-3 text-primary" /> : <Icons.music className="h-3 w-3 text-emerald-500" />}
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{track.name}</span>
              </div>
              <div className="flex-1 h-10 bg-muted/30 rounded-lg relative overflow-hidden">
                {track.clips.map(clip => (
                  <div 
                    key={clip.id} 
                    className={cn("absolute h-full rounded-md border border-white/5", clip.color)}
                    style={{ left: `${(clip.start / 60) * 100}%`, width: `${(clip.duration / 60) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex border-b border-border">
        {[
          { id: "details", label: "Details", icon: Icons.edit3 },
          { id: "editor", label: "Editor", icon: Icons.scissors },
          { id: "analytics", label: "Analytics", icon: Icons.barChart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as StudioTab)}
            className={cn(
              "flex items-center gap-2 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="studio-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "details" && renderDetails()}
          {activeTab === "editor" && renderEditor()}
          {activeTab === "analytics" && (
            <div className="py-20 text-center border border-dashed border-border rounded-2xl">
               <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <Icons.barChart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Analytics processing in progress...</p>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
