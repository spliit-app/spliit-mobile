import {
  ErrorMessage,
  FormGroup,
  FormSection,
  FormSectionTitle,
  HelpText,
  Label,
  TextInput,
} from '@/components/form'
import { cn } from '@/utils/cn'
import { GroupDetails } from '@/utils/trpc'
import { FontAwesome } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Alert, Pressable, Text, View } from 'react-native'
import { GroupFormValues, groupFormSchema } from 'spliit-api/src/lib/schemas'

export function GroupForm({
  groupDetails,
  onSave,
  participantWithExpenses = [],
}: {
  groupDetails: GroupDetails | null
  onSave: (groupFormValues: GroupFormValues) => Promise<void>
  participantWithExpenses?: string[]
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'participants',
    keyName: 'key',
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
                hasError={!!errors.currency}
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
                hasError={!!errors.information}
              />
            )}
            name="information"
          />
        </FormGroup>
        {errors.information && (
          <ErrorMessage>{errors.information.message}</ErrorMessage>
        )}
      </FormSection>

      <View className="flex-row justify-between">
        <FormSectionTitle className="flex-1">Participants</FormSectionTitle>
        <Pressable
          onPress={() => {
            append({ name: 'New' })
          }}
          className="px-4 py-2 flex-shrink-0 justify-end active:opacity-60"
        >
          <Text className="text-lg text-foreground-accent">Add</Text>
        </Pressable>
      </View>
      <FormSection>
        <HelpText>Enter the name for each participant.</HelpText>
        {fields.map((item, index) => (
          <Controller
            key={item.key}
            control={control}
            name={`participants.${index}.name`}
            render={({
              field: { value, onChange, onBlur },
              fieldState: { error },
            }) => {
              const isDisabled = item.id
                ? participantWithExpenses.includes(item.id)
                : false
              return (
                <FormGroup>
                  <View className="flex-row">
                    <TextInput
                      className="flex-1"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      hasError={!!error}
                    />
                    <Pressable
                      onPress={() => {
                        if (isDisabled) {
                          Alert.alert(
                            'Partitipant with expenses',
                            'You can not remove this participant because they have expenses.',
                          )
                        } else {
                          remove(index)
                        }
                      }}
                      className={cn(
                        'px-2 -mr-2 justify-center active:opacity-60',
                        isDisabled && 'opacity-20',
                      )}
                    >
                      <FontAwesome
                        name="trash-o"
                        size={20}
                        className="text-foreground-danger"
                      />
                    </Pressable>
                  </View>
                  {error && <ErrorMessage>{error.message}</ErrorMessage>}
                </FormGroup>
              )
            }}
          />
        ))}
        {errors.participants?.message && (
          <ErrorMessage>{errors.participants.message}</ErrorMessage>
        )}
      </FormSection>

      <View className="flex-row mt-2 mb-10 px-4">
        <Pressable
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.5 : undefined }}
          onPress={handleSubmit(async (values) => {
            await onSave(values)
          })}
          className="flex-1 flex-row justify-center rounded-lg px-4 py-2 active:opacity-60 bg-background-accent"
        >
          <Text className="text-foreground-on-accent text-lg font-semibold">
            {isSubmitting ? 'Saving…' : 'Save'}
          </Text>
        </Pressable>
      </View>
    </>
  )
}
