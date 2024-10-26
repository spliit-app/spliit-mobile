import { createTRPCReact } from '@trpc/react-query'
import { AppRouterOutput, type AppRouter } from 'spliit-api'

export const trpc = createTRPCReact<AppRouter>()

export type Expense =
  AppRouterOutput['groups']['expenses']['list']['expenses'][number]
