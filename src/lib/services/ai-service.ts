import { logger } from "@/lib/logger"

export interface AISuggestion {
  title: string
  description: string
  tags: string[]
  suggestedSchedule?: string
}

export class AIService {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.AI_API_KEY
  }

  async generateMetadata(prompt: string): Promise<AISuggestion> {
    if (!this.apiKey) {
      throw new Error("AI Operational Protocol Failure: API Key missing in environment.")
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Generate high-engagement YouTube metadata. Return ONLY JSON: {title, description, tags, suggestedSchedule}.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        }),
      })

      const data = await response.json()
      return JSON.parse(data.choices[0].message.content)
    } catch (error) {
      logger.error(error, "AI Generation failed:")
      throw error
    }
  }
}

export const aiService = new AIService()
