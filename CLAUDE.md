# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

HandPong is a single-page React app: classic Pong where the left paddle is driven by
webcam hand tracking (Google MediaPipe Hands), with mouse and keyboard fallbacks. The
right paddle is a built-in AI. No backend — everything runs in the browser.

## Commands

**Bun is the only supported toolchain** — locally and in CI (`bun.lock` is the committed
lockfile; there is no `package-lock.json`). `package.json` pins `packageManager: bun@…`.

- `bun install` — install dependencies (CI uses `bun install --frozen-lockfile`)
- `bun run dev` — Vite dev server (run via `http://localhost` so the browser allows the webcam)
- `bun run lint` — ESLint over the repo
- `bun run typecheck` — `tsc -b` (type-check only; configs are `noEmit`)
- `bun run build` — `tsc -b && vite build` (output in `dist/`)
- `bun run preview` — serve the built `dist/`

There is **no test suite**. CI (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, and
`build` on every push/PR.

## Deployment

Pushes to `main` build and deploy the app to **GitHub Pages** via the CI workflow
(`build` job uploads `dist/` as a Pages artifact; the `deploy` job publishes it with
`actions/deploy-pages`). Live at `https://vitalyvorobyev.github.io/handpong/`.

**Base path:** production builds set `base: '/handpong/'` in `vite.config.ts` (dev stays at
`/`). Reference `public/` assets in TS/JSX through `import.meta.env.BASE_URL` (e.g. the logo in
`App.tsx`) — a bare `/icon.svg` string would *not* get the base prepended and breaks on Pages.

`wrangler.jsonc` remains for an optional Cloudflare static-assets deploy of `dist/`.

## Architecture

Render chain: `index.html` → `src/main.tsx` → `App.tsx` → **`HandPong.tsx`** (the orchestrator).

`App.tsx` is just the page shell (branded header + footer). `HandPong.tsx` owns all UI/config
React state (running, smoothing `alpha`, `sensitivity`, control-band `top`/`bottom`, mirror,
preview, mouse mode, the first-run `showHowTo` overlay flag) and wires the pieces together. The
visible children are `GameCanvas`, `Toolbar`, `ControlPanel`, `HandTracker`, and `HowToPlay`.

### Game state is a mutable ref, not React state

`useGameLogic` keeps the entire `GameState` (ball position/velocity, paddle Y, scores) in a
single `useRef` and **mutates it in place**. This is deliberate: the physics and render loops
run every animation frame and must not trigger React re-renders. Do not convert `gameState`
to `useState` — treat it as a mutable game-loop buffer. `update(dt, running)` in
`useGameLogic.ts` is the physics step (collisions, AI paddle, scoring, ball acceleration).

### Multiple independent requestAnimationFrame loops

These run concurrently and are intentionally separate:
- **Physics** — `useEffect` in `HandPong.tsx` calls `update(dt, running)` (dt clamped to 33ms).
- **Render** — `GameCanvas.tsx` reads `gameState.current` and draws each frame.
- **Camera/inference** — MediaPipe's `Camera.onFrame` drives `hands.send()` in `useHandTracking`.
- **Keyboard** — `useKeyboardControls` polls held arrow keys each frame.

### Input → paddle coordinate pipeline

Three input modes all converge on the paddle's target Y, then `update()` eases `lY` toward it:
1. **Hand** (`useHandTracking`): MediaPipe gives a normalized index-fingertip Y (landmark **8**).
   `HandPong.mapY()` remaps it through the `top`/`bottom` control band, scales to `GAME_HEIGHT`,
   then calls `updateTargetY` (which applies `sensitivity`).
2. **Mouse** (`useMouseControls`): pointer Y on the canvas → `updateTargetY`. Enabled only in `mouseMode`.
3. **Keyboard** (`useKeyboardControls`): arrow keys nudge `lY` directly.

`update()` then smooths the actual paddle toward the target: `lY = alpha*lY + (1-alpha)*targetLY`.

### MediaPipe is loaded from a CDN at runtime, not bundled

`useHandTracking` calls `loadScripts()` (`src/utils/loadScripts.ts`) to inject MediaPipe
`hands.js` and `camera_utils.js` `<script>` tags from jsDelivr on first camera start. The
globals `window.Hands` / `window.Camera` are typed locally inside `useHandTracking.ts` (and in
`src/types/mediapipe-globals.d.ts`); there is **no `@mediapipe/*` npm dependency**. Camera start
fails gracefully → `HandPong` flips to `mouseMode`.

### Cross-component camera control via refs

`HandTracker` doesn't take start/stop props directly. Instead `HandPong` passes `startCameraRef`
/ `stopCameraRef` (mutable refs) down, and `HandTracker` writes the hook's `startCamera`/`stopCamera`
into them on render. The `Toolbar` buttons then call through those refs. Keep this pattern in mind
when changing camera lifecycle wiring.

## Layout

- `src/constants/gameConfig.ts` — all tunable physics/dimension constants (canvas 960×540, paddle/ball sizes, speeds). Change game feel here.
- `src/hooks/` — `useGameLogic` (physics), `useHandTracking` (MediaPipe), `useMouseControls`, `useKeyboardControls`.
- `src/components/` — `GameCanvas` (renders the game), `HandTracker` (video + debug overlay), `Toolbar`, `ControlPanel`, `HowToPlay` (first-run/help overlay).
- `src/types/` — shared interfaces (`game.ts`, `tracking.ts`) and the MediaPipe global declarations.
- `src/App.css` — the whole design system (CSS custom properties + component styles). No CSS framework.
- `.github/pages/` — standalone landing-page template (for future docs deployment), not part of the app build.
