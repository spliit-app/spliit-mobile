import { trpc } from '@/utils/trpc'
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import { Stack, Tabs, useLocalSearchParams } from 'expo-router'

export default function TabLayout() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.get.useQuery({ groupId })
  return (
    <>
      <Stack.Screen options={{ title: data?.group?.name ?? '…' }} />
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Expenses',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="list" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="balances"
          options={{
            title: 'Balances',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome6
                name="money-bill-transfer"
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="cog" size={28} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  )
}
