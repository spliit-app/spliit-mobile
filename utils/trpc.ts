import { createTRPCReact } from '@trpc/react-query'
import { AppRouterOutput, type AppRouter } from 'spliit-api'

export const trpc = createTRPCReact<AppRouter>()

export type Expense =
  AppRouterOutput['groups']['expenses']['list']['expenses'][number]
export type ExpenseDetails =
  AppRouterOutput['groups']['expenses']['get']['expense']
export type Group = NonNullable<AppRouterOutput['groups']['get']['group']>
export type GroupParticipant = Group['participants'][number]
export type GroupDetails = AppRouterOutput['groups']['getDetails']['group']
export type Category =
  AppRouterOutput['categories']['list']['categories'][number]
