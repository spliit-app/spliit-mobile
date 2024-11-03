import { ScrollView, Button } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useRouter } from 'expo-router'
import { BRAND_COLOR } from '@/utils/colors'
import { GroupForm } from './group-form'
import { trpc } from '@/utils/trpc'
import { addRecentGroup } from '@/utils/recentGroups'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

export default function CreateGroupScreen() {
  const router = useRouter()
  const { mutateAsync } = trpc.groups.create.useMutation()
  const utils = trpc.useUtils()

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
                router.back()
              }}
            />
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  )
}
