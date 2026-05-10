import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { logger } from "@/lib/logger"
import { UpdateVideoSchema } from "@/schemas"

export const dynamic = "force-dynamic"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const video = await db
            .select()
            .from(videos)
            .where(
                and(
                    eq(videos.id, id),
                    eq(videos.userId, session.user.id)
                )
            )
            .limit(1)

        if (!video.length) {
            return NextResponse.json(
                { error: "Video not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: video[0],
        })
    } catch (error) {
        logger.error(error, "Get video error:")
        return NextResponse.json(
            { error: "Failed to fetch video" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validated = UpdateVideoSchema.parse(body)
        const now = Math.floor(Date.now() / 1000)

        const updated = await db
            .update(videos)
            .set({
                ...validated,
                updatedAt: now,
            })
            .where(
                and(
                    eq(videos.id, id),
                    eq(videos.userId, session.user.id)
                )
            )
            .returning()

        if (!updated.length) {
            return NextResponse.json(
                { error: "Video not found" },
                { status: 404 }
            )
        }

        logger.info(`Video updated: ${id}`)

        return NextResponse.json({
            success: true,
            data: updated[0],
        })
    } catch (error) {
        logger.error(error, "Update video error:")
        return NextResponse.json(
            { error: "Failed to update video" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const deleted = await db
            .delete(videos)
            .where(
                and(
                    eq(videos.id, id),
                    eq(videos.userId, session.user.id)
                )
            )
            .returning()

        if (!deleted.length) {
            return NextResponse.json(
                { error: "Video not found" },
                { status: 404 }
            )
        }

        logger.info(`Video deleted: ${id}`)

        return NextResponse.json({
            success: true,
            data: deleted[0],
        })
    } catch (error) {
        logger.error(error, "Delete video error:")
        return NextResponse.json(
            { error: "Failed to delete video" },
            { status: 500 }
        )
    }
}
