# Career Wave

Career Wave is a Next.js job board platform built with Prisma, NextAuth, Stripe, Inngest, Uploadthing, and Tailwind CSS. It supports company and job seeker onboarding, job posting, saved jobs, applications, and OAuth login via Google and GitHub.

## Key Features

- Public landing page with job search and discovery
- Google and GitHub authentication via NextAuth
- Company onboarding and job posting flow
- Job seeker onboarding and application flow
- Saved jobs and candidate application tracking
- Stripe-powered paid job postings
- Job expiration scheduling via Inngest
- File uploads via Uploadthing
- Resend integration for email notifications

## Tech Stack

- `Next.js 15` App Router
- `TypeScript`
- `Prisma` + PostgreSQL
- `NextAuth` for authentication
- `Stripe` payments
- `Inngest` for background job scheduling
- `Uploadthing` for file upload handling
- `Tailwind CSS`
- `Zod` for validation

## Project Structure

- `src/app/` - main app routes and pages
- `src/app/(mainLayout)/` - authenticated layout and main pages
- `src/app/api/` - API routes for auth, uploadthing, webhook, and Inngest
- `src/components/` - UI and form components
- `src/app/utils/` - shared utilities, database client, auth, schemas, and Stripe setup
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
SECRET_STRIPE_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
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
   pnpm prisma migrate dev --name init
   ```

   Or, if you just want to sync schema without migrations:
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

## Stripe

Stripe is used for paid job posting checkout and webhook handling. If you do not have Stripe configured, add these values to your `.env` and create the webhook in the Stripe dashboard:

- `SECRET_STRIPE_KEY`
- `STRIPE_WEBHOOK_SECRET`

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
- `SECRET_STRIPE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `ARCJET_KEY`

Also ensure your OAuth callback URLs are configured with your Vercel app domain:

- `https://your-vercel-domain.vercel.app/api/auth/callback/google`
- `https://your-vercel-domain.vercel.app/api/auth/callback/github`

If you use custom domains, replace the Vercel host accordingly.

## Notes

- The app expects `Company` and `JobSeeker` relationships in the database.
- `NextAuth` uses the `Account`, `Session`, and `VerificationToken` Prisma tables.
- Inngest functions are defined in `src/app/api/inngest/functions.ts`.


