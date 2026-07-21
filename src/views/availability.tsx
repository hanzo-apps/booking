import { useMemo, useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph } from '@hanzo/gui'
import type { Data, Slot } from '../lib/booking'
import {
  isOpen, byDay, clock, span, at, isDate, isTime, today,
  CARD, INK, MUTE, FAINT, LINE, TAKEN,
} from '../lib/booking'
import { Field, Primary, Ghost, Pill } from './ui'

/** A small "booked" marker so the owner won't remove a claimed slot. */
function BookedChip() {
  return (
    <XStack paddingHorizontal="$2" paddingVertical="$1" borderRadius="$10" backgroundColor={TAKEN} borderWidth={1} borderColor={LINE}>
      <Text fontSize={11} fontWeight="600" color={FAINT}>booked</Text>
    </XStack>
  )
}

/**
 * The availability editor: publish the windows you are free, then open/close or
 * remove them. Each row writes one slot; a slot that a client has already booked
 * can't be deleted here (cancel it under Bookings first).
 */
export function Availability({ slots, bookings, refetch }: Data) {
  const create = useMutation('slots', 'create')
  const update = useMutation('slots', 'update')
  const remove = useMutation('slots', 'delete')

  const [date, setDate] = useState(today())
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('09:30')
  const [err, setErr] = useState<string | null>(null)

  const takenBy = useMemo(() => new Set(bookings.map((b) => b.slot)), [bookings])
  const days = useMemo(() => byDay(slots), [slots])

  async function add() {
    if (create.isLoading) return
    if (!isDate(date)) return setErr('Date must look like 2026-07-21.')
    if (!isTime(start) || !isTime(end)) return setErr('Times must look like 14:30.')
    if (start >= end) return setErr('End time must be after the start.')
    setErr(null)
    await create.mutate({ start: at(date, start), end: at(date, end), open: 1 })
    refetch()
  }

  async function toggle(s: Slot) {
    if (update.isLoading) return
    await update.mutate({ id: s.id, open: isOpen(s) ? 0 : 1 })
    refetch()
  }

  async function del(id: string) {
    if (remove.isLoading) return
    await remove.mutate({ id })
    refetch()
  }

  return (
    <YStack gap="$5">
      <Text fontSize={22} fontWeight="800" color={INK}>Availability</Text>

      <YStack gap="$3" padding="$4" backgroundColor={CARD} borderWidth={1} borderColor={LINE} borderRadius="$6">
        <Text fontSize={13} fontWeight="700" color={INK}>Publish a slot</Text>
        <XStack gap="$3" flexWrap="wrap" alignItems="flex-end">
          <Field label="Date" value={date} placeholder="2026-07-21" onChange={setDate} width={150} grow={false} />
          <Field label="Start" value={start} placeholder="09:00" onChange={setStart} width={96} grow={false} />
          <Field label="End" value={end} placeholder="09:30" onChange={setEnd} width={96} grow={false} />
          <Primary label={create.isLoading ? 'Adding…' : 'Add slot'} onPress={add} disabled={create.isLoading} />
        </XStack>
        {err ? <Paragraph color="$red10">{err}</Paragraph> : null}
        {create.error ? <Paragraph color="$red10">{create.error.message}</Paragraph> : null}
      </YStack>

      {days.length === 0 ? (
        <Paragraph color={MUTE}>No slots yet — publish your first window above.</Paragraph>
      ) : (
        <YStack gap="$4">
          {days.map((d) => (
            <YStack key={d.key} gap="$2">
              <Text fontSize={14} fontWeight="700" color={INK}>{d.label}</Text>
              {d.slots.map((s) => {
                const open = isOpen(s)
                const booked = takenBy.has(s.id)
                return (
                  <XStack
                    key={s.id}
                    alignItems="center"
                    gap="$3"
                    padding="$3"
                    backgroundColor={CARD}
                    borderWidth={1}
                    borderColor={LINE}
                    borderRadius="$5"
                    flexWrap="wrap"
                  >
                    <YStack flex={1} minWidth={140}>
                      <Text fontSize={15} fontWeight="700" color={open ? INK : FAINT}>
                        {clock(s.start)}–{clock(s.end)}
                      </Text>
                      <Text fontSize={12} color={FAINT}>{span(s.start, s.end)}</Text>
                    </YStack>
                    {booked ? <BookedChip /> : null}
                    <Pill label={open ? 'Open' : 'Closed'} active={open} onPress={() => toggle(s)} disabled={update.isLoading} size="$2" />
                    <Ghost label="Remove" onPress={() => del(s.id)} disabled={booked || remove.isLoading} size="$2" />
                  </XStack>
                )
              })}
            </YStack>
          ))}
        </YStack>
      )}
    </YStack>
  )
}
