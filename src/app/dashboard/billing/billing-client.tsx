"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { updatePlanAction } from "./actions"
import { Badge } from "@/components/ui/badge"

interface Plan {
  id: string
  name: string
  price: string
  features: string[]
  color: string
  popular?: boolean
  description: string
  label: string
}

interface BillingClientProps {
  currentPlan: string
}

export function BillingClient({ currentPlan }: BillingClientProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<"plans" | "checkout">("plans")
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const plans: Plan[] = [
    {
      id: "alpha",
      name: "Alpha Protocol",
      price: "$0",
      label: "STARTER",
      description: "Baseline ingestion and basic node control.",
      features: ["1 Linked Node", "5 Transmissions/mo", "720p Render Core", "Basic Analytics"],
      color: "from-slate-500/20 to-slate-500/10"
    },
    {
      id: "pro",
      name: "Pro Strike",
      price: "$29",
      label: "PROFESSIONAL",
      description: "High-throughput automation for elite creators.",
      features: ["5 Linked Nodes", "Unlimited Transmissions", "4K HDR Render Core", "AI Neural Studio", "Priority Uplink"],
      color: "from-primary/20 to-primary/10",
      popular: true
    },
    {
      id: "fleet",
      name: "Fleet Command",
      price: "$99",
      label: "ENTERPRISE",
      description: "Massive scale orchestration and agency control.",
      features: ["Unlimited Nodes", "Mass Execution", "Cluster Transcoding", "Team Orchestration", "Protocol Access"],
      color: "from-amber-500/20 to-amber-500/10"
    }
  ]

  const handlePurchase = async (status: "success" | "reject") => {
    if (status === "reject") {
      toast.error("Transaction Aborted by Gateway")
      setStep("plans")
      return
    }

    if (!selectedPlan) return

    setIsProcessing(true)
    try {
      const result = await updatePlanAction(selectedPlan.id)
      if (result.success) {
        toast.success("Subscription Protocol Activated")
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error(result.error || "Signal Interruption")
      }
    } catch {
      toast.error("Failed to synchronize subscription state")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-16 pb-24 relative max-w-7xl mx-auto">
      {/* Structural Ambience Nodes */}
      <div className="absolute -top-60 -left-60 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Industrial Header Console */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-20 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px)] bg-[size:100px_100%] pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity" />
        
        <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="h-28 w-28 rounded-[3rem] bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary),0.3)] relative group/icon"
          >
            <div className="absolute inset-0 rounded-[3rem] bg-primary blur-3xl opacity-20 group-hover/icon:opacity-40 transition-opacity" />
            <Icons.creditCard className="h-14 w-14 text-white relative z-10" />
          </motion.div>
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
               <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
               <span className="text-[12px] font-black text-primary uppercase tracking-[0.6em] italic leading-none">Fiscal_Matrix_V4</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">Subscription</h1>
            <p className="text-white/20 font-black uppercase tracking-[0.5em] text-[12px] italic">Mission_Cycle // Resource_Allocation_Engine</p>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-col items-end gap-4 border-l border-white/5 pl-16">
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Current_Tier</span>
              <Badge className="text-[12px] font-black text-primary italic bg-primary/10 px-6 py-2 rounded-full border border-primary/20 tracking-widest">
                {currentPlan.toUpperCase() || "ALPHA_DEFAULT"}
              </Badge>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Cycle_Status</span>
              <span className="text-[11px] font-mono font-black text-emerald-500 italic bg-emerald-500/5 px-4 py-1 rounded-lg border border-emerald-500/10">NOMINAL_30D_LOCK</span>
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "plans" ? (
          <motion.div 
            key="plans"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4 relative z-10"
          >
            {plans.map((plan, i) => {
              const isActive = currentPlan.toLowerCase() === plan.id.toLowerCase()
              return (
                <div key={plan.id} className={cn(
                  "bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4.5rem] overflow-hidden relative transition-all duration-700 group shadow-2xl flex flex-col h-full",
                  plan.popular && !isActive && "border-primary/40 shadow-primary/10 scale-[1.03]",
                  isActive && "border-emerald-500/40 bg-emerald-500/[0.02]"
                )}>
                  {/* Background Grid Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff02_1.5px,transparent_1.5px)] bg-[size:40px_40px] pointer-events-none" />
                  
                  {plan.popular && !isActive && (
                    <div className="absolute top-12 right-12 px-8 py-3 bg-primary/20 backdrop-blur-3xl border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.4em] rounded-full z-20 italic shadow-2xl">
                      RECOMMENDED_STRIKE
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-12 right-12 px-8 py-3 bg-emerald-500/20 backdrop-blur-3xl border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] rounded-full z-20 italic shadow-2xl">
                      TIER_ACTIVE
                    </div>
                  )}
                  
                  <div className="p-16 space-y-12 flex-1 flex flex-col justify-between relative z-10">
                    <div className="space-y-12">
                      <div className="space-y-6">
                        <span className="text-[12px] font-black uppercase tracking-[0.6em] text-white/30 block italic leading-none">{plan.name}</span>
                        <div className="flex items-baseline gap-4">
                           <span className="text-7xl font-black italic text-white tracking-tighter leading-none">{plan.price}</span>
                           <span className="text-[14px] font-black uppercase tracking-[0.3em] text-white/20 italic">/cycle</span>
                        </div>
                      </div>
                      
                      <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 italic">
                        <p className="text-[11px] font-black text-white/40 leading-relaxed uppercase tracking-[0.15em]">
                          {plan.description}
                        </p>
                      </div>

                      <ul className="space-y-8 pt-12 border-t border-white/5">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.25em] text-white/70 italic group/feature">
                             <div className="h-6 w-6 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 group-hover/feature:bg-emerald-500 group-hover/feature:text-white transition-all">
                               <Icons.check className="h-3.5 w-3.5 transition-transform" />
                             </div>
                             {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      onClick={() => { setSelectedPlan(plan); setStep("checkout"); }}
                      disabled={isActive}
                      className={cn(
                        "w-full h-24 rounded-[3rem] text-[12px] font-black uppercase tracking-[0.5em] transition-all italic border mt-16 relative overflow-hidden group/btn",
                        isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default" :
                        plan.popular ? "bg-primary text-white hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_50px_rgba(var(--primary),0.3)] border-primary/20" : "bg-white/5 text-white/60 hover:bg-white/10 border-white/10"
                      )}
                    >
                       <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                       <span className="relative z-10">{isActive ? "PROTOCOL_SYNCHRONIZED" : "INITIALIZE_COMMISSION"}</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto px-4 relative z-10"
          >
            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[5rem] p-20 space-y-16 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] pointer-events-none bg-[size:100%_6px] opacity-10 animate-scan" />
               
               <div className="text-center space-y-6">
                  <div className="flex items-center justify-center gap-4">
                     <Icons.shieldCheck className="h-6 w-6 text-primary" />
                     <span className="text-[12px] font-black text-primary uppercase tracking-[0.8em] italic block">SECURE_HANDSHAKE_TERMINAL</span>
                  </div>
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">Fiscal_Link_Commit</h2>
               </div>

               <div className="p-12 rounded-[4rem] bg-black/40 border border-white/5 space-y-10 relative z-10 shadow-inner">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[12px] font-black uppercase tracking-[0.5em] text-white/20 italic">Node_Asset_Identity</span>
                     <span className="text-3xl font-black italic text-white uppercase tracking-tighter">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[12px] font-black uppercase tracking-[0.5em] text-white/20 italic">Transmission_Frequency</span>
                     <span className="text-3xl font-black italic text-white uppercase tracking-tighter">RECURRING_AUTO_SYNC</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center pt-6 px-4">
                     <div className="flex flex-col gap-2">
                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-primary italic">Fiscal_Commitment</span>
                        <span className="text-[10px] text-white/10 font-black uppercase tracking-widest italic leading-none">INCL_ALL_RESOURCE_CREDITS</span>
                     </div>
                     <span className="text-7xl font-black italic text-primary tracking-tighter leading-none shadow-[0_0_30px_rgba(var(--primary),0.2)]">{selectedPlan?.price}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
                  <Button 
                    disabled={isProcessing}
                    onClick={() => handlePurchase("reject")}
                    variant="ghost" 
                    className="h-24 rounded-[3.5rem] border border-white/5 bg-white/5 text-white/40 text-[12px] font-black uppercase tracking-[0.5em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all italic group/abort"
                  >
                     <Icons.x className="h-5 w-5 mr-4 group-hover/abort:rotate-90 transition-transform" />
                     Abort_Transmission
                  </Button>
                  <Button 
                    disabled={isProcessing}
                    onClick={() => handlePurchase("success")}
                    className="h-24 rounded-[3.5rem] bg-emerald-500 text-white text-[12px] font-black uppercase tracking-[0.5em] hover:bg-emerald-600 shadow-[0_20px_60px_rgba(16,185,129,0.3)] transition-all italic border border-emerald-400/20 group/commit"
                  >
                     {isProcessing ? <Icons.refreshCw className="h-8 w-8 animate-spin" /> : (
                       <>
                         <Icons.zap className="h-6 w-6 mr-6 group-hover/commit:scale-125 transition-transform" />
                         Commit_Fiscal_Protocol
                       </>
                     )}
                  </Button>
               </div>
               
               <div className="text-center space-y-4 opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white italic leading-relaxed">
                    CRITICAL: BY COMMITTING, YOU AUTHORIZE THE FULL ALLOCATION OF CLOUD NODES FOR THIS MISSION CYCLE. 
                  </p>
                  <div className="flex items-center justify-center gap-6">
                     <span className="h-1 w-12 bg-white/20 rounded-full" />
                     <span className="text-[9px] font-mono">UPLINK_SECURE_256BIT_ALPHA</span>
                     <span className="h-1 w-12 bg-white/20 rounded-full" />
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
