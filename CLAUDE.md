# CLAUDE.md — Euphonator

Working agreement for AI assistants in this repo. **Follow these rules strictly.**

## Hard rules (do NOT do these)

- **Never start servers.** Do not run `npm run dev`, `npm run preview`, `vite`, or any
  long-running/background process. The user runs the dev server themselves.
- **Never run browser tests or browser automation.** Do not use claude-in-chrome / Playwright /
  Puppeteer / headless browsers, and do not try to open or screenshot the app. The user does all
  in-browser verification.
- **Never create git branches or worktrees.** Do not `git branch`, `git checkout -b`, `git switch -c`,
  `git worktree add`, or spawn worktree-isolated agents. Work on the current branch only. Commit/push
  only when explicitly asked.
- **Keep all commands scoped to this folder.** Every command must operate inside
  `/Users/ramahemphill/Documents/REPOS/euphonator`. No `cd` elsewhere, no absolute paths outside the
  repo, no writes outside it (the scratchpad/plan/memory dirs the harness provides are the only
  exceptions). Do not touch parent directories or other repos.

## Style rules

- **Never use emojis** anywhere — not in UI/JSX, labels, comments, commit messages, or chat.
- **No rounded corners.** All corners are sharp. A global `border-radius: 0 !important` reset lives in
  `src/index.css`; do not add `rounded-*` Tailwind classes or `border-radius` values.
- **Neutral-grey base + a functional accent palette.** Base greys use Tailwind **`neutral`** (true grey —
  never `slate`/`gray`/`zinc`, which are tinted). Color is reserved for meaning/interaction, drawn from
  the accent palette defined in `tailwind.config.js`. Token names are kept for continuity even where the
  hue has moved (notably `coral` now renders purple).
  Notes and function badges are colour-coordinated by harmonic function relative to the tonic:
  - `coral` — Tonic (T): the tonic/root note in selectors, the T badge, primary CTAs (`#7a3876` purple).
  - `kelp` — Pre-Dominant (PD): PD-function notes and the PD badge (`#3ab159` subdued green).
  - `reef` — Dominant (D): D-function notes, the D badge, enabled toggles (`#4ed05d` bright green).
  - `ocean` — non-functional scale notes only (`#48639b` blue).
  - `sun` — bright yellow pop (e.g. common-note highlight on the Transition tool's keyboard).
  The function tokens above (`coral`/`kelp`/`reef`/`ocean`) carry harmonic meaning and are used
  **only** on note/function UI, never on generic controls. Interactive chrome uses its own
  non-semantic token so UI colour never reads as harmonic meaning:
  - `mist` — general UI accent (`#8fa3cc` blue-grey): active buttons/tabs, the Segmented control,
    Toggle indicators, checkboxes, non-note selectors (scale picker), the info-button active
    state, and the logo. Filled `mist` uses dark text (`text-neutral-900`) for contrast. Do not
    use a function token for a plain control, or `mist` for anything that encodes a note function.
  The overlap/pivot note-squares reuse this same function colour coding (`noteFnFill`) for shared
  notes, relative to the main scale's tonic; non-shared notes stay dim neutral.
  Do not introduce blue/indigo/violet/purple/fuchsia/cyan/amber Tailwind palettes — use these tokens.

## What is fine to do

- Edit/create files inside the repo.
- Type-check / build to catch errors: `npm run build`.
- Run the unit test suite (non-interactive): `npm run test` (alias for `vitest run`).
- `npm install` when dependencies genuinely change.

When a change needs runtime verification in the browser, **describe what to check and ask the user to
run it** — do not attempt it yourself.

## Project overview

Euphonator is a static, client-side **music-theory cheat sheet** (React + Vite + TypeScript +
Tailwind). It implements the user's own **semitone-first** system (the "Ram Kalo" system) — do not
substitute standard music theory where the system differs. Source of truth for the theory:
`MusicTheory/Claude - Chord & Scale Theory (Table Version).md`.

### Layout

- `src/theory/` — pure, framework-free logic (unit-tested):
  - `notes.ts` — pitch classes (0–11, sharp spelling), transposition, set math.
  - `chords.ts` — triads, inversions, and the unconventional chord set (from the doc).
  - `scales.ts` — heptatonic scales + the complete 66-entry Ram Kalo Pentatonic Index.
  - `functions.ts` — the editable semitone-offset → T/PD/D map + Roman-numeral logic.
  - `progressions.ts` — deduped/categorized progression patterns.
  - `analysis.ts` — the tool algorithms (chordsInNotes/chordsInScale, overlapByCommon, pivotScales,
    generateProgression, plus scale identification). `scaleOverlap`/`transitionChords` remain but are
    currently unused by the app.
- `src/components/` — reusable UI (Keyboard, badges, selectors, Table, primitives).
- `src/tools/` — the two tool views: `ChordsInScaleTool` (chords + overlapping/pivot scale tables) and
  `ProgressionGeneratorTool`. `src/App.tsx` — a two-tab shell (no home page).
- Tests live in `src/**/__tests__/`.

### Conventions

- Notes are spelled with **sharps** by default (matches the doc's chord-notes column).
- Harmonic function (T/PD/D) comes from **one editable table**: `OFFSET_FUNCTION_MAP` in
  `src/theory/functions.ts`. Retune the app's sense of function there, not scattered across files.
- The pentatonic index is **complete** (66 = ⅟₁₂·C(12,5)); a test asserts the count and that all
  entries are distinct necklaces. Keep that invariant.
- New theory logic must ship with a Vitest test, ideally anchored to a worked example from the doc.
