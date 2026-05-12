"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { completeDemoPurchase } from "@/app/dashboard/settings/billing-actions"

export default function BillingDemoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get("plan") || "pro"
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionId] = useState(() => `SB-${Math.random().toString(36).substring(7).toUpperCase()}`)

  const handleAction = async (success: boolean) => {
    setIsProcessing(true)
    try {
      if (success) {
        await completeDemoPurchase(planId)
        toast.success("Deployment Successful")
        router.push("/dashboard/settings?success=true")
      } else {
        toast.error("Operation Aborted")
        router.push("/dashboard/settings?canceled=true")
      }
    } catch {
      toast.error("Handshake Failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-primary/30 font-sans">
      <div className="w-full max-w-md cyber-card border-white/5 bg-slate-950/40 backdrop-blur-3xl p-10 space-y-8 text-center relative overflow-hidden group">
        {/* Animated Background Decor */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse" />

        <div className="space-y-4 relative">
          <div className="h-20 w-20 rounded-3xl bg-linear-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 transition-transform group-hover:scale-110">
            <Icons.creditCard className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-1">
             <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Secure Uplink</h1>
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">Tier Authorization Portal</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Target Tier</span>
              <span className="text-primary italic">{planId} Node</span>
           </div>
           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Transaction ID</span>
              <span className="text-white">{transactionId}</span>
           </div>
           <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-white">System Cost</span>
              <span className="text-2xl font-black text-white">$0.00</span>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
           <Button 
            disabled={isProcessing}
            onClick={() => handleAction(true)}
            className="h-12 bg-emerald-500 text-white hover:bg-emerald-400 font-black uppercase tracking-[0.2em] text-[11px] rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
           >
             {isProcessing ? <Icons.refreshCw className="h-4 w-4 animate-spin mr-2" /> : <Icons.check className="h-4 w-4 mr-2" />}
             Authorize Success
           </Button>
           <Button 
            disabled={isProcessing}
            variant="outline"
            onClick={() => handleAction(false)}
            className="h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 font-black uppercase tracking-[0.2em] text-[11px] rounded-xl transition-all"
           >
             Reject Transaction
           </Button>
        </div>

        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
          This is a simulated secure transaction environment. No actual currency will be debited from your account. 
          System authorization will be persisted locally.
        </p>
      </div>
    </div>
  )
}
