import { useMemo } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph } from '@hanzo/gui'
import type { Data, Slot } from '../lib/booking'
import {
  clock, dayLabel, dayKey,
  ACCENT_TINT, ACCENT_BORDER, ACCENT_DEEP,
  CARD, INK, MUTE, FAINT, LINE,
} from '../lib/booking'
import { Ghost } from './ui'

/** The accent date chip on the left of each booking row. */
function When({ slot }: { slot: Slot | null }) {
  return (
    <YStack
      width={104}
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$4"
      backgroundColor={ACCENT_TINT}
      borderWidth={1}
      borderColor={ACCENT_BORDER}
      alignItems="center"
    >
      {slot ? (
        <>
          <Text fontSize={12} fontWeight="700" color={ACCENT_DEEP}>{dayLabel(dayKey(slot.start))}</Text>
          <Text fontSize={13} fontWeight="800" color={INK}>{clock(slot.start)}–{clock(slot.end)}</Text>
        </>
      ) : (
        <Text fontSize={12} color={FAINT}>slot removed</Text>
      )}
    </YStack>
  )
}

/**
 * Every booking on the calendar, upcoming first — each joined to its slot's time
 * with the client's details. Cancelling deletes the booking row, which frees the
 * slot again on the booking page (nothing else to update).
 */
export function Bookings({ slots, bookings, refetch }: Data) {
  const remove = useMutation('bookings', 'delete')

  const rows = useMemo(() => {
    const byId = new Map(slots.map((s) => [s.id, s]))
    return bookings
      .map((b) => ({ booking: b, slot: byId.get(b.slot) ?? null }))
      .sort((a, b) => (a.slot?.start ?? '~').localeCompare(b.slot?.start ?? '~'))
  }, [slots, bookings])

  async function cancel(id: string) {
    if (remove.isLoading) return
    await remove.mutate({ id })
    refetch()
  }

  return (
    <YStack gap="$5">
      <XStack alignItems="baseline" justifyContent="space-between" flexWrap="wrap" gap="$2">
        <Text fontSize={22} fontWeight="800" color={INK}>Bookings</Text>
        <Text fontSize={13} color={MUTE}>{bookings.length} total</Text>
      </XStack>

      {remove.error ? <Paragraph color="$red10">{remove.error.message}</Paragraph> : null}

      {rows.length === 0 ? (
        <YStack alignItems="center" justifyContent="center" gap="$3" paddingVertical="$10">
          <Text fontSize={22}>📭</Text>
          <Text fontSize={16} fontWeight="700" color={INK}>No bookings yet</Text>
          <Paragraph color={MUTE} textAlign="center" maxWidth={360}>
            When a client claims one of your open slots it lands here.
          </Paragraph>
        </YStack>
      ) : (
        <YStack gap="$3">
          {rows.map(({ booking, slot }) => (
            <XStack
              key={booking.id}
              alignItems="center"
              gap="$4"
              padding="$3"
              backgroundColor={CARD}
              borderWidth={1}
              borderColor={LINE}
              borderRadius="$6"
              flexWrap="wrap"
            >
              <When slot={slot} />
              <YStack flex={1} gap="$1" minWidth={200}>
                <Text fontSize={15} fontWeight="700" color={INK}>{booking.name}</Text>
                <Text fontSize={13} color={MUTE}>{booking.email}</Text>
                {booking.note ? <Text fontSize={13} color={FAINT}>{booking.note}</Text> : null}
              </YStack>
              <Ghost label="Cancel" onPress={() => cancel(booking.id)} disabled={remove.isLoading} />
            </XStack>
          ))}
        </YStack>
      )}
    </YStack>
  )
}
