# Career Wave

Career Wave is a Next.js job board platform built with Prisma, NextAuth, Inngest, Uploadthing, Arcjet, and Tailwind CSS. It supports company and job seeker onboarding, direct job posting, saved jobs, and an application tracking flow, with OAuth login via Google and GitHub.

## Key Features

- Public landing page with server-side job search, filtering, and sorting
- Google and GitHub authentication via NextAuth
- Company onboarding and job posting flow
- Job seeker onboarding and job application flow
- Saved jobs ("Favorites") for job seekers
- Company-side candidate application tracking dashboard (status updates, notes)
- Immediate active job posting flow
- Job expiration scheduling via Inngest, with cancellation on manual delete
- File uploads via Uploadthing (company logos, PDF resumes)
- Bot/abuse protection on all mutating server actions via Arcjet
- Basic rule-based chat widget (keyword-matched FAQ responses, not AI-generated)

## Known Limitations / Not Fully Implemented

- **Chatbot is not AI-powered.** `/api/chat` matches keywords (e.g. "job", "career", "company") against a small set of hardcoded canned responses. There is no LLM integration.
- **Search suggestions are static, not analytics-driven.** `SearchSuggestions.tsx` renders a hardcoded list of popular searches/locations/companies. A `searchAnalytics.ts` utility exists with tracking/suggestion functions but is not called anywhere in the app and uses in-memory (non-persistent) storage — it is currently dead code.
- **Periodic job listing emails go to a single hardcoded address**, not to individual job seekers. The Inngest function `sendPeriodicJobListings` does not look up the job seeker's real email from `userId`.
- **Arcjet configuration is minimal.** Only `shield` and `detectBot` rules are applied; `fixedWindow`/`tokenBucket` rate-limiting helpers are imported/exported but unused.

## Tech Stack

- `Next.js 15` App Router
- `TypeScript`
- `Prisma` + PostgreSQL
- `NextAuth` for authentication
- `Inngest` for background job scheduling
- `Uploadthing` for file upload handling
- `Arcjet` for bot detection / request shielding
- `Resend` for transactional email
- `Tiptap` for rich text job description editing
- `Tailwind CSS`
- `Zod` for validation

## Project Structure

- `src/app/` - main app routes and pages
- `src/app/(mainLayout)/` - authenticated layout and main pages
- `src/app/api/` - API routes for auth, uploadthing, inngest, and chat
- `src/components/` - UI and form components
- `src/app/utils/` - shared utilities, database client, auth, and schemas
- `src/app/action.ts` - server actions (job posting, applications, saved jobs)
- `prisma/schema.prisma` - database schema

## Environment Variables

Create a `.env` file with the following values:

```env
AUTH_SECRET=your-random-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
DATABASE_URL=postgresql://user:password@host:port/database
UPLOADTHING_TOKEN=your-uploadthing-token
NEXT_PUBLIC_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=your-resend-api-key
ARCJET_KEY=your-arcjet-key
```

> Do not commit `.env` to source control.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Generate Prisma client:
   ```bash
   pnpm prisma generate
   ```

3. Run database migrations or push schema:
   ```bash
   pnpm prisma db push
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Auth callback URLs

For local development, configure Google and GitHub OAuth redirect URLs as:

- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/github`

## Inngest

Inngest functions live in `src/app/api/inngest/functions.ts`:

- `handleJobExpiration` — listens for `job/created`, sleeps for the selected listing duration, then sets the job's status to `EXPIRED`. Cancelled early if `job/cancel.expiration` is sent (triggered on manual job deletion).
- `sendPeriodicJobListings` — listens for `jobseeker/created` and periodically emails active job listings via Resend. Currently sends to a single hardcoded address rather than the individual job seeker; needs to be updated to use the job seeker's real email before this is production-ready.
- `helloWorld` — example/boilerplate function, not used by the app.

## Deployment on Vercel

To deploy on Vercel, make sure you set the same environment variables in the Vercel dashboard. At minimum, configure:

- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `DATABASE_URL`
- `UPLOADTHING_TOKEN`
- `NEXT_PUBLIC_URL`
- `NEXTAUTH_URL`
- `RESEND_API_KEY`
- `ARCJET_KEY`

Also ensure your OAuth callback URLs are configured with your Vercel app domain:

- `https://your-vercel-domain.vercel.app/api/auth/callback/google`
- `https://your-vercel-domain.vercel.app/api/auth/callback/github`

If you use custom domains, replace the Vercel host accordingly.

## Notes

- The app expects `Company` and `JobSeeker` relationships in the database.
- `NextAuth` uses the `Account`, `Session`, and `VerificationToken` Prisma tables.
- Every mutating server action in `src/app/action.ts` runs through Arcjet's `shield` and `detectBot` rules before executing.
- Public job listings show all jobs with `status: ACTIVE`.