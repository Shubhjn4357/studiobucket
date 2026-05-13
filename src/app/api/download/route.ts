import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { addDownloadJob } from "@/lib/queue"
import { db } from "@/lib/db"
import { downloadJobs } from "@/lib/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

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
        const { sourceUrl, sourceType, outputPath } = body

        if (!sourceUrl || !sourceType) {
            return NextResponse.json(
                { error: "sourceUrl and sourceType are required" },
                { status: 400 }
            )
        }

        const downloadJobId = randomUUID()

        logger.info(
            `Download initiated: ${downloadJobId} for user ${session.user.id}`
        )

        // Handle Playlist Expansion
        if (sourceType === "playlist") {
            const { exec } = await import("child_process")
            const { promisify } = await import("util")
            const execAsync = promisify(exec)
            
            try {
                const ytDlpPath = process.env.YT_DLP_PATH || "yt-dlp"
      const { stdout } = await execAsync(`"${ytDlpPath}" --flat-playlist --get-id "${sourceUrl}"`)
                const videoIds = stdout.trim().split("\n").filter(id => id.length > 0)
                
                const results = []
                for (const id of videoIds) {
                    const videoUrl = `https://www.youtube.com/watch?v=${id}`
                    const [newJob] = await db.insert(downloadJobs).values({
                        id: crypto.randomUUID(),
                        userId: session.user.id,
                        sourceUrl: videoUrl,
                        sourceType: "video",
                        status: "pending",
                        progress: 0,
                    }).returning()
                    
                    await addDownloadJob({
                        downloadJobId: newJob.id,
                        userId: session.user.id,
                        sourceUrl: videoUrl,
                        sourceType: "video",
                    })
                    results.push(newJob)
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        count: results.length,
                        jobs: results
                    }
                }, { status: 201 })

            } catch (err) {
                logger.error(err, "Playlist expansion failed")
                return NextResponse.json({ error: "Failed to expand playlist" }, { status: 500 })
            }
        }

        logger.info(`Starting download: ${sourceUrl}`)

        // Single video download
        const [newDownloadJob] = await db
            .insert(downloadJobs)
            .values({
                id: downloadJobId,
                userId: session.user.id,
                sourceUrl: sourceUrl,
                sourceType: sourceType,
                outputPath: outputPath,
                status: "pending",
                progress: 0,
            })
            .returning()

        const queueJob = await addDownloadJob({
            downloadJobId: newDownloadJob.id,
            userId: session.user.id,
            sourceUrl: sourceUrl,
            sourceType: sourceType as "video" | "playlist" | "channel",
            outputPath: outputPath,
        })

        if (queueJob) {
            logger.info(`Download job queued: ${queueJob.id}`)
        } else {
            logger.warn("Download job created in DB but queue is unavailable.")
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    downloadJob: newDownloadJob,
                    queueJobId: queueJob?.id || null,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        logger.error(error, "Download error:")
        return NextResponse.json(
            { error: "Failed to start download" },
            { status: 500 }
        )
    }
}

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
        const status = searchParams.get("status")
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

        const conditions = [eq(downloadJobs.userId, session.user.id)]
        if (status) {
            conditions.push(eq(downloadJobs.status, status))
        }

        const jobs = await db
            .select()
            .from(downloadJobs)
            .where(and(...conditions))
            .limit(limit)
            .orderBy(desc(downloadJobs.createdAt))

        logger.info(
            `Retrieved ${jobs.length} download jobs for user ${session.user.id}`
        )

        return NextResponse.json({
            success: true,
            data: jobs,
        })
    } catch (error) {
        logger.error(error, "Get download jobs error:")
        return NextResponse.json(
            { error: "Failed to fetch download jobs" },
            { status: 500 }
        )
    }
}
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 })
        }

        // 1. Get job from DB to check ownership
        const job = await db.query.downloadJobs.findFirst({
            where: and(
                eq(downloadJobs.id, id),
                eq(downloadJobs.userId, session.user.id)
            )
        })

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 })
        }

        // 2. Remove from database
        await db.delete(downloadJobs).where(eq(downloadJobs.id, id))

        logger.info(`Download job deleted: ${id} by user ${session.user.id}`)

        return NextResponse.json({
            success: true,
            message: "Job removed successfully"
        })
    } catch (error) {
        logger.error(error, "Delete download job error:")
        return NextResponse.json(
            { error: "Failed to delete download job" },
            { status: 500 }
        )
    }
}
