# Masters/Besties Open Play

A pickleball open-play match manager: fair 2v2 matchmaking, a persistent
player database, manual match progression, court management with automatic
redistribution, session history, and a full stats/queue view. Data is saved
to your browser's local storage, and the app installs as a home-screen PWA.

### What's new in this version
- **Player database** — every player you add is saved permanently; pull them
  into future sessions from Players → "Add from saved" instead of retyping names.
- **Check In All** — one tap to check in every registered player.
- **Manual match progression** — when a match ends, the next matchup is
  proposed but won't start (or count toward the timer/stats) until you tap
  **Start match**.
- **Court redistribution** — disabling or removing a court mid-match sends
  those four players back to the queue and reshuffles proposed matches
  across the remaining courts automatically.
- **Session history** — every session you end is archived (Settings →
  Session history) with a read-only view of its final matches and stats.
- **Smarter scheduler** — priority order is now fewest games played, then
  longest wait, with skill-balance and back-to-back-match penalties layered on.
- **Toasts, confirm dialogs, loading splash** — for a more production feel.
- **PWA** — installable to a phone/tablet home screen, works offline as a shell.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Publish to GitHub

1. Create a new repo on GitHub (don't add a README there — you already have one).
2. From this folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/masters-besties-open-play.git
git push -u origin main
```

Replace `<your-username>` with your GitHub username, and the repo name if you
picked a different one.

## Put it live on the web (GitHub Pages)

This project is preconfigured for GitHub Pages.

1. Install the deploy tool (already in `devDependencies`, so `npm install` covers it).
2. Build and publish:

```bash
npm run deploy
```

This pushes the built app to a `gh-pages` branch.

3. On GitHub, go to your repo → **Settings** → **Pages** → set the source to
   the `gh-pages` branch, `/ (root)`.
4. Your app will be live at `https://<your-username>.github.io/masters-besties-open-play/`.

If you rename the repo, update the `base` path in `vite.config.js` to match:
`base: "/<your-repo-name>/"`.

### Alternative: Vercel or Netlify

Both auto-detect Vite. Just import the GitHub repo in either dashboard —
no config needed (leave `base: "/"` in `vite.config.js` if you go this route
instead of GitHub Pages).

## Project structure

```
src/
  App.jsx        the entire app: types, scheduler, store, and UI
  main.jsx       React entry point
  index.css      Tailwind entry point
```
