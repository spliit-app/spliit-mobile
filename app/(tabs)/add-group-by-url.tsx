import { TrackScreen } from '@/components/analytics'
import {
  ErrorMessage,
  FormGroup,
  FormSection,
  HelpText,
  Label,
  TextInput,
} from '@/components/form'
import { addRecentGroup } from '@/utils/recentGroups'
import { useSettings } from '@/utils/settings'
import { trpc } from '@/utils/trpc'
import { Stack, useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import colors from 'tailwindcss/colors'

export default function AddGroupByUrlModal() {
  const [url, setUrl] = useState('')
  const [hasError, setHasError] = useState(false)
  const utils = trpc.useUtils()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const {
    settings: { baseUrl },
  } = useSettings()
  const { colorScheme } = useColorScheme()

  return (
    <>
      <TrackScreen screenName="add-group-by-url" />
      <Stack.Screen
        options={{
          title: 'Add group by URL',
          headerTintColor:
            colorScheme === 'light' ? colors.black : colors.white,
          headerStyle: {
            backgroundColor:
              colorScheme === 'light' ? colors.white : colors.black,
          },
          headerRight: () => (
            <Pressable onPress={() => router.back()}>
              <Text className="text-foreground-accent">Cancel</Text>
            </Pressable>
          ),
        }}
      />
      <View className="pt-4 bg-background h-full">
        <FormSection>
          <FormGroup>
            <Label>Group URL</Label>
            <TextInput
              hasError={hasError}
              keyboardType="url"
              autoComplete="url"
              autoCorrect={false}
              autoCapitalize="none"
              placeholder={`${baseUrl}...`}
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
            className="bg-background-accent flex-1 flex-row justify-center rounded-lg px-4 py-2 active:opacity-60"
          >
            <Text className="text-foreground-on-accent text-lg font-semibold">
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
