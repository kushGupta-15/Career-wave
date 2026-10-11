<div align="center">

# 🌊 Career Wave

**An AI-Powered, Full-Stack Job Board & Recruiter ATS Platform**

Built with **Next.js 15 (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma**, **Google Gemini 3.8 Flash**, **Stripe Checkout**, **Inngest**, **NextAuth v5**, and **Tailwind CSS**.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.12-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash-4285F4?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?style=flat&logo=stripe)](https://stripe.com/)
[![Inngest](https://img.shields.io/badge/Inngest-Event--Driven-000000?style=flat&logo=inngest)](https://www.inngest.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[🌐 Live Production Demo](https://career-wave-hm4q.vercel.app/) • [📖 Product Requirements Document](Project%20Details/prd.md) • [🏗️ Architecture Documentation](Project%20Details/architecture.md)

</div>

---

## 🌟 Overview

**Career Wave** is a modern, enterprise-grade job board and Applicant Tracking System (ATS) connecting hiring organizations with top candidates. Engineered from the ground up to solve the shortcomings of legacy job boards, it pairs instant candidate discovery with **Google Gemini 3.8 Flash AI** for automated resume scoring, **Stripe Checkout** for listing monetization, **Inngest** for serverless event scheduling, and **Arcjet** for bot/DDoS protection.

---

## ✨ Key Features

### 🤖 1. AI-Powered Portfolio Superchargers
- **Gemini 3.8 Flash Career Assistant (`/api/chat`):** A real-time conversational AI grounded in live PostgreSQL database context to recommend active job listings based on candidate queries, salary targets, and location preferences.
- **AI Resume & ATS Match Score Analyzer:** Evaluates candidate profiles against target job descriptions in real-time, outputting percentage compatibility scores, key candidate strengths, and keyword gap recommendations.

### 💳 2. Monetization & Stripe Checkout
- **Tiered Job Listing Durations:** Customizable listing periods ($29 for 7 days up to $399 for 180 days) powered by Stripe Checkout sessions.
- **Draft & Resume Checkout Flow:** Unpaid job posts are safely staged in `DRAFT` status with a one-click "Pay & Publish" trigger from the recruiter dashboard.
- **Webhook Automation (`/api/webhook/stripe`):** Asynchronously verifies payment events (`checkout.session.completed`) and transitions listings to `ACTIVE`.

### 📊 3. Recruiter ATS & Analytics Dashboard
- **Executive Metrics:** High-level overview cards tracking Total Listings, Active Posts, Aggregate Applicants, and Candidate Saves.
- **In-Browser PDF Resume Preview:** Dedicated modal previewer enabling hiring managers to inspect candidate resumes directly without external downloads.
- **Candidate Lifecycle Pipeline:** Real-time applicant status management (`PENDING`, `REVIEWED`, `SHORTLISTED`, `INTERVIEWED`, `REJECTED`, `HIRED`) with internal recruiter notes.

### 👤 4. Candidate Experience & Discovery
- **Faceted Job Search:** High-performance filters by location, employment type (Full-Time, Part-Time, Contract, Remote), and salary range.
- **Direct Resume Application:** Frictionless application modal with auto-profile generation, instant resume file upload, and cover letter support.
- **Candidate Withdrawal:** Allows job seekers to withdraw active applications with confirmation modals and automated database cleanups.
- **Company Brand Profiles (`/company/[companyId]`):** Dedicated public showcase pages displaying company bio, active positions, and verified hiring links.

### 🔒 5. Enterprise Security & Resilience
- **Edge Route Protection:** Centralized Next.js middleware guarding authenticated dashboard routes (`/post-job`, `/my-jobs`, `/applications`, `/favorites`).
- **Arcjet Attack Defense:** Server Actions and API endpoints protected by Arcjet's rate limiting, request shielding, and bot detection.
- **Transactional Notifications (Resend):** Automated email confirmations sent to candidates upon submission and status updates, paired with recruiter applicant alerts.
- **Automated Lifecycle Maintenance (Inngest):** Serverless background workflows handling automatic job expiration and cancellation triggers.

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 15.1.12](https://nextjs.org/) | App Router, React Server Components (RSC), and Server Actions |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict end-to-end static typing |
| **Database** | [PostgreSQL (Neon)](https://neon.tech/) | Cloud-native serverless PostgreSQL database |
| **ORM** | [Prisma v6](https://www.prisma.io/) | Schema modeling, relations, cascade deletes, and migrations |
| **Artificial Intelligence** | [Google GenAI SDK](https://github.com/google/generative-ai-js) | Powered by `gemini-3.8-flash` |
| **Payments** | [Stripe](https://stripe.com/) | Hosted Checkout Sessions and webhook lifecycle handling |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) | OAuth 2.0 (Google & GitHub) with session database persistence |
| **Background Workflows** | [Inngest](https://www.inngest.com/) | Durable event-driven job expiration scheduling |
| **File Storage** | [UploadThing](https://uploadthing.com/) | Cloud hosting for company logos and PDF candidate resumes |
| **Transactional Email** | [Resend](https://resend.com/) | React-based email delivery for applicant and recruiter alerts |
| **Security** | [Arcjet](https://arcjet.com/) | WAF shield, rate limiting, and automated bot detection |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) | Accessible component primitives and dark/light themes |

---

## 📁 Project Structure

```
Career-wave/
├── prisma/
│   └── schema.prisma                 # PostgreSQL database schema & models
├── Project Details/
│   ├── prd.md                        # Product Requirements Document
│   └── architecture.md               # Technical architecture & sequence diagrams
├── public/                           # Static public assets
├── src/
│   ├── app/
│   │   ├── (mainLayout)/             # Core authenticated & public application pages
│   │   │   ├── applications/         # Recruiter candidate tracking table
│   │   │   ├── company/[companyId]/  # Public company profile page
│   │   │   ├── favorites/            # Saved jobs dashboard for candidates
│   │   │   ├── job/[jobId]/          # Job details, apply modal & AI match analyzer
│   │   │   ├── jobs/                 # Browse all active jobs directory
│   │   │   ├── my-applications/      # Candidate tracking dashboard & withdrawal
│   │   │   ├── my-jobs/              # Recruiter dashboard with analytics & draft checkout
│   │   │   ├── payment/              # Stripe checkout return pages (success & cancel)
│   │   │   ├── post-job/             # Job post creation with duration pricing
│   │   │   └── page.tsx              # Public landing page with search
│   │   ├── api/                      # Serverless API routes
│   │   │   ├── auth/[...nextauth]/   # NextAuth authentication handlers
│   │   │   ├── chat/                 # Gemini 3.8 Flash AI assistant route
│   │   │   ├── inngest/              # Inngest background event endpoint
│   │   │   ├── uploadthing/          # UploadThing file upload endpoint
│   │   │   └── webhook/stripe/       # Stripe checkout webhook handler
│   │   ├── action.ts                 # Type-safe Next.js Server Actions
│   │   └── middleware.ts             # Route protection middleware
│   ├── components/
│   │   ├── forms/                    # Form components (Job creation, onboarding, applications)
│   │   ├── general/                  # Shared UI components (AI Matcher, Table, Cards)
│   │   ├── richTextEditor.tsx/       # Tiptap rich-text editor components
│   │   └── ui/                       # Radix UI primitives (Button, Dialog, Sheet, etc.)
│   └── lib/                          # Helper utilities
└── package.json                      # Project dependencies & scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- [npm](https://www.npmjs.com/) (recommended package manager)
- A PostgreSQL database instance (e.g. Neon, Supabase, or local)

### 2. Clone and Install
```bash
git clone https://github.com/kushGupta-15/Career-wave.git
cd Career-wave
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root:

```env
# Authentication (NextAuth v5)
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_URL="http://localhost:3000"

# Database (PostgreSQL / Neon)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# File Uploads (UploadThing)
UPLOADTHING_TOKEN="your-uploadthing-token"

# Transactional Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# Security & Shielding (Arcjet)
ARCJET_KEY="your-arcjet-key"

# Artificial Intelligence (Google Gemini)
GEMINI_API_KEY="your-gemini-api-key"

# Monetization (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Database Setup
```bash
# Push schema to PostgreSQL database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing & Verification

```bash
# Run TypeScript typecheck
npx tsc --noEmit

# Run Next.js production build
npm run build
```

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).