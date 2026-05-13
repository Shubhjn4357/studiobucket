"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { signIn } from "next-auth/react"
import { User, Channel } from "@/schemas"
import { updateGeneralSettings } from "@/app/dashboard/settings/actions"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { createCheckoutSession, createPortalSession } from "@/app/dashboard/settings/billing-actions"
import { inviteTeamMember, getTeamMembers } from "@/app/dashboard/settings/actions"
import { updateUserSettingsAction } from "@/app/dashboard/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

  const [prefs, setPrefs] = useState({
    globalAlerts: true,
    emailNotifications: false,
    autoSync: true
  })

  useEffect(() => {
    if (activeTab === "team") {
      getTeamMembers().then(setTeam).catch(console.error)
    }
  }, [activeTab])

  const tabs = [
    { id: "account", label: "Profile", icon: Icons.user },
    { id: "youtube", label: "Channels", icon: Icons.youtube },
    { id: "team", label: "Team", icon: Icons.users },
    { id: "billing", label: "Billing", icon: Icons.creditCard },
    { id: "notifications", label: "Alerts", icon: Icons.bell },
    { id: "security", label: "Security", icon: Icons.shield },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (activeTab === "account") {
        await updateGeneralSettings({ name: formData.name })
      } else if (activeTab === "notifications") {
        await updateUserSettingsAction({
          notifications: JSON.stringify(prefs)
        })
      }
      toast.success("Settings updated")
    } catch {
      toast.error("Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }

  const renderAccount = () => (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-card border border-border shadow-sm">
         <div className="relative group shrink-0">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-[1.5rem] md:rounded-[2rem] border-2 border-border shadow-xl">
               <AvatarImage src={initialUser?.image || ""} />
               <AvatarFallback className="bg-primary/5 text-primary text-2xl md:text-3xl font-black">
                 {initialUser?.name?.charAt(0) || "U"}
               </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-[2px] cursor-pointer">
               <Icons.camera className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
         </div>
         <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase italic tracking-tight">{initialUser?.name}</h2>
            <p className="text-sm font-medium text-muted-foreground opacity-70">{initialUser?.email}</p>
            <div className="flex flex-wrap gap-2 pt-3 justify-center md:justify-start">
               <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                 {initialUser?.plan?.toUpperCase() || "FREE"} Plan
               </span>
               <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border">
                 ID: {initialUser?.id?.slice(0, 8) || "GUEST"}
               </span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Display Name</Label>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-card border-border px-6 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Email Address</Label>
          <Input 
            value={formData.email}
            disabled
            className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-muted/30 border-border px-6 cursor-not-allowed opacity-50"
          />
        </div>
      </div>
    </div>
  )

  const renderYouTube = () => (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-red-500/5 border border-red-500/10">
         <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
               <Icons.youtube className="h-8 w-8 text-white" />
            </div>
            <div>
               <h3 className="text-lg md:text-xl font-black text-foreground uppercase italic tracking-tight">Channel Manager</h3>
               <p className="text-xs text-muted-foreground opacity-70">{initialChannels.length} platforms connected</p>
            </div>
         </div>
         <Button 
           onClick={() => signIn("google", { callbackUrl: "/dashboard/settings" })}
           className="w-full md:w-auto h-12 rounded-xl px-8 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-500/10"
         >
           Connect New
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {initialChannels.length === 0 ? (
          <div className="md:col-span-2 py-20 flex flex-col items-center justify-center border border-dashed border-border rounded-[2rem] opacity-30">
             <Icons.video className="h-12 w-12 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">No channels integrated</p>
          </div>
        ) : (
          initialChannels.map((channel) => (
            <Card key={channel.id} className="bg-card border-border rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group hover:border-primary/20 transition-all shadow-sm">
               <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                     <Avatar className="h-14 w-14 rounded-2xl border border-border shadow-inner">
                        <AvatarImage src={channel.thumbnailUrl || ""} />
                        <AvatarFallback className="bg-muted text-muted-foreground font-black">{channel.channelName?.charAt(0)}</AvatarFallback>
                     </Avatar>
                     <div className="min-w-0">
                        <p className="text-sm font-black text-foreground truncate uppercase tracking-tight">{channel.channelName}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">
                          {(channel.subscriberCount || 0).toLocaleString()} Subs
                        </p>
                     </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                     <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Operational</span>
                     </div>
                     <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted transition-all">
                        <Icons.settings className="h-4 w-4" />
                     </Button>
                  </div>
               </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  const renderTeam = () => (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-primary/5 border border-primary/10">
         <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-lg md:text-xl font-black text-foreground uppercase italic tracking-tight">Team Fleet</h3>
            <p className="text-xs text-muted-foreground opacity-70">Delegate content control to trusted collaborators.</p>
         </div>
         <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Input 
              placeholder="Collaborator email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="h-12 rounded-xl bg-card border-border min-w-0 sm:min-w-[240px]"
            />
            <Button 
              onClick={async () => {
                setIsSaving(true)
                try {
                  await inviteTeamMember(inviteEmail)
                  toast.success("Request transmitted")
                  setInviteEmail("")
                  const updatedTeam = await getTeamMembers()
                  setTeam(updatedTeam as any)
                } catch (err: any) {
                  toast.error(err.message || "Transmission failed")
                } finally {
                  setIsSaving(false)
                }
              }}
              disabled={isSaving || !inviteEmail}
              className="w-full sm:w-auto h-12 rounded-xl px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/10"
            >
              Invite
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {team.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center border border-dashed border-border rounded-[2rem] opacity-30">
             <Icons.users className="h-12 w-12 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">No active collaborators</p>
          </div>
        ) : (
          team.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-card border border-border group hover:border-primary/20 transition-all">
               <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                     <Icons.user className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground/30" />
                  </div>
                  <div className="min-w-0">
                     <p className="text-sm font-black text-foreground uppercase tracking-tight truncate">{member.member?.name || "Pending Authorization"}</p>
                     <p className="text-[10px] text-muted-foreground font-bold truncate opacity-60">{member.member?.email}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 md:gap-6 shrink-0">
                  <span className="hidden sm:inline-block text-[9px] font-black px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-widest border border-primary/10">
                    {member.role}
                  </span>
                  <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all">
                     <Icons.trash2 className="h-4 w-4" />
                  </Button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderBilling = () => (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {[
          { id: "alpha", name: "Alpha", price: "0", features: ["1 Channel", "Basic Export", "Standard Support"], current: initialUser?.plan === "alpha" },
          { id: "pro", name: "Creator Pro", price: "29", features: ["5 Channels", "4K HDR Support", "Team Access"], current: initialUser?.plan === "pro" },
          { id: "fleet", name: "Elite", price: "99", features: ["Unlimited Channels", "Dedicated API", "24/7 Priority"], current: initialUser?.plan === "fleet" }
        ].map((plan) => (
          <Card key={plan.id} className={cn(
            "rounded-[2rem] md:rounded-[2.5rem] border overflow-hidden flex flex-col transition-all h-full group",
            plan.current ? "bg-primary/5 border-primary shadow-xl shadow-primary/5 ring-1 ring-primary/20" : "bg-card border-border hover:border-primary/20"
          )}>
            <div className="p-8 space-y-8 flex-1">
               <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{plan.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-foreground tracking-tighter tabular-nums">${plan.price}</span>
                    <span className="text-xs text-muted-foreground font-bold">/mo</span>
                  </div>
               </div>
               <Separator className="bg-border/50" />
               <ul className="space-y-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-xs font-bold text-foreground/80">
                       <Icons.check className="h-4 w-4 text-primary shrink-0" />
                       {f}
                    </li>
                  ))}
               </ul>
            </div>
            <div className="p-6 bg-muted/10 border-t border-border">
               <Button 
                 disabled={plan.current || isSaving}
                 onClick={async () => {
                    setIsSaving(true)
                    try {
                      const { url } = await createCheckoutSession(plan.id as any)
                      if (url) window.location.href = url
                    } catch (err: any) {
                      toast.error("Process aborted")
                    } finally {
                      setIsSaving(false)
                    }
                 }}
                 className={cn(
                   "w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                   plan.current ? "bg-muted text-muted-foreground cursor-default" : "bg-primary text-white shadow-xl shadow-primary/10 hover:scale-[1.02]"
                 )}
               >
                 {plan.current ? "Current Node" : "Upgrade Link"}
               </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-card border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
               <Icons.creditCard className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div className="space-y-1 text-center md:text-left">
               <p className="text-sm md:text-base font-black text-foreground uppercase tracking-tight">Billing Registry</p>
               <p className="text-xs text-muted-foreground font-medium opacity-70">Manage payment encryption and history.</p>
            </div>
         </div>
         <Button 
           variant="outline"
           onClick={async () => {
              setIsSaving(true)
              try {
                const { url } = await createPortalSession()
                if (url) window.location.href = url
              } catch (err: any) {
                toast.error("Portal access denied")
              } finally {
                setIsSaving(false)
              }
           }}
           className="w-full md:w-auto h-12 rounded-xl px-10 border-border hover:bg-muted font-black text-[10px] uppercase tracking-widest transition-all"
         >
           Access Portal
         </Button>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[
            { id: "globalAlerts", label: "Global Telemetry", desc: "Push alerts for critical events.", icon: Icons.bell },
            { id: "emailNotifications", label: "Log Transmissions", desc: "Receive reports via direct link.", icon: Icons.mail },
            { id: "autoSync", label: "Real-time Sync", desc: "Automated data reconciliation.", icon: Icons.refreshCw }
          ].map((pref) => (
            <Card key={pref.id} className="bg-card border-border rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm group hover:border-primary/20 transition-all">
               <CardContent className="p-6 md:p-8 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 md:gap-5 min-w-0">
                     <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                        <pref.icon className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-xs md:text-sm font-black text-foreground uppercase tracking-tight truncate">{pref.label}</p>
                        <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 opacity-60">{pref.desc}</p>
                     </div>
                  </div>
                  <Switch 
                    checked={prefs[pref.id as keyof typeof prefs]}
                    onCheckedChange={(val) => setPrefs(prev => ({ ...prev, [pref.id]: val }))}
                    className="data-[state=checked]:bg-primary"
                  />
               </CardContent>
            </Card>
          ))}
       </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mt-4 md:mt-8">
      {/* Sidebar Navigation - Responsive */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] p-2 md:p-4 shadow-sm h-fit lg:sticky lg:top-32 overflow-hidden">
          <div className="px-4 py-3 hidden lg:block border-b border-border/50 mb-2">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Configuration</span>
          </div>
          
          {/* Scrollable Tabs for Mobile, Vertical for Desktop */}
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar p-1 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-none lg:w-full flex items-center gap-3 md:gap-4 px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-left transition-all relative group shrink-0",
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className={cn(
                  "h-4 w-4 md:h-5 md:w-5 transition-all", 
                  activeTab === tab.id ? "text-white" : "opacity-40 group-hover:opacity-100"
                )} />
                <span className="text-[11px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
                {activeTab === tab.id && (
                   <motion.div layoutId="settings-tab-active" className="hidden lg:block absolute right-3 h-1.5 w-1.5 rounded-full bg-white shadow-xl" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9">
         <Card className="bg-card border-border rounded-[2rem] md:rounded-[3rem] shadow-sm overflow-hidden flex flex-col min-h-[500px] md:min-h-[700px]">
            <div className="px-6 md:px-10 py-5 md:py-8 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
               <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-lg md:text-xl font-black text-foreground uppercase italic tracking-tight">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                  <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">System configuration protocols</p>
               </div>
               <Button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="w-full sm:w-auto h-11 md:h-12 rounded-xl md:rounded-2xl px-8 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95"
               >
                 {isSaving ? <Icons.refreshCw className="h-4 w-4 animate-spin mr-2" /> : <Icons.save className="h-4 w-4 mr-2" />}
                 Update Profile
               </Button>
            </div>

            <ScrollArea className="flex-1">
               <div className="p-6 md:p-12">
                 <AnimatePresence mode="wait">
                   <motion.div
                     key={activeTab}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     transition={{ duration: 0.3 }}
                   >
                     {activeTab === "account" && renderAccount()}
                     {activeTab === "youtube" && renderYouTube()}
                     {activeTab === "team" && renderTeam()}
                     {activeTab === "billing" && renderBilling()}
                     {activeTab === "notifications" && renderNotifications()}
                     {activeTab === "security" && (
                       <div className="py-20 md:py-32 text-center border border-dashed border-border rounded-[2rem] md:rounded-[2.5rem] bg-muted/10 opacity-30 px-6">
                          <Icons.shield className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-6" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">Advanced security protocols are active for this account.</p>
                       </div>
                     )}
                   </motion.div>
                 </AnimatePresence>
               </div>
            </ScrollArea>
         </Card>
      </div>
    </div>
  )
}
