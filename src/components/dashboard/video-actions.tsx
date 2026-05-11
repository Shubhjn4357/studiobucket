"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { deleteVideoAction } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { useState } from "react"

export function VideoActions({ videoId }: { videoId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) return
    
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
    <Button 
      size="icon" 
      variant="ghost" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
    >
      {isDeleting ? <Icons.refreshCw className="h-4 w-4 animate-spin" /> : <Icons.trash2 className="h-4 w-4" />}
    </Button>
  )
}
