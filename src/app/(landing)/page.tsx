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
    <main className="min-h-screen bg-background selection:bg-primary/30 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/20">
            <Icons.logo className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">StudioBucket</span>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 pr-6 border-r border-border h-6">
            <Link href="/docs" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">Documentation</Link>
            <Link href="/status" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">System Status</Link>
          </nav>
          <Link href="/auth/signin">
            <Button size="sm" className="font-bold rounded-lg px-4">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
         <div className="absolute inset-0 z-0">
            <World data={[]} globeConfig={globeConfig} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)]" />
         </div>

         <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 shadow-sm"
            >
               <IconCircleFilled className="h-1.5 w-1.5 text-primary animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Now in Public Beta</span>
            </motion.div>

            <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[0.9] text-foreground">
               Video Creation <br />
               <span className="text-primary italic">Simplified.</span>
            </h1>

            <p className="text-muted-foreground text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed">
               The all-in-one platform to download, edit, and schedule your video content with professional-grade tools and real-time insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
               <Link href="/dashboard">
                  <Button size="lg" className="h-14 rounded-2xl bg-primary text-white hover:bg-primary/90 px-8 font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                     Go to Dashboard
                     <IconArrowRight className="ml-2 h-5 w-5" />
                  </Button>
               </Link>
               <Link href="/docs">
                  <Button size="lg" variant="outline" className="h-14 rounded-2xl border-border bg-background/50 backdrop-blur-sm hover:bg-muted px-8 font-bold">
                     Learn More
                  </Button>
               </Link>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 relative bg-muted/30 border-y border-border">
         <div className="max-w-5xl mx-auto space-y-16 relative z-10">
            <div className="text-center space-y-4">
               <h2 className="text-sm font-bold text-primary uppercase tracking-widest">Platform Features</h2>
               <h3 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need to grow.</h3>
            </div>
            <BentoGrid className="max-w-4xl mx-auto gap-4">
               {features.map((feature, i) => (
                  <BentoGridItem
                     key={i}
                     title={feature.title}
                     description={feature.description}
                     header={feature.header}
                     icon={feature.icon}
                     className={cn(
                        "rounded-2xl border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20",
                        i === 0 || i === 3 ? "md:col-span-2" : ""
                     )}
                  />
               ))}
            </BentoGrid>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-background relative z-10 border-t border-border/50">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20">
                     <Icons.logo className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold tracking-tight">StudioBucket</span>
               </div>
               <p className="text-sm text-muted-foreground max-w-xs font-medium leading-relaxed">
                  Professional video management and automation for the modern content creator.
               </p>
            </div>
            
            <div className="grid grid-cols-2 gap-20">
               <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground">Platform</h4>
                  <div className="flex flex-col gap-3">
                     <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
                     <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Documentation</Link>
                  </div>
               </div>
               <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground">Company</h4>
                  <div className="flex flex-col gap-3">
                     <Link href="/legal" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
                     <Link href="/legal" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Terms</Link>
                  </div>
               </div>
            </div>
         </div>
         <div className="max-w-5xl mx-auto pt-10 mt-10 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 opacity-50">
            <span className="text-xs font-medium">© 2026 StudioBucket. All rights reserved.</span>
            <div className="flex gap-6">
               <Icons.twitter className="h-4 w-4" />
               <Icons.github className="h-4 w-4" />
            </div>
         </div>
      </footer>
    </main>
  )
}
