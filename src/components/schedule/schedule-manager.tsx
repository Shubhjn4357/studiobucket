"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Video, Schedule } from "@/schemas"

interface ScheduledItem {
  video: Video
  schedule: Schedule
}

interface ScheduleManagerProps {
  initialSchedules?: ScheduledItem[]
}

export function ScheduleManager({ initialSchedules = [] }: ScheduleManagerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [schedules] = useState<ScheduledItem[]>(initialSchedules)

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const currentYear = selectedDate.getFullYear()
  const currentMonth = selectedDate.getMonth()

  const handlePrevMonth = () => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))
  const handleNextMonth = () => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Icons.calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none italic">Mission Timeline</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Temporal Coordination • Automated Execution</p>
          </div>
        </div>
        <Button className="h-11 bg-primary text-white hover:opacity-90 rounded-xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
          <Icons.plus className="h-4 w-4 mr-2" />
          Schedule Deployment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Card */}
        <Card className="lg:col-span-8 cyber-card border-border bg-card/50 overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/30 py-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Icons.calendar className="h-4 w-4 text-primary" />
                Temporal Grid
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 hover:bg-primary/10">
                    <Icons.chevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-[10px] font-black uppercase tracking-widest w-32 text-center">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 hover:bg-primary/10">
                    <Icons.chevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 42 }, (_, i) => {
                const dayOffset = i - firstDayOfMonth(currentYear, currentMonth)
                const date = new Date(currentYear, currentMonth, dayOffset + 1)
                const isCurrentMonth = date.getMonth() === currentMonth
                const isToday = date.toDateString() === new Date().toDateString()
                
                const daySchedules = schedules.filter(s => {
                  const sDate = new Date(s.schedule.scheduledAt)
                  return sDate.toDateString() === date.toDateString()
                })

                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[100px] border rounded-xl p-2 transition-all group overflow-hidden relative",
                      isCurrentMonth ? "bg-muted/10 border-border" : "bg-transparent border-transparent opacity-20",
                      isToday && "border-primary/50 bg-primary/5 shadow-[inset_0_0_20px_rgba(255,0,0,0.05)]",
                      daySchedules.length > 0 && "border-primary/30"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-tighter italic",
                      isToday ? "text-primary" : "text-muted-foreground"
                    )}>
                      {date.getDate()}
                    </span>
                    
                    <div className="mt-2 space-y-1">
                      {daySchedules.map((item, idx) => (
                        <div key={idx} className="p-1 px-2 rounded bg-primary text-white text-[7px] font-black uppercase tracking-tighter truncate leading-tight shadow-sm">
                          {item.video.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* List View Card */}
        <Card className="lg:col-span-4 cyber-card border-border bg-card/50 overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <Icons.clock className="h-4 w-4 text-amber-500" />
              Upcoming Sorties
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {schedules.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-border rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No scheduled operations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-muted/50 border border-border group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center">
                        <Icons.video className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-black text-foreground uppercase tracking-tight italic truncate">{item.video.title}</p>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                          {new Date(item.schedule.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">
                         Ready for Deployment
                       </span>
                       <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-red-500">
                         <Icons.trash2 className="h-3 w-3" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
