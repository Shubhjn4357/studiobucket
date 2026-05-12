"use client"

import React, { useEffect, useRef } from "react"

interface AudioWaveformProps {
  audioUrl: string
  width: number
  height: number
  color?: string
}

export function AudioWaveform({ audioUrl, width, height, color = "#10b981" }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple procedural waveform for now
    // In a real app, we would fetch the audio and use Web Audio API to get real peaks
    const drawMockWaveform = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = color
      
      const step = 2
      for (let i = 0; i < width; i += step) {
        const h = Math.random() * (height / 2)
        ctx.fillRect(i, height / 2 - h / 2, 1.5, h)
      }
    }

    drawMockWaveform()
  }, [audioUrl, width, height, color])

  return (
    <div className="relative group overflow-hidden rounded-xl border border-white/5 bg-black/20">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none" />
    </div>
  )
}
