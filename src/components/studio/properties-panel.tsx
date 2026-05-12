"use client"

import React from "react"
import { Clip } from "@/types/video"
import { Slider } from "@/components/ui/slider"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface PropertiesPanelProps {
  clip: Clip | null
  onUpdate: (updates: Partial<Clip>) => void
}

export function PropertiesPanel({ clip, onUpdate }: PropertiesPanelProps) {
  if (!clip) {
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
                <span className="text-[9px] font-mono text-primary">{Math.round((clip.opacity || 1) * 100)}%</span>
             </div>
             <Slider 
               value={[(clip.opacity || 1) * 100]} 
               onValueChange={([v]) => onUpdate({ opacity: v / 100 })} 
               max={100} 
             />
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Scale</label>
                <span className="text-[9px] font-mono text-primary">{Math.round((clip.scale || 1) * 100)}%</span>
             </div>
             <Slider 
               value={[(clip.scale || 1) * 100]} 
               onValueChange={([v]) => onUpdate({ scale: v / 100 })} 
               max={500} 
             />
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Rotation</label>
                <span className="text-[9px] font-mono text-primary">{clip.rotation || 0}°</span>
             </div>
             <Slider 
               value={[clip.rotation || 0]} 
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
                <span className="text-[9px] font-mono text-emerald-500">{Math.round((clip.volume ?? 1) * 100)}%</span>
             </div>
             <Slider 
               value={[(clip.volume ?? 1) * 100]} 
               onValueChange={([v]) => onUpdate({ volume: v / 100 })} 
               max={100} 
             />
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-10 border-t border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-4 italic">
          <Icons.layers className="h-4 w-4" />
          Transition_Protocols
        </h3>
        <div className="grid grid-cols-1 gap-6">
           <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 italic ml-2">Uplink_Fade</label>
              <div className="grid grid-cols-3 gap-2">
                {(["none", "fade", "dissolve"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onUpdate({ transitionIn: t })}
                    className={cn(
                      "h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all italic",
                      clip.transitionIn === t 
                        ? "bg-accent/10 border-accent/40 text-accent" 
                        : "bg-white/[0.02] border-white/5 text-white/20 hover:bg-white/[0.05]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
           </div>
           <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 italic ml-2">Downlink_Fade</label>
              <div className="grid grid-cols-3 gap-2">
                {(["none", "fade", "dissolve"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onUpdate({ transitionOut: t })}
                    className={cn(
                      "h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all italic",
                      clip.transitionOut === t 
                        ? "bg-accent/10 border-accent/40 text-accent" 
                        : "bg-white/[0.02] border-white/5 text-white/20 hover:bg-white/[0.05]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
