"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { deleteVideoAction } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { useState } from "react"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

export function VideoActions({ videoId }: { videoId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    setShowDeleteDialog(false)
    try {
      await deleteVideoAction(videoId)
      toast.success("Video deleted successfully")
    } catch {
      toast.error("Failed to delete video")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button 
        size="icon" 
        variant="ghost" 
        disabled={isDeleting}
        onClick={() => setShowDeleteDialog(true)}
        className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all group"
      >
        {isDeleting ? <Icons.refreshCw className="h-4 w-4 animate-spin" /> : <Icons.trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />}
      </Button>

      <DeleteConfirmDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Video?"
        description="This will permanently remove the video and all its data. This action cannot be undone."
        confirmText="Delete Video"
      />
    </>
  )
}
