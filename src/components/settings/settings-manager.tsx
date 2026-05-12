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
import {  updateUserSettingsAction } from "@/app/dashboard/actions"
import Image from "next/image"

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
    emailUplink: false,
    protocolV3: true
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
      if (activeTab === "account") {
        await updateGeneralSettings({ name: formData.name })
      } else if (activeTab === "notifications" || activeTab === "api") {
        await updateUserSettingsAction({
          notifications: JSON.stringify({ globalAlerts: prefs.globalAlerts, emailUplink: prefs.emailUplink }),
          apiSettings: JSON.stringify({ protocolV3: prefs.protocolV3 })
        })
      }
      toast.success("System parameters committed")
    } catch {
      toast.error("Commit sequence failed")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const renderAccountSettings = () => (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row items-center gap-12 p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.02))] pointer-events-none" />
        <div className="h-48 w-48 rounded-[2.5rem] bg-black border border-white/10 overflow-hidden relative group/avatar cursor-pointer shadow-2xl shrink-0">
          {initialUser?.image ? (
            <Image 
              src={initialUser.image} 
              alt="Avatar" 
              width={192}
              height={192}
              className="h-full w-full object-cover opacity-60 group-hover/avatar:opacity-100 transition-all duration-700" 
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-white/[0.02]">
              <Icons.user className="h-20 w-20 text-white/5" />
            </div>
          )}
          <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
            <Icons.camera className="h-10 w-10 text-white scale-75 group-hover/avatar:scale-100 transition-transform duration-500" />
          </div>
        </div>
        <div className="flex-1 space-y-8 text-center md:text-left relative z-10">
          <div className="space-y-2">
            <h4 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-primary transition-colors duration-500">{initialUser?.name}</h4>
            <p className="text-[12px] text-white/20 font-black uppercase tracking-[0.5em] italic">{initialUser?.email} {"//"} TRANSMISSION_NODE_ACTIVE</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
             <div className="px-6 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-[11px] font-black text-primary uppercase tracking-[0.2em] italic">
               Rank: Senior_Commander
             </div>
             <div className="px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-black text-white/40 uppercase tracking-[0.2em] italic">
               System_ID: {initialUser?.id.slice(0, 12).toUpperCase()}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <label className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 italic ml-6">Operational_Name</label>
          <div className="relative group">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-[2rem] px-10 h-20 text-sm font-black uppercase tracking-[0.2em] text-white focus:border-primary/40 outline-none transition-all placeholder:text-white/10 italic shadow-xl"
              placeholder="Assign Node Name..."
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary animate-pulse opacity-0 group-focus-within:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="space-y-6">
          <label className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 italic ml-6">Uplink_Identity</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full bg-black/20 border border-white/5 rounded-[2rem] px-10 h-20 text-sm font-bold text-white/10 outline-none cursor-not-allowed italic shadow-inner"
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
    <div className="space-y-12">
      <div className="p-12 rounded-[3.5rem] bg-black/40 border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
        {/* Signal Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px)] bg-[size:40px_100%] pointer-events-none opacity-20" />
        
        <div className="flex items-center gap-10 relative z-10">
          <div className="h-20 w-20 rounded-[1.8rem] bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/20">
            <Icons.youtube className="h-10 w-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Node_Cluster</h4>
            <p className="text-[12px] text-white/20 font-black uppercase tracking-[0.5em] italic">
              {initialChannels.length} Registered Nodes {"//"} {initialChannels.reduce((acc, c) => acc + (c.subscriberCount || 0), 0).toLocaleString()} Total Units
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Icons.search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search_Nodes..."
              value={channelSearch}
              onChange={(e) => setChannelSearch(e.target.value)}
              className="w-full lg:w-80 bg-black/60 border border-white/5 rounded-[1.8rem] pl-16 pr-8 h-16 text-[11px] font-black uppercase tracking-[0.4em] outline-none focus:border-primary/40 text-white italic"
            />
          </div>
          <Button 
            onClick={() => signIn("google", { callbackUrl: "/dashboard/settings" })}
            className="h-16 rounded-[1.8rem] px-12 text-[11px] font-black uppercase tracking-[0.4em] bg-primary text-white hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/40 border border-primary/20 italic transition-all"
          >
            Authorize_Node
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredChannels.map((channel) => {
          const isConnected = !!channel.refreshToken || !!channel.accessToken;
          return (
            <div key={channel.id} className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col gap-8 group hover:border-primary/40 transition-all duration-700 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-8 overflow-hidden relative z-10">
                <div className="h-20 w-20 rounded-[2rem] bg-black border border-white/10 overflow-hidden shrink-0 shadow-2xl group-hover:border-primary/20 transition-all duration-700 relative">
                  {channel.thumbnailUrl ? (
                    <Image 
                      src={channel.thumbnailUrl} 
                      alt={channel.channelName || "Node"} 
                      fill
                      className="h-full w-full object-cover opacity-40 group-hover:opacity-100 transition-opacity duration-700" 
                    />
                  ) : (
                    <div className="h-full w-full bg-[radial-gradient(circle_at_center,#ffffff05_1px,transparent_1px)] bg-[size:10px_10px]" />
                  )}
                </div>
                <div className="overflow-hidden space-y-2">
                  <p className="text-sm font-black text-white uppercase tracking-tight italic truncate group-hover:text-primary transition-colors duration-500">{channel.channelName || "UNNAMED_NODE"}</p>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">{channel.subscriberCount?.toLocaleString() || 0} UNITS</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                <div className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-full border italic transition-all duration-700",
                  isConnected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                  <div className={cn(
                    "h-2 w-2 rounded-full animate-pulse shadow-2xl",
                    isConnected ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"
                  )} />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">{isConnected ? "SYNCED" : "OFFLINE"}</span>
                </div>
                <Button size="icon" variant="ghost" className="h-12 w-12 text-white/10 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10">
                  <Icons.settings className="h-5 w-5" />
                </Button>
              </div>

              {/* Internal HUD FX */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] pointer-events-none opacity-20 bg-[size:100%_4px]" />
            </div>
          );
        })}
      </div>
    </div>
  )

  const renderTeamSettings = () => (
    <div className="space-y-12">
      <div className="p-12 rounded-[3.5rem] bg-black/40 border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
        {/* Team Grid FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-20" />
        
        <div className="flex items-center gap-10 relative z-10">
          <div className="h-20 w-20 rounded-[1.8rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/10">
            <Icons.users className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Orchestration</h4>
            <p className="text-[12px] text-white/20 font-black uppercase tracking-[0.5em] italic">
              Deploy operative units to assist in fleet management.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Icons.mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              type="email" 
              placeholder="Unit_Identity..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full lg:w-96 bg-black/60 border border-white/5 rounded-[1.8rem] pl-16 pr-8 h-16 text-[11px] font-black uppercase tracking-[0.4em] outline-none focus:border-primary/40 text-white italic shadow-xl"
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
            className="h-16 rounded-[1.8rem] px-12 text-[11px] font-black uppercase tracking-[0.4em] bg-primary text-white hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/40 border border-primary/20 italic transition-all"
          >
            Deploy_Invite
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 relative z-10">
        {team.length === 0 ? (
          <div className="py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-black/20 shadow-inner">
             <Icons.users className="h-16 w-16 text-white/5 mx-auto mb-8" />
             <p className="text-[12px] font-black uppercase tracking-[0.6em] text-white/10 italic">Zero_Operative_Units_In_Sector</p>
          </div>
        ) : (
          team.map((member) => (
            <motion.div 
              layout
              key={member.id} 
              className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-10 group hover:border-primary/40 transition-all duration-700 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center gap-10 overflow-hidden relative z-10">
                <div className="h-20 w-20 rounded-[2rem] bg-black border border-white/10 flex items-center justify-center shrink-0 shadow-2xl group-hover:border-primary/20 transition-all duration-700 relative overflow-hidden">
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Icons.user className="h-8 w-8 text-white/10 group-hover:text-primary transition-colors relative z-10" />
                </div>
                <div className="overflow-hidden space-y-2 text-center sm:text-left">
                  <p className="text-2xl font-black text-white uppercase tracking-tighter italic truncate group-hover:text-primary transition-colors duration-500">{member.member?.name || "ANONYMOUS_UNIT"}</p>
                  <p className="text-[11px] text-white/20 font-black uppercase tracking-[0.4em] italic">{member.member?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-8 relative z-10">
                <div className="px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary italic shadow-lg shadow-primary/5">
                  {member.role.toUpperCase()}_PROTOCOL
                </div>
                <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl text-white/10 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
                  <Icons.trash2 className="h-6 w-6" />
                </Button>
              </div>
              {/* Internal HUD Scan Line */}
              <div className="absolute inset-y-0 right-0 w-1 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )

  const renderBillingSettings = () => (
    <div className="space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { id: "alpha", name: "Alpha", price: "0", features: ["1 Linked Node", "5 Transmissions/mo", "720p Render Core", "Basic Analytics"], current: (initialUser?.plan === "alpha") },
          { id: "pro", name: "Pro", price: "29", features: ["5 Linked Nodes", "Unlimited Transmissions", "4K HDR Render Core", "AI Neural Studio", "Priority Uplink"], current: (initialUser?.plan === "pro") },
          { id: "fleet", name: "Fleet", price: "99", features: ["Unlimited Nodes", "Mass Execution", "Cluster Transcoding", "Team Orchestration", "Protocol Access"], current: (initialUser?.plan === "fleet" || initialUser?.plan === "elite" || initialUser?.plan === "enterprise") }
        ].map((plan, i) => (
          <motion.div 
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-12 rounded-[4rem] border transition-all duration-1000 relative flex flex-col justify-between h-full group overflow-hidden shadow-2xl",
              plan.current 
                ? "bg-primary/5 border-primary/40 shadow-primary/20 scale-[1.02] z-10" 
                : "bg-black/40 border-white/5 hover:border-primary/20"
            )}
          >
            {/* HUD Scan Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] pointer-events-none opacity-20 bg-[size:100%_4px] z-0" />
            
            {plan.current && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.5em] rounded-b-3xl shadow-2xl italic z-10">
                ACTIVE_PROTOCOL
              </div>
            )}
            
            <div className="space-y-10 relative z-10">
              <div className="space-y-3">
                <h4 className="text-[12px] font-black text-white/30 uppercase tracking-[0.6em] italic">{plan.name.toUpperCase()}_LEVEL</h4>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black text-white tracking-tighter italic leading-none">${plan.price}</span>
                  <span className="text-[12px] text-white/20 font-black uppercase tracking-widest italic leading-none">/ CYCLE</span>
                </div>
              </div>
              <div className="h-px w-full bg-white/5" />
              <ul className="space-y-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-5 text-[11px] font-black uppercase tracking-widest text-white/40 italic group-hover:text-white/80 transition-colors duration-500">
                    <div className="h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                       <Icons.check className="h-3 w-3 text-primary" />
                    </div>
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
                  const message = err instanceof Error ? err.message : "Checkout sequence failed"
                  toast.error(message)
                } finally {
                  setIsSaving(false)
                }
              }}
              className={cn(
                "mt-16 w-full h-20 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.5em] transition-all duration-700 italic shadow-2xl relative z-10 overflow-hidden",
                !plan.current ? "bg-primary text-white hover:scale-[1.05] active:scale-[0.95] shadow-primary/40 border border-primary/20" : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"
              )}
            >
              {plan.current ? "CURRENT_NODE_PLAN" : "UPGRADE_PROTOCOL"}
              {!plan.current && <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.1),transparent)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="p-12 rounded-[3.5rem] bg-black/60 backdrop-blur-3xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center gap-10 relative z-10">
          <div className="h-20 w-20 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-primary/40 transition-all duration-700 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <Icons.creditCard className="h-10 w-10 text-white/10 group-hover:text-primary transition-colors relative z-10" />
          </div>
          <div className="space-y-2">
            <p className="text-[12px] font-black text-white uppercase tracking-[0.5em] italic leading-none">Operational_Credit_Module</p>
            <p className="text-[11px] text-white/20 font-black uppercase tracking-[0.3em] mt-1 italic">Enterprise_Handshake {"//"} SECURE_UPLINK</p>
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
              const message = err instanceof Error ? err.message : "Protocol interruption"
              toast.error(message)
            } finally {
              setIsSaving(false)
            }
          }}
          className="h-16 rounded-[1.8rem] border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-[0.4em] text-white hover:bg-white/10 transition-all px-12 italic shadow-2xl"
        >
          Manage_Stripe_Terminal
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-16 pb-24 relative max-w-7xl mx-auto">
      {/* Structural Ambience Nodes */}
      <div className="absolute -top-60 -right-60 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/2 -left-60 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />

      {/* Industrial Header Console */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 p-16 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden">
        {/* HUD Scanline FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="flex items-center gap-12 relative z-10">
          <motion.div 
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="h-24 w-24 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 relative group cursor-pointer"
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-primary blur-2xl opacity-20 group-hover:opacity-50 transition-opacity" />
            <Icons.settings className="h-12 w-12 text-white relative z-10 group-hover:rotate-180 transition-transform duration-1000" />
          </motion.div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
               <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),1)]" />
               <span className="text-[11px] font-black text-primary uppercase tracking-[0.6em] italic leading-none">System_Core_Linked</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none italic">System_Config</h1>
            <p className="text-white/20 font-black uppercase tracking-[0.5em] text-[11px] italic">Operational_Tuning {"//"} Preference_Synchronization</p>
          </div>
        </div>
        
        <Button 
          onClick={handleApply}
          disabled={isSaving}
          className="h-20 bg-primary text-white hover:scale-[1.05] active:scale-[0.95] rounded-[2rem] px-16 text-[12px] font-black uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(var(--primary),0.3)] transition-all border border-primary/20 italic group relative z-10"
        >
          {isSaving ? <Icons.refreshCw className="h-6 w-6 mr-4 animate-spin" /> : <Icons.save className="h-6 w-6 mr-4 group-hover:rotate-12 transition-transform" />}
          Commit_Parameters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 px-4">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-8">
          <div className="p-4 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] shadow-2xl h-fit sticky top-32 overflow-hidden">
            <div className="p-8 mb-4 border-b border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic">Subsystem_Index</span>
               <Icons.cpu className="h-4 w-4 text-white/5" />
            </div>
            <nav className="space-y-3 p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-6 px-8 py-6 rounded-[2rem] text-left transition-all duration-700 relative group overflow-hidden border border-transparent shadow-xl",
                    activeTab === tab.id
                      ? "text-primary bg-primary/[0.08] border-primary/20"
                      : "text-white/20 hover:text-white hover:bg-white/[0.03] hover:border-white/5"
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="tab-active-glow" 
                      className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none" 
                    />
                  )}
                  <tab.icon className={cn(
                    "h-6 w-6 transition-all duration-700 relative z-10", 
                    activeTab === tab.id ? "text-primary scale-110" : "text-white/20 group-hover:text-white group-hover:scale-110"
                  )} />
                  <span className={cn(
                    "text-[12px] font-black uppercase tracking-[0.3em] italic transition-all duration-700 relative z-10",
                    activeTab === tab.id ? "text-white translate-x-2" : "text-white/40 group-hover:text-white group-hover:translate-x-1"
                  )}>{tab.label}</span>
                  {activeTab === tab.id && (
                     <div className="absolute right-6 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),1)]" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-10 bg-black/40 backdrop-blur-2xl border border-white/5 rounded-[3rem] flex flex-col items-center gap-6 text-center shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff02_1px,transparent_1px)] bg-[size:15px_15px] opacity-20" />
             <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)] relative z-10" />
             <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] italic relative z-10">Cluster_Sync: NOMINAL</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[4.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[850px] flex flex-col">
          {/* Header */}
          <div className="px-16 py-12 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative z-10">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-black text-primary uppercase tracking-[0.6em] italic leading-none">{tabs.find(tab => tab.id === activeTab)?.label.toUpperCase()}_PROTOCOL</span>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">Secure Operational Command Interface</span>
            </div>
            <div className="flex items-center gap-8">
               <div className="flex flex-col items-end gap-2">
                  <span className="text-[9px] font-black text-white/10 uppercase tracking-widest italic">Node_Status</span>
                  <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
                     <motion.div className="h-full bg-primary" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                  </div>
               </div>
               <Icons.shield className="h-8 w-8 text-white/5" />
            </div>
          </div>

          <div className="p-16 flex-1 relative z-10">
            {/* Inner HUD FX */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff02_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                {activeTab === "account" && renderAccountSettings()}
                {activeTab === "team" && renderTeamSettings()}
                {activeTab === "youtube" && renderYouTubeSettings()}
                {activeTab === "billing" && renderBillingSettings()}
                {activeTab === "notifications" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {[
                      { id: "globalAlerts", label: "Global_Alerts", desc: "System-wide operational telemetry notifications.", icon: Icons.bell, color: "primary" },
                      { id: "emailUplink", label: "Email_Uplink", desc: "Critical failure reports transmitted via global SMTP.", icon: Icons.mail, color: "emerald-500" }
                    ].map((pref) => (
                      <motion.div 
                        key={pref.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleToggle(pref.id as keyof typeof prefs)}
                        className={cn(
                          "p-12 rounded-[3.5rem] border transition-all duration-700 cursor-pointer group shadow-2xl flex flex-col justify-between h-72 relative overflow-hidden",
                          prefs[pref.id as keyof typeof prefs] 
                            ? `bg-${pref.color}/5 border-${pref.color}/40 shadow-${pref.color}/10` 
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center justify-between mb-8">
                          <div className="h-20 w-20 rounded-[1.8rem] bg-black border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden">
                             <div className={cn("absolute inset-0 opacity-10", prefs[pref.id as keyof typeof prefs] ? `bg-${pref.color}` : "bg-white")} />
                             <pref.icon className={cn("h-8 w-8 transition-all duration-700 relative z-10", prefs[pref.id as keyof typeof prefs] ? `text-${pref.color} scale-110` : "text-white/10")} />
                          </div>
                          <div className={cn(
                            "h-10 w-16 rounded-full relative transition-all duration-700 border border-white/10 p-1.5",
                            prefs[pref.id as keyof typeof prefs] ? `bg-${pref.color}` : "bg-black"
                          )}>
                            <motion.div 
                              animate={{ x: prefs[pref.id as keyof typeof prefs] ? 24 : 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              className="h-6 w-6 bg-white rounded-full shadow-2xl" 
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className={cn("text-2xl font-black uppercase tracking-tighter italic transition-colors duration-700", prefs[pref.id as keyof typeof prefs] ? `text-white` : "text-white/20")}>{pref.label}</p>
                          <p className="text-[11px] text-white/20 font-black uppercase tracking-[0.3em] italic leading-relaxed">{pref.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {activeTab === "api" && (
                  <div className="space-y-12">
                     <div className="p-16 rounded-[4rem] bg-white/[0.02] border border-white/5 space-y-16 relative overflow-hidden group shadow-2xl">
                        {/* Protocol FX */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] pointer-events-none bg-[size:100%_4px] opacity-20" />
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-12 relative z-10">
                          <div className="flex items-center gap-10">
                             <div className="h-24 w-24 rounded-[2.5rem] bg-black border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-primary/40 transition-all duration-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Icons.shield className={cn("h-10 w-10 transition-all duration-700 relative z-10", prefs.protocolV3 ? "text-emerald-500 scale-110" : "text-white/10")} />
                             </div>
                             <div className="flex flex-col gap-3">
                                <h4 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Integration_Protocol</h4>
                                <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] italic leading-none">YouTube Core Authorization V3</span>
                             </div>
                          </div>
                          <div 
                            onClick={() => handleToggle("protocolV3")}
                            className={cn(
                              "h-12 w-24 rounded-full relative cursor-pointer transition-all duration-700 border border-white/10 shadow-2xl p-2",
                              prefs.protocolV3 ? "bg-emerald-500 shadow-emerald-500/30" : "bg-black"
                            )}
                          >
                            <motion.div 
                              animate={{ x: prefs.protocolV3 ? 48 : 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              className="h-8 w-8 bg-white rounded-full shadow-2xl" 
                            />
                          </div>
                        </div>
                        
                        <div className="p-10 rounded-[2.5rem] bg-black/40 border border-white/5 relative z-10 flex items-center gap-6 group/status transition-all hover:border-emerald-500/20">
                           <div className={cn("h-3 w-3 rounded-full shadow-2xl animate-pulse shrink-0", prefs.protocolV3 ? "bg-emerald-500 shadow-emerald-500/50" : "bg-amber-500 shadow-amber-500/50")} />
                           <span className="text-sm font-black text-white uppercase tracking-[0.4em] italic group-hover:text-emerald-500 transition-colors duration-500">
                             {prefs.protocolV3 ? "Operational_Protocol_v3_Active" : "Standby_Manual_Override_Engaged"}
                           </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                           {[
                             { label: "Last_Sync_Token", val: "88_ALPHA_NODE_01_SECURE" },
                             { label: "API_Rate_Limit", val: "10,000 / CYCLE" },
                             { label: "Traffic_Mode", val: "ENCRYPTED_UPLINK" },
                             { label: "Security_Level", val: "LEVEL_04_SENTINEL" }
                           ].map((stat, i) => (
                             <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col gap-3 group/stat hover:bg-white/[0.04] transition-all duration-500">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic group-hover:text-primary transition-colors">{stat.label}</span>
                                <span className="text-[12px] font-mono font-black text-white/60 tracking-tighter group-hover:text-white transition-colors">{stat.val}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Footer Telemetry */}
          <div className="px-16 py-10 bg-black/40 border-t border-white/5 flex items-center justify-between opacity-40">
             <span className="text-[9px] font-black text-white uppercase tracking-[0.8em] italic">System_Hardened {"//"} StudioBucket_OS_v2.0</span>
             <div className="flex items-center gap-6">
                <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Latency: 12ms</span>
                <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Load: 0.04%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
