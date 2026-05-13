export interface Keyframe {
  time: number // Relative to clip start
  value: number
  easing?: "linear" | "ease-in" | "ease-out"
}

export interface ClipEffect {
  type: "brightness" | "contrast" | "saturation" | "blur" | "grayscale"
  keyframes: Keyframe[]
}

export interface Mask {
  type: "rectangle" | "circle"
  x: number
  y: number
  width: number
  height: number
  feather: number
}

export interface Clip {
  id: string
  name: string
  assetId?: string // Link to the raw asset
  start: number // Time in project
  end: number // Time in project
  offset: number // Start time within the source asset
  duration: number
  color: string
  opacity: number
  volume: number // 0 to 1
  
  // Advanced Features
  effects?: ClipEffect[]
  mask?: Mask
  transitionIn?: "fade" | "dissolve" | "none"
  transitionOut?: "fade" | "dissolve" | "none"
  
  // Animation
  position?: { x: number; y: number }
  scale?: number
  rotation?: number
}

export interface Track {
  id: string
  name: string
  type: "video" | "audio" | "text"
  clips: Clip[]
  isLocked?: boolean
  isHidden?: boolean
}

export interface VideoProject {
  tracks: Track[]
  duration: number
  resolution: { width: number; height: number }
  fps: number
}

export interface VideoWithStats {
  id: string
  userId: string
  channelId: string | null
  title: string
  description: string | null
  tags: string | null
  categoryId: string
  defaultLanguage: string
  privacyStatus: "public" | "private" | "unlisted"
  license: "youtube" | "creativeCommon"
  location: string | null
  recordingDate?: string | null
  filePath: string | null
  fileSize: number | null
  duration: number | null
  thumbnailPath: string | null
  status: string
  youtubeVideoId: string | null
  publishAt: number | null
  publishedAt: number | null
  retryCount: number
  errorMessage: string | null
  metadata: string | null
  createdAt: number
  updatedAt: number
  views: number
  likes: number
}

export interface YouTubePlaylist {
  id: string
  snippet?: {
    title: string
    description?: string
    thumbnails?: {
      default?: { url: string }
      medium?: { url: string }
      high?: { url: string }
      standard?: { url: string }
      maxres?: { url: string }
    }
    publishedAt?: string
  }
  contentDetails?: {
    itemCount: number
  }
  status?: {
    privacyStatus: string
  }
}

export interface YouTubeComment {
  id: string
  snippet: {
    videoId: string
    topLevelComment: {
      id: string
      snippet: {
        authorDisplayName: string
        authorProfileImageUrl: string
        textOriginal: string
        likeCount: number
        publishedAt: string
      }
    }
    totalReplyCount: number
  }
}

export interface YouTubeSearchResult {
  kind?: string | null
  etag?: string | null
  id: {
    kind?: string | null
    videoId?: string | null
    channelId?: string | null
    playlistId?: string | null
  }
  snippet?: {
    title?: string | null
    description?: string | null
    thumbnails?: {
      default?: { url?: string | null }
      medium?: { url?: string | null }
      high?: { url?: string | null }
      standard?: { url?: string | null }
      maxres?: { url?: string | null }
    }
    publishedAt?: string | null
    channelTitle?: string | null
  }
}
