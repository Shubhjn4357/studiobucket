export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  
  // YouTube API
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  
  // yt-dlp
  YT_DLP_PATH: process.env.YT_DLP_PATH || "yt-dlp",
  
  // File uploads
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  
  // App
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
} as const

export type Env = typeof env
