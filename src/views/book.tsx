import { useMemo, useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Text, Button, Paragraph } from '@hanzo/gui'
import type { Data, Slot } from '../lib/booking'
import {
  isOpen, byDay, clock, span, dayLabel, dayKey,
  ACCENT, ACCENT_TINT, ACCENT_BORDER, ACCENT_DEEP,
  CARD, INK, MUTE, FAINT, LINE, TAKEN,
} from '../lib/booking'
import { Field, Primary, Ghost } from './ui'

/** One slot in the grid: bookable (accent), selected (filled), or taken (muted). */
function SlotButton({ slot, taken, selected, onPress }: {
  slot: Slot; taken: boolean; selected: boolean; onPress: () => void
}) {
  const bg = taken ? TAKEN : selected ? ACCENT : CARD
  const border = taken ? LINE : selected ? ACCENT : ACCENT_BORDER
  const ink = taken ? FAINT : selected ? '#ffffff' : ACCENT_DEEP
  return (
    <Button
      onPress={onPress}
      disabled={taken}
      height="auto"
      paddingHorizontal="$3"
      paddingVertical="$2"
      backgroundColor={bg}
      borderWidth={1}
      borderColor={border}
      borderRadius="$5"
      hoverStyle={{ borderColor: taken ? LINE : ACCENT }}
    >
      <YStack alignItems="flex-start">
        <Text fontSize={14} fontWeight="700" color={ink}>{clock(slot.start)}</Text>
        <Text fontSize={11} color={ink} opacity={taken || selected ? 0.85 : 0.6}>
          {taken ? 'booked' : span(slot.start, slot.end)}
        </Text>
      </YStack>
    </Button>
  )
}

/**
 * The booking page: open windows laid out as a calm agenda, one day per row.
 * Pick an open slot, fill in who you are, and confirm — that writes one booking
 * row (which marks the slot taken everywhere, since "taken" is derived).
 */
export function Book({ slots, bookings, refetch }: Data) {
  const create = useMutation('bookings', 'create')
  const [chosen, setChosen] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const takenBy = useMemo(() => {
    const m = new Set<string>()
    for (const b of bookings) m.add(b.slot)
    return m
  }, [bookings])

  const days = useMemo(() => byDay(slots.filter(isOpen)), [slots])
  const slot = chosen ? slots.find((s) => s.id === chosen) ?? null : null

  function pick(id: string) {
    setErr(null)
    setChosen((cur) => (cur === id ? null : id))
  }

  async function confirm() {
    if (!slot || create.isLoading) return
    if (!name.trim()) return setErr('Add a name for the booking.')
    if (!email.includes('@')) return setErr('Add a valid email.')
    await create.mutate({ slot: slot.id, name: name.trim(), email: email.trim(), note: note.trim() })
    setChosen(null)
    setName('')
    setEmail('')
    setNote('')
    setErr(null)
    refetch()
  }

  const openCount = days.reduce((n, d) => n + d.slots.filter((s) => !takenBy.has(s.id)).length, 0)

  if (days.length === 0) {
    return (
      <YStack alignItems="center" justifyContent="center" gap="$3" paddingVertical="$10">
        <Text fontSize={22}>🗓️</Text>
        <Text fontSize={16} fontWeight="700" color={INK}>No open slots yet</Text>
        <Paragraph color={MUTE} textAlign="center" maxWidth={360}>
          Head to <Text color={ACCENT_DEEP} fontWeight="700">Availability</Text> to publish the windows you are free, then they show up here to book.
        </Paragraph>
      </YStack>
    )
  }

  return (
    <YStack gap="$5">
      <XStack alignItems="baseline" justifyContent="space-between" flexWrap="wrap" gap="$2">
        <Text fontSize={22} fontWeight="800" color={INK}>Book a time</Text>
        <Text fontSize={13} color={MUTE}>{openCount} open · {bookings.length} booked</Text>
      </XStack>

      {slot ? (
        <YStack
          gap="$3"
          padding="$4"
          backgroundColor={ACCENT_TINT}
          borderWidth={1}
          borderColor={ACCENT_BORDER}
          borderRadius="$6"
        >
          <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="$2">
            <YStack>
              <Text fontSize={12} fontWeight="600" color={ACCENT_DEEP}>Booking</Text>
              <Text fontSize={16} fontWeight="800" color={INK}>
                {dayLabel(dayKey(slot.start))} · {clock(slot.start)}–{clock(slot.end)}
              </Text>
            </YStack>
            <Ghost label="Clear" onPress={() => setChosen(null)} />
          </XStack>
          <XStack gap="$3" flexWrap="wrap">
            <Field label="Name" value={name} placeholder="Jordan Lee" onChange={setName} />
            <Field label="Email" value={email} placeholder="jordan@acme.co" onChange={setEmail} keyboard="email-address" />
          </XStack>
          <Field label="Note (optional)" value={note} placeholder="What's this about?" onChange={setNote} />
          {err ? <Paragraph color="$red10">{err}</Paragraph> : null}
          {create.error ? <Paragraph color="$red10">{create.error.message}</Paragraph> : null}
          <XStack>
            <Primary
              label={create.isLoading ? 'Booking…' : 'Confirm booking'}
              onPress={confirm}
              disabled={create.isLoading}
            />
          </XStack>
        </YStack>
      ) : null}

      <YStack gap="$4">
        {days.map((d) => (
          <XStack key={d.key} gap="$4" alignItems="flex-start" flexWrap="wrap">
            <YStack width={116} paddingTop="$2">
              <Text fontSize={14} fontWeight="700" color={INK}>{d.label}</Text>
              <Text fontSize={12} color={FAINT}>{d.slots.length} slots</Text>
            </YStack>
            <XStack flex={1} gap="$2" flexWrap="wrap" minWidth={220}>
              {d.slots.map((s) => (
                <SlotButton
                  key={s.id}
                  slot={s}
                  taken={takenBy.has(s.id)}
                  selected={chosen === s.id}
                  onPress={() => pick(s.id)}
                />
              ))}
            </XStack>
          </XStack>
        ))}
      </YStack>
    </YStack>
  )
}
