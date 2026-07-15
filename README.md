# Masters/Besties Open Play

A pickleball open-play match manager: fair, algorithm-driven 2v2 matchmaking,
a persistent player database, manual match progression with player-swap
dialogs, court management with automatic redistribution, session history,
and a full stats/queue view. Data is saved to your browser's local storage,
and the app installs as a home-screen PWA on desktop, tablet, and mobile.

---

## Features

- **Dashboard** — live counts of registered/checked-in/waiting players, active
  matches, available courts, and the current round, plus a court-by-court view.
- **Player database** — every player you add is saved permanently in the
  browser; pull them into future sessions from Players → "Add from saved"
  instead of retyping names. Export the whole saved list to a `.txt` file
  (one name per line) any time.
- **Check-in** — check players in individually or all at once.
- **Manual match progression** — when a match ends, the next matchup is
  *proposed* but won't start (or count toward the timer/stats) until you tap
  **Start match**.
- **Manual player switching** — before a match starts, freely swap any player
  between two scheduled matches, a court, or the waiting queue via the swap
  dialog. Once a match is **In Progress**, editing is locked to swapping a
  player with their direct opponent on the same court only (teammates never
  change) — or reset the match entirely to unlock full editing again.
- **Court management** — add, rename, enable/disable, or remove courts at any
  time. Disabling or removing a court mid-match evicts its players back to the
  queue and automatically redistributes proposed matches across the courts
  that remain, no matter how many courts you're running.
- **Session history** — every session you end is archived (Settings → Session
  history) with a read-only view of its final matches and stats. New sessions
  default their name to today's date and can be renamed anytime.
- **Fair, tested scheduler** — priority order is fewest games played, then
  longest wait, with penalties for repeated teammates/opponents, skill
  imbalance, and back-to-back matches. Implemented as a standalone, unit-tested
  module (`src/scheduler.js`) with no dependency on React or app state.
- **Cross-session analytics & leaderboard** — the Stats tab has two scopes,
  toggled at the top of the leaderboard:
  - **This session** — only the currently active session. Always starts
    completely empty on a new session (matches played, wins, points, streaks,
    everything) since it reads only live session state, never the archive.
  - **Lifetime** — aggregates every session you've ever run, matched by saved
    player name, and never resets on its own.

  Either scope ranks players by win %, wins, losses, point differential, and
  matches played, with medal badges for the top 3, sortable columns, search,
  and pagination. Click a player for a detail dialog with 16 stats: points/
  streaks/sessions/average wait between matches/per-court breakdown, and more.
  Both are backed by a standalone, unit-tested module (`src/analytics.js`).
- **Session history management** — search past sessions by name or date, sort
  newest/oldest, delete an individual session, or clear all session history
  at once (with a confirmation dialog) — without touching your saved player
  database, courts, or app settings.
- **Toasts, confirm dialogs, loading splash** — consistent, rounded, animated
  dialogs throughout, with keyboard (Esc) support and large touch targets.
- **PWA** — installable to a phone/tablet home screen, works offline as a shell.

## Tech stack

React 18 · Vite · Tailwind CSS · lucide-react icons · zero backend (all data
lives in `localStorage`).

---

## Project structure

```
masters-besties-open-play/
├── index.html              Vite entry HTML, PWA meta tags
├── vite.config.js          Vite + base path config
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── LICENSE                 MIT
├── public/
│   ├── manifest.json       PWA manifest
│   ├── sw.js                offline-shell service worker
│   ├── icon-192.png / icon-512.png / apple-touch-icon.png / favicon.png
└── src/
    ├── main.jsx             React entry point + service worker registration
    ├── index.css            Tailwind entry point
    ├── App.jsx               the app: state/reducer, UI components, dialogs
    ├── scheduler.js           pure matchmaking logic (framework-free)
    ├── scheduler.test.js      unit tests for scheduler.js
    ├── analytics.js           pure cross-session stats engine (framework-free)
    └── analytics.test.js      unit tests for analytics.js
```

---

## Installation guide

**Prerequisites:** [Node.js](https://nodejs.org) 18+ (includes npm) and
[Git](https://git-scm.com).

```bash
# from inside the unzipped project folder
npm install
```

This installs React, Vite, Tailwind, and the other dependencies listed in
`package.json`. No API keys, accounts, or backend setup required.

## Development

```bash
npm run dev
```

Opens a local dev server (usually `http://localhost:5173`) with hot reload.

## Testing

```bash
npm test
```

Runs `scheduler.test.js` and `analytics.test.js` against their respective
pure-logic modules using Node's built-in test runner — no extra dependencies
needed. Coverage includes matchmaking across 1–12 simultaneous courts (the
regression check for court assignment), insufficient-player edge cases,
fairness behavior (teammate/opponent avoidance, fewest-games priority), and
the analytics engine (win/loss/point aggregation, no-score match handling,
streak calculation, and cross-session aggregation by player name).

## Build instructions

```bash
npm run build
```

Produces an optimized static build in `dist/`. Preview it locally with:

```bash
npm run preview
```

---

## Publishing to GitHub

1. Create a new, empty repository on GitHub (skip adding a README there —
   this project already has one).
2. From the project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/masters-besties-open-play.git
git push -u origin main
```

Replace `<your-username>` (and the repo name, if you picked a different one).

## Deployment instructions

### Vercel or Netlify (recommended — zero config)

Import the GitHub repo in either dashboard. Both auto-detect Vite and build
correctly out of the box. Leave `base: "/"` in `vite.config.js` for these.

### GitHub Pages

1. `npm run deploy` (uses the `gh-pages` package, already in `devDependencies`)
   — this builds the app and pushes `dist/` to a `gh-pages` branch.
2. On GitHub: repo → **Settings** → **Pages** → set the source to the
   `gh-pages` branch, `/ (root)`.
3. Your app will be live at `https://<your-username>.github.io/masters-besties-open-play/`.
4. If you rename the repo, update `base` in `vite.config.js` to
   `"/<your-repo-name>/"` first.

---

## License

MIT — see [LICENSE](./LICENSE). Free to use, modify, and deploy for your own
open-play sessions.
