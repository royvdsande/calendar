# Productive – Calendar + To-do SaaS Starter

A production-focused full-stack Next.js application that unifies personal tasks and calendar planning in one modern dashboard.

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn-style UI primitives
- NextAuth (credentials + Google OAuth)
- Prisma + PostgreSQL
- Google Calendar API sync
- Stripe-ready environment structure

## Features
- Secure sign up + sign in with credentials
- Google OAuth login
- Protected dashboard routes
- Task CRUD (create, complete, delete, due dates)
- Drag-and-drop task ordering UI
- Unified month calendar rendering app events + Google events
- One-click Google Calendar sync endpoint
- Dark/light mode
- Loading-ready UI primitives and empty states

## Project Structure
```txt
app/
  (auth)/login, signup
  (dashboard)/dashboard
  api/
components/
hooks/
lib/
prisma/
```

## Setup
1. Install dependencies:
```bash
npm install
```
2. Copy env file:
```bash
cp .env.example .env
```
3. Set up PostgreSQL and update `DATABASE_URL`.
4. Run Prisma:
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```
5. Start dev server:
```bash
npm run dev
```

## Google Calendar Setup
1. Go to Google Cloud Console.
2. Create OAuth credentials for web app.
3. Add callback URL:
   - `http://localhost:3000/api/auth/callback/google`
4. Enable Google Calendar API.
5. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. Sign in with Google and call `POST /api/calendar/sync` to import events.

## Stripe Setup (future premium features)
1. Create Stripe account and retrieve keys.
2. Populate:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
3. Use `lib/stripe.ts` to initialize payment flows.

## Deploy to Vercel
1. Push repository to GitHub.
2. Import project in Vercel.
3. Add all environment variables from `.env.example`.
4. Configure a hosted PostgreSQL instance.
5. In build settings, ensure Prisma generate runs:
   - `npm run prisma:generate && npm run build`

## Deploy to GitHub Pages (automatic)
1. Push to the `main` branch.
2. In GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions** (one-time).
3. Every new push to `main` deploys automatically without extra commands.

The app now auto-detects the GitHub repository path during Actions builds, so assets and routes work under `https://<user>.github.io/<repo>/` with no manual basePath setup.

