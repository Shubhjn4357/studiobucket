import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

/**
 * AUTHENTICATION TABLES (Auth.js / NextAuth Standard)
 */

export const users = sqliteTable("users", {
  id: text("id").notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  // App-specific fields
  plan: text("plan").notNull().default("alpha"), // alpha, pro, elite
  role: text("role").notNull().default("user"), // user, admin
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionId: text("subscription_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
})

export const accounts = sqliteTable("accounts", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}))

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
})

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}))

/**
 * YOUTUBE CORE TABLES
 */

export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(), // YouTube Channel ID (UC...)
  channelId: text("channel_id").notNull().unique(), // YouTube channel ID
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelName: text("channel_name"),
  description: text("description"),
  customUrl: text("custom_url"),
  thumbnailUrl: text("thumbnail_url"),
  publishedAt: integer("published_at"),
  
  // YouTube Auth & Stats
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: integer("expires_at"),
  subscriberCount: integer("subscriber_count").default(0),
  viewCount: integer("view_count").default(0),
  videoCount: integer("video_count").default(0),
  
  // App Logic
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
})

export const videos = sqliteTable("videos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelId: text("channel_id").references(() => channels.id, { onDelete: "set null" }),
  
  // Snippet
  title: text("title").notNull(),
  description: text("description"),
  tags: text("tags"), // JSON array string
  categoryId: text("category_id").default("22"), // Default: People & Blogs
  defaultLanguage: text("default_language").default("en"),
  
  // Status & Settings
  privacyStatus: text("privacy_status").notNull().default("private"), // public, private, unlisted
  license: text("license").default("youtube"), // youtube, creativeCommon
  embeddable: integer("embeddable", { mode: "boolean" }).default(true),
  publicStatsViewable: integer("public_stats_viewable", { mode: "boolean" }).default(true),
  selfDeclaredMadeForKids: integer("made_for_kids", { mode: "boolean" }).default(false),
  containsSyntheticMedia: integer("contains_synthetic_media", { mode: "boolean" }).default(false), // 2026 AI requirement
  location: text("location"), // Adding back for precision
  recordingDate: text("recording_date"),
  
  // File & Content
  isShorts: integer("is_shorts", { mode: "boolean" }).default(false),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  duration: integer("duration"), // in seconds
  thumbnailPath: text("thumbnail_path"),
  hlsPath: text("hls_path"),
  
  // Tracking
  status: text("status").notNull().default("draft"), // draft, queued, processing, uploaded, scheduled, published, failed
  youtubeVideoId: text("youtube_video_id"),
  publishAt: integer("publish_at"), // Scheduled time
  uploadedAt: integer("uploaded_at"),
  publishedAt: integer("published_at"), // Actual time
  
  // Error handling
  retryCount: integer("retry_count").default(0),
  errorMessage: text("error_message"),
  metadata: text("metadata"), // JSON object for internal extra data
  
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
})

/**
 * PLANNING & SCHEDULING
 */

export const videoSchedules = sqliteTable("video_schedules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  scheduledAt: integer("scheduled_at").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  isRecurring: integer("is_recurring", { mode: "boolean" }).notNull().default(false),
  recurrencePattern: text("recurrence_pattern"), // JSON object
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
})

/**
 * AUTOMATION & PIPELINE (BullMQ Integration)
 */

export const uploadJobs = sqliteTable("upload_jobs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: text("video_id").references(() => videos.id, { onDelete: "cascade" }),
  queueName: text("queue_name").notNull().default("uploads"),
  jobId: text("job_id").unique(), // BullMQ Job ID
  status: text("status").notNull().default("waiting"), // waiting, active, completed, failed, delayed
  progress: integer("progress").default(0),
  data: text("data"), // Input JSON
  result: text("result"), // Output JSON
  error: text("error"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  priority: integer("priority").default(0),
  processedAt: integer("processed_at"),
  completedAt: integer("completed_at"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
})

export const queueLogs = sqliteTable("queue_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id").references(() => uploadJobs.id, { onDelete: "cascade" }),
  level: text("level").notNull(), // info, warn, error, debug
  message: text("message").notNull(),
  data: text("data"), // JSON data
  timestamp: integer("timestamp").notNull().$defaultFn(() => Date.now()),
})

/**
 * DOWNLOAD JOBS
 */

export const downloadJobs = sqliteTable("download_jobs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceUrl: text("source_url").notNull(),
  sourceType: text("source_type").notNull(), // video, playlist, channel
  outputPath: text("output_path"),
  status: text("status").notNull().default("pending"), // pending, downloading, completed, failed
  progress: integer("progress").default(0),
  fileSize: integer("file_size"),
  downloadedSize: integer("downloaded_size"),
  metadata: text("metadata"), // JSON object for video metadata
  errorMessage: text("error_message"),
  queueJobId: text("queue_job_id").references(() => uploadJobs.id),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
})

/**
 * ANALYTICS & LOGGING
 */

export const analytics = sqliteTable("analytics", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelId: text("channel_id").references(() => channels.id, { onDelete: "cascade" }),
  videoId: text("video_id").references(() => videos.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  
  // Metrics
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  watchTimeMinutes: integer("watch_time_minutes").default(0),
  subscribersGained: integer("subscribers_gained").default(0),
  subscribersLost: integer("subscribers_lost").default(0),
  subscribers: integer("subscribers").default(0), // Total for the day
  revenue: integer("revenue").default(0), // in cents
  engagementRate: integer("engagement_rate"), // in basis points
  
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
})

export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // login, upload_started, video_published, etc.
  resourceType: text("resource_type").notNull(), // user, video, channel, job
  resourceId: text("resource_id"),
  details: text("details"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
})

/**
 * USER PREFERENCES & NOTIFICATIONS
 */

export const userSettings = sqliteTable("user_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"),
  language: text("language").notNull().default("en"),
  timezone: text("timezone").notNull().default("UTC"),
  
  notifications: text("notifications").notNull().default("{}"),
  uploadSettings: text("upload_settings").notNull().default("{}"),
  scheduleSettings: text("schedule_settings").notNull().default("{}"),
  apiSettings: text("api_settings").notNull().default("{}"),
  selectedChannelId: text("selected_channel_id").references(() => channels.id),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
})

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] }),
  selectedChannel: one(channels, { fields: [userSettings.selectedChannelId], references: [channels.id] }),
}))

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  link: text("link"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
})

/**
 * TEAM & COLLABORATION
 */

export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("editor"), // viewer, editor, admin
  createdAt: integer("created_at").notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Date.now()),
})

/**
 * RELATIONS
 */

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  channels: many(channels),
  videos: many(videos),
  uploadJobs: many(uploadJobs),
  analytics: many(analytics),
  activityLogs: many(activityLogs),
  notifications: many(notifications),
  downloadJobs: many(downloadJobs),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  ownedTeams: many(teamMembers, { relationName: "owner" }),
  teamMemberships: many(teamMembers, { relationName: "member" }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const channelsRelations = relations(channels, ({ one, many }) => ({
  user: one(users, { fields: [channels.userId], references: [users.id] }),
  videos: many(videos),
  analytics: many(analytics),
}))

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, { fields: [videos.userId], references: [users.id] }),
  channel: one(channels, { fields: [videos.channelId], references: [channels.id] }),
  schedules: many(videoSchedules),
  jobs: many(uploadJobs),
  analytics: many(analytics),
}))

export const videoSchedulesRelations = relations(videoSchedules, ({ one }) => ({
  video: one(videos, { fields: [videoSchedules.videoId], references: [videos.id] }),
}))

export const uploadJobsRelations = relations(uploadJobs, ({ one, many }) => ({
  user: one(users, { fields: [uploadJobs.userId], references: [users.id] }),
  video: one(videos, { fields: [uploadJobs.videoId], references: [videos.id] }),
  logs: many(queueLogs),
}))

export const queueLogsRelations = relations(queueLogs, ({ one }) => ({
  job: one(uploadJobs, { fields: [queueLogs.jobId], references: [uploadJobs.id] }),
}))

export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, { fields: [analytics.userId], references: [users.id] }),
  channel: one(channels, { fields: [analytics.channelId], references: [channels.id] }),
  video: one(videos, { fields: [analytics.videoId], references: [videos.id] }),
}))

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  owner: one(users, {
    fields: [teamMembers.ownerId],
    references: [users.id],
    relationName: "owner",
  }),
  member: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
    relationName: "member",
  }),
}))

export const downloadJobsRelations = relations(downloadJobs, ({ one }) => ({
  user: one(users, { fields: [downloadJobs.userId], references: [users.id] }),
  uploadJob: one(uploadJobs, { fields: [downloadJobs.queueJobId], references: [uploadJobs.id] }),
}))
