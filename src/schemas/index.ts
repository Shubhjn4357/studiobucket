import { z } from "zod"

// User schema
export const UserSchema = z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    email: z.string().email(),
    emailVerified: z.date().nullable().optional(),
    image: z.string().nullable().optional(),
    plan: z.string().default("alpha"),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type User = z.infer<typeof UserSchema>

// Video schema
export const VideoSchema = z.object({
    id: z.string(),
    userId: z.string(),
    channelId: z.string().nullable().optional(),
    title: z.string().min(1).max(100),
    description: z.string().nullable().optional(),
    tags: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    language: z.string().nullable().optional(),
    privacy: z.enum(["public", "private", "unlisted"]).default("private"),
    license: z.enum(["youtube", "creativeCommon"]).nullable().optional(),
    location: z.string().nullable().optional(),
    recordingDate: z.string().nullable().optional(),
    filePath: z.string().nullable(),
    fileSize: z.number().nullable().optional(),
    duration: z.number().nullable().optional(),
    thumbnailPath: z.string().nullable().optional(),
    status: z.enum([
        "pending",
        "processing",
        "uploaded",
        "scheduled",
        "published",
        "failed",
    ]),
    youtubeVideoId: z.string().nullable().optional(),
    publishAt: z.number().nullable().optional(),
    scheduledAt: z.number().nullable().optional(),
    uploadedAt: z.number().nullable().optional(),
    publishedAt: z.number().nullable().optional(),
    retryCount: z.number().nullable().default(0),
    errorMessage: z.string().nullable().optional(),
    metadata: z.string().nullable().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type Video = z.infer<typeof VideoSchema>

export const CreateVideoSchema = VideoSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true,
    uploadedAt: true,
    publishedAt: true,
})

export const UpdateVideoSchema = VideoSchema.partial().omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
})

// Channel schema
export const ChannelSchema = z.object({
    id: z.string(),
    userId: z.string(),
    channelId: z.string(),
    channelName: z.string(),
    description: z.string().nullable().optional(),
    thumbnailUrl: z.string().nullable().optional(),
    subscriberCount: z.number().nullable().optional(),
    videoCount: z.number().nullable().optional(),
    isActive: z.boolean().default(true),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type Channel = z.infer<typeof ChannelSchema>

// Schedule schema
export const ScheduleSchema = z.object({
    id: z.string(),
    videoId: z.string(),
    scheduledAt: z.number(),
    timezone: z.string().default("UTC"),
    isRecurring: z.boolean().default(false),
    recurrencePattern: z.string().nullable().optional(),
    isActive: z.boolean().default(true),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type Schedule = z.infer<typeof ScheduleSchema>

// Analytics schema
export const AnalyticsSchema = z.object({
    id: z.string(),
    userId: z.string(),
    videoId: z.string().optional(),
    channelId: z.string().optional(),
    date: z.string(),
    views: z.number().default(0),
    likes: z.number().default(0),
    comments: z.number().default(0),
    shares: z.number().default(0),
    watchTimeMinutes: z.number().default(0),
    subscribers: z.number().default(0),
    revenue: z.number().nullable().default(0),
    engagementRate: z.number().nullable().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type Analytics = z.infer<typeof AnalyticsSchema>

// Upload job schema
export const UploadJobSchema = z.object({
    id: z.string(),
    userId: z.string(),
    videoId: z.string().nullable().optional(),
    queueName: z.string(),
    jobId: z.string().nullable().optional(),
    status: z.enum([
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
    ]),
    progress: z.number().min(0).max(100),
    data: z.string().nullable().optional(),
    result: z.string().nullable().optional(),
    error: z.string().nullable().optional(),
    attempts: z.number(),
    maxAttempts: z.number(),
    priority: z.number(),
    delayUntil: z.number().nullable().optional(),
    processedAt: z.number().nullable().optional(),
    completedAt: z.number().nullable().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type UploadJob = z.infer<typeof UploadJobSchema>

// Settings schema
export const SettingsSchema = z.object({
    id: z.string(),
    userId: z.string(),
    theme: z.enum(["light", "dark", "system"]).default("system"),
    language: z.string().default("en"),
    timezone: z.string().default("UTC"),
    notifications: z.string(),
    uploadSettings: z.string(),
    scheduleSettings: z.string(),
    apiSettings: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type Settings = z.infer<typeof SettingsSchema>

// API Response schemas
export const ApiResponseSchema = z.object({
    success: z.boolean(),
    data: z.unknown().optional(),
    error: z.string().optional(),
    message: z.string().optional(),
})

export const PaginatedResponseSchema = z.object({
    success: z.boolean(),
    data: z.array(z.unknown()),
    pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        pages: z.number(),
    }),
})

export const NotificationSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.enum(["info", "success", "warning", "error"]),
    isRead: z.boolean(),
    createdAt: z.number(),
})

export type Notification = z.infer<typeof NotificationSchema>
