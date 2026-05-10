export const BRAND_CONFIG = {
  name: "StudioBucket",
  tagline: "Automate Your YouTube Pipeline",
  description: "Industrial-grade YouTube automation with queue-based publishing and real-time analytics",

  colors: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
    secondary: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
  },

  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
  },

  logo: {
    icon: "play-circle",
    variant: "gradient",
  },
} as const

export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/studiobucket",
  github: "https://github.com/studiobucket",
  discord: "https://discord.gg/studiobucket",
  youtube: "https://youtube.com/@studiobucket",
} as const

export const CONTACT_INFO = {
  email: "support@studiobucket.app",
  support: "help@studiobucket.app",
  sales: "sales@studiobucket.app",
} as const
