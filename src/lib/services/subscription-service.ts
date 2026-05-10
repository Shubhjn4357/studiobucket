import { db } from "@/lib/db"
import { users, channels, videos } from "@/lib/db/schema"
import { eq, and, gte, count } from "drizzle-orm"
import { stripe } from "@/lib/stripe"

export const PLAN_LIMITS = {
  alpha: {
    maxChannels: 1,
    maxVideosPerMonth: 5,
    features: ["720p Rendering"],
  },
  pro: {
    maxChannels: 5,
    maxVideosPerMonth: Infinity,
    features: ["4K Rendering", "AI Auto-Cut"],
  },
  fleet: {
    maxChannels: Infinity,
    maxVideosPerMonth: Infinity,
    features: ["Priority Queue", "AI Super-Res", "Team Access"],
  },
}

export class SubscriptionService {
  async getUserPlan(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })
    return (user?.plan || "alpha") as keyof typeof PLAN_LIMITS
  }

  async checkChannelLimit(userId: string) {
    const plan = await this.getUserPlan(userId)
    const [channelCount] = await db
      .select({ count: count() })
      .from(channels)
      .where(eq(channels.userId, userId))

    if (channelCount.count >= PLAN_LIMITS[plan].maxChannels) {
      return { 
        allowed: false, 
        message: `Plan limit reached. Your ${plan} plan allows only ${PLAN_LIMITS[plan].maxChannels} channel(s).` 
      }
    }
    return { allowed: true }
  }

  async checkUploadLimit(userId: string) {
    const plan = await this.getUserPlan(userId)
    if (PLAN_LIMITS[plan].maxVideosPerMonth === Infinity) return { allowed: true }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [videoCount] = await db
      .select({ count: count() })
      .from(videos)
      .where(
        and(
          eq(videos.userId, userId),
          gte(videos.createdAt, Math.floor(startOfMonth.getTime() / 1000))
        )
      )

    if (videoCount.count >= PLAN_LIMITS[plan].maxVideosPerMonth) {
      return { 
        allowed: false, 
        message: `Monthly upload limit reached. Your ${plan} plan allows only ${PLAN_LIMITS[plan].maxVideosPerMonth} uploads per month.` 
      }
    }
    return { allowed: true }
  }

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    if (!user) throw new Error("User not found")

    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId || undefined,
      customer_email: user.stripeCustomerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
      metadata: { userId }
    })

    return { url: session.url }
  }

  async createPortalSession(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    if (!user || !user.stripeCustomerId) throw new Error("Customer not found")

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
    })

    return { url: session.url }
  }
}
