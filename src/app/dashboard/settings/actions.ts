"use server"

import { db } from "@/lib/db"
import { users, teamMembers } from "@/lib/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { SubscriptionService } from "@/lib/services/subscription-service"

const subService = new SubscriptionService()

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

export async function inviteTeamMember(email: string, role: "viewer" | "editor" | "admin" = "editor") {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Find user by email
  const userToInvite = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  if (!userToInvite) throw new Error("User with this email not found")

  await db.insert(teamMembers).values({
    id: crypto.randomUUID(),
    ownerId: session.user.id,
    userId: userToInvite.id,
    role,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function getTeamMembers() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  return await db.query.teamMembers.findMany({
    where: eq(teamMembers.ownerId, session.user.id),
    with: {
      member: true
    }
  })
}

export async function createCheckoutSession(priceId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  return await subService.createCheckoutSession(session.user.id, priceId)
}

export async function createPortalSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  return await subService.createPortalSession(session.user.id)
}
