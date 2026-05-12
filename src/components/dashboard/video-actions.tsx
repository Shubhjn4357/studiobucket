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
      toast.success("Asset decommissioned")
    } catch {
      toast.error("Decommissioning failed")
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
          className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
        >
          {isDeleting ? <Icons.refreshCw className="h-4 w-4 animate-spin" /> : <Icons.trash2 className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="backdrop-blur-3xl bg-black/80 border-white/10 rounded-[2.5rem] p-10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter italic">Decommission Asset?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium text-muted-foreground uppercase tracking-widest leading-relaxed mt-4">
            This protocol will permanently purge the asset from the local repository. 
            Recovery of structural data will be impossible after execution.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-10 gap-4">
          <AlertDialogCancel className="h-14 rounded-2xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] px-8 hover:bg-white/10 transition-all italic text-white/60">Abort Protocol</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-10 hover:bg-red-600 shadow-2xl shadow-red-500/20 transition-all italic"
          >
            Confirm Purge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
