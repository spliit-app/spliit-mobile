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
import {
  ExpenseFormValues,
  expenseFormSchema,
} from 'spliit-api/src/lib/schemas'
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

  const { mutateAsync } = trpc.groups.expenses.update.useMutation()
  const utils = trpc.useUtils()

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
                onSave={async (expenseFormValues) => {
                  await mutateAsync({ groupId, expenseId, expenseFormValues })
                  await utils.groups.invalidate()
                }}
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
  onSave,
}: {
  expense: ExpenseDetails
  group: Group
  onSave: (expenseFormValues: ExpenseFormValues) => Promise<void>
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
    defaultValues: {
      title: expense.title,
      expenseDate: expense.expenseDate ?? new Date(),
      amount: String(expense.amount / 100) as unknown as number, // hack
      category: expense.categoryId,
      paidBy: expense.paidById,
      paidFor: expense.paidFor.map(({ participantId, shares }) => ({
        participant: participantId,
        shares: String(shares / 100) as unknown as number,
      })),
      splitMode: expense.splitMode,
      saveDefaultSplittingOptions: false,
      isReimbursement: expense.isReimbursement,
      documents: expense.documents,
      notes: expense.notes ?? '',
    },
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
                onChangeValue={(value) => onChange(value ?? 0)}
                onBlur={onBlur}
                value={value}
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
                value={
                  categoriesData?.categories.find((cat) => cat.id === value) ??
                  null
                }
                categories={categoriesData?.categories ?? []}
                onChange={(cat) => onChange(cat.id)}
                hasError={!!errors.category}
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
                value={
                  group.participants.find(
                    (participant) => participant.id === value
                  ) ?? null
                }
                participants={group.participants}
                onChange={(p) => onChange(p.id)}
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
                    (paidFor) => paidFor.participant === participant.id
                  )
                  const paidFor =
                    paidForIndex >= 0 ? value[paidForIndex] : undefined
                  const updatePaidFor = (
                    participantId: string,
                    shares: number
                  ) => {
                    onChange(
                      value.map((p) =>
                        p.participant === participantId ? { ...p, shares } : p
                      )
                    )
                  }

                  const removePaidFor = (participant: string) => {
                    onChange(value.filter((p) => p.participant !== participant))
                  }

                  const addPaidFor = (participant: string) => {
                    onChange([...value, { participant, shares: 0 }])
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
                              value={paidFor.shares}
                              onChangeValue={(value) =>
                                updatePaidFor(paidFor.participant, value ?? 0)
                              }
                              suffix=" shares"
                              precision={0}
                              renderTextInput={(props) => (
                                <TextInput
                                  className="w-32"
                                  hasError={!!errors.paidFor}
                                  {...props}
                                />
                              )}
                            />
                          ))
                          .with('BY_PERCENTAGE', () => (
                            <CurrencyInput
                              value={paidFor.shares}
                              onChangeValue={(value) =>
                                updatePaidFor(paidFor.participant, value ?? 0)
                              }
                              suffix=" %"
                              precision={0}
                              delimiter=","
                              separator="."
                              renderTextInput={(props) => (
                                <TextInput
                                  className="w-32"
                                  hasError={!!errors.paidFor}
                                  {...props}
                                />
                              )}
                            />
                          ))
                          .with('BY_AMOUNT', () => (
                            <CurrencyInput
                              value={paidFor.shares}
                              onChangeValue={(value) =>
                                updatePaidFor(paidFor.participant, value ?? 0)
                              }
                              prefix={group.currency}
                              precision={2}
                              delimiter=","
                              separator="."
                              renderTextInput={(props) => (
                                <TextInput
                                  className="w-32"
                                  hasError={!!errors.paidFor}
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
          {errors.paidFor && (
            <ErrorMessage>{errors.paidFor.message}</ErrorMessage>
          )}
        </FormGroup>
      </FormSection>

      <View className="flex-row mt-2 mb-10 px-4">
        <Pressable
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.5 : undefined }}
          onPress={handleSubmit(async (values) => {
            await onSave(values)
          })}
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
