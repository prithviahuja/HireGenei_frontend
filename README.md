# HireGenei Frontend

This folder contains the Next.js frontend for the HireGenei application.

## Overview

The frontend provides a UI for:

- uploading and analyzing resumes
- scraping job listings
- chatting with an AI job consultant

It uses a sidebar navigation pattern and renders one of three feature components:

- `ResumeAnalyzer`
- `JobScraper`
- `AIConsultant`

## Structure

- `app/page.tsx` - main page component with tab state and content rendering.
- `components/` - feature components and shared UI:
  - `resume-analyzer.tsx`
  - `job-scraper.tsx`
  - `ai-consultant.tsx`
  - `sidebar.tsx`
  - `theme-provider.tsx`
- `components/ui/` - reusable UI primitives.
- `lib/api.ts` - API client that communicates with the backend.
- `styles/` - global styling.

## Dependencies

The app uses Next.js 16, React 19, Tailwind CSS, Radix UI primitives, and other supporting libraries.

## Setup

1. Install dependencies with pnpm:

```bash
pnpm install
```

2. Run the development server:

```bash
pnpm dev
```

3. Build for production:

```bash
pnpm build
```

4. Start the production server:

```bash
pnpm start
```

## Backend Integration

The frontend calls the backend API at `NEXT_PUBLIC_API_URL` if defined, otherwise it defaults to `http://localhost:8000/api`.

Supported requests:

- Resume upload: `POST /api/resume/upload`
- Job scraping: `POST /api/jobs/scrape`
- Chat: `POST /api/chat`

## Notes

- The app is currently configured as a client-side interactive experience using a sidebar and tabbed content.
- The frontend assumes the backend is available at the configured API base URL.
