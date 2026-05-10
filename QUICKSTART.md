# 🚀 Quick Start Guide

## Prerequisites
- Node.js 20+
- pnpm (or npm/yarn)
- Docker (optional, for Redis)
- Git

---

## Installation

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env.local` and fill in the values:
```bash
cp .env.example .env.local
```

**Required for Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable YouTube API v3
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
6. Copy `Client ID` and `Client Secret` to `.env.local`

### 3. Setup Database
```bash
# Generate Drizzle migrations
pnpm db:generate

# Push schema to database
pnpm db:push

# View database in Drizzle Studio
pnpm db:studio
```

### 4. Setup Redis
Option A: Docker
```bash
docker run -d -p 6379:6379 redis:latest
```

Option B: Local Redis installation
```bash
redis-server
```

---

## Development

### Start Development Server
```bash
pnpm dev
```

Server will be available at `http://localhost:3000`

### API Testing
Use Postman or curl:
```bash
# Get user videos (requires authentication)
curl -X GET http://localhost:3000/api/videos \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check health
curl -X GET http://localhost:3000/api/health
```

---

## Project Structure

```
src/
├── app/                 # Next.js 16 app router
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   ├── upload/         # Upload pages
│   ├── schedule/       # Schedule pages
│   ├── queue/          # Queue pages
│   ├── analytics/      # Analytics pages
│   └── settings/       # Settings pages
│
├── components/         # Reusable components
│   ├── ui/            # Base UI components
│   ├── dashboard/     # Dashboard components
│   ├── landing/       # Landing page components
│   └── ...
│
├── lib/               # Core libraries
│   ├── auth/          # Authentication setup
│   ├── db/            # Database and schema
│   ├── queue/         # Queue system
│   ├── youtube/       # YouTube API service
│   ├── download/      # Download service
│   ├── services/      # Business logic
│   ├── logger.ts      # Logging setup
│   └── ...
│
├── schemas/           # Zod schemas for validation
├── types/             # TypeScript type definitions
├── constants/         # App constants
└── styles/            # Global styles
```

---

## API Endpoints

### Authentication
- All endpoints require a valid NextAuth session
- Session is automatically managed by NextAuth

### Core Endpoints

**Videos**
- `GET /api/videos` - List videos
- `POST /api/videos` - Create video
- `GET /api/videos/[id]` - Get video details
- `PUT /api/videos/[id]` - Update video
- `DELETE /api/videos/[id]` - Delete video

**Upload**
- `GET /api/upload` - Upload history
- `POST /api/upload` - Start upload

**Schedule**
- `GET /api/schedule` - List schedules
- `POST /api/schedule` - Create schedule

**Queue**
- `GET /api/queue` - Queue status
- `POST /api/queue` - Queue management

**Analytics**
- `GET /api/analytics` - Analytics data
- `POST /api/analytics` - Record analytics

**Settings**
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

**Download**
- `GET /api/download` - Download history
- `POST /api/download` - Start download

**Health**
- `GET /api/health` - System health check

---

## Database

### Drizzle Studio
View and manage database in browser:
```bash
pnpm db:studio
```

### Migrations
Generate new migrations after schema changes:
```bash
pnpm db:generate
pnpm db:push
```

---

## Linting & TypeScript

### Type Check
```bash
pnpm tsc --noEmit
```

### Lint Code
```bash
pnpm lint
```

### Fix Linting Issues
```bash
pnpm lint --fix
```

---

## Building

### Production Build
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

---

## Deployment

### Vercel (Recommended for Frontend)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Worker (Background Jobs)
Deploy to one of:
- Railway.app
- Fly.io
- Hetzner VPS

---

## Troubleshooting

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env.local`

### Database Connection Error
- Ensure Turso token is set: `TURSO_AUTH_TOKEN`
- Or use local SQLite: `DATABASE_URL=file:./dev.db`

### Google OAuth Not Working
- Verify OAuth credentials are correct
- Check redirect URIs in Google Cloud Console
- Ensure `NEXTAUTH_SECRET` is set

### Type Errors
Run type check to see all issues:
```bash
pnpm tsc --noEmit
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | ✅ | Auth callback URL |
| `NEXTAUTH_SECRET` | ✅ | Secret for JWT signing |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `DATABASE_URL` | ✅ | Database connection URL |
| `REDIS_URL` | ✅ | Redis connection URL |
| `TURSO_AUTH_TOKEN` | ⚠️ | Required for production DB |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public app URL |

---

## Performance Tips

1. Use Cloudflare R2 for video storage
2. Enable Redis persistence for queue stability
3. Use CDN for static assets
4. Implement database query caching
5. Monitor queue depths and job failures

---

## Next Steps

1. ✅ Install and setup (this guide)
2. 🔄 Run development server
3. 🧪 Test API endpoints
4. 🎨 Customize UI components
5. 📦 Deploy to production

---

## Support

For issues and questions:
1. Check environment variables
2. Review error logs in terminal
3. Check `.env.example` for required vars
4. Verify GitHub Actions workflow
5. Test health endpoint: `GET /api/health`

---

**Happy Coding! 🎬**
