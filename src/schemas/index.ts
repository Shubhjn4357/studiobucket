import { z } from "zod"

/**
 * USER SCHEMAS
 */

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string().email(),
  emailVerified: z.date().nullable().optional(),
  image: z.string().nullable().optional(),
  plan: z.string().default("alpha"),
  role: z.string().default("user"),
  stripeCustomerId: z.string().nullable().optional(),
  subscriptionId: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type User = z.infer<typeof UserSchema>

/**
 * CHANNEL SCHEMAS
 */

export const ChannelSchema = z.object({
  id: z.string(),
  userId: z.string(),
  channelName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  customUrl: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  publishedAt: z.number().nullable().optional(),
  accessToken: z.string().nullable().optional(),
  refreshToken: z.string().nullable().optional(),
  expiresAt: z.number().nullable().optional(),
  viewCount: z.number().default(0).nullable(),
  subscriberCount: z.number().default(0).nullable(),
  videoCount: z.number().default(0).nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type Channel = z.infer<typeof ChannelSchema>

/**
 * VIDEO SCHEMAS
 */

export const VideoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  channelId: z.string().nullable(),
  title: z.string().min(1).max(100),
  description: z.string().nullable(),
  tags: z.string().nullable(), // JSON array string
  categoryId: z.string().default("22"),
  defaultLanguage: z.string().default("en"),
  privacyStatus: z.enum(["public", "private", "unlisted"]).default("private"),
  license: z.enum(["youtube", "creativeCommon"]).default("youtube"),
  embeddable: z.boolean().default(true),
  publicStatsViewable: z.boolean().default(true),
  selfDeclaredMadeForKids: z.boolean().default(false),
  containsSyntheticMedia: z.boolean().default(false),
  location: z.string().nullable(),
  recordingDate: z.string().nullable(),
  isShorts: z.boolean().default(false),
  filePath: z.string().nullable(),
  fileSize: z.number().nullable(),
  duration: z.number().nullable(),
  thumbnailPath: z.string().nullable(),
  hlsPath: z.string().nullable(),
  status: z.enum([
    "draft",
    "queued",
    "processing",
    "uploaded",
    "scheduled",
    "published",
    "failed",
  ]).default("draft"),
  youtubeVideoId: z.string().nullable(),
  publishAt: z.number().nullable(),
  uploadedAt: z.number().nullable(),
  publishedAt: z.number().nullable(),
  retryCount: z.number().default(0),
  errorMessage: z.string().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type Video = z.infer<typeof VideoSchema>

export const ScheduleSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  scheduledAt: z.number(),
  timezone: z.string().default("UTC"),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type Schedule = z.infer<typeof ScheduleSchema>

export const CreateVideoSchema = VideoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  youtubeVideoId: true,
  retryCount: true,
  errorMessage: true,
})

export const UpdateVideoSchema = VideoSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * ANALYTICS SCHEMAS
 */

export const AnalyticsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  channelId: z.string().nullable().optional(),
  videoId: z.string().nullable().optional(),
  date: z.string(), // YYYY-MM-DD
  views: z.number().default(0),
  likes: z.number().default(0),
  comments: z.number().default(0),
  shares: z.number().default(0),
  watchTimeMinutes: z.number().default(0),
  subscribersGained: z.number().default(0),
  subscribersLost: z.number().default(0),
  subscribers: z.number().default(0),
  revenue: z.number().default(0),
  engagementRate: z.number().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type Analytics = z.infer<typeof AnalyticsSchema>

/**
 * UPLOAD JOB SCHEMAS
 */

export const UploadJobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  videoId: z.string().nullable().optional(),
  queueName: z.string().default("uploads"),
  jobId: z.string().nullable().optional(),
  status: z.enum(["waiting", "active", "completed", "failed", "delayed"]),
  progress: z.number().min(0).max(100),
  data: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  attempts: z.number().default(0),
  maxAttempts: z.number().default(3),
  priority: z.number().default(0),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type UploadJob = z.infer<typeof UploadJobSchema>

/**
 * SETTINGS SCHEMAS
 */

export const SettingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.string().default("en"),
  timezone: z.string().default("UTC"),
  notifications: z.string().nullable().optional(),
  defaultVideoSettings: z.string().nullable().optional(),
  selectedChannelId: z.string().nullable().optional(),
  updatedAt: z.number(),
})

export type Settings = z.infer<typeof SettingsSchema>

export const DownloadJobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sourceUrl: z.string(),
  sourceType: z.string(),
  outputPath: z.string().nullable().optional(),
  status: z.enum(["pending", "downloading", "completed", "failed"]),
  progress: z.number().default(0),
  fileSize: z.number().nullable().optional(),
  downloadedSize: z.number().nullable().optional(),
  metadata: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  queueJobId: z.string().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export type DownloadJob = z.infer<typeof DownloadJobSchema>

/**
 * API RESPONSE SCHEMAS
 */

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

/**
 * NOTIFICATION SCHEMAS
 */

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(["info", "success", "warning", "error"]),
  isRead: z.boolean(),
  link: z.string().nullable().optional(),
  createdAt: z.number(),
})

export type Notification = z.infer<typeof NotificationSchema>
