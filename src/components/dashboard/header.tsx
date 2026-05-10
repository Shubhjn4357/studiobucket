"use client"

import { useState } from "react"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const notifications = [
    { id: 1, title: "System Ready", description: "Node synchronized with YouTube API.", time: "2m ago", icon: Icons.checkCircle, color: "text-emerald-500" },
    { id: 2, title: "Engine Alert", description: "Processing task #451 completed.", time: "15m ago", icon: Icons.zap, color: "text-primary" },
  ]

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/dashboard/content?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
            <Icons.search className="absolute left-3.5 h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            <Input
              type="search"
              placeholder="Search repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-muted/50 border-border pl-10 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        
        {/* Help Center */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Icons.helpCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">Operational Support</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
                Mission critical documentation and protocol guidance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-muted border border-border group hover:border-primary/30 transition-all cursor-pointer">
                 <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <Icons.book className="h-4 w-4 text-primary" />
                   Field Manual
                 </h4>
                 <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">Comprehensive guide on automation orchestration.</p>
              </div>
              <div className="p-4 rounded-xl bg-muted border border-border group hover:border-primary/30 transition-all cursor-pointer">
                 <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <Icons.messageSquare className="h-4 w-4 text-primary" />
                   Support Channel
                 </h4>
                 <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">Direct uplink to the core development unit.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted relative transition-colors">
              <Icons.bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-border p-2 mt-2" align="end">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Operational Intelligence</p>
            </div>
            <div className="p-1 space-y-1">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className={cn("h-7 w-7 rounded-lg bg-background border border-border flex items-center justify-center shrink-0", n.color)}>
                      <n.icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-tight text-foreground">{n.title}</p>
                      <p className="text-[9px] text-muted-foreground font-medium tracking-tight line-clamp-2">{n.description}</p>
                      <p className="text-[8px] text-primary font-bold uppercase tracking-widest mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground mt-1">
              Clear Signal
            </Button>
          </PopoverContent>
        </Popover>

        {/* YT Style Create Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-10 bg-muted hover:bg-muted-foreground/10 border border-border text-[10px] font-black uppercase tracking-widest rounded-xl px-4 gap-2 hidden sm:flex transition-all">
              <Icons.video className="h-4 w-4 text-primary" />
              Create
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-card border-border p-2">
            <DropdownMenuItem 
              onClick={() => router.push("/dashboard/upload")}
              className="focus:bg-muted cursor-pointer rounded-lg gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest"
            >
              <Icons.upload className="h-4 w-4 text-primary" />
              Upload Video
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push("/dashboard/studio")}
              className="focus:bg-muted cursor-pointer rounded-lg gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest"
            >
              <Icons.zap className="h-4 w-4 text-primary" />
              Studio Editor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 md:w-auto md:px-3 md:gap-3 rounded-xl hover:bg-muted border border-border transition-all group">
              <Avatar className="h-7 w-7 border border-border group-hover:border-primary/30 transition-colors">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black uppercase">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-[10px] font-black text-foreground leading-none tracking-widest uppercase italic">{session?.user?.name}</span>
                <span className="text-[8px] text-primary font-bold tracking-[0.2em] uppercase mt-0.5">Content Commander</span>
              </div>
              <Icons.chevronDown className="hidden md:block h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-card border-border mt-2 p-2" align="end">
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-2">
                <p className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none italic">{session?.user?.name}</p>
                <p className="text-[9px] text-muted-foreground font-medium leading-none tracking-wider">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <div className="p-1">
              <Link href="/dashboard/settings">
                <DropdownMenuItem className="focus:bg-muted cursor-pointer rounded-lg gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest">
                  <Icons.user className="h-4 w-4 text-primary" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/settings">
                <DropdownMenuItem className="focus:bg-muted cursor-pointer rounded-lg gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest">
                  <Icons.settings className="h-4 w-4 text-primary" />
                  Settings
                </DropdownMenuItem>
              </Link>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <div className="p-1">
              <DropdownMenuItem 
                className="text-primary focus:bg-primary/10 cursor-pointer rounded-lg gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest"
                onClick={() => signOut()}
              >
                <Icons.logOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
