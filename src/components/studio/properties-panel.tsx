"use client"

import React from "react"
import { Clip } from "@/types/video"
import { Slider } from "@/components/ui/slider"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"

interface PropertiesPanelProps {
  clip: Clip | null
  onUpdate: (updates: Partial<Clip>) => void
}

export function PropertiesPanel({ clip, onUpdate }: PropertiesPanelProps) {
  if (!clip) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <Icons.info className="h-8 w-8 mb-4 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest italic text-center">Node_Selection_Required</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Node Identity Section */}
      <div className="space-y-3">
         <div className="flex items-center justify-between">
            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">Active_Node</span>
            <span className="text-[7px] font-mono text-primary/60">NODE_{clip.id.slice(0, 8).toUpperCase()}</span>
         </div>
         <div className="space-y-1.5">
            <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest italic ml-1">Asset_Label</label>
            <Input 
              value={clip.name} 
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-7 bg-background border-border rounded-sm text-[9px] font-bold uppercase tracking-tight focus-visible:ring-primary/20"
            />
         </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Temporal Parameters */}
      <div className="space-y-3">
         <div className="flex items-center gap-2">
            <Icons.clock className="h-3 w-3 text-primary/40" />
            <span className="text-[8px] font-black text-foreground uppercase tracking-widest italic">Temporal_Logic</span>
         </div>
         
         <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
               <label className="text-[7px] font-black uppercase text-muted-foreground tracking-widest italic">In_Point</label>
               <div className="h-7 px-2 bg-background border border-border rounded-sm flex items-center">
                  <span className="text-[9px] font-mono font-bold text-foreground">{clip.start.toFixed(2)}s</span>
               </div>
            </div>
            <div className="space-y-1">
               <label className="text-[7px] font-black uppercase text-muted-foreground tracking-widest italic">Out_Point</label>
               <div className="h-7 px-2 bg-background border border-border rounded-sm flex items-center">
                  <span className="text-[9px] font-mono font-bold text-foreground">{clip.end.toFixed(2)}s</span>
               </div>
            </div>
         </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Visual Controls */}
      <div className="space-y-4">
         <div className="flex items-center gap-2">
            <Icons.layers className="h-3 w-3 text-primary/40" />
            <span className="text-[8px] font-black text-foreground uppercase tracking-widest italic">Visual_Matrix</span>
         </div>

         <div className="space-y-3">
            <div className="space-y-1.5">
               <div className="flex justify-between items-center px-1">
                  <label className="text-[7px] font-black uppercase text-muted-foreground tracking-widest italic">Opacity_Layer</label>
                  <span className="text-[8px] font-mono font-black text-primary italic">{Math.round((clip.opacity || 1) * 100)}%</span>
               </div>
               <Slider 
                 value={[(clip.opacity || 1) * 100]} 
                 onValueChange={(v) => onUpdate({ opacity: v[0] / 100 })}
                 max={100} 
                 step={1}
                 className="py-1"
               />
            </div>

            <div className="space-y-1.5">
               <div className="flex justify-between items-center px-1">
                  <label className="text-[7px] font-black uppercase text-muted-foreground tracking-widest italic">Signal_Gain</label>
                  <span className="text-[8px] font-mono font-black text-primary italic">{Math.round((clip.volume || 1) * 100)}%</span>
               </div>
               <Slider 
                 value={[(clip.volume || 1) * 100]} 
                 onValueChange={(v) => onUpdate({ volume: v[0] / 100 })}
                 max={100} 
                 step={1}
                 className="py-1"
               />
            </div>
         </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Sector Meta */}
      <div className="p-3 bg-muted/20 border border-border rounded-sm space-y-2 relative overflow-hidden">
         <div className="absolute inset-0 tactical-grid opacity-5" />
         <div className="relative z-10 space-y-1.5">
            <div className="flex justify-between items-center">
               <span className="text-[7px] font-black text-muted-foreground uppercase">Sync_Protocol</span>
               <span className="text-[7px] font-black text-success uppercase">Active</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[7px] font-black text-muted-foreground uppercase">Cache_Node</span>
               <span className="text-[7px] font-black text-foreground uppercase">Edge_Alpha</span>
            </div>
         </div>
      </div>
    </div>
  )
}
