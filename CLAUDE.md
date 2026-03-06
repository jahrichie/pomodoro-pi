# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Environment Variables

Copy `.env.example` to `.env.local`:
- `GOOGLE_CLIENT_ID` — Google OAuth 2.0 client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth 2.0 client secret
- `BASE_URL` — App base URL (default: `http://localhost:3000`); must match the OAuth redirect URI registered in Google Cloud Console

## Architecture

**Next.js 16 App Router** app with no backend database — all state is client-side via `localStorage`.

### State Management (client-only)
- `src/hooks/useTimer.ts` — Timer state machine using `requestAnimationFrame` + wall-clock `endTime` reference. States: idle → active → alarm. `setTime()` always resets the timer.
- `src/hooks/useTaskList.ts` — Task CRUD with `localStorage` persistence (key: `pomodoro-pi-tasks`). Tasks have a `source` field: `'manual'` or `'gcal'`. Hydration guard prevents SSR/localStorage mismatch.

### Google Calendar OAuth Flow
1. `GET /api/auth/google` — Generates OAuth URL with CSRF state stored in `httpOnly` cookie, redirects to Google
2. `GET /api/auth/google/callback` — Validates state, exchanges code for tokens, stores `gcal_access_token` + `gcal_refresh_token` in `httpOnly` cookies, redirects to `/?import=1`
3. `GET /api/calendar/events` — Reads `gcal_access_token` cookie, fetches today's calendar events from Google Calendar API
4. On `/?import=1` load, the app opens `ImportModal` which calls the events endpoint

The OAuth helper (`src/lib/google.ts`) constructs the redirect URI from `BASE_URL` env var.

### Key Components
- `TimerDial` — SVG-based circular dial with drag-to-set support for both mouse and touch. Rotation: 360° = 60 min = 3600 seconds; snaps to nearest minute. Disabled while timer is running or in alarm state.
- `Controls` — Start/pause and reset buttons
- `PresetSelector` — Quick-set duration presets
- `TaskList` — Manages the task queue; selecting a task loads its duration into the timer
- `ImportModal` — Fetches Google Calendar events and lets user select which to import as tasks

### Timer ↔ Task Integration
When `timeLeft` reaches 0 and there's an `activeTaskId`, the page component automatically calls `taskList.completeTask()`. Alarm plays a Web Audio API chime and triggers device vibration.
