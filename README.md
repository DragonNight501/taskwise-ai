# Taskwise AI

Taskwise AI turns any goal into an ordered, editable plan. Gemini drafts the tasks; you track them on a drag-and-drop board.

**Live demo:** https://mohamad-hadi-taskwise-ai.vercel.app

## Features

- Generate concrete, ordered tasks from a goal with Google Gemini (structured JSON output)
- Works in any language — the plan comes back in the language of the goal
- Control the length with phrases like "in 8 steps", "10 tasks", "6 Schritte" or "7 خطوات"
- Board with To do, In progress and Done columns
- Move tasks by drag and drop, or with arrow buttons (keyboard and touch friendly)
- Inline editing, deletion and a two-step "clear board"
- Progress bar for the whole plan
- Tasks persist in `localStorage` and stay in sync across browser tabs
- Clearly labelled starter template when the AI service is unavailable
- Rate-limited API route to protect the AI quota
- Light, responsive design with reduced-motion support

## Tech stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- Google Gemini API (`@google/genai`)
- lucide-react icons
- Vercel

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

### Environment variables

Create `.env.local` in the project root:

```bash
GOOGLE_API_KEY=your_google_api_key_here
```

Without a key the app still runs and returns a starter template.

## How it works

1. The goal is sent to `POST /api/generate-tasks` (max 500 characters, 10 requests per 10 minutes per IP).
2. The route detects a requested task count, then asks Gemini for exactly that many tasks using a response schema, so the model returns valid JSON instead of free text.
3. If `gemini-2.5-flash` fails, `gemini-2.5-flash-lite` is tried; if both fail, a template plan is returned and labelled as such in the UI.
4. The client stores tasks in `localStorage` through a `useSyncExternalStore` hook, which avoids load/save races and keeps multiple tabs in sync.

## Project structure

```
src/
├── app/
│   ├── api/generate-tasks/route.ts   Gemini call, validation, rate limit
│   ├── layout.tsx · page.tsx
│   ├── opengraph-image.tsx
│   └── globals.css                   design tokens (@theme)
├── components/                       composer, board, task card, header
├── hooks/use-tasks.ts                localStorage-backed task store
└── lib/                              task model, count detection, rate limit
```

## Author

Built by [Mohamad Hadi Dabbah Aljimal](https://portfolio-mohamad-dabbah.vercel.app).
