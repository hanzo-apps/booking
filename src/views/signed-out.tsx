import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Text, Paragraph } from '@hanzo/gui'
import { Logo } from './brand'
import { Primary } from './ui'
import {
  ACCENT, ACCENT_TINT, ACCENT_BORDER, ACCENT_DEEP,
  PAGE, CARD, INK, MUTE, FAINT, LINE, TAKEN,
} from '../lib/booking'

/** One time pill in the preview grid — open (accent) or taken (muted). */
function Pill({ time, taken }: { time: string; taken?: boolean }) {
  return (
    <YStack
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$4"
      borderWidth={1}
      backgroundColor={taken ? TAKEN : ACCENT_TINT}
      borderColor={taken ? LINE : ACCENT_BORDER}
    >
      <Text fontSize={13} fontWeight="600" color={taken ? FAINT : ACCENT_DEEP}>
        {time}
      </Text>
      <Text fontSize={10} color={taken ? FAINT : ACCENT} opacity={taken ? 1 : 0.7}>
        {taken ? 'booked' : 'open'}
      </Text>
    </YStack>
  )
}

/** A calm three-day preview of the slot grid — the hero illustration. */
function Preview() {
  const days: { day: string; slots: { time: string; taken?: boolean }[] }[] = [
    { day: 'Mon', slots: [{ time: '9:00' }, { time: '10:30', taken: true }, { time: '13:00' }] },
    { day: 'Tue', slots: [{ time: '9:30' }, { time: '11:00' }, { time: '15:00', taken: true }] },
    { day: 'Wed', slots: [{ time: '10:00', taken: true }, { time: '11:30' }, { time: '14:30' }] },
  ]
  return (
    <YStack
      backgroundColor={CARD}
      borderRadius="$8"
      borderWidth={1}
      borderColor={LINE}
      padding="$5"
      gap="$4"
      width="100%"
      maxWidth={440}
      shadowColor="#0f172a"
      shadowOpacity={0.06}
      shadowRadius={30}
      shadowOffset={{ width: 0, height: 12 }}
    >
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize={13} fontWeight="700" color={INK}>This week</Text>
        <Text fontSize={12} color={MUTE}>3 days · 9 slots</Text>
      </XStack>
      <XStack gap="$3">
        {days.map((d) => (
          <YStack key={d.day} flex={1} gap="$2">
            <Text fontSize={11} fontWeight="600" color={MUTE} textAlign="center">{d.day}</Text>
            {d.slots.map((s) => (
              <Pill key={s.time} time={s.time} taken={s.taken} />
            ))}
          </YStack>
        ))}
      </XStack>
    </YStack>
  )
}

/**
 * Signed-out landing. One action: PKCE sign-in with Hanzo (hanzo.id). There is
 * no local credential form — Hanzo IAM owns every credential interaction.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={PAGE}>
      <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$6" paddingVertical="$4">
        <XStack alignItems="center" gap="$3">
          <Logo />
          <Text fontSize={17} fontWeight="800" color={INK}>Cadence</Text>
        </XStack>
        <Text fontSize={12} color={FAINT}>on Hanzo</Text>
      </XStack>

      <XStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        gap="$9"
        paddingHorizontal="$6"
        paddingVertical="$8"
      >
        <YStack gap="$5" maxWidth={460} flexGrow={1} flexBasis={360}>
          <XStack
            alignSelf="flex-start"
            alignItems="center"
            gap="$2"
            paddingHorizontal="$3"
            paddingVertical="$1"
            borderRadius="$10"
            backgroundColor={ACCENT_TINT}
            borderWidth={1}
            borderColor={ACCENT_BORDER}
          >
            <YStack width={6} height={6} borderRadius={3} backgroundColor={ACCENT} />
            <Text fontSize={12} fontWeight="600" color={ACCENT_DEEP}>Scheduling, calmly</Text>
          </XStack>

          <H1 fontSize={44} lineHeight={48} fontWeight="800" color={INK}>
            Book time without the back-and-forth.
          </H1>

          <Paragraph fontSize={17} lineHeight={26} color={MUTE}>
            Publish the windows you are free, share one calm page, and let clients
            claim a slot. Every booking lands in your org — no double-booking, no
            email ping-pong.
          </Paragraph>

          <XStack alignItems="center" gap="$4" flexWrap="wrap">
            <Primary
              label={isLoading ? 'Loading…' : 'Sign in with Hanzo'}
              onPress={() => login()}
              disabled={isLoading}
              size="$5"
              radius="$6"
            />
            <Text fontSize={13} color={FAINT}>Free · no card</Text>
          </XStack>
        </YStack>

        <Preview />
      </XStack>
    </YStack>
  )
}
