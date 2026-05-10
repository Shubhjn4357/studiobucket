import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  plan: text("plan").notNull().default("alpha"), // alpha, pro, fleet
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionId: text("subscription_id"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// Accounts table (for OAuth)
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// Sessions table
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// YouTube channels
export const channels = sqliteTable("channels", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelId: text("channel_id").notNull().unique(),
  channelName: text("channel_name").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  subscriberCount: integer("subscriber_count"),
  videoCount: integer("video_count"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: integer("expires_at"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// Videos table
export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelId: text("channel_id").references(() => channels.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  tags: text("tags"), // JSON array
  categoryId: text("category_id"),
  language: text("language"),
  privacy: text("privacy").notNull().default("private"), // public, private, unlisted
  license: text("license").default("youtube"),
  location: text("location"),
  recordingDate: text("recording_date"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  duration: integer("duration"), // in seconds
  thumbnailPath: text("thumbnail_path"),
  status: text("status").notNull().default("pending"), // pending, processing, uploaded, scheduled, published, failed
  youtubeVideoId: text("youtube_video_id"),
  publishAt: integer("publish_at"), // Unix timestamp
  scheduledAt: integer("scheduled_at"),
  uploadedAt: integer("uploaded_at"),
  publishedAt: integer("published_at"),
  retryCount: integer("retry_count").default(0),
  errorMessage: text("error_message"),
  metadata: text("metadata"), // JSON object for additional metadata
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// Video schedules
export const videoSchedules = sqliteTable("video_schedules", {
  id: text("id").primaryKey(),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  scheduledAt: integer("scheduled_at").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  isRecurring: integer("is_recurring", { mode: "boolean" }).notNull().default(false),
  recurrencePattern: text("recurrence_pattern"), // JSON object for recurring patterns
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// Upload jobs
export const uploadJobs = sqliteTable("upload_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: text("video_id").references(() => videos.id, { onDelete: "cascade" }),
  queueName: text("queue_name").notNull(),
  jobId: text("job_id").unique(),
  status: text("status").notNull().default("waiting"), // waiting, active, completed, failed, delayed
  progress: integer("progress").default(0), // 0-100
  data: text("data"), // JSON object for job data
  result: text("result"), // JSON object for job result
  error: text("error"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  priority: integer("priority").default(0),
  delayUntil: integer("delay_until"),
  processedAt: integer("processed_at"),
  completedAt: integer("completed_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// Queue logs
export const queueLogs = sqliteTable("queue_logs", {
  id: text("id").primaryKey(),
  jobId: text("job_id").references(() => uploadJobs.id, { onDelete: "cascade" }),
  level: text("level").notNull(), // info, warn, error, debug
  message: text("message").notNull(),
  data: text("data"), // JSON object for additional log data
  timestamp: integer("timestamp").notNull(),
})

// Download jobs
export const downloadJobs = sqliteTable("download_jobs", {
  id: text("id").primaryKey(),
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
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// User settings
export const userSettings = sqliteTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"), // light, dark, system
  language: text("language").notNull().default("en"),
  timezone: text("timezone").notNull().default("UTC"),
  notifications: text("notifications").notNull(), // JSON object for notification preferences
  uploadSettings: text("upload_settings").notNull(), // JSON object for upload preferences
  scheduleSettings: text("schedule_settings").notNull(), // JSON object for scheduling preferences
  apiSettings: text("api_settings").notNull(), // JSON object for API preferences
  selectedChannelId: text("selected_channel_id").references(() => channels.id),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// Analytics data
export const analytics = sqliteTable("analytics", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  videoId: text("video_id").references(() => videos.id, { onDelete: "cascade" }),
  channelId: text("channel_id").references(() => channels.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  watchTimeMinutes: integer("watch_time_minutes").default(0),
  subscribers: integer("subscribers").default(0),
  revenue: integer("revenue").default(0), // in cents
  engagementRate: integer("engagement_rate"), // in basis points (10000 = 100%)
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("info"), // info, success, warning, error
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
})

// Activity logs
export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // upload, schedule, delete, etc.
  resourceType: text("resource_type").notNull(), // video, channel, etc.
  resourceId: text("resource_id").notNull(),
  details: text("details"), // JSON object for additional details
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: integer("timestamp").notNull(),
})

// Team members table
export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("editor"), // viewer, editor, admin
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  channels: many(channels),
  videos: many(videos),
  uploadJobs: many(uploadJobs),
  downloadJobs: many(downloadJobs),
  userSettings: many(userSettings),
  analytics: many(analytics),
  activityLogs: many(activityLogs),
  notifications: many(notifications),
  ownedTeams: many(teamMembers, { relationName: "owner" }),
  teamMemberships: many(teamMembers, { relationName: "member" }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const channelsRelations = relations(channels, ({ one, many }) => ({
  user: one(users, {
    fields: [channels.userId],
    references: [users.id],
  }),
  videos: many(videos),
  analytics: many(analytics),
}))

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  channel: one(channels, {
    fields: [videos.channelId],
    references: [channels.id],
  }),
  videoSchedules: many(videoSchedules),
  uploadJobs: many(uploadJobs),
  analytics: many(analytics),
}))

export const videoSchedulesRelations = relations(videoSchedules, ({ one }) => ({
  video: one(videos, {
    fields: [videoSchedules.videoId],
    references: [videos.id],
  }),
}))

export const uploadJobsRelations = relations(uploadJobs, ({ one, many }) => ({
  user: one(users, {
    fields: [uploadJobs.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [uploadJobs.videoId],
    references: [videos.id],
  }),
  queueLogs: many(queueLogs),
  downloadJobs: many(downloadJobs),
}))

export const queueLogsRelations = relations(queueLogs, ({ one }) => ({
  uploadJob: one(uploadJobs, {
    fields: [queueLogs.jobId],
    references: [uploadJobs.id],
  }),
}))

export const downloadJobsRelations = relations(downloadJobs, ({ one }) => ({
  user: one(users, {
    fields: [downloadJobs.userId],
    references: [users.id],
  }),
  queueJob: one(uploadJobs, {
    fields: [downloadJobs.queueJobId],
    references: [uploadJobs.id],
  }),
}))

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}))

export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, {
    fields: [analytics.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [analytics.videoId],
    references: [videos.id],
  }),
  channel: one(channels, {
    fields: [analytics.channelId],
    references: [channels.id],
  }),
}))

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
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
