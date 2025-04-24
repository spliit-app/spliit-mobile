import { ScrollView, Button, Pressable, Text } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useRouter } from 'expo-router'
import { BRAND_COLOR } from '@/utils/colors'
import { trpc } from '@/utils/trpc'
import { addRecentGroup } from '@/utils/recentGroups'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { GroupForm } from '@/components/group-form'
import { TrackScreen, useAnalytics } from '@/components/analytics'
import { useColorScheme } from 'nativewind'
import colors from 'tailwindcss/colors'

export default function CreateGroupScreen() {
  const router = useRouter()
  const { mutateAsync } = trpc.groups.create.useMutation()
  const utils = trpc.useUtils()
  const analytics = useAnalytics()
  const { colorScheme } = useColorScheme()

  return (
    <>
      <Stack.Screen
        options={{
          headerTintColor:
            colorScheme === 'light' ? colors.black : colors.white,
          headerStyle: {
            backgroundColor:
              colorScheme === 'light' ? colors.white : colors.black,
          },
          headerRight: () => (
            <Pressable onPress={() => router.back()}>
              <Text className="text-foreground-accent">Cancel</Text>
            </Pressable>
          ),
        }}
      />
      <TrackScreen screenName="create-group" />
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} className="flex-1 bg-background">
          <KeyboardAwareScrollView bottomOffset={20}>
            <GroupForm
              groupDetails={null}
              onSave={async (groupFormValues) => {
                const { groupId } = await mutateAsync({ groupFormValues })
                await utils.groups.invalidate()
                await addRecentGroup({
                  groupId,
                  groupName: groupFormValues.name,
                })
                analytics.trackEvent({ eventName: 'create-group' })
                router.back()
              }}
            />
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  )
}
