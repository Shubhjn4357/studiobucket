import { NextResponse } from "next/server"
import { VideoService } from "@/lib/services/video-service"

export const dynamic = "force-dynamic"

export async function GET() {
  const videoService = new VideoService()
  const health = await videoService.getHealth()
  
  return NextResponse.json({
    ...health,
    version: "1.0.0-prod"
  }, { status: health.status === "operational" ? 200 : 500 })
}
