"use server"

import { aiService } from "@/lib/services/ai-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getAIMetadataSuggestion(prompt: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  return await aiService.generateMetadata(prompt)
}
