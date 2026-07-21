# booking-timeslot (Cadence) — agent notes

Cadence is a calm timeslot-booking scheduler on the Hanzo stack, forked from
`hanzo-starter`. Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) +
`@hanzo/base` (data). Keep it minimal and REAL — every surface must build and
run, no fabricated UI.

## What it is

Publish the windows you are free, then let clients claim one. Three views over
two org-scoped Base collections:

- **Book** (`src/views/book.tsx`) — open slots laid out as a calm agenda, one day
  per row; pick a slot, add name/email/note, confirm. That writes one `bookings`
  row.
- **Bookings** (`src/views/bookings.tsx`) — every reservation joined to its slot
  time; cancel deletes the booking row.
- **Availability** (`src/views/availability.tsx`) — publish slots, toggle
  open/closed, remove. A booked slot can't be removed here.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam is what makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user. Cadence fixes the
  **light** theme for its calm look.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`.
  `VITE_HANZO_CLIENT_ID` falls back to `hanzo-app`.
- **Domain + look are one place** (`src/lib/booking.ts`): the `Slot`/`Booking`
  types, the single accent (calm teal) + neutral palette, and the time helpers.
- **"Booked" is derived, never stored twice.** A slot shows booked iff a
  `bookings` row points at its id, so every action (book, cancel, open/close) is
  a single write and nothing can drift. `slots.open` is only the owner's
  publish toggle.
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). The shared inputs/buttons live in `src/views/ui.tsx`.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`alignSelf`/
  `borderRadius`/`textAlign` — NOT the `items`/`justify`/`bg`/`p`/`self`/
  `rounded`/`text` shorthands. Shorthands pass at runtime but FAIL `tsc`.
- **`Button` has no `color`/`fontWeight` prop.** It is a frame — put text styling
  on an explicit `<Text>` child (this is why `ui.tsx` wraps every label). `Button`
  uses `onPress`; `Input` uses `value`/`onChangeText`.
- **`useMutation('x','update')` needs `data.id`** in the object it is given
  (`mutate({ id, ...fields })`); `delete` needs `mutate({ id })`.
- **PKCE storage is `localStorage`** so the verifier/state survive the round-trip
  to hanzo.id.
- **`schema.sql` is the data contract** — the `databaseSchema` DDL the deploy
  translates into Base collections (`provisionBaseFromDDL`). Keep it in lockstep
  with `src/lib/booking.ts` + the three views.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage. No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates `slots` + `bookings`
  (org-scoped, IAM-native). Runtime read/write is browser → `VITE_HANZO_BASE_URL`
  with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback` (a `https://*.hanzo.app/auth/callback` wildcard on the shared
  client, or a per-app `hanzo-booking-timeslot` client).

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` (899 modules). Longhand props and
`<Text>`-child button labels compile green under `tsc`.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
