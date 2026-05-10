import { Hero3D } from "@/components/landing/hero-3d"
import { FeatureGrid } from "@/components/landing/feature-grid"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/dashboard/footer"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Icons } from "@/components/ui/icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Minimal Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 px-4 md:px-8 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Icons.logo className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-black text-white uppercase tracking-tighter italic">StudioBucket</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
              Features
            </Link>
            <Link href="/dashboard/studio" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
              Studio
            </Link>
          </div>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <ThemeToggle />
          <Link href="/auth/signin" className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors hidden md:block">
            Sign In
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-white text-black hover:bg-slate-200 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest h-10">
              Access Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <section id="hero">
        <Hero3D />
      </section>
      <section id="features">
        <FeatureGrid />
      </section>
      <CTA />
      <Footer />
    </main>
  )
}
