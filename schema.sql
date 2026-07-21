-- Hanzo Base schema for Cadence — the `databaseSchema` DDL.
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- id/created/updated/owner/org itself, so they are never re-declared here.
-- Every row is stamped with the verified IAM owner+org and is org-scoped: Base
-- applies the list/view/create/update/delete rule `@request.auth.org_id = org`,
-- so a member of your org reads/writes the row and other orgs cannot see it.
--
-- Keep this in lockstep with what the app reads/writes
-- (src/lib/booking.ts + src/views/book.tsx · bookings.tsx · availability.tsx).

-- A publishable meeting window. `open` is the owner's availability toggle
-- (1 = published, 0 = hidden). Whether a slot is BOOKED is derived from the
-- bookings collection, never stored here — so every action is a single write.
CREATE TABLE IF NOT EXISTS slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start TEXT NOT NULL,              -- local "YYYY-MM-DDTHH:MM"
  end   TEXT NOT NULL,              -- local "YYYY-MM-DDTHH:MM"
  open  INTEGER NOT NULL DEFAULT 1  -- 1 = open for booking, 0 = closed
);

-- A client's reservation of a slot, tied to it by id. Its existence is what
-- makes the slot show as booked on the booking page.
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot  TEXT NOT NULL,              -- slots.id
  name  TEXT NOT NULL,
  email TEXT NOT NULL,
  note  TEXT NOT NULL DEFAULT ''
);
