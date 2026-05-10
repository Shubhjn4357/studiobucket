# StudioBucket: Infinite Space for YouTube Automation

StudioBucket is a professional-grade, industrial-scale YouTube automation platform. It provides a minimalist, immersive "Infinite Space" environment for creators to manage content empires with zero friction.

## 🌌 Core Product Vision
- **Immersive Design**: A high-performance, dark-mode-first aesthetic with obsidian tones and glassmorphic interfaces.
- **Mission Control**: A centralized telemetry dashboard for real-time channel analytics and queue monitoring.
- **Integrated Video Studio**: A non-destructive, browser-based multi-track editor for 4K ProRes pipelines.
- **Autonomous Intelligence**: AI-driven metadata generation and strategic content planning.

## 🚀 Features
- **Batch Upload**: High-speed parallel transmissions with real-time status tracking.
- **Multi-Track Timeline**: Layer video, audio, and text with precision transformation controls.
- **Strategic Planner**: Calendar-based scheduling for global audience synchronization.
- **Advanced Downloader**: Extract high-quality assets from any source for repurposing.
- **Adaptive Infrastructure**: Designed to run anywhere—from local dev environments to distributed background workers.

## 🗺️ App Sitemap
- **(Landing)**: `/` (High-impact 3D hero, features, pricing)
- **Dashboard**: `/dashboard` (Mission Control)
- **Studio**: `/dashboard/studio` (Integrated Editor)
- **Downloader**: `/dashboard/downloader` (Asset Extraction)
- **Queue**: `/dashboard/queue` (Transmission Telemetry)
- **Analytics**: `/dashboard/analytics` (Performance Metrics)
- **Settings**: `/dashboard/settings` (System Configuration)

## 📂 Folder Structure
```text
src/
├── app/               # Next.js App Router (Routing & Pages)
│   ├── (landing)/     # Public landing pages
│   └── dashboard/     # Protected dashboard sub-applications
├── components/        # UI Component Library
│   ├── dashboard/     # Sub-app specific components
│   ├── landing/       # Landing page specific components
│   └── ui/            # Shadcn/UI primitives
├── lib/               # Core System Logic
│   ├── db/            # Drizzle ORM Schema & DB Client
│   ├── queue/         # Background Processing (BullMQ)
│   ├── services/      # Data Access Layer & Business Logic
│   └── youtube/       # Google/YouTube API Integration
└── server/            # Server Actions & API Utilities
```

## 🛠️ Setup Instructions

### 1. Prerequisites
- **Node.js**: v20+ 
- **PNPM**: Fast, disk space efficient package manager.
- **Database**: Turso (SQLite) or local SQLite.
- **Redis (Optional)**: Required only for background worker queues.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/shubhjn4357/studiobucket.git

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
```

### 3. Database Initialization
```bash
# Push schema to database
pnpm db:push
```

### 4. Launch Development
```bash
pnpm dev
```

## ✅ Recently Finalized
1. **Production Workers**: Full `ffmpeg` and `yt-dlp` integration implemented in `src/lib/queue/workers/`.
2. **YouTube API**: Core upload, scheduling, and metadata management fully wired via `YouTubeService`.
3. **Local Asset Engine**: Optimized for local-only storage (no cloud required). All assets persist in `public/uploads`.
4. **AI Core**: Metadata and strategy engine connected to LLM orchestration.

## ⚙️ Architecture Note: Optional Redis & Workers
StudioBucket is designed to be lightweight by default.
- **Standalone Mode**: If `REDIS_URL` is missing, the app operates in standalone mode. Queues are bypassed, and operations happen synchronously.
- **Distributed Mode**: Provide a `REDIS_URL` and run `pnpm worker` to enable robust background processing for high-volume rendering and upload pipelines.


