import { trpc } from '@/utils/trpc'
import { Tabs, useLocalSearchParams } from 'expo-router'
import { Fragment } from 'react'
import { Pressable, SafeAreaView, SectionList, Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppRouterOutput } from 'spliit-api'

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.get.useQuery({ groupId })

  if (!data?.group) return null

  return <ExpenseList group={data.group} />
}

function ExpenseList({
  group,
}: {
  group: NonNullable<AppRouterOutput['groups']['get']['group']>
}) {
  const { data } = trpc.groups.expenses.list.useQuery({ groupId: group.id })
  const sections = data?.expenses
    ? [{ title: 'Expenses', data: data.expenses }]
    : []
  return (
    <>
      <Tabs.Screen options={{ title: 'Expenses' }} />
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-white">
          <SectionList
            sections={sections}
            keyExtractor={(expense) => expense.id}
            renderItem={({ item: expense }) => (
              <Pressable className="p-4 bg-slate-100 rounded-md mb-2 mx-4 flex-row justify-between">
                <View className="gap-1">
                  <Text>{expense.title}</Text>
                  <Text className="text-xs text-slate-600">
                    Paid by{' '}
                    <Text className="font-bold">{expense.paidBy.name}</Text> for{' '}
                    {expense.paidFor.map(({ participant }, index) => (
                      <Fragment key={index}>
                        {index > 0 && ', '}
                        <Text className="font-bold">{participant.name}</Text>
                      </Fragment>
                    ))}
                  </Text>
                </View>
                <View className="gap-1 items-end">
                  <Text className="font-bold">
                    {formatCurrency(group.currency, expense.amount / 100)}
                  </Text>
                  <Text className="text-xs text-slate-600">
                    {expense.createdAt.toLocaleDateString('en-US', {
                      dateStyle: 'medium',
                    })}
                  </Text>
                </View>
              </Pressable>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View className="px-4 pt-4 pb-2 bg-white">
                <Text className="font-bold">{title}</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  )
}

function formatCurrency(currency: string, amount: number) {
  const format = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    // '€' will be placed in correct position
    currency: 'EUR',
  })
  const formattedAmount = format.format(amount)
  return formattedAmount.replace('€', currency)
}