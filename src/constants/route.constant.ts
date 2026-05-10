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
  
  // Auth routes
  login: "/auth/login",
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
    title: "Analytics",
    href: ROUTES.analytics,
    icon: "barChart",
  },
  {
    title: "Downloader",
    href: ROUTES.downloader,
    icon: "download",
  },
  {
    title: "Studio",
    href: ROUTES.studio,
    icon: "video",
  },
  {
    title: "Settings",
    href: ROUTES.settings,
    icon: "settings",
  },
] as const
