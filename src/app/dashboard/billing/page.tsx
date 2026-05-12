import { BillingClient } from "./billing-client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function BillingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id)
  })

  return <BillingClient currentPlan={user?.plan || "alpha"} />
}
