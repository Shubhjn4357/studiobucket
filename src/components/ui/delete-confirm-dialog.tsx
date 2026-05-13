"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  requireWordConfirm?: string
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete item?",
  description = "This action cannot be undone. This will permanently delete the item.",
  confirmText = "Delete",
  requireWordConfirm
}: DeleteConfirmDialogProps) {
  const [inputValue, setInputValue] = useState("")
  const isConfirmDisabled = requireWordConfirm ? inputValue !== requireWordConfirm : false

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[2.5rem] border-border shadow-2xl p-8 max-w-[450px]">
        <AlertDialogHeader className="space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
             <Icons.trash2 className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <AlertDialogTitle className="text-2xl font-black tracking-tight">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        {requireWordConfirm && (
          <div className="py-6 space-y-3">
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
               Type <span className="text-foreground select-none">"{requireWordConfirm}"</span> to confirm
             </p>
             <Input 
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               className="h-12 rounded-xl bg-muted/30 border-border focus:ring-red-500/20"
               placeholder={requireWordConfirm}
             />
          </div>
        )}

        <AlertDialogFooter className="pt-6 gap-3">
          <AlertDialogCancel className="h-12 rounded-2xl px-6 font-bold border-border mt-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className="h-12 rounded-2xl px-8 font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
