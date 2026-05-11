import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { userSettings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { logger } from "@/lib/logger"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const settings = await db
            .select()
            .from(userSettings)
            .where(eq(userSettings.userId, session.user.id))
            .limit(1)

        if (!settings.length) {
            // Return default settings if not found
            return NextResponse.json({
                success: true,
                data: {
                    theme: "system",
                    language: "en",
                    timezone: "UTC",
                    notifications: {},
                    uploadSettings: {},
                    scheduleSettings: {},
                    apiSettings: {},
                },
            })
        }

        logger.info(`Settings retrieved for user ${session.user.id}`)

        return NextResponse.json({
            success: true,
            data: {
                ...settings[0],
                notifications: settings[0].notifications
                    ? JSON.parse(settings[0].notifications)
                    : {},
                uploadSettings: settings[0].uploadSettings
                    ? JSON.parse(settings[0].uploadSettings)
                    : {},
                scheduleSettings: settings[0].scheduleSettings
                    ? JSON.parse(settings[0].scheduleSettings)
                    : {},
                apiSettings: settings[0].apiSettings
                    ? JSON.parse(settings[0].apiSettings)
                    : {},
            },
        })
    } catch (error) {
        logger.error(error, "Get settings error:")
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
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
            theme,
            language,
            timezone,
            notifications,
            uploadSettings,
            scheduleSettings,
            apiSettings,
        } = body

        const now = Math.floor(Date.now() / 1000)

        const existingSettings = await db
            .select()
            .from(userSettings)
            .where(eq(userSettings.userId, session.user.id))
            .limit(1)

        let result

        if (existingSettings.length) {
            result = await db
                .update(userSettings)
                .set({
                    theme: theme,
                    language: language,
                    timezone: timezone,
                    notifications: notifications
                        ? JSON.stringify(notifications)
                        : existingSettings[0].notifications,
                    uploadSettings: uploadSettings
                        ? JSON.stringify(uploadSettings)
                        : existingSettings[0].uploadSettings,
                    scheduleSettings: scheduleSettings
                        ? JSON.stringify(scheduleSettings)
                        : existingSettings[0].scheduleSettings,
                    apiSettings: apiSettings
                        ? JSON.stringify(apiSettings)
                        : existingSettings[0].apiSettings,
                    updatedAt: Date.now(),
                })
                .where(eq(userSettings.userId, session.user.id))
                .returning()
        } else {
            result = await db
                .insert(userSettings)
                .values({
                    userId: session.user.id,
                    theme: theme || "system",
                    language: language || "en",
                    timezone: timezone || "UTC",
                    notifications: notifications ? JSON.stringify(notifications) : "{}",
                    uploadSettings: uploadSettings ? JSON.stringify(uploadSettings) : "{}",
                    scheduleSettings: scheduleSettings
                        ? JSON.stringify(scheduleSettings)
                        : "{}",
                    apiSettings: apiSettings ? JSON.stringify(apiSettings) : "{}",
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                })
                .returning()
        }

        logger.info(`Settings updated for user ${session.user.id}`)

        return NextResponse.json({
            success: true,
            data: result[0],
        })
    } catch (error) {
        logger.error(error, "Update settings error:")
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        )
    }
}
