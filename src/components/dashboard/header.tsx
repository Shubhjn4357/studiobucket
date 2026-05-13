"use client"

import { useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navLinks = [
    { title: "Channels", href: "/dashboard/channels", icon: Icons.users },
    { title: "Queue", href: "/dashboard/queue", icon: Icons.refreshCw },
    { title: "Library", href: "/dashboard/content", icon: Icons.list },
    { title: "Calendar", href: "/dashboard/schedule", icon: Icons.calendar },
  ]

  return (
    <header className="sticky top-0 z-40 flex h-16 md:h-20 w-full items-center justify-between px-4 md:px-10 bg-background/60 backdrop-blur-xl border-b border-border/50 transition-all">
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10 lg:hidden rounded-xl hover:bg-primary/5 transition-all"
        >
          <Icons.menu className="h-6 w-6" />
        </Button>
        
        <div className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "font-black text-[10px] uppercase tracking-widest rounded-xl h-10 px-4 transition-all",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/[0.03] hover:text-primary"
                  )}
                >
                  {link.title}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex-1 max-w-lg px-6 hidden md:flex">
        <form onSubmit={handleSearch} className="w-full relative group">
          <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search assets, metadata, or jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/20 border-border rounded-xl md:rounded-2xl pl-11 pr-4 h-10 md:h-12 text-xs font-medium focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1.5 pr-2 md:pr-4 border-r border-border/50">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9 md:h-11 md:w-11 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
            <Icons.bell className="h-5 w-5" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 md:h-12 pl-1 pr-1 md:pr-4 rounded-[1rem] md:rounded-[1.25rem] hover:bg-primary/[0.03] transition-all border border-transparent hover:border-border/50 gap-3">
              <Avatar className="h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl border border-border shadow-sm">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left leading-none hidden lg:flex">
                <span className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">{session?.user?.name?.split(' ')[0]}</span>
                <span className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em] mt-1">Creator</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-3 mt-3 rounded-[1.5rem] border-border shadow-2xl">
            <div className="flex items-center gap-4 p-3 bg-primary/[0.03] rounded-2xl mb-2 border border-primary/5">
              <Avatar className="h-10 w-10 rounded-xl border border-border">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-black">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="font-black text-xs uppercase tracking-tight text-foreground truncate">{session?.user?.name}</span>
                <span className="text-[10px] font-medium text-muted-foreground truncate">{session?.user?.email}</span>
              </div>
            </div>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="gap-3 p-3 rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary transition-all">
              <Icons.settings className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-border/50" />
            <DropdownMenuItem onClick={() => signOut()} className="gap-3 p-3 rounded-xl cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500 transition-all">
              <Icons.logOut className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
