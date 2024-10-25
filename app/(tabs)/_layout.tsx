import { Stack } from 'expo-router'

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Groups' }} />
      <Stack.Screen name="[groupId]" />
    </Stack>
  )
}
