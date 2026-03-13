# Productive — Calendar + To-Do SaaS

A production-ready full-stack productivity dashboard that merges tasks and calendar planning in one interface (inspired by Todoist/TickTick workflows).

## 1) Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn-style UI
- **Backend:** Next.js Route Handlers (`app/api/*`)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth (Credentials + Google OAuth)
- **Integrations:** Google Calendar API (read + sync)
- **Payments (ready):** Stripe environment + utility scaffold

## 2) Core Features
- Email/password sign up + login
- Google OAuth login
- Protected dashboard routes
- Task CRUD (create, complete, delete)
- Optional task tags and due dates
- Drag-and-drop tasks with persisted order
- Calendar with **Day / Week / Month** modes
- Unified calendar showing app tasks + synced Google events
- One-click Google Calendar sync panel
- Dark mode / light mode
- Empty states and responsive layout

## 3) Project Structure
```txt
app/
  (auth)/login
  (auth)/signup
  (dashboard)/dashboard
  api/
    auth/[...nextauth]
    register
    tasks
    tasks/[taskId]
    calendar/sync
    events
components/
  dashboard/
  ui/
lib/
hooks/
prisma/
```

## 4) Database Models
Defined in `prisma/schema.prisma`:
- `User`
- `Task`
- `CalendarEvent`
- `ConnectedGoogleAccount`
- NextAuth support models: `Account`, `Session`, `VerificationToken`

## 5) Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

### Install & run
```bash
npm install
cp .env.example .env
```

Set values in `.env`, then:
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Open: `http://localhost:3000`

## 6) Environment Variables
Use `.env.example` as reference.

Required for core app:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Optional (future billing):
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Generate secret:
```bash
openssl rand -base64 32
```

## 7) Google Calendar API Setup
1. Go to Google Cloud Console.
2. Create/select a project.
3. Enable **Google Calendar API**.
4. Configure OAuth consent screen.
5. Create OAuth Client ID (**Web application**).
6. Add Authorized redirect URI(s):
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Vercel: `https://YOUR_DOMAIN/api/auth/callback/google`
7. Copy client ID/secret into env vars.
8. Sign in with Google, then in dashboard run **Sync now**.

## 8) Stripe Setup (optional scaffold)
1. Create Stripe account.
2. Copy publishable + secret + webhook secret into env vars.
3. Extend `lib/stripe.ts` when enabling premium plans.

## 9) Deploying to Vercel (GitHub connected)

Since GitHub + Vercel are already connected, use this checklist:

1. Push your branch to GitHub.
2. In Vercel project settings, set **Root Directory** to repo root.
3. Add all environment variables from `.env.example` for Production/Preview.
4. Attach a production PostgreSQL database (Neon, Supabase, RDS, etc.).
5. Confirm Build Command (also in `vercel.json`):
   ```bash
   npm run prisma:generate && npm run build
   ```
6. (Recommended) Set Install Command to `npm install`.
7. Deploy.

### Important for Prisma on Vercel
- Prisma Client must be generated during build (already handled).
- After first production DB setup, run migrations against production DB:
  ```bash
  npx prisma migrate deploy
  ```
  You can run this from CI or manually with production env vars.

## 10) Suggested Production Hardening
- Add rate limiting to auth and mutating routes.
- Add background sync job for Google events (cron).
- Add Sentry/Logtail monitoring.
- Add e2e tests (Playwright) and CI checks.
