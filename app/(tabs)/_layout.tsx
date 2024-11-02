import { Stack } from 'expo-router'

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Groups', headerShown: false }}
      />
      <Stack.Screen name="[groupId]" />
      <Stack.Screen
        name="add-group-by-url"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="create-group"
        options={{ presentation: 'modal', title: 'Create group' }}
      />
    </Stack>
  )
}
