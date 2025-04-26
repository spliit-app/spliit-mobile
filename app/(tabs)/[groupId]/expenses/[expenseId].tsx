import { TrackScreen } from '@/components/analytics'
import { ExpenseForm } from '@/components/expense-form'
import { trpc } from '@/utils/trpc'
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { Pressable, Text } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import colors from 'tailwindcss/colors'

export default function ExpenseScreen() {
  const router = useRouter()
  const { groupId, expenseId } = useGlobalSearchParams<{
    groupId: string
    expenseId: string
  }>()

  const { data: expenseData } = trpc.groups.expenses.get.useQuery({
    groupId,
    expenseId,
  })
  const { data: groupData } = trpc.groups.get.useQuery({ groupId })

  const { mutateAsync } = trpc.groups.expenses.update.useMutation()
  const utils = trpc.useUtils()

  const { colorScheme } = useColorScheme()

  return (
    <>
      <TrackScreen
        screenName="group-edit-expense"
        eventProps={{ groupId, expenseId }}
      />
      <Stack.Screen
        options={{
          title: expenseData?.expense.title ?? '…',
          headerTintColor:
            colorScheme === 'light' ? colors.black : colors.white,
          headerStyle: {
            backgroundColor:
              colorScheme === 'light' ? colors.white : colors.black,
          },
          headerRight: () => (
            <Pressable onPress={() => router.back()}>
              <Text className="text-foreground-accent">Close</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} className="flex-1 bg-background">
          <KeyboardAwareScrollView bottomOffset={20}>
            {expenseData && groupData?.group && (
              <ExpenseForm
                expense={expenseData.expense}
                group={groupData.group}
                onSave={async (expenseFormValues) => {
                  await mutateAsync({ groupId, expenseId, expenseFormValues })
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
