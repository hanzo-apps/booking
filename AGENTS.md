# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Cadence, a calm timeslot-booking scheduler. Vite + React 19 +
`@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. Keep it minimal and real.
`@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this); `Button`
has no `color` prop, so labels are `<Text>` children (see `src/views/ui.tsx`).
Two Base collections in `schema.sql` (`slots`, `bookings`); "booked" is derived
from bookings, never stored. Prove changes with `npm run build` (tsc + vite).
Never build a container image locally — Hanzo Cloud owns deploys.
