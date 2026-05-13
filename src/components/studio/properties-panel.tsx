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
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 opacity-50">
        <Icons.mousePointer2 className="h-10 w-10 mb-4" />
        <p className="text-sm font-bold text-center">Select a clip to edit its properties</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Name Section */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Clip Name</label>
        <Input 
          value={clip.name} 
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="h-10 border-border rounded-xl font-bold focus-visible:ring-primary/20"
          placeholder="Enter clip name..."
        />
      </div>

      <div className="h-px bg-border/50" />

      {/* Timing Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Icons.clock className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Timing</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Start (s)</label>
            <div className="h-10 px-3 bg-muted/50 border border-border rounded-xl flex items-center">
              <span className="text-sm font-mono font-bold">{clip.start.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">End (s)</label>
            <div className="h-10 px-3 bg-muted/50 border border-border rounded-xl flex items-center">
              <span className="text-sm font-mono font-bold">{clip.end.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Visual Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Icons.layers className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Appearance</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Transparency</label>
              <span className="text-xs font-bold text-primary">{Math.round((clip.opacity || 1) * 100)}%</span>
            </div>
            <Slider 
              value={[(clip.opacity || 1) * 100]} 
              onValueChange={(v) => onUpdate({ opacity: v[0] / 100 })}
              max={100} 
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Volume</label>
              <span className="text-xs font-bold text-primary">{Math.round((clip.volume || 1) * 100)}%</span>
            </div>
            <Slider 
              value={[(clip.volume || 1) * 100]} 
              onValueChange={(v) => onUpdate({ volume: v[0] / 100 })}
              max={100} 
              step={1}
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Info Section */}
      <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-3">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-muted-foreground uppercase">Status</span>
          <span className="text-green-500 uppercase">Ready</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-muted-foreground uppercase">Clip ID</span>
          <span className="font-mono">{clip.id.slice(0, 8)}</span>
        </div>
      </div>
    </div>
  )
}
