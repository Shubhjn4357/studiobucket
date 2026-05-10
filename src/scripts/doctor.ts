import { db } from "../lib/db"
import { redis } from "../lib/redis"
import { execSync } from "child_process"
import * as dotenv from "dotenv"

dotenv.config()

async function runDoctor() {
  console.log("🏥 StudioBucket System Doctor\n")
  let healthy = true

  // 1. Check Env
  console.log("🔍 Checking Environment Variables...")
  const requiredEnv = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "REDIS_URL"
  ]

  for (const env of requiredEnv) {
    if (process.env[env]) {
      console.log(`  ✅ ${env} is set`)
    } else {
      console.log(`  ❌ ${env} is missing!`)
      healthy = false
    }
  }

  // 2. Check Database
  console.log("\n🗄️ Checking Database Connection...")
  try {
    // Simple query to check connection
    await db.query.users.findFirst()
    console.log("  ✅ Database connection successful")
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log("  ✖ Database: Connection failed. Mission Control inactive.")
    console.log(`     Error: ${errorMessage}`)
    healthy = false
  }

  // 3. Check Redis
  console.log("\n🚀 Checking Redis Connection...")
  try {
    if (!redis) {
      throw new Error("Redis is not configured (REDIS_URL is missing)")
    }
    const ping = await redis.ping()
    if (ping === "PONG") {
      console.log("  ✅ Redis connection successful")
    } else {
      throw new Error(`Unexpected ping response: ${ping}`)
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log("  ✖ Redis: Connection failed. Queues will be disabled.")
    console.log(`     Error: ${errorMessage}`)
    // Not strictly fatal for healthy=true if the user wants standalone mode
    // but for "Doctor" purposes, we mark it as an issue
  }

  // 4. Check FFmpeg
  console.log("\n🎬 Checking FFmpeg...")
  try {
    const ffmpegVersion = execSync("ffmpeg -version").toString().split("\n")[0]
    console.log(`  ✅ ${ffmpegVersion}`)
  } catch (error) {
    console.log("  ❌ FFmpeg not found! Please install ffmpeg.")
    healthy = false
  }

  // 5. Check yt-dlp
  console.log("\n📥 Checking yt-dlp...")
  try {
    const ytDlpPath = process.env.YT_DLP_PATH || "yt-dlp"
    const ytDlpVersion = execSync(`${ytDlpPath} --version`).toString().trim()
    console.log(`  ✅ yt-dlp version ${ytDlpVersion}`)
  } catch (error) {
    console.log("  ❌ yt-dlp not found! Please check YT_DLP_PATH in .env or install it.")
    healthy = false
  }

  console.log("\n---")
  if (healthy) {
    console.log("🎉 System is HEALTHY and ready for production!")
  } else {
    console.log("⚠️ System has issues. Please fix the errors above.")
    process.exit(1)
  }
}

runDoctor().catch(err => {
  console.error("Doctor script failed:", err)
  process.exit(1)
})
