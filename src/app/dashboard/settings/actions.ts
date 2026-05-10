"use server"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateGeneralSettings(data: { name: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.update(users)
    .set({
      name: data.name,
    })
    .where(eq(users.id, session.user.id))

  revalidatePath("/dashboard/settings")
  return { success: true }
}
