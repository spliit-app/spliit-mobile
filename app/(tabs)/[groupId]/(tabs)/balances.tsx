import { textBrand } from '@/utils/colors'
import { formatCurrency } from '@/utils/formatCurrency'
import { trpc } from '@/utils/trpc'
import { router, useGlobalSearchParams } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
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
  const { data, isInitialLoading } = trpc.groups.balances.list.useQuery({
    groupId: group.id,
  })

  if (!data?.balances) return null

  const maxBalance = Math.max(
    ...Object.values(data.balances).map(({ total }) => Math.abs(total))
  )

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top']} className="flex-1 bg-white">
        {isInitialLoading ? (
          <View className="h-full flex-col justify-center items-center gap-4">
            <ActivityIndicator size="large" />
            <Text className="text-slate-700">Loading group balances</Text>
          </View>
        ) : (
          <ScrollView className="flex-1">
            <View className="p-4 mt-2 mb-4">
              <Text className="font-bold mb-0.5 text-lg">Balances</Text>
              <Text className="text-gray-500 text-sm">
                This is the amount that each participant paid or was paid for.
              </Text>
            </View>
            {group.participants.map((participant) => {
              const balance = data.balances[participant.id] ?? {
                total: 0,
                paid: 0,
                paidFor: 0,
              }

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
                  {balance.total !== 0 ? (
                    <View
                      className={
                        'h-full border ' +
                        (balance.total < 0
                          ? 'bg-red-300 border-red-400 self-end rounded-l-md'
                          : 'bg-green-300 border-green-400 self-start rounded-r-md')
                      }
                      style={{
                        width: `${Math.abs(
                          (balance.total / maxBalance) * 100
                        )}%`,
                      }}
                    />
                  ) : (
                    <View className="h-full" />
                  )}
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
                  key={participant.id}
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

            {data.reimbursements.length === 0 && (
              <Text className="mx-4 text-sm">
                It looks like your group doesn’t need any reimbursement 😁
              </Text>
            )}

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
                  className="rounded-md mx-4 mb-2 p-4 bg-slate-100"
                >
                  <View className="flex-row justify-between ">
                    <Text>
                      <Text className="font-bold">{participantFrom.name}</Text>
                      <Text> owes </Text>
                      <Text className="font-bold">{participantTo.name}</Text>
                    </Text>
                    <Text className="font-bold">
                      {formatCurrency(
                        group.currency,
                        reimbursement.amount / 100
                      )}
                    </Text>
                  </View>
                  <Pressable
                    className="-ml-2 -mb-2 p-2"
                    onPress={() => {
                      router.push({
                        pathname: '/(tabs)/[groupId]/create-expense',
                        params: {
                          groupId: group.id,
                          isReimbursement: 'yes',
                          paidBy: participantFrom.id,
                          paidFor: participantTo.id,
                          title: 'Reimbursement',
                          amount: String(reimbursement.amount),
                        },
                      })
                    }}
                  >
                    <Text className={textBrand}>Mark as paid</Text>
                  </Pressable>
                </View>
              )
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
