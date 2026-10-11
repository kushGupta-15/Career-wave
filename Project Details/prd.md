# Product Requirements Document (PRD) - Career Wave

## 1. Product Overview

**Career Wave** is an AI-powered, full-stack job board and Applicant Tracking System (ATS) designed to streamline hiring for companies and career discovery for job seekers. Built using Next.js 15, TypeScript, PostgreSQL (Neon), Prisma v6, Google Gemini 3.8 Flash, Stripe Checkout, NextAuth v5, Arcjet, UploadThing, Resend, and Inngest, Career Wave delivers a fast, secure, and modern hiring ecosystem.

The platform supports role-based onboarding for employers and candidates, listing monetization via Stripe Checkout, automated resume ATS analysis powered by Gemini AI, an interactive candidate tracking system, PDF resume previewing, bot/abuse protection, and serverless event-driven background processing for listing expiration.

---

## 2. Problem Statement

Finding and hiring talent—or discovering the right career opportunity—is often hampered by legacy job portals with clunky user experiences, vulnerability to spam submissions, and opaque application status tracking:

- **For Job Seekers**:
  - Lack of visibility into application progression after submitting a resume.
  - Difficulty determining whether their resume aligns with complex job requirements.
  - Fragmented experience searching, filtering, and bookmarking positions across salary ranges and employment types.
  - Inability to withdraw submitted applications or preview uploaded files.

- **For Employers & Companies**:
  - High susceptibility to bot-generated application spam and automated abuse.
  - Lack of integrated listing monetization and exposure options.
  - Difficulty reviewing candidate resumes without tedious external downloads.
  - Manual, unautomated listing maintenance leading to stale or outdated job posts remaining active.
  - Absence of real-time pipeline analytics (applicants, saves, active listings).

---

## 3. Product Goals & Objectives

- **Monetized Job Posting**: Provide a streamlined job post publishing flow for employers with selectable duration packages ($29 for 7 days up to $399 for 180 days) powered by Stripe Checkout.
- **AI-Powered Candidate Evaluation**: Leverage Google Gemini 3.8 Flash to calculate ATS match percentage scores, highlight candidate strengths, and suggest keyword additions based on real job requirements.
- **Complete Candidate Application Lifecycle**: Enable job seekers to apply with custom cover letters and uploaded resumes, inspect application status changes, and safely withdraw applications if desired.
- **Recruiter ATS with In-Browser PDF Preview**: Give companies a centralized dashboard to track applicants, review PDF resumes directly in the browser, record private evaluation notes, and update statuses.
- **Robust Security & Anti-Abuse**: Integrate bot detection, request shielding, and route protection middleware using Arcjet and Next.js Edge Middleware.
- **Automated Lifecycle & Event Management**: Leverage Inngest serverless event-driven functions to handle job post expirations automatically, paired with Resend transactional email notifications.

---

## 4. Target Users

### 4.1 Job Seekers
- **Profile**: Professionals searching for full-time, part-time, contract, or remote career opportunities.
- **Key Needs**:
  - Fast server-side job search and multi-criteria filtering (location, salary range, employment type).
  - AI ATS match analysis comparing their profile/resume against job requirements with instant feedback.
  - One-click or quick-apply workflows using saved resume profiles or custom uploads.
  - A personal "My Applications" dashboard to track application status updates (`PENDING`, `SHORTLISTED`, `INTERVIEWED`, etc.) with withdrawal support.
  - Ability to bookmark favorite jobs for later review.

### 4.2 Employers & Hiring Managers (Companies)
- **Profile**: Recruiters, HR representatives, and business owners looking to hire talent.
- **Key Needs**:
  - Dedicated company profile setup (branding, logo, website, bio) and public company showcase page.
  - WYSIWYG job post creation with rich text formatting (Tiptap) and benefit tag selection.
  - Secure Stripe checkout to sponsor and activate listings.
  - Real-time recruiter analytics dashboard (Total listings, Active listings, Total applicants, Saves).
  - An intuitive Applicant Management System (`/applications`) to review candidate cover letters, preview PDF resumes in-browser, add internal notes, and update applicant statuses.

---

## 5. Core Features & Functional Requirements

### 5.1 Authentication & Role-Based Onboarding
- **OAuth Providers**: Seamless sign-in via Google and GitHub managed by NextAuth.js v5.
- **Edge Route Protection**: Next.js middleware restricting authenticated-only routes (`/post-job`, `/my-jobs`, `/applications`, `/favorites`).
- **Onboarding Flow**:
  - New users select their persona: **Company** or **Job Seeker**.
  - **Company Onboarding**: Collects company name, location, logo upload (UploadThing), website URL, and overview.
  - **Job Seeker Onboarding**: Collects full name, bio/summary, and default PDF resume upload.

### 5.2 Public Job Discovery & Advanced Search
- **Server-Side Rendered Listings**: High-performance job feed showing active jobs only (`status: ACTIVE`).
- **Filtering Capabilities**:
  - Free-text search (job title, keywords, company name).
  - Location filtering (worldwide and per-country).
  - Employment type toggle (Full-Time, Part-Time, Contract, Internship).
  - Salary range dynamic slider filter.
- **Dynamic OpenGraph Metadata**: Automatic SEO card generation for social sharing on Twitter/X, LinkedIn, and Discord.

### 5.3 Monetization & Job Posting Flow (Stripe)
- **Rich-Text Description Editor**: Tiptap-powered editor supporting bold, lists, headings, and formatting.
- **Benefit Selection**: Selectable benefit tags (e.g., Remote Work, Health Insurance, 401(k), Flexible Hours).
- **Tiered Listing Duration Packages**:
  - 7 Days ($29)
  - 14 Days ($49)
  - 30 Days ($99)
  - 45 Days ($139)
  - 60 Days ($179)
  - 90 Days ($249)
  - 120 Days ($299)
  - 180 Days ($399)
- **Job Lifecycle**:
  1. Job submission creates a `DRAFT` status record in PostgreSQL.
  2. Stripe Checkout session is created with metadata linking to `jobId`.
  3. Upon payment success (via `/payment/success` verification or Stripe webhook), the job transitions to `ACTIVE`.
  4. Inngest receives a `job/created` event and schedules an expiration timer based on listing duration.
  5. Draft jobs can be resumed and paid at any time via "Pay & Publish" in the recruiter dashboard.

### 5.4 AI-Powered Career Tools (Google Gemini 3.8 Flash)
- **Gemini AI Career Assistant (`/api/chat`)**:
  - Interactive chatbot powered by `gemini-3.8-flash`.
  - Injects live PostgreSQL active job listings into system context so candidate recommendations are grounded in real positions.
  - Protected with Arcjet bot detection.
- **AI Resume & ATS Match Analyzer**:
  - Compares candidate resume against target job requirements.
  - Generates an ATS alignment percentage score.
  - Identifies key candidate strengths and specific missing keywords to include before applying.

### 5.5 Application Tracking System (ATS)
- **Application Submission**:
  - Job seekers apply with a cover letter and resume link (backed by UploadThing validation).
  - Duplicate applications are prevented via `[userId, jobPostId]` unique database constraints.
  - Direct application flow automatically initializes candidate profile if not yet onboarded.
- **Employer Dashboard (`/applications`)**:
  - View all applications grouped by job post.
  - Inspect candidate details, cover letters, and preview PDF resumes in an interactive modal.
  - Update candidate status (`PENDING`, `REVIEWED`, `SHORTLISTED`, `INTERVIEWED`, `REJECTED`, `HIRED`).
  - Add private internal candidate notes.
- **Candidate Dashboard (`/my-applications`)**:
  - Real-time view of applied jobs with current status badges.
  - Candidate application withdrawal with confirmation dialog and database cleanup.
- **Transactional Notifications (Resend)**:
  - Automated confirmation emails sent to candidates upon submission.
  - New applicant alerts dispatched to hiring managers.
  - Candidate status update emails dispatched upon recruiter evaluation.

### 5.6 Automated Background Operations (Inngest)
- **Job Expiration Handler**: Triggers a delayed sleep step matched to `listingDuration` days, after which `status` is set to `EXPIRED`.
- **Cancellation Event**: Automatically cancels the pending expiration job if the post is deleted manually by the company.

### 5.7 Security & Request Shielding (Arcjet)
- All mutating Next.js Server Actions evaluate Arcjet request protection (`shield`, `detectBot`, and rate limiting) before executing database operations.
