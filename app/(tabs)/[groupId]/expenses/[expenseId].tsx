import {
  CategoryInput,
  DateInput,
  ErrorMessage,
  FormGroup,
  FormSection,
  FormSectionTitle,
  HelpText,
  Label,
  ParticipantInput,
  TextInput,
} from '@/components/form'
import { Expense, ExpenseDetails, Group, trpc } from '@/utils/trpc'
import { zodResolver } from '@hookform/resolvers/zod'
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { expenseFormSchema } from 'spliit-api/src/lib/schemas'
import CurrencyInput from 'react-native-currency-input'
import Checkbox from 'expo-checkbox'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { cn } from '@/utils/cn'
import { match } from 'ts-pattern'

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

  return (
    <>
      <Stack.Screen
        options={{
          title: expenseData?.expense.title ?? '…',
          headerRight: () => (
            <Button title="Cancel" onPress={() => router.back()} />
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
              />
            )}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  )
}

function ExpenseForm({
  expense,
  group,
}: {
  expense: ExpenseDetails
  group: Group
}) {
  const { data: categoriesData } = trpc.categories.list.useQuery()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    watch,
  } = useForm({
    defaultValues: expense,
    resolver: zodResolver(expenseFormSchema),
  })

  const splitMode = watch('splitMode')

  return (
    <>
      <FormSectionTitle>Edit expense</FormSectionTitle>
      <FormSection>
        <FormGroup>
          <Label>Expense title</Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                hasError={!!errors.title}
              />
            )}
            name="title"
          />
          <HelpText>Enter a description for the expense.</HelpText>
          {errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Expense date</Label>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <DateInput
                value={value}
                onChange={onChange}
                hasError={!!errors.expenseDate}
              />
            )}
            name="expenseDate"
          />
          <HelpText>Enter the date the expense was paid.</HelpText>
          {errors.expenseDate && (
            <ErrorMessage>{errors.expenseDate.message}</ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label>Amount</Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <CurrencyInput
                onChangeValue={(value) => onChange((value ?? 0) * 100)}
                onBlur={onBlur}
                value={value / 100}
                prefix={group.currency}
                delimiter=","
                separator="."
                renderTextInput={(props) => (
                  <TextInput {...props} hasError={!!errors.amount} />
                )}
              />
            )}
            name="amount"
          />
          {errors.amount && (
            <ErrorMessage>{errors.amount.message}</ErrorMessage>
          )}

          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center gap-2 mt-1">
                <Checkbox
                  value={value}
                  onValueChange={onChange}
                  color="green"
                  style={{ width: 16, height: 16 }}
                />
                <Pressable onPress={() => onChange(!value)}>
                  <Label className="font-normal">This is a reimbursement</Label>
                </Pressable>
              </View>
            )}
            name="isReimbursement"
          />
        </FormGroup>

        <FormGroup>
          <Label>Category</Label>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <CategoryInput
                value={value}
                categories={categoriesData?.categories ?? []}
                onChange={onChange}
                hasError={!!errors.expenseDate}
              />
            )}
            name="category"
          />
          <HelpText>Select the expense category.</HelpText>
          {errors.category && (
            <ErrorMessage>{errors.category.message}</ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label>Paid by</Label>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <ParticipantInput
                value={value}
                participants={group.participants}
                onChange={onChange}
                hasError={!!errors.paidBy}
              />
            )}
            name="paidBy"
          />
          <HelpText>Select the participant who paid the expense.</HelpText>
          {errors.paidBy && (
            <ErrorMessage>{errors.paidBy.message}</ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label>Notes</Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onChangeText={onChange}
                onBlur={onBlur}
                value={value ?? ''}
                hasError={!!errors.title}
                multiline
              />
            )}
            name="notes"
          />
          {errors.notes && <ErrorMessage>{errors.notes.message}</ErrorMessage>}
        </FormGroup>
      </FormSection>

      <FormSectionTitle>Paid for</FormSectionTitle>
      <FormSection>
        <FormGroup>
          <Label className="mb-1">Split mode</Label>
          <Controller
            control={control}
            render={({ field: { value, onChange } }) => {
              const values: Expense['splitMode'][] = [
                'EVENLY',
                'BY_SHARES',
                'BY_PERCENTAGE',
                'BY_AMOUNT',
              ]
              const labels = ['Evenly', 'Shares', 'Percentage', 'Amount']
              return (
                <SegmentedControl
                  values={labels}
                  selectedIndex={values.indexOf(value)}
                  onChange={(event) =>
                    onChange(values[event.nativeEvent.selectedSegmentIndex])
                  }
                />
              )
            }}
            name="splitMode"
          />
          <HelpText className="mt-1">Select how to split the expense.</HelpText>
        </FormGroup>

        <FormGroup className="gap-0">
          <Controller
            control={control}
            name="paidFor"
            render={({ field: { value, onChange, onBlur } }) => (
              <>
                {group.participants.map((participant) => {
                  const paidForIndex = value.findIndex(
                    (paidFor) => paidFor.participantId === participant.id
                  )
                  const paidFor =
                    paidForIndex >= 0 ? value[paidForIndex] : undefined
                  const updatePaidFor = (
                    participantId: string,
                    shares: number
                  ) => {
                    onChange(
                      value.map((p) =>
                        p.participantId === participantId ? { ...p, shares } : p
                      )
                    )
                  }

                  const removePaidFor = (participantId: string) => {
                    onChange(
                      value.filter((p) => p.participantId !== participantId)
                    )
                  }

                  const addPaidFor = (participantId: string) => {
                    onChange([...value, { participantId, shares: 0 }])
                  }

                  return (
                    <View
                      key={participant.id}
                      className={
                        'flex-row items-center border-gray-200 py-2 border-t h-16'
                      }
                    >
                      <Checkbox
                        value={paidFor !== undefined}
                        color="green"
                        style={{ width: 16, height: 16 }}
                        className="mr-2"
                        onValueChange={(value) =>
                          value
                            ? addPaidFor(participant.id)
                            : removePaidFor(participant.id)
                        }
                      />
                      <Pressable
                        className="flex-1 self-stretch justify-center"
                        onPress={() =>
                          paidFor
                            ? removePaidFor(participant.id)
                            : addPaidFor(participant.id)
                        }
                      >
                        <Label>{participant.name}</Label>
                      </Pressable>
                      {paidFor &&
                        match(splitMode)
                          .with('EVENLY', () => null)
                          .with('BY_SHARES', () => (
                            <CurrencyInput
                              value={paidFor.shares / 100}
                              onChangeValue={(value) =>
                                updatePaidFor(
                                  paidFor.participantId,
                                  (value ?? 0) * 100
                                )
                              }
                              suffix=" shares"
                              renderTextInput={(props) => (
                                <TextInput
                                  className="w-32"
                                  hasError={!!errors.amount}
                                  {...props}
                                />
                              )}
                            />
                          ))
                          .with('BY_PERCENTAGE', () => (
                            <CurrencyInput
                              value={paidFor.shares / 100}
                              onChangeValue={(value) =>
                                updatePaidFor(
                                  paidFor.participantId,
                                  (value ?? 0) * 100
                                )
                              }
                              suffix=" %"
                              renderTextInput={(props) => (
                                <TextInput
                                  className="w-32"
                                  hasError={!!errors.amount}
                                  {...props}
                                />
                              )}
                            />
                          ))
                          .with('BY_AMOUNT', () => (
                            <CurrencyInput
                              value={paidFor.shares / 100}
                              onChangeValue={(value) =>
                                updatePaidFor(
                                  paidFor.participantId,
                                  (value ?? 0) * 100
                                )
                              }
                              prefix={group.currency}
                              renderTextInput={(props) => (
                                <TextInput
                                  className="w-32"
                                  hasError={!!errors.amount}
                                  {...props}
                                />
                              )}
                            />
                          ))
                          .exhaustive()}
                    </View>
                  )
                })}
              </>
            )}
          />
        </FormGroup>
      </FormSection>

      <View className="flex-row mt-2 mb-10 px-4">
        <Pressable
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.5 : undefined }}
          onPress={() => console.log(expenseFormSchema.safeParse(getValues()))}
          // onPress={handleSubmit(async (values) => {
          //   console.log(values)
          // })}
          className="flex-1 flex-row justify-center bg-emerald-600 rounded-lg px-4 py-2"
        >
          <Text className="text-white text-lg font-semibold">
            {isSubmitting ? 'Saving…' : 'Save'}
          </Text>
        </Pressable>
      </View>
    </>
  )
}
