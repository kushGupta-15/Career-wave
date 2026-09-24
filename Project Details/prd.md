# Product Requirements Document (PRD) - Career Wave

## 1. Product Overview

**Career Wave** is a modern, full-stack job board platform designed to streamline the hiring process for companies and career discovery for job seekers. Built using Next.js 15, TypeScript, Prisma, NextAuth v5, Arcjet, Uploadthing, and Inngest, Career Wave delivers a fast, secure, and intuitive job matching ecosystem.

The platform supports role-based onboarding for employers and candidates, streamlined job posting with selectable listing durations, a candidate Application Tracking System (ATS), interactive rich-text job editing, bot/abuse protection, and background task processing for automated job expiration.

---

## 2. Problem Statement

Finding and hiring talent—or discovering the right career opportunity—is often hampered by legacy job portals with clunky user experiences, vulnerability to spam submissions, and opaque application status tracking:

- **For Job Seekers**:
  - Lack of visibility into application progression after submitting a resume.
  - Fragmented experience when searching, filtering, and bookmarking positions across salary ranges and employment types.
  - Opaque requirement descriptions that lack structured layout and benefits details.

- **For Employers & Companies**:
  - High susceptibility to bot-generated application spam and automated abuse.
  - Complex listing administration flows.
  - Difficulty reviewing candidate applications, managing candidate statuses, and retaining recruitment notes in a single dashboard.
  - Unautomated listing maintenance leading to stale or outdated job posts remaining active.

---

## 3. Product Goals & Objectives

- **Direct Job Posting**: Provide an effortless job post publishing flow for employers with customizable listing durations (e.g., 30, 60, or 90 days) and automated expiration.
- **Streamlined Candidate Application & Tracking**: Enable job seekers to apply with custom cover letters and uploaded resumes while giving companies a centralized dashboard to track, rate, and respond to applicants.
- **Robust Security & Anti-Abuse**: Integrate bot detection and request shielding across all mutating server operations using Arcjet.
- **Automated Lifecycle Management**: Leverage Inngest serverless event-driven functions to handle job post expirations and periodic candidate engagement automatically.
- **Responsive & Accessible UX**: Offer a modern interface with dark/light themes, rich text editing, responsive search filters, and real-time status feedback.

---

## 4. Target Users

### 4.1 Job Seekers
- **Profile**: Professionals searching for full-time, part-time, contract, or remote career opportunities.
- **Key Needs**:
  - Fast server-side job search and multi-criteria filtering (location, salary range, employment type).
  - One-click or quick-apply workflows using saved resume profiles or custom uploads.
  - A personal "My Applications" dashboard to track application status updates (`PENDING`, `SHORTLISTED`, `INTERVIEWED`, etc.).
  - Ability to bookmark favorite jobs for later review.

### 4.2 Employers & Hiring Managers (Companies)
- **Profile**: Recruiters, HR representatives, and business owners looking to hire talent.
- **Key Needs**:
  - Dedicated company profile setup (branding, logo, website, bio).
  - WYSIWYG job post creation with rich text formatting (Tiptap) and benefit tag selection.
  - Instant job publishing and activation.
  - An intuitive Applicant Management System (`/applications`) to review candidate cover letters, inspect PDF resumes, add internal notes, and update applicant statuses.

---

## 5. Core Features & Functional Requirements

### 5.1 Authentication & Role-Based Onboarding
- **OAuth Providers**: Seamless sign-in via Google and GitHub managed by NextAuth.js v5.
- **Onboarding Flow**:
  - New users select their persona: **Company** or **Job Seeker**.
  - **Company Onboarding**: Collects company name, location, logo upload (Uploadthing), website URL, and overview.
  - **Job Seeker Onboarding**: Collects full name, bio/summary, and default PDF resume upload.

### 5.2 Public Job Discovery & Advanced Search
- **Server-Side Rendered Listings**: High-performance job feed showing active jobs only (`status: ACTIVE`).
- **Filtering Capabilities**:
  - Free-text search (job title, keywords).
  - Location filtering.
  - Employment type toggle (Full-Time, Part-Time, Contract, Internship).
  - Salary range dynamic slider filter.
- **Pagination**: Structured page navigation for viewing matching listings.

### 5.3 Job Posting Flow
- **Rich-Text Description Editor**: Tiptap-powered editor supporting bold, lists, headings, and formatting.
- **Benefit Selection**: Selectable benefit tags (e.g., Remote Work, Health Insurance, 401(k), Flexible Hours).
- **Duration Selection**: Choice of listing duration (30, 60, or 90 days).
- **Job Lifecycle**:
  1. Job submission creates an `ACTIVE` status record in PostgreSQL.
  2. Inngest receives a `job/created` event and schedules an expiration timer based on listing duration.
  3. Job immediately appears on the public job listings feed.

### 5.4 Application Tracking System (ATS)
- **Application Submission**: Job seekers apply with a cover letter and resume link (backed by Uploadthing validation). Duplicate applications are prevented via `[userId, jobPostId]` unique database constraints.
- **Employer Dashboard (`/applications`)**:
  - View all applications grouped by job post.
  - Inspect candidate details, cover letters, and view PDF resumes directly.
  - Update candidate status (`PENDING`, `REVIEWED`, `SHORTLISTED`, `INTERVIEWED`, `REJECTED`, `HIRED`).
  - Add private internal candidate notes.
- **Job Seeker Dashboard (`/my-applications`)**: Real-time view of applied jobs with current application status indicators.

### 5.5 Favorites / Saved Jobs
- Bookmark toggle on job listing cards and job detail pages.
- Centralized `/favorites` dashboard for job seekers.

### 5.6 Automated Background Operations (Inngest)
- **Job Expiration Handler**: Triggers a delayed sleep step matched to `listingDuration` days, after which `status` is set to `EXPIRED`.
- **Cancellation Event**: Automatically cancels the pending expiration job if the post is deleted manually by the company.
- **Notification Queue**: Infrastructure for dispatching transactional update emails via Resend.

### 5.7 Security & Request Shielding (Arcjet)
- All mutating Next.js Server Actions evaluate Arcjet request protection (`shield` and `detectBot`) before touching database resources or external services.

---

## 6. Non-Functional Requirements

- **Performance**: Initial page load and server rendering optimized via Next.js App Router and Prisma connection pooling.
- **Security**:
  - Secure session handling via NextAuth JWT/Session management.
  - Protected API routes and server actions with session user checks (`requireUser`).
- **Scalability**: Decoupled architecture separating database operations (Prisma), background workflows (Inngest), and file hosting (Uploadthing).
- **User Interface**: Modern dark/light mode toggle with theme persistence using `next-themes` and standard design primitives.
