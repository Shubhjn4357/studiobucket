"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"

const Upload = Icons.upload
const RefreshCw = Icons.refreshCw
const Folder = Icons.folder
const FileVideo = Icons.fileVideo
const Trash2 = Icons.trash2
const Plus = Icons.plus

interface UploadItem {
  id: string
  name: string
  status: "uploading" | "completed" | "failed" | "waiting"
  progress: number
}

export function UploadManager() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    multiple: true,
    onDrop: (files: File[]) => {
      setUploadedFiles(prev => [...prev, ...files])
    }
  })

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return

    setIsUploading(true)
    
    // Add to queue as waiting/uploading
    const newItems: UploadItem[] = uploadedFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      status: "uploading",
      progress: 0
    }))
    
    setUploadQueue(prev => [...newItems, ...prev])
    setUploadedFiles([])

    try {
      const formData = new FormData()
      uploadedFiles.forEach(file => formData.append('files', file))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")
      
      const { uploaded } = await response.json()
      
      setUploadQueue(prev => prev.map(item => {
        const uploadedFile = uploaded.find((u: { name: string }) => u.name === item.name)
        if (uploadedFile) {
          return { ...item, status: "completed", progress: 100 }
        }
        return item
      }))
    } catch (error) {
      setUploadQueue(prev => prev.map(item => 
        newItems.find(n => n.id === item.id) 
          ? { ...item, status: "failed", progress: 0 } 
          : item
      ))
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploading":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Upload Manager</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Upload
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">
                {isDragActive ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to select files
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Files:</h4>
                <div className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <FileVideo className="h-4 w-4" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Upload Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">Active:</span> 1
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {uploadQueue.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileVideo className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <div className="w-32 bg-background rounded-full h-2 mt-1">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all",
                            item.status === "uploading" && "bg-blue-500",
                            item.status === "completed" && "bg-green-500",
                            item.status === "failed" && "bg-red-500"
                          )}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      getStatusColor(item.status)
                    )}>
                      {item.status}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
