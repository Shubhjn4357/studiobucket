"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { cn } from "@/lib/utils"

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden transition-colors duration-500">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <Card className="w-full bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="text-center space-y-6 pt-12 pb-8">
            <div className="flex justify-center">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20"
              >
                <Icons.logo className="h-10 w-10 text-primary-foreground" />
              </motion.div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Studio Access</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] px-8">
                Automate your YouTube content pipeline with mission-critical precision.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-10 pb-12">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest text-center"
              >
                <Icons.alertCircle className="h-4 w-4 mx-auto mb-2" />
                Access Denied: {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
              <Button 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                {isLoading ? (
                  <Icons.refreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Icons.google className="h-5 w-5" />
                    Sign in with Google
                  </>
                )}
              </Button>
              <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-[0.2em]">
                Secure OAuth 2.0 Authorization
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-[8px] uppercase font-black">
                <span className="bg-card px-4 text-muted-foreground tracking-[0.5em]">Verified Connection</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center">
                <p className="text-xs font-black text-foreground uppercase italic">99.9%</p>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Uptime</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center">
                <p className="text-xs font-black text-foreground uppercase italic">SSL</p>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Secured</p>
              </div>
            </div>

            <p className="text-[9px] text-center text-muted-foreground font-medium uppercase tracking-[0.15em] leading-relaxed">
              By accessing the studio, you agree to our <br/>
              <span className="text-foreground border-b border-muted-foreground/30 hover:border-primary transition-colors cursor-pointer">Terms of Operation</span>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icons.refreshCw className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
