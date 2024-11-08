import { Stack } from 'expo-router'
import './global.css'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from '@/utils/trpc'
import superjson from 'superjson'
import { KeyboardProvider } from 'react-native-keyboard-controller'

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'https://spliit.app/api/trpc',
          transformer: superjson,
        }),
      ],
    })
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
