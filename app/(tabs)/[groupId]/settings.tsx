import { PropsWithChildren } from 'react'
import {
  ScrollView,
  Text,
  TextInput as BaseTextInput,
  TextInputProps,
  View,
  Pressable,
  Button,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router'
import { GroupDetails, trpc } from '@/utils/trpc'
import { groupFormSchema } from 'spliit-api/src/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'

export default function GroupSettingsScreen() {
  const { groupId } = useGlobalSearchParams<{ groupId: string }>()
  const { data } = trpc.groups.getDetails.useQuery({ groupId })
  const router = useRouter()

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button title="Cancel" onPress={() => router.back()} />
          ),
        }}
      />
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
          <ScrollView className="flex-1">
            {data && <GroupSettingsForm groupDetails={data.group} />}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  )
}

function GroupSettingsForm({ groupDetails }: { groupDetails: GroupDetails }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: groupDetails,
    resolver: zodResolver(groupFormSchema),
  })
  const { mutateAsync } = trpc.groups.update.useMutation()
  const utils = trpc.useUtils()
  const router = useRouter()

  return (
    <>
      <FormSectionTitle>Group information</FormSectionTitle>
      <FormSection>
        <FormGroup>
          <Label>Group name</Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Group name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                hasError={!!errors.name}
              />
            )}
            name="name"
          />
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          <HelpText>Enter a name for your group.</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Currency symbol</Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="$"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                hasError={!!errors.name}
              />
            )}
            name="currency"
          />
          {errors.currency && (
            <ErrorMessage>{errors.currency.message}</ErrorMessage>
          )}
          <HelpText>We’ll use it to display amounts.</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Group information</Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="What information is relevant to group participants?"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value ?? ''}
                hasError={!!errors.name}
              />
            )}
            name="information"
          />
        </FormGroup>
        {errors.information && (
          <ErrorMessage>{errors.information.message}</ErrorMessage>
        )}
      </FormSection>

      <FormSectionTitle>Participants</FormSectionTitle>
      <FormSection>
        <HelpText>Enter the name for each participant.</HelpText>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              {value.map((participant, index) => {
                const error = errors.participants?.[index]?.name
                return (
                  <FormGroup key={participant.id}>
                    <TextInput
                      value={participant.name}
                      onBlur={onBlur}
                      onChangeText={(name) => {
                        onChange(
                          value.map((p) =>
                            p === participant ? { ...p, name } : p
                          )
                        )
                      }}
                      hasError={!!error}
                    />
                    {error && <ErrorMessage>{error.message}</ErrorMessage>}
                  </FormGroup>
                )
              })}
            </>
          )}
          name="participants"
        />
      </FormSection>

      <View className="flex-row mt-2 mb-10 px-4">
        <Pressable
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.5 : undefined }}
          onPress={handleSubmit(async (values) => {
            await mutateAsync({
              groupId: groupDetails.id,
              groupFormValues: {
                ...values,
                information: values.information ?? undefined,
              },
            })
            await utils.groups.invalidate()
            router.back()
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

function FormSection({ children }: PropsWithChildren) {
  return (
    <View className="p-4 bg-slate-100 rounded-md mb-2 mx-4 flex-row justify-between flex-col gap-4">
      {children}
    </View>
  )
}

function FormSectionTitle({ children }: PropsWithChildren) {
  return <Text className="text-lg font-bold px-4 mb-2 mt-4">{children}</Text>
}

function FormGroup({ children }: PropsWithChildren) {
  return <View className="flex-col gap-1">{children}</View>
}

function Label({ children }: PropsWithChildren) {
  return <Text className="font-semibold">{children}</Text>
}

function HelpText({ children }: PropsWithChildren) {
  return <Text className="text-gray-600 text-sm">{children}</Text>
}

function ErrorMessage({ children }: PropsWithChildren) {
  return <Text className="text-red-600 text-sm">{children}</Text>
}

function TextInput({
  hasError,
  ...props
}: TextInputProps & { hasError?: boolean }) {
  return (
    <BaseTextInput
      className={
        'bg-white px-2 pt-1 pb-2 rounded-lg border border-gray-200 text-lg ' +
        (hasError ? 'border-red-500' : '')
      }
      {...props}
    />
  )
}
