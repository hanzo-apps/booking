/**
 * Cadence domain model + the calm visual language, in ONE place.
 *
 * Two org-scoped Hanzo Base collections (see schema.sql):
 *   slots     — a publishable window of time, `open` is the owner's toggle.
 *   bookings  — a client's reservation, `slot` points at a slot by id.
 *
 * "Booked" is DERIVED from bookings (a booking whose `slot` equals the slot id),
 * never stored twice — so every action is a single write and nothing can drift.
 */
import type { BaseRecord } from '@hanzo/base/react'

/** A publishable meeting window (the `slots` collection). */
export interface Slot extends BaseRecord {
  /** Local start, `"YYYY-MM-DDTHH:MM"`. */
  start: string
  /** Local end, `"YYYY-MM-DDTHH:MM"`. */
  end: string
  /** Owner's availability toggle — `1` published, `0` hidden. */
  open: number | boolean
}

/** A client's reservation of a slot (the `bookings` collection). */
export interface Booking extends BaseRecord {
  /** The reserved `Slot.id`. */
  slot: string
  name: string
  email: string
  note: string
}

// ── The single accent + calm neutrals ───────────────────────────────────────
// One accent (calm teal), warm off-white paper, hairline lines. Nothing else.
export const ACCENT = '#0d9488'
export const ACCENT_TINT = '#effbf8'
export const ACCENT_BORDER = '#bfeee3'
export const ACCENT_DEEP = '#0f766e'
export const PAGE = '#fbfbf8'
export const CARD = '#ffffff'
export const INK = '#1b1b18'
export const MUTE = '#78776f'
export const FAINT = '#a3a29a'
export const LINE = '#ebebe5'
export const TAKEN = '#f4f4f0'

// ── Time helpers ─────────────────────────────────────────────────────────────

/** Is this slot published (open) for booking? */
export const isOpen = (s: Slot): boolean => Number(s.open) === 1

/** `"2026-07-21T14:30"` → day key `"2026-07-21"`. */
export const dayKey = (iso: string): string => iso.slice(0, 10)

/** `"2026-07-21T14:30"` → `"14:30"`. */
export const clock = (iso: string): string => iso.slice(11, 16)

/** Compose a local datetime string from a date + `"HH:MM"`. */
export const at = (date: string, time: string): string => `${date}T${time}`

/** Day key `"2026-07-21"` → `"Tue · Jul 21"`. */
export function dayLabel(key: string): string {
  const d = new Date(`${key}T00:00:00`)
  if (Number.isNaN(d.getTime())) return key
  const wd = d.toLocaleDateString(undefined, { weekday: 'short' })
  const md = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${wd} · ${md}`
}

/** Duration between two local datetimes, e.g. `"45 min"` / `"1 hr 30 min"`. */
export function span(start: string, end: string): string {
  const a = new Date(`${start}:00`).getTime()
  const b = new Date(`${end}:00`).getTime()
  const mins = Math.max(0, Math.round((b - a) / 60000))
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}

/** What the shell hands each tab: the two collections + a shared refetch. */
export interface Data {
  slots: Slot[]
  bookings: Booking[]
  refetch: () => void
}

/** A day bucket of slots, days ascending, slots ascending by start. */
export interface DayGroup {
  key: string
  label: string
  slots: Slot[]
}

/** Group slots into ascending day buckets. */
export function byDay(slots: Slot[]): DayGroup[] {
  const buckets = new Map<string, Slot[]>()
  for (const s of slots) {
    const key = dayKey(s.start)
    const list = buckets.get(key)
    if (list) list.push(s)
    else buckets.set(key, [s])
  }
  return [...buckets.keys()]
    .sort()
    .map((key) => ({
      key,
      label: dayLabel(key),
      slots: (buckets.get(key) ?? []).sort((a, b) => a.start.localeCompare(b.start)),
    }))
}

/** Basic shape checks for the availability editor. */
export const isDate = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v)
export const isTime = (v: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(v)

/** Today as `"YYYY-MM-DD"` in local time (a sensible editor default). */
export function today(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
