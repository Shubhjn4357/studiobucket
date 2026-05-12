"use server"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updatePlanAction(planName: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Unauthorized" }

    // Normalize plan name to match schema defaults (alpha, pro, elite)
    let planId = "alpha"
    if (planName.toLowerCase().includes("pro")) planId = "pro"
    if (planName.toLowerCase().includes("enterprise")) planId = "elite"

    await db.update(users)
      .set({ 
        plan: planId,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id))

    revalidatePath("/dashboard/billing")
    return { success: true }
  } catch (error) {
    console.error("Failed to update plan:", error)
    return { error: "Failed to synchronize subscription state" }
  }
}
