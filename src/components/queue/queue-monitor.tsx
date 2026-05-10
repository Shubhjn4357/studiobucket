"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

const List = Icons.list
const RefreshCw = Icons.refreshCw
const Play = Icons.play
const Pause = Icons.pause
const MoreVertical = Icons.moreVertical
const CheckCircle = Icons.checkCircle
const AlertCircle = Icons.alertCircle
const Trash2 = Icons.trash2
const Clock = Icons.clock

export function QueueMonitor() {
  const [queueItems] = useState([
    {
      id: 1,
      title: "Video 1.mp4",
      status: "processing",
      progress: 75,
      type: "upload",
      startTime: "10:30 AM",
      estimatedTime: "5 min"
    },
    {
      id: 2,
      title: "Video 2.mp4",
      status: "completed",
      progress: 100,
      type: "upload",
      startTime: "10:15 AM",
      estimatedTime: "Completed"
    },
    {
      id: 3,
      title: "Video 3.mp4",
      status: "failed",
      progress: 0,
      type: "upload",
      startTime: "10:00 AM",
      estimatedTime: "Failed"
    },
    {
      id: 4,
      title: "Video 4.mp4",
      status: "waiting",
      progress: 0,
      type: "upload",
      startTime: "Waiting",
      estimatedTime: "10 min"
    },
    {
      id: 5,
      title: "Video 5.mp4",
      status: "waiting",
      progress: 0,
      type: "upload",
      startTime: "Waiting",
      estimatedTime: "12 min"
    },
  ])

  const [queueStats] = useState({
    active: 1,
    completed: 1,
    failed: 1,
    waiting: 2,
    total: 5
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "upload":
        return "bg-purple-100 text-purple-800"
      case "download":
        return "bg-blue-100 text-blue-800"
      case "compression":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Queue Monitor</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Pause className="h-4 w-4 mr-2" />
            Pause All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold mt-1">{queueStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="text-2xl font-bold mt-1">{queueStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm font-medium">Failed</span>
            </div>
            <div className="text-2xl font-bold mt-1">{queueStats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full" />
              <span className="text-sm font-medium">Waiting</span>
            </div>
            <div className="text-2xl font-bold mt-1">{queueStats.waiting}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold mt-1">{queueStats.total}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Queue Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queueItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Started: {item.startTime} • ETA: {item.estimatedTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-background rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          item.status === "processing" && "bg-blue-500",
                          item.status === "completed" && "bg-green-500",
                          item.status === "failed" && "bg-red-500"
                        )}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {item.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      getStatusColor(item.status)
                    )}>
                      {item.status}
                    </span>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      getTypeColor(item.type)
                    )}>
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.status === "waiting" && (
                      <Button variant="ghost" size="icon">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {item.status === "processing" && (
                      <Button variant="ghost" size="icon">
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline">
          Clear Completed
        </Button>
        <Button variant="outline">
          Retry Failed
        </Button>
        <Button variant="outline">
          Export Log
        </Button>
      </div>
    </div>
  )
}
