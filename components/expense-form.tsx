import {
  AmountInput,
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
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import Checkbox from 'expo-checkbox'
import { cssInterop } from 'nativewind'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, Text, View } from 'react-native'
import {
  ExpenseFormValues,
  expenseFormSchema,
} from 'spliit-api/src/lib/schemas'
import { match } from 'ts-pattern'

cssInterop(Checkbox, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      backgroundColor: 'color',
    },
  },
})

export function ExpenseForm({
  expense,
  group,
  reimbursementParams,
  onSave,
}: {
  expense: ExpenseDetails | null
  reimbursementParams?: {
    title: string
    paidBy: string
    paidFor: string
    amount: number
  }
  group: Group
  onSave: (expenseFormValues: ExpenseFormValues) => Promise<void>
}) {
  const { data: categoriesData } = trpc.categories.list.useQuery()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ExpenseFormValues>({
    defaultValues: expense
      ? {
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
        }
      : reimbursementParams
        ? {
            title: reimbursementParams.title,
            expenseDate: new Date(),
            amount: String(
              reimbursementParams.amount / 100,
            ) as unknown as number, // hack,
            category: 1,
            paidBy: reimbursementParams.paidBy,
            paidFor: [{ participant: reimbursementParams.paidFor, shares: 1 }],
            splitMode: 'EVENLY',
            saveDefaultSplittingOptions: false,
            isReimbursement: true,
            documents: [],
            notes: '',
          }
        : {
            title: '',
            expenseDate: new Date(),
            amount: 0,
            category: 0,
            paidBy: undefined,
            paidFor: [],
            splitMode: 'EVENLY',
            saveDefaultSplittingOptions: false,
            isReimbursement: false,
            documents: [],
            notes: '',
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
                placeholder="e.g. Restaurant"
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
              <AmountInput
                onChangeValue={(value) => onChange(value)}
                onBlur={onBlur}
                value={value}
                hasError={!!errors.amount}
                currency={group.currency}
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
                  className="bg-background-accent size-4"
                />
                <Pressable
                  onPress={() => onChange(!value)}
                  className="active:opacity-60"
                >
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
                    (participant) => participant.id === value,
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
                hasError={!!errors.notes}
                multiline
                placeholder="Any relevant information to add?"
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
                    (paidFor) => paidFor.participant === participant.id,
                  )
                  const paidFor =
                    paidForIndex >= 0 ? value[paidForIndex] : undefined
                  const updatePaidFor = (
                    participantId: string,
                    shares: number | null,
                  ) => {
                    onChange(
                      value.map((p) =>
                        p.participant === participantId
                          ? {
                              ...p,
                              shares: enforceCurrencyPattern(
                                String((shares ?? 0) / 100),
                              ),
                            }
                          : p,
                      ),
                    )
                  }

                  const removePaidFor = (participant: string) => {
                    onChange(value.filter((p) => p.participant !== participant))
                  }

                  const addPaidFor = (participant: string) => {
                    onChange([...value, { participant, shares: 1 }])
                  }

                  return (
                    <View
                      key={participant.id}
                      className={
                        'flex-row items-center border-border py-2 border-t h-16'
                      }
                    >
                      <Checkbox
                        value={paidFor !== undefined}
                        className="mr-2 bg-background-accent size-4"
                        onValueChange={(value) =>
                          value
                            ? addPaidFor(participant.id)
                            : removePaidFor(participant.id)
                        }
                      />
                      <Pressable
                        className="flex-1 self-stretch justify-center active:opacity-60"
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
                            <View className="flex-row gap-1 items-center">
                              <AmountInput
                                value={paidFor.shares}
                                onChangeValue={(value) =>
                                  updatePaidFor(paidFor.participant, value)
                                }
                                hasError={!!errors.paidFor}
                                className="w-32"
                                precision={0}
                              />
                              <Text className="text-sm pt-1 text-foreground">
                                shares
                              </Text>
                            </View>
                          ))
                          .with('BY_PERCENTAGE', () => (
                            <View className="flex-row gap-1 items-center">
                              <AmountInput
                                value={paidFor.shares}
                                onChangeValue={(value) =>
                                  updatePaidFor(paidFor.participant, value)
                                }
                                hasError={!!errors.paidFor}
                                className="w-32"
                                precision={0}
                              />
                              <Text className="text-sm pt-1 text-foreground">
                                %
                              </Text>
                            </View>
                          ))
                          .with('BY_AMOUNT', () => (
                            <AmountInput
                              value={paidFor.shares}
                              onChangeValue={(value) =>
                                updatePaidFor(paidFor.participant, value)
                              }
                              currency={group.currency}
                              precision={2}
                              className="w-32"
                              hasError={!!errors.paidFor}
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
          className="bg-background-accent flex-1 flex-row justify-center rounded-lg px-4 py-2 active:opacity-60"
        >
          <Text className="text-foreground-on-accent text-lg font-semibold">
            {isSubmitting ? 'Saving…' : 'Save'}
          </Text>
        </Pressable>
      </View>
    </>
  )
}

const enforceCurrencyPattern = (value: string) =>
  value
    .replace(/^\s*-/, '_') // replace leading minus with _
    .replace(/[.,]/, '#') // replace first comma with #
    .replace(/[-.,]/g, '') // remove other minus and commas characters
    .replace(/_/, '-') // change back _ to minus
    .replace(/#/, '.') // change back # to dot
    .replace(/[^-\d.]/g, '') // remove all non-numeric characters
