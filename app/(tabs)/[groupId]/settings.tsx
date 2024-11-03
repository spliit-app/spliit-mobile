import { ScrollView, Button } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router'
import { trpc } from '@/utils/trpc'
import { BRAND_COLOR } from '@/utils/colors'
import { GroupForm } from '../group-form'

export default function GroupSettingsScreen() {
  const { groupId } = useGlobalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.getDetails.useQuery({ groupId })
  const { mutateAsync } = trpc.groups.update.useMutation()
  const utils = trpc.useUtils()
  const router = useRouter()

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              title="Cancel"
              color={BRAND_COLOR}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
          <ScrollView className="flex-1">
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
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  )
}
