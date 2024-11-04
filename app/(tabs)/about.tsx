import { BRAND_COLOR } from '@/utils/colors'
import { FontAwesome, FontAwesome5, FontAwesome6 } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import {
  Button,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import DeviceInfo from 'react-native-device-info'

export default function AboutScreen() {
  const router = useRouter()

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              title="Close"
              color={BRAND_COLOR}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <SafeAreaProvider>
        <SafeAreaView edges={['top']} className="flex-1 bg-white min-h-full">
          <View className="p-4 min-h-full">
            <Text className="text-lg">
              Spliit is an Open Source project created by{' '}
              <Text className="font-semibold">Sebastien Castiel</Text>, with
              help of many contributors on GitHub.
            </Text>
            <View className="flex-row mt-6 justify-center gap-4">
              <Pressable
                className="bg-emerald-600 py-2 px-3 rounded-lg flex-row items-center gap-3"
                onPress={() =>
                  Linking.openURL('https://spliit.app/?ref=mobile-app')
                }
              >
                <FontAwesome5
                  name="external-link-alt"
                  size={14}
                  color="white"
                />
                <Text className="text-white text-lg font-semibold">
                  Visit our website
                </Text>
              </Pressable>
              <Pressable
                className="bg-slate-100 py-2 px-3 rounded-lg flex-row items-center gap-3"
                onPress={() => Linking.openURL('https://github.com/spliit-app')}
              >
                <FontAwesome6 name="github" size={16} />
                <Text className="text-lg text-slate-700 font-semibold">
                  View on GitHub
                </Text>
              </Pressable>
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
