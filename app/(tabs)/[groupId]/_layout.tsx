import { trpc } from '@/utils/trpc'
import { Stack, Tabs, useLocalSearchParams } from 'expo-router'

export default function TabLayout() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.get.useQuery({ groupId })
  return (
    <>
      <Stack.Screen options={{ title: data?.group?.name ?? '…' }} />
      <Tabs screenOptions={{ title: data?.group?.name ?? '…' }}>
        <Tabs.Screen name="index" options={{ headerShown: false }} />
      </Tabs>
    </>
  )
}
