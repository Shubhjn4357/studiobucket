"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { Video, Schedule } from "@/schemas"
import { DeploymentModal } from "./deployment-modal"
import { deleteScheduleAction } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const currentYear = selectedDate.getFullYear()
  const currentMonth = selectedDate.getMonth()

  const handlePrevMonth = () => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))
  const handleNextMonth = () => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))

  const handleDelete = async (scheduleId: string) => {
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
    <div className="space-y-8">
      <div className="flex justify-end">
        <DeploymentModal />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Card */}
        <Card className="lg:col-span-8 bg-card border-border shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.calendar className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Schedule Calendar</CardTitle>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg">
                  <Icons.chevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-bold uppercase tracking-wider w-40 text-center">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg">
                  <Icons.chevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-4">
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
                      "min-h-[100px] border rounded-xl p-3 transition-colors relative",
                      isCurrentMonth ? "bg-card border-border" : "bg-transparent border-transparent opacity-10",
                      isToday && "border-primary bg-primary/5",
                      daySchedules.length > 0 && "border-primary/20 bg-primary/5"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-bold mb-2 block",
                      isToday ? "text-primary" : "text-muted-foreground"
                    )}>
                      {date.getDate()}
                    </span>
                    
                    <div className="space-y-1">
                      {daySchedules.map((item, idx) => (
                        <div key={idx} className="px-2 py-1 rounded-md bg-primary text-white text-[9px] font-bold truncate leading-tight shadow-sm">
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
        <Card className="lg:col-span-4 bg-card border-border shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <Icons.clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Upcoming Tasks</CardTitle>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 max-h-[600px]">
            <CardContent className="p-6 space-y-4">
              {schedules.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl opacity-50">
                   <Icons.inbox className="h-10 w-10 mx-auto mb-4" />
                   <p className="text-xs font-bold uppercase tracking-wider">No tasks scheduled</p>
                </div>
              ) : (
                schedules.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl bg-muted/30 border border-border group hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                        <Icons.video className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate">{item.video.title}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">
                          {new Date(item.schedule.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                       <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span className="text-[10px] font-bold text-green-500 uppercase">Ready</span>
                       </div>
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             disabled={isDeleting === item.schedule.id}
                             className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                           >
                             {isDeleting === item.schedule.id ? <Icons.refreshCw className="h-3 w-3 animate-spin" /> : <Icons.trash2 className="h-3 w-3" />}
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent className="rounded-2xl">
                           <AlertDialogHeader>
                             <AlertDialogTitle>Delete Schedule?</AlertDialogTitle>
                             <AlertDialogDescription>
                               This will remove the scheduled upload from the calendar. The video will remain in your library.
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                             <AlertDialogAction 
                               onClick={() => handleDelete(item.schedule.id)}
                               className="bg-red-500 hover:bg-red-600 rounded-xl"
                             >
                               Delete
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}
