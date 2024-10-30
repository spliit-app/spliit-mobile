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
import { ExpenseDetails, Group, trpc } from '@/utils/trpc'
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
  } = useForm({
    defaultValues: expense,
    resolver: zodResolver(expenseFormSchema),
  })

  console.log(getValues())

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
