"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { motion } from "framer-motion"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-32 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-20" />
      </div>

      <div className="container relative z-10 px-4 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Icons.zap className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Initialize Global Access</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none italic">
            Ready to <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Ascend?</span>
          </h2>

          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Join the automated future. Deployment takes less than 60 seconds. 
            No credit card. No friction. Pure performance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-10 rounded-2xl bg-primary text-white hover:opacity-90 font-black uppercase tracking-widest text-xs transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs transition-transform hover:scale-105 active:scale-95">
                Contact Sales
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-8 pt-8">
            {["Encrypted", "Autonomous", "Certified"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
