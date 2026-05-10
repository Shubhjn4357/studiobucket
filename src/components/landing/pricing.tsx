"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"

export function Pricing() {
  const plans = [
    {
      name: "Standard",
      price: "$49",
      description: "For elite creators",
      features: [
        "100 Autonomous Uploads",
        "Strategic Planner",
        "Real-time Telemetry",
        "Priority Support",
      ],
      popular: false,
    },
    {
      name: "Enterprise",
      price: "$199",
      description: "For content empires",
      features: [
        "Unlimited Throughput",
        "Neural Sync AI",
        "API Command Access",
        "Dedicated Node",
      ],
      popular: true,
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
            <Icons.tag className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Protocol Plans</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">
            Scalable <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">Investment</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Card className={cn(
                "cyber-card border-white/5 bg-white/5 h-full transition-all duration-500 overflow-hidden group",
                plan.popular && "border-primary/50 shadow-[0_0_40px_rgba(255,0,0,0.1)]"
              )}>
                <CardContent className="p-10 flex flex-col h-full space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{plan.name}</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{plan.description}</p>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white italic">{plan.price}</span>
                    <span className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">/ Month</span>
                  </div>

                  <div className="space-y-4 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Icons.check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/dashboard" className="w-full">
                    <Button className={cn(
                      "w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                      plan.popular 
                        ? "bg-linear-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg shadow-primary/20"
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    )}>
                      Initialize Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
