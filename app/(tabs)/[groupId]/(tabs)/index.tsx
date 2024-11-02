import { formatCurrency } from '@/utils/formatCurrency'
import { Expense, trpc } from '@/utils/trpc'
import { FontAwesome6 } from '@expo/vector-icons'
import dayjs, { Dayjs } from 'dayjs'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Fragment } from 'react'
import { Pressable, SafeAreaView, SectionList, Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppRouterOutput } from 'spliit-api'
import { match } from 'ts-pattern'

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.get.useQuery({ groupId })

  if (!data?.group) return null

  return <ExpenseList group={data.group} />
}

const PAGE_SIZE = 20

function ExpenseList({
  group,
}: {
  group: NonNullable<AppRouterOutput['groups']['get']['group']>
}) {
  const router = useRouter()
  const { data, fetchNextPage } = trpc.groups.expenses.list.useInfiniteQuery(
    { groupId: group.id, limit: PAGE_SIZE },
    { getNextPageParam: ({ nextCursor }) => nextCursor }
  )

  const expenses = data?.pages.flatMap((page) => page.expenses)
  const hasMore = data?.pages.at(-1)?.hasMore ?? false

  const groups = getGroupedExpensesByDate(expenses ?? [])
  const sections = Object.entries(groups).map(([id, expenses]) => ({
    title: match(id)
      .with('upcoming', () => 'Upcoming')
      .with('thisWeek', () => 'This week')
      .with('earlierThisMonth', () => 'Earlier this month')
      .with('lastMonth', () => 'Last month')
      .with('earlierThisYear', () => 'Earlier this year')
      .with('lastYear', () => 'Last year')
      .with('older', () => 'Older')
      .otherwise(() => id),
    data: expenses,
  }))

  sections.unshift({ title: 'HEADER', data: [] })

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <SectionList
          sections={sections}
          keyExtractor={(expense) => expense.id}
          renderItem={({ item: expense }) => (
            <Pressable
              className="p-4 bg-slate-100 rounded-md mb-2 mx-4 flex-row justify-between"
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/[groupId]/expenses/[expenseId]',
                  params: { groupId: group.id, expenseId: expense.id },
                })
              }
            >
              <View className="gap-1 flex-1">
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
              <View className="gap-1 items-end flex-shrink-0 justify-between">
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
          renderSectionHeader={({ section: { title } }) =>
            title === 'HEADER' ? (
              <View className="px-4 pt-4 mt-2 bg-white flex-row justify-between items-baseline">
                <Text className="font-bold text-lg">Expenses</Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/[groupId]/create-expense',
                      params: { groupId: group.id },
                    })
                  }
                >
                  <Text className="text-emerald-600 text-lg">Add expense</Text>
                </Pressable>
              </View>
            ) : (
              <View className="px-4 pt-4 pb-2 bg-white">
                <Text className="font-bold text-slate-500 text-xs uppercase">
                  {title}
                </Text>
              </View>
            )
          }
          onEndReached={() => {
            if (hasMore) fetchNextPage()
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

function getGroupedExpensesByDate(expenses: Expense[]) {
  const today = dayjs()
  return expenses.reduce((result: { [key: string]: Expense[] }, expense) => {
    const expenseGroup = getExpenseGroup(dayjs(expense.expenseDate), today)
    result[expenseGroup] = result[expenseGroup] ?? []
    result[expenseGroup].push(expense)
    return result
  }, {})
}

function getExpenseGroup(date: Dayjs, today: Dayjs) {
  if (today.isBefore(date)) {
    return EXPENSE_GROUPS.UPCOMING
  } else if (today.isSame(date, 'week')) {
    return EXPENSE_GROUPS.THIS_WEEK
  } else if (today.isSame(date, 'month')) {
    return EXPENSE_GROUPS.EARLIER_THIS_MONTH
  } else if (today.subtract(1, 'month').isSame(date, 'month')) {
    return EXPENSE_GROUPS.LAST_MONTH
  } else if (today.isSame(date, 'year')) {
    return EXPENSE_GROUPS.EARLIER_THIS_YEAR
  } else if (today.subtract(1, 'year').isSame(date, 'year')) {
    return EXPENSE_GROUPS.LAST_YEAR
  } else {
    return EXPENSE_GROUPS.OLDER
  }
}

const EXPENSE_GROUPS = {
  UPCOMING: 'upcoming',
  THIS_WEEK: 'thisWeek',
  EARLIER_THIS_MONTH: 'earlierThisMonth',
  LAST_MONTH: 'lastMonth',
  EARLIER_THIS_YEAR: 'earlierThisYear',
  LAST_YEAR: 'lastYear',
  OLDER: 'older',
}
