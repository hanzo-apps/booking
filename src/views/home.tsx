import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph, Spinner } from '@hanzo/gui'
import type { Slot, Booking } from '../lib/booking'
import { ACCENT_DEEP, PAGE, CARD, INK, MUTE, FAINT, LINE } from '../lib/booking'
import { Logo } from './brand'
import { Pill, Ghost } from './ui'
import { Book } from './book'
import { Bookings } from './bookings'
import { Availability } from './availability'

type Tab = 'book' | 'bookings' | 'availability'

/**
 * Signed-in shell: brand bar + Book / Bookings / Availability tabs. The slots
 * and bookings collections are loaded once here and shared with every tab, so a
 * write in one view refetches both and the others stay in sync.
 */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'

  const slotsQ = useQuery<Slot>('slots', { sort: 'start', realtime: false })
  const bookingsQ = useQuery<Booking>('bookings', { sort: '-created', realtime: false })

  const [tab, setTab] = useState<Tab>('book')

  const refetch = () => {
    slotsQ.refetch()
    bookingsQ.refetch()
  }

  const loading = slotsQ.isLoading || bookingsQ.isLoading
  const error = slotsQ.error || bookingsQ.error
  const slots = slotsQ.data
  const bookings = bookingsQ.data

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={PAGE}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        gap="$4"
        paddingHorizontal="$6"
        paddingVertical="$3"
        backgroundColor={CARD}
        borderBottomWidth={1}
        borderColor={LINE}
        flexWrap="wrap"
      >
        <XStack alignItems="center" gap="$3">
          <Logo />
          <YStack>
            <Text fontSize={16} fontWeight="800" color={INK}>Cadence</Text>
            <Text fontSize={11} color={FAINT}>{who}</Text>
          </YStack>
        </XStack>
        <XStack alignItems="center" gap="$2">
          <Pill label="Book" active={tab === 'book'} onPress={() => setTab('book')} />
          <Pill label={`Bookings ${bookings.length}`} active={tab === 'bookings'} onPress={() => setTab('bookings')} />
          <Pill label="Availability" active={tab === 'availability'} onPress={() => setTab('availability')} />
          <Ghost label="Sign out" onPress={() => logout()} size="$3" />
        </XStack>
      </XStack>

      <YStack flex={1} width="100%" maxWidth={860} alignSelf="center" paddingHorizontal="$5" paddingVertical="$6" gap="$5">
        {loading ? (
          <XStack alignItems="center" gap="$3" opacity={0.6}>
            <Spinner color={ACCENT_DEEP} /> <Text color={MUTE}>Loading your schedule…</Text>
          </XStack>
        ) : error ? (
          <Paragraph color="$red10">
            Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re signed in.
          </Paragraph>
        ) : tab === 'book' ? (
          <Book slots={slots} bookings={bookings} refetch={refetch} />
        ) : tab === 'bookings' ? (
          <Bookings slots={slots} bookings={bookings} refetch={refetch} />
        ) : (
          <Availability slots={slots} bookings={bookings} refetch={refetch} />
        )}
      </YStack>
    </YStack>
  )
}
