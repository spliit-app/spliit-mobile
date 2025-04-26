import { TrackScreen, useAnalytics } from '@/components/analytics'
import { ExpenseForm } from '@/components/expense-form'
import { trpc } from '@/utils/trpc'
import {
  Stack,
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from 'expo-router'
import { useColorScheme } from 'nativewind'
import { Pressable, Text } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import colors from 'tailwindcss/colors'

export default function ExpenseScreen() {
  const router = useRouter()
  const { groupId } = useGlobalSearchParams<{
    groupId: string
  }>()

  const params = useLocalSearchParams()

  const { data: groupData } = trpc.groups.get.useQuery({ groupId })

  const { mutateAsync } = trpc.groups.expenses.create.useMutation()
  const utils = trpc.useUtils()
  const analytics = useAnalytics()

  const { colorScheme } = useColorScheme()

  return (
    <>
      <TrackScreen screenName="group-create-expense" eventProps={{ groupId }} />
      <Stack.Screen
        options={{
          title: 'Add expense',
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
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} className="flex-1 bg-background">
          <KeyboardAwareScrollView bottomOffset={20}>
            {groupData?.group && (
              <ExpenseForm
                expense={null}
                reimbursementParams={
                  params.isReimbursement
                    ? {
                        title: params.title as string,
                        paidBy: params.paidBy as string,
                        paidFor: params.paidFor as string,
                        amount: Number(params.amount),
                      }
                    : undefined
                }
                group={groupData.group}
                onSave={async (expenseFormValues) => {
                  await mutateAsync({ groupId, expenseFormValues })
                  await utils.groups.invalidate()
                  analytics.trackEvent({
                    eventName: 'create-expense',
                    eventProps: { groupId },
                  })
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
