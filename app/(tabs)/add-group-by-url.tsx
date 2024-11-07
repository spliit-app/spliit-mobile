import { TrackScreen } from '@/components/analytics'
import {
  ErrorMessage,
  FormGroup,
  FormSection,
  HelpText,
  Label,
  TextInput,
} from '@/components/form'
import { cn } from '@/utils/cn'
import { BRAND_COLOR, bgBrand } from '@/utils/colors'
import { addRecentGroup } from '@/utils/recentGroups'
import { trpc } from '@/utils/trpc'
import { Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { Button, Pressable, Text, View } from 'react-native'

export default function AddGroupByUrlModal() {
  const [url, setUrl] = useState('')
  const [hasError, setHasError] = useState(false)
  const utils = trpc.useUtils()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  return (
    <>
      <TrackScreen screenName="add-group-by-url" />
      <Stack.Screen
        options={{
          title: 'Add group by URL',
          headerRight: () => (
            <Button
              title="Cancel"
              color={BRAND_COLOR}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <View className="pt-4 bg-white h-full">
        <FormSection>
          <FormGroup>
            <Label>Group URL</Label>
            <TextInput
              hasError={hasError}
              keyboardType="url"
              autoComplete="url"
              autoCorrect={false}
              autoCapitalize="none"
              placeholder="https://spliit.app/..."
              value={url}
              onChangeText={(text) => setUrl(text)}
            />
            {hasError && (
              <ErrorMessage>The URL is not a valid group URL.</ErrorMessage>
            )}
            <HelpText>
              If a group was shared with you, you can paste its URL here to add
              it to your list.
            </HelpText>
          </FormGroup>
        </FormSection>
        <View className="flex-row mt-2 mb-10 px-4">
          <Pressable
            disabled={isPending}
            onPress={async () => {
              setIsPending(true)
              const groupId = extractGroupId(url)
              if (groupId) {
                const data = await utils.groups.get.fetch({ groupId })
                if (data.group) {
                  await addRecentGroup({
                    groupId: data.group.id,
                    groupName: data.group.name,
                  })
                  router.back()
                } else {
                  setHasError(true)
                }
              } else {
                setHasError(true)
              }
              setIsPending(false)
            }}
            className={cn(
              bgBrand,
              'flex-1 flex-row justify-center rounded-lg px-4 py-2 active:opacity-60'
            )}
          >
            <Text className="text-white text-lg font-semibold">
              {isPending ? 'Adding…' : 'Add'}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  )
}

function extractGroupId(urlString: string) {
  try {
    const url = new URL(urlString)
    const [, groupId] = url.pathname.match(/^\/groups\/([^/]*)/) ?? []
    return groupId
  } catch {
    return null
  }
}
