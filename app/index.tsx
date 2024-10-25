import { trpc } from '@/utils/trpc'
import { Text, View } from 'react-native'

export default function Index() {
  const { data, isLoading, error } = trpc.groups.get.useQuery({
    groupId: process.env.EXPO_PUBLIC_GROUP_ID ?? '',
  })
  console.log(data, isLoading, error)

  return (
    <View className="flex-1 justify-center items-center">
      <Text>Edit file app/index.tsx to edit this screen.</Text>
      <Text className="font-mono">
        Data: {isLoading}, {JSON.stringify(data, undefined, 2)}
      </Text>
    </View>
  )
}
