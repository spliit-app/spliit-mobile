import { trpc } from '@/utils/trpc'
import { FontAwesome5 } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Pressable } from 'react-native'

export default function GroupLayout() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.get.useQuery({ groupId })
  const router = useRouter()
  return (
    <>
      <Stack.Screen
        options={{
          title: data?.group?.name ?? '…',
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
          options={{ headerTitle: 'Settings', presentation: 'modal' }}
        />
      </Stack>
    </>
  )
}
