import { trpc } from '@/utils/trpc'
import { FontAwesome, FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Pressable, Text } from 'react-native'

export default function GroupLayout() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.get.useQuery({ groupId })
  const router = useRouter()
  return (
    <>
      <Stack.Screen
        options={{
          title: data?.group?.name ?? '…',
          headerLeft: () => (
            <Pressable
              className="flex-row items-center gap-2 py-2 pr-2"
              onPress={() => router.back()}
            >
              <FontAwesome6 size={20} color="#059669" name="chevron-left" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/[groupId]/settings',
                  params: { groupId },
                })
              }
            >
              <FontAwesome5 name="cog" size={20} color="#059669" />
            </Pressable>
          ),
        }}
      />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{ headerTitle: 'Group settings', presentation: 'modal' }}
        />
        <Stack.Screen
          name="expenses/[expenseId]"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="create-expense"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </>
  )
}
