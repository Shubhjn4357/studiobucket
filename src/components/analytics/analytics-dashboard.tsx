"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

const BarChart = Icons.barChart
const TrendingUp = Icons.trendingUp
const Users = Icons.users
const Video = Icons.video
const Eye = Icons.eye
const Heart = Icons.heart
const MessageSquare = Icons.messageSquare
const Download = Icons.download
const Calendar = Icons.calendar
const Filter = Icons.filter
const MoreVertical = Icons.moreVertical

export function AnalyticsDashboard() {
  const stats = [
    {
      title: "Total Views",
      value: "1,254,432",
      change: "+12.5%",
      changeType: "positive",
      icon: Eye,
    },
    {
      title: "Subscribers",
      value: "82,234",
      change: "+3.2%",
      changeType: "positive",
      icon: Users,
    },
    {
      title: "Videos Uploaded",
      value: "1,425",
      change: "+8",
      changeType: "positive",
      icon: Video,
    },
    {
      title: "Engagement Rate",
      value: "4.8%",
      change: "+0.3%",
      changeType: "positive",
      icon: Heart,
    },
  ]

  const recentVideos = [
    { 
      title: "Advanced YouTube Automation Tutorial", 
      views: "125,543", 
      likes: "8,892", 
      comments: "445",
      uploadDate: "2024-01-15",
      revenue: "$1,234"
    },
    { 
      title: "How to Schedule 100+ Videos", 
      views: "82,234", 
      likes: "5,567", 
      comments: "223",
      uploadDate: "2024-01-14",
      revenue: "$892"
    },
    { 
      title: "YouTube API Integration Guide", 
      views: "67,789", 
      likes: "4,334", 
      comments: "189",
      uploadDate: "2024-01-13",
      revenue: "$756"
    },
    { 
      title: "Building a Video Queue System", 
      views: "45,123", 
      likes: "3,221", 
      comments: "156",
      uploadDate: "2024-01-12",
      revenue: "$523"
    },
  ]

  const topPerformingVideos = [
    { title: "Advanced YouTube Automation Tutorial", performance: 95 },
    { title: "How to Schedule 100+ Videos", performance: 88 },
    { title: "YouTube API Integration Guide", performance: 82 },
    { title: "Building a Video Queue System", performance: 76 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-8 w-8 text-muted-foreground" />
                <span className={cn(
                  "text-sm px-2 py-1 rounded",
                  stat.changeType === "positive" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                )}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Recent Videos Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVideos.map((video, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.views} views • {video.likes} likes • {video.comments} comments
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploaded: {video.uploadDate} • Revenue: {video.revenue}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold">{video.revenue}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingVideos.map((video, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{video.title}</span>
                    <span className="text-sm font-bold">{video.performance}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div 
                      className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${video.performance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Total Likes</span>
                </div>
                <span className="font-medium">22,014</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Total Comments</span>
                </div>
                <span className="font-medium">1,013</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Watch Time</span>
                </div>
                <span className="font-medium">2,847 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">New Subscribers</span>
                </div>
                <span className="font-medium">2,567</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">$3,405</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold">$2,234</div>
                  <div className="text-xs text-muted-foreground">Ad Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">$1,171</div>
                  <div className="text-xs text-muted-foreground">Other Revenue</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm">Average per video</span>
                <span className="font-medium">$851</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
