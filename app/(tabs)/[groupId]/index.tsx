import { trpc } from '@/utils/trpc'
import { Tabs, useLocalSearchParams } from 'expo-router'
import { Pressable, SafeAreaView, SectionList, Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.expenses.list.useQuery({ groupId })
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
              <Pressable className="p-4 border-t border-gray-100 flex-row justify-between">
                <Text>{expense.title}</Text>
                <Text>{expense.amount / 100}</Text>
              </Pressable>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View className="px-4 py-2 bg-white border-y border-gray-100 -mb-[1px]">
                <Text className="font-bold">{title}</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  )
}
