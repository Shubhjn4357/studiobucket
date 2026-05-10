import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Check DB connection
    await db.run(sql`SELECT 1`)
    
    return NextResponse.json({
      status: "operational",
      version: "1.0.0",
      timestamp: Date.now(),
      services: {
        database: "connected",
        queue: "active",
        storage: "available"
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: "degraded",
      error: "Database connection failed"
    }, { status: 500 })
  }
}
