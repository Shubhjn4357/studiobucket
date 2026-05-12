"use client"

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import dynamic from "next/dynamic"
import { motion } from "motion/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { 
  IconTerminal2, 
  IconChartBar, 
  IconCloudUpload, 
  IconShieldCheck, 
  IconArrowRight,
  IconVideo,
  IconAdjustmentsHorizontal,
  IconCircleFilled
} from "@tabler/icons-react"

const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), {
  ssr: false,
})

const features = [
  {
    title: "Industrial Pipeline",
    description: "Automated video processing at scale with professional precision and redundant failover protocols.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-md bg-secondary/50 border border-border industrial-grid" />,
    icon: <IconTerminal2 className="h-4 w-4 text-primary" />,
  },
  {
    title: "Command Analytics",
    description: "Real-time performance tracking with a dedicated HUD interface for global operations.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-md bg-secondary/50 border border-border industrial-grid" />,
    icon: <IconChartBar className="h-4 w-4 text-primary" />,
  },
  {
    title: "Global Distribution",
    description: "Sync your content across platforms with zero latency using our distributed edge network.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-md bg-secondary/50 border border-border industrial-grid" />,
    icon: <IconCloudUpload className="h-4 w-4 text-primary" />,
  },
  {
    title: "Secure Operations",
    description: "Enterprise-grade encryption and protocol isolation for all your digital asset management.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-md bg-secondary/50 border border-border industrial-grid" />,
    icon: <IconShieldCheck className="h-4 w-4 text-primary" />,
  },
]

const workflowSteps = [
  {
    title: "Initialize Pipeline",
    description: "Connect your channels and configure your industrial-grade upload protocol. StudioBucket handles the authentication and synchronization securely.",
    content: (
      <div className="h-full w-full bg-secondary/20 flex items-center justify-center p-4 rounded-lg border border-border">
        <div className="space-y-2 w-full max-w-[200px]">
          <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary" />
          </div>
          <div className="h-1.5 w-full bg-primary/10 rounded-full" />
          <div className="h-1.5 w-2/3 bg-primary/10 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    title: "Automated Processing",
    description: "Our background workers handle video encoding, metadata optimization, and scheduled publishing without manual intervention.",
    content: (
      <div className="h-full w-full bg-secondary/20 flex items-center justify-center p-4 rounded-lg border border-border">
        <IconVideo className="w-12 h-12 text-primary opacity-40" />
      </div>
    ),
  },
  {
    title: "Command & Control",
    description: "Monitor your growth through the Command Deck. Analyze performance, manage assets, and scale your operations globally.",
    content: (
      <div className="h-full w-full bg-secondary/20 flex items-center justify-center p-4 rounded-lg border border-border">
        <IconAdjustmentsHorizontal className="w-12 h-12 text-primary opacity-40" />
      </div>
    ),
  },
]

const testimonials = [
  {
    quote: "The industrial HUD interface makes managing 50+ channels feel like operating a starship. Unparalleled efficiency.",
    name: "Alex Rivera",
    designation: "Head of Content @ VelocityMedia",
    src: "system-1", // Will be rendered as placeholder
  },
  {
    quote: "StudioBucket is the first platform that treats content automation as a serious engineering discipline. The pipeline is rock solid.",
    name: "Sarah Jenkins",
    designation: "CTO @ DigitalEmpire",
    src: "system-2", // Will be rendered as placeholder
  },
]

const globeConfig = {
  pointSize: 4,
  globeColor: "#ffffff",
  showAtmosphere: true,
  atmosphereColor: "#FF0000",
  atmosphereAltitude: 0.1,
  emissive: "#ffffff",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,0,0,0.1)",
  ambientLight: "#ffffff",
  directionalLeftLight: "#FF0000",
  directionalTopLight: "#ffffff",
  pointLight: "#FF0000",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary selection:text-white">
      {/* HUD Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-12 px-6 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-primary rounded-sm shadow-sm">
            <Icons.logo className="h-3 w-3 text-white" />
          </div>
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-foreground italic">StudioBucket // CMD_V4.0</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors italic">
              Dashboard
            </Link>
            <Link href="/docs" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors italic">
              Registry
            </Link>
          </div>
          <Link href="/auth/signin">
            <Button size="sm" className="h-7 rounded-sm bg-foreground text-background hover:bg-foreground/90 px-4 text-[9px] font-black uppercase tracking-widest">
              Access_System
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section - White Canvas */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 overflow-hidden border-b border-border">
        {/* Background Ambience */}
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 industrial-grid opacity-5" />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.03)_0%,transparent_70%)]" />
           <World data={[]} globeConfig={globeConfig} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-primary/20 bg-primary/5 mb-2">
              <IconCircleFilled className="h-1 w-1 text-primary animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary italic">Protocol_Initialized: System_Ready</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-foreground italic">
              Industrial <br />
              <span className="text-primary not-italic">Automation</span>
            </h1>
            
            <p className="text-muted-foreground text-[10px] md:text-xs font-bold max-w-md mx-auto tracking-widest uppercase opacity-60 leading-relaxed">
              Autonomous content command center. Deploy high-fidelity pipelines across your digital empire.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
              <Link href="/dashboard">
                <Button size="lg" className="h-10 rounded-sm bg-primary text-white hover:bg-primary/90 px-8 text-[10px] font-black uppercase tracking-widest italic shadow-sm transition-all hover:scale-[1.02]">
                  Initialize_Dashboard
                  <IconArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" size="lg" className="h-10 rounded-sm border-border bg-background hover:bg-surface px-8 text-[10px] font-black uppercase tracking-widest">
                  View_Registry
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* HUD Decoration */}
        <div className="absolute bottom-8 left-8 hidden xl:block">
           <div className="flex flex-col gap-2 p-3 border border-border rounded-sm bg-surface/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-success" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Core_Sync: Stable</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-primary" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Network: Active</span>
              </div>
           </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-6 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          <div className="space-y-2 text-center">
            <h2 className="text-[9px] font-black text-primary tracking-[0.5em] uppercase italic">Core_Infrastructure</h2>
            <h3 className="text-4xl font-black uppercase tracking-tighter italic">Engineered_for_Performance</h3>
          </div>
          <BentoGrid className="max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <BentoGridItem
                key={i}
                title={feature.title}
                description={feature.description}
                header={feature.header}
                icon={feature.icon}
                className={i === 0 || i === 3 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Workflow Sticky Scroll */}
      <section className="py-24 px-6 border-y border-border relative overflow-hidden bg-background">
        <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          <div className="space-y-2">
            <h2 className="text-[9px] font-black text-primary tracking-[0.5em] uppercase italic">Operation_Flow</h2>
            <h3 className="text-4xl font-black uppercase tracking-tighter italic">Synchronized_Execution</h3>
          </div>
          <div className="rounded-md border border-border bg-surface overflow-hidden shadow-sm">
            <StickyScroll content={workflowSteps} />
          </div>
        </div>
      </section>

      {/* Operator Log */}
      <section className="py-24 px-6 border-b border-border bg-surface relative overflow-hidden">
        <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
        <div className="max-w-6xl mx-auto space-y-12 text-center relative z-10">
          <div className="space-y-2">
            <h2 className="text-[9px] font-black text-primary tracking-[0.5em] uppercase italic">Operator_Log</h2>
            <h3 className="text-4xl font-black uppercase tracking-tighter italic">Validated_Systems</h3>
          </div>
          <div className="max-w-4xl mx-auto">
            <AnimatedTestimonials testimonials={testimonials} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-background border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary rounded-sm">
                <Icons.logo className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">StudioBucket</span>
            </div>
            <p className="text-[10px] text-muted-foreground max-w-xs font-bold uppercase tracking-widest leading-relaxed opacity-60">
              Industrial grade YouTube automation platform for professional creators.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground">Infrastructure</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Dashboard</Link></li>
                <li><Link href="/docs" className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Registry</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-foreground">Protocols</h4>
              <ul className="space-y-2">
                <li><Link href="/legal" className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Privacy</Link></li>
                <li><Link href="/legal" className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-12 mt-12 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[8px] font-black tracking-[0.4em] opacity-30 uppercase">© 2026 StudioBucket Industrial Systems</span>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-success/5 border border-success/10 rounded-sm">
            <div className="h-1 w-1 rounded-full bg-success animate-pulse" />
            <span className="text-[8px] font-black tracking-[0.2em] text-success uppercase">System_Nominal</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
