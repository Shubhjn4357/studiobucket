"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { Video, Schedule } from "@/schemas"
import { DeploymentModal } from "./deployment-modal"
import { deleteScheduleAction } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

interface ScheduledItem {
  video: Video
  schedule: Schedule
}

interface ScheduleManagerProps {
  initialSchedules?: ScheduledItem[]
}

export function ScheduleManager({ initialSchedules = [] }: ScheduleManagerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [schedules, setSchedules] = useState<ScheduledItem[]>(initialSchedules)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const currentYear = selectedDate.getFullYear()
  const currentMonth = selectedDate.getMonth()

  const handlePrevMonth = () => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))
  const handleNextMonth = () => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))

  const handleDelete = async () => {
    if (!deleteId) return
    const scheduleId = deleteId
    setDeleteId(null)
    setIsDeleting(scheduleId)
    try {
      await deleteScheduleAction(scheduleId)
      setSchedules(prev => prev.filter(s => s.schedule.id !== scheduleId))
      toast.success("Schedule deleted successfully")
    } catch {
      toast.error("Failed to delete schedule")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-end">
        <DeploymentModal />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Calendar Card - Hidden or scrollable on small mobile */}
        <Card className="lg:col-span-8 bg-card border-border shadow-sm rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border bg-muted/20 px-6 md:px-8 py-4 md:py-6 shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                  <Icons.calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                   <CardTitle className="text-base md:text-lg font-bold truncate">Content Calendar</CardTitle>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 truncate">Upload timeline</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4 bg-background/50 border border-border p-1 md:p-1.5 rounded-2xl w-full sm:w-auto justify-between sm:justify-start">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 md:h-9 md:w-9 rounded-xl hover:bg-muted transition-all">
                  <Icons.chevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] w-24 md:w-32 text-center text-foreground/80 truncate">
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 md:h-9 md:w-9 rounded-xl hover:bg-muted transition-all">
                  <Icons.chevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-8 overflow-x-auto">
            <div className="min-w-[600px] lg:min-w-0">
              <div className="grid grid-cols-7 gap-2 md:gap-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-muted-foreground/40 pb-2 md:pb-4">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 42 }, (_, i) => {
                  const dayOffset = i - firstDayOfMonth(currentYear, currentMonth)
                  const date = new Date(currentYear, currentMonth, dayOffset + 1)
                  const isCurrentMonth = date.getMonth() === currentMonth
                  const isToday = date.toDateString() === new Date().toDateString()
                  
                  const daySchedules = schedules.filter(s => {
                    if (!s.schedule.scheduledAt) return false
                    const sDate = new Date(s.schedule.scheduledAt)
                    return sDate.toDateString() === date.toDateString()
                  })

                  return (
                    <div
                      key={i}
                      className={cn(
                        "min-h-[80px] md:min-h-[110px] border rounded-xl md:rounded-2xl p-2 md:p-4 transition-all relative flex flex-col group",
                        isCurrentMonth ? "bg-muted/5 border-border" : "bg-transparent border-transparent opacity-5",
                        isToday && "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5",
                        daySchedules.length > 0 && isCurrentMonth && "border-primary/20 bg-primary/5"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] md:text-xs font-black mb-2 md:mb-3 block transition-colors",
                        isToday ? "text-primary" : "text-muted-foreground/50 group-hover:text-foreground"
                      )}>
                        {date.getDate()}
                      </span>
                      
                      <div className="space-y-1 md:space-y-1.5 flex-1 overflow-hidden">
                        {daySchedules.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="px-1.5 md:px-2.5 py-1 rounded-md md:rounded-lg bg-primary text-white text-[8px] md:text-[9px] font-black truncate leading-none shadow-md shadow-primary/10 border border-primary/20 transition-transform cursor-default">
                            {item.video.title}
                          </div>
                        ))}
                        {daySchedules.length > 3 && (
                          <div className="text-[8px] font-black text-primary/60 text-center">+{daySchedules.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List View Card */}
        <Card className="lg:col-span-4 bg-card border-border shadow-sm rounded-[2rem] md:rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border bg-muted/20 px-6 md:px-8 py-4 md:py-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner shrink-0">
                <Icons.clock className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                 <CardTitle className="text-base md:text-lg font-bold truncate">Upcoming</CardTitle>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 truncate">Automation jobs</p>
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 max-h-[500px] lg:max-h-[700px]">
            <CardContent className="p-4 md:p-8 space-y-4 md:space-y-6">
              {schedules.length === 0 ? (
                <div className="py-12 md:py-24 text-center border-2 border-dashed border-border rounded-[2rem] opacity-30 flex flex-col items-center">
                   <Icons.inbox className="h-10 w-10 md:h-12 md:w-12 mb-4 md:mb-6" />
                   <p className="text-[10px] font-black uppercase tracking-[0.3em]">Timeline clear</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {schedules.map((item) => (
                    <motion.div 
                      key={item.schedule.id} 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-muted/20 border border-border group hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-500 shadow-sm"
                    >
                      <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-5">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                          <Icons.video className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground/30 group-hover:text-primary transition-colors duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-bold truncate group-hover:text-primary transition-colors">{item.video.title}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                             <Icons.calendar className="h-3 w-3 text-muted-foreground/40" />
                             <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-tighter truncate">
                               {new Date(item.schedule.scheduledAt).toLocaleDateString()} • {new Date(item.schedule.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-border/50">
                         <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 md:px-3 py-1 rounded-full">
                               Ready
                            </Badge>
                         </div>
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           disabled={isDeleting === item.schedule.id}
                           onClick={() => setDeleteId(item.schedule.id)}
                           className="h-8 w-8 md:h-10 md:w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300"
                         >
                           {isDeleting === item.schedule.id ? <Icons.refreshCw className="h-4 w-4 animate-spin" /> : <Icons.trash2 className="h-4 w-4" />}
                         </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      <DeleteConfirmDialog 
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Cancel Scheduled Task?"
        description="This will stop the automated upload for this video. The media will remain safe in your library."
        confirmText="Cancel Task"
      />
    </div>
  )
}
