"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { signIn } from "next-auth/react"
import { User, Channel } from "@/schemas"
import { updateGeneralSettings } from "@/app/dashboard/settings/actions"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { createCheckoutSession, createPortalSession } from "@/app/dashboard/settings/billing-actions"
import { inviteTeamMember, getTeamMembers } from "@/app/dashboard/settings/actions"

interface SettingsManagerProps {
  initialUser?: User
  initialChannels?: Channel[]
}

export function SettingsManager({ initialUser, initialChannels = [] }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState("account")
  const [isSaving, setIsSaving] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [team, setTeam] = useState<Array<{ id: string; role: string; member: { name: string | null; email: string | null } }>>([])
  const [formData, setFormData] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
  })

  useEffect(() => {
    if (activeTab === "team") {
      getTeamMembers().then(setTeam).catch(console.error)
    }
  }, [activeTab])

  const tabs = [
    { id: "account", label: "Account", icon: Icons.user },
    { id: "team", label: "Team", icon: Icons.users },
    { id: "youtube", label: "YouTube", icon: Icons.youtube },
    { id: "billing", label: "Billing", icon: Icons.creditCard },
    { id: "notifications", label: "Alerts", icon: Icons.bell },
    { id: "api", label: "Protocol", icon: Icons.shield },
  ]

  const handleApply = async () => {
    setIsSaving(true)
    try {
      await updateGeneralSettings({ name: formData.name })
      toast.success("System parameters updated")
    } catch {
      toast.error("Update failed")
    } finally {
      setIsSaving(false)
    }
  }

  const renderAccountSettings = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-2xl bg-muted/30 border border-border">
        <div className="h-32 w-32 rounded-3xl bg-background border border-border overflow-hidden relative group">
          {initialUser?.image ? (
            <img src={initialUser.image} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Icons.user className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Icons.camera className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h4 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">{initialUser?.name}</h4>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">{initialUser?.email}</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
             <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">
               Rank: Commander
             </div>
             <div className="px-3 py-1.5 rounded-lg bg-muted border border-border text-[9px] font-black text-foreground uppercase tracking-widest">
               ID: {initialUser?.id.slice(0, 8)}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-muted/50 border border-border rounded-xl px-4 h-12 text-sm font-bold uppercase focus:border-primary/50 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Interface Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full bg-muted/20 border border-border rounded-xl px-4 h-12 text-sm font-medium text-muted-foreground outline-none cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  )

  const [channelSearch, setChannelSearch] = useState("")
  const filteredChannels = initialChannels.filter(c => 
    c.channelName?.toLowerCase().includes(channelSearch.toLowerCase())
  )

  const renderYouTubeSettings = () => (
    <div className="space-y-8">
      <div className="p-8 rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 border border-primary/20 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-background flex items-center justify-center border border-border shadow-xl">
            <Icons.youtube className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h4 className="text-lg font-black text-foreground uppercase tracking-tight italic">Global Command Integration</h4>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
              {initialChannels.length} Linked Nodes • {initialChannels.reduce((acc, c) => acc + (c.subscriberCount || 0), 0).toLocaleString()} Total Units
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative group hidden md:block">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search Nodes..."
              value={channelSearch}
              onChange={(e) => setChannelSearch(e.target.value)}
              className="bg-background/50 border border-border rounded-xl pl-9 pr-4 h-10 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 w-48"
            />
          </div>
          <Button 
            onClick={() => signIn("google", { callbackUrl: "/dashboard/settings" })}
            className="h-10 rounded-xl px-6 text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20"
          >
            Authorize New Node
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredChannels.map((channel) => (
          <div key={channel.id} className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="h-12 w-12 rounded-xl bg-background border border-border overflow-hidden shrink-0">
                {channel.thumbnailUrl && <img src={channel.thumbnailUrl} alt={channel.channelName || "Node"} className="h-full w-full object-cover" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-foreground uppercase tracking-tight italic truncate">{channel.channelName || "Unnamed Node"}</p>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">{channel.subscriberCount?.toLocaleString() || 0} Sub-units</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                <Icons.settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTeamSettings = () => (
    <div className="space-y-8">
      <div className="p-8 rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 border border-primary/20 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-background flex items-center justify-center border border-border shadow-xl">
            <Icons.users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-black text-foreground uppercase tracking-tight italic">Team Orchestration</h4>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
              Invite operative units to assist in content deployment.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <input 
              type="email" 
              placeholder="Unit Email..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-background/50 border border-border rounded-xl px-4 h-10 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 w-64"
            />
          </div>
          <Button 
            onClick={async () => {
              setIsSaving(true)
              try {
                await inviteTeamMember(inviteEmail)
                toast.success("Unit invitation transmitted")
                setInviteEmail("")
                const updatedTeam = await getTeamMembers()
                setTeam(updatedTeam as Array<{ id: string; role: string; member: { name: string | null; email: string | null } }>)
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Invitation failed"
                toast.error(message)
              } finally {
                setIsSaving(false)
              }
            }}
            disabled={isSaving || !inviteEmail}
            className="h-10 rounded-xl px-6 text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20"
          >
            Deploy Invite
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {team.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-2xl">
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">No operative units assigned</p>
          </div>
        ) : (
          team.map((member) => (
            <div key={member.id} className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                  <Icons.user className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-foreground uppercase tracking-tight italic truncate">{member.member?.name || "Unknown Unit"}</p>
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">{member.member?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-2 py-1 rounded bg-muted border border-border text-[8px] font-black uppercase tracking-widest text-primary">
                  {member.role}
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-400">
                  <Icons.trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderBillingSettings = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: "alpha", name: "Alpha", price: "0", features: ["1 Channel", "5 Uploads/mo", "720p Rendering"], current: true },
          { id: "pro", name: "Pro", price: "29", features: ["5 Channels", "Unlimited Uploads", "4K Rendering", "AI Auto-Cut"], current: false },
          { id: "fleet", name: "Fleet", price: "99", features: ["Unlimited Channels", "Priority Queue", "AI Super-Res", "Team Access"], current: false }
        ].map((plan) => (
          <div key={plan.name} className={cn(
            "p-6 rounded-2xl border transition-all relative flex flex-col justify-between h-full group",
            plan.current ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" : "bg-muted/30 border-border hover:border-primary/30"
          )}>
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                Active Node
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest italic">{plan.name} Tier</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground">${plan.price}</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">/mo</span>
                </div>
              </div>
              <ul className="space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-tight text-muted-foreground">
                    <Icons.check className="h-3 w-3 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Button 
              variant={plan.current ? "secondary" : "default"}
              disabled={plan.current || isSaving}
              onClick={async () => {
                if (plan.current) return
                setIsSaving(true)
                try {
                  const { url } = await createCheckoutSession(plan.id as "alpha" | "pro" | "fleet")
                  if (url) window.location.href = url
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : "Failed to initiate checkout"
                  toast.error(message)
                } finally {
                  setIsSaving(false)
                }
              }}
              className={cn(
                "mt-8 w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                !plan.current && "bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20"
              )}
            >
              {plan.current ? "Current Plan" : "Upgrade Node"}
            </Button>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
             <Icons.creditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Payment Method</p>
            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">Visa ending in 4242</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={async () => {
            setIsSaving(true)
            try {
              const { url } = await createPortalSession()
              if (url) window.location.href = url
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : "No subscription found"
              toast.error(message)
            } finally {
              setIsSaving(false)
            }
          }}
          className="h-9 rounded-xl border-border bg-muted/50 text-[9px] font-black uppercase tracking-widest"
        >
          Manage in Stripe
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none italic">System Config</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Operational Preferences • Global Tuning</p>
          </div>
        </div>
        <Button 
          onClick={handleApply}
          disabled={isSaving}
          className="h-11 bg-primary text-white hover:opacity-90 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
        >
          {isSaving ? <Icons.refreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Icons.save className="h-4 w-4 mr-2" />}
          Commit Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-3 cyber-card border-border bg-card/50 h-fit">
          <CardContent className="p-3">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 relative group",
                    activeTab === tab.id
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {activeTab === tab.id && <motion.div layoutId="tab-active" className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full" />}
                  <tab.icon className={cn("h-4 w-4 transition-colors", activeTab === tab.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <Card className="lg:col-span-9 cyber-card border-border bg-card/50 overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/30 px-8 py-6">
            <CardTitle className="text-sm font-black text-foreground uppercase tracking-[0.3em] italic">
              {tabs.find(tab => tab.id === activeTab)?.label} Command
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "account" && renderAccountSettings()}
                {activeTab === "team" && renderTeamSettings()}
                {activeTab === "youtube" && renderYouTubeSettings()}
                {activeTab === "billing" && renderBillingSettings()}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Global Alerts</p>
                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">System-wide operational notifications</p>
                      </div>
                      <div className="h-6 w-11 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border opacity-50">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Email Uplink</p>
                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">Critical failure reports via SMTP</p>
                      </div>
                      <div className="h-6 w-11 bg-muted rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 h-4 w-4 bg-slate-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "api" && (
                  <div className="space-y-6">
                     <div className="p-6 rounded-xl bg-muted/30 border border-border space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Integration Protocol</h4>
                        <div className="space-y-2">
                           <p className="text-[9px] text-muted-foreground font-bold uppercase">YouTube API Status</p>
                           <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                              <span className="text-[10px] font-black text-foreground uppercase tracking-tight">Operational • v3 Protocol</span>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
