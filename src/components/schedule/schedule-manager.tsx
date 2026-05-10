"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

const Calendar = Icons.calendar
const Plus = Icons.plus
const ChevronLeft = Icons.chevronLeft
const ChevronRight = Icons.chevronRight
const Video = Icons.video
const Clock = Icons.clock
const MoreVertical = Icons.moreVertical
const Edit = Icons.edit
const Trash2 = Icons.trash2

export function ScheduleManager() {
  const [selectedDate] = useState(new Date())
  const [scheduledVideos] = useState([
    {
      id: 1,
      title: "Video 1",
      date: new Date(),
      time: "10:00 AM",
      status: "scheduled",
      type: "short"
    },
    {
      id: 2,
      title: "Video 2",
      date: new Date(),
      time: "2:00 PM",
      status: "uploaded",
      type: "regular"
    },
    {
      id: 3,
      title: "Video 3",
      date: new Date(),
      time: "6:00 PM",
      status: "processing",
      type: "short"
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "uploaded":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "short":
        return "bg-purple-100 text-purple-800"
      case "regular":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schedule Manager</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Video
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Week</Button>
                <Button variant="outline" size="sm">Month</Button>
                <Button variant="outline" size="sm">Year</Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium p-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - selectedDate.getDay() + 1)
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()
                const hasVideos = scheduledVideos.some(video =>
                  video.date.toDateString() === date.toDateString()
                )

                return (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square border rounded-lg p-1 cursor-pointer transition-colors",
                      isCurrentMonth ? "bg-background" : "bg-muted/50",
                      isToday && "border-primary",
                      hasVideos && "bg-primary/10 border-primary"
                    )}
                  >
                    <div className="text-sm text-center">
                      {date.getDate()}
                      {hasVideos && (
                        <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {scheduledVideos.map(video => (
                <div key={video.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="font-medium text-sm">{video.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        getStatusColor(video.status)
                      )}>
                        {video.status}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        getTypeColor(video.type)
                      )}>
                        {video.type}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {video.date.toLocaleDateString()} • {video.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledVideos.map(video => (
              <div key={video.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <Video className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.date.toLocaleDateString()} at {video.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    getStatusColor(video.status)
                  )}>
                    {video.status}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    getTypeColor(video.type)
                  )}>
                    {video.type}
                  </span>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
