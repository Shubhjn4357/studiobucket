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
  IconCpu,
  IconDatabase,
  IconLock
} from "@tabler/icons-react"

const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), {
  ssr: false,
})

const features = [
  {
    title: "Industrial_Pipeline_v5",
    description: "Multi-track temporal orchestration with redundant failover synchronization protocols.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-sm bg-secondary/10 border border-border tactical-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-command-gradient opacity-20" />
    </div>,
    icon: <IconCpu className="h-4 w-4 text-primary" />,
  },
  {
    title: "Command_Analytics_Live",
    description: "Deep-packet telemetry inspection for every asset transmission in the global network.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-sm bg-secondary/10 border border-border tactical-grid relative overflow-hidden" />,
    icon: <IconActivity className="h-4 w-4 text-primary" />,
  },
  {
    title: "Edge_Sync_Protocol",
    description: "Distributed content delivery via regional nodes with zero-latency synchronization.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-sm bg-secondary/10 border border-border tactical-grid relative overflow-hidden" />,
    icon: <IconDatabase className="h-4 w-4 text-primary" />,
  },
  {
    title: "Secure_Vault_Encryption",
    description: "Military-grade asset isolation and protocol hardening for mission-critical operations.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-sm bg-secondary/10 border border-border tactical-grid relative overflow-hidden" />,
    icon: <IconLock className="h-4 w-4 text-primary" />,
  },
]

const globeConfig = {
  pointSize: 2,
  globeColor: "#050505",
  showAtmosphere: true,
  atmosphereColor: "#FF0000",
  atmosphereAltitude: 0.15,
  emissive: "#000000",
  emissiveIntensity: 0.1,
  shininess: 0.5,
  polygonColor: "rgba(255,0,0,0.05)",
  ambientLight: "#ffffff",
  directionalLeftLight: "#FF0000",
  directionalTopLight: "#ffffff",
  pointLight: "#FF0000",
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
      {/* Global HUD Layer */}
      <div className="fixed inset-0 tactical-grid opacity-5 pointer-events-none z-0" />
      
      {/* Navbar HUD */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-10 px-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 bg-primary flex items-center justify-center rounded-sm">
            <Icons.logo className="h-3 w-3 text-white" />
          </div>
          <div className="flex flex-col leading-none">
             <span className="text-[9px] font-black tracking-[0.2em] uppercase text-foreground italic">StudioBucket</span>
             <span className="text-[6px] font-black text-primary uppercase tracking-[0.1em]">Protocol_v5.0_Stable</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-4 border-r border-border pr-4 h-6">
            <Link href="/docs" className="text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors italic">Documentation</Link>
            <Link href="/status" className="text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors italic">System_Status</Link>
          </nav>
          <Link href="/auth/signin">
            <Button size="sm" className="h-6 rounded-sm bg-foreground text-background hover:bg-foreground/90 px-3 text-[8px] font-black uppercase tracking-widest italic">
              Access_System
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Sector */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-10 overflow-hidden border-b border-border">
         <div className="absolute inset-0 z-0">
            <World data={[]} globeConfig={globeConfig} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.02)_0%,transparent_80%)]" />
         </div>

         <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-4">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-2 px-2 py-0.5 rounded-sm border border-primary/20 bg-primary/5 mb-2"
            >
               <IconCircleFilled className="h-1 w-1 text-primary animate-pulse" />
               <span className="text-[7px] font-black uppercase tracking-[0.3em] text-primary italic">Initialization_Status: Nominal</span>
            </motion.div>

            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none text-foreground italic">
               Industrial <br />
               <span className="text-primary not-italic">Automation</span>
            </h1>

            <p className="text-muted-foreground text-[9px] md:text-[10px] font-bold max-w-xs mx-auto tracking-[0.2em] uppercase opacity-40 leading-relaxed">
               Next-generation autonomous content command center. Orchestrate high-fidelity pipelines globally.
            </p>

            <div className="flex items-center justify-center gap-2 pt-4">
               <Link href="/dashboard">
                  <Button className="h-8 rounded-sm bg-primary text-white hover:bg-primary/90 px-6 text-[9px] font-black uppercase tracking-widest italic shadow-sm transition-all active:scale-95">
                     Deploy_Dashboard
                     <IconArrowRight className="ml-2 h-3 w-3" />
                  </Button>
               </Link>
               <Link href="/docs">
                  <Button variant="outline" className="h-8 rounded-sm border-border bg-background/50 backdrop-blur-sm hover:bg-surface px-6 text-[9px] font-black uppercase tracking-widest italic">
                     Technical_Specs
                  </Button>
               </Link>
            </div>
         </div>

         {/* Sector Data HUDs */}
         <div className="absolute bottom-6 left-6 hidden xl:block">
            <div className="space-y-1.5 p-2 bg-surface/50 border border-border rounded-sm backdrop-blur-md hud-corner">
               <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-success" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Temporal_Grid: Online</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Network_Core: Active</span>
               </div>
            </div>
         </div>
      </section>

      {/* Infrastructure Bento Grid */}
      <section className="py-20 px-6 relative bg-surface border-b border-border">
         <div className="max-w-4xl mx-auto space-y-10 relative z-10">
            <div className="text-center space-y-1.5">
               <h2 className="text-[8px] font-black text-primary tracking-[0.5em] uppercase italic">System_Infrastructure</h2>
               <h3 className="text-2xl font-black uppercase tracking-tight italic">Engineered_for_Global_Ops</h3>
            </div>
            <BentoGrid className="max-w-3xl mx-auto gap-2">
               {features.map((feature, i) => (
                  <BentoGridItem
                     key={i}
                     title={feature.title}
                     description={feature.description}
                     header={feature.header}
                     icon={feature.icon}
                     className={cn(
                        "rounded-sm border-border bg-background p-3 transition-all hover:border-primary/20",
                        i === 0 || i === 3 ? "md:col-span-2" : ""
                     )}
                  />
               ))}
            </BentoGrid>
         </div>
      </section>

      {/* System Footer */}
      <footer className="py-12 px-6 bg-background relative z-10">
         <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <div className="p-1 bg-primary rounded-sm">
                     <Icons.logo className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-[9px] font-black tracking-[0.3em] uppercase italic">StudioBucket</span>
               </div>
               <p className="text-[8px] text-muted-foreground max-w-[180px] font-bold uppercase tracking-widest leading-relaxed opacity-30">
                  Industrial-grade automation for digital asset management.
               </p>
            </div>
            
            <div className="grid grid-cols-2 gap-10">
               <div className="space-y-3">
                  <h4 className="text-[8px] font-black uppercase tracking-widest text-foreground">Infrastructure</h4>
                  <div className="flex flex-col gap-1.5">
                     <Link href="/dashboard" className="text-[8px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest italic">Dashboard</Link>
                     <Link href="/docs" className="text-[8px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest italic">Registry</Link>
                  </div>
               </div>
               <div className="space-y-3">
                  <h4 className="text-[8px] font-black uppercase tracking-widest text-foreground">Protocols</h4>
                  <div className="flex flex-col gap-1.5">
                     <Link href="/legal" className="text-[8px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest italic">Privacy</Link>
                     <Link href="/legal" className="text-[8px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest italic">Security</Link>
                  </div>
               </div>
            </div>
         </div>
         <div className="max-w-4xl mx-auto pt-8 mt-8 border-t border-border flex justify-between items-center opacity-30">
            <span className="text-[7px] font-black tracking-[0.4em] uppercase">© 2026 StudioBucket Industrial Systems</span>
            <span className="text-[7px] font-black tracking-[0.4em] uppercase">Built_for_Performance</span>
         </div>
      </footer>
    </main>
  )
}
