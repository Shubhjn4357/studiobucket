"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface Plan {
  name: string
  price: string
  features: string[]
  color: string
  popular?: boolean
}

export default function BillingPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<"plans" | "checkout">("plans")
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const plans = [
    {
      name: "Starter",
      price: "$29",
      features: ["5 Channels", "100GB Storage", "Basic Analytics", "HLS Streaming"],
      color: "bg-slate-500/10 text-slate-500"
    },
    {
      name: "Pro",
      price: "$99",
      features: ["Unlimited Channels", "1TB Storage", "Advanced AI Studio", "4K Rendering", "Priority Support"],
      color: "bg-primary/10 text-primary",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$499",
      features: ["Custom Infrastructure", "Dedicated Worker Nodes", "API Access", "SLA Guarantee"],
      color: "bg-amber-500/10 text-amber-500"
    }
  ]

  const handlePurchase = (status: "success" | "reject") => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      if (status === "success") {
        toast.success("Subscription Protocol Activated")
        setStep("plans")
      } else {
        toast.error("Transaction Aborted by Gateway")
      }
    }, 1500)
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.creditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none italic">Subscription Protocol</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Resource Allocation • Fiscal Integration</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "plans" ? (
          <motion.div 
            key="plans"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {plans.map((plan) => (
              <Card key={plan.name} className={cn(
                "cyber-card border-border bg-card/50 overflow-hidden relative transition-all duration-500 group",
                plan.popular && "border-primary/50 shadow-2xl shadow-primary/5"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-xl shadow-lg">
                    Recommended
                  </div>
                )}
                <CardHeader className="p-8 text-center border-b border-border bg-muted/30">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">{plan.name}</span>
                  <div className="flex items-baseline justify-center gap-1">
                     <span className="text-4xl font-black italic">{plan.price}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                   <ul className="space-y-4">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-foreground/80">
                           <Icons.checkCircle className="h-3 w-3 text-emerald-500" />
                           {f}
                        </li>
                      ))}
                   </ul>
                   <Button 
                     onClick={() => { setSelectedPlan(plan); setStep("checkout"); }}
                     className={cn(
                       "w-full h-12 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all",
                       plan.popular ? "bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20" : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                     )}
                   >
                      Initiate Protocol
                   </Button>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto"
          >
            <Card className="cyber-card border-border bg-card/50 p-8 space-y-8">
               <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">Terminal Checkout</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secure Transmission • Node: {selectedPlan?.name}</p>
               </div>

               <div className="p-6 rounded-2xl bg-muted/50 border border-border space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Allocation</span>
                     <span className="text-sm font-black italic">{selectedPlan?.name} Plan</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interval</span>
                     <span className="text-sm font-black italic">Monthly Cycle</span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-primary">Total Signal</span>
                     <span className="text-2xl font-black italic text-primary">{selectedPlan?.price}</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <Button 
                    disabled={isProcessing}
                    onClick={() => handlePurchase("reject")}
                    variant="outline" 
                    className="h-12 rounded-xl border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                     Reject Transaction
                  </Button>
                  <Button 
                    disabled={isProcessing}
                    onClick={() => handlePurchase("success")}
                    className="h-12 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                  >
                     {isProcessing ? <Icons.refreshCw className="h-4 w-4 animate-spin mr-2" /> : <Icons.checkCircle className="h-4 w-4 mr-2" />}
                     Confirm Success
                  </Button>
               </div>
               
               <Button 
                 variant="ghost" 
                 onClick={() => setStep("plans")}
                 className="w-full text-[9px] font-black uppercase tracking-widest text-muted-foreground"
               >
                  Cancel and Abort
               </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
