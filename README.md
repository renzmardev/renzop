# Masters/Besties Open Play

A pickleball open-play match manager: fair 2v2 matchmaking, court and player
management, waiting queue, match history, and stats. Data is saved to your
browser's local storage.

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
