import { type ComponentProps } from 'react'
import { YStack, Text, Input, Button } from '@hanzo/gui'
import {
  ACCENT, ACCENT_TINT, ACCENT_BORDER, ACCENT_DEEP,
  CARD, INK, MUTE, LINE,
} from '../lib/booking'

// @hanzo/gui's Button is a frame — text color/weight can't ride on it as props,
// so every button here sets them on an explicit <Text> child. Sizes/radii reuse
// the Button prop types so nothing drifts.
type Size = ComponentProps<typeof Button>['size']
type Radius = ComponentProps<typeof Button>['borderRadius']

/**
 * The one calm labelled input, shared by the booking form and the availability
 * editor. `width` fixes the field (time inputs); otherwise it grows to fill.
 */
export function Field({ label, value, placeholder, onChange, keyboard, width, grow = true }: {
  label: string
  value: string
  placeholder: string
  onChange: (v: string) => void
  keyboard?: 'email-address'
  width?: number
  grow?: boolean
}) {
  return (
    <YStack gap="$1.5" width={width} flexGrow={grow ? 1 : 0} flexShrink={0} minWidth={width ?? 160}>
      <Text fontSize={12} fontWeight="600" color={MUTE}>{label}</Text>
      <Input
        value={value}
        placeholder={placeholder}
        onChangeText={onChange}
        keyboardType={keyboard}
        backgroundColor={CARD}
        borderColor={LINE}
        borderWidth={1}
        borderRadius="$4"
        color={INK}
      />
    </YStack>
  )
}

/** Accent-filled primary action. */
export function Primary({ label, onPress, disabled, size = '$4', radius = '$5' }: {
  label: string; onPress: () => void; disabled?: boolean; size?: Size; radius?: Radius
}) {
  return (
    <Button
      size={size}
      onPress={onPress}
      disabled={disabled}
      backgroundColor={ACCENT}
      borderWidth={0}
      borderRadius={radius}
      hoverStyle={{ backgroundColor: ACCENT_DEEP }}
      pressStyle={{ backgroundColor: ACCENT_DEEP }}
    >
      <Text color="#ffffff" fontWeight="700" fontSize={15}>{label}</Text>
    </Button>
  )
}

/** Quiet chromeless text action (sign out, cancel, clear, remove). */
export function Ghost({ label, onPress, disabled, size = '$2' }: {
  label: string; onPress: () => void; disabled?: boolean; size?: Size
}) {
  return (
    <Button size={size} chromeless onPress={onPress} disabled={disabled} hoverStyle={{ backgroundColor: LINE }}>
      <Text color={MUTE} fontWeight="600" fontSize={13}>{label}</Text>
    </Button>
  )
}

/** Pill that reads accent when active (tabs) or open (availability toggle). */
export function Pill({ label, active, onPress, disabled, size = '$3' }: {
  label: string; active: boolean; onPress: () => void; disabled?: boolean; size?: Size
}) {
  return (
    <Button
      size={size}
      onPress={onPress}
      disabled={disabled}
      backgroundColor={active ? ACCENT_TINT : 'transparent'}
      borderWidth={1}
      borderColor={active ? ACCENT_BORDER : 'transparent'}
      borderRadius="$10"
      hoverStyle={{ backgroundColor: active ? ACCENT_TINT : LINE }}
    >
      <Text color={active ? ACCENT_DEEP : MUTE} fontWeight={active ? '700' : '500'} fontSize={14}>
        {label}
      </Text>
    </Button>
  )
}
