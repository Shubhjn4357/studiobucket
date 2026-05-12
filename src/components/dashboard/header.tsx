"use client"

import { useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ChannelSelector } from "./channel-selector"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between px-6 glass-morphism border-b relative overflow-hidden shrink-0">
      {/* HUD Pattern Overlay */}
      <div className="absolute inset-0 industrial-grid pointer-events-none opacity-5" />

      {/* Left section: Menu & Logo */}
      <div className="flex items-center gap-4 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-primary/10 h-10 w-10 rounded-xl border border-transparent hover:border-primary/20 transition-all group"
        >
          <Icons.menu className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        </Button>
        <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
        <ChannelSelector />
      </div>

      {/* Center section: Search bar (The Command Line) */}
      <form onSubmit={handleSearch} className="flex-1 max-w-[600px] px-8 hidden lg:flex items-center relative z-10">
        <div className="flex w-full group relative">
           <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
           <Input
             type="text"
             placeholder="Search assets, sequences, nodes..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-background/50 border-border rounded-xl pl-11 pr-4 h-11 text-[11px] font-bold uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all placeholder:text-muted-foreground/50 italic"
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none opacity-30">
              <kbd className="h-5 px-1.5 rounded border border-border bg-muted flex items-center justify-center text-[9px] font-sans font-bold">⌘</kbd>
              <kbd className="h-5 px-1.5 rounded border border-border bg-muted flex items-center justify-center text-[9px] font-sans font-bold">K</kbd>
           </div>
        </div>
      </form>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="hidden sm:flex items-center gap-3 pr-6 border-r">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-surface border hover:bg-primary/10 hover:border-primary/20 group transition-all">
                 <Icons.video className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 glass-morphism p-2 rounded-xl shadow-2xl mt-2 border-border">
              <DropdownMenuItem onClick={() => router.push("/dashboard/upload")} className="gap-4 py-3 cursor-pointer rounded-lg hover:bg-primary/10 group transition-all">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
                  <Icons.upload className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-hud text-foreground">Ingest_Asset</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">New Transmission</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/studio")} className="gap-4 py-3 cursor-pointer rounded-lg hover:bg-emerald-500/10 group transition-all mt-1">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Icons.zap className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-hud text-foreground">Creative_Studio</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Live Workspace</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-surface border hover:bg-foreground/5 group relative transition-all">
                 <Icons.bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                 <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary border-2 border-background" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-5 glass-morphism rounded-xl shadow-2xl mt-4 border-border" align="end">
              <div className="flex items-center justify-between mb-4">
                <span className="text-hud text-primary">System_Logs</span>
                <Badge variant="outline" className="text-[8px] border-primary/20 uppercase tracking-widest text-primary bg-primary/5">Nominal</Badge>
              </div>
              <div className="py-10 text-center flex flex-col items-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                    <Icons.info className="h-6 w-6 text-muted-foreground/30" />
                 </div>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] italic">No active interrupts detected.</span>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-12 pl-2 pr-4 rounded-xl hover:bg-surface transition-all group border border-transparent hover:border-border">
              <Avatar className="h-8 w-8 rounded-lg border border-border group-hover:border-primary/30 transition-colors">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start ml-3 text-left">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest group-hover:text-primary transition-colors italic">{session?.user?.name?.split(' ')[0]}</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{session?.user?.email?.split('@')[0]}</span>
              </div>
              <Icons.chevronDown className="h-3 w-3 ml-2 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 glass-morphism p-3 rounded-xl shadow-2xl mt-4 border-border">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border mb-3">
               <Avatar className="h-11 w-11 rounded-lg border border-border">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-base font-black">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="font-black text-sm text-foreground uppercase tracking-tight italic truncate">{session?.user?.name}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">{session?.user?.email}</span>
              </div>
            </div>
            <div className="space-y-1">
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="gap-4 py-3 cursor-pointer rounded-lg hover:bg-foreground/5 group transition-all">
                <Icons.user className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary" />
                <span className="text-hud text-foreground">Operational_Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings#billing")} className="gap-4 py-3 cursor-pointer rounded-lg hover:bg-foreground/5 group transition-all">
                <Icons.creditCard className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary" />
                <span className="text-hud text-foreground">Resource_Billing</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border mx-1 my-3" />
              <DropdownMenuItem onClick={() => signOut()} className="gap-4 py-3 cursor-pointer rounded-lg hover:bg-red-500/10 group transition-all">
                <Icons.logOut className="h-4.5 w-4.5 text-red-500/60 group-hover:text-red-500" />
                <span className="text-hud text-red-500">Terminate_Session</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

