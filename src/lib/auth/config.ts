import { NextAuthOptions } from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/lib/db"
import { accounts, sessions, users, verificationTokens, channels } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { SubscriptionService } from "@/lib/services/subscription-service"

const subService = new SubscriptionService()

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ account, user }) {
      return true
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.access_token && user.id) {
        try {
          const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`, {
            headers: {
              Authorization: `Bearer ${account.access_token}`
            }
          })
          
          if (!res.ok) return

          const data = await res.json()
          if (data.items?.[0]) {
            const ytChannel = data.items[0]
            
            await db.insert(channels).values({
              id: ytChannel.id,
              channelId: ytChannel.id,
              userId: user.id,
              channelName: ytChannel.snippet.title,
              thumbnailUrl: ytChannel.snippet.thumbnails.default.url,
              subscriberCount: Number(ytChannel.statistics.subscriberCount),
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at ? account.expires_at * 1000 : null,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }).onConflictDoUpdate({
              target: channels.id,
              set: {
                channelName: ytChannel.snippet.title,
                thumbnailUrl: ytChannel.snippet.thumbnails.default.url,
                subscriberCount: Number(ytChannel.statistics.subscriberCount),
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: account.expires_at ? account.expires_at * 1000 : null,
                updatedAt: Date.now()
              }
            })
          }
        } catch (error) {
          console.error("YouTube sync failure during sign-in event:", error)
        }
      }
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}
