"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Icons.menu className="h-6 w-6" />
        </Button>

        {/* Global Search */}
        <div className="hidden md:flex max-w-md w-full relative group">
          <div className={cn(
            "absolute -inset-0.5 bg-linear-to-r from-primary/50 to-accent/50 rounded-xl blur opacity-0 transition duration-500",
            isSearchFocused && "opacity-20"
          )} />
          <div className="relative flex items-center w-full">
            <Icons.search className="absolute left-3.5 h-4 w-4 text-slate-500 transition-colors group-hover:text-slate-300" />
            <Input
              type="search"
              placeholder="Search videos, analytics, or tools..."
              className="w-full bg-white/5 border-white/5 pl-10 h-10 rounded-xl text-sm focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-slate-600"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <div className="absolute right-3 flex items-center gap-1">
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Quick Actions */}
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5 relative transition-colors">
            <Icons.bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <Icons.helpCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 md:w-auto md:px-3 md:gap-3 rounded-xl hover:bg-white/5 border border-white/5 transition-all group">
              <Avatar className="h-7 w-7 border border-white/10 group-hover:border-primary/30 transition-colors">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-xs font-black text-white leading-none tracking-tight uppercase">{session?.user?.name}</span>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">Owner</span>
              </div>
              <Icons.chevronDown className="hidden md:block h-3 w-3 text-slate-500 group-hover:text-white transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 glass-dark border-white/5 mt-2" align="end">
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-black text-white uppercase tracking-tighter leading-none">{session?.user?.name}</p>
                <p className="text-xs text-slate-400 font-medium leading-none">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <div className="p-1.5">
              <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/5 cursor-pointer rounded-lg gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider">
                <Icons.user className="h-4 w-4 text-primary" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/5 cursor-pointer rounded-lg gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider">
                <Icons.settings className="h-4 w-4 text-primary" />
                Channel Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/5 cursor-pointer rounded-lg gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider">
                <Icons.shield className="h-4 w-4 text-primary" />
                API Management
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-white/5" />
            <div className="p-1.5">
              <DropdownMenuItem 
                className="text-primary focus:text-white focus:bg-primary cursor-pointer rounded-lg gap-3 px-3 py-2 text-xs font-black uppercase tracking-widest"
                onClick={() => signOut()}
              >
                <Icons.logOut className="h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
