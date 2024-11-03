import { Text, View, Pressable } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'expo-router'
import { GroupDetails, trpc } from '@/utils/trpc'
import { GroupFormValues, groupFormSchema } from 'spliit-api/src/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ErrorMessage,
  FormGroup,
  FormSection,
  FormSectionTitle,
  HelpText,
  Label,
  TextInput,
} from '@/components/form'

export function GroupForm({
  groupDetails,
  onSave,
}: {
  groupDetails: GroupDetails | null
  onSave: (groupFormValues: GroupFormValues) => Promise<void>
}) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormValues>({
    defaultValues: groupDetails
      ? {
          name: groupDetails.name,
          information: groupDetails.information ?? '',
          currency: groupDetails.currency,
          participants: groupDetails.participants,
        }
      : {
          name: '',
          information: '',
          currency: '',
          participants: [{ name: 'John' }, { name: 'Jane' }, { name: 'Jack' }],
        },
    resolver: zodResolver(groupFormSchema),
  })

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
                  <FormGroup key={index}>
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
