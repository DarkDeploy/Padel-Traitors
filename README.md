# Padel Traitors

A mobile-first web app for playing a Traitors-style social deduction game during padel sessions. One phone is passed around: each player privately sees whether they are **Faithful** or a **Traitor**, plus the round's mission. Traitors see the same Faithful mission along with their secret orders.

Everything runs in the browser. There is no backend, database, account or API key — session data lives in the browser's `localStorage` on the phone running the game.

## How to play

1. **Setup** — add players (tap a name to edit it, × to remove), choose the number of Traitors, tap **Start Game**.
2. **Pass the phone** — the named player taps **Reveal My Role**, reads their card, then taps **Hide & Pass Phone**.
3. **Go play** — once everyone has seen their role.
4. **Next Game** — new roles and a new mission for the same players. Use **Edit players** to change the line-up first.

Traitor history is remembered by name, so a player who leaves and is added again later keeps their record.

### Fair Traitor rotation

Roles are not re-rolled independently each round. Each player has a running *fair share* — every round they play adds `traitors ÷ players` to it. Each round the players furthest below their fair share become Traitors, ties are broken with `crypto.getRandomValues`, and last round's Traitors are only picked again if every alternative is already a full assignment ahead of them (or there aren't enough other players). This keeps counts within one of each other while the line-up is stable, and close to each player's fair share when people join, leave or the Traitor count changes. Perfect equality isn't always mathematically possible (e.g. 5 players, 1 Traitor, 3 rounds). See `src/allocation.ts`.

A deal only counts towards history once every player has seen their role; abandoning a deal part-way (the ← on the handover screen) discards it.

### Privacy caveat

This is a casual game on a shared phone, not a tamper-proof system. Roles are stored in `localStorage`, so anyone with access to the browser's developer tools could find them.

## Development

Requires Node.js 20+.

```bash
npm install
npm run dev        # start the dev server
npm test           # run unit and UI tests (Vitest)
npm run typecheck  # TypeScript checks
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

### Project layout

| Path | Purpose |
| --- | --- |
| `src/missions.ts` | Missions and secret Traitor tasks. Add a mission by appending to `MISSIONS` (unique `id`) and adding its task to `TRAITOR_TASKS`. |
| `src/allocation.ts` | Fair Traitor selection (pure, tested). |
| `src/game.ts` | Session state transitions: players, dealing, reveal/hide, next round. |
| `src/storage.ts` | Saving, loading and validating the session in `localStorage`. |
| `src/random.ts` | Unbiased random numbers from `crypto.getRandomValues`. |
| `src/components/` | Screens and the confirmation dialog. |

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` tests, builds and deploys the site on every push to `main` (and can be run manually from the Actions tab).

One-time repository setup:

1. Open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or re-run the workflow). The site is published at `https://<owner>.github.io/<repository>/`.

Vite is configured with a relative base path (`base: './'`), so assets load correctly under the repository sub-path whatever its capitalisation. The app is a single page with no client-side routes, so refreshing never produces a GitHub Pages 404. Once loaded, it makes no further network requests.
