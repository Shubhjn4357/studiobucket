import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { db } from "@/lib/db"
import Redis from "ioredis"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        logger.info("Health check initiated")

        // Check database connection
        let dbOk = false
        try {
            const result = await db.query.users.findFirst()
            dbOk = true
            logger.info("Database connection: OK")
        } catch (error) {
            logger.error(error, "Database connection: FAILED")
        }

        // Check Redis connection
        let redisOk = false
        try {
            const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")
            await redis.ping()
            redisOk = true
            logger.info("Redis connection: OK")
            await redis.quit()
        } catch (error) {
            logger.error(error, "Redis connection: FAILED")
        }

        const healthy = dbOk && redisOk

        return NextResponse.json(
            {
                status: healthy ? "healthy" : "degraded",
                timestamp: new Date().toISOString(),
                checks: {
                    database: dbOk ? "ok" : "failed",
                    redis: redisOk ? "ok" : "failed",
                },
            },
            { status: healthy ? 200 : 503 }
        )
    } catch (error) {
        logger.error(error, "Health check failed:")
        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                error: "Internal server error",
            },
            { status: 500 }
        )
    }
}
