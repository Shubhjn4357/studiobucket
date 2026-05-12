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

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
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
      toast.success("Deployment protocol aborted")
    } catch {
      toast.error("Abort synchronization failed")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-12 pb-24 relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 p-12 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
        {/* HUD Scan Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
            <Icons.calendar className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">Temporal_Grid_Synced</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">Mission_Timeline</h1>
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[11px] italic">Temporal_Coordination {"//"} Automated_Deployment_Protocol</p>
          </div>
        </div>
        <DeploymentModal />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Calendar Card (Temporal Grid) */}
        <div className="lg:col-span-8 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl relative">
          <div className="p-10 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Icons.calendar className="h-5 w-5 text-primary" />
                <span className="text-[12px] font-black text-white uppercase tracking-[0.3em] italic">Temporal_Grid_Map</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-10 w-10 rounded-xl hover:bg-white/10">
                    <Icons.chevronLeft className="h-4 w-4 text-white" />
                  </Button>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] w-48 text-center text-white italic">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-10 w-10 rounded-xl hover:bg-white/10">
                    <Icons.chevronRight className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="p-10">
            <div className="grid grid-cols-7 gap-4">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center text-[9px] font-black uppercase tracking-[0.5em] text-white/20 pb-6 italic">
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
                      "min-h-[120px] border rounded-[2rem] p-4 transition-all group overflow-hidden relative shadow-inner",
                      isCurrentMonth ? "bg-white/[0.01] border-white/5" : "bg-transparent border-transparent opacity-10",
                      isToday && "border-primary/40 bg-primary/5 shadow-[0_0_30px_rgba(var(--primary),0.05)]",
                      daySchedules.length > 0 && "border-primary/20 bg-primary/[0.02]"
                    )}
                  >
                    <span className={cn(
                      "text-[12px] font-black uppercase tracking-tighter italic block mb-3",
                      isToday ? "text-primary" : "text-white/20"
                    )}>
                      {date.getDate().toString().padStart(2, '0')}
                    </span>
                    
                    <div className="space-y-2">
                      {daySchedules.map((item, idx) => (
                        <div key={idx} className="p-2 px-3 rounded-xl bg-primary text-white text-[8px] font-black uppercase tracking-tighter truncate leading-tight shadow-2xl shadow-primary/20 italic border border-white/10">
                          {item.video.title}
                        </div>
                      ))}
                    </div>
                    
                    {isToday && (
                       <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* List View Card (Upcoming Sorties) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col h-full">
            <div className="p-10 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <Icons.clock className="h-5 w-5 text-primary" />
                <span className="text-[12px] font-black text-white uppercase tracking-[0.3em] italic">Upcoming_Sorties</span>
              </div>
            </div>
            <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6 max-h-[600px]">
              {schedules.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                   <Icons.inbox className="h-12 w-12 text-white/5 mx-auto mb-6" />
                   <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] italic">Zero_Operations_Planned</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {schedules.map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:border-primary/40 transition-all duration-500 shadow-xl relative overflow-hidden"
                    >
                      <div className="flex items-center gap-5 mb-5 relative z-10">
                        <div className="h-12 w-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/20 transition-all">
                          <Icons.video className="h-6 w-6 text-white/20 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 overflow-hidden space-y-1">
                          <p className="text-sm font-black text-white uppercase tracking-tight italic truncate leading-none group-hover:text-primary transition-colors">{item.video.title}</p>
                          <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] italic">
                            T-MINUS: {new Date(item.schedule.scheduledAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between relative z-10 pt-4 border-t border-white/5">
                         <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">MISSION_READY</span>
                         </div>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button 
                               size="icon" 
                               variant="ghost" 
                               disabled={isDeleting === item.schedule.id}
                               className="h-10 w-10 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                             >
                               {isDeleting === item.schedule.id ? <Icons.refreshCw className="h-4 w-4 animate-spin" /> : <Icons.trash2 className="h-4 w-4" />}
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent className="backdrop-blur-3xl bg-black/80 border-white/10 rounded-[3rem] p-12">
                             <AlertDialogHeader>
                               <AlertDialogTitle className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Abort_Sortie?</AlertDialogTitle>
                               <AlertDialogDescription className="text-sm font-bold text-white/30 uppercase tracking-widest leading-relaxed mt-6 italic">
                                 This protocol will permanently remove the scheduled transmission from the temporal grid. 
                                 The asset will remain in the repository but will not be deployed to global networks.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter className="mt-12 gap-4">
                               <AlertDialogCancel className="h-16 rounded-2xl border-white/5 bg-white/5 text-[11px] font-black uppercase tracking-[0.3em] px-10 hover:bg-white/10 transition-all italic text-white/60">Cancel_Abort</AlertDialogCancel>
                               <AlertDialogAction 
                                 onClick={() => handleDelete(item.schedule.id)}
                                 className="h-16 rounded-2xl bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.3em] px-12 hover:bg-red-600 shadow-2xl shadow-red-500/40 transition-all italic border border-red-400/20"
                               >
                                 Finalize_Abort
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
