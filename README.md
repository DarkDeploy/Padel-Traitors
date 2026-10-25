# Padel Traitors

A mobile-first web app for playing a Traitors-style social deduction game during padel sessions. One phone is passed around and each player privately holds to view their secret role and mission.

Everything runs in the browser. There is no backend, database, account or API key — session data lives in the browser's `localStorage` on the phone running the game.

## Rules

- **Faithful** all get the same secret mission: a habit to lean into while on court (e.g. *serve down the middle*). Subtle enough to pass as normal play, but a watchful Traitor can spot the pattern.
- **Traitors** know who the other Traitors are and share a risky or silly dare (e.g. *get a point replayed*). With five or more players they get two — one for the court, one for the sideline — and pulling off either is enough.

At the end of the game the group agrees out loud on **one suspect**, then the app unmasks the Traitors, lets them guess the Faithful mission, and reveals it.

**Traitors win** only if both are true: they pulled off one of their dares, and the suspect is not a Traitor. Anything else — a Traitor named, or no dare pulled off — and the **Faithful win**.

The Faithful mission isn't scored: it's camouflage. Traitors spot it and copy it to avoid being caught; a Traitor who doesn't stands out.

## How to play

1. **Setup** — add players (tap a name to edit it, × to remove), choose the number of Traitors, tap **Start Game**.
2. **Pass the phone** — the named player presses and holds **Hold to view**; the card shows only while held. They tap **Done — pass to …**.
3. **Play** — a 15–20 minute game. **Check my role** lets anyone re-read their card.
4. **End round & reveal** — the Traitors, then the Faithful mission, revealed one tap at a time. The host taps who won; the session score and earlier rounds show at each reveal and on setup. Then **Next Game** for new roles and missions with the same players, or **Edit players** first.

On an iPhone, use Share → **Add to Home Screen** to open it full-screen like an app.

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
| `src/missions.ts` | The secret missions. Add one to `FAITHFUL_MISSIONS`, `COURT_DARES` or `SIDE_DARES` with a unique `id`, title and text. |
| `src/allocation.ts` | Fair Traitor selection (pure, tested). |
| `src/game.ts` | Session state transitions: players, dealing, passing the phone, reveal, winner, next round. |
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
