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
    { title: "Queues", href: "/dashboard/queues", icon: Icons.refreshCw },
    { title: "Playlists", href: "/dashboard/playlists", icon: Icons.list },
    { title: "Community", href: "/dashboard/community", icon: Icons.users },
  ]

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b border-border transition-all">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-9 w-9 md:hidden"
        >
          <Icons.menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "font-bold text-[11px] uppercase tracking-wider rounded-lg h-9 px-4 transition-all",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {link.title}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex-1 max-w-md px-6 hidden lg:flex">
        <form onSubmit={handleSearch} className="w-full relative">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search assets and metadata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 border-border rounded-xl pl-10 pr-4 h-10 text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </form>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-4 border-r border-border mr-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
            <Icons.bell className="h-5 w-5" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 pl-1 pr-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border">
              <Avatar className="h-8 w-8 rounded-lg border border-border">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start ml-3 text-left leading-none hidden sm:flex">
                <span className="text-xs font-bold text-foreground truncate max-w-[100px]">{session?.user?.name?.split(' ')[0]}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Admin</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 mt-2">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-2">
              <Avatar className="h-10 w-10 rounded-lg border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-black">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="font-bold text-sm text-foreground truncate">{session?.user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">{session?.user?.email}</span>
              </div>
            </div>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="gap-3 p-2 rounded-md cursor-pointer">
              <Icons.settings className="h-4 w-4" />
              <span className="text-sm font-medium">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem onClick={() => signOut()} className="gap-3 p-2 rounded-md cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500">
              <Icons.logOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
