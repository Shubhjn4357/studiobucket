"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { AuthProvider } from "./auth-provider"
import { GlobalServiceProvider } from "./service-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <GlobalServiceProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </NextThemesProvider>
        </GlobalServiceProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
