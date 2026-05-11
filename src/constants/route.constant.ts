export const ROUTES = {
  landing: "/",
  dashboard: "/dashboard",
  upload: "/dashboard/upload",
  schedule: "/dashboard/schedule",
  queue: "/dashboard/queue",
  analytics: "/dashboard/analytics",
  settings: "/dashboard/settings",
  studio: "/dashboard/studio",
  downloader: "/dashboard/downloader",
  content: "/dashboard/content",
  channels: "/dashboard/channels",
  playlists: "/dashboard/playlists",
  interactions: "/dashboard/interactions",
  
  // Auth routes
  signin: "/auth/signin",
  signup: "/auth/signup",
  logout: "/auth/logout",
  
  // API routes
  api: {
    health: "/api/health",
    videos: "/api/videos",
    upload: "/api/upload",
    schedule: "/api/schedule",
    queue: "/api/queue",
    analytics: "/api/analytics",
    settings: "/api/settings",
    auth: "/api/auth",
    download: "/api/download",
    studio: "/api/studio",
  },
} as const

export const NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    href: ROUTES.dashboard,
    icon: "layoutDashboard",
  },
  {
    title: "Content",
    href: ROUTES.content,
    icon: "play",
  },
  {
    title: "Channels",
    href: ROUTES.channels,
    icon: "users",
  },
  {
    title: "Analytics",
    href: ROUTES.analytics,
    icon: "barChart",
  },
  {
    title: "Upload",
    href: ROUTES.upload,
    icon: "upload",
  },
  {
    title: "Schedule",
    href: ROUTES.schedule,
    icon: "calendar",
  },
  {
    title: "Queue",
    href: ROUTES.queue,
    icon: "list",
  },
  {
    title: "Downloader",
    href: ROUTES.downloader,
    icon: "download",
  },
  {
    title: "Studio",
    href: ROUTES.studio,
    icon: "scissors",
  },
  {
    title: "Settings",
    href: ROUTES.settings,
    icon: "settings",
  },
  {
    title: "Playlists",
    href: ROUTES.playlists,
    icon: "playCircle",
  },
  {
    title: "Community",
    href: ROUTES.interactions,
    icon: "messageSquare",
  },
] as const
