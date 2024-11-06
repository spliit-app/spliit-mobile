import {
  RecentGroup,
  getRecentGroups,
  removeRecentGroup,
} from '@/utils/recentGroups'
import { trpc } from '@/utils/trpc'
import {
  Link,
  router,
  useNavigation,
  usePathname,
  useRouter,
} from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SectionList,
  Text,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { MenuView } from '@react-native-menu/menu'
import { match } from 'ts-pattern'
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { BRAND_COLOR, bgBrand, textBrand } from '@/utils/colors'
import { cn } from '@/utils/cn'

export default function GroupsScreen() {
  const [recentGroups, setRecentGroups] = useState<RecentGroup[] | null>(null)

  const { data, refetch } = trpc.groups.list.useQuery({
    groupIds: recentGroups?.map(({ groupId }) => groupId) ?? [],
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

  const sections = [
    { title: 'HEADER', data: [] },
    {
      title: 'Recent Groups',
      data: recentGroups ?? [],
    },
  ]

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        {recentGroups === null ? (
          <View className="h-full flex-col justify-center items-center gap-4">
            <ActivityIndicator size="large" />
            <Text className="text-slate-700">Loading recent groups</Text>
          </View>
        ) : recentGroups.length === 0 ? (
          <View className="h-full flex-col items-center justify-center">
            <Image
              source={require('../../assets/images/logo-with-text.png')}
              contentFit="contain"
              contentPosition="top center"
              style={{ height: 64, width: '100%' }}
            />
            <Text className="text-xl font-semibold mt-8">
              Welcome to Spliit!
            </Text>
            <Text className="text-lg">
              You are now ready to create your first group.
            </Text>
            <Pressable
              className={cn(
                bgBrand,
                'flex-row justify-center rounded-lg px-4 py-2 mt-4 active:opacity-60'
              )}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/create-group',
                })
              }
            >
              <Text className="text-white text-lg font-semibold">
                Create group
              </Text>
            </Pressable>

            <Text className="text-lg mt-12">
              Do you want to add an existing group here?
            </Text>
            <Pressable
              className="flex-row justify-center rounded-lg px-4 py-2 active:opacity-60"
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/add-group-by-url',
                })
              }
            >
              <Text className={cn(textBrand, 'text-lg font-semibold')}>
                Add group by URL
              </Text>
            </Pressable>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(group) => group.groupId}
            renderItem={({ item: recentGroup }) => {
              const group = data?.groups.find(
                (group) => group.id === recentGroup.groupId
              )
              return (
                <View className="mx-4 mb-2 bg-slate-100 rounded-md flex-row justify-between items-stretch">
                  <Link
                    href={{
                      pathname: './[groupId]',
                      params: { groupId: recentGroup.groupId },
                    }}
                    asChild
                  >
                    <Pressable className="flex-1 p-4 gap-1 active:opacity-60">
                      <Text className="font-semibold">
                        {recentGroup.groupName}
                      </Text>
                      <View className="flex-row items-center">
                        <FontAwesome6
                          name="users"
                          className="mr-2"
                          color="grey"
                        />
                        <Text className="text-slate-500 text-sm">
                          {group?._count.participants ?? '…'}
                        </Text>
                        <FontAwesome6
                          name="calendar"
                          className="ml-3 mr-2"
                          color="grey"
                        />
                        <Text className="text-slate-500 text-sm">
                          {(group?.createdAt &&
                            new Date(group.createdAt).toLocaleDateString(
                              'en-US',
                              { dateStyle: 'medium' }
                            )) ??
                            '…'}
                        </Text>
                      </View>
                    </Pressable>
                  </Link>
                  <MenuView
                    title="Group actions"
                    onPressAction={({ nativeEvent }) => {
                      match(nativeEvent.event)
                        .with('open', () => {
                          router.push({
                            pathname: '/[groupId]',
                            params: { groupId: recentGroup.groupId },
                          })
                        })
                        .with('delete', () => {
                          removeRecentGroup(recentGroup.groupId).then(() =>
                            fetchGroups()
                          )
                        })
                    }}
                    actions={[
                      {
                        id: 'open',
                        title: 'Open group',
                      },
                      {
                        id: 'delete',
                        title: 'Delete from list',
                        attributes: {
                          destructive: true,
                        },
                        image: Platform.select({
                          ios: 'trash',
                          android: 'ic_menu_delete',
                        }),
                      },
                    ]}
                    shouldOpenOnLongPress={false}
                    style={{ flexDirection: 'row', alignItems: 'stretch' }}
                  >
                    <View className="px-5 py-5 flex-row items-start">
                      <FontAwesome6 name="ellipsis" />
                    </View>
                  </MenuView>
                </View>
              )
            }}
            renderSectionHeader={({ section: { title } }) =>
              title === 'HEADER' ? (
                <View className="p-4 flex-row justify-between">
                  <Image
                    source={require('../../assets/images/logo-with-text.png')}
                    contentFit="contain"
                    contentPosition="left top"
                    style={{ height: 48, flex: 1 }}
                  />
                  <Pressable
                    onPress={() => router.push('/about')}
                    className="active:opacity-60"
                  >
                    <FontAwesome5 name="cog" color={BRAND_COLOR} size={20} />
                  </Pressable>
                </View>
              ) : (
                <View className="px-4 py-2 mt-2 flex-row justify-between items-baseline">
                  <Text className="text-lg font-bold">{title}</Text>
                  <View className="flex-row gap-4">
                    <Link href="/create-group" asChild>
                      <Text className={cn(textBrand, 'text-lg')}>Create</Text>
                    </Link>
                    <Link href="/add-group-by-url" asChild>
                      <Text className={cn(textBrand, 'text-lg')}>
                        Add by URL
                      </Text>
                    </Link>
                  </View>
                </View>
              )
            }
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
