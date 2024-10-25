import { createTRPCReact } from '@trpc/react-query'
import { type AppRouter } from 'spliit-api'

export const trpc = createTRPCReact<AppRouter>()
