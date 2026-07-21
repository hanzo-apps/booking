import { YStack } from '@hanzo/gui'
import { ACCENT, ACCENT_TINT, ACCENT_BORDER } from '../lib/booking'

/**
 * The Cadence mark: three stacked slots in a soft tile, the middle one filled —
 * one taken window in an open day. Calm, single-accent, on-concept.
 */
export function Logo({ size = 30 }: { size?: number }) {
  const bar = size * 0.5
  const h = Math.max(2, size * 0.11)
  const Bar = ({ on }: { on?: boolean }) => (
    <YStack
      width={bar}
      height={h}
      borderRadius={h}
      backgroundColor={ACCENT}
      opacity={on ? 1 : 0.32}
    />
  )
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={size / 3.4}
      backgroundColor={ACCENT_TINT}
      borderWidth={1}
      borderColor={ACCENT_BORDER}
      alignItems="center"
      justifyContent="center"
      gap={size * 0.085}
    >
      <Bar />
      <Bar on />
      <Bar />
    </YStack>
  )
}
