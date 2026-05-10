import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { logger } from "@/lib/logger"
import { CreateVideoSchema } from "@/schemas"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const status = searchParams.get("status")
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
        const offset = parseInt(searchParams.get("offset") || "0")
        const conditions = [eq(videos.userId, session.user.id)]

        if (status) {
            conditions.push(eq(videos.status, status))
        }

        const userVideos = await db
            .select()
            .from(videos)
            .where(and(...conditions))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(videos.createdAt))

        logger.info(
            `Retrieved ${userVideos.length} videos for user ${session.user.email}`
        )

        return NextResponse.json({
            success: true,
            data: userVideos,
        })
    } catch (error) {
        logger.error(error, "Get videos error:")
        return NextResponse.json(
            { error: "Failed to fetch videos" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validated = CreateVideoSchema.parse(body)

        const videoId = randomUUID()
        const now = Math.floor(Date.now() / 1000)

        const newVideo = await db.insert(videos).values({
            id: videoId,
            ...validated,
            userId: session.user.id,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        }).returning()

        logger.info(`Video created: ${videoId} for user ${session.user.id}`)

        return NextResponse.json(
            {
                success: true,
                data: newVideo[0],
            },
            { status: 201 }
        )
    } catch (error) {
        logger.error(error, "Create video error:")
        return NextResponse.json(
            { error: "Failed to create video" },
            { status: 500 }
        )
    }
}
