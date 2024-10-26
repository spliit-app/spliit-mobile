import { formatCurrency } from '@/utils/formatCurrency'
import { trpc } from '@/utils/trpc'
import { useGlobalSearchParams } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { AppRouterOutput } from 'spliit-api'

export default function BalancesScreen() {
  const { groupId } = useGlobalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.get.useQuery({ groupId })

  if (!data?.group) return null

  return <Balances group={data.group} />
}

function Balances({
  group,
}: {
  group: NonNullable<AppRouterOutput['groups']['get']['group']>
}) {
  const { data } = trpc.groups.balances.list.useQuery({ groupId: group.id })

  if (!data?.balances) return null

  console.log(data.balances)

  const maxBalance = Math.max(
    ...Object.values(data.balances).map(({ paid }) => Math.abs(paid))
  )

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top']} className="flex-1 bg-white">
        <ScrollView className="flex-1">
          <View className="p-4 mt-2 mb-4">
            <Text className="font-bold mb-0.5 text-lg">Balances</Text>
            <Text className="text-gray-500 text-sm">
              This is the amount that each participant paid or was paid for.
            </Text>
          </View>
          {Object.entries(data.balances).map(([participantId, balance]) => {
            const participant = group.participants.find(
              (participant) => participant.id === participantId
            )
            if (!participant) return null

            const participantNameElement = (
              <View
                className={
                  'w-1/2 flex-row px-2 ' +
                  (balance.total < 0 ? 'justify-start' : 'justify-end')
                }
              >
                <Text className="font-bold">{participant.name}</Text>
              </View>
            )
            const barElement = (
              <View className="w-1/2 relative">
                <View
                  className={
                    'h-full border ' +
                    (balance.total < 0
                      ? 'bg-red-300 border-red-400 self-end rounded-l-md'
                      : 'bg-green-300 border-green-400 self-start rounded-r-md')
                  }
                  style={{
                    width: `${Math.abs((balance.total / maxBalance) * 100)}%`,
                  }}
                ></View>
                <View className="px-2 absolute top-0 bottom-0 left-0 right-0 flex-col justify-center">
                  <Text
                    className={balance.total < 0 ? 'self-end' : 'self-start'}
                  >
                    {formatCurrency(
                      group.currency,
                      (balance.paid || balance.paidFor) / 100
                    )}
                  </Text>
                </View>
              </View>
            )

            return (
              <View
                className="mx-4 mb-2 h-8 items-center flex-row"
                key={participantId}
              >
                {balance.total < 0 ? (
                  <>
                    {barElement}
                    {participantNameElement}
                  </>
                ) : (
                  <>
                    {participantNameElement}
                    {barElement}
                  </>
                )}
              </View>
            )
          })}

          <View className="p-4 mt-4 mb-2">
            <Text className="font-bold mb-0.5 text-lg">
              Suggested reimbursements
            </Text>
            <Text className="text-gray-500 text-sm">
              Here are suggestions for optimized reimbursements between
              participants.
            </Text>
          </View>

          {data.reimbursements.map((reimbursement, index) => {
            const participantFrom = group.participants.find(
              (participant) => participant.id === reimbursement.from
            )
            const participantTo = group.participants.find(
              (participant) => participant.id === reimbursement.to
            )
            if (!participantFrom || !participantTo) return null

            return (
              <View
                key={index}
                className="flex-row justify-between rounded-md mx-4 mb-2 p-4 bg-slate-100"
              >
                <Text>
                  <Text className="font-bold">{participantFrom.name}</Text>
                  <Text> owes </Text>
                  <Text className="font-bold">{participantTo.name}</Text>
                </Text>
                <Text className="font-bold">
                  {formatCurrency(group.currency, reimbursement.amount / 100)}
                </Text>
              </View>
            )
          })}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
