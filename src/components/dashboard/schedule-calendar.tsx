"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface VideoData { id: string; title: string; categoryId: string | null }
interface ScheduleData { scheduledAt: number; isActive: boolean }

export function ScheduleCalendar({ initialData }: { initialData?: { video: VideoData, schedule: ScheduleData }[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const today = new Date()
  const currentMonth = today.toLocaleString('default', { month: 'long' })
  const currentYear = today.getFullYear()
  
  return (
    <Card className="cyber-card border-white/5 overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter text-white">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Icons.calendar className="h-5 w-5 text-primary" />
              </div>
              {currentMonth} {currentYear}
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium text-xs">Visualize and manage your publishing pipeline.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white">
              <Icons.chevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white">
              <Icons.chevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Minimal Day Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div key={day} className="text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{day}</span>
            </div>
          ))}
          {Array.from({ length: 14 }).map((_, i) => {
            const dayNum = i + 1
            const isToday = dayNum === today.getDate()
            return (
              <div 
                key={i} 
                className={cn(
                  "aspect-square rounded-lg border border-white/5 bg-white/5 transition-all duration-300 hover:border-white/20 relative group flex items-center justify-center cursor-pointer",
                  isToday && "border-primary/50 bg-primary/10 shadow-[inset_0_0_20px_rgba(255,0,0,0.1)]"
                )}
              >
                <span className={cn("text-[10px] font-black", isToday ? "text-primary" : "text-slate-600 group-hover:text-white")}>
                  {dayNum}
                </span>
                {i === 3 && (
                  <div className="absolute top-1 right-1 h-1 w-1 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            )
          })}
        </div>

        {/* Upcoming List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Planned Operations</span>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{initialData?.length || 0} Scheduled</span>
          </div>
          
          <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
            {initialData && initialData.length > 0 ? (
              initialData.map((item, i) => (
                <motion.div
                  key={item.video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-slate-900 border border-white/10 group-hover:border-primary/30 transition-colors">
                    <span className="text-[8px] font-black text-slate-500 uppercase leading-none mb-1">
                      {new Date(item.schedule.scheduledAt * 1000).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-sm font-black text-white leading-none">
                      {new Date(item.schedule.scheduledAt * 1000).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{item.video.title}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      {new Date(item.schedule.scheduledAt * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} • Auto-Publish
                    </p>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                    item.schedule.isActive ? "bg-primary/20 text-primary" : "bg-emerald-500/20 text-emerald-500"
                  )}>
                    {item.schedule.isActive ? "Scheduled" : "Complete"}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-white/5 rounded-2xl border border-white/5 border-dashed">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                  <Icons.calendarClock className="h-5 w-5 text-slate-600" />
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">No operations planned</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
