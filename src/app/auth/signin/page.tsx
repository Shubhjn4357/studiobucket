"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function SignInContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    await signIn("google", { callbackUrl })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="absolute -inset-0.5 bg-linear-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl blur opacity-20 animate-pulse" />
        <Card className="w-full cyber-card border-white/5 bg-slate-950/60 backdrop-blur-3xl shadow-2xl">
          <CardHeader className="text-center space-y-6 pt-12 pb-8">
            <div className="flex justify-center">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-20 w-20 rounded-[28px] bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_40px_-10px_rgba(255,0,0,0.5)] border border-white/20"
              >
                <Icons.logo className="h-10 w-10 text-white" />
              </motion.div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Studio Access</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                New users will be registered automatically upon connection.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-10 pb-12">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
              >
                <Icons.alertCircle className="h-4 w-4 mx-auto mb-2" />
                Access Denied: {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
              <Button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full h-14 bg-white text-black hover:bg-slate-200 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl group"
              >
                {isLoading ? (
                  <Icons.refreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Icons.google className="h-5 w-5 transition-transform group-hover:scale-110" />
                    Authorize with Google
                  </>
                )}
              </Button>
              <p className="text-[9px] text-center text-slate-600 font-black uppercase tracking-[0.2em]">
                Grant <span className="text-primary italic">Youtube.Upload</span> Permissions
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[8px] uppercase font-black">
                <span className="bg-[#0a0a0a] px-4 text-slate-700 tracking-[0.5em]">Encrypted Handshake</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-[10px] font-black text-white uppercase italic">99.9%</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Uptime</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-[10px] font-black text-white uppercase italic">AES-256</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Security</p>
              </div>
            </div>

            <p className="text-[9px] text-center text-slate-600 font-medium uppercase tracking-[0.15em] leading-relaxed">
              By initializing session, you agree to our <br/>
              <span className="text-slate-400 hover:text-white cursor-pointer transition-colors border-b border-slate-800">Operational Protocols</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Icons.refreshCw className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
