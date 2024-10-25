import { trpc } from '@/utils/trpc'
import { Link } from 'expo-router'
import { Pressable, SectionList, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function GroupsScreen() {
  const { data, isLoading } = trpc.groups.list.useQuery({
    groupIds: [process.env.EXPO_PUBLIC_GROUP_ID ?? ''],
  })
  if (isLoading) return <Text>Loading...</Text>

  if (!data) return <Text>Error</Text>

  const sections = [{ title: 'Groups', data: data.groups }]

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <SectionList
          sections={sections}
          keyExtractor={(group) => group.id}
          renderItem={({ item: group }) => (
            <Link
              href={{
                pathname: './[groupId]',
                params: { groupId: group.id },
              }}
              asChild
            >
              <Pressable className="mx-4 my-2 p-4 bg-slate-100 rounded-md">
                <Text>{group.name}</Text>
              </Pressable>
            </Link>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View className="px-4 pt-2">
              <Text className="font-bold">{title}</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
