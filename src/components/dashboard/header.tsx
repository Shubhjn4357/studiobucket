"use client"

import { useState, useEffect } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
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

import { ChannelSelector } from "./channel-selector"
import { Badge } from "../ui/badge"

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
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between px-10 bg-black/40 backdrop-blur-3xl border-b border-white/5 shadow-2xl relative overflow-hidden">
      {/* HUD Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px)] bg-[size:40px_100%] pointer-events-none opacity-20" />

      {/* Left section: Menu & Logo */}
      <div className="flex items-center gap-8 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-white/5 h-12 w-12 rounded-2xl border border-transparent hover:border-white/5 transition-all"
        >
          <Icons.menu className="h-5 w-5 text-white/60" />
        </Button>
        <div className="h-8 w-px bg-white/5 mx-2 hidden sm:block" />
        <ChannelSelector />
      </div>

      {/* Center section: Search bar (The Command Line) */}
      <form onSubmit={handleSearch} className="flex-1 max-w-[700px] px-12 hidden lg:flex items-center relative z-10">
        <div className="flex w-full group relative">
           <Icons.search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors z-10" />
           <Input
             type="text"
             placeholder="Execute_Asset_Search..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-black/40 border-white/5 rounded-2xl pl-14 pr-4 h-12 text-[10px] font-black uppercase tracking-[0.3em] focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30 transition-all placeholder:text-white/10 italic text-white"
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
             <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-2 font-mono text-[9px] font-black text-white/30 uppercase">
               <span className="text-[11px]">⌘</span>K
             </kbd>
           </div>
        </div>
      </form>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-6 relative z-10">
        <div className="hidden sm:flex items-center gap-3 pr-6 border-r border-white/5">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/20 group transition-all">
                 <Icons.video className="h-5 w-5 text-white/40 group-hover:text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-black/90 backdrop-blur-3xl border-white/5 p-4 rounded-3xl shadow-2xl">
              <DropdownMenuItem onClick={() => router.push("/dashboard/upload")} className="gap-4 py-4 cursor-pointer rounded-2xl hover:bg-white/5 group transition-all">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Icons.upload className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-white italic">Injest_Asset</span>
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">New Transmission</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/studio")} className="gap-4 py-4 cursor-pointer rounded-2xl hover:bg-white/5 group transition-all mt-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Icons.zap className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-white italic">Creative_Studio</span>
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Live Workspace</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 group relative transition-all">
                 <Icons.bell className="h-5 w-5 text-white/40 group-hover:text-white" />
                 <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-8 bg-black/90 backdrop-blur-3xl border-white/5 rounded-3xl shadow-2xl mt-4" align="end">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">System_Logs</span>
                <Badge variant="outline" className="text-[8px] border-white/10 uppercase tracking-widest text-white/40">Clean</Badge>
              </div>
              <div className="py-12 text-center flex flex-col items-center gap-4">
                 <Icons.info className="h-8 w-8 text-white/5" />
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">No active interrupts detected.</span>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-14 pl-3 pr-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group">
              <Avatar className="h-8 w-8 rounded-xl border border-white/10 shadow-2xl">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start ml-4 text-left">
                <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors italic">{session?.user?.name?.split(' ')[0]}</span>
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">{session?.user?.email?.split('@')[0]}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-black/90 backdrop-blur-3xl border-white/5 p-4 rounded-[2.5rem] shadow-2xl mt-4">
            <div className="flex items-center gap-6 p-6 bg-white/3 rounded-3xl border border-white/5 mb-4">
               <Avatar className="h-14 w-14 rounded-2xl border border-white/10 shadow-2xl">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-black">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-black text-sm text-white uppercase tracking-tight italic">{session?.user?.name}</span>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{session?.user?.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="gap-4 py-4 cursor-pointer rounded-2xl hover:bg-white/5 group transition-all">
                <Icons.user className="h-5 w-5 text-white/40 group-hover:text-primary" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white italic">Operational_Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings#billing")} className="gap-4 py-4 cursor-pointer rounded-2xl hover:bg-white/5 group transition-all">
                <Icons.creditCard className="h-5 w-5 text-white/40 group-hover:text-primary" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white italic">Resource_Billing</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 mx-2 my-4" />
              <DropdownMenuItem onClick={() => signOut()} className="gap-4 py-4 cursor-pointer rounded-2xl hover:bg-red-500/10 group transition-all">
                <Icons.logOut className="h-5 w-5 text-red-500/40 group-hover:text-red-500" />
                <span className="text-[11px] font-black uppercase tracking-widest text-red-500 italic">Terminate_Session</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
