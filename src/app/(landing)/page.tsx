"use client"

import { Hero3D } from "@/components/landing/hero-3d"
import { FeatureGrid } from "@/components/landing/feature-grid"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/dashboard/footer"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Icons } from "@/components/ui/icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton-loader"

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <main className="min-h-screen bg-background">
      {/* Dynamic Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-8 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Icons.logo className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">StudioBucket</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              API
            </Link>
          </div>
          <ThemeToggle />
          <div className="h-6 w-px bg-border hidden md:block" />
          
          {isLoading ? (
            <Skeleton className="h-9 w-24 rounded-full" />
          ) : isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="sm" className="rounded-full bg-primary text-white hover:bg-primary/90 px-6">
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="rounded-full text-sm font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="sm" className="rounded-full bg-foreground text-background hover:opacity-90 px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <section id="hero" className="relative pt-16">
        <Suspense fallback={<div className="h-screen w-full bg-background flex items-center justify-center"><Skeleton className="h-3/4 w-3/4 rounded-3xl" /></div>}>
          <Hero3D />
        </Suspense>
      </section>

      <section id="features" className="py-24">
        <FeatureGrid />
      </section>

      <CTA />
      <Footer />
    </main>
  )
}
