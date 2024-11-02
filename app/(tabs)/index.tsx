import { RecentGroup, getRecentGroups } from '@/utils/recentGroups'
import { trpc } from '@/utils/trpc'
import { Link, useNavigation, usePathname, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, SectionList, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function GroupsScreen() {
  const [recentGroups, setRecentGroups] = useState<RecentGroup[]>([])

  const { data, isLoading, refetch } = trpc.groups.list.useQuery({
    groupIds: recentGroups.map(({ groupId }) => groupId),
  })

  const fetchGroups = useCallback(() => {
    getRecentGroups().then((recentGroups) => {
      setRecentGroups(recentGroups)
      refetch()
    })
  }, [refetch])

  const navigation = useNavigation()
  const pathname = usePathname()
  useEffect(() => {
    if (navigation.isFocused()) {
      fetchGroups()
    }
  }, [pathname, navigation, fetchGroups])

  if (isLoading) return <Text>Loading...</Text>

  if (!data) return <Text>Error</Text>

  const sections = [
    {
      title: 'Recent Groups',
      data: recentGroups
        .map((recentGroup) =>
          data.groups.find((group) => group.id === recentGroup.groupId)
        )
        .filter(Boolean),
    },
  ]

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
              <Pressable className="mx-4 mb-2 p-4 bg-slate-100 rounded-md">
                <Text>{group.name}</Text>
              </Pressable>
            </Link>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View className="px-4 py-2 mt-2 flex-row justify-between items-baseline">
              <Text className="text-lg font-bold">{title}</Text>
              <View className="flex-row gap-4">
                <Link href="/create-group" asChild>
                  <Text className="text-lg text-emerald-600">Create</Text>
                </Link>
                <Link href="/add-group-by-url" asChild>
                  <Text className="text-lg text-emerald-600">Add by URL</Text>
                </Link>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
