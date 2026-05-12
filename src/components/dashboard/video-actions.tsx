"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { deleteVideoAction } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function VideoActions({ videoId }: { videoId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteVideoAction(videoId)
      toast.success("Asset successfully decommissioned from node")
    } catch {
      toast.error("Protocol failure: Unable to purge asset")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          size="icon" 
          variant="ghost" 
          disabled={isDeleting}
          className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-white/20 hover:text-red-500 transition-all group"
        >
          {isDeleting ? <Icons.refreshCw className="h-5 w-5 animate-spin" /> : <Icons.trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-xl backdrop-blur-3xl bg-black/90 border border-red-500/20 rounded-[3.5rem] p-16 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Background Hazard Pattern */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(239,68,68,0.03)_20px,rgba(239,68,68,0.03)_40px)] pointer-events-none" />
        
        <AlertDialogHeader className="relative z-10 space-y-10">
          <div className="flex flex-col items-center gap-8 text-center">
             <div className="h-24 w-24 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.2)] relative group">
                <div className="absolute inset-0 rounded-[2.5rem] bg-red-500 blur-2xl opacity-10 animate-pulse" />
                <Icons.alertTriangle className="h-12 w-12 text-red-500 relative z-10" />
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                   <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                   <span className="text-[11px] font-black text-red-500 uppercase tracking-[0.6em] italic">Critical_Authorization_Required</span>
                </div>
                <AlertDialogTitle className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">Purge_Protocol</AlertDialogTitle>
                <div className="h-px w-32 bg-red-500/20 mx-auto mt-6" />
             </div>
          </div>
          
          <AlertDialogDescription className="text-sm font-black text-white/40 uppercase tracking-[0.3em] leading-relaxed text-center italic mt-10">
            You are about to initiate a permanent decommissioning sequence for asset <span className="text-red-500/60">NODE_{videoId.slice(0, 8).toUpperCase()}</span>. 
            All structural data, metadata, and local physical binaries will be irreversibly purged from the repository.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-16 grid grid-cols-1 gap-6 relative z-10">
           <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/10 flex items-center gap-6 group/warning">
              <Icons.shieldAlert className="h-6 w-6 text-red-500/40 group-hover/warning:scale-110 transition-transform" />
              <p className="text-[9px] font-black text-red-500/60 uppercase tracking-widest leading-relaxed italic">
                WARNING: THIS ACTION CANNOT BE REVERSED. THE CLOUD SYNC STATE MAY BE IMPACTED BY THIS DELETION.
              </p>
           </div>
        </div>

        <AlertDialogFooter className="mt-16 gap-6 sm:flex-row flex-col relative z-10">
          <AlertDialogCancel className="h-20 flex-1 rounded-[2rem] border-white/5 bg-white/5 text-[11px] font-black uppercase tracking-[0.4em] px-12 hover:bg-white/10 transition-all italic text-white/40 border hover:border-white/10">
            Abort_Sequence
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="h-20 flex-1 rounded-[2rem] bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.4em] px-12 hover:bg-red-600 shadow-[0_0_50px_rgba(239,68,68,0.3)] transition-all italic border border-red-400/20 group/confirm"
          >
            <Icons.zap className="h-5 w-5 mr-4 group-hover/confirm:animate-bounce" />
            Confirm_Purge
          </AlertDialogAction>
        </AlertDialogFooter>
        
        {/* Dynamic Scanline Overlay */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-shimmer" />
      </AlertDialogContent>
    </AlertDialog>
  )
}
