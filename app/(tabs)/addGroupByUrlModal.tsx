import { addRecentGroup } from '@/utils/recentGroups'
import { trpc } from '@/utils/trpc'
import { Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

export default function AddGroupByUrlModal() {
  const [url, setUrl] = useState('')
  const [hasError, setHasError] = useState(false)
  const utils = trpc.useUtils()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  return (
    <>
      <Stack.Screen options={{ title: 'Add group by URL' }} />
      <View className="p-4 bg-white h-full">
        <Text className="mb-2">
          If a group was shared with you, you can paste its URL here to add it
          to your list.
        </Text>
        <TextInput
          className={
            'border border-gray-300 rounded p-2 mb-2 ' +
            (hasError ? 'border-red-600' : '')
          }
          keyboardType="url"
          autoComplete="url"
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="https://spliit.app/..."
          value={url}
          onChangeText={(text) => setUrl(text)}
        />
        {hasError && (
          <Text className="-mt-1 mb-2 text-sm text-red-600">
            The URL is not a valid group URL.
          </Text>
        )}
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
          className="self-center px-4 py-2 rounded bg-emerald-700"
        >
          <Text className="text-white">{isPending ? 'Adding…' : 'Add'}</Text>
        </Pressable>
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
