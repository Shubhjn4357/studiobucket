import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { analytics } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const videoId = searchParams.get("videoId")
        const channelId = searchParams.get("channelId")
        const startDate = searchParams.get("startDate")
        const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000)

        const conditions = [eq(analytics.userId, session.user.id)]

        if (videoId) {
            conditions.push(eq(analytics.videoId, videoId))
        }

        if (channelId) {
            conditions.push(eq(analytics.channelId, channelId))
        }

        if (startDate) {
            conditions.push(eq(analytics.date, startDate))
        }

        const analyticsData = await db
            .select()
            .from(analytics)
            .where(and(...conditions))
            .limit(limit)
            .orderBy(desc(analytics.date))

        logger.info(
            `Retrieved ${analyticsData.length} analytics records for user ${session.user.id}`
        )

        return NextResponse.json({
            success: true,
            data: analyticsData,
        })
    } catch (error) {
        logger.error(error, "Get analytics error:")
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
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
        const {
            videoId,
            channelId,
            date,
            views,
            likes,
            comments,
            shares,
            watchTimeMinutes,
            subscribers,
            revenue,
            engagementRate,
        } = body

        if (!date) {
            return NextResponse.json(
                { error: "date is required" },
                { status: 400 }
            )
        }

        const now = Math.floor(Date.now() / 1000)

        const newAnalytics = await db
            .insert(analytics)
            .values({
                id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: session.user.id,
                videoId: videoId,
                channelId: channelId,
                date: date,
                views: views || 0,
                likes: likes || 0,
                comments: comments || 0,
                shares: shares || 0,
                watchTimeMinutes: watchTimeMinutes || 0,
                subscribers: subscribers || 0,
                revenue: revenue || 0,
                engagementRate: engagementRate,
                createdAt: now,
                updatedAt: now,
            })
            .returning()

        logger.info(`Analytics record created for user ${session.user.id}`)

        return NextResponse.json(
            {
                success: true,
                data: newAnalytics[0],
            },
            { status: 201 }
        )
    } catch (error) {
        logger.error(error, "Create analytics error:")
        return NextResponse.json(
            { error: "Failed to create analytics record" },
            { status: 500 }
        )
    }
}
