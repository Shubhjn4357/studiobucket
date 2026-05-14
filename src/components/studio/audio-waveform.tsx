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

    const drawRealWaveform = async () => {
      if (!audioUrl) return
      
      try {
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const CustomWindow = window as unknown as { webkitAudioContext: typeof AudioContext }
        const audioContext = new (window.AudioContext || CustomWindow.webkitAudioContext)()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        const channelData = audioBuffer.getChannelData(0)
        const step = Math.ceil(channelData.length / width)
        const amp = height / 2

        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = color

        for (let i = 0; i < width; i++) {
          let min = 1.0
          let max = -1.0
          // Find the peak bounds in this step
          for (let j = 0; j < step; j++) {
            const index = (i * step) + j
            if (index < channelData.length) {
              const datum = channelData[index]
              if (datum < min) min = datum
              if (datum > max) max = datum
            }
          }
          
          const y = (1 + min) * amp
          const h = Math.max(1, (max - min) * amp)
          
          ctx.fillRect(i, y, 1, h)
        }
      } catch (err) {
        console.error("Failed to render real waveform:", err)
      }
    }

    drawRealWaveform()
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
