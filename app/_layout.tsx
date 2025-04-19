import { Stack } from 'expo-router'
import './global.css'
import { useState, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from '@/utils/trpc'
import superjson from 'superjson'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SettingsProvider, useSettings} from '@/utils/settings'


export function App() {
  const [queryClient] = useState(() => new QueryClient())
  const { settings } = useSettings();  

  const trpcClient = useMemo(() => 
      trpc.createClient({
      links: [
        httpBatchLink({
          url: `${settings.baseUrl}api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
    [settings]
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
  return (
    <SettingsProvider>
      <App />
    </SettingsProvider>
  );
}