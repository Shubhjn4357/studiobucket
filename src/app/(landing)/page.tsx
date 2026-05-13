"use client"

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { 
  IconArrowRight,
  IconCircleFilled,
  IconActivity,
  IconVideo,
  IconCloud,
  IconLock
} from "@tabler/icons-react"

const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), {
  ssr: false,
})

const features = [
  {
    title: "Professional Editor",
    description: "Intuitive multi-track editing with real-time preview and precision controls.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-primary/10 border border-primary/20 relative overflow-hidden flex items-center justify-center">
        <Icons.video className="h-12 w-12 text-primary/30" />
    </div>,
    icon: <IconVideo className="h-4 w-4 text-primary" />,
  },
  {
    title: "Real-time Insights",
    description: "Track your video performance with beautiful, easy-to-understand analytics.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-blue-500/10 border border-blue-500/20 relative overflow-hidden flex items-center justify-center">
        <Icons.barChart className="h-12 w-12 text-blue-500/30" />
    </div>,
    icon: <IconActivity className="h-4 w-4 text-blue-500" />,
  },
  {
    title: "Smart Cloud Sync",
    description: "Your projects are automatically synced and accessible from anywhere.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-purple-500/10 border border-purple-500/20 relative overflow-hidden flex items-center justify-center">
        <Icons.cloud className="h-12 w-12 text-purple-500/30" />
    </div>,
    icon: <IconCloud className="h-4 w-4 text-purple-500" />,
  },
  {
    title: "Secure & Private",
    description: "Your data is encrypted and private. You have full control over your content.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden flex items-center justify-center">
        <Icons.lock className="h-12 w-12 text-emerald-500/30" />
    </div>,
    icon: <IconLock className="h-4 w-4 text-emerald-500" />,
  },
]

const globeConfig = {
  pointSize: 2,
  globeColor: "#050505",
  showAtmosphere: true,
  atmosphereColor: "#3b82f6",
  atmosphereAltitude: 0.15,
  emissive: "#000000",
  emissiveIntensity: 0.1,
  shininess: 0.5,
  polygonColor: "rgba(59,130,246,0.05)",
  ambientLight: "#ffffff",
  directionalLeftLight: "#3b82f6",
  directionalTopLight: "#ffffff",
  pointLight: "#3b82f6",
  arcTime: 2000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 2,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.3,
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 px-6 md:px-10 flex items-center justify-between border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 md:h-11 md:w-11 bg-primary flex items-center justify-center rounded-xl md:rounded-2xl shadow-lg shadow-primary/20">
            <Icons.logo className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
          </div>
          <span className="text-base md:text-xl font-black tracking-tight text-foreground uppercase italic">StudioBucket</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <nav className="hidden lg:flex items-center gap-6 pr-6 border-r border-border h-6">
            <Link href="/docs" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Documentation</Link>
            <Link href="/status" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">System Status</Link>
          </nav>
          <Link href="/auth/signin">
            <Button size="sm" className="font-bold rounded-xl md:rounded-2xl px-4 md:px-6 h-9 md:h-11 bg-foreground text-background hover:bg-foreground/90 transition-all text-xs md:text-sm">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 md:pt-32 overflow-hidden">
         <div className="absolute inset-0 z-0">
            <World data={[]} globeConfig={globeConfig} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.02)_0%,transparent_70%)]" />
         </div>

         <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 md:space-y-12">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 shadow-inner"
            >
               <IconCircleFilled className="h-2 w-2 text-primary animate-pulse" />
               <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary">Public Beta is Online</span>
            </motion.div>

            <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] text-foreground uppercase italic">
               Video <br />
               <span className="text-primary not-italic">Automation.</span>
            </h1>

            <p className="text-muted-foreground text-sm md:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-4">
               The professional suite for high-fidelity content pipelines. Ingest, transcode, and synchronize your video assets with real-time analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 md:pt-10">
               <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 md:h-20 rounded-2xl md:rounded-3xl bg-primary text-primary-foreground hover:bg-primary/90 px-8 md:px-12 font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-[1.05] active:scale-95 text-xs md:text-base">
                     Launch Dashboard
                     <IconArrowRight className="ml-3 h-5 w-5 md:h-6 md:w-6" />
                  </Button>
               </Link>
               <Link href="/docs" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 md:h-20 rounded-2xl md:rounded-3xl border-border bg-card/50 backdrop-blur-sm hover:bg-muted px-8 md:px-12 font-black uppercase tracking-widest transition-all text-xs md:text-base">
                     View Registry
                  </Button>
               </Link>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 md:py-48 px-6 relative bg-card/30 border-y border-border">
         <div className="max-w-6xl mx-auto space-y-16 md:space-y-24 relative z-10">
            <div className="text-center space-y-4 md:space-y-6 px-4">
               <h2 className="text-[9px] md:text-[11px] font-black text-primary uppercase tracking-[0.4em]">Core Capabilities</h2>
               <h3 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground uppercase italic leading-tight">Engineered for growth.</h3>
            </div>
            <BentoGrid className="max-w-5xl mx-auto gap-4 md:gap-8">
               {features.map((feature, i) => (
                  <BentoGridItem
                     key={i}
                     title={feature.title}
                     description={feature.description}
                     header={feature.header}
                     icon={feature.icon}
                     className={cn(
                        "rounded-[2rem] md:rounded-[3rem] border-border bg-card p-6 md:p-10 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 group",
                        i === 0 || i === 3 ? "md:col-span-2" : ""
                     )}
                  />
               ))}
            </BentoGrid>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 md:py-40 px-6 md:px-12 bg-background relative z-10 border-t border-border overflow-hidden">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-32">
            <div className="space-y-6 md:space-y-10 max-w-md">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-2xl shadow-2xl shadow-primary/20">
                     <Icons.logo className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xl md:text-3xl font-black tracking-tighter text-foreground uppercase italic">StudioBucket</span>
               </div>
               <p className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed">
                  Mission-critical video automation and management for professional creators and enterprises worldwide.
               </p>
            </div>
            
            <div className="grid grid-cols-2 gap-12 md:gap-32 w-full lg:w-auto">
               <div className="space-y-6 md:space-y-8">
                  <h4 className="text-[10px] md:text-[11px] font-black text-foreground uppercase tracking-widest opacity-60">Platform</h4>
                  <div className="flex flex-col gap-4 md:gap-6">
                     <Link href="/dashboard" className="text-sm md:text-base font-bold text-muted-foreground hover:text-primary transition-all">Dashboard</Link>
                     <Link href="/docs" className="text-sm md:text-base font-bold text-muted-foreground hover:text-primary transition-all">Registry</Link>
                     <Link href="/status" className="text-sm md:text-base font-bold text-muted-foreground hover:text-primary transition-all">System</Link>
                  </div>
               </div>
               <div className="space-y-6 md:space-y-8">
                  <h4 className="text-[10px] md:text-[11px] font-black text-foreground uppercase tracking-widest opacity-60">Legal</h4>
                  <div className="flex flex-col gap-4 md:gap-6">
                     <Link href="/legal" className="text-sm md:text-base font-bold text-muted-foreground hover:text-primary transition-all">Privacy</Link>
                     <Link href="/legal" className="text-sm md:text-base font-bold text-muted-foreground hover:text-primary transition-all">Terms</Link>
                  </div>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto pt-12 md:pt-20 mt-12 md:mt-20 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6">
            <span className="text-[9px] md:text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">© 2026 StudioBucket • SECURE_V4_CORE</span>
            <div className="flex gap-6 md:gap-10 text-muted-foreground">
               <Icons.twitter className="h-5 w-5 hover:text-primary cursor-pointer transition-all hover:scale-110" />
               <Icons.github className="h-5 w-5 hover:text-primary cursor-pointer transition-all hover:scale-110" />
            </div>
         </div>
      </footer>
    </main>
  )
}
