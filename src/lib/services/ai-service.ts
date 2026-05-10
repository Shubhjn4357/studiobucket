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
      logger.warn("AI_API_KEY not set. Returning mock AI suggestion.")
      return this.getMockSuggestion(prompt)
    }

    try {
      // Example call to an OpenAI-compatible API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert YouTube strategist. Generate high-engagement metadata based on the provided video description or prompt. Return ONLY JSON with fields: title, description, tags (array), suggestedSchedule (ISO string).",
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
      const suggestion = JSON.parse(data.choices[0].message.content)
      return suggestion
    } catch (error) {
      logger.error(error, "AI Generation failed:")
      return this.getMockSuggestion(prompt)
    }
  }

  private getMockSuggestion(prompt: string): AISuggestion {
    return {
      title: `${prompt.substring(0, 30)}... | Ultimate Guide 2026`,
      description: `In this video, we explore ${prompt}. \n\n🚀 Subscribe for more automation content!\n\n#Automation #YouTube #StudioBucket`,
      tags: ["automation", "content creation", "ai", "productivity"],
      suggestedSchedule: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  }
}

export const aiService = new AIService()
