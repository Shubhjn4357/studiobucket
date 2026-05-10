import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { VideoService } from "@/lib/services/video-service"

interface SearchResult {
  id: string
  title: string
  type: "video" | "tool"
  href: string
  description: string
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase() || ""

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const videoService = new VideoService()
  const [videos] = await Promise.all([
    videoService.getUserVideos(session.user.id, undefined, q, 5),
  ])

  const results: SearchResult[] = []

  // Add video results
  videos.forEach((v) => {
    results.push({
      id: v.id,
      title: v.title,
      type: "video",
      href: `/dashboard/studio?id=${v.id}`,
      description: `Status: ${v.status}`
    })
  })

  // Add functional results
  const tools = [
    { title: "Manage Queue", href: "/dashboard/queue", type: "tool" as const, keywords: ["queue", "jobs", "active", "upload"] },
    { title: "Video Analytics", href: "/dashboard/analytics", type: "tool" as const, keywords: ["stats", "analytics", "views", "likes"] },
    { title: "Channel Content", href: "/dashboard/content", type: "tool" as const, keywords: ["videos", "content", "library"] },
    { title: "Channel Manager", href: "/dashboard/channels", type: "tool" as const, keywords: ["channels", "switch", "youtube"] },
    { title: "Documentation", href: "/docs", type: "tool" as const, keywords: ["help", "manual", "guide", "docs"] },
  ]

  tools.forEach(tool => {
    if (tool.title.toLowerCase().includes(q) || tool.keywords.some(k => k.includes(q))) {
      results.push({
        id: `tool-${tool.href}`,
        title: tool.title,
        type: "tool",
        href: tool.href,
        description: "System Navigation"
      })
    }
  })

  return NextResponse.json({ results })
}
