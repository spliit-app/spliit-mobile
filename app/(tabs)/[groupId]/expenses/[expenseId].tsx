import { trpc } from '@/utils/trpc'
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router'
import { Button } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { ExpenseForm } from '../expense-form'
import { BRAND_COLOR } from '@/utils/colors'

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

  return (
    <>
      <Stack.Screen
        options={{
          title: expenseData?.expense.title ?? '…',
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
            {expenseData && groupData?.group && (
              <ExpenseForm
                expense={expenseData.expense}
                group={groupData.group}
                onSave={async (expenseFormValues) => {
                  console.log({ expenseFormValues })
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
