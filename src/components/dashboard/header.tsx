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
    <header className="sticky top-0 z-40 flex h-10 w-full items-center justify-between px-3 bg-background border-b border-border relative overflow-hidden shrink-0">
      <div className="absolute inset-0 tactical-grid pointer-events-none opacity-5" />

      {/* Left section: System Identity */}
      <div className="flex items-center gap-3 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-7 w-7 rounded-sm border border-border/40 hover:bg-primary/5 hover:text-primary transition-all group"
        >
          <Icons.menu className="h-3 w-3" />
        </Button>
        <div className="h-4 w-px bg-border/50 mx-1 hidden sm:block" />
        <div className="hidden md:flex items-center gap-2">
           <div className="flex flex-col leading-none">
              <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em] italic leading-none">System_Core</span>
              <span className="text-[9px] font-black text-foreground uppercase tracking-tight italic leading-none">Command_Studio</span>
           </div>
        </div>
      </div>

      {/* Center section: Registry Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-[400px] px-6 hidden lg:flex items-center relative z-10">
        <div className="flex w-full group relative">
           <Icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
           <Input
             type="text"
             placeholder="REGISTRY_QUERY_INPUT..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-muted/20 border-border rounded-sm pl-8 pr-4 h-6 text-[8px] font-bold uppercase tracking-widest focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all placeholder:text-muted-foreground/30 italic"
           />
        </div>
      </form>

      {/* Right section: Operational Status */}
      <div className="flex items-center gap-2 relative z-10">
        <div className="flex items-center gap-1.5 pr-2 border-r border-border/50 mr-1">
           <ThemeToggle />
           <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm bg-muted/20 border border-border/40 hover:bg-primary/5 hover:border-primary/40 group transition-all">
              <Icons.video className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
           </Button>
           <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm bg-muted/20 border border-border/40 hover:bg-primary/5 group relative transition-all">
              <Icons.bell className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
              <span className="absolute top-1 right-1 h-1 w-1 rounded-full bg-primary" />
           </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-7 pl-1.5 pr-2 rounded-sm hover:bg-muted/30 transition-all group border border-transparent hover:border-border/40">
              <Avatar className="h-5 w-5 rounded-sm border border-border/60 group-hover:border-primary/30 transition-colors">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-[7px] font-black italic">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start ml-2 text-left leading-none">
                <span className="text-[8px] font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors italic leading-none">{session?.user?.name?.split(' ')[0]}</span>
                <span className="text-[6px] font-black text-muted-foreground uppercase tracking-widest leading-none">OP_STATION_V4</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background border border-border rounded-sm p-1.5 shadow-2xl mt-1">
            <div className="flex items-center gap-3 p-2 bg-muted/20 border border-border rounded-sm mb-1.5">
               <Avatar className="h-7 w-7 rounded-sm border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black italic">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden leading-none">
                <span className="font-black text-[10px] text-foreground uppercase tracking-tight italic truncate leading-none">{session?.user?.name}</span>
                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-wider truncate leading-none mt-0.5">{session?.user?.email}</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="gap-2 px-2 py-1.5 cursor-pointer rounded-sm hover:bg-primary/5 group transition-all">
                <Icons.user className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                <span className="text-[8px] font-black uppercase text-foreground italic">Operator_Config</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50 mx-1 my-1" />
              <DropdownMenuItem onClick={() => signOut()} className="gap-2 px-2 py-1.5 cursor-pointer rounded-sm hover:bg-red-500/10 group transition-all">
                <Icons.logOut className="h-3 w-3 text-red-500/60 group-hover:text-red-500" />
                <span className="text-[8px] font-black uppercase text-red-500 italic">Terminate_Uplink</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

