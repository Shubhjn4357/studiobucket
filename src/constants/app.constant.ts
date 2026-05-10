export const APP_CONFIG = {
  name: "StudioBucket",
  description: "YouTube Automation SaaS Platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  version: "1.0.0",
} as const

export const API_ENDPOINTS = {
  videos: "/api/videos",
  upload: "/api/upload",
  schedule: "/api/schedule",
  queue: "/api/queue",
  analytics: "/api/analytics",
  settings: "/api/settings",
  auth: "/api/auth",
  download: "/api/download",
  health: "/api/health",
} as const

export const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube",
  "openid",
  "email",
  "profile",
] as const

export const QUEUE_NAMES = {
  upload: "upload-queue",
  publish: "publish-queue",
  retry: "retry-queue",
  analytics: "analytics-queue",
  cleanup: "cleanup-queue",
  download: "download-queue",
  metadata: "metadata-queue",
  thumbnail: "thumbnail-queue",
  compression: "compression-queue",
} as const

export const VIDEO_STATUS = {
  pending: "pending",
  uploading: "uploading",
  uploaded: "uploaded",
  scheduled: "scheduled",
  published: "published",
  failed: "failed",
  processing: "processing",
} as const

export const VIDEO_TYPES = {
  short: "short",
  regular: "regular",
  audio: "audio",
} as const

export const QUEUE_STATUS = {
  waiting: "waiting",
  active: "active",
  completed: "completed",
  failed: "failed",
  delayed: "delayed",
} as const
