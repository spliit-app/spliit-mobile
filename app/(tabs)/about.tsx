import { BRAND_COLOR, bgBrand } from '@/utils/colors'
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { Button, Linking, Pressable, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import DeviceInfo from 'react-native-device-info'
import { cn } from '@/utils/cn'
import { TrackScreen } from '@/components/analytics'
import { SettingsForm } from '@/components/settings-form'
import { useSettings } from '@/utils/settings'
import { useColorScheme } from 'nativewind'
import colors from 'tailwindcss/colors'

export default function AboutScreen() {
  const router = useRouter()
  const { settings, updateSettings } = useSettings()

  const { colorScheme } = useColorScheme()

  return (
    <>
      <TrackScreen screenName="about" />
      <Stack.Screen
        options={{
          headerTintColor:
            colorScheme === 'light' ? colors.black : colors.white,
          headerStyle: {
            backgroundColor:
              colorScheme === 'light' ? colors.white : colors.black,
          },
          headerRight: () => (
            <Pressable onPress={() => router.back()}>
              <Text className="text-foreground-accent">Close</Text>
            </Pressable>
          ),
        }}
      />
      <SafeAreaProvider>
        <SafeAreaView
          edges={['top']}
          className="flex-1 bg-background min-h-full"
        >
          <View className="p-4 min-h-full">
            <Text className="text-lg text-foreground">
              Spliit is an Open Source project created by{' '}
              <Text className="font-semibold">Sebastien Castiel</Text>, with
              help of many contributors on GitHub.
            </Text>
            <View className="flex-row mt-6 justify-center gap-4">
              <Pressable
                className="py-2 px-3 rounded-lg flex-row items-center gap-3 active:opacity-60 bg-background-accent"
                onPress={() =>
                  Linking.openURL('https://spliit.app/?ref=mobile-app')
                }
              >
                <FontAwesome5
                  name="external-link-alt"
                  size={14}
                  className="text-foreground-on-accent"
                />
                <Text className="text-foreground-on-accent text-lg font-semibold">
                  Visit our website
                </Text>
              </Pressable>
              <Pressable
                className="bg-slate-100 py-2 px-3 rounded-lg flex-row items-center gap-3 active:opacity-60"
                onPress={() => Linking.openURL('https://github.com/spliit-app')}
              >
                <FontAwesome6 name="github" size={16} />
                <Text className="text-lg text-slate-700 font-semibold">
                  View on GitHub
                </Text>
              </Pressable>
            </View>
            <View className="-mx-4 mt-6">
              {settings && (
                <SettingsForm
                  settings={settings}
                  onSave={async (settings) => {
                    await updateSettings(settings)
                    router.back()
                  }}
                />
              )}
            </View>
            <View className="flex-1" />
            <Text className="mt-12 text-center text-slate-500">
              Version {DeviceInfo.getVersion()}, build{' '}
              {DeviceInfo.getBuildNumber()}
            </Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  )
}
