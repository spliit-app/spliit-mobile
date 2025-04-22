import { BRAND_COLOR } from '@/utils/colors'
import { useSettings } from '@/utils/settings'
import { trpc } from '@/utils/trpc'
import { FontAwesome6 } from '@expo/vector-icons'
import { MenuView } from '@react-native-menu/menu'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { Platform, Pressable, Share, View } from 'react-native'
import colors from 'tailwindcss/colors'
import { match } from 'ts-pattern'

export default function GroupLayout() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.get.useQuery({ groupId })
  const router = useRouter()
  const {
    settings: { baseUrl },
  } = useSettings()
  const { colorScheme } = useColorScheme()

  return (
    <>
      <Stack.Screen
        options={{
          title: data?.group?.name ?? '…',
          headerTintColor:
            colorScheme === 'light' ? colors.black : colors.white,
          headerStyle: {
            backgroundColor:
              colorScheme === 'light' ? colors.white : colors.black,
          },
          headerLeft: () => (
            <Pressable
              className="flex-row items-center gap-2 py-2 pr-2 active:opacity-60"
              onPress={() => router.dismiss()}
            >
              <FontAwesome6
                size={20}
                className="text-foreground-accent"
                name="chevron-left"
              />
            </Pressable>
          ),
          headerRight: () => (
            <MenuView
              title="Group actions"
              onPressAction={({ nativeEvent }) => {
                match(nativeEvent.event)
                  .with('edit', () =>
                    router.push({
                      pathname: '/[groupId]/settings',
                      params: { groupId },
                    }),
                  )
                  .with('share', () =>
                    Share.share({
                      title: `Join the group ${
                        data?.group?.name ?? ''
                      } on Spliit!`,
                      url: `${baseUrl}groups/${groupId}`,
                    }),
                  )
              }}
              actions={[
                {
                  id: 'edit',
                  title: 'Edit group',
                  image: Platform.select({
                    ios: 'pencil',
                  }),
                },
                {
                  id: 'share',
                  title: 'Share group',
                  image: Platform.select({
                    ios: 'square.and.arrow.up',
                  }),
                },
              ]}
              shouldOpenOnLongPress={false}
              style={{ flexDirection: 'row', alignItems: 'stretch' }}
            >
              <View className="-mr-5 px-5 py-5 flex-row items-start">
                <FontAwesome6
                  name="ellipsis"
                  size={14}
                  className="text-foreground-accent"
                />
              </View>
            </MenuView>
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
