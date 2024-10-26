import {
  ErrorMessage,
  FormGroup,
  FormSection,
  FormSectionTitle,
  HelpText,
  Label,
  TextInput,
} from '@/components/form'
import { ExpenseDetails, trpc } from '@/utils/trpc'
import { zodResolver } from '@hookform/resolvers/zod'
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { Button, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { expenseFormSchema } from 'spliit-api/src/lib/schemas'

export default function ExpenseScreen() {
  const router = useRouter()
  const { groupId, expenseId } = useGlobalSearchParams<{
    groupId: string
    expenseId: string
  }>()

  const { data } = trpc.groups.expenses.get.useQuery({ groupId, expenseId })

  return (
    <>
      <Stack.Screen
        options={{
          title: data?.expense.title ?? '…',
          headerRight: () => (
            <Button title="Cancel" onPress={() => router.back()} />
          ),
        }}
      />
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
          <ScrollView>
            {data && <ExpenseForm expense={data.expense} />}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  )
}

function ExpenseForm({ expense }: { expense: ExpenseDetails }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: expense,
    resolver: zodResolver(expenseFormSchema),
  })
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
      </FormSection>

      <View className="flex-row mt-2 mb-10 px-4">
        <Pressable
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.5 : undefined }}
          onPress={handleSubmit(async (values) => {})}
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
