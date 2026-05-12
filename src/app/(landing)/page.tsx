"use client"

import { ParallaxHeroImages } from "@/components/ui/parallax-hero-images"
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
  IconSettings, 
  IconShieldCheck, 
  IconArrowRight,
  IconVideo,
  IconAdjustmentsHorizontal
} from "@tabler/icons-react"

const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), {
  ssr: false,
})

const heroImages = [
  "https://assets.aceternity.com/components/hero-section-with-mesh-gradient.webp",
  "https://assets.aceternity.com/components/3d-globe.webp",
  "https://assets.aceternity.com/components/keyboard-2.webp",
  "https://assets.aceternity.com/components/hero-1.webp",
  "https://assets.aceternity.com/components/hero-2.webp",
  "https://assets.aceternity.com/components/hero-3.webp",
  "https://assets.aceternity.com/components/dashboard-ui.webp",
  "https://assets.aceternity.com/components/analytics-ui.webp",
]

const features = [
  {
    title: "Industrial Pipeline",
    description: "Automated video processing at scale with professional precision.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-industrial bg-slate-100 dark:bg-neutral-900" />,
    icon: <IconTerminal2 className="h-4 w-4 text-primary" />,
  },
  {
    title: "Command Analytics",
    description: "Real-time performance tracking with a dedicated HUD interface.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-industrial bg-slate-100 dark:bg-neutral-900" />,
    icon: <IconChartBar className="h-4 w-4 text-primary" />,
  },
  {
    title: "Global Distribution",
    description: "Sync your content across platforms with zero latency.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-industrial bg-slate-100 dark:bg-neutral-900" />,
    icon: <IconCloudUpload className="h-4 w-4 text-primary" />,
  },
  {
    title: "Secure Operations",
    description: "Enterprise-grade encryption for all your digital assets.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-industrial bg-slate-100 dark:bg-neutral-900" />,
    icon: <IconShieldCheck className="h-4 w-4 text-primary" />,
  },
]

const workflowSteps = [
  {
    title: "Initialize Pipeline",
    description: "Connect your channels and configure your industrial-grade upload protocol. StudioBucket handles the authentication and synchronization securely.",
    content: (
      <div className="h-full w-full bg-industrial flex items-center justify-center text-white p-4">
        <IconSettings className="w-20 h-20 text-primary opacity-20" />
      </div>
    ),
  },
  {
    title: "Automated Processing",
    description: "Our background workers handle video encoding, metadata optimization, and scheduled publishing without manual intervention.",
    content: (
      <div className="h-full w-full bg-industrial flex items-center justify-center text-white p-4">
        <IconVideo className="w-20 h-20 text-primary opacity-20" />
      </div>
    ),
  },
  {
    title: "Command & Control",
    description: "Monitor your growth through the Command Deck. Analyze performance, manage assets, and scale your operations globally.",
    content: (
      <div className="h-full w-full bg-industrial flex items-center justify-center text-white p-4">
        <IconAdjustmentsHorizontal className="w-20 h-20 text-primary opacity-20" />
      </div>
    ),
  },
]

const testimonials = [
  {
    quote: "The industrial HUD interface makes managing 50+ channels feel like operating a starship. Unparalleled efficiency.",
    name: "Alex Rivera",
    designation: "Head of Content @ VelocityMedia",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
  },
  {
    quote: "StudioBucket is the first platform that treats content automation as a serious engineering discipline. The pipeline is rock solid.",
    name: "Sarah Jenkins",
    designation: "CTO @ DigitalEmpire",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop",
  },
]

const globeConfig = {
  pointSize: 4,
  globeColor: "#121212",
  showAtmosphere: true,
  atmosphereColor: "#FF0000",
  atmosphereAltitude: 0.1,
  emissive: "#121212",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,0,0,0.2)",
  ambientLight: "#FF0000",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
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
    <main className="min-h-screen bg-industrial">
      {/* HUD Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 px-6 flex items-center justify-between border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="hud-border p-1 bg-primary/10">
            <Icons.logo className="h-4 w-4 text-primary" />
          </div>
          <span className="text-hud font-bold tracking-[0.2em]">StudioBucket // Command_v4.0</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-hud hover:text-primary transition-colors hidden md:block">
            Dashboard
          </Link>
          <Link href="/docs" className="text-hud hover:text-primary transition-colors hidden md:block">
            Registry
          </Link>
          <Link href="/auth/signin">
            <Button size="sm" className="h-8 rounded-none border border-primary/20 bg-primary/5 text-hud hover:bg-primary/10 px-4">
              Access_System
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-14 overflow-hidden">
        <ParallaxHeroImages images={heroImages} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none border border-primary/20 bg-primary/5 mb-4">
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
              <span className="text-hud text-primary">Protocol_Initialized: System_Ready</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-tight italic">
              Industrial Grade <br />
              <span className="text-primary drop-shadow-[0_0_15px_rgba(255,0,0,0.3)]">Automation</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base font-mono max-w-xl mx-auto uppercase tracking-wide">
              Deploy. Scale. Dominate. The professional command center for autonomous content creators.
            </p>
            <div className="flex items-center justify-center gap-4 pt-8">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-hud group">
                  Initialize_Dashboard
                  <IconArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-2">
            <h2 className="text-hud text-primary tracking-[0.3em]">Core_Systems</h2>
            <h3 className="text-3xl font-black uppercase tracking-tighter">Engineered for Performance</h3>
          </div>
          <BentoGrid>
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
      <section className="py-32 px-6 bg-secondary/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-2 text-right">
            <h2 className="text-hud text-primary tracking-[0.3em]">Operation_Flow</h2>
            <h3 className="text-3xl font-black uppercase tracking-tighter">Synchronized Execution</h3>
          </div>
          <StickyScroll content={workflowSteps} />
        </div>
      </section>

      {/* Global Connectivity Globe */}
      <section className="py-32 px-6 relative overflow-hidden h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <World data={[]} globeConfig={globeConfig} />
        </div>
        <div className="relative z-10 text-center space-y-4">
          <h2 className="text-hud text-primary tracking-[0.3em]">Global_Network</h2>
          <h3 className="text-4xl font-black uppercase tracking-tighter drop-shadow-2xl">Worldwide Distribution</h3>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Low Latency // High Availability // Multi-Region Sync</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-2">
            <h2 className="text-hud text-primary tracking-[0.3em]">Operator_Feedback</h2>
            <h3 className="text-3xl font-black uppercase tracking-tighter">Validated by Industry Leaders</h3>
          </div>
          <AnimatedTestimonials testimonials={testimonials} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-primary/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <Icons.logo className="h-4 w-4 text-primary" />
            <span className="text-hud tracking-widest opacity-50">© 2026 StudioBucket Industrial Systems</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/legal" className="text-hud opacity-50 hover:opacity-100 transition-opacity">Legal</Link>
            <Link href="/status" className="text-hud opacity-50 hover:opacity-100 transition-opacity">System_Status</Link>
            <Link href="/docs" className="text-hud opacity-50 hover:opacity-100 transition-opacity">Documentation</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
