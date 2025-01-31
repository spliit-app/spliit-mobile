import {
    ErrorMessage,
    FormGroup,
    FormSection,
    FormSectionTitle,
    HelpText,
    Label,
    TextInput,
  } from '@/components/form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { Controller, useForm } from 'react-hook-form'
  import { Pressable, Text, View } from 'react-native'
  import { cn } from '@/utils/cn'
  import { Settings, settingsSchema, DefaultSettings} from '@/utils/settings'
  import { bgBrand } from '@/utils/colors'

  export function SettingsForm({
    settings,    
    onSave,
  }: {
    settings: Settings | null
    onSave: (settings: Settings) => Promise<void>
  }) {  
    const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<Settings>({
      defaultValues: settings
        ? {
            baseUrl: settings.baseUrl,            
          }
        : DefaultSettings,
      resolver: zodResolver(settingsSchema),
    })  
  
    return (
      <>
        <FormSectionTitle>Settings</FormSectionTitle>
            <FormSection>
              <FormGroup>
                <Label>Base Url</Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      hasError={!!errors.baseUrl}
                      placeholder="e.g. https://spliit.app/"
                    />
                  )}
                  name="baseUrl"
                />
                <HelpText>Set the base url of the Spliit instance</HelpText>
                {errors.baseUrl && <ErrorMessage>{errors.baseUrl.message}</ErrorMessage>}
              </FormGroup>
              </FormSection>
  
        <View className="flex-row mt-2 mb-10 px-4">
          <Pressable
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.5 : undefined }}
            onPress={handleSubmit(async (values) => {
              await onSave(values)
            })}
            className={cn(
              bgBrand,
              'flex-1 flex-row justify-center rounded-lg px-4 py-2 active:opacity-60'
            )}
          >
            <Text className="text-white text-lg font-semibold">
              {isSubmitting ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </>
    )
  }
  