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
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between px-4 bg-background border-b border-border">
      {/* Left section: Menu & Logo */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-surface-hover"
        >
          <Icons.menu className="h-6 w-6" />
        </Button>
        <Link href="/dashboard" className="flex items-center gap-1">
          <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
            <Icons.logo className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold tracking-tighter italic hidden sm:block">StudioBucket</span>
        </Link>
      </div>

      {/* Center section: Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-[640px] px-4 hidden md:flex items-center">
        <div className="flex w-full group">
          <div className="relative flex-1">
             <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground" />
             <Input
               type="text"
               placeholder="Search videos and assets..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-surface border border-border rounded-l-full pl-11 pr-4 h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30"
             />
          </div>
          <Button 
            type="submit" 
            className="bg-surface border border-l-0 border-border rounded-r-full px-5 h-10 hover:bg-surface-hover transition-colors"
            variant="ghost"
          >
            <Icons.search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-surface-hover rounded-full">
               <Icons.video className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background border-border">
            <DropdownMenuItem onClick={() => router.push("/dashboard/upload")} className="gap-3 py-2 cursor-pointer">
              <Icons.upload className="h-4 w-4" />
              <span>Upload video</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/studio")} className="gap-3 py-2 cursor-pointer">
              <Icons.zap className="h-4 w-4" />
              <span>Studio editor</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-surface-hover rounded-full relative">
               <Icons.bell className="h-5 w-5" />
               <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-background border-border" align="end">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground italic">
               No new notifications.
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full p-1 ml-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-background border-border p-2">
            <div className="flex items-center gap-3 p-3">
               <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{session?.user?.name}</span>
                <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="gap-3 py-2 cursor-pointer">
              <Icons.user className="h-4 w-4" />
              <span>Manage account</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings#billing")} className="gap-3 py-2 cursor-pointer">
              <Icons.creditCard className="h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="gap-3 py-2 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500">
              <Icons.logOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
