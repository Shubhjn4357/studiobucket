"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  status: "loading" | "authenticated" | "unauthenticated"
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  React.useEffect(() => {
    // Protected routes check
    const isPublicRoute = pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/docs") || pathname.startsWith("/legal")
    
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push("/auth/signin")
    }
    
    if (!isLoading && isAuthenticated && pathname.startsWith("/auth")) {
      router.push("/dashboard")
    }
  }, [isLoading, isAuthenticated, pathname, router])

  return (
    <AuthContext.Provider value={{ status, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
