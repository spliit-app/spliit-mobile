import { z } from 'zod'
import AsyncStorage from '@react-native-async-storage/async-storage'

const recentGroupsSchema = z.array(
  z.object({
    groupId: z.string(),
    groupName: z.string(),
  })
)

export type RecentGroup = z.infer<typeof recentGroupsSchema>[number]

export async function getRecentGroups(): Promise<RecentGroup[]> {
  try {
    const raw = await AsyncStorage.getItem('recent-groups')
    return recentGroupsSchema.parse(raw ? JSON.parse(raw) : [])
  } catch {
    return []
  }
}

export async function addRecentGroup(recentGroup: RecentGroup) {
  const recentGroups = await getRecentGroups()
  const updatedRecentGroups = [
    recentGroup,
    ...recentGroups.filter((group) => group.groupId !== recentGroup.groupId),
  ]
  try {
    await AsyncStorage.setItem(
      'recent-groups',
      JSON.stringify(updatedRecentGroups)
    )
  } catch (err) {
    console.error(err)
  }
}
