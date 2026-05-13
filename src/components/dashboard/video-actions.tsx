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
      toast.success("Asset successfully decommissioned")
    } catch {
      toast.error("Protocol failure: Unable to Remove asset")
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
          className="h-8 w-8 rounded-none bg-white/2 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-white/20 hover:text-red-500 transition-all group"
        >
          {isDeleting ? <Icons.refreshCw className="h-4 w-4 animate-spin" /> : <Icons.trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md backdrop-blur-3xl bg-black/90 border border-red-500/20 rounded-none p-6 shadow-2xl relative overflow-hidden">
        {/* Background Hazard Pattern */}
        <div className="absolute inset-0 industrial-grid pointer-events-none opacity-5" />
        
        <AlertDialogHeader className="relative z-10 space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
             <div className="h-12 w-12 rounded-none bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-2xl relative group">
                <Icons.alertTriangle className="h-6 w-6 text-red-500 relative z-10" />
             </div>
             <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                   <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                   <span className="text-hud text-red-500 tracking-[0.4em]">CRITICAL_AUTHORIZATION_REQUIRED</span>
                </div>
                <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">PURGE_PROTOCOL</AlertDialogTitle>
             </div>
          </div>
          
          <AlertDialogDescription className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-relaxed text-center italic">
            Permanent decommissioning of asset <span className="text-red-500/60">NODE_{videoId.slice(0, 8).toUpperCase()}</span>. 
            All binaries will be irreversibly removed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-6 p-4 rounded-none bg-red-500/5 border border-red-500/10 flex items-center gap-4 group/warning relative z-10">
          <Icons.shieldAlert className="h-4 w-4 text-red-500/40" />
          <p className="text-[8px] font-black text-red-500/60 uppercase tracking-widest leading-relaxed italic">
            WARNING: ACTION CANNOT BE REVERSED.
          </p>
        </div>

        <AlertDialogFooter className="mt-8 gap-4 sm:flex-row flex-col relative z-10">
          <AlertDialogCancel className="h-10 flex-1 rounded-none border-white/5 bg-white/5 text-hud px-6 hover:bg-white/10 transition-all italic text-white/40 border">
            ABORT_SEQUENCE
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="h-10 flex-1 rounded-none bg-red-500 text-white text-hud px-6 hover:bg-red-600 transition-all italic border border-red-400/20 group/confirm"
          >
            <Icons.zap className="h-4 w-4 mr-2 group-hover/confirm:animate-bounce" />
            CONFIRM_PURGE
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
