"use client"

import { useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getVideosAction, scheduleVideoAction, getPlaylistsAction } from "@/app/dashboard/actions"
import { cn } from "@/lib/utils"
import { VideoWithStats, YouTubePlaylist } from "@/types/video"
import Image from "next/image"

export function DeploymentModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [selectedVideoId, setSelectedVideoId] = useState("")
  const [videos, setVideos] = useState<VideoWithStats[]>([])
  const [isPending, setIsPending] = useState(false)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([])
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("")
  const [location, setLocation] = useState("")
  const router = useRouter()

  const loadVideos = async () => {
    setIsLoadingVideos(true)
    try {
      const data = await getVideosAction()
      setVideos(data as VideoWithStats[])
    } catch {
      toast.error("Failed to load asset library")
    } finally {
      setIsLoadingVideos(false)
    }
  }
  const loadPlaylists = async () => {
    try {
      const data = await getPlaylistsAction()
      setPlaylists(data as YouTubePlaylist[])
    } catch {
      // Fail silently for playlists
    }
  }


  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVideoId) return toast.error("Select an asset for deployment")
    
    setIsPending(true)
    try {
      const scheduledAt = new Date(`${date}T${time}`).getTime()
      await scheduleVideoAction({ videoId: selectedVideoId, scheduledAt })
      toast.success("Deployment sequence scheduled")
      setIsOpen(false)
      router.refresh()
    } catch {
      toast.error("Scheduling failed")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open)
        if (open) {
          loadVideos()
          loadPlaylists()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-11 bg-primary text-white hover:opacity-90 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
          <Icons.plus className="h-4 w-4 mr-2" />
          Schedule Deployment
        </Button>
      </DialogTrigger>
      <DialogContent className="cyber-card border-border bg-card/95 backdrop-blur-md max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Schedule Deployment</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Target launch parameters for automated distribution
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSchedule} className="space-y-6 py-4">
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Asset</label>
             <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingVideos ? (
                  <div className="col-span-2 py-8 flex justify-center"><Icons.refreshCw className="h-6 w-6 animate-spin text-primary" /></div>
                ) : videos.length === 0 ? (
                  <p className="col-span-2 text-[10px] text-center text-muted-foreground uppercase py-4">No assets available for deployment</p>
                ) : (
                  videos.map((v) => (
                    <div 
                      key={v.id} 
                      onClick={() => setSelectedVideoId(v.id)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3",
                        selectedVideoId === v.id ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/30"
                      )}
                    >
                       <div className="h-10 w-16 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-border relative">
                          {v.thumbnailPath && (
                            <Image 
                              src={v.thumbnailPath} 
                              alt={v.title}
                              fill
                              className="object-cover" 
                            />
                          )}
                       </div>
                       <p className="text-[9px] font-black uppercase tracking-tight truncate">{v.title}</p>
                    </div>
                  ))
                )}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Playlist Integration</label>
               <select 
                value={selectedPlaylistId}
                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                className="w-full h-12 bg-muted/50 border-border rounded-xl font-bold px-4 text-[11px] appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-hidden"
               >
                 <option value="">Select Target Playlist</option>
                 {playlists.map(p => (
                   <option key={p.id} value={p.id}>{p.snippet?.title}</option>
                 ))}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Geographic Node</label>
               <Input 
                placeholder="City, Country (e.g. Tokyo, JP)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12 bg-muted/50 border-border rounded-xl font-bold px-4"
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Launch Date</label>
              <Input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-12 bg-muted/50 border-border rounded-xl font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Launch Time</label>
              <Input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="h-12 bg-muted/50 border-border rounded-xl font-bold" 
              />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
             <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icons.info className="h-5 w-5 text-primary" />
             </div>
             <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight leading-relaxed">
               Distribution will be synchronized across all linked nodes based on the selected UTC offset.
             </p>
          </div>
          <Button 
            type="submit" 
            disabled={isPending || !selectedVideoId}
            className="w-full h-12 bg-primary text-white hover:opacity-90 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
          >
            {isPending ? <Icons.refreshCw className="h-4 w-4 animate-spin mr-2" /> : <Icons.zap className="h-4 w-4 mr-2" />}
            Confirm Deployment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
