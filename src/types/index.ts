// User types
export type UserRole = "user" | "admin"

export interface AuthSession {
    user: {
        id: string
        name?: string
        email: string
        image?: string
    }
    expires: string
}

// Video types
export interface VideoStatus {
    status:
    | "pending"
    | "processing"
    | "uploaded"
    | "scheduled"
    | "published"
    | "failed"
    progress?: number
    error?: string
}

export interface VideoMetadata {
    duration: number
    width?: number
    height?: number
    fps?: number
    codec?: string
    bitrate?: number
}

// Queue types
export interface QueueJob {
    id: string
    name: string
    data: Record<string, unknown>
    status: string
    progress?: number
    attempts: number
    attemptsMade: number
    timestamp: number
}

export interface QueueStats {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
    total: number
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T = unknown> {
    success: boolean
    data: T[]
    pagination: {
        total: number
        page: number
        limit: number
        pages: number
    }
}

// Upload types
export interface UploadProgress {
    videoId: string
    fileName: string
    uploadedBytes: number
    totalBytes: number
    percentComplete: number
    speed: number
    eta: number
    status: "uploading" | "processing" | "completed" | "failed"
}

// Download types
export interface DownloadProgress {
    sourceUrl: string
    fileName: string
    downloadedBytes: number
    totalBytes: number
    percentComplete: number
    speed: number
    eta: number
    status: "downloading" | "processing" | "completed" | "failed"
}

// Notification types
export type NotificationType =
    | "success"
    | "error"
    | "warning"
    | "info"

export interface Notification {
    id: string
    type: NotificationType
    title: string
    message: string
    timestamp: number
    read: boolean
}
