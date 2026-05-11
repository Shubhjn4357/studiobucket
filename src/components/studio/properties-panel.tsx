"use client"

import React from "react"
import { Clip } from "@/types/video"
import { Slider } from "@/components/ui/slider"
import { Icons } from "@/components/ui/icons"

interface PropertiesPanelProps {
  selectedClip: Clip | null
  onUpdate: (updates: Partial<Clip>) => void
}

export function PropertiesPanel({ selectedClip, onUpdate }: PropertiesPanelProps) {
  if (!selectedClip) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <Icons.info className="h-8 w-8 mb-4 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest italic">Select a clip to view properties</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 overflow-y-auto h-full">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Icons.sliders className="h-3 w-3" />
          Transform
        </h3>
        
        <div className="space-y-6">
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Opacity</label>
                <span className="text-[9px] font-mono text-primary">{Math.round((selectedClip.opacity || 1) * 100)}%</span>
             </div>
             <Slider 
               value={[(selectedClip.opacity || 1) * 100]} 
               onValueChange={([v]) => onUpdate({ opacity: v / 100 })} 
               max={100} 
             />
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Scale</label>
                <span className="text-[9px] font-mono text-primary">{Math.round((selectedClip.scale || 1) * 100)}%</span>
             </div>
             <Slider 
               value={[(selectedClip.scale || 1) * 100]} 
               onValueChange={([v]) => onUpdate({ scale: v / 100 })} 
               max={500} 
             />
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Rotation</label>
                <span className="text-[9px] font-mono text-primary">{selectedClip.rotation || 0}°</span>
             </div>
             <Slider 
               value={[selectedClip.rotation || 0]} 
               onValueChange={([v]) => onUpdate({ rotation: v })} 
               min={-180}
               max={180} 
             />
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
             <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                  <Icons.volume2 className="h-3 w-3" />
                  Audio Volume
                </label>
                <span className="text-[9px] font-mono text-emerald-500">{Math.round((selectedClip.volume ?? 1) * 100)}%</span>
             </div>
             <Slider 
               value={[(selectedClip.volume ?? 1) * 100]} 
               onValueChange={([v]) => onUpdate({ volume: v / 100 })} 
               max={100} 
             />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-8 border-t border-border">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
          <Icons.layers className="h-3 w-3" />
          Transitions
        </h3>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">In</label>
              <select 
                value={selectedClip.transitionIn || "none"}
                onChange={(e) => onUpdate({ transitionIn: e.target.value as "none" | "fade" | "dissolve" })}
                className="w-full bg-muted border border-border rounded px-2 h-8 text-[9px] font-black uppercase tracking-widest outline-none"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="dissolve">Dissolve</option>
              </select>
           </div>
           <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Out</label>
              <select 
                value={selectedClip.transitionOut || "none"}
                onChange={(e) => onUpdate({ transitionOut: e.target.value as "none" | "fade" | "dissolve" })}
                className="w-full bg-muted border border-border rounded px-2 h-8 text-[9px] font-black uppercase tracking-widest outline-none"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="dissolve">Dissolve</option>
              </select>
           </div>
        </div>
      </div>
    </div>
  )
}
