import { ScrollView, Button, Pressable, Text } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router'
import { trpc } from '@/utils/trpc'
import { BRAND_COLOR } from '@/utils/colors'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { GroupForm } from '@/components/group-form'
import { TrackScreen } from '@/components/analytics'
import { useColorScheme } from 'nativewind'
import colors from 'tailwindcss/colors'

export default function GroupSettingsScreen() {
  const { groupId } = useGlobalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.getDetails.useQuery({ groupId })
  const { mutateAsync } = trpc.groups.update.useMutation()
  const utils = trpc.useUtils()
  const router = useRouter()
  const { colorScheme } = useColorScheme()

  return (
    <>
      <TrackScreen screenName="group-settings" eventProps={{ groupId }} />
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.back()}>
              <Text className="text-foreground-accent">Close</Text>
            </Pressable>
          ),
          headerTintColor:
            colorScheme === 'light' ? colors.black : colors.white,
          headerStyle: {
            backgroundColor:
              colorScheme === 'light' ? colors.white : colors.black,
          },
        }}
      />
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} className="flex-1 bg-background">
          <KeyboardAwareScrollView bottomOffset={20}>
            {data && (
              <GroupForm
                groupDetails={data.group}
                participantWithExpenses={data.participantsWithExpenses}
                onSave={async (groupFormValues) => {
                  await mutateAsync({
                    groupId,
                    groupFormValues: groupFormValues,
                  })
                  await utils.groups.invalidate()
                  router.back()
                }}
              />
            )}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  )
}
