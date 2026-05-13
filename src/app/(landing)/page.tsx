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
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-primary/5 border border-primary/10 relative overflow-hidden flex items-center justify-center">
        <Icons.video className="h-12 w-12 text-primary/20" />
    </div>,
    icon: <IconVideo className="h-4 w-4 text-primary" />,
  },
  {
    title: "Real-time Insights",
    description: "Track your video performance with beautiful, easy-to-understand analytics.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden flex items-center justify-center">
        <Icons.barChart className="h-12 w-12 text-blue-500/20" />
    </div>,
    icon: <IconActivity className="h-4 w-4 text-blue-500" />,
  },
  {
    title: "Smart Cloud Sync",
    description: "Your projects are automatically synced and accessible from anywhere.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-purple-500/5 border border-purple-500/10 relative overflow-hidden flex items-center justify-center">
        <Icons.cloud className="h-12 w-12 text-purple-500/20" />
    </div>,
    icon: <IconCloud className="h-4 w-4 text-purple-500" />,
  },
  {
    title: "Secure & Private",
    description: "Your data is encrypted and private. You have full control over your content.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden flex items-center justify-center">
        <Icons.lock className="h-12 w-12 text-emerald-500/20" />
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
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
            <Icons.logo className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">StudioBucket</span>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 pr-6 border-r border-border h-6">
            <Link href="/docs" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Docs</Link>
            <Link href="/status" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Status</Link>
          </nav>
          <Link href="/auth/signin">
            <Button size="sm" className="font-bold rounded-xl px-5 h-9 bg-foreground text-background hover:bg-foreground/90 transition-all">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
         <div className="absolute inset-0 z-0">
            <World data={[]} globeConfig={globeConfig} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.03)_0%,transparent_70%)]" />
         </div>

         <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-10">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 shadow-inner"
            >
               <IconCircleFilled className="h-2 w-2 text-primary animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Public Beta Operational</span>
            </motion.div>

            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-foreground uppercase italic">
               Video <br />
               <span className="text-primary not-italic">Automation.</span>
            </h1>

            <p className="text-muted-foreground text-sm md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
               The professional-grade suite for automated content pipelines. Ingest, transcode, and synchronize your video assets with real-time telemetry.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
               <Link href="/dashboard">
                  <Button size="lg" className="h-16 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 px-10 font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-[1.05] active:scale-[0.95]">
                     Launch Dashboard
                     <IconArrowRight className="ml-3 h-5 w-5" />
                  </Button>
               </Link>
               <Link href="/docs">
                  <Button size="lg" variant="outline" className="h-16 rounded-2xl border-border bg-card/50 backdrop-blur-sm hover:bg-muted px-10 font-black uppercase tracking-widest transition-all">
                     View Docs
                  </Button>
               </Link>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-40 px-6 relative bg-muted/20 border-y border-border">
         <div className="max-w-6xl mx-auto space-y-20 relative z-10">
            <div className="text-center space-y-6">
               <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">Core Capabilities</h2>
               <h3 className="text-4xl md:text-7xl font-black tracking-tight text-foreground uppercase italic">Engineered for growth.</h3>
            </div>
            <BentoGrid className="max-w-5xl mx-auto gap-6">
               {features.map((feature, i) => (
                  <BentoGridItem
                     key={i}
                     title={feature.title}
                     description={feature.description}
                     header={feature.header}
                     icon={feature.icon}
                     className={cn(
                        "rounded-[2.5rem] border-border bg-card p-8 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 group",
                        i === 0 || i === 3 ? "md:col-span-2" : ""
                     )}
                  />
               ))}
            </BentoGrid>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 bg-background relative z-10 border-t border-border">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
            <div className="space-y-8">
               <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary rounded-xl shadow-2xl shadow-primary/20">
                     <Icons.logo className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-black tracking-tight text-foreground uppercase italic">StudioBucket</span>
               </div>
               <p className="text-sm text-muted-foreground max-w-xs font-medium leading-relaxed">
                  Mission-critical video automation and management for professional content creators and enterprises.
               </p>
            </div>
            
            <div className="grid grid-cols-2 gap-32">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Platform</h4>
                  <div className="flex flex-col gap-4">
                     <Link href="/dashboard" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">Dashboard</Link>
                     <Link href="/docs" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">Registry</Link>
                  </div>
               </div>
               <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Protocols</h4>
                  <div className="flex flex-col gap-4">
                     <Link href="/legal" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">Privacy</Link>
                     <Link href="/legal" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">Terms</Link>
                  </div>
               </div>
            </div>
         </div>
         <div className="max-w-6xl mx-auto pt-16 mt-16 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">© 2026 StudioBucket • SECURE_V4_UPLINK</span>
            <div className="flex gap-8 text-muted-foreground">
               <Icons.twitter className="h-4 w-4 hover:text-primary cursor-pointer transition-colors" />
               <Icons.github className="h-4 w-4 hover:text-primary cursor-pointer transition-colors" />
            </div>
         </div>
      </footer>
    </main>
  )
}
