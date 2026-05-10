export interface Clip {
  id: string
  start: number
  end: number
  duration: number
  color: string
}

export interface Track {
  id: string
  name: string
  type: "video" | "audio" | "text"
  clips: Clip[]
}

export interface VideoProject {
  tracks: Track[]
  duration: number
}
