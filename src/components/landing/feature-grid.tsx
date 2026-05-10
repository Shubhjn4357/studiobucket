"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { motion } from "framer-motion"

export function FeatureGrid() {
  const features = [
    {
      icon: Icons.upload,
      title: "Bulk Engine",
      description: "Parallel upload architecture for massive content scale."
    },
    {
      icon: Icons.calendar,
      title: "Neural Sync",
      description: "Optimized scheduling based on audience activity patterns."
    },
    {
      icon: Icons.zap,
      title: "24/7 Flow",
      description: "Continuous processing without manual intervention."
    },
    {
      icon: Icons.shield,
      title: "Iron Core",
      description: "Encrypted API communication with strict security protocols."
    },
    {
      icon: Icons.barChart,
      title: "Deep Metrics",
      description: "High-resolution analytics for every frame and engagement."
    },
    {
      icon: Icons.globe,
      title: "Global Reach",
      description: "Multi-channel distribution across all territories."
    },
  ]

  return (
    <section className="py-32 bg-[#0a0a0a] relative overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Icons.layers className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Capabilities</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">
            Engineered for <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Dominance</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="cyber-card border-white/5 bg-white/5 group hover:border-primary/30 transition-all duration-500 overflow-hidden h-full">
                <CardContent className="p-8 space-y-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
