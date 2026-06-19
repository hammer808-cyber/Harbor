# Harbor — Product Requirements & Build Log

## Original problem statement
Continue building the existing "Harbor" app (do NOT rebuild, rename, retheme, or
remove screens). Harbor is a calm, slightly playful personal productivity app with a
harbor/port/navigation theme that decides what to do next based on energy, time,
location, mood, urgency, and task friction. Turn it from a shell into a smart daily
task-routing system.

## Tech stack & architecture
- Frontend-only **Vite + React 19 + TypeScript**, Tailwind v4 (`@tailwindcss/vite`,
  `@theme` tokens), `motion`, `lucide-react`. No backend. No auth.
- Relocated from `/app` root → `/app/frontend` so supervisor (`yarn start` on :3000) runs it.
  `vite.config.ts` has `allowedHosts: true` for the preview host.
- **Persistence:** browser localStorage (`harbor.tasks.v1`, `harbor.projects.v1`,
  `harbor.seeded.v1`). Safe migration back-fills missing task fields.

## Core architecture (centralized "brain")
- `src/lib/engine.ts` — scoring engine. `scoreTask()` produces a 0–100 Harbor Fit Score
  (energy match, time fit, location, mode, urgency, importance, friction, emotional
  weight, quick-win, deadline). `getRecommendations()` → Best Bet / Easy Win / Future
  You Will Thank You; Survival mode returns one tiny step. `contextFromSky()`,
  `shrinkSuggestions()`, `isOverdue()`, `isAvailable()`.
- `src/lib/parser.ts` — local (non-AI) Brain Dump parser → `ParsedDraft`, `draftToTask`.
- `src/lib/store.tsx` — `HarborProvider` + `useHarbor()` (single task system, CRUD,
  status actions: complete/dump/dock/snooze/restore).
- `src/lib/storage.ts` — load/save + seed data + migration.
- `src/lib/options.ts` — field option metadata + harbor labels.

## Data model (`src/types.ts`)
Task: title, notes, status (active|docked|completed|dumped|snoozed), category,
projectId?, deadline, estimatedMinutes, energyRequired, location, urgency, importance,
friction, emotionalWeight, isQuickWin, createdAt, updatedAt, completedAt, snoozedUntil.
Project: title, goal, nextStep, deadline, status (docked|active|stuck|completed).

## Screens (kept original theme & Entrance)
Entrance (sky/mood) → Today dashboard (Best Bet, mode selector, Quick Wins, Overdue,
Energy-friendly, Docked, Help me choose, Do or Dump) · Choose ("What Should I Do Now?"
5-step flow + 3 recs) · Brain Dump (Drift) capture+review · Current (task list) ·
Projects (The Fleet) · The Deep (archive, recover/delete) · Flow (timer) · Stuck ·
Do or Dump. Nav: Harbor / Drift / Choose (center) / Current / Fleet + Deep (header).

## Status — Implemented (2026-06-19)
All deliverables A–J done and verified by testing agent at **100%** (iteration_2):
scoring engine, updated data model, What-Should-I-Do-Now flow, Brain Dump parser+review,
Do or Dump, Projects/next-step, improved dashboard, mobile UI polish, seed data.
Fixed: bottom-sheet Save intercepted by nav (Sheet now React-portaled to body);
Choose questionnaire resets on nav.

## Backlog / Next
- P1: Voice capture for Brain Dump (mic button); richer project task management UI.
- P2: Streaks/stats in The Deep; recurring tasks; notifications/reminders.
- P2: Optional cloud sync + accounts (would require adding a backend).
- P3: Optional Gemini-powered parsing toggle (key already in stack).
