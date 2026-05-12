"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe, PLANS } from "@/lib/stripe"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function createCheckoutSession(planId: keyof typeof PLANS) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.email) {
    throw new Error("Unauthorized")
  }

  // Demo mode redirect
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.STRIPE_SECRET_KEY) {
    return { url: `/dashboard/billing/demo?plan=${planId}` }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) throw new Error("User not found")

  const plan = PLANS[planId]
  if (!plan.priceId) throw new Error("Plan price ID not configured")

  if (!stripe) throw new Error("Stripe is not configured")

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId || undefined,
    customer_email: user.stripeCustomerId ? undefined : session.user.email,
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?canceled=true`,
    metadata: {
      userId: session.user.id,
      planId: planId,
    },
  })

  if (!checkoutSession.url) throw new Error("Failed to create checkout session")

  return { url: checkoutSession.url }
}

export async function completeDemoPurchase(planId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await db.update(users)
    .set({ 
      plan: planId,
      updatedAt: new Date() // Keeping as Date since users table uses timestamp_ms mode
    })
    .where(eq(users.id, session.user.id))

  return { success: true }
}

export async function createPortalSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.STRIPE_SECRET_KEY) {
    return { url: "/dashboard/settings" }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user?.stripeCustomerId) throw new Error("No stripe customer found")

  if (!stripe) throw new Error("Stripe is not configured")

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
  })

  return { url: portalSession.url }
}
