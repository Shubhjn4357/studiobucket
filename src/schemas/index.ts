import { z } from "zod"

// User schema
export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean().optional(),
    image: z.string().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type User = z.infer<typeof UserSchema>

// Video schema
export const VideoSchema = z.object({
    id: z.string(),
    userId: z.string(),
    channelId: z.string().optional(),
    title: z.string().min(1).max(100),
    description: z.string().optional(),
    tags: z.string().optional(),
    categoryId: z.string().optional(),
    language: z.string().optional(),
    privacy: z.enum(["public", "private", "unlisted"]).default("private"),
    license: z.enum(["youtube", "creativeCommon"]).optional(),
    location: z.string().optional(),
    recordingDate: z.string().optional(),
    filePath: z.string(),
    fileSize: z.number().optional(),
    duration: z.number().optional(),
    thumbnailPath: z.string().optional(),
    status: z.enum([
        "pending",
        "processing",
        "uploaded",
        "scheduled",
        "published",
        "failed",
    ]),
    youtubeVideoId: z.string().optional(),
    publishAt: z.number().optional(),
    scheduledAt: z.number().optional(),
    uploadedAt: z.number().optional(),
    publishedAt: z.number().optional(),
    retryCount: z.number().default(0),
    errorMessage: z.string().optional(),
    metadata: z.string().optional(),
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
    description: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    subscriberCount: z.number().optional(),
    videoCount: z.number().optional(),
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
    recurrencePattern: z.string().optional(),
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
    revenue: z.number().default(0),
    engagementRate: z.number().optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type Analytics = z.infer<typeof AnalyticsSchema>

// Upload job schema
export const UploadJobSchema = z.object({
    id: z.string(),
    userId: z.string(),
    videoId: z.string().optional(),
    queueName: z.string(),
    jobId: z.string().optional(),
    status: z.enum([
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
    ]),
    progress: z.number().min(0).max(100),
    data: z.string().optional(),
    result: z.string().optional(),
    error: z.string().optional(),
    attempts: z.number(),
    maxAttempts: z.number(),
    priority: z.number(),
    delayUntil: z.number().optional(),
    processedAt: z.number().optional(),
    completedAt: z.number().optional(),
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
