import { Stack } from 'expo-router'
import './global.css'
import { useState, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from '@/utils/trpc'
import superjson from 'superjson'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SettingsProvider, useSettings } from '@/utils/settings'
import { View, useColorScheme } from 'react-native'
import { themes } from '../utils/themes'
import { cssInterop } from 'nativewind'

import { FontAwesome, FontAwesome5, FontAwesome6 } from '@expo/vector-icons'

cssInterop(FontAwesome, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: true,
    },
  },
})
cssInterop(FontAwesome6, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      color: true,
    },
  },
})
cssInterop(FontAwesome5, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      color: true,
    },
  },
})

export function App() {
  const [queryClient] = useState(() => new QueryClient())
  const { settings } = useSettings()

  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [
          httpBatchLink({
            url: `${settings.baseUrl}api/trpc`,
            transformer: superjson,
          }),
        ],
      }),
    [settings],
  )

  return (
    <KeyboardProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </trpc.Provider>
    </KeyboardProvider>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light'

  return (
    <SettingsProvider>
      <View style={themes[colorScheme]} className="w-full h-full">
        <App />
      </View>
    </SettingsProvider>
  )
}
